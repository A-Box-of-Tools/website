/**
 * Writing the picture back out, with the encoders the browser already has.
 *
 * The vendored engine on this page reads HEIC and does nothing else. Once it
 * has handed over a rectangle of pixels the job is an ordinary one, and the
 * ordinary route is the right one: a canvas, and `toBlob`. That is the same
 * JPEG encoder the rest of this site uses, already installed, already fast, and
 * already running on the visitor's own machine.
 *
 * It also means the output is a plain JPEG with nothing unusual in it. A
 * converter is judged by whether the file opens everywhere afterwards, and the
 * surest way to pass that test is to have the browser write it.
 */

export const JPEG = 'image/jpeg';
export const PNG = 'image/png';
export const WEBP = 'image/webp';

/** What each type is called in a sentence, what the file ends in, and whether
 *  re-encoding it throws anything away. */
export const FORMATS = {
  [JPEG]: { label: 'JPEG', ext: 'jpg', lossy: true },
  [PNG]: { label: 'PNG', ext: 'png', lossy: false },
  [WEBP]: { label: 'WebP', ext: 'webp', lossy: true },
};

/**
 * Ask the browser to encode a single pixel and see what comes back.
 *
 * `toBlob` does not report failure: handed a type it cannot write, a browser
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
  const found = new Set([JPEG, PNG]); // required of every browser by the HTML spec
  if (await canEncode(WEBP)) found.add(WEBP);
  return found;
}

/**
 * Encode decoded pixels.
 *
 * JPEG has no alpha channel, and a HEIC occasionally has one - a sticker, or a
 * cut-out saved from an editor. Written straight into a JPEG the transparent
 * parts come out black, which looks like a fault in the tool rather than a
 * property of the format, so the picture is composited onto white first. That
 * is a second canvas and one `drawImage`; putting the pixels onto an opaque
 * canvas directly would not do it, because `putImageData` replaces pixels
 * rather than drawing them and so composites with nothing.
 *
 * @param {{width: number, height: number, pixels: Uint8ClampedArray}} picture
 * @param {{mime: string, quality?: number}} options
 * @returns {Promise<Blob>}
 */
export async function encodePixels(picture, { mime, quality }) {
  const surface = canvas(picture.width, picture.height, true);
  surface.ctx.putImageData(
    new ImageData(picture.pixels, picture.width, picture.height), 0, 0,
  );

  let target = surface;
  if (mime === JPEG) {
    target = canvas(picture.width, picture.height, false);
    target.ctx.fillStyle = '#ffffff';
    target.ctx.fillRect(0, 0, picture.width, picture.height);
    target.ctx.drawImage(surface.el, 0, 0);
    release(surface.el);
  }

  const blob = await new Promise((resolve) => target.el.toBlob(resolve, mime, quality));
  release(target.el);

  // A key and its blank; main.js resolves them. This file is copied byte for
  // byte into fifteen languages.
  if (!blob) throw said('codec.nowrite', { format: FORMATS[mime]?.label ?? mime });
  return blob;
}

/** An error whose message is a phrase key; the caller resolves it. */
const said = (key, values = {}) => Object.assign(new Error(key), { values });

function canvas(width, height, alpha) {
  const el = document.createElement('canvas');
  el.width = width;
  el.height = height;
  return { el, ctx: el.getContext('2d', { alpha }) };
}

/** Free the backing store now rather than when the collector gets round to it.
 *  On a 48-megapixel photo each of these is nearly 200 MB. */
function release(el) {
  el.width = 0;
  el.height = 0;
}
