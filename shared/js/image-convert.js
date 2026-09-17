/**
 * Reading one still picture format and writing another, with the browser's
 * own codecs and nothing else.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/image-convert.js and
 * the build copies it to <tool>/src/shared/image-convert.js for the tools that
 * ask for it with `js_parts = ["image-convert", ...]`: the three format
 * converters, which are the same three steps - identify, decode, encode - with
 * a different pair of formats at each end. It imports nothing.
 *
 * WHY NO CODEC SHIPS WITH IT
 *
 * Every format these tools read, the browser already decodes: WebP since 2020
 * on all four engines, AVIF since 2023, PNG and JPEG since always. Every
 * format they write, a canvas already encodes. So unlike heic-to-jpg - which
 * carries libheif because HEIC is the one format no browser but Safari will
 * open - there is nothing here to vendor, nothing to download on first use,
 * and nothing to fetch. That is worth stating rather than assuming: a
 * converter that needed an engine would be a converter with a reason to talk
 * to a server.
 *
 * WHAT toBlob DOES NOT TELL YOU
 *
 * `canvas.toBlob` never reports that it could not write a format. Asked for
 * one it does not know, it quietly hands back a PNG with the wrong type on the
 * blob, which is worse than refusing: the file is named .avif or .webp and is
 * not one. So `canEncode` below encodes a single pixel and looks at the type
 * of what comes back, and `encode` checks the type of every real result too.
 * Nothing here trusts the call to have done what it was asked.
 *
 * A file is identified by its first bytes and never by its name. A WebP that
 * arrived called ".jpg" is one of the commonest reasons somebody is looking
 * for a converter, and the extension is whatever the last app to touch the
 * file decided to call it.
 */

export const JPEG = 'image/jpeg';
export const PNG = 'image/png';
export const WEBP = 'image/webp';
export const AVIF = 'image/avif';
export const GIF = 'image/gif';
export const BMP = 'image/bmp';

/** What each type is called in a sentence, and what the file should end in. */
export const FORMATS = {
  [JPEG]: { label: 'JPEG', ext: 'jpg', alpha: false, lossy: true },
  [PNG]: { label: 'PNG', ext: 'png', alpha: true, lossy: false },
  [WEBP]: { label: 'WebP', ext: 'webp', alpha: true, lossy: true },
  [AVIF]: { label: 'AVIF', ext: 'avif', alpha: true, lossy: true },
  [GIF]: { label: 'GIF', ext: 'gif', alpha: true, lossy: false },
  [BMP]: { label: 'BMP', ext: 'bmp', alpha: false, lossy: false },
};

/**
 * An error whose message is the key of a phrase rather than a sentence.
 *
 * This module cannot reach the page - the tests import it straight off the
 * disk, with no document around it - so a failure carries the key of a phrase
 * and the blanks to fill it with, and main.js, which can reach the page, puts
 * it through phrase(). phrase() hands back anything it does not recognise, so
 * a real message from the browser still arrives intact.
 */
function saying(key, values) {
  const error = new Error(key);
  error.values = values;
  return error;
}

const ascii = (bytes, at, text) => text
  .split('')
  .every((ch, index) => bytes[at + index] === ch.charCodeAt(0));

/**
 * What a file actually is, read from its first bytes.
 *
 * Only the formats a browser decodes are listed, because a format nobody here
 * can open is not usefully told apart from a format nobody here has heard of:
 * both are refused with the same sentence. `null` means neither.
 *
 * @param {Uint8Array} bytes  the head of the file; 64 bytes is plenty
 * @returns {string|null} the MIME type, or null
 */
export function sniff(bytes) {
  if (!bytes || bytes.length < 12) return null;

  if (bytes[0] === 0x89 && ascii(bytes, 1, 'PNG')) return PNG;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return JPEG;
  if (ascii(bytes, 0, 'GIF8')) return GIF;
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) return BMP;
  if (ascii(bytes, 0, 'RIFF') && ascii(bytes, 8, 'WEBP')) return WEBP;

  // AVIF is an ISO base media file: a 'ftyp' box whose brand list holds one of
  // the AVIF brands. 'avis' is the image-sequence brand, which decodes to its
  // first picture like any other still.
  if (ascii(bytes, 4, 'ftyp')) {
    const end = Math.min(bytes.length, 64);
    for (let at = 8; at + 4 <= end; at += 4) {
      if (ascii(bytes, at, 'avif') || ascii(bytes, at, 'avis')) return AVIF;
    }
  }

  return null;
}

