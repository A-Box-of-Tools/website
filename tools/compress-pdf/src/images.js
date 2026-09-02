/**
 * The pictures: getting them out, and putting smaller ones back.
 *
 * This is where the megabytes are. In a scanned document it is where all of
 * them are - the text, the fonts and the structure of a fifty-page scan add up
 * to a few kilobytes against fifty full-page photographs - and in a report full
 * of screenshots it is most of them.
 *
 * Two ways in, and the split matters:
 *
 *   - **A JPEG already.** /DCTDecode means the stream *is* a JPEG, so it is
 *     handed to the browser as a blob and decoded by the same code that decodes
 *     one in an <img>. Nothing is written here to do it. This is the mirror
 *     image of the trick images-to-pdf plays going the other way.
 *   - **Raw samples.** Flate, LZW or run-length over the pixels themselves.
 *     Those have to be unpacked by hand, because "the pixels themselves" means
 *     one to sixteen bits per component in whatever colour space the document
 *     felt like, and no browser API takes that.
 *
 * And several ways to be turned away, which are reported rather than worked
 * around, because pretending would be worse:
 *
 *   - **JPXDecode** (JPEG 2000), **JBIG2Decode** and **CCITTFaxDecode**. No
 *     browser has a decoder for any of them, and vendoring three is a different
 *     tool. A CCITT or JBIG2 scan is also usually near the smallest it can get:
 *     those are bilevel codecs, and they are very good.
 *   - **CMYK.** A four-component JPEG needs the Adobe marker read and sometimes
 *     an inverted decode array, and getting it subtly wrong turns a print job
 *     the wrong colour. Left alone.
 *   - **Anything already small.** An image under a few kilobytes cannot pay for
 *     the work, and re-encoding it would spend quality for nothing.
 */

import { decodeStream, deflate, filterNames } from './shared/pdf-filters.js';
import { isName, name, Name, PdfStream, Ref } from './shared/pdf-objects.js';

/** Under this, re-encoding cannot win enough to be worth the quality. */
const TINY = 4 * 1024;

/** Why an image was left alone. A phrase key; main.js resolves it. */
export const SKIP = {
  jpx: 'kept.jpx',
  jbig2: 'kept.jbig2',
  ccitt: 'kept.ccitt',
  cmyk: 'kept.cmyk',
  mask: 'kept.mask',
  tiny: 'kept.tiny',
  colorspace: 'kept.colorspace',
  unreadable: 'kept.unreadable',
  unused: 'kept.unused',
};

/**
 * @typedef {object} ImageEntry
 * @property {number} num object number
 * @property {PdfStream} stream
 * @property {number} width stored pixels
 * @property {number} height
 * @property {number} bytes what it costs in the file now
 * @property {string} kind 'jpeg' | 'raw'
 * @property {string} colorSpace a short label for the page
 * @property {boolean} isSMask true when another image uses this as its alpha
 * @property {string} skip '' when it can be worked on, else why not
 */

/**
 * Find every image XObject, and say what can be done with each.
 *
 * @param {import('./shared/pdf-reader.js').PdfDocument} doc
 * @returns {ImageEntry[]}
 */
export function findImages(doc) {
  /** Which picture each mask belongs to. A soft mask is never painted by a
   *  `Do` of its own - it is attached to the image it makes transparent - so
   *  this is the only way it can be given a drawn size to reason about. */
  const masks = new Map();
  const found = [];

  for (const [num, value] of doc.objects) {
    if (!(value instanceof PdfStream)) continue;
    if (!isName(doc.get(value.dict, 'Subtype'), 'Image')) continue;

    for (const key of ['SMask', 'Mask']) {
      const ref = value.dict.get(key);
      if (ref instanceof Ref) masks.set(ref.num, num);
    }

    found.push(describe(doc, num, value));
  }

  for (const entry of found) {
    if (masks.has(entry.num)) {
      entry.isSMask = true;
      entry.maskOf = masks.get(entry.num);
    }
  }

  return found.sort((a, b) => b.bytes - a.bytes);
}

