/**
 * The clip behind the "Try an example" button.
 *
 * A clip with a soundtrack: this tool's whole job is pulling the sound out,
 * and handed a silent one it would correctly report there is nothing there -
 * which demonstrates the tool by defeating it.
 *
 * Smaller in the frame than the other video examples, at 640x360. Nothing here
 * ever decodes the picture, so its size buys the demonstration nothing and
 * only costs the wait while it is encoded. The sound is the subject.
 */

import { exampleVideoWithSound } from './shared/example-video-sound.js';

export function makeExample() {
  return exampleVideoWithSound('example.mp4', { width: 640, height: 360, seconds: 8 });
}
