/** Drawing a source image into a fixed-size frame, and deciding that size. */

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
 * Draw one frame.
 *
 * A `background` of null means leave the frame transparent where the picture
 * does not reach, which only makes sense when the GIF is being written with a
 * transparent index. Everywhere else it is a colour, because a GIF has no way
 * to say "partly transparent" and a soft edge over nothing would be cut into a
 * hard one.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {ImageBitmap|HTMLCanvasElement} image
 * @param {{fit: 'contain'|'cover'|'stretch', background: string|null}} options
 */
export function drawFrame(ctx, image, { fit, background }) {
  const dw = ctx.canvas.width;
  const dh = ctx.canvas.height;

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.imageSmoothingQuality = 'high';

  ctx.clearRect(0, 0, dw, dh);
  if (background !== null) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, dw, dh);
  }

  const target = fitRect(image.width, image.height, dw, dh, fit);
  ctx.drawImage(image, target.x, target.y, target.w, target.h);
  ctx.restore();
}

/**
 * The largest frame this tool will write.
 *
 * Not a limit of the format - a GIF may be 65,535 pixels a side - but of what
 * anybody can use. A GIF stores every frame as whole pixels with no motion
 * compensation and no lossy step, so its size grows with area and frame count
 * and nothing brings it back down: twenty frames at 1000x1000 is tens of
 * megabytes whatever the palette does. Somebody who wants that has asked for
 * the wrong format, and the page says so rather than the tool quietly making
 * a file nothing will load.
 */
export const MAX_SIDE = 1000;

/** Even a small GIF has to be a frame, not a pixel. */
const MIN_SIDE = 16;

const clampSide = (value) => Math.max(MIN_SIDE, Math.min(MAX_SIDE, Math.round(value)));

/**
 * The box the images are drawn into, as the widest width and the tallest height
 * across all of them.
 *
 * Taking each axis on its own matters when the images differ: a set holding
 * both a 4000x3000 landscape and a 3000x4000 portrait resolves to 4000x4000, so
 * neither one is cropped or letterboxed more than the other. Picking a single
 * "largest" image instead would decide the shape of the animation from whichever
 * picture happened to be biggest.
 */
export function naturalBox(items) {
  let width = 0;
  let height = 0;
  for (const item of items) {
    width = Math.max(width, item.width);
    height = Math.max(height, item.height);
  }
  return width && height ? { width, height } : { width: 480, height: 270 };
}

/**
 * Work out the output size.
 *
 * The presets name a long edge rather than a width and a height, because the
 * shape comes from the pictures and the only question is how big to make it.
 * 'original' is the natural box, still capped: see MAX_SIDE.
 *
 * @param {string} preset  'original', 'custom', or a number of pixels as a string
 * @param {object[]} items
 * @param {{width: number, height: number}} [custom]
 */
export function resolveOutputSize(preset, items, custom) {
  if (preset === 'custom') {
    return {
      width: clampSide(Number(custom?.width) > 0 ? Number(custom.width) : 480),
      height: clampSide(Number(custom?.height) > 0 ? Number(custom.height) : 270),
    };
  }

  const box = naturalBox(items);
  const longest = Math.max(box.width, box.height);
  const target = preset === 'original' ? Math.min(longest, MAX_SIDE) : Number(preset);
  const scale = Math.min(1, (Number.isFinite(target) ? target : longest) / longest);

  return {
    width: clampSide(box.width * scale),
    height: clampSide(box.height * scale),
  };
}
