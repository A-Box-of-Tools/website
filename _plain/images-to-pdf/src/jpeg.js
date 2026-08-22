/**
 * Reading just enough of a JPEG to decide whether it can be put into the PDF
 * untouched.
 *
 * This is the interesting part of the tool. A PDF image can carry JPEG data
 * verbatim - the /DCTDecode filter means "these bytes are a JPEG, hand them to
 * the decoder" - so a photograph that is already a JPEG never has to be decoded,
 * re-compressed, and made slightly worse on the way into the document. It is
 * copied. The pixels in the PDF are the pixels in the file, bit for bit.
 *
 * Not every JPEG qualifies, which is what this file is for:
 *
 *   - PDF's DCTDecode is defined over baseline and extended sequential JPEG.
 *     A progressive JPEG is not part of that definition, and while many readers
 *     cope, "many" is not good enough for a file somebody is going to send to a
 *     printer. Those get re-encoded.
 *   - A four component JPEG is CMYK or YCCK, and getting it to display right
 *     needs an Adobe marker read and sometimes an inverted /Decode array. Rare
 *     enough from a camera or a phone that re-encoding is the honest answer.
 *   - EXIF orientation has to be read, because a passed-through JPEG carries no
 *     rotation of its own. A phone photo is very often stored sideways with a
 *     tag saying which way is up, and a reader that ignores the tag - every PDF
 *     reader, since PDF has no such tag - would show it on its side. The
 *     rotation is applied by the placement matrix instead. See layout.js.
 *   - An ICC profile is pulled out so it can be attached to the image in the
 *     PDF. Without it a Display P3 photo from a phone is shown as though its
 *     numbers were sRGB, which reads as washed out.
 */

/** Markers that introduce a frame, and what each one means for us. */
const SEQUENTIAL = new Set([0xc0, 0xc1]); // baseline, extended sequential
const FRAME = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
  0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

/**
 * @typedef {object} JpegInfo
 * @property {number} width
 * @property {number} height
 * @property {number} components 1 for grayscale, 3 for colour, 4 for CMYK
 * @property {boolean} sequential false for progressive and arithmetic coding
 * @property {number} orientation the EXIF tag, 1 when absent or unreadable
 * @property {Uint8Array|null} icc the embedded colour profile, if there is one
 */

/**
 * @param {Uint8Array} bytes
 * @returns {JpegInfo|null} null if this is not a JPEG we can read
 */
export function inspectJpeg(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const iccParts = [];
  let frame = null;
  let orientation = 1;
  let at = 2;

  while (at + 4 <= bytes.length) {
    if (bytes[at] !== 0xff) {
      // Not on a marker boundary. A JPEG may pad with 0xff bytes before a
      // marker; anything else here means the file is damaged or the scan has
      // begun, and either way there is nothing left worth reading.
      at += 1;
      continue;
    }

    const marker = bytes[at + 1];
    at += 2;
    // 0xff is a fill byte in front of the real marker, not a marker itself.
    // Step past one and look again, or the next two bytes would be read as a
    // length and a padded but valid photo would lose its copied-in path.
    if (marker === 0xff) { at -= 1; continue; }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (marker === 0xd9 || marker === 0xda) break; // end of image, or start of scan

    const length = view.getUint16(at);
    if (length < 2 || at + length > bytes.length) return null;
    const body = bytes.subarray(at + 2, at + length);

    if (FRAME.has(marker) && !frame) {
      if (body.length < 6) return null;
      frame = {
        sequential: SEQUENTIAL.has(marker),
        height: (body[1] << 8) | body[2],
        width: (body[3] << 8) | body[4],
        components: body[5],
      };
    } else if (marker === 0xe1 && startsWith(body, 'Exif\0\0')) {
      orientation = readOrientation(body.subarray(6)) ?? orientation;
    } else if (marker === 0xe2 && startsWith(body, 'ICC_PROFILE\0')) {
      // A profile larger than a marker can hold is split across several, each
      // stamped "part n of m". They arrive in order in every file anyone has
      // ever produced, but the sequence number is there, so use it.
      iccParts.push({ index: body[12], data: body.subarray(14) });
    }

    at += length;
  }

  if (!frame || !frame.width || !frame.height) return null;
  return { ...frame, orientation, icc: joinIcc(iccParts) };
}

function startsWith(bytes, prefix) {
  if (bytes.length < prefix.length) return false;
  for (let i = 0; i < prefix.length; i += 1) {
    if (bytes[i] !== prefix.charCodeAt(i)) return false;
  }
  return true;
}

function joinIcc(parts) {
  if (!parts.length) return null;
  parts.sort((a, b) => a.index - b.index);
  const total = parts.reduce((sum, part) => sum + part.data.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const part of parts) {
    out.set(part.data, at);
    at += part.data.length;
  }
  return out;
}

/**
 * Read tag 0x0112 out of the first IFD of an EXIF block.
 *
 * A TIFF header, an offset to the first directory, and a count followed by
 * twelve byte entries. Anything unexpected returns null and the caller keeps
 * the orientation it already had, because a photo shown the right way up by
 * luck is better than one thrown away over a malformed tag.
 */
function readOrientation(tiff) {
  if (tiff.length < 8) return null;
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);

  const little = tiff[0] === 0x49 && tiff[1] === 0x49;
  const big = tiff[0] === 0x4d && tiff[1] === 0x4d;
  if (!little && !big) return null;
  if (view.getUint16(2, little) !== 42) return null;

  const ifd = view.getUint32(4, little);
  if (ifd + 2 > tiff.length) return null;

  const count = view.getUint16(ifd, little);
  for (let i = 0; i < count; i += 1) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > tiff.length) return null;
    if (view.getUint16(entry, little) !== 0x0112) continue;
    const value = view.getUint16(entry + 8, little);
    return value >= 1 && value <= 8 ? value : null;
  }
  return null;
}
