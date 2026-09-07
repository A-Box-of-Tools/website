/**
 * The animation behind the "Try an example" button.
 *
 * Fourteen frames, where the splitter gets eight. This tool's subject is where
 * a GIF's bytes went, and the answer is more interesting the more frames there
 * are to spend them on: a longer animation gives the frame table, the palette
 * report and the per-frame byte budget something to say.
 *
 * Genuinely LZW-coded by shared/js/example-gif.js, not the uncompressed-stream
 * trick, because a file whose compression had been defeated to make it easy to
 * write would answer this page's own question wrongly.
 */

import { exampleGifFile } from './shared/example-gif.js';

export function makeExample() {
  return exampleGifFile('example.gif', { width: 400, height: 300, frames: 14 });
}
