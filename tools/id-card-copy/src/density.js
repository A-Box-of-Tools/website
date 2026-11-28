/**
 * Writing the resolution into an image file, so it can print at the card's size.
 *
 * A picture file can say how many of its pixels make an inch: a JPEG in the
 * JFIF header every encoder writes first, a PNG in a pHYs chunk. A canvas
 * writes neither usefully - the JPEG says "one to one, no unit" and the PNG
 * says nothing - so an image of a sheet that is exactly right at 300 dots per
 * inch arrives at a photo viewer as a picture of no particular size, and gets
 * printed at whatever size the viewer likes. Writing the number in is a few
 * bytes, it changes no pixel, and it is the difference between "print at 100%"
 * meaning the card's size and meaning nothing.
 *
 * It is not a promise that every program reads it. Many print dialogs scale a
 * picture to the paper by default whatever the file says, which is why the page
 * steers anybody who needs the true size to the PDF. It is still the honest
 * thing for the file to say.
 */

import { crc32 } from './shared/crc32.js';

const INCH_IN_METRES = 0.0254;

/**
 * Set the density in a JPEG's JFIF header, in place, if it has one.
 *
 * The header is the APP0 segment straight after the start-of-image marker:
 * FF D8, FF E0, a two-byte length, "JFIF\0", a two-byte version, then the unit
 * (1 is dots per inch) and the two densities as big-endian sixteen-bit numbers.
 * Every browser's canvas encoder writes one there. A file that starts any other
 * way is returned untouched rather than having bytes inserted into it, because
 * a JPEG with an unexpected first segment is better left as it came.
 *
 * @param {Uint8Array} bytes
 * @param {number} dpi
 * @returns {boolean} whether the density was written
 */
export function setJpegDensity(bytes, dpi) {
  const jfif = [0x4a, 0x46, 0x49, 0x46, 0x00];
  if (bytes.length < 20) return false;
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff || bytes[3] !== 0xe0) return false;
  for (let i = 0; i < jfif.length; i += 1) {
    if (bytes[6 + i] !== jfif[i]) return false;
  }
  const value = Math.max(1, Math.min(0xffff, Math.round(dpi)));
  bytes[13] = 1;
  bytes[14] = value >> 8;
  bytes[15] = value & 0xff;
  bytes[16] = value >> 8;
  bytes[17] = value & 0xff;
  return true;
}

/**
 * A PNG with a pHYs chunk saying its density, put straight after the header.
 *
 * The chunk counts pixels per metre rather than per inch, which is why 300 DPI
 * becomes 11811. An existing pHYs is replaced rather than joined by a second
 * one, which the specification forbids. A file that is not a PNG comes back as
 * it was.
 *
 * @param {Uint8Array} bytes
 * @param {number} dpi
 * @returns {Uint8Array}
 */
export function withPngDensity(bytes, dpi) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 33 || signature.some((byte, i) => bytes[i] !== byte)) return bytes;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks = [];
  let at = 8;
  while (at + 12 <= bytes.length) {
    const length = view.getUint32(at);
    const type = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    const end = at + 12 + length;
    if (end > bytes.length) return bytes;
    chunks.push({ type, start: at, end });
    at = end;
    if (type === 'IEND') break;
  }
  if (chunks[0]?.type !== 'IHDR') return bytes;

  const perMetre = Math.round(dpi / INCH_IN_METRES);
  const chunk = new Uint8Array(21);
  const out = new DataView(chunk.buffer);
  out.setUint32(0, 9);
  chunk.set([0x70, 0x48, 0x59, 0x73], 4);
  out.setUint32(8, perMetre);
  out.setUint32(12, perMetre);
  chunk[16] = 1;
  out.setUint32(17, crc32([chunk.subarray(4, 17)]));

  const kept = chunks.filter((entry) => entry.type !== 'pHYs');
  const parts = [bytes.subarray(0, 8), bytes.subarray(kept[0].start, kept[0].end), chunk];
  for (const entry of kept.slice(1)) parts.push(bytes.subarray(entry.start, entry.end));
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}
