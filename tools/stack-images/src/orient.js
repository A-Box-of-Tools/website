/**
 * EXIF orientation: reading it off a JPEG, and what to do about it.
 *
 * A phone held upright writes its JPEG sideways - the rows run down the long
 * edge of the sensor - and puts a number in the Exif block saying which way to
 * turn it. The browser's decoder honours that number: createImageBitmap hands
 * back the upright picture, 3000 tall, from a file whose frame header says
 * 3000 wide. So a pipeline that reads sizes off the header and pixels off the
 * decoder is working from two different pictures, and everything it plans -
 * the output box, the thumbnail, the resize it asks the decoder for - is a
 * quarter turn out. Three portrait frames come back as one squashed landscape.
 *
 * The rule this file exists to serve is that every size the pipeline holds is
 * the size the decode will actually have. For a JPEG the browser will orient,
 * that means swapping the header's numbers here. For a RAW file's embedded
 * preview it is subtler: the preview usually carries no Exif of its own, the
 * orientation lives in the RAW's IFD0 where the decoder never looks, and so
 * the pipeline has to turn that frame itself. `orientationMatrix` is that turn.
 *
 * THE CONVENTION
 *
 * An EXIF orientation says how the stored rows relate to the scene. Value 6 -
 * the common one, a phone or a camera held upright - means the stored image's
 * row 0 runs down the *right-hand* side of the scene: to display it, turn the
 * decode a quarter turn clockwise. `orientationMatrix` returns, for each value,
 * the 2D matrix that takes an UNORIENTED decode to its upright form when
 * applied about the image's centre, in canvas terms (y down, setTransform
 * order [a, b, c, d]). tests/js/stack-images-orient.test.js pins each of the
 * eight by mapping the corners, because a wrong sign here does not throw: it
 * produces a stack of one frame turned the other way from the rest.
 *
 * THE TRI-STATE
 *
 * `jpegOrientation` reads the Exif block off a head of the file, and a head can
 * run out. It distinguishes three answers: a value, because the Exif said so;
 * null, because the frame header or the scan was reached and there is no
 * orientation to find; and undefined, because the bytes ended first. The last
 * one is what lets a caller read more rather than guess - a 4 KB head that
 * stops inside a long APP segment has not said "no Exif", only "not yet".
 *
 * This is a leaf: no DOM, no canvas, nothing it cannot be tested without.
 */

/* 'E' 'x' 'i' 'f' NUL NUL - the six bytes that open an Exif APP1 payload. */
const EXIF_ID = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00];

const ORIENTATION_TAG = 0x0112;

/**
 * The 2D matrix, in setTransform order, that turns an unoriented decode
 * upright for each EXIF value. Indexed by the value itself; 0 is unused.
 */
const MATRICES = [
  null,
  [1, 0, 0, 1],
  [-1, 0, 0, 1],
  [-1, 0, 0, -1],
  [1, 0, 0, -1],
  [0, 1, 1, 0],
  [0, 1, -1, 0],
  [0, -1, -1, 0],
  [0, -1, 1, 0],
];

/**
 * Walk a JPEG's segments from its SOI, yielding each header found until the
 * walk is over: at a frame header, at the scan, or at a length that cannot be.
 *
 * This is the one walker. `jpegSize` in raw.js and `jpegOrientation` below are
 * both run on the same head of the same file and both need to know where its
 * preamble ends; two copies of the walk is how they would come to disagree, and
 * nothing would notice, because the disagreement is a preview of one camera
 * turned the wrong way. Fill bytes are skipped, standalone markers - SOI, TEM,
 * the restart markers - are stepped over, and every other marker carries a
 * two-byte length. `complete` says whether the whole segment lies inside the
 * bytes given, so that a consumer can tell "not here" from "not yet".
 *
 * @param {Uint8Array} bytes  the head of a JPEG, from its SOI
 * @returns {Generator<{marker: number, at: number, length: number,
 *   complete: boolean, frame: boolean, final: boolean}>}
 */
