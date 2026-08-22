/**
 * Drawing and encoding: the canvas half of the tool.
 *
 * Everything here goes through a `<canvas>`. A decoded picture is drawn onto
 * one and the canvas is asked for a blob, which is the browser's own JPEG
 * encoder, already installed, already fast, and already running on the
 * visitor's own machine - which is why this tool ships no codec and has no
 * network step of any kind.
 *
 * The one part worth reading properly is `encodeToBand`. Every other image tool
 * on this site searches for a file size *ceiling*; these forms state a floor as
 * well, and a floor cannot be reached by compressing less once the encoder has
 * run out of less. What happens then is in jpeg.js, and it is said out loud on
 * the page rather than done quietly.
 */

import { padTo, setDensity } from './jpeg.js';

export const JPEG = 'image/jpeg';

/**
 * Decode a file into a bitmap.
 *
 * `createImageBitmap` is the direct route and what every current browser takes.
 * The `<img>` fallback is for older Safari builds where it is missing or
 * refuses a blob; same picture, same pipeline, an object URL in the middle.
 *
 * @param {Blob} file
 * @returns {Promise<{bitmap: ImageBitmap|HTMLImageElement, width: number, height: number}>}
 */
export async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return { bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // Fall through: some builds reject formats their <img> tag accepts.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('this browser could not decode the picture.'));
      element.src = url;
    });
    return { bitmap: img, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Bitmaps hold real memory and are not collected promptly. Let them go. */
export function release(bitmap) {
  if (bitmap && typeof bitmap.close === 'function') bitmap.close();
}

/**
 * One crop, drawn at the size it is going to be saved at.
 *
 * A single `drawImage` does the crop and the scale together: the source
 * rectangle is the crop box, the destination is the whole canvas. There is no
 * intermediate bitmap and no second pass, so a crop that is also being resized
 * costs exactly what either would have cost on its own.
 *
 * The background is painted first because JPEG has no alpha channel, and a
 * transparent PNG drawn straight onto an unpainted canvas comes out with black
 * where the transparency was - which looks like a bug in the tool rather than a
 * property of the format.
 *
 * @param {ImageBitmap|HTMLImageElement} source
 * @param {{x:number,y:number,width:number,height:number}} rect
 * @param {{width: number, height: number}} out
 * @returns {HTMLCanvasElement}
 */
export function drawCrop(source, rect, out, { background = '#ffffff' } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(out.width));
  canvas.height = Math.max(1, Math.round(out.height));

  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    source,
    rect.x, rect.y, rect.width, rect.height,
    0, 0, canvas.width, canvas.height,
  );

  return canvas;
}

/**
 * The pixels of a crop, small, for the background check to read.
 *
 * Deliberately not the full-size render: the check averages colours and
 * measures how much they vary, and both answers are the same at 240 pixels
 * across as at 2400, for a hundredth of the memory. A batch of full-size
 * ImageData is also the fastest way to have a tab killed on a phone.
 *
 * @returns {{data: Uint8ClampedArray, width: number, height: number}}
 */
export function samplePixels(source, rect, longEdge = 240) {
  const scale = Math.min(1, longEdge / Math.max(rect.width, rect.height));
  const canvas = drawCrop(source, rect, {
    width: Math.max(1, Math.round(rect.width * scale)),
    height: Math.max(1, Math.round(rect.height * scale)),
  });
  const ctx = canvas.getContext('2d', { alpha: false });
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  free(canvas);
  return image;
}

/** Free a canvas's backing store now rather than when the collector gets to it. */
export function free(canvas) {
  canvas.width = 0;
  canvas.height = 0;
}

/** One encode. Rejects rather than returning null, so a caller cannot ignore it. */
export async function toBytes(canvas, quality) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, JPEG, quality));
  if (!blob) throw new Error('this browser would not write a JPEG.');
  return new Uint8Array(await blob.arrayBuffer());
}

/** The best quality worth asking for: above this the file grows and nothing else does. */
const CEILING = 0.95;

/** Below this a 200-pixel photograph is mush, and a form that wanted a face has not got one. */
const FLOOR = 0.25;

/** Enough for the search below, and a stop if it ever misbehaves. */
const MAX_ENCODES = 10;

/**
 * @typedef {object} BandResult
 * @property {Uint8Array} bytes
 * @property {number} quality
 * @property {number} encodes    how many times the picture was encoded
 * @property {number} padded     bytes of comment added to reach the floor
 * @property {boolean} fitted    true when the result is inside the band
 * @property {string} how        one sentence for the page, saying what happened
 */

/**
 * Encode until the file lands inside the band the form will accept.
 *
 * The two ends are not symmetrical and are not solved the same way:
 *
 *   THE CEILING is solved by compressing harder, which costs quality, so the
 *   search looks for the *highest* quality that still fits under it. That is
 *   the same bisection the image compressor uses, minus the resolution half -
 *   there is nothing to spend there, because the pixel size is mandated.
 *
 *   THE FLOOR cannot be solved by compressing less once quality is at its
 *   ceiling. A 200 x 230 photograph is 46,000 pixels; at the best quality a
 *   browser will write, that is often 15 KB and the form wants 20. So the file
 *   is padded with a JPEG comment - see jpeg.js, which explains exactly what
 *   that does and does not change, and writes the explanation into the file.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{min: number, max: number}} band  in bytes
 * @returns {Promise<BandResult>}
 */
