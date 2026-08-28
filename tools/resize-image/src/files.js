/**
 * Names, sizes and shapes, as words a person would use.
 *
 * Everything here that says something takes `t`, the caller's `phrase`. The
 * words cannot live in this file: src/ is copied byte for byte into every
 * language, so a sentence written here is English at fourteen addresses. See
 * shared/js/phrases.js.
 */

import { FORMATS } from './codecs.js';

/** File sizes. Nothing here is read against a limit, so ordinary rounding. */
export function bytes(n, t) {
  if (n < 1024) return t('size.bytes', { n });
  if (n < 1024 * 1024) return t('size.kb', { n: (n / 1024).toFixed(n < 10240 ? 1 : 0) });
  return t('size.mb', { n: (n / (1024 * 1024)).toFixed(2) });
}

/** "4032 × 3024", with a real multiplication sign. */
export function dimensions(width, height) {
  return `${width} × ${height}`;
}

/**
 * What the finished file should be called.
 *
 * The new size goes in the name rather than a word like "-resized", because a
 * downloads folder with four copies of the same photograph in it is the normal
 * outcome of using this tool and "logo-1024x1024.png" is the only one of those
 * names you can tell apart at a glance.
 *
 * The original extension is dropped rather than kept alongside the new one:
 * "holiday.jpg-1280x720.webp" is how a file ends up unopenable on a phone.
 */
export function outName(name, mime, width, height) {
  const ext = FORMATS[mime]?.ext ?? 'jpg';
  const stem = name.replace(/\.[^.]+$/, '') || 'image';
  return `${stem}-${width}x${height}.${ext}`;
}

/** "73% smaller", or "3% larger" when the new file went the wrong way. */
export function change(before, after, t) {
  if (before === 0) return '';
  const delta = Math.round(((before - after) / before) * 100);
  if (delta === 0) return t('change.same');
  return delta > 0
    ? t('change.smaller', { percent: delta })
    : t('change.larger', { percent: -delta });
}

/** "1 image" / "4 images", said the same way everywhere on the page. */
export const countOf = (n, t) => t(n === 1 ? 'count.one' : 'count.many', { n });

/**
 * The percentage a plan works out to, for the row under the preview.
 *
 * Rounded to whole percent above 10 and to one decimal below, because "0"
 * beside a thumbnail that is clearly still there reads as a bug, and 0.4% is a
 * real answer when somebody drops a 12000px scan and asks for a 48px icon.
 *
 * The sign is not here. Turkish writes %75, not 75%, so which side it goes on
 * is the sentence's business and the sentence is in the markup.
 */
export function scaleText(scale) {
  const percent = scale * 100;
  if (percent >= 10) return String(Math.round(percent));
  return percent.toFixed(1);
}

/**
 * One clause saying what is about to happen, in the order it happens.
 *
 * This is the line that stops the tool being four controls and a hope. It is
 * built from the same plan the encoder is given, so it cannot describe
 * something other than what runs.
 *
 * It nests rather than joining a list with a comma. English writes "cropped to
 * A, then resized to B, padded out, written as WebP"; which mark separates two
 * of those, whether "then" is a word at all, and what order they come in are
 * all the translator's to decide, and none of them can be decided here. So
 * each layer is a whole phrase that takes the one under it: `plan.written`
 * wraps `plan.padded`, which wraps whatever happened to the pixels.
 *
 * No full stop. The caller either ends it (`plan.only`) or carries on past it
 * (`summary.plan.one`), and a sentence that has to have its terminator cut off
 * with a regular expression is a sentence that only works in the languages
 * that end with a full stop.
 */
export function describePlan(size, crop, result, mime, t) {
  const cropped = crop.width !== size.width || crop.height !== size.height;
  const resized = result.canvas.width !== crop.width
    || result.canvas.height !== crop.height;
  const to = dimensions(result.canvas.width, result.canvas.height);

  let what;
  if (cropped && resized) {
    what = t('plan.cropresize', { crop: dimensions(crop.width, crop.height), size: to });
  } else if (cropped) {
    what = t('plan.crop', { crop: dimensions(crop.width, crop.height) });
  } else if (resized) {
    what = t('plan.resize', { size: to });
  } else {
    what = t('plan.keep', { size: to });
  }

  if (result.padded) what = t('plan.padded', { what });
  if (mime) what = t('plan.written', { what, format: FORMATS[mime]?.label ?? mime });

  return what;
}
