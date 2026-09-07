/**
 * Fixtures: the smallest real JPEG, PNG, WebP and TIFF blocks that the parsers
 * under test will accept.
 *
 * Built here rather than checked in as binary files, so that a reader can see
 * exactly what is in each one and why. Where a fixture is meant to pin a
 * parser's behaviour rather than exercise a round trip, the bytes are written
 * out by hand and commented field by field - see TIFF_LE below.
 */

import { crc32 } from '../../shared/js/crc32.js';

/**
 * Join byte runs. A part may be a Uint8Array, a plain array of byte values, or
 * an array of parts - so a fixture can be written as a list of chunks without
 * every call site having to say which of the three it meant.
 */
export const concat = (...parts) => {
  const runs = parts.map(asBytes);
  const out = new Uint8Array(runs.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const run of runs) {
    out.set(run, at);
    at += run.length;
  }
  return out;
};

function asBytes(part) {
  if (part instanceof Uint8Array) return part;
  if (!Array.isArray(part)) throw new TypeError(`not a byte run: ${part}`);
  return part.every((v) => typeof v === 'number')
    ? new Uint8Array(part)
    : concat(...part);
}

export const ascii = (text) => {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) out[i] = text.charCodeAt(i) & 0xff;
  return out;
};

export const u16be = (n) => new Uint8Array([(n >> 8) & 0xff, n & 0xff]);
export const u32be = (n) => new Uint8Array([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
export const u32le = (n) => new Uint8Array([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);

/* ------------------------------------------------------------------- JPEG */

/** One JPEG segment: 0xFF, the marker, a two-byte length, the payload. */
export const segment = (marker, payload) =>
  concat([0xff, marker], u16be(payload.length + 2), payload);

/**
 * A JPEG that `jpeg.read` will accept: SOI, the segments given, then a scan.
 *
 * The scan is never parsed and never rewritten, only copied, which is the
 * property that lets this tool strip metadata without touching a pixel - so
 * the fixture's scan is arbitrary bytes and the tests check they come back.
 */
export const jpeg = (segments = [], scan = ascii('SCANDATA')) =>
  concat([0xff, 0xd8], segments, [0xff, 0xda], u16be(scan.length + 2), scan);

export const EXIF_ID = ascii('Exif\0\0');
export const XMP_ID = ascii('http://ns.adobe.com/xap/1.0/\0');
export const JFIF_SEGMENT = segment(0xe0, concat(ascii('JFIF\0'), [1, 2, 0, 0, 1, 0, 1, 0, 0]));

/* -------------------------------------------------------------------- PNG */

export const PNG_SIGNATURE = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** One PNG chunk: length, type, data, and a CRC over the last two. */
export const chunk = (type, data = new Uint8Array(0)) => {
  const name = ascii(type);
  return concat(u32be(data.length), name, data, u32be(crc32([name, data])));
};

/** IHDR for a 1x1 8-bit truecolour image. */
export const IHDR = chunk('IHDR', concat(u32be(1), u32be(1), [8, 2, 0, 0, 0]));
export const IDAT = chunk('IDAT', ascii('not really deflate'));
export const IEND = chunk('IEND');

export const png = (middle = []) => concat(PNG_SIGNATURE, IHDR, middle, IDAT, IEND);

/** A tEXt chunk: keyword, NUL, Latin-1 text. */
export const textChunk = (keyword, value) =>
  chunk('tEXt', concat(ascii(keyword), [0], ascii(value)));

/** Deflate, so a zTXt fixture is genuinely compressed rather than pretending. */
export async function deflate(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/* ------------------------------------------------------------------- WebP */

export const webpChunk = (fourcc, data) => {
  const body = concat(ascii(fourcc.padEnd(4, ' ')), u32le(data.length), data);
  return data.length % 2 ? concat(body, [0]) : body;
};

export const webp = (chunks) => {
  const body = concat(ascii('WEBP'), chunks);
  return concat(ascii('RIFF'), u32le(body.length), body);
};

/** A VP8 bitstream chunk. Its contents are never parsed by this tool. */
export const VP8_CHUNK = webpChunk('VP8 ', ascii('bitstream'));

/** A VP8X header for a 16x16 canvas, with the flag byte given. */
export const vp8xChunk = (flags = 0) => {
  const data = new Uint8Array(10);
  data[0] = flags;
  data[4] = 15; // width - 1, 24-bit little-endian
  data[7] = 15; // height - 1
  return webpChunk('VP8X', data);
};

/* ------------------------------------------------------------------- TIFF */

/**
 * A little-endian EXIF block, written out by hand.
 *
 * Two tags in IFD0 and nothing else. One value is short enough to sit inside
 * its own entry and one is not, which is the only awkward part of the format
 * and the reason writing has to be a rebuild rather than a patch.
 *
 *   00  49 49 2a 00        "II", then 42: little-endian TIFF
 *   04  08 00 00 00        IFD0 begins at byte 8
 *   08  02 00              two entries
 *   0a  0f 01 02 00 ...    tag 0x010f (Make), ASCII, 5 bytes, at offset 38
 *   16  12 01 03 00 ...    tag 0x0112 (Orientation), SHORT, 1, value 6 inline
 *   22  00 00 00 00        no IFD1
 *   26  41 63 6d 65 00     "Acme\0"
 */
export const TIFF_LE = new Uint8Array([
  0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
  0x02, 0x00,
  0x0f, 0x01, 0x02, 0x00, 0x05, 0x00, 0x00, 0x00, 0x26, 0x00, 0x00, 0x00,
  0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0x41, 0x63, 0x6d, 0x65, 0x00,
]);

/** The same two tags, big-endian. Cameras write both. */
export const TIFF_BE = new Uint8Array([
  0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08,
  0x00, 0x02,
  0x01, 0x0f, 0x00, 0x02, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x26,
  0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x06, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0x41, 0x63, 0x6d, 0x65, 0x00,
]);

export const TIFF_TYPE = { ASCII: 2, SHORT: 3, LONG: 4, UNDEFINED: 7 };
const TIFF_WIDTHS = { 2: 1, 3: 2, 4: 4, 7: 1 };

/**
 * Lay out a TIFF: a header, a run of directories, then the data too long to sit
 * inside an entry.
 *
 * An entry's value is a number when it fits in the four bytes the entry has,
 * and an offset into the data area when it does not. That indirection is the
 * only awkward part of the format and it is the part worth exercising, so the
 * fixtures built on this deliberately use both.
 *
 * `dirs` is a list of `{ entries, next }`. An entry's value may be a plain
 * number, `{ blob: i }` for the offset of a data block, or `{ dir: i }` for the
 * offset of another directory.
 */
export function tiffOf({ little = true, magic = 42, dirs, blobs = [] }) {
  const dirSizes = dirs.map((dir) => 2 + dir.entries.length * 12 + 4);
  const dirAt = [];
  let at = 8;
  for (const size of dirSizes) { dirAt.push(at); at += size; }

  const blobAt = [];
  for (const blob of blobs) { blobAt.push(at); at += blob.length; }

  const out = new Uint8Array(at);
  const view = new DataView(out.buffer);
  const resolve = (value) => {
    if (typeof value === 'number') return value;
    if (value.blob !== undefined) return blobAt[value.blob];
    return dirAt[value.dir];
  };

  out.set(ascii(little ? 'II' : 'MM'), 0);
  view.setUint16(2, magic, little);
  view.setUint32(4, dirAt[0], little);

  dirs.forEach((dir, index) => {
    let cursor = dirAt[index];
    view.setUint16(cursor, dir.entries.length, little);
    cursor += 2;
    for (const entry of dir.entries) {
      view.setUint16(cursor, entry.tag, little);
      view.setUint16(cursor + 2, entry.type, little);
      view.setUint32(cursor + 4, entry.count, little);
      const needed = TIFF_WIDTHS[entry.type] * entry.count;
      if (needed <= 4) {
        // Left-justified inside the entry, whichever way round the file is.
        if (entry.type === TIFF_TYPE.SHORT) view.setUint16(cursor + 8, resolve(entry.value), little);
        else view.setUint32(cursor + 8, resolve(entry.value), little);
      } else {
        view.setUint32(cursor + 8, resolve(entry.value), little);
      }
      cursor += 12;
    }
    view.setUint32(cursor, dir.next === undefined ? 0 : dirAt[dir.next], little);
  });

  blobs.forEach((blob, index) => out.set(blob, blobAt[index]));
  return out;
}

export const tiffEntry = (tag, type, count, value) => ({ tag, type, count, value });

/** Read a Blob back as bytes, which is how every writer here hands over. */
export async function blobBytes(blob) {
  return new Uint8Array(await blob.arrayBuffer());
}

/** Find the offset of a byte pattern, or -1. */
export function indexOfBytes(haystack, needle) {
  outer: for (let i = 0; i + needle.length <= haystack.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}
