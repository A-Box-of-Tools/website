/**
 * The file, taken apart: PS3.10 for the wrapper, PS3.5 for everything inside
 * it.
 *
 * A DICOM file is 128 bytes nobody reads, the four letters `DICM`, a small
 * group of elements describing how the rest is encoded, and then the dataset
 * itself in whatever encoding that group named. Everything hard about reading
 * one comes from that last sentence: the dataset's encoding is a value inside
 * the file, so the parser has to read part of the file before it knows how to
 * read the file.
 *
 * WHAT THIS MODULE KEEPS, AND WHY IT MATTERS
 *
 * A parsed dataset here holds *copies* of the small values and only the
 * offsets of the large ones. That is not an optimisation, it is what lets the
 * tool open a folder of three hundred CT slices: a `subarray` view keeps the
 * entire ArrayBuffer it was taken from alive, so a dataset holding views into
 * the file is a dataset holding the file. Copying the few kilobytes that are
 * worth showing, and remembering where the half-megabyte of pixels is, means
 * the bytes of a slice can be dropped the moment it is off screen and read
 * again from the disk when it comes back.
 *
 * WHAT IT DOES NOT DO
 *
 * Nothing here decodes a pixel. `pixelData` comes back as either one run of
 * bytes or the list of fragments an encapsulated syntax stores, and pixels.js
 * takes it from there. This file's job stops at the structure.
 */

import { ByteReader, Truncated } from './reader.js';
import { describe } from './dictionary.js';
import { IMPLICIT_LITTLE, transferSyntax } from './uids.js';

/** A file that is not DICOM at all, as opposed to one that is merely damaged. */
export class NotDicom extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotDicom';
  }
}

/** PS3.10: 128 bytes of preamble, then the magic. */
const PREAMBLE = 128;
const MAGIC = 'DICM';

/** 0xFFFFFFFF as a length means "this runs until its delimiter". */
const UNDEFINED = 0xffffffff;

const ITEM = 'fffee000';
const ITEM_END = 'fffee00d';
const SEQUENCE_END = 'fffee0dd';

export const PIXEL_DATA = '7fe00010';

/**
 * The VRs that carry their length in 32 bits, after two reserved bytes.
 *
 * The rest use 16, which caps them at 65534 bytes and is why a long text field
 * is a UT and a short one is an ST. Getting this list wrong does not produce a
 * wrong value, it produces a parser that is two bytes out of step for the rest
 * of the file, which is the failure this whole module is arranged to make
 * impossible to have quietly.
 */
const LONG_FORM = new Set(['OB', 'OD', 'OF', 'OL', 'OV', 'OW', 'SQ', 'UC', 'UN', 'UR', 'UT']);

/** How much of a value is worth keeping. See the note at the top of the file. */
const KEEP_BYTES = 16384;

/**
 * @typedef {object} Element
 * @property {string} tag        eight lower-case hex digits
 * @property {string} vr         two letters, from the file or from the dictionary
 * @property {boolean} guessedVR the file did not say; the dictionary did
 * @property {number} length     as the file declares it
 * @property {number} offset     where the value starts, in the bytes parsed
 * @property {Uint8Array|null} value  the bytes, if they were worth keeping
 * @property {Dataset[]|null} items   a sequence's items
 * @property {{offset: number, length: number}[]|null} fragments
 */

/**
 * @typedef {object} Dataset
 * @property {Element[]} elements   in the order the file holds them
 * @property {Map<string, Element>} byTag
 * @property {string[]} warnings
 */

/**
 * The wrapper, and enough of the file to know how to read the rest of it.
 *
 * Returns where the dataset starts rather than parsing it, because one transfer
 * syntax - Deflated Explicit VR Little Endian - means the dataset is not in the
 * file in a form this module can walk at all. The caller inflates it and hands
 * the result back to `parseDataset`, which keeps every asynchronous thing out
 * of the parser.
 */
