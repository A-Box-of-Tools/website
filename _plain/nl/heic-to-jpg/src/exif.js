/**
 * The metadata, and the two things that have to happen to it on the way out.
 *
 * A HEIC off a phone carries a TIFF block: the date to the second, the camera
 * and lens, the exposure, and - unless the owner turned it off - the
 * coordinates of the place it was taken. boxes.js lifts that block out of the
 * container. This file decides what to do with it.
 *
 * TWO JOBS, AND WHY THE SECOND ONE IS NOT OPTIONAL
 *
 *   1. Say what is in there, so that "keep the photo details" is a choice made
 *      knowing whether the details include somebody's home address.
 *
 *   2. Set the orientation tag to 1 before the block is written into a JPEG.
 *      This is the part that would otherwise be a bug. A HEIC records its
 *      rotation twice - once in the container as an `irot` property, and once
 *      in the EXIF block - and libheif applies the container's rotation while
 *      decoding, so the pixels handed back are already the right way up. Copy
 *      the EXIF across untouched and a viewer reads "rotate this 90 degrees"
 *      and does it again, to a picture that has already been turned. Every
 *      portrait photo would come out on its side.
 *
 * Nothing here rewrites the block. Both jobs are reads, except for two bytes
 * that are overwritten in place, and the reason for that restraint is the
 * thumbnail: a TIFF block is full of offsets that point back into itself, so a
 * block that is rebuilt has to have every one of them recomputed, while a block
 * that is copied entire cannot have them wrong.
 *
 * @see https://exiftool.org/TagNames/EXIF.html for the tag numbers
 */

const LITTLE = 0x4949; // "II"

/* The handful of tags this file has anything to say about. */
const MAKE = 0x010f;
const MODEL = 0x0110;
const ORIENTATION = 0x0112;
const EXIF_IFD = 0x8769;
const GPS_IFD = 0x8825;
const DATE_TIME_ORIGINAL = 0x9003;
const DATE_TIME = 0x0132;

const ASCII = 2;
const SHORT = 3;

/** An entry is twelve bytes: tag, type, count, and four bytes of value or offset. */
const ENTRY = 12;

/**
 * A JPEG segment's length field is two bytes, and it counts itself. An APP1
 * payload therefore has 65533 bytes to fit in, including the "Exif\0\0" that
 * introduces it.
 */
const MAX_SEGMENT = 0xfffd;

const EXIF_ID = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00]; // "Exif\0\0"

/**
 * A reader over a TIFF block that knows which way round the numbers are.
 *
 * Both byte orders are real. Apple writes big-endian ("MM"), most Android
 * phones write little-endian ("II"), and a file that has been through a desktop
 * editor can be either - so this is read from the block rather than assumed.
 */
function reader(tiff) {
  if (tiff.length < 8) return null;
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const order = view.getUint16(0);
  const little = order === LITTLE;
  if (!little && order !== 0x4d4d) return null;
  if (view.getUint16(2, little) !== 42) return null;
  return {
    view,
    little,
    u16: (at) => view.getUint16(at, little),
    u32: (at) => view.getUint32(at, little),
    first: view.getUint32(4, little),
  };
}

/**
 * Every IFD in the block, as offsets: IFD0, then whatever it chains to.
 *
 * IFD1 is the thumbnail's directory, and it carries its own orientation tag.
 * Missing it is how a picture comes out upright and its own thumbnail comes out
 * sideways, which is the kind of bug that only shows up in somebody's file
 * manager a week later.
 */
function directories(tiff, read) {
  const found = [];
  let at = read.first;
  // A malformed block can chain to itself. Four is more directories than any
  // real file has, and stops that being an infinite loop.
  while (at > 0 && at + 2 <= tiff.length && found.length < 4) {
    const count = read.u16(at);
    const end = at + 2 + count * ENTRY;
    if (end + 4 > tiff.length) break;
    found.push({ at, count });
    at = read.u32(end);
  }
  return found;
}

/** Walk the entries of one directory. */
function entries(read, directory, visit) {
  for (let i = 0; i < directory.count; i += 1) {
    const at = directory.at + 2 + i * ENTRY;
    visit({
      tag: read.u16(at),
      type: read.u16(at + 2),
      count: read.u32(at + 4),
      // Values of four bytes or fewer sit here; anything longer is an offset
      // to somewhere else in the block. Which it is depends on the type, so
      // both readings are offered and the caller picks.
      value: at + 8,
    });
  }
}

/** An ASCII value, wherever it happens to live. */
function text(tiff, read, entry) {
  if (entry.type !== ASCII || entry.count === 0) return '';
  const size = entry.count;
  const at = size <= 4 ? entry.value : read.u32(entry.value);
  if (at + size > tiff.length) return '';
  let out = '';
  for (let i = 0; i < size; i += 1) {
    const code = tiff[at + i];
    if (code === 0) break;
    out += String.fromCharCode(code);
  }
  return out.trim();
}

/**
 * What the metadata says, in the words the page uses to offer the choice.
 *
 * Deliberately short. This is not the EXIF viewer - that tool exists next door
 * and shows every tag there is. What this has to answer is the one question
 * somebody about to press "convert" would want answered: is there anything in
 * here I would not want to hand to whoever I am sending the JPEG to.
 *
 * @param {Uint8Array|null} tiff
 * @returns {{present: boolean, camera: string, taken: string, gps: boolean, bytes: number}}
 */
