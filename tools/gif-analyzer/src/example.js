/**
 * The animation behind the "Try an example" button.
 *
 * Ten frames of the drawn landscape, quantised to 64 colours and LZW-coded by
 * shared/js/example-gif.js - a real compressed GIF, because this tool's
 * subject is where a GIF's bytes went, and a file whose compression had been
 * defeated to make it easy to write would answer that question wrongly on the
 * one page built to answer it.
 */

import { exampleGifFile } from './shared/example-gif.js';

export function makeExample() {
  return exampleGifFile('example.gif', { width: 400, height: 300, frames: 10 });
}