export function* jpegSegments(bytes) {
  let at = 2;
  while (at + 4 <= bytes.length) {
    if (bytes[at] !== 0xff) { at += 1; continue; }
    const marker = bytes[at + 1];
    if (marker === 0xff) { at += 1; continue; }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      at += 2;
      continue;
    }
    const length = (bytes[at + 2] << 8) | bytes[at + 3];
    // C4 is the Huffman tables, C8 is a JPEG extension and CC is arithmetic
    // conditioning. Everything else in C0..CF starts a frame, and everything
    // a preamble can say - the size, the Exif block - comes before it.
    const frame = marker >= 0xc0 && marker <= 0xcf
      && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    // The scan, or an end-of-image with no scan at all: either way there is
    // nothing more to read as a segment.
    const final = marker === 0xda || marker === 0xd9;
    yield {
      marker, at, length, complete: at + 2 + length <= bytes.length, frame, final,
    };
    if (frame || final || length < 2) return;
    at += 2 + length;
  }
}

/**
 * The EXIF orientation a JPEG declares, or null, or undefined.
 *
 * The Exif block is read from whatever of it the head holds, because IFD0 sits
 * in the first few dozen bytes of a segment that can run to sixty kilobytes of
 * maker note and thumbnail: a 4 KB head that ends inside the segment has
 * usually already passed the tag, and a reader that demanded the whole segment
 * first would send every camera-written preview back for a second read. So
 * undefined means the bytes ended before the answer did - inside the directory
 * itself, or before a segment that might still hold the tag - and nothing
 * else. Nothing here throws on garbage: a length or an offset that points
 * outside what was read yields null or undefined, never an exception, since
 * the caller is opening somebody's file and has a decoder to fall back on.
 *
 * @param {Uint8Array} bytes  the head of a JPEG, from its SOI
 * @returns {number | null | undefined}
 */
export function jpegOrientation(bytes) {
  for (const seg of jpegSegments(bytes)) {
    if (seg.frame || seg.final || seg.length < 2) return null;
    if (seg.marker !== 0xe1) {
      if (!seg.complete) return undefined;
      continue;
    }
    const start = seg.at + 4;
    const end = Math.min(seg.at + 2 + seg.length, bytes.length);
    if (start + EXIF_ID.length > bytes.length) return undefined;
    if (isExif(bytes, start)) {
      const found = tiffOrientation(bytes.subarray(start + EXIF_ID.length, end), !seg.complete);
      if (found !== null) return found;
    }
    if (!seg.complete) return undefined;
  }
  // The head ended inside a segment, before anything that could have settled
  // the question either way.
  return undefined;
}

function isExif(bytes, at) {
  return EXIF_ID.every((byte, i) => bytes[at + i] === byte);
}

/**
 * IFD0's orientation out of a TIFF block, or null, or undefined.
 *
 * Only the first directory is read, because that is where the specification
 * puts the tag and where every camera writes it. The tag has to be a SHORT
 * with a count of one to be believed; a value outside 1..8 is treated as
 * absent rather than as a ninth way up. `truncated` says the block given is
 * the front of a longer one, and turns "ran off the end" from the null it
 * means for a whole block into the undefined that asks for more bytes.
 */
function tiffOrientation(tiff, truncated) {
  const ranOut = () => (truncated ? undefined : null);
  if (tiff.length < 8) return ranOut();
  let little;
  if (tiff[0] === 0x49 && tiff[1] === 0x49) little = true;
  else if (tiff[0] === 0x4d && tiff[1] === 0x4d) little = false;
  else return null;

  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  if (view.getUint16(2, little) !== 42) return null;
  const first = view.getUint32(4, little);
  if (first < 8) return null;
  if (first + 2 > tiff.length) return ranOut();

  const count = view.getUint16(first, little);
  for (let i = 0; i < count; i += 1) {
    const entry = first + 2 + i * 12;
    if (entry + 12 > tiff.length) return ranOut();
    if (view.getUint16(entry, little) !== ORIENTATION_TAG) continue;
    if (view.getUint16(entry + 2, little) !== 3 || view.getUint32(entry + 4, little) !== 1) {
      return null;
    }
    const value = view.getUint16(entry + 8, little);
    return value >= 1 && value <= 8 ? value : null;
  }
  return null;
}

/**
 * The size a picture has once its orientation is applied: the stored width
 * and height swapped for the four values that involve a quarter turn.
 */
export function orientedSize(width, height, orientation) {
  return orientation >= 5 && orientation <= 8
    ? { width: height, height: width }
    : { width, height };
}

/**
 * The [a, b, c, d] that turns an unoriented decode upright, about its centre.
 * See the convention in the header comment. Anything that is not a value
 * from 1 to 8 is the identity, which is what an absent orientation means.
 */
export function orientationMatrix(orientation) {
  return MATRICES[orientation] ?? MATRICES[1];
}
