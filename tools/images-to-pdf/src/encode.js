/**
 * Turning one chosen file into the bytes that go inside the PDF.
 *
 * There are three ways out of here and the whole tool turns on which one a
 * picture takes:
 *
 *   copied    the file's own JPEG data, put in the document untouched. No
 *             decode, no re-compression, no loss - the pixels in the PDF are
 *             the pixels in the file. This is the good path and most photos
 *             take it.
 *   jpeg      decoded, drawn, and encoded again by the browser. Needed for
 *             formats PDF has no filter for - PNG, WebP, AVIF, GIF - and for
 *             any JPEG that is being resized or that PDF's DCTDecode does not
 *             cover.
 *   lossless  decoded and stored as raw samples, deflated. Bigger, exact, and
 *             the only one of the three that can keep transparency.
 *
 * Nothing here can reach the network. Every API named in this file - canvas,
 * createImageBitmap, CompressionStream - works on bytes already in memory.
 */

import { inspectJpeg } from './jpeg.js';

/**
 * Prepare one item for the document.
 *
 * @returns {Promise<{kind: 'dct'|'flate', data: Uint8Array, width: number,
 *   height: number, gray: boolean, icc: Uint8Array|null, orientation: number,
 *   smask: {data: Uint8Array}|null, copied: boolean, predictor: boolean}>}
 */
export async function prepareImage(item, settings) {
  // Turning a picture does not change its longest side, so the limit can be
  // checked against the stored size without working out which way up it is.
  const limit = Number(settings.maxSide) || 0;
  const resizing = limit > 0 && Math.max(item.width, item.height) > limit;

  if (settings.mode === 'keep' && !resizing) {
    const copied = await copyJpeg(item);
    if (copied) return copied;
  }

  return redraw(item, settings, resizing ? limit : 0);
}

/**
 * The good path: hand the file's own bytes to the PDF, if PDF can take them.
 *
 * DCTDecode is defined over sequential JPEG with one or three components. A
 * progressive or CMYK file is not refused with a message - it just goes the
 * other way and is re-encoded, which is why this returns null rather than
 * throwing.
 */
async function copyJpeg(item) {
  if (!isJpeg(item)) return null;

  const bytes = new Uint8Array(await item.file.arrayBuffer());
  const info = inspectJpeg(bytes);
  if (!info || !info.sequential) return null;
  if (info.components !== 1 && info.components !== 3) return null;

  // The file is the authority on its own size and rotation. What was read from
  // the first half-megabyte when the picture was chosen was for the preview;
  // this is what the page is actually laid out from.
  item.width = info.width;
  item.height = info.height;
  item.orientation = info.orientation;

  return {
    kind: 'dct',
    data: bytes,
    width: info.width,
    height: info.height,
    gray: info.components === 1,
    icc: info.icc,
    orientation: info.orientation,
    smask: null,
    copied: true,
    predictor: false,
  };
}

function isJpeg(item) {
  return /^image\/jpe?g$/i.test(item.file.type) || /\.jpe?g$/i.test(item.name);
}

/**
 * Decode the picture and write it out again.
 *
 * The decode honours the EXIF tag, so what comes back is already the right way
 * up and the placement matrix has nothing left to do - hence orientation 1 on
 * everything this function returns.
 */
async function redraw(item, settings, limit) {
  const bitmap = await createImageBitmap(item.file, { imageOrientation: 'from-image' });

  try {
    const scale = limit ? Math.min(1, limit / Math.max(bitmap.width, bitmap.height)) : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    // A JPEG cannot be see-through, so there is nothing to ask about one - and
    // asking costs a pass over every pixel of a picture that is here precisely
    // because it is large enough to be worth resizing.
    const lossless = settings.mode === 'lossless'
      || (settings.mode === 'keep' && !isJpeg(item) && await hasAlpha(bitmap));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: lossless });

    // JPEG cannot carry transparency, so anything see-through has to be put on
    // something. The page colour is the only answer that does not surprise
    // anybody: what shows through in the document is what would have shown
    // through if the format could have done it.
    if (!lossless) {
      ctx.fillStyle = settings.background || '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(bitmap, 0, 0, width, height);

    return lossless
      ? await losslessStream(ctx, width, height)
      : await jpegStream(canvas, settings, width, height);
  } finally {
    bitmap.close();
  }
}

