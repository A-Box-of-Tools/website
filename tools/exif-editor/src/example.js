/**
 * The photograph behind the "Try an example" button.
 *
 * A JPEG with an EXIF block written into it by hand - camera, lens, exposure,
 * a date and a set of GPS coordinates - because this tool's subject is what a
 * photograph quietly says about the person who took it, and a picture with an
 * empty header says nothing at all.
 *
 * The coordinates are the Greenwich observatory, to the metre. Somewhere
 * recognisable, publicly a landmark, and nobody's home.
 */

import { photoCanvas, canvasFile } from './shared/example-photo.js';
import { withExif } from './shared/example-exif.js';

export async function makeExample() {
  const plain = await canvasFile(photoCanvas(1600, 1200), 'example.jpg');
  return withExif(plain, 'example.jpg');
}