export function parseFile(bytes) {
  const warnings = [];

  const magicAt = bytes.length >= PREAMBLE + 4
    ? String.fromCharCode(...bytes.subarray(PREAMBLE, PREAMBLE + 4))
    : '';

  if (magicAt !== MAGIC) {
    // No preamble. Which is not necessarily a broken file: a dataset sent over
    // the network and written straight to disk has no wrapper, and DICOMDIR
    // readers and research tools produce these by the thousand. The standard
    // has nothing to say about how to read one, so the encoding has to be
    // guessed from the first element - and the guess is stated on the page
    // rather than made silently.
    const guess = sniff(bytes);
    if (!guess) {
      throw new NotDicom('there is no DICM marker at byte 128, and the first '
        + 'bytes are not a DICOM element either');
    }
    warnings.push(`This file has no DICM marker, so it was read as a bare dataset in ${
      guess.name}. That was worked out from its first element rather than declared.`);
    return {
      hasPreamble: false,
      meta: emptyDataset(),
      syntax: guess,
      datasetStart: 0,
      warnings,
    };
  }

  // The File Meta group is Explicit VR Little Endian whatever the dataset is.
  // PS3.10 section 7.1 - it has to be, since it is what says what the dataset
  // is encoded as.
  const metaSyntax = { little: true, explicit: true };
  const meta = parseDataset(bytes, {
    start: PREAMBLE + 4,
    end: metaEnd(bytes),
    syntax: metaSyntax,
  });

  const uid = metaValue(meta, '00020010');
  if (!uid) {
    warnings.push('The file meta group names no transfer syntax, so the dataset was '
      + 'read as Implicit VR Little Endian, which is what the standard says to assume.');
  }
  const syntax = transferSyntax(uid || IMPLICIT_LITTLE);
  if (uid && !syntax.known) {
    warnings.push(`Transfer syntax ${uid} is not one this tool recognises. The header `
      + 'below was read as Explicit VR Little Endian, which every syntax registered '
      + 'since 1995 uses; the pixels could not be decoded.');
  }

  return {
    hasPreamble: true,
    meta,
    syntax,
    datasetStart: meta.end,
    warnings: warnings.concat(meta.warnings),
  };
}

/**
 * Where the File Meta group stops.
 *
 * (0002,0000) holds the number of bytes that follow it, and is required. Where
 * it is missing or absurd the group is walked until an element turns up whose
 * group is not 2, which is the same answer arrived at the slow way.
 */
function metaEnd(bytes) {
  const reader = new ByteReader(bytes, PREAMBLE + 4);
  try {
    const group = reader.u16();
    const element = reader.u16();
    const vr = reader.ascii(2);
    if (group === 2 && element === 0 && vr === 'UL') {
      reader.u16();
      const declared = reader.u32();
      const end = reader.at + declared;
      if (declared > 0 && end <= bytes.length) return end;
    }
  } catch (error) {
    if (!(error instanceof Truncated)) throw error;
  }
  return scanMetaEnd(bytes);
}

/** The slow answer: walk the group until an element leaves it. */
function scanMetaEnd(bytes) {
  const reader = new ByteReader(bytes, PREAMBLE + 4);
  let last = reader.at;
  try {
    while (!reader.done) {
      const start = reader.at;
      if (reader.u16() !== 2) return start;
      reader.at = start;
      readElement(reader, { little: true, explicit: true }, false);
      last = reader.at;
    }
  } catch (error) {
    if (!(error instanceof Truncated)) throw error;
  }
  return last;
}

const metaValue = (meta, tag) => {
  const found = meta.byTag.get(tag);
  if (!found?.value) return '';
  return trimUid(String.fromCharCode(...found.value));
};

const trimUid = (text) => text.replace(/[\0 ]+$/, '');

/**
 * Which encoding a file with no wrapper is in, from its first element.
 *
 * A dataset starts with a small group - 0002 or 0008 in practice - and the two
 * bytes after the tag are either a value representation or the low half of a
 * 32-bit length. Two uppercase letters that name a real VR is the explicit
 * case; anything else is implicit. A first tag whose group is above 0x0100 is
 * not a dataset at all and gets no guess, which is what stops a JPEG being
 * opened as a header full of nonsense.
 */
function sniff(bytes) {
  if (bytes.length < 8) return null;
  const reader = new ByteReader(bytes);
  const group = reader.u16();
  reader.u16();
  if (group === 0 || group > 0x0100) return null;

  const maybeVR = reader.ascii(2);
  const explicit = /^[A-Z]{2}$/.test(maybeVR)
    && (LONG_FORM.has(maybeVR) || KNOWN_VR.has(maybeVR));
  return transferSyntax(explicit ? '1.2.840.10008.1.2.1' : IMPLICIT_LITTLE);
}

/** Every VR in PS3.5 table 6.2-1, so `sniff` can tell one from a length. */
const KNOWN_VR = new Set([
  'AE', 'AS', 'AT', 'CS', 'DA', 'DS', 'DT', 'FL', 'FD', 'IS', 'LO', 'LT',
  'OB', 'OD', 'OF', 'OL', 'OV', 'OW', 'PN', 'SH', 'SL', 'SQ', 'SS', 'ST',
  'SV', 'TM', 'UC', 'UI', 'UL', 'UN', 'UR', 'US', 'UT', 'UV',
]);

const emptyDataset = () => ({ elements: [], byTag: new Map(), warnings: [], end: 0 });

