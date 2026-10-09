/** One settings plan owns every image in a run, including work after a decode. */

import { decode, release, FORMATS, JPEG } from './codecs.js';
import { fitToTarget, keepFormat, alternativeFormat, QUALITY_FLOOR } from './compress.js';
import { compare, hasTransparency } from './measure.js';
import { outName } from './files.js';

/** Copy the capability set too: its asynchronous probe may finish during a run. */
export function captureSettings({ targetBytes, format, allowResize }, writable) {
  return Object.freeze({
    targetBytes, format, allowResize,
    writable: Object.freeze([...writable]),
  });
}

/**
 * Compress one image.
 *
 * The order of the checks here is the tool's whole argument about quality, so
 * it is worth reading in one go:
 *
 *   - A file already under the target is returned as it arrived. Not re-saved,
 *     not re-encoded, not "optimised": handed back byte for byte, because the
 *     best possible version of a file that already fits is the file.
 *   - Otherwise the search in compress.js finds the cheapest way to fit.
 *   - On "auto", if fitting cost real quality - a resize, or a quality below
 *     the floor - the same search runs again in WebP and the two results are
 *     compared by measurement, not by rule of thumb. The better-looking one
 *     wins, and if the original format wins a tie it keeps the tie.
 *   - Whatever comes out is then measured against the original, so the row can
 *     say what the compression cost rather than promising it was small.
 */
export async function compressOne(item, settings, onStep, {
  decode: read = decode, fitToTarget: fit = fitToTarget, score: measure = score,
  hasTransparency: transparent = hasTransparency, release: dispose = release,
} = {}) {
  const { targetBytes: target, format: choice, allowResize } = settings;
  const writable = new Set(settings.writable);
  const base = {
    item,
    name: item.file.name,
    before: item.file.size,
    size: item.size,
  };

  if (item.file.size <= target) {
    return {
      ...base,
      blob: item.file,
      after: item.file.size,
      mime: item.file.type || JPEG,
      untouched: true,
      fitted: true,
      width: item.size?.width ?? 0,
      height: item.size?.height ?? 0,
      outName: item.file.name,
    };
  }

  onStep('step.decoding');
  const source = await read(item.file);

  try {
    const alpha = transparent(source.bitmap, source);

    const firstMime = choice === 'auto' || choice === 'keep'
      ? keepFormat(item.file.type, writable)
      : choice;

    let winner = await fit(source, {
      targetBytes: target, mime: firstMime, allowResize, onStep,
    });
    let winnerScore = await measure(source, winner);
    // The winner's own count is the length of the search that produced it. The
    // row says how many times this picture was encoded in total, including a
    // search that was tried and thrown away, because that is the honest answer
    // to "what did this cost my laptop".
    let encodes = winner.encodes;

    // Only "auto" is allowed to change the extension, and only when keeping it
    // actually cost something. A tool that quietly hands back a .webp when a
    // .jpg would have been fine is not being clever, it is being surprising.
    const compromised = winner.resized || winner.quality < QUALITY_FLOOR + 0.001 || !winner.fitted;
    if (choice === 'auto' && compromised) {
      const other = alternativeFormat(firstMime, writable, alpha);
      if (other) {
        onStep('step.trying', { format: FORMATS[other].label });
        const rival = await fit(source, {
          targetBytes: target, mime: other, allowResize, onStep,
        });
        const rivalScore = await measure(source, rival);
        encodes += rival.encodes;
        if (isBetter(rival, rivalScore, winner, winnerScore)) {
          winner = rival;
          winnerScore = rivalScore;
        }
      }
    }

    return {
      ...base,
      blob: winner.blob,
      after: winner.blob.size,
      mime: winner.mime,
      quality: winner.quality,
      width: winner.width,
      height: winner.height,
      resized: winner.resized,
      fitted: winner.fitted,
      encodes,
      changedFormat: winner.mime !== firstMime,
      match: winnerScore,
      untouched: false,
      outName: outName(item.file.name, winner.mime),
    };
  } finally {
    dispose(source.bitmap);
  }
}

/** Decode a candidate and measure it against the original it came from. */
export async function score(source, candidate, {
  decode: read = decode, compare: measure = compare, release: dispose = release,
} = {}) {
  let decoded;
  try {
    decoded = await read(candidate.blob);
  } catch {
    return null;
  }
  try {
    return measure(source.bitmap, decoded.bitmap, source);
  } finally {
    dispose(decoded.bitmap);
  }
}

/**
 * Is the challenger the better result?
 *
 * Meeting the target comes first - a prettier file that missed the budget is
 * not a better answer to "make it fit". After that it is the measurement, with
 * a small margin: SSIM differences under a couple of thousandths are noise,
 * and on a tie the format the visitor's file arrived in keeps its place.
 */
function isBetter(challenger, challengerScore, holder, holderScore) {
  if (challenger.fitted !== holder.fitted) return challenger.fitted;
  if (!challengerScore || !holderScore) return false;
  return challengerScore.ssim > holderScore.ssim + 0.002;
}
