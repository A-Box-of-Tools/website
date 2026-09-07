/**
 * The clip behind the "Try an example" button.
 *
 * A clip with a soundtrack. The line at the top of this page is "last
 * frame first, sound and all", and half of that cannot be demonstrated on a
 * silent file.
 *
 * Encoded here, on the press, by shared/js/example-video-sound.js - which is
 * also where the reason nothing on this site is fetched is written down.
 */

import { exampleVideoWithSound } from './shared/example-video-sound.js';

export function makeExample() {
  return exampleVideoWithSound('example.mp4', { width: 854, height: 480, seconds: 8 });
}
