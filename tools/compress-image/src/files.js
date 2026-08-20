/** Names, sizes and the target, as words a person would use. */

import { FORMATS } from './codecs.js';

/** Sizes on this page are read against a target, so they are never rounded up
 *  past it: 511.6 KB shown as "512 KB" beside a 512 KB target reads as a miss. */
export function bytes(n) {
  if (n < 1024) return `${n} bytes`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
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

/** "73% smaller", or "3% larger" when a re-encode went the wrong way. */
export function change(before, after) {
  if (before === 0) return '';
  const delta = Math.round(((before - after) / before) * 100);
  if (delta === 0) return 'about the same size';
  return delta > 0 ? `${delta}% smaller` : `${-delta}% larger`;
}

/**
 * The SSIM figure as a sentence.
 *
 * The percentage is what people read, and the wording in front of it is there
 * to stop a number being taken for more than it is: 0.97 is a good result, not
 * "97% of the picture survived".
 */
export function matchText(ssim) {
  const percent = (ssim * 100).toFixed(1);
  if (ssim >= 0.995) return `${percent}% - indistinguishable`;
  if (ssim >= 0.985) return `${percent}% - no visible difference`;
  if (ssim >= 0.96) return `${percent}% - very close`;
  if (ssim >= 0.92) return `${percent}% - slight softening`;
  return `${percent}% - visibly compressed`;
}

/** PSNR, or the honest answer when the two pictures are identical. */
export function psnrText(psnr) {
  return Number.isFinite(psnr) ? `${psnr.toFixed(1)} dB` : 'identical';
}
