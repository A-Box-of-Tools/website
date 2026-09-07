/**
 * The animation behind the "Try an example" button.
 *
 * Eight frames, where the analyser gets fourteen. What comes out of this tool
 * is one PNG per frame, so every extra frame is another row in the list and
 * another file in the zip - eight is enough to show the frames differ from one
 * another and few enough that the result stays readable.
 *
 * They visibly differ on purpose: the scene pans and the grain is redrawn on
 * each. Handed ten identical frames a splitter appears to have done nothing.
 */

import { exampleGifFile } from './shared/example-gif.js';

export function makeExample() {
  return exampleGifFile('example.gif', { width: 400, height: 300, frames: 8 });
}
