/**
 * The document behind the "Try an example" button.
 *
 * Three pages with a photograph on each, and that is the whole point: a
 * document of text alone is a few kilobytes and has essentially nothing in it
 * to squeeze, so an example without pictures would make this tool look like it
 * does nothing. Nearly every large PDF anybody actually wants smaller is large
 * because of its images, and this one is too.
 *
 * The photographs go in as JPEG and are handed to the writer uncompressed a
 * second time - /DCTDecode, the bytes as the encoder produced them - so the
 * downsampling and re-encoding this tool offers have something real to act on.
 */

import { examplePdfFile } from './shared/example-pdf.js';
import { photoCanvas } from './shared/example-photo.js';

const WIDTH = 1400;
const HEIGHT = 1000;

/** The canvas's JPEG bytes, which is what /DCTDecode wants. */
async function jpegBytes(seed) {
  const canvas = photoCanvas(WIDTH, HEIGHT, { seed });
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((made) => (made ? resolve(made) : reject(new Error('encode'))), 'image/jpeg', 0.95);
  });
  return new Uint8Array(await blob.arrayBuffer());
}

export async function makeExample() {
  const jpegs = await Promise.all([20260907, 481207, 90210].map(jpegBytes));
  return examplePdfFile('example.pdf', {
    pages: 3,
    jpegs,
    jpegSize: { width: WIDTH, height: HEIGHT },
  });
}
