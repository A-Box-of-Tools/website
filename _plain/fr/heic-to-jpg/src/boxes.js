/**
 * Just enough of the HEIF container to answer two questions.
 *
 *   1. Is this actually a HEIC? The extension is not evidence - phones and
 *      cloud drives rename these files constantly, and ".jpg" that is really a
 *      HEIC is the single most common way somebody arrives here.
 *   2. Where is the EXIF block? The decoder next door returns pixels and
 *      nothing else, so if the date, the camera and the coordinates are to
 *      survive the trip into a JPEG, they have to be lifted out of the
 *      container by hand.
 *
 * WHY THIS IS NOT THE DECODER'S JOB
 *
 * libheif can read metadata items perfectly well; its JavaScript binding does
 * not expose them. That binding is a short list of hand-written wrappers, and
 * heif_image_handle_get_metadata is not on it. So the choice was a fork of
 * somebody else's build, or a hundred lines of box walking here. This is the
 * hundred lines, and unlike the fork it can be read.
 *
 * WHAT A HEIF FILE IS
 *
 * The same box structure as an MP4: a tree of length-prefixed records, each
 * with a four-character name. The picture is not a box - it is a run of bytes
 * inside `mdat`, and the `meta` box holds a small filing system that says which
 * run belongs to which item.
 *
 *     ftyp                  brands: what this file claims to be
 *     meta                  the filing system
 *       pitm                which item is the picture
 *       iinf > infe[]       every item, with a four-character type each
 *       iloc                where each item's bytes are, as offset and length
 *       idat                a place small items can live instead of mdat
 *     mdat                  the bytes themselves
 *
 * Nothing here decodes anything. It reads offsets and hands back a slice.
 *
 * @see ISO/IEC 14496-12 (the box format) and ISO/IEC 23008-12 (HEIF itself)
 */

/** A box header is at least eight bytes: a length and a four-character name. */
const HEADER = 8;

/** `size == 1` means the real size is a 64-bit field after the name. */
const LARGE_SIZE = 1;

/** `size == 0` means "to the end of the file", which only a top-level box does. */
const TO_END = 0;

/**
 * The brands that mean "this is a still picture in the HEIF container".
 *
 * `heic` and `heix` are HEVC-coded, which is what a phone writes. `mif1` and
 * `msf1` are the generic HEIF brands, and a file that leads with one of those
 * usually names a codec brand later in the same box - which is why the whole
 * brand list is read rather than just the first entry.
 *
 * `avif` is deliberately absent. An AVIF is the same container with AV1 inside
 * it, and every current browser decodes one natively, so sending it through a
 * vendored engine would be shipping a megabyte to do what a canvas already
 * does. The page says so rather than silently accepting it.
 */
const HEIF_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'mif1', 'msf1']);

const ascii = (bytes, at, length = 4) => {
  let out = '';
  for (let i = 0; i < length; i += 1) out += String.fromCharCode(bytes[at + i]);
  return out;
};

/**
 * Walk the boxes in a range, calling back with each one.
 *
 * The callback gets the four-character type and the bounds of the box's
 * payload, so a caller that wants to recurse simply calls this again with them.
 *
 * A truncated or nonsensical length stops the walk rather than throwing. Files
 * do arrive half-copied, and "this does not look like a HEIC" is a better thing
 * to tell somebody than a stack trace.
 *
 * @param {Uint8Array} bytes
 * @param {number} start
 * @param {number} end
 * @param {(type: string, from: number, to: number) => void} visit
 */
function walk(bytes, start, end, visit) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let at = start;
  while (at + HEADER <= end) {
    let size = view.getUint32(at);
    const type = ascii(bytes, at + 4);
    let body = at + HEADER;

    if (size === LARGE_SIZE) {
      if (at + 16 > end) return;
      // Sizes beyond 2^53 are not a thing anyone has a file for, and Number is
      // what every offset here is anyway.
      size = Number(view.getBigUint64(at + 8));
      body = at + 16;
    } else if (size === TO_END) {
      size = end - at;
    }

    if (size < body - at || at + size > end) return;
    visit(type, body, at + size);
    at += size;
  }
}

/** version and flags, the four bytes every "full box" starts with. */
const fullBox = (bytes, at) => ({ version: bytes[at], at: at + 4 });

/** Read a big-endian unsigned integer of `size` bytes. Size may be 0, meaning 0. */
function uint(bytes, at, size) {
  let value = 0;
  for (let i = 0; i < size; i += 1) value = value * 256 + bytes[at + i];
  return value;
}

