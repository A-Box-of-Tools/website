/**
 * The encoders, and what this browser will actually do.
 *
 * Everything here goes through a canvas: a decoded picture is drawn onto one
 * and the canvas is asked for a blob. That is the browser's own JPEG, PNG and
 * WebP encoder, already installed, already fast, and already running on the
 * visitor's machine - which is why this tool needs no vendored codec and no
 * network step at all.
 *
 * Two consequences, both stated on the page rather than hidden here:
 *
 *   - Re-encoding is lossy for JPEG and WebP. That is the job; the point of
 *     the search in compress.js is to spend as little of it as the target
 *     allows.
 *   - A canvas holds pixels and nothing else, so EXIF, GPS, XMP and the rest
 *     do not survive the trip. For most people that is a bonus. For anyone who
 *     wanted the metadata kept, the answer is the EXIF tool next door, not a
 *     flag here that this path cannot honour.
 */

export const JPEG = 'image/jpeg';
export const PNG = 'image/png';
export const WEBP = 'image/webp';

/** What each type is called in a sentence, and what the file should end in. */
export const FORMATS = {
  [JPEG]: { label: 'JPEG', ext: 'jpg', lossy: true },
  [PNG]: { label: 'PNG', ext: 'png', lossy: false },
  [WEBP]: { label: 'WebP', ext: 'webp', lossy: true },
};

/** Types this tool will read. Anything else is refused with a message. */
export const READABLE = [JPEG, PNG, WEBP, 'image/gif', 'image/bmp', 'image/avif'];

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
 * Draw a decoded picture at a given size and hand back the encoded bytes.
 *
 * The canvas is created per call and dropped afterwards. Reusing one across a
 * search sounds thriftier, but a canvas that has been resized has to be
 * cleared anyway, and holding a 12-megapixel bitmap alive through a dozen
 * encodes is the part that actually costs memory.
 *
 * White is painted underneath before the picture goes down, but only when the
 * target format has no alpha channel. Without it, a transparent PNG turned
 * into a JPEG comes out with black where the transparency was, which looks
 * like a bug in the tool rather than a property of JPEG.
 *
 * @param {ImageBitmap|HTMLImageElement} source
 * @param {{width: number, height: number, mime: string, quality?: number}} options
 * @returns {Promise<Blob>}
 */
export async function encode(source, { width, height, mime, quality }) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  const ctx = canvas.getContext('2d', { alpha: mime !== JPEG });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (mime === JPEG) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob) throw new Error(`This browser would not encode ${FORMATS[mime]?.label ?? mime}.`);

  // Free the backing store now rather than when the collector gets round to
  // it. A search runs a dozen of these; on a large photo the difference is
  // hundreds of megabytes held for no reason.
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