/**
 * Walk a RIFF chunk list.
 *
 * WebP is RIFF, and everything worth knowing about one before it is decoded -
 * whether it is animated, whether it has an alpha channel, whether the pixels
 * are stored losslessly - is which chunks are present rather than what is
 * inside them. That is a dozen lines and no decoder.
 *
 * @param {Uint8Array} bytes
 * @returns {{type: string, size: number}[]}
 */
export function riffChunks(bytes) {
  const chunks = [];
  if (!bytes || bytes.length < 12 || !ascii(bytes, 0, 'RIFF')) return chunks;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let at = 12;
  while (at + 8 <= bytes.length) {
    const type = String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
    const size = view.getUint32(at + 4, true);
    chunks.push({ type, size });
    // Chunks are padded to an even length and the pad byte is not counted in
    // the size. Forgetting it walks into the middle of the next header.
    at += 8 + size + (size & 1);
  }
  return chunks;
}

/**
 * What a WebP holds, without decoding it.
 *
 * `lossless` is read from the chunk carrying the pixels: VP8L is the lossless
 * coding and `VP8 ` the lossy one.
 *
 * This wants the WHOLE file, not a head of it. The pixel chunk is the last one
 * in the file and the chunks in front of it are not small - a colour profile
 * runs to hundreds of bytes and an alpha plane to thousands - so a caller that
 * hands over the first 64 bytes gets `lossless: false` for a lossless file,
 * because the walk never reached the chunk that would have said otherwise.
 * `webpPixelChunk` below is the cheap way to ask that one question.
 *
 * @param {Uint8Array} bytes  the whole file
 * @returns {{animated: boolean, alpha: boolean, lossless: boolean}}
 */
export function webpFacts(bytes) {
  const chunks = riffChunks(bytes);
  const has = (type) => chunks.some((chunk) => chunk.type === type);
  // The VP8X flag byte is the first of that chunk's payload, and the chunk is
  // always the first in the file when it is present at all.
  const extended = chunks.length > 0 && chunks[0].type === 'VP8X';

  return {
    animated: has('ANIM') || has('ANMF'),
    // A lossless still can carry alpha inside VP8L with neither the flag nor
    // an ALPH chunk present. The two below are what can be read without a
    // decoder, and a false negative costs only an offered background colour.
    alpha: has('ALPH') || Boolean(extended && (bytes[20] & 0x10)),
    lossless: has('VP8L'),
  };
}

/**
 * Ask the browser to encode a single pixel and see what comes back.
 *
 * The only reliable test, because `toBlob` does not report failure. One pixel
 * costs nothing, and the answer is cached by the caller rather than here.
 *
 * @param {string} mime
 * @returns {Promise<boolean>}
 */
export async function canEncode(mime) {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.8));
  return Boolean(blob) && blob.type === mime;
}

/**
 * Whether this browser decodes a format.
 *
 * `ImageDecoder.isTypeSupported` answers directly where it exists. Where it
 * does not, the caller's sample is opened instead: there is no way to ask an
 * <img> a question without giving it something to open.
 *
 * @param {string} mime
 * @param {Uint8Array} [sample]  a small valid file of that type, for the
 *   browsers with no ImageDecoder
 * @returns {Promise<boolean>}
 */
export async function canDecode(mime, sample) {
  if (typeof ImageDecoder !== 'undefined' && ImageDecoder.isTypeSupported) {
    try {
      return await ImageDecoder.isTypeSupported(mime);
    } catch {
      // Fall through to the sample: a browser that throws here has said
      // nothing about whether it can open the format.
    }
  }

  if (!sample) return true;
  try {
    const bitmap = await createImageBitmap(new Blob([sample], { type: mime }));
    release(bitmap);
    return true;
  } catch {
    return false;
  }
}

