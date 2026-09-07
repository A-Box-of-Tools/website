/**
 * The picture behind the "Try an example" button.
 *
 * A statement rather than a landscape, because a redactor needs something with
 * information on it worth covering - names, an account column, amounts - and
 * nobody has ever wanted to black out a hillside. See
 * shared/js/example-statement.js for why those particular words.
 */

import { pageCanvas } from './shared/example-document.js';
import { canvasFile } from './shared/example-photo.js';

export function makeExample() {
  return canvasFile(pageCanvas(1000, 1414), 'example-statement.png', 'image/png');
}