export function describeExif(tiff) {
  const nothing = { present: false, camera: '', taken: '', gps: false, bytes: 0 };
  if (!tiff) return nothing;
  const read = reader(tiff);
  if (!read) return nothing;

  let make = '';
  let model = '';
  let taken = '';
  let gps = false;
  let exifAt = 0;

  const all = directories(tiff, read);
  if (all.length === 0) return nothing;

  entries(read, all[0], (entry) => {
    if (entry.tag === MAKE) make = text(tiff, read, entry);
    else if (entry.tag === MODEL) model = text(tiff, read, entry);
    else if (entry.tag === DATE_TIME) taken = text(tiff, read, entry);
    else if (entry.tag === EXIF_IFD) exifAt = read.u32(entry.value);
    // A GPS directory that exists but holds no entries is what a phone leaves
    // behind when location is off. Saying "this photo has GPS" about one of
    // those would be a lie people would then act on.
    else if (entry.tag === GPS_IFD) {
      const at = read.u32(entry.value);
      gps = at > 0 && at + 2 <= tiff.length && read.u16(at) > 0;
    }
  });

  if (exifAt > 0 && exifAt + 2 <= tiff.length) {
    const count = read.u16(exifAt);
    if (exifAt + 2 + count * ENTRY + 4 <= tiff.length) {
      entries(read, { at: exifAt, count }, (entry) => {
        if (entry.tag === DATE_TIME_ORIGINAL) taken = text(tiff, read, entry) || taken;
      });
    }
  }

  // "Apple iPhone 15 Pro" rather than "Apple Apple iPhone 15 Pro": the make is
  // usually the first word of the model already.
  const camera = model.toLowerCase().startsWith(make.toLowerCase()) && make
    ? model
    : [make, model].filter(Boolean).join(' ');

  return { present: true, camera, taken: readableDate(taken), gps, bytes: tiff.length };
}

/** EXIF writes "2026:08:20 14:03:11". Only the colons in the date are unusual. */
function readableDate(stamp) {
  const match = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}:\d{2})/.exec(stamp);
  return match ? `${match[1]}-${match[2]}-${match[3]} ${match[4]}` : stamp;
}

/**
 * The block as it should be written into a JPEG: a copy, with the orientation
 * tag in every directory set to 1.
 *
 * The copy is the point. The block handed in is a view onto the file the
 * visitor chose, and patching that would mean the second conversion of the same
 * file saw different metadata from the first.
 *
 * Only an orientation stored as a single SHORT is touched, which is every one
 * ever written by a camera; anything else is left exactly as found rather than
 * guessed at.
 *
 * @param {Uint8Array} tiff
 * @returns {Uint8Array} a copy, upright
 */
export function uprightExif(tiff) {
  const copy = tiff.slice();
  const read = reader(copy);
  if (!read) return copy;
  for (const directory of directories(copy, read)) {
    entries(read, directory, (entry) => {
      if (entry.tag !== ORIENTATION || entry.type !== SHORT || entry.count !== 1) return;
      // A SHORT sits in the first two bytes of the four-byte value field on a
      // big-endian block, and in the same two bytes on a little-endian one -
      // the difference is only which end the 1 goes in.
      read.view.setUint16(entry.value, 1, read.little);
    });
  }
  return copy;
}

/** True when the block is small enough to be a JPEG segment at all. */
export function fitsInJpeg(tiff) {
  return tiff.length + EXIF_ID.length <= MAX_SEGMENT;
}

/**
 * A JPEG with the EXIF block written into it, as an APP1 segment.
 *
 * The segment goes immediately after the start-of-image marker, and after an
 * APP0 if the encoder wrote one. Safari's canvas writes a JFIF APP0 and
 * Chrome's does not; both orders are legal, but APP0-then-APP1 is what every
 * camera writes and therefore the order every reader has been tested against.
 *
 * Everything else in the file is copied byte for byte. The picture is not
 * touched, decoded, or re-encoded here.
 *
 * @param {Uint8Array} jpeg as the canvas encoded it
 * @param {Uint8Array} tiff the block from uprightExif
 * @returns {Uint8Array}
 */
export function withExif(jpeg, tiff) {
  const payload = EXIF_ID.length + tiff.length;
  const segment = new Uint8Array(4 + payload);
  segment[0] = 0xff;
  segment[1] = 0xe1;
  segment[2] = ((payload + 2) >> 8) & 0xff;
  segment[3] = (payload + 2) & 0xff;
  segment.set(EXIF_ID, 4);
  segment.set(tiff, 4 + EXIF_ID.length);

  const at = afterHeader(jpeg);
  if (at < 0) return jpeg;

  const out = new Uint8Array(jpeg.length + segment.length);
  out.set(jpeg.subarray(0, at), 0);
  out.set(segment, at);
  out.set(jpeg.subarray(at), at + segment.length);
  return out;
}

/** The offset just past SOI, and past an APP0 if there is one, or -1. */
function afterHeader(jpeg) {
  if (jpeg.length < 4 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8) return -1;
  if (jpeg[2] === 0xff && jpeg[3] === 0xe0 && jpeg.length >= 6) {
    return 4 + ((jpeg[4] << 8) | jpeg[5]);
  }
  return 2;
}
