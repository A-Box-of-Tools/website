/**
 * The file behind the "Try an example" button: a clip with sound.
 *
 * Built in the page rather than fetched, for the reason at the top of
 * shared/js/example-photo.js: the page's own policy forbids a fetch. It is
 * the clip every video tool demonstrates on, with its sound, because the
 * sound is the half of the budget this page copies through untouched and a
 * silent example would leave that path unexercised. Eight seconds at 960 by
 * 540 comes out at a couple of megabytes, which is enough for "half the
 * size" and "a quarter" to mean something and for the example to finish in
 * the time it takes to read the result.
 */

import { exampleVideoWithSound } from './shared/example-video-sound.js';

/**
 * @param {string} name the filename the picker will show
 * @returns {Promise<File>}
 */
export function makeExample(name = 'clip.mp4') {
  return exampleVideoWithSound(name, { seconds: 8 });
}
