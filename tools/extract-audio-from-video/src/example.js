/**
 * The clip behind the "Try an example" button.
 *
 * A clip with a soundtrack. This tool's job is taking the sound out of a
 * video, so a silent example would have it correctly report that there is
 * nothing to take - which demonstrates the tool by defeating it.
 *
 * Encoded here, on the press, by shared/js/example-video-sound.js - which is
 * also where the reason nothing on this site is fetched is written down.
 */

import { exampleVideoWithSound } from './shared/example-video-sound.js';

export function makeExample() {
  return exampleVideoWithSound('example.mp4', { width: 854, height: 480, seconds: 8 });
}
