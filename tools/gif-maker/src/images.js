/**
 * The GIF maker's image list: shared/js/image-list.js, with each picture
 * held for a number of seconds, and the rules about how long that can be.
 */

import { loadImages as loadList } from './shared/image-list.js';

export { decodeFull, moveItem, releaseItem, sortItems } from './shared/image-list.js';

/** The longer side of a thumbnail in the list, in pixels. */
const THUMB_MAX = 200;

/**
 * How long a newly added image is held, in seconds. Half a second is about
 * where a slideshow of photographs stops feeling like a flicker, and it is what
 * most people are about to type anyway.
 */
export const DEFAULT_DELAY = 0.5;

/**
 * The shortest and longest a frame may be held.
 *
 * The floor is not arbitrary. A GIF stores its delay in hundredths of a second,
 * and browsers have clamped anything under two of them to a tenth of a second
 * since the 1990s - a rule that outlived the spinning-globe animations it was
 * written for. Offering 0.01s would be offering a number that silently becomes
 * 0.1s in every browser there is.
 */
export const MIN_DELAY = 0.02;
export const MAX_DELAY = 60;

/**
 * @param {FileList|File[]} files
 * @param {number} delay  seconds each new image is held
 * @returns {Promise<{items: object[], skipped: string[]}>}
 */
export function loadImages(files, delay) {
  return loadList(files, { thumbMax: THUMB_MAX, fields: () => ({ delay: clampDelay(delay) }) });
}

/** A delay in seconds, rounded to the hundredths the format actually stores. */
export function clampDelay(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value)) return DEFAULT_DELAY;
  return Math.min(MAX_DELAY, Math.max(MIN_DELAY, Math.round(value * 100) / 100));
}