/**
 * Decode a file into something drawable.
 *
 * `imageOrientation: 'from-image'` applies the EXIF rotation, so a portrait
 * photograph does not come out on its side. An animated WebP decodes to its
 * first frame, which is the only thing a still format could be given.
 *
 * @param {Blob} file
 * @returns {Promise<{bitmap: ImageBitmap|HTMLImageElement, width: number, height: number}>}
 */
export async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // Fall through: some builds reject a blob their <img> tag accepts.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(saying('error.decode'));
      element.src = url;
    });
    return { bitmap: img, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Whether a decoded picture has anything see-through in it.
 *
 * Worth knowing because it decides whether a background colour is a question
 * worth asking, and because the PNG converter words its "lossless" claim
 * differently for a file that has transparency in it. The alpha channel is
 * read back from a canvas rather than assumed from the format: a PNG is
 * perfectly capable of carrying an alpha channel that is opaque corner to
 * corner, and offering a matte colour for one is a control that does nothing.
 *
 * WHY THIS IS EXACT AND NOT SAMPLED
 *
 * It used to draw the picture into a 256-pixel box and look at that, on the
 * reasoning that transparency in a real picture is never one stray pixel. That
 * is true and it was still wrong, because scaling *averages*: 2,560 pixels at
 * alpha 215 in a 1.2-megapixel photograph, thinly spread, round back to 255
 * against their solid neighbours and the picture reports as opaque. Worse, it
 * did not even fail consistently - the same file answered `false` decoded
 * through `createImageBitmap` and `true` decoded through an <img>, because the
 * two hand the scaler subtly different surfaces. An answer that depends on
 * which decode path the caller happened to take is not an answer.
 *
 * So the alpha channel is walked at full size. The bands keep a large
 * photograph from needing a second whole copy of itself in memory beside the
 * canvas, and the early exit means a picture that really is transparent
 * usually stops in the first band.
 *
 * @param {ImageBitmap|HTMLImageElement} bitmap
 * @param {number} width
 * @param {number} height
 * @returns {boolean}
 */
export function hasAlpha(bitmap, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);

  // About a megapixel a band, whatever shape the picture is.
  const band = Math.max(1, Math.floor(1048576 / canvas.width));
  let found = false;

  for (let top = 0; top < canvas.height && !found; top += band) {
    const rows = Math.min(band, canvas.height - top);
    const { data } = ctx.getImageData(0, top, canvas.width, rows);
    for (let at = 3; at < data.length; at += 4) {
      if (data[at] !== 255) {
        found = true;
        break;
      }
    }
  }

  canvas.width = 0;
  canvas.height = 0;
  return found;
}

/**
 * Draw a decoded picture and hand back the encoded bytes.
 *
 * `background` is painted underneath before the picture goes down. For a
 * format with no alpha channel it is not optional and the caller cannot turn
 * it off: without it the see-through parts of a PNG or a WebP come out black
 * in the JPEG, which reads as a bug in the tool rather than as a property of
 * JPEG.
 *
 * @param {ImageBitmap|HTMLImageElement} source
 * @param {{width: number, height: number, mime: string, quality?: number, background?: string}} options
 * @returns {Promise<Blob>}
 */
export async function encode(source, {
  width, height, mime, quality, background,
}) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  const opaque = !FORMATS[mime]?.alpha;
  const ctx = canvas.getContext('2d', { alpha: !opaque });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (opaque || background) {
    ctx.fillStyle = background || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality));

  // Free the backing store now rather than when the collector gets round to
  // it. A batch runs one of these per file, and on large photographs the
  // difference is hundreds of megabytes held for no reason.
  canvas.width = 0;
  canvas.height = 0;

  if (!blob) throw saying('error.encode', { format: FORMATS[mime]?.label ?? mime });
  // The type is checked rather than the call: see the note at the top of this
  // file. A browser that cannot write this format has just handed back a PNG,
  // and shipping that under the asked-for extension is the one outcome worse
  // than refusing.
  if (blob.type !== mime) {
    throw saying('error.wrongtype', { format: FORMATS[mime]?.label ?? mime });
  }

  return blob;
}