function describe(doc, num, stream) {
  const { dict } = stream;
  const filters = filterNames(dict, (v) => doc.resolve(v));
  const width = Math.round(doc.get(dict, 'Width') ?? 0);
  const height = Math.round(doc.get(dict, 'Height') ?? 0);
  const bpc = doc.get(dict, 'BitsPerComponent') ?? 8;

  const entry = {
    num,
    stream,
    width,
    height,
    bytes: stream.raw.length,
    kind: filters.includes('DCTDecode') || filters.includes('DCT') ? 'jpeg' : 'raw',
    colorSpace: 'unknown',
    isSMask: false,
    maskOf: -1,
    skip: '',
  };

  if (filters.includes('JPXDecode')) entry.skip = SKIP.jpx;
  else if (filters.includes('JBIG2Decode')) entry.skip = SKIP.jbig2;
  else if (filters.includes('CCITTFaxDecode') || filters.includes('CCF')) entry.skip = SKIP.ccitt;
  else if (doc.get(dict, 'ImageMask') === true) entry.skip = SKIP.mask;
  else if (stream.raw.length < TINY) entry.skip = SKIP.tiny;
  else if (!(width > 0 && height > 0)) entry.skip = SKIP.unreadable;

  const space = colorSpaceOf(doc, doc.get(dict, 'ColorSpace'));
  entry.colorSpace = space.label;
  entry.components = space.components;
  entry.bpc = bpc;

  if (!entry.skip && space.kind === 'cmyk') entry.skip = SKIP.cmyk;
  if (!entry.skip && entry.kind === 'raw' && space.kind === 'unsupported') {
    entry.skip = SKIP.colorspace;
  }

  return entry;
}

/**
 * What a /ColorSpace entry means for unpacking samples.
 *
 * PDF has more colour spaces than this handles, and the ones left out are left
 * out on purpose: Separation and DeviceN carry a tint transform function that
 * would have to be evaluated per pixel, and Lab and CalRGB need a real colour
 * conversion. All of them are rare on the images that make a file big.
 */
function colorSpaceOf(doc, space, depth = 0) {
  if (depth > 4) return { kind: 'unsupported', label: 'nested', components: 0 };

  if (space instanceof Name) {
    switch (space.value) {
      case 'DeviceGray': case 'CalGray': case 'G':
        return { kind: 'gray', label: 'grayscale', components: 1 };
      case 'DeviceRGB': case 'CalRGB': case 'RGB':
        return { kind: 'rgb', label: 'RGB', components: 3 };
      case 'DeviceCMYK': case 'CMYK':
        return { kind: 'cmyk', label: 'CMYK', components: 4 };
      case 'Pattern':
        return { kind: 'unsupported', label: 'pattern', components: 0 };
      default:
        return { kind: 'unsupported', label: space.value, components: 0 };
    }
  }

  if (Array.isArray(space) && space.length) {
    const family = doc.resolve(space[0]);
    const label = family instanceof Name ? family.value : '';

    if (label === 'ICCBased') {
      const profile = doc.resolve(space[1]);
      const n = profile instanceof PdfStream ? doc.get(profile.dict, 'N') : 3;
      if (n === 1) return { kind: 'gray', label: 'grayscale (ICC)', components: 1 };
      if (n === 4) return { kind: 'cmyk', label: 'CMYK (ICC)', components: 4 };
      return { kind: 'rgb', label: 'RGB (ICC)', components: 3 };
    }

    if (label === 'Indexed' || label === 'I') {
      const base = colorSpaceOf(doc, doc.resolve(space[1]), depth + 1);
      const lookup = doc.resolve(space[3]);
      return {
        kind: base.kind === 'rgb' || base.kind === 'gray' ? 'indexed' : 'unsupported',
        label: `indexed ${base.label}`,
        components: 1,
        base,
        lookup,
      };
    }

    if (label === 'DeviceN' || label === 'Separation') {
      return { kind: 'unsupported', label: label.toLowerCase(), components: 0 };
    }

    return { kind: 'unsupported', label: label || 'array', components: 0 };
  }

  // No /ColorSpace at all is legal only on a stencil mask, and those are
  // skipped above. Anywhere else it means the file is damaged.
  return { kind: 'unsupported', label: 'unstated', components: 0 };
}

/* ---------------------------------------------------------------- decoding */

/**
 * Decode one image into something a canvas will draw.
 *
 * @returns {Promise<{source: CanvasImageSource, width: number, height: number}|null>}
 */
export async function decodeImage(doc, entry) {
  const { bytes, remaining } = await decodeStream(entry.stream, (v) => doc.resolve(v));

  if (remaining.length) {
    if (remaining[0] !== 'DCTDecode' && remaining[0] !== 'DCT') return null;
    if (jpegComponents(bytes) === 4) return null; // CMYK, caught earlier as well
    return decodeBlob(new Blob([bytes], { type: 'image/jpeg' }));
  }

  return decodeSamples(doc, entry, bytes);
}

