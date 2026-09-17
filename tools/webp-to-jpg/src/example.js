/**
 * The two pictures behind the "Try an example" button.
 *
 * They are drawn rather than fetched - see shared/js/example-photo.js for why
 * that is not a choice - and there are two of them because the interesting
 * half of this tool only appears when a file has transparency in it. A
 * photograph alone would demonstrate a quality slider; the mark beside it is
 * the one that makes the background colour appear, shows the row that says so,
 * and ends up with a note on its result explaining what went behind it.
 *
 * The photograph is written at quality 0.85, which is roughly what a WebP off
 * a website has already been through, so the JPEG this tool writes from it is
 * a second generation - which is what a real one would be, and what the page
 * says about re-encoding is only honest if the example is the same.
 *
 * The mark is written at quality 1, where a canvas switches to WebP's lossless
 * coding. That makes it the other kind of WebP a person actually has: a flat
 * graphic saved from a design tool, with an alpha channel, which is exactly
 * the file that comes out wrong on a converter that does not ask about the
 * background.
 */

import { photoFile, canvasFile } from './shared/example-photo.js';
import { markCanvas } from './shared/example-mark.js';

export function makeExample() {
  return Promise.all([
    photoFile('example-photo.webp', {
      width: 1600,
      height: 1200,
      seed: 20260917,
      type: 'image/webp',
      quality: 0.85,
    }),
    canvasFile(markCanvas(512), 'example-logo.webp', 'image/webp', 1),
  ]);
}
