/**
 * The bytes an MP4 is built out of: big-endian integers, four-character
 * types, and the box that wraps a payload in a length and a type.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/mp4-boxes.js and the
 * build copies it to <tool>/src/shared/mp4-boxes.js for the tools that ask
 * for it with `js_parts = ["mp4-boxes", ...]`. It imports nothing; the two
 * shared MP4 writers import it, so a tool that asks for `mp4-writer` or
 * `mp4-muxer` asks for this as well.
 *
 * Five files wrote these - the two writers, the cropper's own writer, and the
 * AAC description the trimmer and the reverser build for a re-encoded audio
 * track - and every one of them was the same forty lines. The functions are
 * small because the format is: an MP4 is boxes inside boxes, and a box is a
 * 32-bit length, four ASCII characters, and whatever is inside.
 */

/** The four (or however many) ASCII characters of a box type or a brand. */
export function ascii(text) {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) out[i] = text.charCodeAt(i);
  return out;
}

/** A handful of byte values as an array, for the odd fixed field. */
export function bytes(...values) {
  return new Uint8Array(values);
}

export function u16(n) {
  return new Uint8Array([(n >> 8) & 0xff, n & 0xff]);
}

export function u32(n) {
  return new Uint8Array([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
}

/** Two's complement, which is what u32 already produces for a negative number. */
export function i32(n) {
  return u32(n | 0);
}

export function zeros(n) {
  return new Uint8Array(n);
}

export function concat(parts) {
  let length = 0;
  for (const part of parts) length += part.byteLength;
  const out = new Uint8Array(length);
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.byteLength;
  }
  return out;
}

/** A plain box: size + type + payload. */
export function box(type, ...payload) {
  const body = concat(payload);
  return concat([u32(body.byteLength + 8), ascii(type), body]);
}

/** A full box: adds the version + 24-bit flags header. */
export function fullBox(type, version, flags, ...payload) {
  const header = new Uint8Array([
    version, (flags >> 16) & 0xff, (flags >> 8) & 0xff, flags & 0xff,
  ]);
  return box(type, header, ...payload);
}

/** The four characters at `at`, read back out of a file. */
export function fourcc(view, at) {
  return String.fromCharCode(
    view.getUint8(at), view.getUint8(at + 1), view.getUint8(at + 2), view.getUint8(at + 3));
}