async function decodeBlob(blob) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(blob);
      return { source: bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // Some Safari builds refuse a blob they would happily put in an <img>.
    }
  }

  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('kept.nodecode'));
      element.src = url;
    });
    return { source: img, width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Unpack raw samples into a canvas.
 *
 * Bits per component runs 1, 2, 4, 8 and 16, and a row is padded to a byte
 * boundary. A 1-bit grayscale scan - which is what a fax-quality page looks
 * like when it came through Flate rather than CCITT - is eight pixels to the
 * byte, and getting the row padding wrong shears the picture diagonally, which
 * is at least a very recognisable bug.
 */
async function decodeSamples(doc, entry, bytes) {
  const { width, height } = entry;
  const space = colorSpaceOf(doc, doc.get(entry.stream.dict, 'ColorSpace'));
  const bpc = entry.bpc === 16 ? 16 : (entry.bpc || 8);
  const components = space.components || 1;

  if (!(width > 0 && height > 0) || width * height > 80e6) return null;
  if (space.kind === 'unsupported' || space.kind === 'cmyk') return null;

  const palette = space.kind === 'indexed' ? await paletteBytes(doc, space) : null;
  if (space.kind === 'indexed' && !palette) return null;

  const rowBytes = Math.ceil((width * components * bpc) / 8);
  if (bytes.length < rowBytes * height) {
    // A truncated image stream. Better to leave it exactly as it is than to
    // write back a picture that is half grey.
    return null;
  }

  const rgba = new Uint8ClampedArray(width * height * 4);
  rgba.fill(255); // opaque; the alpha channel of a PDF image lives elsewhere

  // The two shapes that nearly every image in the wild has, written out as
  // their own loops. A 30-megapixel scan goes through this a hundred million
  // times, and the general path below - which has to shift bits and look up a
  // palette - is several times slower for no benefit on these.
  if (space.kind !== 'indexed' && bpc === 8 && components === 3) {
    for (let y = 0; y < height; y += 1) {
      let from = y * rowBytes;
      let to = y * width * 4;
      for (let x = 0; x < width; x += 1) {
        rgba[to] = bytes[from];
        rgba[to + 1] = bytes[from + 1];
        rgba[to + 2] = bytes[from + 2];
        from += 3;
        to += 4;
      }
    }
  } else if (space.kind !== 'indexed' && bpc === 8 && components === 1) {
    for (let y = 0; y < height; y += 1) {
      let from = y * rowBytes;
      let to = y * width * 4;
      for (let x = 0; x < width; x += 1) {
        const value = bytes[from];
        rgba[to] = value;
        rgba[to + 1] = value;
        rgba[to + 2] = value;
        from += 1;
        to += 4;
      }
    }
  } else {
    expandGeneral(bytes, rgba, {
      width, height, rowBytes, bpc, components, space, palette,
    });
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').putImageData(new ImageData(rgba, width, height), 0, 0);
  return { source: canvas, width, height };
}

/**
 * Everything else: one to sixteen bits a component, and palettes.
 *
 * A row is padded to a byte boundary, so the bit cursor is reset per row rather
 * than run continuously. Getting that wrong shears the picture diagonally,
 * which is at least a very recognisable bug.
 */
function expandGeneral(bytes, rgba, opts) {
  const { width, height, rowBytes, bpc, components, space, palette } = opts;
  const max = (1 << Math.min(bpc, 8)) - 1;
  const scale = bpc === 8 || bpc === 16 ? 1 : 255 / max;
  const baseComponents = space.kind === 'indexed'
    ? (space.base.components === 1 ? 1 : 3)
    : components;

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * rowBytes;
    let bitAt = 0;

    for (let x = 0; x < width; x += 1) {
      const out = (y * width + x) * 4;

      const sample = (index) => {
        if (bpc === 8) return bytes[rowStart + (bitAt >> 3) + index];
        // Sixteen bits a component is legal and no browser can show the extra
        // precision, so the high byte is the whole of the answer.
        if (bpc === 16) return bytes[rowStart + (bitAt >> 3) + index * 2];
        const bit = bitAt + index * bpc;
        const shift = 8 - bpc - (bit & 7);
        return (bytes[rowStart + (bit >> 3)] >> shift) & max;
      };

      if (space.kind === 'indexed') {
        const at = sample(0) * baseComponents;
        if (baseComponents === 1) {
          const grey = palette[at] ?? 0;
          rgba[out] = grey; rgba[out + 1] = grey; rgba[out + 2] = grey;
        } else {
          rgba[out] = palette[at] ?? 0;
          rgba[out + 1] = palette[at + 1] ?? 0;
          rgba[out + 2] = palette[at + 2] ?? 0;
        }
      } else if (components === 1) {
        const value = sample(0) * scale;
        rgba[out] = value; rgba[out + 1] = value; rgba[out + 2] = value;
      } else {
        rgba[out] = sample(0) * scale;
        rgba[out + 1] = sample(1) * scale;
        rgba[out + 2] = sample(2) * scale;
      }

      bitAt += components * bpc;
    }
  }
}

/** The lookup table of an /Indexed space, which is a string or a stream. */
async function paletteBytes(doc, space) {
  const lookup = space.lookup;
  if (lookup instanceof PdfStream) {
    try {
      const { bytes, remaining } = await decodeStream(lookup, (v) => doc.resolve(v));
      return remaining.length ? null : bytes;
    } catch {
      return null;
    }
  }
  if (lookup && lookup.bytes instanceof Uint8Array) return lookup.bytes;
  return null;
}

/** Component count from a JPEG's frame header: 1 grey, 3 colour, 4 CMYK. */
function jpegComponents(bytes) {
  const FRAME = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let at = 2;
  while (at + 4 <= bytes.length) {
    if (bytes[at] !== 0xff) { at += 1; continue; }
    const marker = bytes[at + 1];
    at += 2;
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (marker === 0xd9 || marker === 0xda) break;
    const length = (bytes[at] << 8) | bytes[at + 1];
    if (length < 2) break;
    if (FRAME.has(marker)) return bytes[at + 7] ?? 3;
    at += length;
  }
  return 3;
}

/* -------------------------------------------------------------- re-encoding */

/**
 * Draw a decoded image at a new size and encode it.
 *
 * The canvas is made per call and thrown away: holding a 30-megapixel backing
 * store alive across a fifty-page scan is how a browser tab ends up asking the
 * operating system for two gigabytes.
 *
 * @returns {Promise<{bytes: Uint8Array, width: number, height: number}|null>}
 */
export async function reencode(source, { width, height, quality, gray }) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // JPEG has no alpha, so anything transparent would come out black. Painting
  // white first is what makes a screenshot with rounded corners survive.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source.source, 0, 0, canvas.width, canvas.height);

  const result = gray
    ? await grayFlate(ctx, canvas.width, canvas.height)
    : await jpegBytes(canvas, quality);

  const made = result
    ? { bytes: result, width: canvas.width, height: canvas.height }
    : null;

  canvas.width = 0;
  canvas.height = 0;
  return made;
}