async function jpegStream(canvas, settings, width, height) {
  const quality = Math.min(1, Math.max(0.3, Number(settings.quality) || 0.9));
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('encode.nojpeg');

  return {
    kind: 'dct',
    data: new Uint8Array(await blob.arrayBuffer()),
    width,
    height,
    gray: false,
    icc: null,
    orientation: 1,
    smask: null,
    copied: false,
    predictor: false,
  };
}

/**
 * Raw samples, PNG-filtered and deflated.
 *
 * PDF's FlateDecode understands the same per-row filters PNG uses, through
 * /DecodeParms /Predictor 15. That is worth having: deflate alone over raw RGB
 * is markedly worse than a PNG of the same picture, and the difference on a
 * screenshot or a scan of a printed page is several times the file size.
 */
async function losslessStream(ctx, width, height) {
  const { data } = ctx.getImageData(0, 0, width, height);

  const rgb = new Uint8Array(width * height * 3);
  const alpha = new Uint8Array(width * height);
  let opaque = true;

  for (let i = 0, p = 0, a = 0; i < data.length; i += 4, p += 3, a += 1) {
    rgb[p] = data[i];
    rgb[p + 1] = data[i + 1];
    rgb[p + 2] = data[i + 2];
    alpha[a] = data[i + 3];
    if (data[i + 3] !== 255) opaque = false;
  }

  return {
    kind: 'flate',
    data: await deflate(pngFilter(rgb, width, height, 3)),
    width,
    height,
    gray: false,
    icc: null,
    orientation: 1,
    smask: opaque ? null : { data: await deflate(pngFilter(alpha, width, height, 1)) },
    copied: false,
    predictor: true,
  };
}

/**
 * Does anything in this picture let the page show through?
 *
 * Asked in the default mode only, and only of formats that could answer yes, to
 * decide between a JPEG (which cannot carry transparency) and the lossless path
 * (which can). It costs a decode and a pass over the pixels, which is why the
 * question is not put to a file that is already a JPEG.
 */
async function hasAlpha(bitmap) {
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);

  const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 255) return true;
  }
  return false;
}

/* --------------------------------------------------------------- filtering */

/**
 * Apply PNG row filters, choosing per row.
 *
 * The heuristic is the one in the PNG specification's own advice: try each
 * filter and keep whichever produces the smallest sum of absolute differences,
 * on the reasoning that bytes near zero compress best. Average is left out of
 * the candidates - it rarely wins on photographic or screenshot data, and every
 * candidate costs another pass over the row.
 */
function pngFilter(raw, width, height, channels) {
  const stride = width * channels;
  const out = new Uint8Array((stride + 1) * height);
  const candidate = new Uint8Array(stride);
  const best = new Uint8Array(stride);
  const zeros = new Uint8Array(stride);
  let previous = zeros;

  for (let y = 0; y < height; y += 1) {
    const row = raw.subarray(y * stride, y * stride + stride);
    let bestType = 0;
    let bestScore = Infinity;

    for (const type of [0, 1, 2, 4]) {
      let score = 0;
      let x = 0;
      for (; x < stride; x += 1) {
        const left = x >= channels ? row[x - channels] : 0;
        const up = previous[x];
        const upLeft = x >= channels ? previous[x - channels] : 0;
        let value;
        if (type === 0) value = row[x];
        else if (type === 1) value = row[x] - left;
        else if (type === 2) value = row[x] - up;
        else value = row[x] - paeth(left, up, upLeft);
        value &= 0xff;
        candidate[x] = value;
        // Bytes are scored as signed, which is what makes "near zero" mean near
        // zero in both directions rather than small and positive.
        score += value < 128 ? value : 256 - value;
        if (score >= bestScore) break;
      }
      // A row that gave up early is not a row that won, so only a complete pass
      // can replace the incumbent.
      if (x === stride && score < bestScore) {
        bestScore = score;
        bestType = type;
        best.set(candidate);
      }
    }

    out[y * (stride + 1)] = bestType;
    out.set(best, y * (stride + 1) + 1);
    previous = row;
  }

  return out;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

/* ------------------------------------------------------------- compression */

/**
 * zlib-wrapped deflate, which is what PDF's /FlateDecode means.
 *
 * CompressionStream is the browser's own, so this ships no compressor. The
 * 'deflate' format is the zlib one; 'deflate-raw' would be the headerless
 * variant, and a PDF written with that opens in nothing.
 */
export async function deflate(bytes) {
  if (typeof CompressionStream !== 'function') {
    throw new Error('encode.nodeflate');
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
