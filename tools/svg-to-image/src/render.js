/**
 * Turning the vector into pixels.
 *
 * The whole rasteriser is the browser's own: an <img> holding the SVG, one
 * `drawImage` onto a canvas of the size asked for, and `toBlob` for the file.
 * No renderer is vendored, nothing is fetched, and the drawing engine is the
 * same one that put the picture on the screen a moment earlier - so what comes
 * out is what the preview showed.
 *
 * WHY AN <img> AND NOT `createImageBitmap`
 *
 * `createImageBitmap` rasterises an SVG once, at whatever size the file
 * declares, and everything after that scales a bitmap. A 24-pixel icon asked
 * for 1024 would come back as a blurred 24-pixel icon - which is the one thing
 * using a vector was meant to avoid. An <img> re-rasterises at the size of
 * every draw, so the result is sharp at any size, which is the entire point of
 * this tool.
 *
 * WHAT AN <img> WILL NOT DO, AND WHY THAT IS THE FEATURE
 *
 * An SVG loaded through an <img> is in what the specification calls secure
 * static mode. Scripts inside it do not run. External references - an
 * `<image href="https://...">`, a stylesheet, a webfont, an `@import` - are
 * not fetched. Animation does not play; the first frame is what is drawn.
 *
 * For a tool that promises your files go nowhere, that is not a limitation to
 * work around, it is the guarantee doing its job: an SVG is a document that can
 * carry a script and a remote address, and this is the mode in which neither
 * can act. It is also why the canvas is never tainted and `toBlob` always
 * works. The one visible cost - a webfont in a <text> element falls back to
 * whatever this machine has - is said out loud on the page.
 *
 * @see https://www.w3.org/TR/SVG2/conform.html#secure-static-mode
 */

import { sizedSvg } from './svg.js';

export const PNG = 'image/png';
export const JPEG = 'image/jpeg';
export const WEBP = 'image/webp';

/** What each type is called in a sentence, and what the file should end in. */
export const FORMATS = {
  [PNG]: { label: 'PNG', ext: 'png', lossy: false, alpha: true },
  [JPEG]: { label: 'JPEG', ext: 'jpg', lossy: true, alpha: false },
  [WEBP]: { label: 'WebP', ext: 'webp', lossy: true, alpha: true },
};

/**
 * Ask the browser to encode a single pixel and see what comes back.
 *
 * `toBlob` does not report failure: handed a type it cannot write, Safari
 * quietly returns a PNG instead. Checking the type of the blob rather than
 * trusting the call is the only reliable test, and it costs one pixel.
 */
async function canEncode(mime) {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.8));
  return Boolean(blob) && blob.type === mime;
}

/** @returns {Promise<Set<string>>} the types this browser can write. */
export async function encodableTypes() {
  const found = new Set([PNG, JPEG]); // required of every browser by the HTML spec
  if (await canEncode(WEBP)) found.add(WEBP);
  return found;
}

/**
 * Load the SVG as an image the canvas can draw, at one particular size.
 *
 * The blob is made from the rewritten markup rather than from the file, so the
 * size in the tag is the size being asked for. It is an object URL and not a
 * `data:` URL on purpose: a data URL of a 2 MB map SVG is a 2.7 MB string, and
 * Safari has a length limit on them that a real drawing reaches.
 *
 * @param {string} text     the SVG source
 * @param {number} width    pixels
 * @param {number} height
 * @param {{stretch?: boolean}} [options]
 * @returns {Promise<{image: HTMLImageElement, release: () => void}>}
 */
export async function loadAt(text, width, height, { stretch = false } = {}) {
  const markup = sizedSvg(text, width, height, { stretch });
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
  const image = new Image();

  try {
    await new Promise((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('draw.failed'));
      image.src = url;
    });

    // Chrome resolves `onload` before the picture is ready to draw often enough
    // to matter; `decode` is the promise that actually means it. It is missing
    // on older Safari, where onload is the only signal there is.
    if (typeof image.decode === 'function') {
      try {
        await image.decode();
      } catch {
        // Already loaded above. Some builds reject a decode of an SVG that
        // draws perfectly well.
      }
    }
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }

  return { image, release: () => URL.revokeObjectURL(url) };
}

/**
 * Draw one plan onto a canvas.
 *
 * The background is painted first whenever it could show: under a padded
 * picture, and under any format with no alpha channel. Without it a
 * transparent SVG written as JPEG comes out with black where the transparency
 * was, which looks like a bug in the tool rather than a property of JPEG.
 *
 * @param {HTMLImageElement} image  from loadAt, at this plan's size
 * @param {object} plan             from sizing.js
 * @param {{background: string|null}} options  a CSS colour, or null for none
 * @returns {HTMLCanvasElement}
 */
export function draw(image, plan, { background }) {
  const canvas = document.createElement('canvas');
  canvas.width = plan.width;
  canvas.height = plan.height;

  const ctx = canvas.getContext('2d', { alpha: !background });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(image, plan.draw.x, plan.draw.y, plan.draw.width, plan.draw.height);
  return canvas;
}

/**
 * The canvas as a file.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} mime
 * @param {number} [quality]  0 to 1; ignored by PNG, which has no dial
 * @returns {Promise<Blob>}
 */
export async function encode(canvas, mime, quality) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob) {
    // A key and its blank, because the caller is the only place a phrase
    // can be read - see the note at the top of shared/js/phrases.js.
    throw Object.assign(new Error('encode.refused'),
      { values: { format: FORMATS[mime]?.label ?? mime } });
  }
  return blob;
}

/**
 * Load, draw and encode in one step, releasing everything on the way out.
 *
 * The canvas is emptied rather than left to the collector. A batch runs one of
 * these per file per density; at 4096 pixels square each one is 64 MB, and
 * three of them held for no reason is how a tab gets killed.
 *
 * @returns {Promise<Blob>}
 */
export async function rasterize(text, plan, { mime, quality, background }) {
  const held = await loadAt(text, plan.draw.width, plan.draw.height, { stretch: plan.stretch });
  let canvas;
  try {
    canvas = draw(held.image, plan, { background });
    return await encode(canvas, mime, quality);
  } finally {
    held.release();
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}