async function jpegBytes(canvas, quality) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) return null;
  return new Uint8Array(await blob.arrayBuffer());
}

/**
 * A soft mask, re-written as deflated grayscale rather than as a JPEG.
 *
 * An /SMask has to be DeviceGray, and a JPEG out of a canvas is three-component
 * YCbCr whatever the picture looked like. Declaring three components as
 * DeviceGray produces a file that opens and renders wrong, which is the worst
 * kind of output. So the alpha channel is written as plain 8-bit samples and
 * deflated: the saving comes from the smaller dimensions rather than from the
 * codec, which is the honest amount to claim for it.
 */
async function grayFlate(ctx, width, height) {
  const { data } = ctx.getImageData(0, 0, width, height);
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < gray.length; i += 1) {
    // The picture was drawn as opaque grey, so any channel is the value.
    gray[i] = data[i * 4];
  }
  try {
    return await deflate(gray);
  } catch {
    return null;
  }
}

/**
 * Put a smaller picture back into the document.
 *
 * The dictionary is edited rather than replaced. A PDF image carries entries
 * this tool has never heard of - optional content membership, structure
 * parents, output intents - and a new dictionary with the six keys it does know
 * about would quietly drop the rest.
 */
export function replaceImage(entry, made, { gray }) {
  const { dict } = entry.stream;

  dict.set('Width', made.width);
  dict.set('Height', made.height);
  dict.set('BitsPerComponent', 8);
  dict.set('ColorSpace', name(gray ? 'DeviceGray' : 'DeviceRGB'));
  dict.set('Filter', name(gray ? 'FlateDecode' : 'DCTDecode'));
  dict.set('Length', made.bytes.length);

  // These describe the encoding that has just been replaced. Left behind, a
  // /Decode array meant for an indexed palette would invert the new picture.
  dict.delete('DecodeParms');
  dict.delete('DP');
  dict.delete('Decode');
  dict.delete('D');

  entry.stream.raw = made.bytes;
}