/**
 * Every brand named in `ftyp`: the major one, then the compatible ones.
 *
 * Read from the file rather than from its name, because the name is whatever
 * the last app to touch the file decided to call it. A photo mailed through two
 * services and saved from a browser can easily arrive as "image.jpg" with a
 * HEIC inside it, and acting on the extension would mean handing that file to a
 * canvas and reporting that the browser could not decode the picture - which is
 * true, and useless.
 *
 * The four bytes between the major brand and the compatible list are a version
 * number, not a brand, and are stepped over. They are read as one often enough
 * to be worth saying out loud: a QuickTime file whose minor version happens to
 * spell a brand would otherwise be accepted as a picture.
 */
function brands(bytes) {
  const found = [];
  walk(bytes, 0, bytes.length, (type, from, to) => {
    if (type !== 'ftyp' || found.length) return;
    for (let at = from; at + 4 <= to; at += 4) {
      if (at === from + 4) continue;
      found.push(ascii(bytes, at));
    }
  });
  return found;
}

/** True for the one container this tool refuses on purpose rather than by
 *  accident: AVIF, which every current browser opens without help. */
export function isAvif(bytes) {
  return brands(bytes).some((brand) => brand === 'avif' || brand === 'avis');
}

/**
 * The HEIF brand this file declares, or null.
 *
 * An AVIF is checked for first and always loses. AVIF and HEIC are the same
 * container - an AVIF routinely names `mif1` among its compatible brands - so a
 * list scanned in file order would call an AVIF a HEIF and hand it to the
 * decoder. Which brand a file leads with is not the question; whether AV1 is
 * inside it is.
 *
 * @param {Uint8Array} bytes
 * @returns {string|null} the brand that matched, or null if none did
 */
export function heifBrand(bytes) {
  const named = brands(bytes);
  if (named.some((brand) => brand === 'avif' || brand === 'avis')) return null;
  return named.find((brand) => HEIF_BRANDS.has(brand)) ?? null;
}

/**
 * Every item in the `meta` box: its id, its four-character type, and the bytes.
 *
 * @returns {{primary: number|null, describes: Map<number, number[]>,
 *            items: Map<number, {type: string, from: number, to: number}>}}
 */
function readMeta(bytes) {
  const result = { primary: null, describes: new Map(), items: new Map() };
  const types = new Map();
  const places = new Map();
  let idat = null;

  walk(bytes, 0, bytes.length, (type, from, to) => {
    if (type !== 'meta') return;
    // `meta` is a full box, so its children start four bytes in. Getting this
    // wrong reads the version as a box length and finds nothing.
    walk(bytes, from + 4, to, (child, childFrom, childTo) => {
      if (child === 'pitm') {
        const { version, at } = fullBox(bytes, childFrom);
        result.primary = uint(bytes, at, version === 0 ? 2 : 4);
      } else if (child === 'iinf') {
        readItemInfo(bytes, childFrom, childTo, types);
      } else if (child === 'iloc') {
        readItemLocations(bytes, childFrom, places);
      } else if (child === 'iref') {
        readItemReferences(bytes, childFrom, childTo, result.describes);
      } else if (child === 'idat') {
        idat = childFrom;
      }
    });
  });

  for (const [id, place] of places) {
    const from = place.inIdat ? (idat === null ? -1 : idat + place.offset) : place.offset;
    if (from < 0 || from + place.length > bytes.length) continue;
    result.items.set(id, { type: types.get(id) ?? '', from, to: from + place.length });
  }
  return result;
}

/** `iinf` is a count and then one `infe` per item, each naming the item's type. */
function readItemInfo(bytes, from, to, types) {
  const { version, at } = fullBox(bytes, from);
  const countSize = version === 0 ? 2 : 4;
  walk(bytes, at + countSize, to, (child, childFrom) => {
    if (child !== 'infe') return;
    const entry = fullBox(bytes, childFrom);
    // Versions 0 and 1 predate `item_type` and describe their contents in a
    // MIME string instead. No camera writes them and nothing here can use one,
    // so they are left out of the map rather than guessed at.
    if (entry.version < 2) return;
    const idSize = entry.version === 2 ? 2 : 4;
    const id = uint(bytes, entry.at, idSize);
    types.set(id, ascii(bytes, entry.at + idSize + 2));
  });
}

/**
 * `iref` - which item is about which other item, but only the `cdsc` kind.
 *
 * "Content describes": the link an EXIF item uses to say which picture it is
 * the metadata for. A file with one picture in it has one of these and reading
 * it changes nothing; a burst or a Live Photo has several pictures and several
 * EXIF blocks, and without the link there is no way to tell which belongs to
 * which beyond hoping they were written in the same order.
 */
