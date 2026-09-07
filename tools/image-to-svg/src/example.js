/**
 * The picture behind the "Try an example" button.
 *
 * The mark without its background plate, so what arrives is a shape on
 * transparency with one clean edge - which is the input this tool can actually
 * do something honest with. A photograph traced to vector is thousands of
 * paths and a worse file than the JPEG it came from, and offering one as the
 * example would be recommending the tool for the job it is worst at.
 */

import { markCanvas } from './shared/example-mark.js';
import { canvasFile } from './shared/example-photo.js';

export function makeExample() {
  return canvasFile(markCanvas(720, { plate: false }), 'example-mark.png', 'image/png');
}
