/**
 * The slideshow maker's image list: shared/js/image-list.js, with each
 * picture held for a number of frames or of seconds.
 */

import { loadImages as loadList } from './shared/image-list.js';

export { decodeFull, moveItem, releaseItem, sortItems } from './shared/image-list.js';

/** The longer side of a thumbnail in the list, in pixels. */
const THUMB_MAX = 240;

/**
 * Each item carries both a frame count and a seconds value. Which one is used
 * depends on the unit the user picked; keeping both means switching units back
 * and forth never loses what was typed.
 *
 * @param {FileList|File[]} files
 * @param {{frames: number, seconds: number}} defaults  how long each new image is held
 * @returns {Promise<{items: object[], skipped: string[]}>}
 */
export function loadImages(files, defaults) {
  return loadList(files, {
    thumbMax: THUMB_MAX,
    fields: () => ({ frames: defaults.frames, seconds: defaults.seconds }),
  });
}
