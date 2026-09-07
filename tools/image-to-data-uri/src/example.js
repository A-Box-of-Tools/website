/**
 * The picture behind the "Try an example" button.
 *
 * The flat mark rather than the photograph, and small, because that is the
 * only kind of image a data URI is worth writing: encoding grows a file by a
 * third, and a 600 KB photograph becomes 800 KB of text that no stylesheet
 * should ever carry. Sixty-four pixels of PNG lands around 1 KB, which is the
 * case somebody actually has.
 */

import { markCanvas } from './shared/example-mark.js';
import { canvasFile } from './shared/example-photo.js';

export function makeExample() {
  return canvasFile(markCanvas(64), 'example-icon.png', 'image/png');
}
