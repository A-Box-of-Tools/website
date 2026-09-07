/**
 * The clip behind the "Try an example" button.
 *
 * A clip with a soundtrack, because the claim this tool makes is that
 * the sound stays with the picture across a cut - and a silent file cannot
 * show that either way.
 *
 * Encoded here, on the press, by shared/js/example-video-sound.js - which is
 * also where the reason nothing on this site is fetched is written down.
 */

import { exampleVideoWithSound } from './shared/example-video-sound.js';

export function makeExample() {
  return exampleVideoWithSound('example.mp4', { width: 960, height: 540, seconds: 8 });
}
