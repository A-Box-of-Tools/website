/**
 * The file behind the "Try an example" button: an animated GIF.
 *
 * Built in the page rather than fetched, for the reason at the top of
 * shared/js/example-photo.js: the page's own policy forbids a fetch. It is
 * the GIF the splitter and the analyser demonstrate on - the landscape
 * panned across two dozen frames at twelve hundredths each - which is long
 * enough for "a tenth of the size" to be visible in the result and short
 * enough to finish in the time it takes to read it.
 */

import { exampleGifFile } from './shared/example-gif.js';

/**
 * @param {string} name the filename the picker will show
 * @returns {Promise<File>}
 */
export async function makeExample(name = 'animation.gif') {
  return exampleGifFile(name, { frames: 24, delay: 8 });
}