/**
 * One dataset: every element from `start` to `end`, sequences and all.
 *
 * A truncated file stops here rather than throwing. Everything read before the
 * short read is kept and a warning names the offset, because a header that ends
 * mid-element is the case somebody opens a viewer to understand, and throwing
 * the whole file away over its last twelve bytes would answer the wrong
 * question.
 *
 * @param {Uint8Array} bytes
 * @param {{start?: number, end?: number, syntax: {little: boolean, explicit: boolean}}} options
 * @returns {Dataset}
 */
export function parseDataset(bytes, { start = 0, end = bytes.length, syntax }) {
  const reader = new ByteReader(bytes, start, end);
  reader.little = syntax.little;
  const dataset = emptyDataset();

  while (!reader.done) {
    const at = reader.at;
    let element;
    try {
      element = readElement(reader, syntax, true);
    } catch (error) {
      if (!(error instanceof Truncated)) throw error;
      dataset.warnings.push(`The file ends part-way through the element at byte ${at
      }; everything before it was read.`);
      reader.at = end;
      break;
    }

    // A stray delimiter at the top level: some writers leave one behind after a
    // sequence they wrote with an undefined length. It ends nothing here, so it
    // is skipped rather than treated as data.
    if (element.tag === ITEM_END || element.tag === SEQUENCE_END) continue;

    dataset.elements.push(element);
    if (!dataset.byTag.has(element.tag)) dataset.byTag.set(element.tag, element);
    if (element.stopped) {
      dataset.warnings.push(element.stopped);
      break;
    }
  }

  dataset.end = reader.at;
  return dataset;
}

/**
 * One element, from the tag to the last byte of its value.
 *
 * `readValue` decides what to do with the value; this function's whole
 * responsibility is that the reader ends up in exactly the right place
 * afterwards, in both encodings and both byte orders.
 */
function readElement(reader, syntax, full) {
  const offsetOfTag = reader.at;
  const group = reader.u16();
  const number = reader.u16();
  const tag = hex4(group) + hex4(number);

  // Item and sequence delimiters are always implicit and always little-endian,
  // even inside a big-endian dataset. PS3.5 section 7.5.
  if (group === 0xfffe) {
    const length = readU32(reader, true);
    return { tag, vr: 'na', guessedVR: false, length, offset: reader.at, value: null,
      items: null, fragments: null, offsetOfTag, little: true };
  }

  let vr;
  let guessedVR = false;
  let length;

  if (syntax.explicit) {
    vr = reader.ascii(2);
    if (!KNOWN_VR.has(vr)) {
      // Two bytes that are not a VR mean this element is implicit after all,
      // which happens inside a UN sequence a converter re-wrapped. Back up and
      // read it the other way rather than losing step.
      reader.at = offsetOfTag + 4;
      vr = describe(tag).vr;
      guessedVR = true;
      length = reader.u32();
    } else if (LONG_FORM.has(vr)) {
      reader.skip(2);
      length = reader.u32();
    } else {
      length = reader.u16();
    }
  } else {
    vr = describe(tag).vr;
    guessedVR = true;
    length = reader.u32();
  }

  // The byte order travels with the element. values.js reads a US out of it
  // long after the reader that knew which way round the file was has gone.
  const element = { tag, vr, guessedVR, length, offset: reader.at, value: null,
    items: null, fragments: null, offsetOfTag, stopped: null, little: syntax.little };

  if (!full) {
    // Only used while measuring the file meta group, where nothing is kept.
    if (length !== UNDEFINED) reader.skip(length);
    return element;
  }

  readValue(reader, syntax, element);
  return element;
}

/** The 32-bit length of a delimiter, which is little-endian whatever the rest is. */
function readU32(reader, little) {
  const was = reader.little;
  reader.little = little;
  const value = reader.u32();
  reader.little = was;
  return value;
}

/**
 * The value, or the three other things a value can turn out to be.
 *
 * A sequence holds datasets. Encapsulated pixel data holds fragments. A large
 * value holds nothing here at all - only where it was - for the memory reason
 * at the top of the file. Everything else is copied out.
 */
function readValue(reader, syntax, element) {
  const { tag, vr, length } = element;

  const isSequence = vr === 'SQ'
    // An undefined length is only legal on a sequence and on encapsulated pixel
    // data, so a UN of undefined length is a sequence somebody's software lost
    // the VR of on the way through. Reading it as bytes would swallow the rest
    // of the file.
    || (length === UNDEFINED && vr === 'UN' && tag !== PIXEL_DATA);

  if (isSequence) {
    element.items = readItems(reader, syntax, length);
    return;
  }

  if (length === UNDEFINED) {
    if (tag === PIXEL_DATA) {
      const encapsulated = readFragments(reader);
      element.fragments = encapsulated.items;
      element.offsetTable = encapsulated.table;
      return;
    }
    element.stopped = `The element ${tag} declares an undefined length, which only a `
      + 'sequence may do. Nothing after it could be read.';
    reader.at = reader.end;
    return;
  }

  if (length > reader.left) {
    element.stopped = `The element at byte ${element.offsetOfTag} says its value is ${
      length} bytes, and only ${reader.left} are left in the file.`;
    element.length = reader.left;
    element.value = keep(reader.slice(reader.left));
    return;
  }

  const bytes = reader.slice(length);
  element.value = keep(bytes);
}

