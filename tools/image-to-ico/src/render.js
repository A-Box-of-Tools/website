/**
 * Decoding the picture, and drawing it at each size an icon needs.
 *
 * This is the only lossy part of the job and the only part that is not
 * arithmetic. Everything the browser already has does it: `createImageBitmap`
 * to decode, a `<canvas>` to scale, `canvas.toBlob` to write the PNG entries.
 * No codec is vendored and nothing is fetched, which is why the tool works with
 * the network unplugged.
 *
 * WHY THE SCALING IS DONE IN STEPS
 *
 * An icon is an extreme downscale: a 1024px logo going to 16px is throwing away
 * 99.98% of the pixels. Asked to do that in one `drawImage`, a browser samples
 * a small neighbourhood around each destination pixel and ignores the rest, so
 * thin strokes fall between the samples and come back broken - the letters in a
 * wordmark go from grey to gone depending on where they happened to land.
 *
 * Halving repeatedly until the last step is a factor of two or less means every
 * source pixel is read at every stage, so a stroke that is one pixel wide at
 * 1024 arrives at 16 as something faint rather than as nothing. It costs a
 * handful of small canvas draws.
 */

/** How a picture that is not square is made square. */
export const FIT = {
  pad: 'pad',
  crop: 'crop',
  stretch: 'stretch',
};

/**
 * The size an SVG is treated as when it declares none of its own.
 *
 * A vector has no natural pixel size, and one written without `width` and
 * `height` attributes reports zero through an <img>. Nothing can be divided by
 * that, so a square of this side is assumed instead. It costs nothing to be
 * wrong about: the browser draws an SVG at whatever size it is asked for, and
 * an SVG whose viewBox is not square letterboxes itself inside the square,
 * which is the same thing padding would have done.
 */
export const NOMINAL_VECTOR = 1024;

const isVector = (file) => file.type === 'image/svg+xml' || /\.svg$/i.test(file.name ?? '');

/**
 * A refusal this file wrote, rather than one the platform threw.
 *
 * The message is a phrase key and `values` fills its blanks; main.js turns the
 * pair into a sentence. A platform error coming up the same path still reads
 * as itself, because phrase() hands back a key it cannot find.
 */
function refusal(key, values) {
  const error = new Error(key);
  error.values = values;
  return error;
}

/**
 * Decode a file into something a canvas can draw.
 *
 * `createImageBitmap` is the direct route and what every current browser takes.
 * The <img> fallback is for the older Safari builds where it is missing or
 * refuses a blob; the same picture, through the same image pipeline, with an
 * object URL in the middle.
 *
 * AN SVG NEVER TAKES THE FIRST ROUTE, ON PURPOSE
 *
 * `createImageBitmap` rasterises once, at whatever size the file happens to
 * declare, and everything after that is a scaled photograph of a vector - a
 * 100px SVG asked for a 256px icon would come back blurred, which is the one
 * thing using a vector was meant to avoid. An <img> holding an SVG is different:
 * the browser re-rasterises it at the size of every `drawImage`, so each entry
 * in the icon is drawn from the vector at its own size, sharp all the way to 256.
 *
 * @param {File|Blob} file
 * @returns {Promise<{bitmap: ImageBitmap|HTMLImageElement, width: number,
 *   height: number, vector: boolean, url: string|null}>}
 */
export async function decode(file) {
  const vector = isVector(file);

  if (!vector && typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return { bitmap, width: bitmap.width, height: bitmap.height, vector: false, url: null };
    } catch {
      // Fall through: some builds reject formats their <img> tag accepts.
    }
  }

  const url = URL.createObjectURL(file);
  let img;
  try {
    img = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(refusal('decode.failed'));
      element.src = url;
    });
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }

  // The URL is kept alive rather than revoked here. A raster <img> is decoded
  // and done with it, but an SVG is drawn from its source every time, and
  // pulling the URL out from under it is how the second draw comes back blank.
  return {
    bitmap: img,
    width: img.naturalWidth || (vector ? NOMINAL_VECTOR : 0),
    height: img.naturalHeight || (vector ? NOMINAL_VECTOR : 0),
    vector,
    url,
  };
}

/** Decoded pictures hold real memory and are not collected promptly. Let them go. */
export function release(decoded) {
  if (!decoded) return;
  if (typeof decoded.bitmap?.close === 'function') decoded.bitmap.close();
  if (decoded.url) URL.revokeObjectURL(decoded.url);
}

/**
 * Which part of the source goes where on a square of `px` pixels.
 *
 * Separated from the drawing so that the page can describe the plan in words
 * before anything is rendered, and so that the arithmetic - the only part that
 * can be wrong in a way you would not see - is a plain function.
 *
 * `inset` is a fraction of the square kept clear on every side. It is zero for
 * everything except the Android maskable icon, which is deliberately drawn
 * small because the launcher crops it to whatever shape that phone likes -
 * a circle, a squircle, a rounded square - and only the middle 80% is
 * guaranteed to survive.
 *
 * @param {number} width  the source
 * @param {number} height
 * @param {number} px     the square being filled
 * @param {'pad'|'crop'|'stretch'} fit
 * @param {number} [inset] 0 to 0.5
 */
