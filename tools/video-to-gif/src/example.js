/**
 * The clip behind the "Try an example" button.
 *
 * 960 by 540, where the cropper's is 720p. This tool's whole subject is the
 * trade between size and quality: a GIF pays for every pixel of every frame,
 * and its own size readout is the thing worth watching. Starting from a 720p
 * source would push every sensible answer to "make it much smaller", which
 * hides the trade rather than showing it.
 *
 * See shared/js/example-video.js for the clip itself.
 */

import { exampleVideoFile } from './shared/example-video.js';

export function makeExample() {
  return exampleVideoFile('example.mp4', { width: 960, height: 540, seconds: 6 });
}
