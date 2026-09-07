/**
 * The clip behind the "Try an example" button.
 *
 * Six seconds at 960 by 540 - long enough that the frame rate and the
 * palette settings visibly cost something, which is the trade this tool is
 * for.
 *
 * Encoded here, on the press, by shared/js/example-video.js - which is also
 * where the reason nothing is fetched is written down.
 */

import { exampleVideoFile } from './shared/example-video.js';

export function makeExample() {
  return exampleVideoFile('example.mp4', { width: 960, height: 540, seconds: 6 });
}