export function plan(width, height, px, fit, inset = 0) {
  const inner = Math.max(1, Math.round(px * (1 - 2 * inset)));
  const margin = Math.round((px - inner) / 2);
  const whole = { x: 0, y: 0, width, height };

  if (fit === FIT.stretch || width === height) {
    return {
      source: whole,
      draw: { x: margin, y: margin, width: inner, height: inner },
      padded: inner !== px,
    };
  }

  if (fit === FIT.crop) {
    // The biggest square that fits inside the picture, taken from the middle.
    const side = Math.min(width, height);
    return {
      source: {
        x: Math.round((width - side) / 2),
        y: Math.round((height - side) / 2),
        width: side,
        height: side,
      },
      draw: { x: margin, y: margin, width: inner, height: inner },
      padded: inner !== px,
    };
  }

  // Pad: the whole picture, shrunk to fit, centred, with the rest left alone.
  const scale = Math.min(inner / width, inner / height);
  const drawWidth = Math.max(1, Math.round(width * scale));
  const drawHeight = Math.max(1, Math.round(height * scale));
  return {
    source: whole,
    draw: {
      x: Math.round((px - drawWidth) / 2),
      y: Math.round((px - drawHeight) / 2),
      width: drawWidth,
      height: drawHeight,
    },
    padded: true,
  };
}

/**
 * Draw one square at `px` and hand back the canvas.
 *
 * @param {ImageBitmap|HTMLImageElement} source
 * @param {number} sourceWidth
 * @param {number} sourceHeight
 * @param {number} px
 * @param {{fit: string, background: string|null, inset?: number, vector?: boolean}} options
 *   `background` is a CSS colour, or null to leave the padding transparent
 * @returns {HTMLCanvasElement}
 */
export function square(source, sourceWidth, sourceHeight, px, { fit, background, inset = 0, vector = false }) {
  const layout = plan(sourceWidth, sourceHeight, px, fit, inset);

  const canvas = document.createElement('canvas');
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, px, px);
  }

  // A vector is re-rasterised by the browser at whatever size it is drawn, so
  // there is nothing to step down from and nothing to lose by going straight
  // there. Doing it anyway would rasterise once and then scale the raster,
  // which is exactly the blur this avoids.
  const reduced = vector
    ? { canvas: null, source: layout.source }
    : stepDown(source, layout.source, layout.draw.width, layout.draw.height);
  ctx.drawImage(
    reduced.canvas ?? source,
    reduced.source.x, reduced.source.y, reduced.source.width, reduced.source.height,
    layout.draw.x, layout.draw.y, layout.draw.width, layout.draw.height,
  );

  if (reduced.canvas) {
    reduced.canvas.width = 0;
    reduced.canvas.height = 0;
  }

  return canvas;
}

/**
 * Halve the source until one more halving would overshoot the target.
 *
 * Returns either the original rectangle, to be drawn from the source directly,
 * or a scratch canvas holding a smaller copy and the rectangle to take out of
 * it. Anything less than a factor of two away needs none of this.
 */
function stepDown(source, rect, targetWidth, targetHeight) {
  if (rect.width <= targetWidth * 2 && rect.height <= targetHeight * 2) {
    return { canvas: null, source: rect };
  }

  let width = rect.width;
  let height = rect.height;
  let from = source;
  let take = rect;
  let scratch = null;

  while (width > targetWidth * 2 && height > targetHeight * 2) {
    const nextWidth = Math.max(targetWidth, Math.floor(width / 2));
    const nextHeight = Math.max(targetHeight, Math.floor(height / 2));

    const step = document.createElement('canvas');
    step.width = nextWidth;
    step.height = nextHeight;
    const ctx = step.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(from, take.x, take.y, take.width, take.height, 0, 0, nextWidth, nextHeight);

    if (scratch) {
      scratch.width = 0;
      scratch.height = 0;
    }
    scratch = step;
    from = step;
    take = { x: 0, y: 0, width: nextWidth, height: nextHeight };
    width = nextWidth;
    height = nextHeight;
  }

  return { canvas: scratch, source: take };
}

/** The RGBA pixels of a canvas, which is what the DIB writer takes. */
export function pixels(canvas) {
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { width: data.width, height: data.height, data: data.data };
}

/**
 * The canvas as a PNG file.
 *
 * PNG is required of every browser by the HTML specification, so unlike the
 * other tools here this one has no encoder support to test for and no fallback
 * to arrange. If `toBlob` returns nothing at all, something is wrong that a
 * different format would not fix.
 *
 * @returns {Promise<Uint8Array>}
 */
export async function png(canvas) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw refusal('png.refused');
  return new Uint8Array(await blob.arrayBuffer());
}
