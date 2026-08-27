/**
 * Names, sizes and the target, as words a person would use.
 *
 * The words themselves are not here. This module is imported by the tests
 * straight off the disk, which is exactly the reason it cannot import
 * `./shared/phrases.js` - that path only exists inside a built tool - so
 * everything with a sentence in it hands back the *key* of a phrase and the
 * blanks to fill it with, and main.js, which can reach the page, resolves it.
 * The phrases themselves are in body.html, where a translator can reach them.
 *
 * @typedef {{ key: string, values?: Record<string, string|number> }} Saying
 */

import { FORMATS } from './codecs.js';

/** Sizes on this page are read against a target, so they are never rounded up
 *  past it: 511.6 KB shown as "512 KB" beside a 512 KB target reads as a miss.
 *  @returns {Saying} */
export function bytes(n) {
  if (n < 1024) return { key: 'size.bytes', values: { amount: n } };
  if (n < 1024 * 1024) {
    return { key: 'size.kb', values: { amount: (n / 1024).toFixed(n < 10240 ? 1 : 0) } };
  }
  return { key: 'size.mb', values: { amount: (n / (1024 * 1024)).toFixed(2) } };
}

/** KB and MB here mean 1024 and 1024*1024, which is what a file manager shows
 *  on every platform except macOS, and what people mean by "under 500 KB". */
export const UNITS = { KB: 1024, MB: 1024 * 1024 };

/**
 * Turn the number and unit in the form into a byte count.
 * @returns {number|null} null when the field does not hold a usable number
 */
export function targetBytes(value, unit) {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * (UNITS[unit] ?? UNITS.KB));
}

/** "4032 × 3024", with a real multiplication sign. */
export function dimensions(width, height) {
  return `${width} × ${height}`;
}

/**
 * What the compressed file should be called.
 *
 * The original extension is dropped rather than kept alongside the new one:
 * "holiday.jpg-compressed.webp" is how a file ends up unopenable on a phone.
 * The name says what happened so that the compressed copy cannot be mistaken
 * for the original in a downloads folder.
 */
export function outName(name, mime) {
  const ext = FORMATS[mime]?.ext ?? 'jpg';
  const stem = name.replace(/\.[^.]+$/, '') || 'image';
  return `${stem}-compressed.${ext}`;
}

/** "73% smaller", or "3% larger" when a re-encode went the wrong way.
 *  @returns {Saying|null} null when a file that was empty has nothing to say */
export function change(before, after) {
  if (before === 0) return null;
  const delta = Math.round(((before - after) / before) * 100);
  if (delta === 0) return { key: 'change.same' };
  return delta > 0
    ? { key: 'change.smaller', values: { percent: delta } }
    : { key: 'change.larger', values: { percent: -delta } };
}

/**
 * The SSIM figure as a sentence.
 *
 * The percentage is what people read, and the wording in front of it is there
 * to stop a number being taken for more than it is: 0.97 is a good result, not
 * "97% of the picture survived". Which wording is a decision this module makes;
 * what the wording says is not, so it hands back a key.
 *
 * @returns {Saying}
 */
export function matchText(ssim) {
  const values = { percent: (ssim * 100).toFixed(1) };
  if (ssim >= 0.995) return { key: 'match.identical', values };
  if (ssim >= 0.985) return { key: 'match.invisible', values };
  if (ssim >= 0.96) return { key: 'match.close', values };
  if (ssim >= 0.92) return { key: 'match.softened', values };
  return { key: 'match.visible', values };
}

/** PSNR, or the honest answer when the two pictures are identical.
 *  @returns {Saying} */
export function psnrText(psnr) {
  return Number.isFinite(psnr)
    ? { key: 'psnr.db', values: { db: psnr.toFixed(1) } }
    : { key: 'psnr.identical' };
}
