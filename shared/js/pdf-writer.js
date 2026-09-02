/**
 * Writing the document back out.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/pdf-writer.js and the
 * build copies it to <tool>/src/shared/pdf-writer.js. One of the four PDF
 * parts that travel together; see the header of pdf-objects.js. It was
 * written for the compressor, which is why the notes below talk about the
 * saving, and the merger and the redactor use it unchanged: it asks a document
 * for four things - objects, trailer, getObject, resolve - and anything that
 * answers those is a document it can write.
 *
 * Not an edit of the original bytes: a fresh file, built from the objects that
 * are still reachable from the catalogue. That choice is where a good part of
 * the saving comes from, and it is worth being explicit about why.
 *
 * A PDF that has been edited - by a form filler, a signing tool, a phone app
 * that rotated one page - is usually not rewritten but *appended to*. The old
 * bytes stay exactly where they were and a new set of objects, a new table and
 * a new trailer are added to the end. Readers follow the chain backwards and
 * see only the newest version of each object. It is an elegant scheme, and it
 * means a file that has been through four rounds of editing may be carrying
 * four copies of pages that no longer exist. Walking out from the catalogue and
 * writing only what is reached leaves every one of them behind.
 *
 * Two more things happen here, both ordinary and both worth a few per cent:
 *
 *   - **Small objects are packed together.** Every dictionary in the document -
 *     the page tree, the font descriptors, the annotations - goes into an
 *     object stream and is deflated with its neighbours. Dictionaries compress
 *     well as a batch and terribly one at a time, because what repeats between
 *     them is the key names.
 *   - **Anything left uncompressed is compressed.** Files written by hand and
 *     by simple scripts often store content streams raw.
 *
 * The cost of packing is that the output needs a PDF 1.5 reader. That is every
 * reader shipped since 2003, and the alternative is leaving the saving on the
 * table for a compatibility case that no longer exists.
 */

import { deflate, filterNames } from './pdf-filters.js';
import {
  name, Name, PdfStream, PdfString, Ref,
} from './pdf-objects.js';

/** Objects per packed stream. Larger batches compress a shade better and cost
 *  a reader more to unpack for one lookup; this is roughly where writers sit. */
const PACK_SIZE = 200;

/** Below this, deflating a raw stream costs more in the filter name than it
 *  saves. Above it, it always wins on the kind of data a PDF stores. */
const WORTH_DEFLATING = 128;

class ByteWriter {
  constructor() {
    this.chunks = [];
    this.length = 0;
  }

  raw(bytes) {
    this.chunks.push(bytes);
    this.length += bytes.length;
  }

  ascii(text) {
    const out = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i += 1) out[i] = text.charCodeAt(i) & 0xff;
    this.raw(out);
  }
}

/** PDF has no exponent notation, so String(1e-7) would corrupt the file at
 *  exactly the point it looked fine. The same guard images-to-pdf keeps. */
function formatNumber(value) {
  if (!Number.isFinite(value)) return '0';
  if (Number.isInteger(value) && Math.abs(value) < 1e15) return String(value);
  return value.toFixed(6).replace(/\.?0+$/, '') || '0';
}

/** A name, with the bytes that would end it written as #xx. */
function formatName(value) {
  let out = '/';
  for (const char of value) {
    const code = char.charCodeAt(0);
    const plain = code > 0x20 && code < 0x7f && !'()<>[]{}/%#'.includes(char);
    out += plain ? char : `#${code.toString(16).padStart(2, '0')}`;
  }
  return out;
}

/**
 * Every string is written as hex.
 *
 * A literal string has to escape brackets and backslashes and gets the octal
 * treatment for everything else; hex has one rule and cannot be got wrong. It
 * costs about twice the bytes, which for the strings that appear in a
 * dictionary - titles, dates, field names - is a rounding error against the
 * streams beside them.
 */
function formatString(bytes) {
  let out = '<';
  for (const byte of bytes) out += byte.toString(16).padStart(2, '0');
  return `${out}>`;
}

/**
 * One value as text, with references renumbered on the way through.
 *
 * @param {*} value
 * @param {Map<number, number>} renumber old object number to new
 */
