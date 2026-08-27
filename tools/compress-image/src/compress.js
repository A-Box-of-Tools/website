/**
 * Hitting a size target with the least loss the target allows.
 *
 * The naive version of this tool is a quality slider: you move it, you look at
 * the number, you move it again. That works, but it answers the wrong
 * question. People do not want "quality 62". They want "under 500 KB, because
 * that is what the form accepts", and they want whatever is left of the
 * picture after that to be as good as it can be.
 *
 * So the search runs the other way round. The target is fixed, and the two
 * things that can be spent to reach it - quality and resolution - are spent in
 * a deliberate order:
 *
 *   1. NOTHING, IF NOTHING IS NEEDED. A file already under the target is
 *      handed back untouched. Re-encoding it would throw away detail to reach
 *      a size it already had.
 *   2. QUALITY FIRST, DOWN TO A FLOOR. Full resolution is kept and the quality
 *      dial is searched for the highest setting that fits. Above the floor
 *      this is nearly invisible: a JPEG at 0.75 is hard to tell from the same
 *      picture at 0.95 without flicking between the two.
 *   3. RESOLUTION SECOND. Below that floor, quality stops being cheap - the
 *      blocking and the smeared edges are what people mean by "compressed".
 *      Fewer good pixels beat more ruined ones, so the picture is made smaller
 *      and the quality dial goes back up.
 *   4. THEN THE LEFTOVER IS SPENT. Having found a size that fits, the search
 *      pushes quality back up until the budget is used. A result at 60% of the
 *      target is not a win; it is detail thrown away for nothing.
 *
 * Every step is one encode, every encode is the browser's own codec running on
 * the visitor's own machine, and the sizes on the page are measured rather
 * than predicted. Nothing here estimates, and nothing here uploads.
 */

import { encode, FORMATS, JPEG, PNG, WEBP } from './codecs.js';

/** The best quality worth asking for. Above this the file grows and the eye
 *  does not notice; 1.0 in particular is near-lossless in size and pointless
 *  for anything that is trying to be small. */
export const QUALITY_CEILING = 0.94;

/** Where re-encoding stops being cheap. Below roughly this, JPEG and WebP
 *  artefacts become visible on flat areas and around text, so the search
 *  spends resolution instead of going further down. */
export const QUALITY_FLOOR = 0.62;

/** Held steady while the size is searched: high enough to look clean, low
 *  enough that the search is not fighting two dials at once. */
export const SEARCH_QUALITY = 0.8;

/** Only reached when the target is very small next to the picture. Below this
 *  the result is a thumbnail, and saying so is more use than producing it. */
export const MIN_SCALE = 0.1;

/** Used only when resizing is refused and the target still has not been met.
 *  It is below the floor on purpose: the visitor asked for a size. */
export const QUALITY_HARD_MIN = 0.2;

/** Enough for every search below, and a stop if one ever misbehaves. */
const MAX_ENCODES = 16;

/**
 * @typedef {object} Attempt
 * @property {Blob} blob
 * @property {number} quality the dial this was encoded at (1 for PNG)
 * @property {number} scale fraction of the original width and height
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {object} Result
 * @property {Blob} blob what to save
 * @property {number} width
 * @property {number} height
 * @property {number} quality
 * @property {number} scale
 * @property {boolean} fitted true if the target was met
 * @property {boolean} resized true if the picture was made smaller
 * @property {number} encodes how many times the picture was encoded
 * @property {string} mime
 */

/**
 * Fit one decoded picture into a byte budget.
 *
 * @param {{bitmap: ImageBitmap|HTMLImageElement, width: number, height: number}} source
 * @param {object} options
 * @param {number} options.targetBytes the ceiling to come in under
 * @param {string} options.mime the format to write
 * @param {boolean} options.allowResize whether resolution may be spent
 * @param {(key: string) => void} [options.onStep] progress, for the UI. It is
 *   handed the *key* of a phrase and not a sentence: this module is imported by
 *   the tests off the disk and so cannot import `./shared/phrases.js`, and main
 *   .js can reach the page it would have needed. The wording is in body.html.
 * @returns {Promise<Result>}
 */
