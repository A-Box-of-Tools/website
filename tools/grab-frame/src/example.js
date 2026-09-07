/**
 * The clip behind the "Try an example" button.
 *
 * Six seconds at 720p. Grabbing "the frame at 3.2 seconds" demonstrates
 * nothing against footage where every frame is the same picture, so every
 * frame here carries a bar that has moved and a marker that steps once a
 * second.
 *
 * Encoded here, on the press, by shared/js/example-video.js - which is also
 * where the reason nothing is fetched is written down.
 */

import { exampleVideoFile } from './shared/example-video.js';

export function makeExample() {
  return exampleVideoFile('example.mp4', { width: 1280, height: 720, seconds: 6 });
}
