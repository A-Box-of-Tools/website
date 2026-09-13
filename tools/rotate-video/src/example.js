/**
 * The file behind the "Try an example" button: a clip with sound.
 *
 * Built in the page rather than fetched, for the reason at the top of
 * shared/js/example-photo.js: the page's own policy forbids a fetch. It is
 * the clip every video tool demonstrates on, with its sound, because the
 * sound is what a turn has to carry across unchanged and a silent example
 * would leave that unshown. It is landscape, which is what a clip filmed on
 * its side looks like to the file, so a quarter turn on it is exactly the
 * job the page is for.
 */

import { exampleVideoWithSound } from './shared/example-video-sound.js';

/**
 * @param {string} name the filename the picker will show
 * @returns {Promise<File>}
 */
export function makeExample(name = 'sideways.mp4') {
  return exampleVideoWithSound(name, { seconds: 6 });
}
