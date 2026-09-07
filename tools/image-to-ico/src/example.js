/**
 * The picture behind the "Try an example" button.
 *
 * The flat mark, square and at 512, which is what an icon actually starts life
 * as. A photograph would be the wrong input twice over: nothing legible
 * survives being drawn at sixteen pixels, and an icon is square, so a landscape
 * would spend the whole preview being cropped.
 */

import { markCanvas } from './shared/example-mark.js';
import { canvasFile } from './shared/example-photo.js';

export function makeExample() {
  return canvasFile(markCanvas(512), 'example-mark.png', 'image/png');
}
