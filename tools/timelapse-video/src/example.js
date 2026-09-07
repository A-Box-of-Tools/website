/**
 * The clip behind the "Try an example" button.
 *
 * Twenty seconds, where the other video tools get six. Speeding a long
 * clip up is the whole job here, and ten times six seconds is over before it
 * has shown anything. Smaller in the frame to pay for the extra length.
 *
 * Encoded here, on the press, by shared/js/example-video.js - which is also
 * where the reason nothing is fetched is written down.
 */

import { exampleVideoFile } from './shared/example-video.js';

export function makeExample() {
  return exampleVideoFile('example.mp4', { width: 640, height: 360, fps: 25, seconds: 20 });
}
