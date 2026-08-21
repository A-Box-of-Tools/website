/**
 * What kind of picture this actually is, read from the file rather than from
 * its name.
 *
 * A data URI carries its own media type, and the browser believes it. Get it
 * wrong and the picture does not render - there is no sniffing fallback and no
 * error in the console worth reading, just a broken image icon in a page that
 * was fine a minute ago. So the type has to be right, and the two places it
 * could come from are both unreliable:
 *
 *   the extension - a .png that somebody exported as a JPEG and renamed is
 *   common enough that every image tool has to cope with it;
 *
 *   file.type - the browser's own guess, which on Windows comes out of the
 *   registry, is empty for anything unregistered, and is wrong for SVG often
 *   enough to matter.
 *
 * The first few bytes of an image file say what it is, unambiguously, in every
 * format here. That is what this reads.
 */

const utf8 = new TextDecoder('utf-8');

/** ASCII at an offset, for the four-character tags these formats are full of. */
function tag(bytes, at, length = 4) {
  let out = '';
  for (let i = 0; i < length; i += 1) out += String.fromCharCode(bytes[at + i] ?? 0);
  return out;
}

const starts = (bytes, ...values) => values.every((v, i) => bytes[i] === v);

/**
 * ISO base media files - AVIF, HEIC and the rest - all begin with an `ftyp`
 * box and differ only in the brands inside it. The major brand is at 8, and
 * the compatible brands follow from 16 in four-byte runs; a file written by a
 * phone often has a generic major brand and the useful one further down.
 */
function brands(bytes) {
  if (bytes.length < 12 || tag(bytes, 4) !== 'ftyp') return [];
  const declared = (bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3]) >>> 0;
  // The box says how long it is; the caller may only have handed over the head
  // of the file. Whichever is shorter is what can actually be read.
  const size = Math.min(declared, bytes.length);
  const found = [tag(bytes, 8)];
  for (let at = 16; at + 4 <= size; at += 4) found.push(tag(bytes, at));
  return found;
}

/**
 * Formats a browser will not draw, and the reason it is worth saying so on the
 * page rather than letting the preview fail silently. Both of these arrive
 * regularly - HEIC is what an iPhone photographs in, and TIFF is what a
 * scanner produces - and both make a data URI that is perfectly well-formed
 * and renders nowhere.
 */
const UNRENDERABLE = 'No browser except Safari draws this format, so the URI will be valid and the picture will not appear. Convert it first.';

const TESTS = [
  (b) => starts(b, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
    && { mime: 'image/png', label: 'PNG' },

  (b) => starts(b, 0xff, 0xd8, 0xff)
    && { mime: 'image/jpeg', label: 'JPEG' },

  (b) => (tag(b, 0, 6) === 'GIF87a' || tag(b, 0, 6) === 'GIF89a')
    && { mime: 'image/gif', label: 'GIF' },

  (b) => tag(b, 0) === 'RIFF' && tag(b, 8) === 'WEBP'
    && { mime: 'image/webp', label: 'WebP' },

  (b) => starts(b, 0x42, 0x4d)
    && { mime: 'image/bmp', label: 'BMP' },

  // 0, 0, then 1 for an icon or 2 for a cursor, then the image count.
  (b) => starts(b, 0x00, 0x00, 0x01, 0x00)
    && { mime: 'image/x-icon', label: 'ICO' },

  (b) => brands(b).some((brand) => brand === 'avif' || brand === 'avis')
    && { mime: 'image/avif', label: 'AVIF' },

  (b) => brands(b).some((brand) => /^(heic|heix|hevc|hevx|mif1|msf1)$/.test(brand))
    && { mime: 'image/heic', label: 'HEIC', note: UNRENDERABLE },

  // The bare codestream, and the container Apple and others write.
  (b) => (starts(b, 0xff, 0x0a)
    || starts(b, 0x00, 0x00, 0x00, 0x0c, 0x4a, 0x58, 0x4c, 0x20, 0x0d, 0x0a, 0x87, 0x0a))
    && { mime: 'image/jxl', label: 'JPEG XL' },

  (b) => (starts(b, 0x49, 0x49, 0x2a, 0x00) || starts(b, 0x4d, 0x4d, 0x00, 0x2a))
    && { mime: 'image/tiff', label: 'TIFF', note: UNRENDERABLE },

  (b) => looksLikeSvg(b) && { mime: 'image/svg+xml', label: 'SVG' },
];

/**
 * SVG is the one format with no magic number, because it is XML - so this
 * reads the head of the file as text and looks for the root element past
 * whatever a drawing program left in front of it: a byte-order mark, an XML
 * declaration, a doctype, and comments, in any order and any number.
 *
 * A kilobyte is enough. Inkscape's preamble is the longest anything writes,
 * and it is nowhere near that.
 */
export function looksLikeSvg(bytes) {
  let head = utf8.decode(bytes.subarray(0, 1024));
  if (head.charCodeAt(0) === 0xfeff) head = head.slice(1);

  for (let guard = 0; guard < 32; guard += 1) {
    head = head.trimStart();
    if (head.startsWith('<svg')) return true;
    if (head.startsWith('<!--')) {
      const end = head.indexOf('-->');
      if (end < 0) return false;
      head = head.slice(end + 3);
      continue;
    }
    if (head.startsWith('<?') || head.startsWith('<!')) {
      const end = head.indexOf('>');
      if (end < 0) return false;
      head = head.slice(end + 1);
      continue;
    }
    return false;
  }
  return false;
}

/**
 * @param {Uint8Array} bytes the start of the file; 1 KB is plenty
 * @returns {{mime: string, label: string, note?: string}|null} null when
 *   nothing recognised it, which is a refusal rather than a guess: writing
 *   `image/png` over something that is not one produces a URI that fails in
 *   the visitor's page rather than in this one.
 */
export function sniff(bytes) {
  for (const test of TESTS) {
    const hit = test(bytes);
    if (hit) return hit;
  }
  return null;
}

/** What the file is called says it is. Only ever used to disagree with the
 *  bytes out loud, never to override them. */
export function extensionType(name) {
  const ext = /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase();
  return ext ? EXTENSIONS[ext] ?? null : null;
}

const EXTENSIONS = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jpe: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  cur: 'image/x-icon',
  avif: 'image/avif',
  heic: 'image/heic',
  heif: 'image/heic',
  jxl: 'image/jxl',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  svg: 'image/svg+xml',
};