export async function fitToTarget(source, { targetBytes, mime, allowResize, onStep }) {
  const lossy = FORMATS[mime]?.lossy ?? true;
  let encodes = 0;

  /** @type {Attempt|null} the largest attempt that came in under the target */
  let best = null;
  /** @type {Attempt|null} the smallest attempt seen, in case nothing fits */
  let smallest = null;

  /** One encode, at a scale and a quality. Everything goes through here, so
   *  the count reported on the page is the true number of encodes. */
  const attempt = async (scale, quality) => {
    // A phrase key rather than a sentence, for the reason above: main.js puts
    // every failure through phrase(), which hands back anything it does not
    // recognise - so a real error from the encoder still arrives intact.
    if (encodes >= MAX_ENCODES) throw new Error('error.attempts');
    encodes += 1;
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    const blob = await encode(source.bitmap, {
      width, height, mime, quality: lossy ? quality : undefined,
    });

    const made = { blob, quality: lossy ? quality : 1, scale, width, height };

    // The best fitting attempt is simply the largest one: it is the one that
    // spent the most of the budget, and spending the budget is the point.
    if (blob.size <= targetBytes && (!best || blob.size > best.blob.size)) best = made;
    if (!smallest || blob.size < smallest.blob.size) smallest = made;

    return made;
  };

  const fits = (a) => a.blob.size <= targetBytes;

  // --- 1. Full size, best quality. If that fits there is nothing to search.
  onStep?.('step.full');
  const top = await attempt(1, QUALITY_CEILING);
  if (fits(top)) return finish(top, true);

  // A PNG has no quality dial - it is lossless, which is the whole reason
  // somebody chooses it - so resolution is the only thing that can be spent.
  if (!lossy) {
    if (!allowResize) return finish(smallest, false);
    onStep?.('step.scale');
    await searchScale(attempt, fits, targetBytes, top.blob.size, undefined);
    return finish(best ?? smallest, Boolean(best));
  }

  // --- 2. Quality alone, down to the floor, at full resolution.
  onStep?.('step.quality');
  const atFloor = await attempt(1, QUALITY_FLOOR);

  if (fits(atFloor)) {
    // A fit exists between the floor and the ceiling. Six halvings narrow it
    // to about half a percent of the dial, which is finer than the encoder
    // itself distinguishes.
    await bisectQuality(attempt, fits, 1, QUALITY_FLOOR, QUALITY_CEILING, 6);
    return finish(best, true);
  }

  // --- 3. The floor was not enough.
  if (!allowResize) {
    // Resizing was refused, so the only currency left is quality below the
    // floor. The visitor asked for a size, and quietly missing it would be
    // worse than meeting it and saying what it cost - which the page does.
    onStep?.('step.belowFloor');
    const bottom = await attempt(1, QUALITY_HARD_MIN);
    if (!fits(bottom)) return finish(smallest, false);
    await bisectQuality(attempt, fits, 1, QUALITY_HARD_MIN, QUALITY_FLOOR, 5);
    return finish(best, true);
  }

  // Fewer pixels encoded well, rather than every pixel encoded badly.
  onStep?.('step.resolution');
  const reference = await attempt(1, SEARCH_QUALITY);
  await searchScale(attempt, fits, targetBytes, reference.blob.size, SEARCH_QUALITY);

  if (!best) return finish(smallest, false);

  // --- 4. Spend what is left of the budget on quality at that size.
  onStep?.('step.budget');
  await bisectQuality(attempt, fits, best.scale, SEARCH_QUALITY, QUALITY_CEILING, 3);

  return finish(best, true);

  function finish(chosen, fitted) {
    return {
      blob: chosen.blob,
      width: chosen.width,
      height: chosen.height,
      quality: chosen.quality,
      scale: chosen.scale,
      fitted,
      resized: chosen.scale < 1,
      encodes,
      mime,
    };
  }
}

/**
 * Narrow in on the highest quality that still fits, at a fixed size.
 *
 * The caller has already established that `low` fits and is holding the best
 * attempt, so nothing is returned: every encode records itself.
 */
async function bisectQuality(attempt, fits, scale, low, high, rounds) {
  for (let i = 0; i < rounds; i += 1) {
    const mid = (low + high) / 2;
    if (fits(await attempt(scale, mid))) low = mid;
    else high = mid;
  }
}

/**
 * Find the largest fraction of the original size that fits, at a fixed quality.
 *
 * Encoded size tracks pixel count closely enough to guess from: an image half
 * as wide and half as tall has a quarter of the pixels and lands near a
 * quarter of the bytes. So the opening guess is the square root of the ratio,
 * which usually lands within a few percent, and the halvings after it only
 * tidy up. Bisecting blindly from [0.1, 1] would take about twice as many
 * encodes to reach the same answer, and every encode is a second of somebody's
 * afternoon.
 *
 * The guess is shaded slightly low on purpose. Overshooting spends an encode
 * on a result that gets thrown away; undershooting leaves one that can still
 * be improved by the rounds that follow.
 */
async function searchScale(attempt, fits, targetBytes, referenceBytes, quality) {
  const guess = clamp(Math.sqrt(targetBytes / referenceBytes) * 0.95, MIN_SCALE, 1);

  let low = MIN_SCALE;
  let high = 1;

  if (fits(await attempt(guess, quality))) low = guess;
  else high = guess;

  for (let i = 0; i < 4; i += 1) {
    const mid = (low + high) / 2;
    if (fits(await attempt(mid, quality))) low = mid;
    else high = mid;
  }
}

function clamp(n, low, high) {
  return Math.min(high, Math.max(low, n));
}

/**
 * Which format to write when the visitor has not insisted on one.
 *
 * Keeping the format is the default answer, because a file that arrives as a
 * .jpg and leaves as a .jpg is what people expect, and a surprise .webp is a
 * support question for whoever they send it to.
 *
 * @param {string} sourceMime
 * @param {Set<string>} available what this browser can actually write
 * @returns {string}
 */
export function keepFormat(sourceMime, available) {
  if (available.has(sourceMime) && FORMATS[sourceMime]) return sourceMime;
  // GIF, BMP, AVIF and anything else this browser reads but will not write:
  // one that might be carrying transparency keeps it by becoming a PNG, and
  // everything else becomes a JPEG.
  return sourceMime === 'image/gif' ? PNG : JPEG;
}

/**
 * The one alternative worth trying when keeping the format went badly.
 *
 * WebP holds detail at roughly a third fewer bytes than JPEG, so where a
 * target is tight enough that keeping the original format costs resolution or
 * drops through the quality floor, switching formats buys back more than the
 * switch costs. That is the only case where "auto" changes the extension, and
 * when it does, the page says so on the row.
 *
 * @returns {string|null} null when there is nothing better to try
 */
export function alternativeFormat(mime, available, hasAlpha) {
  if (mime !== WEBP && available.has(WEBP)) return WEBP;
  if (mime === PNG && !hasAlpha) return JPEG;
  return null;
}
