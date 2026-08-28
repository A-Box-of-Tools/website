/**
 * Turning a finished page into the bytes that go inside the document.
 *
 * Two ways out, and which one a page takes is decided by what was done to it
 * rather than by a setting:
 *
 *   1 bit    a black and white page, packed eight pixels to the byte and
 *            deflated. Exact, and very small - a page of text comes out at a few
 *            tens of kilobytes, against a megabyte or so as a JPEG - because a
 *            picture with two colours in it is genuinely a thirty-second of the
 *            data of a picture with sixteen million, and every general purpose
 *            image format spends its effort on the other case.
 *   JPEG     everything else, encoded by the browser's own encoder.
 *
 * The 1-bit path is the reason the black and white mode is worth having at all.
 * Measured against the colour path on the same pages, it is around eighteen times
 * smaller - so a twenty page contract lands under a megabyte rather than at
 * something like fifteen, and under a megabyte is a document that can be
 * emailed.
 *
 * Nothing here can reach the network: canvas, toBlob and CompressionStream all
 * work on bytes that are already in memory.
 */

/**
 * Pack a black and white page eight pixels to the byte.
 *
 * PDF's /DeviceGray at one bit per component reads a 1 as white and a 0 as
 * black, and rows start on a byte boundary - which is why the row stride is
 * computed from the width rather than the two being multiplied out together. A
 * page 700 pixels across is 88 bytes a row, and the last four bits of each row
 * are padding that no reader looks at.
 *
 * @param {{data: Uint8ClampedArray, width: number, height: number}} page
 *   RGBA, with every pixel already either black or white.
 * @returns {Uint8Array}
 */
export function packMono({ data, width, height }) {
  const stride = Math.ceil(width / 8);
  const out = new Uint8Array(stride * height);

  for (let y = 0; y < height; y += 1) {
    const row = y * stride;
    for (let x = 0; x < width; x += 1) {
      // Only the red channel is read. Every pixel this is handed came out of
      // the thresholder, where the three channels were written from one value.
      if (data[(y * width + x) * 4] >= 128) out[row + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }

  return out;
}

/**
 * WHY THERE IS NO PNG PREDICTOR HERE, which is the obvious next thing to reach
 * for and is what the Images to PDF tool does for its lossless path.
 *
 * PDF's /FlateDecode accepts PNG's per-row filters, and differencing each row
 * against the one above it is exactly the sort of thing that ought to help a
 * page of text: the margins, the gaps between paragraphs and a table's vertical
 * rules all repeat down the page. Measured, it does not. On a page of text at
 * 200 dpi the file comes out about a fifth LARGER with the up filter than
 * without it, and the reason is that deflate's own back-references already
 * match a whole repeated row against the row above at a cost of a few bits,
 * while differencing replaces those literal repeats with runs of zeros that
 * then have to be matched again - and it destroys the byte patterns that made
 * the unrepeated parts match anything.
 *
 * That is the opposite of what happens with 8-bit photographic data, where the
 * predictor is worth a great deal, so this is not a contradiction of the other
 * tool. It is what a bit depth of one does to the arithmetic.
 */

/**
 * zlib-wrapped deflate, which is what PDF's /FlateDecode means.
 *
 * CompressionStream is the browser's own, so this ships no compressor. The
 * 'deflate' format is the zlib one; 'deflate-raw' is the headerless variant, and
 * a PDF written with that opens in nothing.
 */
export async function deflate(bytes) {
  if (typeof CompressionStream !== 'function') {
    throw new Error('encode.nodeflate');
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * One page, as a PDF image stream.
 *
 * @param {{data: Uint8ClampedArray, width: number, height: number,
 *   mono: boolean, grey: boolean}} page
 * @param {{quality: number}} settings
 * @returns {Promise<{kind: 'flate1'|'dct', data: Uint8Array, width: number,
 *   height: number, gray: boolean}>}
 */
export async function encodePage(page, settings) {
  const { width, height } = page;

  if (page.mono) {
    return {
      kind: 'flate1',
      data: await deflate(packMono(page)),
      width,
      height,
      gray: true,
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.putImageData(new ImageData(page.data, width, height), 0, 0);

  const quality = Math.min(1, Math.max(0.3, Number(settings?.quality) || 0.82));
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) throw new Error('encode.nojpeg');

  return {
    kind: 'dct',
    data: new Uint8Array(await blob.arrayBuffer()),
    width,
    height,
    gray: false,
  };
}

/**
 * The same page as a standalone image file, for saving the scans as pictures
 * rather than as a document.
 *
 * A black and white page is written as a PNG rather than as a JPEG, and that is
 * not a preference: JPEG is a photographic codec, and on an image of two colours
 * with hard edges everywhere it produces both a larger file and a visible halo
 * around every letter.
 */
export async function encodeImage(page, settings) {
  const canvas = document.createElement('canvas');
  canvas.width = page.width;
  canvas.height = page.height;
  const context = canvas.getContext('2d');
  context.putImageData(new ImageData(page.data, page.width, page.height), 0, 0);

  const type = page.mono ? 'image/png' : 'image/jpeg';
  const quality = page.mono
    ? undefined
    : Math.min(1, Math.max(0.3, Number(settings?.quality) || 0.82));

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) throw new Error('encode.nopage');

  return { blob, extension: page.mono ? 'png' : 'jpg' };
}