/**
 * Which chunk a WebP keeps its pixels in, read without holding the file.
 *
 * Walks the chunk list eight bytes at a time - a type and a length - and skips
 * over each payload rather than reading it. A WebP off this site's encoder
 * carries a colour profile and sometimes an alpha plane in front of the
 * pixels, so the answer can be several kilobytes in; reading that far to learn
 * four characters would mean copying the whole file for every result in a
 * batch.
 *
 * @param {Blob} blob
 * @returns {Promise<string|null>} 'VP8L', 'VP8 ', or null if neither is there
 */
export async function webpPixelChunk(blob) {
  let at = 12;
  while (at + 8 <= blob.size) {
    const header = new Uint8Array(await blob.slice(at, at + 8).arrayBuffer());
    const type = String.fromCharCode(header[0], header[1], header[2], header[3]);
    const size = new DataView(header.buffer).getUint32(4, true);
    if (type === 'VP8L' || type === 'VP8 ') return type;
    // An ANMF payload holds its frame's own chunks, so an animation would need
    // a descent rather than a skip. Nothing here writes one, and a still is
    // flat, so the skip is right for every file this module produces.
    at += 8 + size + (size & 1);
  }
  return null;
}

/**
 * Write a WebP, losslessly or not, and report which one actually happened.
 *
 * Chromium switches to the lossless coding at quality 1.0 exactly and uses the
 * lossy one below it, which is how a lossless WebP gets written from a canvas
 * at all - `toBlob` has no separate flag for it. That is the behaviour of one
 * engine rather than anything the HTML specification promises, so the bytes
 * are read back and the caller is told what is in them rather than what was
 * asked for.
 *
 * @param {ImageBitmap|HTMLImageElement} source
 * @param {{width: number, height: number, lossless: boolean, quality?: number}} options
 * @returns {Promise<{blob: Blob, lossless: boolean}>}
 */
export async function encodeWebp(source, {
  width, height, lossless, quality,
}) {
  const blob = await encode(source, {
    width,
    height,
    mime: WEBP,
    quality: lossless ? 1 : quality,
  });

  return { blob, lossless: (await webpPixelChunk(blob)) === 'VP8L' };
}

/** Bitmaps hold real memory and are not collected promptly. Let them go. */
export function release(bitmap) {
  if (bitmap && typeof bitmap.close === 'function') bitmap.close();
}

/**
 * What the converted file should be called.
 *
 * The original extension is dropped rather than kept alongside the new one:
 * "holiday.webp.jpg" is tidy in a listing and unopenable on half the phones
 * that meet it. A file with no extension at all keeps its whole name.
 *
 * @param {string} name
 * @param {string} ext
 * @returns {string}
 */
export function outName(name, ext) {
  const stem = name.replace(/\.[^./\\]+$/, '') || 'image';
  return `${stem}.${ext}`;
}

/**
 * Make every name in a batch distinct.
 *
 * Two files called the same thing in two folders are one row each here, and
 * would otherwise be one entry in the zip: the second silently replaces the
 * first in most unzippers. The suffix goes before the extension, where a
 * person expects to find it.
 *
 * @param {string[]} names
 * @returns {string[]}
 */
export function uniqueNames(names) {
  const seen = new Map();
  return names.map((name) => {
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    if (count === 0) return name;

    const dot = name.lastIndexOf('.');
    const stem = dot === -1 ? name : name.slice(0, dot);
    const tail = dot === -1 ? '' : name.slice(dot);
    return `${stem}-${count + 1}${tail}`;
  });
}

/**
 * How much smaller the new file is.
 *
 * @param {number} before
 * @param {number} after
 * @returns {{key: string, values?: Record<string, number>}|null}
 */
export function change(before, after) {
  if (!before) return null;
  const delta = Math.round(((before - after) / before) * 100);
  if (delta === 0) return { key: 'change.same' };
  return delta > 0
    ? { key: 'change.smaller', values: { percent: delta } }
    : { key: 'change.larger', values: { percent: -delta } };
}
