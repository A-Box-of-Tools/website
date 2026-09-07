/**
 * The animation behind the "Try an example" button.
 *
 * Ten frames that are visibly not the same picture - the scene pans, and the
 * grain is redrawn on each - because a splitter handed ten identical frames
 * appears to have done nothing at all. See shared/js/example-gif.js.
 */

import { exampleGifFile } from './shared/example-gif.js';

export function makeExample() {
  return exampleGifFile('example.gif', { width: 400, height: 300, frames: 10 });
}
