/**
 * The photograph behind the "Try an example" button.
 *
 * A page on a desk, seen at an angle and lit unevenly from one side - which is
 * precisely the input this tool exists to undo, and precisely what a flat scan
 * would fail to demonstrate. The corners it has to find are put there
 * deliberately by shared/js/example-document.js, so what the detector finds
 * can be judged against what was actually drawn.
 */

import { photographedPage } from './shared/example-document.js';
import { canvasFile } from './shared/example-photo.js';

export function makeExample() {
  const { canvas } = photographedPage(1400, 1050);
  return canvasFile(canvas, 'example-photo.jpg', 'image/jpeg', 0.9);
}