function serialize(value, renumber, depth = 0) {
  if (depth > 200) return 'null';

  if (value === null || value === undefined) return 'null';
  if (value === true) return 'true';
  if (value === false) return 'false';
  if (typeof value === 'number') return formatNumber(value);
  if (value instanceof Name) return formatName(value.value);
  if (value instanceof PdfString) return formatString(value.bytes);

  if (value instanceof Ref) {
    const renamed = renumber.get(value.num);
    // A reference to an object that is not in the file is legal and means
    // null. Writing it as such is what a reader would have done anyway.
    return renamed === undefined ? 'null' : `${renamed} 0 R`;
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => serialize(item, renumber, depth + 1)).join(' ')}]`;
  }

  if (value instanceof PdfStream) return serializeDict(value.dict, renumber, depth);
  if (value instanceof Map) return serializeDict(value, renumber, depth);

  return 'null';
}

function serializeDict(dict, renumber, depth) {
  let out = '<<';
  for (const [key, item] of dict) {
    out += `${formatName(key)} ${serialize(item, renumber, depth + 1)} `;
  }
  return `${out.trimEnd()}>>`;
}

/* --------------------------------------------------------- what to keep */

/**
 * Walk out from the trailer and collect what is still in use.
 *
 * Breadth-first, so that objects a reader wants together land near each other
 * in the finished file. It costs nothing to do it in that order and it is the
 * one thing here that resembles linearisation, which this tool otherwise does
 * not attempt.
 */
export function reachable(doc, roots) {
  const found = new Set();
  const queue = [];

  const visit = (value, depth) => {
    if (depth > 500) return;
    if (value instanceof Ref) {
      if (found.has(value.num)) return;
      found.add(value.num);
      queue.push(value.num);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) visit(item, depth + 1);
      return;
    }
    const dict = value instanceof PdfStream ? value.dict : value;
    if (dict instanceof Map) {
      for (const item of dict.values()) visit(item, depth + 1);
    }
  };

  for (const root of roots) visit(root, 0);

  // An index rather than shift(), which on a document with a hundred thousand
  // objects turns the walk into a quadratic one.
  for (let at = 0; at < queue.length; at += 1) {
    visit(doc.getObject(queue[at]), 0);
  }

  return found;
}

/**
 * Take out what a document remembers about where it came from.
 *
 * The same argument the EXIF tool makes, applied to a different container. A
 * PDF routinely carries the name and version of the program that made it, when
 * it was made and last touched, and - in /PieceInfo - a private blob that a
 * layout application left behind so it could re-import its own work. That last
 * one is occasionally megabytes. None of it is needed to display the document,
 * and a PDF is a thing people send to other people.
 */
export function stripMetadata(doc) {
  let removed = 0;
  const kill = (dict, key) => {
    if (dict instanceof Map && dict.has(key)) {
      dict.delete(key);
      removed += 1;
    }
  };

  for (const value of doc.objects.values()) {
    const dict = value instanceof PdfStream ? value.dict : value;
    if (!(dict instanceof Map)) continue;
    kill(dict, 'Metadata');    // the XMP packet, usually a few kilobytes of XML
    kill(dict, 'PieceInfo');   // private application data
    kill(dict, 'LastModified');
    kill(dict, 'Thumb');       // a page thumbnail no reader has needed in years
  }

  doc.trailer.delete('Info');
  return removed;
}

/* ------------------------------------------------------------ the rewrite */

/**
 * @param {import('./pdf-reader.js').PdfDocument} doc
 * @param {{onProgress?: (done: number, total: number) => void,
 *          recompress?: boolean, signal?: AbortSignal}} options
 * @returns {Promise<Blob>}
 */
export async function writeDocument(doc, { onProgress, recompress = true, signal } = {}) {
  const roots = [doc.trailer.get('Root')];
  if (doc.trailer.has('Info')) roots.push(doc.trailer.get('Info'));

  const live = reachable(doc, roots);
  const numbers = [...live].sort((a, b) => a - b);

  // New numbers, contiguous from 1. Object 0 is the head of the free list and
  // belongs to no one, which is why counting starts where it does.
  const renumber = new Map();
  numbers.forEach((num, index) => renumber.set(num, index + 1));

  const streams = [];
  const packable = [];

  for (const num of numbers) {
    const value = doc.getObject(num);
    if (value instanceof PdfStream) streams.push({ num, value });
    else packable.push({ num, value });
  }

  const writer = new ByteWriter();
  // 1.5 or better, because the output uses object streams. Claiming a lower
  // version than the file actually needs is how a document opens everywhere
  // except in the one reader that believed the header.
  const version = doc.version >= '1.5' ? doc.version : '1.5';
  writer.ascii(`%PDF-${version}\n`);
  writer.raw(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  /** New object number to byte offset, or to (stream, index) when packed. */
  const located = new Map();
  /** Object streams and the cross-reference stream take their numbers from
   *  here, after every object the document itself needs. */
  const spare = { next: numbers.length + 1 };
  let done = 0;
  const total = streams.length + packable.length;

  for (const { num, value } of streams) {
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    const id = renumber.get(num);
    located.set(id, { offset: writer.length });

    let { raw } = value;
    if (recompress && shouldDeflate(doc, value)) {
      try {
        const packed = await deflate(raw);
        if (packed.length < raw.length) {
          raw = packed;
          value.dict.set('Filter', name('FlateDecode'));
        }
      } catch {
        // Compression is an optimisation. The stream goes out as it came in.
      }
    }
    value.dict.set('Length', raw.length);

    writer.ascii(`${id} 0 obj\n${serializeDict(value.dict, renumber, 0)}\nstream\n`);
    writer.raw(raw);
    writer.ascii('\nendstream\nendobj\n');

    done += 1;
    if (done % 24 === 0) {
      onProgress?.(done, total);
      await breathe();
    }
  }

  await packObjects(writer, packable, renumber, located, spare, () => {
    done += 1;
    if (done % 200 === 0) onProgress?.(done, total);
  });

  await writeXrefStream(writer, located, renumber, doc, spare);

  onProgress?.(total, total);
  return new Blob(writer.chunks, { type: 'application/pdf' });
}

/** Yield to the main thread so the progress bar moves and Cancel can be hit. */
function breathe() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Uncompressed, big enough to be worth it, and not something whose bytes have
 *  a codec of their own. */
function shouldDeflate(doc, stream) {
  if (stream.raw.length < WORTH_DEFLATING) return false;
  return filterNames(stream.dict, (v) => doc.resolve(v)).length === 0;
}

/**
 * Pack the plain objects into object streams.
 *
 * The layout is a header of "number offset" pairs, then the objects one after
 * another with nothing between them - no "12 0 obj", no "endobj", because the
 * header already said which is which. That saves about twenty bytes an object
 * before deflate even runs, and deflate then has every dictionary in the batch
 * to find repetition in.
 */
async function packObjects(writer, packable, renumber, located, spare, tick) {
  for (let start = 0; start < packable.length; start += PACK_SIZE) {
    const batch = packable.slice(start, start + PACK_SIZE);

    let header = '';
    let body = '';
    for (const { num, value } of batch) {
      const id = renumber.get(num);
      header += `${id} ${body.length} `;
      body += `${serialize(value, renumber, 0)}\n`;
      tick();
    }

    const text = header + body;
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i += 1) bytes[i] = text.charCodeAt(i) & 0xff;

    // The container itself is an object and needs a number. They are handed
    // out above the document's own, which is why the size written into the
    // trailer counts these as well.
    const id = spare.next;
    spare.next += 1;
    batch.forEach(({ num }, index) => {
      located.set(renumber.get(num), { stm: id, index });
    });

    let data = bytes;
    let filter = '';
    try {
      const packed = await deflate(bytes);
      if (packed.length < bytes.length) {
        data = packed;
        filter = ' /Filter /FlateDecode';
      }
    } catch {
      // An uncompressed object stream is still a valid object stream.
    }

    located.set(id, { offset: writer.length });
    writer.ascii(`${id} 0 obj\n<< /Type /ObjStm /N ${batch.length} `
      + `/First ${header.length}${filter} /Length ${data.length} >>\nstream\n`);
    writer.raw(data);
    writer.ascii('\nendstream\nendobj\n');

    await breathe();
  }
}

/**
 * The cross-reference stream, which is the table as compressed binary.
 *
 * Three columns: what kind of entry this is, where it lives, and a third field
 * that means the generation for a plain object and the position within the
 * container for a packed one. /W says how many bytes each column takes, and
 * four for the offset covers a file up to four gigabytes, which is past what a
 * browser tab can hold in memory anyway.
 */
async function writeXrefStream(writer, located, renumber, doc, spare) {
  const id = spare.next;
  spare.next += 1;
  const offset = writer.length;
  located.set(id, { offset });

  const count = id + 1;
  const rows = new Uint8Array(count * 7);

  // Entry zero: the head of the free list, which is always this and always
  // has to be there even in a file with nothing free in it.
  rows[0] = 0;
  rows[5] = 0xff;
  rows[6] = 0xff;

  for (const [num, place] of located) {
    const at = num * 7;
    if (at + 7 > rows.length) continue;
    if ('offset' in place) {
      rows[at] = 1;
      rows[at + 1] = (place.offset >>> 24) & 0xff;
      rows[at + 2] = (place.offset >>> 16) & 0xff;
      rows[at + 3] = (place.offset >>> 8) & 0xff;
      rows[at + 4] = place.offset & 0xff;
    } else {
      rows[at] = 2;
      rows[at + 1] = (place.stm >>> 24) & 0xff;
      rows[at + 2] = (place.stm >>> 16) & 0xff;
      rows[at + 3] = (place.stm >>> 8) & 0xff;
      rows[at + 4] = place.stm & 0xff;
      rows[at + 5] = (place.index >>> 8) & 0xff;
      rows[at + 6] = place.index & 0xff;
    }
  }

  let data = rows;
  let filter = '';
  try {
    const packed = await deflate(rows);
    if (packed.length < rows.length) {
      data = packed;
      filter = ' /Filter /FlateDecode';
    }
  } catch {
    // Uncompressed is allowed here too.
  }

  const root = renumber.get(refNumber(doc.trailer.get('Root')));
  const info = renumber.get(refNumber(doc.trailer.get('Info')));

  // No /ID, for the same reason images-to-pdf leaves it out: the usual way to
  // fill it is a hash of the time and the file name, and neither belongs in a
  // document this tool has spent its whole run taking things out of.
  let entries = `<< /Type /XRef /Size ${count} /W [1 4 2] `
    + `/Root ${root} 0 R`;
  if (info !== undefined) entries += ` /Info ${info} 0 R`;
  entries += `${filter} /Length ${data.length} >>`;

  writer.ascii(`${id} 0 obj\n${entries}\nstream\n`);
  writer.raw(data);
  writer.ascii('\nendstream\nendobj\n');
  writer.ascii(`startxref\n${offset}\n%%EOF\n`);
}

function refNumber(value) {
  return value instanceof Ref ? value.num : -1;
}
