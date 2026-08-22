/** Names, sizes and shapes, as words a person would use. */

import { FORMATS } from './codecs.js';

/** File sizes. Nothing here is read against a limit, so ordinary rounding. */
export function bytes(n) {
  if (n < 1024) return `${n} bytes`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
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
export function change(before, after) {
  if (before === 0) return '';
  const delta = Math.round(((before - after) / before) * 100);
  if (delta === 0) return 'about the same size';
  return delta > 0 ? `${delta}% smaller` : `${-delta}% larger`;
}

/** "1 image" / "4 images", said the same way everywhere on the page. */
export const countOf = (n) => `${n} image${n === 1 ? '' : 's'}`;

/**
 * The percentage a plan works out to, for the row under the preview.
 *
 * Rounded to whole percent above 10 and to one decimal below, because "0%"
 * beside a thumbnail that is clearly still there reads as a bug, and 0.4% is a
 * real answer when somebody drops a 12000px scan and asks for a 48px icon.
 */
export function scaleText(scale) {
  const percent = scale * 100;
  if (percent >= 10) return `${Math.round(percent)}%`;
  return `${percent.toFixed(1)}%`;
}

/**
 * One sentence saying what is about to happen, in the order it happens.
 *
 * This is the line that stops the tool being four controls and a hope. It is
 * built from the same plan the encoder is given, so it cannot describe
 * something other than what runs.
 */
export function describePlan(size, crop, result, mime) {
  const parts = [];
  const cropped = crop.width !== size.width || crop.height !== size.height;

  if (cropped) {
    parts.push(`cropped to ${dimensions(crop.width, crop.height)}`);
  }

  if (result.canvas.width !== crop.width || result.canvas.height !== crop.height) {
    parts.push(`${cropped ? 'then ' : ''}resized to ${dimensions(result.canvas.width, result.canvas.height)}`);
  } else if (!cropped) {
    parts.push(`kept at ${dimensions(result.canvas.width, result.canvas.height)}`);
  }

  if (result.padded) parts.push('padded out to the exact frame you asked for');
  if (mime) parts.push(`written as ${FORMATS[mime]?.label ?? mime}`);

  return `${parts.join(', ')}.`;
}
