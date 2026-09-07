/**
 * The clip behind the "Try an example" button.
 *
 * Six seconds at 960 by 540. The bar along the foot and the marker that
 * steps once a second are what make a crop checkable: they say which part of
 * the frame survived and which second of the clip you are looking at.
 *
 * Encoded here, on the press, by shared/js/example-video.js - which is also
 * where the reason nothing is fetched is written down.
 */

import { exampleVideoFile } from './shared/example-video.js';

export function makeExample() {
  return exampleVideoFile('example.mp4', { width: 960, height: 540, seconds: 6 });
}
