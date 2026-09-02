/**
 * The decoder: libheif, compiled to WebAssembly, running here.
 *
 * WHY THERE IS AN ENGINE ON THIS PAGE AT ALL
 *
 * Every other tool on this site decodes pictures with the browser's own
 * decoders, because the browser has them. HEIC is the exception: only Safari
 * can open one, and only on Apple hardware. Everywhere else - Chrome, Firefox,
 * Edge, and Safari on a machine without the system codec - `createImageBitmap`
 * refuses the file, `<img>` shows a broken icon, and there is nothing to
 * fall back to. The picture is HEVC, which browsers will happily decode inside
 * a video and will not decode as a still.
 *
 * So the codec has to come from somewhere, and there are exactly two places it
 * can come from: a server, or this page. Every other converter picked the
 * server, which is why they all want your photos uploaded. This one carries the
 * codec instead. That is the whole trade, and it costs about 1.4 MB.
 *
 * WHAT IS VENDORED, AND WHAT IT IS ALLOWED TO DO
 *
 * `vendor/libheif.js` is libheif's own WebAssembly build, taken unmodified from
 * the `libheif-js` package - see this tool's README for the version and the
 * checksum. It is committed here rather than fetched from a CDN, because a
 * codec downloaded on demand is a codec that cannot work offline and a third
 * party in the path of every visit.
 *
 * The build with the binary embedded is the one used, rather than the smaller
 * pair of a loader and a `.wasm` file beside it. The pair would be about 140 KB
 * less to download, and it would need `connect-src 'self'` in this page's
 * Content-Security-Policy so that its loader could fetch the binary. This page
 * does not grant that, and so still makes no network request of any kind - the
 * engine arrives as a `<script>` from this origin with its own bytes inside it.
 * The 140 KB buys a policy that can be read in one line.
 *
 * The engine's loader does contain the usual fetch-and-instantiate paths that
 * every Emscripten build ships with. They are not taken, because the binary is
 * already in hand - and if something did take one, `connect-src` names Google's
 * measurement endpoints and nothing else, so the browser would refuse it. The
 * policy is the proof here, not the promise.
 */

import { said } from './shared/errors.js';

/**
 * Where the engine sits, worked out from this module's own address rather than
 * from the page's. A relative URL in a `<script>` tag resolves against the
 * document, which would break the moment this file moved.
 */
const ENGINE = new URL('../vendor/libheif.js', import.meta.url);

/** The load, started once and shared by every caller. @type {Promise|null} */
let loading = null;

/**
 * Begin loading the engine without waiting for it.
 *
 * Called the moment a HEIC lands on the page, so that the megabyte is on its
 * way while somebody is still choosing a format. Pressing "Convert" then costs
 * nothing extra in the common case, and in the uncommon one it waits for the
 * same promise this started.
 */
export function warmEngine() {
  engine().catch(() => {
    // Reported where it can be seen - at the point of use, on the page - rather
    // than as an unhandled rejection nobody reads.
  });
}

/** @returns {Promise<object>} the libheif module, loaded at most once. */
export function engine() {
  loading ??= load();
  return loading;
}

async function load() {
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = ENGINE.href;
    script.async = true;
    script.addEventListener('load', resolve, { once: true });
    // Keys rather than sentences: this file is copied byte for byte into
    // fifteen languages, and main.js is where the words live.
    script.addEventListener('error',
      () => reject(said('heif.noload')), { once: true });
    document.head.append(script);
  });

  const factory = globalThis.libheif;
  if (typeof factory !== 'function') {
    throw said('heif.nostart');
  }

  // Emscripten hands back a promise for the instantiated module. This is the
  // point where WebAssembly.instantiate runs, which is why this page's
  // script-src carries 'wasm-unsafe-eval' and no other page here does.
  return factory();
}

/**
 * Decode a HEIC into pictures.
 *
 * A HEIC usually holds one, and can hold several: a burst, or the still frames
 * of a Live Photo. All of them are returned, in the order the file lists them,
 * with the primary one flagged - the page converts every one and says so,
 * because silently handing back one picture from a file that held four is the
 * sort of helpfulness people discover months later.
 *
 * Depth maps and thumbnails are not in that list. They are auxiliary items in
 * the container rather than top-level pictures, and libheif does not offer them
 * here, which is the behaviour wanted: nobody asked for a greyscale depth map
 * called "IMG_4021-2.jpg".
 *
 * @param {Uint8Array} bytes the whole file
 * @returns {Promise<{width: number, height: number, pixels: Uint8ClampedArray,
 *                    primary: boolean}[]>}
 */
export async function decodeHeic(bytes) {
  const libheif = await engine();
  const decoder = new libheif.HeifDecoder();

  let images;
  try {
    images = decoder.decode(bytes);
  } catch (error) {
    throw said('heif.noread', { detail: error.message });
  }
  if (!images || images.length === 0) {
    throw said('heif.nopicture');
  }

  const out = [];
  try {
    for (const image of images) {
      const width = image.get_width();
      const height = image.get_height();
      if (!(width > 0 && height > 0)) {
        throw said('heif.nosize');
      }

      // The shape libheif's `display` fills in: the same fields an ImageData
      // has, which is what it was written against. A real ImageData would do
      // as well and would cost a second copy of the pixels to hand over.
      const surface = {
        width,
        height,
        data: new Uint8ClampedArray(width * height * 4),
      };

      // Synchronous work behind a callback. The whole picture is decoded
      // inside this call - there is no way to yield partway through a frame,
      // which is why the page reports progress between files and not within
      // one.
      await new Promise((resolve, reject) => {
        image.display(surface, (result) => {
          if (result) resolve();
          else reject(said('heif.nodraw'));
        });
      });

      out.push({
        width,
        height,
        pixels: surface.data,
        primary: isPrimary(image, out.length),
      });
    }
  } finally {
    // These hold memory inside the WebAssembly heap, which the JavaScript
    // collector knows nothing about. A folder of photos left unfreed is how a
    // tab ends up asking the operating system for two gigabytes.
    for (const image of images) image.free?.();
  }

  return out;
}

/**
 * Which of several pictures the file is nominally of.
 *
 * The binding has a method for this and it does not work: in the build
 * vendored here, `HeifImage.is_primary` calls a bare
 * `heif_image_handle_is_primary_image`, which is not in scope inside the
 * bundle, so it throws a ReferenceError rather than returning an answer. It is
 * called anyway, because a later build may well fix it and there is nothing to
 * lose by asking.
 *
 * The fallback is the first picture. That is certainly right for a file holding
 * one, which is very nearly all of them, and it is the best guess available for
 * a burst: the only thing riding on it is which picture the EXIF block is
 * written into, and the first is where a reader would look for it.
 */
function isPrimary(image, index) {
  try {
    return Boolean(image.is_primary());
  } catch {
    return index === 0;
  }
}
