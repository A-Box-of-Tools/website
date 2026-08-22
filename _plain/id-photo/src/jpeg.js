/**
 * The two things a canvas will not write into a JPEG, written by hand.
 *
 * A JPEG is a chain of segments: a two-byte marker, a two-byte length, and the
 * payload. Everything here walks that chain and changes exactly one link,
 * leaving every other byte - including every byte of the compressed picture -
 * where it was. Nothing is decoded and nothing is re-encoded, so neither
 * function below costs any quality at all.
 *
 * ONE: THE RESOLUTION. Every specification in specs.js states a print size in
 * millimetres and a DPI, and `canvas.toBlob` writes neither. It emits a JFIF
 * header with the density units set to 0, which means "these numbers are an
 * aspect ratio, not a resolution" - so a 413 x 531 pixel file lands in a print
 * shop's software as an image of no particular size, and their software guesses.
 * Setting units to 1 and the density to 300 makes the same pixels say "I am
 * 35 x 45 mm", which is what the whole tool is for. It is two bytes and one
 * unsigned short each way, and it is the difference between a photo that prints
 * at the right size and one that prints at whatever the shop assumed.
 *
 * TWO: THE FLOOR. Indian examination portals, the Chinese visa form and the UK
 * passport upload all state a MINIMUM file size as well as a maximum - 20 KB to
 * 50 KB, 40 to 120, 50 KB and up. A 200 x 230 photograph encoded at the highest
 * quality a browser will produce can still land under 20 KB, and then the form
 * refuses it for being too small. There is nothing to do about that by
 * compressing less, because there is no less. So `padTo` adds a comment segment
 * full of spaces.
 *
 * That deserves saying plainly rather than burying: the padding is a COM
 * segment, which is part of the JPEG standard and is skipped by every decoder
 * ever written. The picture is bit-for-bit the same picture. What changes is
 * the number of bytes in the file, which is the number the form is measuring.
 * The padding itself says so, in English, in the file - so anybody who opens it
 * in a hex editor finds an explanation rather than a mystery.
 */

const SOI = 0xd8;
const EOI = 0xd9;
const SOS = 0xda;
const APP0 = 0xe0;
const COM = 0xfe;

/** Markers that carry no length and no payload: they are two bytes and done. */
const STANDALONE = new Set([0x01, 0xd0, 0xd1, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, SOI, EOI]);

/** 'JFIF\0', the five bytes that identify an APP0 as the one worth patching. */
const JFIF = [0x4a, 0x46, 0x49, 0x46, 0x00];

export const isJpeg = (bytes) => bytes.length > 3 && bytes[0] === 0xff && bytes[1] === SOI;

/**
 * Walk the segment chain from the start of the file to the first scan.
 *
 * Only the header is walked. After SOS comes entropy-coded data, in which
 * 0xFF bytes are stuffed rather than markers, and treating that as a segment
 * chain is how a naive parser corrupts a picture it was only meant to be
 * reading. Both callers here work in the header, so the walk stops there.
 *
 * @param {Uint8Array} bytes
 * @returns {{marker: number, at: number, length: number, dataAt: number}[]}
 */
export function headerSegments(bytes) {
  const found = [];
  if (!isJpeg(bytes)) return found;

  let at = 2;
  while (at + 3 < bytes.length) {
    if (bytes[at] !== 0xff) break;
    const marker = bytes[at + 1];
    if (marker === SOS || marker === EOI) break;
    if (STANDALONE.has(marker)) {
      at += 2;
      continue;
    }
    const length = (bytes[at + 2] << 8) | bytes[at + 3];
    if (length < 2) break;
    found.push({ marker, at, length, dataAt: at + 4 });
    at += 2 + length;
  }
  return found;
}

const isJfif = (bytes, segment) => (
  segment.marker === APP0
  && segment.length >= 16
  && JFIF.every((byte, index) => bytes[segment.dataAt + index] === byte)
);

/**
 * Read the resolution a JPEG claims.
 *
 * @returns {{units: number, x: number, y: number, dpi: number|null}|null}
 *   `dpi` is null when the units field says these are an aspect ratio rather
 *   than a resolution, which is what a browser's canvas writes and is the whole
 *   reason `setDensity` exists.
 */
export function readDensity(bytes) {
  const jfif = headerSegments(bytes).find((segment) => isJfif(bytes, segment));
  if (!jfif) return null;

  const at = jfif.dataAt + 7; // 'JFIF\0' and the two version bytes
  const units = bytes[at];
  const x = (bytes[at + 1] << 8) | bytes[at + 2];
  const y = (bytes[at + 3] << 8) | bytes[at + 4];

  // 1 is dots per inch and 2 is dots per centimetre. Anything else, including
  // the 0 a canvas writes, is not a resolution.
  const dpi = units === 1 ? x : units === 2 ? Math.round(x * 2.54) : null;
  return { units, x, y, dpi };
}