function readItemReferences(bytes, from, to, describes) {
  const { version, at } = fullBox(bytes, from);
  const idSize = version === 0 ? 2 : 4;
  walk(bytes, at, to, (kind, refFrom) => {
    if (kind !== 'cdsc') return;
    const source = uint(bytes, refFrom, idSize);
    const count = uint(bytes, refFrom + idSize, 2);
    const targets = [];
    for (let i = 0; i < count; i += 1) {
      targets.push(uint(bytes, refFrom + idSize + 2 + i * idSize, idSize));
    }
    describes.set(source, targets);
  });
}

/**
 * `iloc` - where each item's bytes actually are.
 *
 * The awkward part of the format: the widths of the fields are themselves
 * fields, packed as nibbles in the first two bytes, so nothing can be read at a
 * fixed offset. An item may also be split into several extents; only the first
 * is taken here, because the items this tool reads - EXIF blocks - are never
 * split, and stitching a picture together is the decoder's job, not this one's.
 */
function readItemLocations(bytes, from, places) {
  const { version, at } = fullBox(bytes, from);
  const offsetSize = bytes[at] >> 4;
  const lengthSize = bytes[at] & 0x0f;
  const baseSize = bytes[at + 1] >> 4;
  const indexSize = version === 1 || version === 2 ? (bytes[at + 1] & 0x0f) : 0;

  let cursor = at + 2;
  const count = uint(bytes, cursor, version < 2 ? 2 : 4);
  cursor += version < 2 ? 2 : 4;

  for (let i = 0; i < count; i += 1) {
    const id = uint(bytes, cursor, version < 2 ? 2 : 4);
    cursor += version < 2 ? 2 : 4;

    // construction_method: 0 means "an offset into the file", 1 means "an
    // offset into the idat box". Small items often take the second route.
    let inIdat = false;
    if (version === 1 || version === 2) {
      inIdat = (bytes[cursor + 1] & 0x0f) === 1;
      cursor += 2;
    }

    cursor += 2; // data_reference_index: 0 for "this file", the only case here
    const base = uint(bytes, cursor, baseSize);
    cursor += baseSize;

    const extents = uint(bytes, cursor, 2);
    cursor += 2;

    for (let e = 0; e < extents; e += 1) {
      cursor += indexSize;
      const offset = uint(bytes, cursor, offsetSize);
      cursor += offsetSize;
      const length = uint(bytes, cursor, lengthSize);
      cursor += lengthSize;
      if (e === 0) places.set(id, { offset: base + offset, length, inIdat });
    }
  }
}

/**
 * The TIFF block out of a HEIC's EXIF item, ready to be written into a JPEG.
 *
 * HEIF wraps the block in a header of its own - a four-byte count and then that
 * many bytes to skip before the TIFF begins - and writers do not agree on what
 * goes in the skipped part. Rather than trust the count, this looks for the
 * TIFF byte-order mark itself, "II*\0" or "MM\0*", within the first few bytes.
 * That is what every reader of these files ends up doing, and it costs one
 * short loop.
 *
 * Where the file holds more than one picture, the block returned is the one
 * whose `cdsc` reference names the primary item - the picture the file is
 * nominally of. A file with a single EXIF item and no reference at all still
 * works, because that is the common case and there is nothing to be ambiguous
 * about.
 *
 * @param {Uint8Array} bytes the whole HEIC file
 * @returns {Uint8Array|null} the TIFF block, starting at its byte-order mark
 */
export function readExif(bytes) {
  const meta = readMeta(bytes);
  const blocks = [];
  for (const [id, item] of meta.items) {
    if (item.type !== 'Exif') continue;
    const start = findTiffHeader(bytes, item.from, Math.min(item.from + 32, item.to));
    if (start >= 0) blocks.push({ id, tiff: bytes.subarray(start, item.to) });
  }
  if (blocks.length === 0) return null;

  const forPrimary = blocks.find(
    (block) => (meta.describes.get(block.id) ?? []).includes(meta.primary),
  );
  return (forPrimary ?? blocks[0]).tiff;
}

/** The offset of "II*\0" or "MM\0*" in a range, or -1. */
function findTiffHeader(bytes, from, limit) {
  for (let at = from; at + 4 <= limit; at += 1) {
    const little = bytes[at] === 0x49 && bytes[at + 1] === 0x49
      && bytes[at + 2] === 0x2a && bytes[at + 3] === 0x00;
    const big = bytes[at] === 0x4d && bytes[at + 1] === 0x4d
      && bytes[at + 2] === 0x00 && bytes[at + 3] === 0x2a;
    if (little || big) return at;
  }
  return -1;
}
