/**
 * PNG, as a list of chunks.
 *
 * After an eight-byte signature a PNG is nothing but chunks: a length, a
 * four-letter type, the data, and a CRC of the two. The pixels live in IDAT;
 * everything this tool removes lives in chunks beside it.
 *
 * As with JPEG, removing metadata here is a list edit. IDAT is copied across
 * byte for byte, so a stripped PNG decodes to exactly the same pixels.
 *
 * Chunk types are case-sensitive and the capitalisation means something: an
 * initial capital marks a chunk a decoder must understand, lower case marks one
 * it may skip. Every chunk this file removes is in the second group, which is
 * why removing them cannot break the picture.
 */

import { crc32 } from './shared/crc32.js';

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** The chunks that carry metadata rather than picture. Everything else is kept. */
const TEXT_TYPES = new Set(['tEXt', 'zTXt', 'iTXt']);

const latin1 = new TextDecoder('latin1');
const utf8 = new TextEncoder();
const utf8Decoder = new TextDecoder('utf-8');

/** The keyword Adobe uses for an XMP packet stored in an iTXt chunk. */
const XMP_KEYWORD = 'XML:com.adobe.xmp';

function typeBytes(type) {
  const out = new Uint8Array(4);
  for (let i = 0; i < 4; i += 1) out[i] = type.charCodeAt(i);
  return out;
}