/**
 * Say that this picture is to be printed at this many dots per inch.
 *
 * The JFIF segment a canvas writes is always there and always the right size,
 * so in practice this patches five bytes in place. The branch that builds a
 * segment from nothing is for the file that arrived without one - which the
 * tool never produces itself, but which somebody could hand it.
 *
 * @param {Uint8Array} bytes
 * @param {number} dpi
 * @returns {Uint8Array} a new array; the input is not modified
 */
export function setDensity(bytes, dpi) {
  const density = Math.max(1, Math.min(65535, Math.round(dpi)));
  const jfif = headerSegments(bytes).find((segment) => isJfif(bytes, segment));

  if (jfif) {
    const out = bytes.slice();
    const at = jfif.dataAt + 7;
    out[at] = 1;                       // units: dots per inch
    out[at + 1] = (density >> 8) & 0xff;
    out[at + 2] = density & 0xff;
    out[at + 3] = (density >> 8) & 0xff;
    out[at + 4] = density & 0xff;
    return out;
  }

  // A whole JFIF APP0: marker, length 16, the identifier, version 1.1, units,
  // both densities, and a zero-by-zero thumbnail.
  const segment = Uint8Array.from([
    0xff, APP0, 0x00, 0x10, ...JFIF, 0x01, 0x01, 0x01,
    (density >> 8) & 0xff, density & 0xff,
    (density >> 8) & 0xff, density & 0xff,
    0x00, 0x00,
  ]);
  return spliceIn(bytes, 2, segment);
}

/** Where a COM segment may be added: after SOI and any APPn already there. */
function commentPoint(bytes) {
  let at = 2;
  for (const segment of headerSegments(bytes)) {
    if (segment.marker >= 0xe0 && segment.marker <= 0xef) at = segment.at + 2 + segment.length;
    else break;
  }
  return at;
}

/** What the padding says, for whoever opens the file and wonders. */
const PADDING_NOTE = 'Padding added by abox.tools so this file meets the minimum '
  + 'size the form asks for. It is a JPEG comment segment: the picture itself is '
  + 'unchanged and every decoder skips these bytes. ';

/** A COM segment's payload cannot exceed this: the length field is 16 bits. */
const MAX_COMMENT = 65533;

/**
 * Grow a JPEG to at least `target` bytes without touching the picture.
 *
 * @param {Uint8Array} bytes
 * @param {number} target
 * @returns {Uint8Array} the input itself when it is already large enough
 */
export function padTo(bytes, target) {
  const needed = Math.ceil(target) - bytes.length;
  if (needed <= 0 || !isJpeg(bytes)) return bytes;

  const insertAt = commentPoint(bytes);
  const pieces = [];
  let left = needed;

  while (left > 0) {
    // Four bytes of the segment are its own marker and length, so a segment
    // that has to add n bytes to the file carries n-4 bytes of payload. Below
    // five there is no segment small enough, so the last one overshoots by a
    // byte or two and the file lands just over the floor rather than just under
    // it - which is the side of a minimum worth being on.
    const chunk = Math.min(Math.max(left - 4, 1), MAX_COMMENT);
    pieces.push(comment(chunk));
    left -= chunk + 4;
  }

  const payload = concat(pieces);
  return spliceIn(bytes, insertAt, payload);
}

/** One COM segment of exactly `size` payload bytes. */
function comment(size) {
  const out = new Uint8Array(size + 4);
  out[0] = 0xff;
  out[1] = COM;
  out[2] = ((size + 2) >> 8) & 0xff;
  out[3] = (size + 2) & 0xff;

  for (let i = 0; i < size; i += 1) {
    // The note first, then spaces. A comment segment holds arbitrary bytes;
    // spaces are used rather than zeros so the file reads as text where anybody
    // looks at it, which is the point of writing the note at all.
    out[4 + i] = i < PADDING_NOTE.length ? PADDING_NOTE.charCodeAt(i) : 0x20;
  }
  return out;
}

/** Every comment in the header, as text. Used by the tests and by nothing else. */
export function readComments(bytes) {
  return headerSegments(bytes)
    .filter((segment) => segment.marker === COM)
    .map((segment) => String.fromCharCode(
      ...bytes.slice(segment.dataAt, segment.at + 2 + segment.length),
    ));
}

function spliceIn(bytes, at, insert) {
  const out = new Uint8Array(bytes.length + insert.length);
  out.set(bytes.subarray(0, at), 0);
  out.set(insert, at);
  out.set(bytes.subarray(at), at + insert.length);
  return out;
}

function concat(pieces) {
  const total = pieces.reduce((sum, piece) => sum + piece.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const piece of pieces) {
    out.set(piece, at);
    at += piece.length;
  }
  return out;
}