export async function encodeToBand(canvas, band) {
  const max = band.max ?? Infinity;
  const min = band.min ?? 0;

  let encodes = 0;
  const attempt = async (quality) => {
    if (encodes >= MAX_ENCODES) throw new Error('gave up after too many attempts.');
    encodes += 1;
    return { bytes: await toBytes(canvas, quality), quality };
  };

  let best = await attempt(CEILING);

  if (best.bytes.length > max) {
    // Too big at the top. Find the highest quality that fits: `low` is a
    // quality known to fit, `high` one known not to. Six halvings narrow the
    // dial to under a hundredth, which is finer than the encoder distinguishes.
    const bottom = await attempt(FLOOR);
    if (bottom.bytes.length > max) {
      return finish(bottom, false, `Even at the lowest quality worth using, this comes out at `
        + `${Math.round(bottom.bytes.length / 1024)} KB, which is over the limit. `
        + `The picture has more detail in it than the form allows for.`);
    }

    let low = FLOOR;
    let high = CEILING;
    best = bottom;
    for (let round = 0; round < 5; round += 1) {
      const mid = (low + high) / 2;
      const tried = await attempt(mid);
      if (tried.bytes.length <= max) {
        low = mid;
        best = tried;
      } else {
        high = mid;
      }
    }
  }

  // Under the floor, with the dial not yet at the top. Real detail beats filler
  // wherever it is available, so one more encode is spent before any padding is
  // considered: quality 1.0 is a poor trade in every other tool on this site,
  // and here it is bytes that are genuinely picture.
  if (best.bytes.length < min && best.quality < 1) {
    const top = await attempt(1);
    if (top.bytes.length <= max && top.bytes.length > best.bytes.length) best = top;
  }

  if (best.bytes.length >= min) {
    return finish(best, true, `Written at quality ${Math.round(best.quality * 100)}, `
      + `which is ${sizeText(best.bytes.length)} - inside the band the form accepts.`);
  }

  // Under the floor. Padding is the only honest way up from here.
  const padded = padTo(best.bytes, min);
  return finish(
    { bytes: padded, quality: best.quality },
    padded.length >= min,
    `The picture encodes to ${sizeText(best.bytes.length)} at the very top of the quality `
      + `dial, which is still under the ${sizeText(min)} floor the form insists on. `
      + `${sizeText(padded.length - best.bytes.length)} of JPEG comment was added to reach it; `
      + `the picture itself is untouched.`,
    padded.length - best.bytes.length,
  );

  function finish(result, fitted, how, padding = 0) {
    return { bytes: result.bytes, quality: result.quality, encodes, padded: padding, fitted, how };
  }
}

/** Bytes as somebody would say them. KB here means 1024 bytes, as the forms mean it. */
export function sizeText(bytes) {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * A print-ready JPEG: the crop at the mandated pixel size, carrying the DPI.
 *
 * The density patch is the last thing done and is done to the bytes rather than
 * through the canvas, because there is no way to ask a canvas for it. See
 * jpeg.js.
 *
 * @returns {Promise<{blob: Blob, bytes: Uint8Array}>}
 */
export async function encodePrint(canvas, { dpi, quality = 0.94 }) {
  const bytes = setDensity(await toBytes(canvas, quality), dpi);
  return { blob: new Blob([bytes], { type: JPEG }), bytes };
}

/**
 * Draw the sheet: white paper, one copy of the photograph in every cell, and
 * the cut marks in the gaps.
 *
 * The photograph is drawn from the already-rendered print canvas rather than
 * from the original picture again, so every copy on the sheet is the same
 * pixels as the single print - one scale, not two, and no chance of the sheet
 * and the standalone file disagreeing about what was cropped.
 *
 * @param {object} plan  from sheet.js
 * @param {HTMLCanvasElement|ImageBitmap} photo
 */
export function drawSheet(plan, photo) {
  const canvas = document.createElement('canvas');
  canvas.width = plan.canvas.width;
  canvas.height = plan.canvas.height;

  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const cell of plan.cells) {
    ctx.drawImage(photo, cell.x, cell.y, cell.width, cell.height);
  }

  // A hairline at 300 dpi is a third of a millimetre and vanishes on cheap
  // paper, so the line scales with the resolution rather than being one pixel.
  ctx.strokeStyle = '#444444';
  ctx.lineWidth = Math.max(1, Math.round(plan.dpi / 300));
  ctx.beginPath();
  for (const mark of plan.marks) {
    // The half-pixel offset puts a one-pixel line on a pixel rather than
    // straddling two of them, which is the difference between a crisp tick and
    // a grey smear.
    const shift = ctx.lineWidth % 2 === 1 ? 0.5 : 0;
    ctx.moveTo(mark.x1 + shift, mark.y1 + shift);
    ctx.lineTo(mark.x2 + shift, mark.y2 + shift);
  }
  ctx.stroke();

  return canvas;
}