/** A copy of the value, or nothing where the value is too big to be worth one. */
const keep = (bytes) => (bytes.length <= KEEP_BYTES ? bytes.slice() : null);

/**
 * The items of a sequence, either to its delimiter or to a declared length.
 *
 * Both forms are common in the same file. A scanner writes undefined lengths
 * because it is streaming and does not know them yet; an archive that rewrites
 * the file fills them in.
 */
function readItems(reader, syntax, length) {
  const items = [];
  const stop = length === UNDEFINED ? reader.end : reader.at + length;

  while (reader.at < stop && !reader.done) {
    const group = reader.u16();
    const number = reader.u16();
    const tag = hex4(group) + hex4(number);
    const itemLength = readU32(reader, true);

    if (tag === SEQUENCE_END) break;
    if (tag !== ITEM) {
      // Not an item where an item must be. Step back so the caller sees the
      // same bytes and can report where the file stopped making sense.
      reader.at -= 8;
      break;
    }

    const from = reader.at;
    const to = itemLength === UNDEFINED
      ? findItemEnd(reader, syntax, stop)
      : Math.min(from + itemLength, reader.end);

    items.push(parseDataset(reader.bytes, { start: from, end: to, syntax }));
    reader.at = itemLength === UNDEFINED ? to + 8 : to;
  }

  return items;
}

/**
 * Where an item of undefined length ends: at its own delimiter, and not at a
 * delimiter belonging to a sequence nested inside it.
 *
 * The depth count is the whole of it. An item holding a sequence holding an
 * item ends at the third delimiter, not the first, and a reader that stops at
 * the first produces a dataset that is subtly and quietly short.
 */
function findItemEnd(reader, syntax, stop) {
  const scan = new ByteReader(reader.bytes, reader.at, stop);
  scan.little = syntax.little;
  let depth = 0;

  while (!scan.done) {
    const at = scan.at;
    let element;
    try {
      element = readElement(scan, syntax, false);
    } catch (error) {
      if (!(error instanceof Truncated)) throw error;
      return stop;
    }

    if (element.tag === ITEM_END) {
      if (depth === 0) return at;
      depth -= 1;
    } else if (element.tag === ITEM) {
      // Only an item of undefined length opens something that has to be closed
      // again. One with a length is stepped over whole, and counting it would
      // leave the depth permanently one too deep.
      if (element.length === UNDEFINED) depth += 1;
      else scan.skip(Math.min(element.length, scan.left));
    }
    // Everything else needs nothing: readElement has already stepped over a
    // value of known length, and an element of undefined length is a nested
    // sequence whose own items the loop is about to walk into.
  }
  return stop;
}

/**
 * The fragments of encapsulated pixel data.
 *
 * The first item is the Basic Offset Table, which is either empty or holds one
 * offset per frame. It is not pixels and is kept separately: a decoder that
 * treats it as the first frame produces a first slice made of four-byte
 * integers, which looks exactly like noise and is a bug people have shipped.
 *
 * Only the offsets are kept. A fragment is the whole compressed frame and can
 * be megabytes; pixels.js reads it back out of the file when it needs it.
 */
function readFragments(reader) {
  const table = [];
  const items = [];
  let first = true;

  while (!reader.done) {
    const group = reader.u16();
    const number = reader.u16();
    const tag = hex4(group) + hex4(number);
    const length = readU32(reader, true);

    if (tag === SEQUENCE_END) break;
    if (tag !== ITEM) {
      reader.at -= 8;
      break;
    }
    if (length === UNDEFINED || length > reader.left) break;

    const offset = reader.at;
    reader.skip(length);

    if (first) {
      first = false;
      // The offset table, in the file's own words: a list of where each frame
      // starts, measured from the first byte after this item.
      for (let at = 0; at + 4 <= length; at += 4) {
        table.push(new DataView(reader.bytes.buffer, reader.bytes.byteOffset + offset + at, 4)
          .getUint32(0, true));
      }
      continue;
    }
    items.push({ offset, length });
  }

  return { table, items };
}

const hex4 = (value) => value.toString(16).padStart(4, '0');

/** Every element in a dataset and in everything nested inside it, depth first. */
export function* walk(dataset, depth = 0) {
  for (const element of dataset.elements) {
    yield { element, depth };
    if (element.items) {
      for (const item of element.items) yield* walk(item, depth + 1);
    }
  }
}
