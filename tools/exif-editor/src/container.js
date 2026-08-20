/**
 * One door in front of the three file formats.
 *
 * JPEG, PNG and WebP store metadata in three unrelated ways, but they store the
 * same metadata, so everything above this file works on one shape:
 *
 *   exif      the raw TIFF block, whatever wrapper it arrived in
 *   xmp       Adobe's XML packet, as text
 *   iptc      the Photoshop resource block, for the caption and byline fields
 *   icc       the colour profile
 *   comments  free text the format has a dedicated place for
 *   text      PNG's key/value chunks
 *   extras    metadata blocks we can remove but cannot read
 *   notes     blocks that look like metadata and are deliberately kept
 *
 * A "plan" goes the other way: a key left out means leave it alone, null means
 * remove it, a value means write that instead. Three lines of plan is the whole
 * of "remove everything", which is the point of the shape.
 *
 * @typedef {object} Meta
 * @property {Uint8Array|null} exif
 * @property {string|null} xmp
 * @property {Uint8Array|null} iptc
 * @property {Uint8Array|null} icc
 * @property {string[]} comments
 * @property {{keyword: string, value: string|null, encoding: string}[]} text
 * @property {{label: string, size: number}[]} extras
 * @property {{label: string, detail: string}[]} notes
 */

import * as jpeg from './jpeg.js';
import * as png from './png.js';
import * as webp from './webp.js';
import { parseExif, serializeExif } from './tiff.js';

const HANDLERS = { jpeg, png, webp };

/** Human-readable names, used in messages and in the file list. */
export const KIND_NAMES = { jpeg: 'JPEG', png: 'PNG', webp: 'WebP' };

const latin1 = new TextDecoder('latin1');

/**
 * Identify a file by its first bytes rather than by its name.
 *
 * A ".jpg" that is really a PNG is common enough - phones and chat apps rename
 * files freely - and acting on the extension would mean writing a JPEG segment
 * into a PNG. The formats we cannot edit are named individually, because "not
 * supported" is a much less useful thing to be told than "HEIC, and here is
 * why not".
 */
export function sniff(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && latin1.decode(bytes.subarray(1, 4)) === 'PNG') return 'png';
  if (bytes.length >= 12 && latin1.decode(bytes.subarray(0, 4)) === 'RIFF'
      && latin1.decode(bytes.subarray(8, 12)) === 'WEBP') return 'webp';

  if (bytes.length >= 12 && latin1.decode(bytes.subarray(4, 8)) === 'ftyp') {
    const brand = latin1.decode(bytes.subarray(8, 12));
    if (brand.startsWith('hei') || brand.startsWith('mif')) return 'heic';
    if (brand.startsWith('avi')) return 'avif';
  }
  if (bytes.length >= 4 && latin1.decode(bytes.subarray(0, 3)) === 'GIF') return 'gif';
  if (bytes.length >= 4) {
    const mark = latin1.decode(bytes.subarray(0, 2));
    if ((mark === 'II' && bytes[2] === 0x2a) || (mark === 'MM' && bytes[3] === 0x2a)) return 'tiff';
  }
  return 'unknown';
}

/** Why a format this tool can read is not one it can rewrite. */
const REFUSALS = {
  heic: 'HEIC is a box format built out of nested atoms, and rewriting one safely needs a different parser from the three here. Convert it to JPEG first.',
  avif: 'AVIF uses the same box format as HEIC, and the same applies: rewriting one needs a parser this tool does not have yet.',
  gif: 'GIF has comment and application blocks rather than EXIF, and almost never carries anything personal. It is not handled here.',
  tiff: 'A bare TIFF is all metadata and all image at once, with the pixels addressed by the same offsets this tool would have to move. Editing one is a different job from editing a photo.',
  unknown: 'This does not look like a JPEG, PNG or WebP.',
};

/**
 * Read a file into the shape the rest of the app works on.
 *
 * Nothing here touches the network, and nothing here writes: the file is read
 * once into memory and everything after that happens on the copy.
 *
 * @param {File} file
 */
export async function readImage(file) {
  return readBytes(new Uint8Array(await file.arrayBuffer()));
}

/**
 * The same, starting from bytes already in memory.
 *
 * "Undo my changes" is this function run again on the bytes the file was read
 * as. Rebuilding the model from the original bytes is exact by construction,
 * which un-picking a list of edits would not be.
 *
 * @param {Uint8Array} bytes
 */
export async function readBytes(bytes) {
  const kind = sniff(bytes);

  if (!HANDLERS[kind]) {
    return { ok: false, kind, error: REFUSALS[kind] ?? REFUSALS.unknown, bytes };
  }

  const doc = await HANDLERS[kind].read(bytes);
  if (!doc.ok) return { ok: false, kind, error: doc.error, bytes };

  const meta = HANDLERS[kind].collect(doc);

  // The EXIF block is parsed here and kept as a model, not as bytes. Editing a
  // tag changes the model; saving turns the model back into bytes. The original
  // bytes are never patched in place - see the note at the top of src/tiff.js.
  let exif = null;
  if (meta.exif) {
    const parsed = parseExif(meta.exif);
    exif = parsed.ok ? parsed : { ok: false, error: parsed.error };
  }

  return { ok: true, kind, bytes, doc, meta, exif, size: bytes.length };
}

/**
 * Turn the EXIF model back into a block, or null when nothing is left in it.
 * @param {object|null} exif the model from readImage
 */
export function exifBytes(exif) {
  if (!exif?.ok) return null;
  return serializeExif(exif);
}

/**
 * Write the file out with a plan applied.
 *
 * @param {object} item the value readImage returned
 * @param {object} plan see the note at the top of this file
 * @returns {Uint8Array}
 */
export function serialize(item, plan) {
  const handler = HANDLERS[item.kind];
  if (!handler) throw new Error('This format cannot be written.');

  // The document is cloned so that a failed or cancelled save cannot leave the
  // in-memory copy half-rewritten. Chunk payloads are shared rather than copied:
  // apply() replaces the arrays it changes and never writes into one.
  const doc = cloneDoc(item.doc);
  handler.apply(doc, plan);
  return handler.write(doc);
}

function cloneDoc(doc) {
  const copy = { ...doc };
  if (doc.segments) copy.segments = [...doc.segments];
  if (doc.chunks) copy.chunks = [...doc.chunks];
  return copy;
}

/** The extension and MIME type to hand a download. */
export function outputType(kind) {
  if (kind === 'png') return { mime: 'image/png', ext: 'png' };
  if (kind === 'webp') return { mime: 'image/webp', ext: 'webp' };
  return { mime: 'image/jpeg', ext: 'jpg' };
}