/** zlib inflate, using the browser's own decompressor. */
async function inflate(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * Split a PNG into chunks. Async because two of the text chunk types are
 * compressed, and unpacking them is what turns them into something readable.
 */
export async function read(bytes) {
  if (bytes.length < 12 || SIGNATURE.some((b, i) => bytes[i] !== b)) {
    return { ok: false, kind: 'png', error: 'read.notpng' };
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks = [];
  let at = 8;

  while (at + 8 <= bytes.length) {
    const length = view.getUint32(at);
    const type = latin1.decode(bytes.subarray(at + 4, at + 8));
    if (at + 12 + length > bytes.length) {
      return { ok: false, kind: 'png', error: 'read.pngoverrun' };
    }

    const chunk = { type, data: bytes.slice(at + 8, at + 8 + length) };
    if (TEXT_TYPES.has(type)) chunk.text = await readText(chunk);
    chunks.push(chunk);

    at += 12 + length;
    if (type === 'IEND') break;
  }

  if (!chunks.length || chunks[0].type !== 'IHDR') {
    return { ok: false, kind: 'png', error: 'read.pngnoheader' };
  }
  return { ok: true, kind: 'png', chunks };
}

/** Rebuild the file, recomputing every CRC. */
export function write(doc) {
  let total = 8;
  for (const c of doc.chunks) total += 12 + c.data.length;

  const out = new Uint8Array(total);
  out.set(SIGNATURE);
  const view = new DataView(out.buffer);
  let at = 8;

  for (const chunk of doc.chunks) {
    const type = typeBytes(chunk.type);
    view.setUint32(at, chunk.data.length);
    out.set(type, at + 4);
    out.set(chunk.data, at + 8);
    view.setUint32(at + 8 + chunk.data.length, crc32([type, chunk.data]));
    at += 12 + chunk.data.length;
  }

  return out;
}

/** Offset of the next NUL, which is how every string in a PNG chunk ends. */
const nulAt = (bytes, from) => {
  for (let i = from; i < bytes.length; i += 1) if (bytes[i] === 0) return i;
  return -1;
};

/**
 * Unpack one text chunk. The three types differ only in whether the text is
 * compressed and whether it is Latin-1 or UTF-8.
 */
async function readText(chunk) {
  const { type, data } = chunk;
  const split = nulAt(data, 0);
  if (split < 0) return { keyword: '(malformed)', value: '', encoding: type };
  const keyword = latin1.decode(data.subarray(0, split));

  try {
    if (type === 'tEXt') {
      return { keyword, value: latin1.decode(data.subarray(split + 1)), encoding: type };
    }

    if (type === 'zTXt') {
      const body = await inflate(data.subarray(split + 2));
      return { keyword, value: latin1.decode(body), encoding: type };
    }

    // iTXt: compression flag, compression method, language tag, translated
    // keyword, then the text itself in UTF-8.
    const compressed = data[split + 1] === 1;
    const langEnd = nulAt(data, split + 3);
    const transEnd = nulAt(data, langEnd + 1);
    if (langEnd < 0 || transEnd < 0) return { keyword, value: '', encoding: type };

    const body = data.subarray(transEnd + 1);
    return {
      keyword,
      value: utf8Decoder.decode(compressed ? await inflate(body) : body),
      encoding: type,
      language: latin1.decode(data.subarray(split + 3, langEnd)),
    };
  } catch {
    // A chunk whose compressed data will not unpack is still there, still
    // removable, and still worth reporting. Only its contents are unknown.
    return { keyword, value: null, encoding: type, unreadable: true };
  }
}

/** Build a tEXt chunk, or an iTXt one when the text needs more than Latin-1. */
function makeTextChunk(keyword, value) {
  const key = keyword.slice(0, 79);
  const plain = /^[\x20-\xff]*$/.test(value) && !/[\x80-\x9f]/.test(value);

  if (plain) {
    const data = new Uint8Array(key.length + 1 + value.length);
    for (let i = 0; i < key.length; i += 1) data[i] = key.charCodeAt(i);
    for (let i = 0; i < value.length; i += 1) data[key.length + 1 + i] = value.charCodeAt(i) & 0xff;
    return { type: 'tEXt', data, text: { keyword: key, value, encoding: 'tEXt' } };
  }

  // iTXt, uncompressed: keyword, flag 0, method 0, empty language, empty
  // translated keyword, UTF-8 text. Writing it uncompressed keeps a deflate
  // implementation out of this file entirely.
  const body = utf8.encode(value);
  const data = new Uint8Array(key.length + 5 + body.length);
  for (let i = 0; i < key.length; i += 1) data[i] = key.charCodeAt(i);
  data.set(body, key.length + 5);
  return { type: 'iTXt', data, text: { keyword: key, value, encoding: 'iTXt' } };
}

/** Some writers put the JPEG-style "Exif\0\0" marker in front. Tolerate it. */
function stripExifId(data) {
  const head = latin1.decode(data.subarray(0, 6));
  return head === 'Exif\0\0' ? data.slice(6) : data;
}

/** @returns {import('./container.js').Meta} */
export function collect(doc) {
  const meta = {
    exif: null, xmp: null, iptc: null, icc: null,
    comments: [], text: [], extras: [], notes: [],
  };

  doc.chunks.forEach((chunk, index) => {
    if (chunk.type === 'eXIf' && !meta.exif) {
      meta.exif = stripExifId(chunk.data);
    } else if (TEXT_TYPES.has(chunk.type)) {
      if (chunk.text?.keyword === XMP_KEYWORD) meta.xmp = chunk.text.value;
      else meta.text.push({ ...chunk.text, index });
    } else if (chunk.type === 'iCCP') {
      const split = nulAt(chunk.data, 0);
      meta.icc = chunk.data.slice(split + 2);
      meta.iccName = split > 0 ? latin1.decode(chunk.data.subarray(0, split)) : null;
    } else if (chunk.type === 'tIME') {
      meta.extras.push({ label: 'Last-modified time (tIME)', size: chunk.data.length });
    } else if (chunk.type === 'dSIG') {
      meta.extras.push({ label: 'Embedded digital signature (dSIG)', size: chunk.data.length });
    }
  });

  return meta;
}

/**
 * Rewrite the chunk list from a plan.
 *
 * New metadata goes in immediately after IHDR and every other chunk keeps the
 * position it had. That matters more than it looks: an animated PNG carries
 * fcTL and fdAT chunks after IDAT, and shuffling chunks into tidy groups would
 * quietly turn the animation into a still.
 *
 * @param {object} doc
 * @param {{exif?: Uint8Array|null, xmp?: string|null, icc?: null,
 *          text?: {keyword: string, value: string}[]|null, extras?: null}} plan
 */
export function apply(doc, plan) {
  const inserted = [];
  if (plan.exif) inserted.push({ type: 'eXIf', data: plan.exif });
  if (Array.isArray(plan.text)) {
    for (const item of plan.text) inserted.push(makeTextChunk(item.keyword, item.value));
  }
  if (typeof plan.xmp === 'string' && plan.xmp) inserted.push(makeTextChunk(XMP_KEYWORD, plan.xmp));

  const out = [];
  for (const chunk of doc.chunks) {
    if (chunk.type === 'IHDR') {
      out.push(chunk, ...inserted);
      continue;
    }
    if (chunk.type === 'eXIf' && plan.exif !== undefined) continue;
    if (TEXT_TYPES.has(chunk.type)) {
      const isXmp = chunk.text?.keyword === XMP_KEYWORD;
      if (isXmp ? plan.xmp !== undefined : plan.text !== undefined) continue;
      out.push(chunk);
      continue;
    }
    if (chunk.type === 'iCCP' && plan.icc === null) continue;
    if ((chunk.type === 'tIME' || chunk.type === 'dSIG') && plan.extras === null) continue;
    out.push(chunk);
  }

  doc.chunks = out;
}
