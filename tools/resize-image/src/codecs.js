/**
 * The decoders and encoders, and what this browser will actually do.
 *
 * Everything here goes through a canvas: a decoded picture is drawn onto one
 * and the canvas is asked for a blob. That is the browser's own JPEG, PNG and
 * WebP encoder, already installed, already fast, and already running on the
 * visitor's machine - which is why this tool needs no vendored codec and no
 * network step at all.
 *
 * Two consequences, both stated on the page rather than hidden here:
 *
 *   - Re-encoding is lossy for JPEG and WebP. A picture that is resized has to
 *     be re-encoded, so the quality control on the page is a real choice and
 *     not a decoration.
 *   - A canvas holds pixels and nothing else, so EXIF, GPS, XMP and the rest
 *     do not survive the trip. That is why a file this tool is not being asked
 *     to change is handed back untouched rather than politely re-saved.
 */

export const JPEG = 'image/jpeg';
export const PNG = 'image/png';
export const WEBP = 'image/webp';

/** What each type is called in a sentence, and what the file should end in. */
export const FORMATS = {
  [JPEG]: { label: 'JPEG', ext: 'jpg', lossy: true, alpha: false },
  [PNG]: { label: 'PNG', ext: 'png', lossy: false, alpha: true },
  [WEBP]: { label: 'WebP', ext: 'webp', lossy: true, alpha: true },
};

/** Types this tool will read. Anything else is refused with a message. */
export const READABLE = [JPEG, PNG, WEBP, 'image/gif', 'image/bmp', 'image/avif'];

/**
 * The format a file keeps when nothing else is asked for.
 *
 * Anything the browser cannot write - a GIF, a BMP, an AVIF on most machines -
 * becomes PNG rather than JPEG, because those are the formats most likely to
 * be carrying transparency or flat colour, and PNG is the one that keeps both.
 */
export function keepFormat(type, writable) {
  return writable.has(type) ? type : PNG;
}

/**
 * Ask the browser to encode a single pixel and see what comes back.
 *
 * `toBlob` does not report failure: handed a type it cannot write, Safari
 * quietly returns a PNG instead. Checking the type of the blob rather than
 * trusting the call is the only reliable test, and it costs one pixel.
 *
 * @returns {Promise<boolean>}
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
  const found = new Set([JPEG, PNG]); // required of every browser by the HTML spec
  if (await canEncode(WEBP)) found.add(WEBP);
  return found;
}

/**
 * A refusal this file wrote, rather than one the platform threw.
 *
 * The message is a phrase key and `values` fills its blanks; main.js turns the
 * pair into a sentence. Nothing is lost when a platform error comes up the
 * same path instead: phrase() hands back a key it does not know, so a browser
 * saying "out of memory" still says that.
 */
function refusal(key, values) {
  const error = new Error(key);
  error.values = values;
  return error;
}

/**
 * Draw a plan and hand back the encoded bytes.
 *
 * One `drawImage` does the whole job: the source rectangle is the crop, the
 * destination rectangle is where it lands on the new canvas, and a padded
 * result is simply a destination smaller than the canvas it is drawn on. There
 * is no intermediate bitmap and no second pass, which is also why a crop
 * followed by a resize costs no more quality than either on its own.
 *
 * The background is painted first whenever it could show: under a padded
 * picture, and under any format with no alpha channel. Without it, a
 * transparent PNG written as JPEG comes out with black where the transparency
 * was, which looks like a bug in the tool rather than a property of JPEG.
 *
 * @param {ImageBitmap|HTMLImageElement} source
 * @param {object} plan  from geometry.js: {source, canvas, draw, padded}
 * @param {{mime: string, quality?: number, background?: string}} options
 * @returns {Promise<Blob>}
 */
export async function render(source, plan, { mime, quality, background = '#ffffff' }) {
  const canvas = document.createElement('canvas');
  canvas.width = plan.canvas.width;
  canvas.height = plan.canvas.height;

  const opaque = !FORMATS[mime]?.alpha;
  const ctx = canvas.getContext('2d', { alpha: !opaque });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (opaque || plan.padded) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(
    source,
    plan.source.x, plan.source.y, plan.source.width, plan.source.height,
    plan.draw.x, plan.draw.y, plan.draw.width, plan.draw.height,
  );

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob) throw refusal('write.refused', { format: FORMATS[mime]?.label ?? mime });

  // Free the backing store now rather than when the collector gets round to
  // it. A batch runs one of these per image; on large photographs the
  // difference is hundreds of megabytes held for no reason.
  canvas.width = 0;
  canvas.height = 0;

  return blob;
}

/**
 * Decode a file into a bitmap.
 *
 * `createImageBitmap` is the direct route and is what every current browser
 * takes. The <img> fallback exists for the older Safari builds where the
 * function is missing or refuses a blob; it decodes the same picture through
 * the same image pipeline, just with an object URL in the middle.
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
      element.onerror = () => reject(refusal('decode.failed'));
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
