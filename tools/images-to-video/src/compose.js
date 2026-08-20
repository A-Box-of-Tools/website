/** Drawing a source image into a fixed-size video frame. */

/**
 * Fit an image of `sw`x`sh` into a `dw`x`dh` box.
 * @returns {{x: number, y: number, w: number, h: number}}
 */
function fitRect(sw, sh, dw, dh, mode) {
  if (mode === 'stretch') return { x: 0, y: 0, w: dw, h: dh };

  const scale = mode === 'cover'
    ? Math.max(dw / sw, dh / sh)
    : Math.min(dw / sw, dh / sh);

  const w = sw * scale;
  const h = sh * scale;
  return { x: (dw - w) / 2, y: (dh - h) / 2, w, h };
}

/**
 * Draw one slideshow frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {ImageBitmap|HTMLCanvasElement} image
 * @param {{fit: 'contain'|'cover'|'blur'|'stretch', background: string}} options
 */
export function drawFrame(ctx, image, { fit, background }) {
  const dw = ctx.canvas.width;
  const dh = ctx.canvas.height;
  const sw = image.width;
  const sh = image.height;

  ctx.save();
  ctx.filter = 'none';
  ctx.globalAlpha = 1;

  if (fit === 'blur') {
    // Fill the frame with an enlarged, blurred copy, then lay the image on top.
    const cover = fitRect(sw, sh, dw, dh, 'cover');
    const bleed = 0.12; // overscan so the blur never samples past the edges
    ctx.filter = `blur(${Math.max(8, Math.round(Math.min(dw, dh) * 0.04))}px)`;
    ctx.drawImage(
      image,
      cover.x - cover.w * bleed,
      cover.y - cover.h * bleed,
      cover.w * (1 + bleed * 2),
      cover.h * (1 + bleed * 2),
    );
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, dw, dh);
  }

  const target = fitRect(sw, sh, dw, dh, fit === 'blur' ? 'contain' : fit);
  ctx.drawImage(image, target.x, target.y, target.w, target.h);
  ctx.restore();
}

/**
 * H.264 requires even dimensions in both axes (4:2:0 chroma subsampling).
 */
export function toEvenSize(width, height) {
  return {
    width: Math.max(2, Math.floor(width / 2) * 2),
    height: Math.max(2, Math.floor(height / 2) * 2),
  };
}

/** Neither dimension may exceed this, or encoders start refusing the config. */
const MAX_DIMENSION = 7680;

/** Scale down proportionally if either side is over the limit. */
function capped(width, height) {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  return toEvenSize(width * scale, height * scale);
}

/**
 * Work out the output size for a resolution preset.
 *
 * 'auto' matches the highest resolution present: the widest width and the
 * tallest height found across all images. Taking each axis independently
 * matters when the images differ — a set containing both a 4000x3000 landscape
 * and a 3000x4000 portrait resolves to 4000x4000, so neither one is scaled
 * down. Picking a single "largest" image instead would shrink the other.
 *
 * @param {string} preset  'auto', 'custom', or a 'WIDTHxHEIGHT' string
 * @param {object[]} items
 * @param {{width: number, height: number}} [custom]  used when preset is 'custom'
 */
export function resolveOutputSize(preset, items, custom) {
  if (preset === 'custom') {
    return capped(
      Number(custom?.width) > 0 ? Number(custom.width) : 1920,
      Number(custom?.height) > 0 ? Number(custom.height) : 1080,
    );
  }

  if (preset !== 'auto') {
    const [w, h] = preset.split('x').map(Number);
    return toEvenSize(w, h);
  }

  if (!items.length) return toEvenSize(1920, 1080);

  let width = 0;
  let height = 0;
  for (const item of items) {
    width = Math.max(width, item.width);
    height = Math.max(height, item.height);
  }
  return capped(width, height);
}
