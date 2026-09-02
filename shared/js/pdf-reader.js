/**
 * Opening a document somebody else wrote.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/pdf-reader.js and the
 * build copies it to <tool>/src/shared/pdf-reader.js. One of the four PDF
 * parts that travel together - see the header of pdf-objects.js - and the one
 * every PDF tool here hands a finished file back to, so that "it opened" is
 * checked by the same code that would have refused it.
 *
 * A PDF is read back to front. The last line but one says `startxref` and a
 * byte offset; at that offset is a cross-reference table saying where every
 * object starts; the trailer beside it says which object is the catalogue. Walk
 * that and you have the file. It is a good design for a format that was meant
 * to be read over a 1994 network connection, because a reader can fetch the
 * one page it wants without the rest.
 *
 * It is also the part of a PDF most likely to be wrong. Offsets drift when a
 * file is edited by something careless, concatenated, mailed through a gateway
 * that rewrote its line endings, or truncated. Every reader in the world has a
 * repair path for this, and so does this one: when the table disagrees with the
 * file, the file wins. `rebuildByScanning` walks the bytes looking for object
 * headers and believes what it finds, which is slower - one pass over the whole
 * file - and right more often.
 *
 * Two things this deliberately does not do:
 *
 *   - **Decrypt.** A document with an /Encrypt dictionary is turned away with a
 *     message saying so. Even the empty-password kind that scanners emit, which
 *     is technically openable, because a tool that quietly stripped a
 *     document's protection would be a different and more surprising tool.
 *   - **Lazily.** Every object is parsed at open. A reader that renders one page
 *     wants the opposite, but this rewrites the whole file, so it needs all of
 *     them anyway, and having them means `resolve` can be an ordinary function
 *     instead of spreading `await` through every caller.
 */

import { decodeStream } from './pdf-filters.js';
import {
  ascii, indexOfAscii, isName, lastIndexOfAscii, Parser, parseIndirectObject,
  PdfStream, PdfSyntaxError, Ref,
} from './pdf-objects.js';

export class NotAPdfError extends Error {}
export class EncryptedPdfError extends Error {}

export class PdfDocument {
  constructor(bytes) {
    this.bytes = bytes;
    /** @type {Map<number, {offset: number}|{stm: number, index: number}>} */
    this.entries = new Map();
    /** @type {Map<number, any>} object number to parsed value */
    this.objects = new Map();
    /** @type {Map} the trailer, merged across an update chain */
    this.trailer = new Map();
    /** Set when the cross-reference table did not survive checking. */
    this.repaired = false;
    /** True when this document was built by stacking incremental updates. */
    this.incremental = false;
    this.version = '1.4';
    /** @type {number[]} objects that were being parsed, for the cycle guard. */
    this.parsing = new Set();
  }

  /**
   * Read a file into a document.
   *
   * @param {Uint8Array} bytes
   * @returns {Promise<PdfDocument>}
   */
  static async open(bytes) {
    const doc = new PdfDocument(bytes);
    doc.readHeader();

    try {
      await doc.readXref();
    } catch {
      doc.entries.clear();
      doc.trailer = new Map();
    }

    if (!doc.looksUsable()) {
      doc.rebuildByScanning();
      doc.repaired = true;
      await doc.expandObjectStreams({ discover: true });
    }

    if (doc.trailer.get('Encrypt')) {
      throw new EncryptedPdfError('read.encrypted');
    }

    doc.loadAll();

    if (!doc.catalog) {
      throw new NotAPdfError('read.nocatalogue');
    }

    return doc;
  }

  readHeader() {
    // The header is allowed to be preceded by junk - a shell script, a mail
    // part - and readers are told to look for it in the first kilobyte.
    const at = indexOfAscii(this.bytes.subarray(0, 1024), '%PDF-');
    if (at < 0) {
      throw new NotAPdfError('read.noheader');
    }
    const found = ascii(this.bytes, at + 5, at + 8);
    if (/^\d\.\d$/.test(found)) this.version = found;
  }

  /** Do we have a catalogue and a plausible number of objects? */
  looksUsable() {
    if (this.entries.size === 0) return false;
    try {
      const root = this.resolve(this.trailer.get('Root'));
      return root instanceof Map && root.size > 0;
    } catch {
      return false;
    }
  }

  /* ------------------------------------------------------- the xref chain */

  async readXref() {
    const at = lastIndexOfAscii(this.bytes, 'startxref',
      this.bytes.length) ?? -1;
    if (at < 0) throw new PdfSyntaxError('pdf.nostartxref');

    const parser = new Parser(this.bytes, at + 9);
    parser.skip();
    let offset = parser.readNumber();

    const seen = new Set();
    let sections = 0;

    while (Number.isInteger(offset) && offset >= 0 && offset < this.bytes.length) {
      if (seen.has(offset)) break; // a /Prev loop; a real file has one
      seen.add(offset);
      sections += 1;

      const trailer = await this.readXrefSection(offset);
      if (!trailer) break;

      // Earlier sections are older, so an entry already present wins. The same
      // rule the file itself uses: the newest table is the one at the end.
      for (const [key, value] of trailer) {
        if (!this.trailer.has(key)) this.trailer.set(key, value);
      }

      // A hybrid file keeps a classic table for old readers and an xref stream
      // beside it holding the objects the old table cannot describe.
      const hybrid = trailer.get('XRefStm');
      if (typeof hybrid === 'number' && !seen.has(hybrid)) {
        seen.add(hybrid);
        try {
          await this.readXrefSection(hybrid);
        } catch {
          // The classic table is still good; a missing hybrid half is survivable.
        }
      }

      offset = trailer.get('Prev');
      if (typeof offset !== 'number') break;
    }

    this.incremental = sections > 1;
    await this.expandObjectStreams();
  }

  /** One section: either a classic `xref` table or an xref stream object. */
  async readXrefSection(offset) {
    const parser = new Parser(this.bytes, offset);
    if (parser.eatKeyword('xref')) return this.readXrefTable(parser);

    const { value } = parseIndirectObject(this.bytes, offset, (ref) => this.resolve(ref));
    if (!(value instanceof PdfStream)) throw new PdfSyntaxError('pdf.noxref');
    await this.readXrefStream(value);
    return value.dict;
  }

  /**
   * The classic table: subsections of twenty-byte lines, then `trailer`.
   *
   * Every line is "nnnnnnnnnn ggggg n" and readers are allowed to seek
   * straight to `first + 20 * n`. This one parses rather than seeks, because a
   * file whose lines are nineteen or twenty-one bytes long - and they exist -
   * is then still readable.
   */
  readXrefTable(parser) {
    for (;;) {
      parser.skip();
      if (parser.eatKeyword('trailer')) {
        const trailer = parser.parseValue();
        return trailer instanceof Map ? trailer : new Map();
      }

      const start = parser.readNumber();
      parser.skip();
      const count = parser.readNumber();
      if (!Number.isInteger(start) || !Number.isInteger(count) || count < 0) {
        throw new PdfSyntaxError('a malformed xref subsection header');
      }

      for (let i = 0; i < count; i += 1) {
        parser.skip();
        const offset = parser.readNumber();
        parser.skip();
        parser.readNumber(); // the generation, which this tool does not keep
        parser.skip();
        const kind = String.fromCharCode(parser.bytes[parser.pos]);
        parser.pos += 1;
        if (kind === 'n' && !this.entries.has(start + i)) {
          this.entries.set(start + i, { offset });
        }
      }
    }
  }

  /**
   * The 1.5 replacement: the table itself as a compressed stream of fixed-width
   * binary fields, which is both smaller and able to describe objects that live
   * inside other objects.
   */
  async readXrefStream(stream) {
    const { bytes } = await decodeStream(stream, (v) => this.resolve(v));
    const widths = (this.resolve(stream.dict.get('W')) ?? []).map((w) => this.resolve(w));
    if (widths.length < 3) throw new PdfSyntaxError('pdf.now');

    const size = this.resolve(stream.dict.get('Size')) ?? 0;
    const index = this.resolve(stream.dict.get('Index')) ?? [0, size];
    const rowBytes = widths.reduce((sum, w) => sum + w, 0);
    if (rowBytes <= 0) throw new PdfSyntaxError('pdf.zerowidth');

    let at = 0;
    const field = (width) => {
      // A width of zero means "the default", which is 1 for the type column
      // and 0 everywhere else. Handled by the callers below.
      let value = 0;
      for (let i = 0; i < width; i += 1) {
        value = value * 256 + (bytes[at] ?? 0);
        at += 1;
      }
      return value;
    };

    for (let pair = 0; pair + 1 < index.length; pair += 2) {
      const start = this.resolve(index[pair]);
      const count = this.resolve(index[pair + 1]);
      for (let i = 0; i < count && at + rowBytes <= bytes.length; i += 1) {
        const type = widths[0] === 0 ? 1 : field(widths[0]);
        const second = field(widths[1]);
        const third = field(widths[2]);
        const num = start + i;
        if (this.entries.has(num)) continue;
        if (type === 1) this.entries.set(num, { offset: second });
        else if (type === 2) this.entries.set(num, { stm: second, index: third });
      }
    }
  }

  /**
   * Pull apart every object stream the table points into.
   *
   * An /ObjStm is a Flate stream holding a run of small objects with a table of
   * offsets at the front - the 1.5 feature that made text-heavy PDFs
   * meaningfully smaller, because a page's dictionaries compress well together
   * and terribly one at a time. This tool writes them too; see writer.js.
   *
   * Done eagerly, and in one pass per stream rather than per object, so that
   * `resolve` below can be synchronous.
   */
  async expandObjectStreams({ discover = false } = {}) {
    const wanted = new Set();
    for (const entry of this.entries.values()) {
      if ('stm' in entry) wanted.add(entry.stm);
    }

    // After a repair there are no type-2 entries to follow, because a scan sees
    // the container - an /ObjStm is an ordinary object with an ordinary header -
    // but not the objects inside it, which have none of their own. Without this
    // a repaired 1.5 file comes back with a page tree full of nulls, which is a
    // worse failure than not opening at all, because it looks like it worked.
    if (discover) {
      for (const num of [...this.entries.keys()]) {
        const value = this.getObject(num);
        if (value instanceof PdfStream && isName(value.dict.get('Type'), 'ObjStm')) {
          wanted.add(num);
        }
      }
    }

    for (const num of wanted) {
      try {
        const container = this.getObject(num);
        if (!(container instanceof PdfStream)) continue;
        const { bytes } = await decodeStream(container, (v) => this.resolve(v));
        const count = this.resolve(container.dict.get('N')) ?? 0;
        const first = this.resolve(container.dict.get('First')) ?? 0;

        const header = new Parser(bytes, 0);
        const pairs = [];
        for (let i = 0; i < count; i += 1) {
          header.skip();
          const objNum = header.readNumber();
          header.skip();
          const offset = header.readNumber();
          if (!Number.isInteger(objNum) || !Number.isInteger(offset)) break;
          pairs.push([objNum, first + offset]);
        }

        for (const [objNum, offset] of pairs) {
          // Only if the table said this object lives here. An object stream may
          // hold a stale copy of something a later update replaced. With no
          // table to consult, anything already found at the top level wins,
          // which is the same rule arrived at from the other direction.
          const entry = this.entries.get(objNum);
          if (discover ? entry !== undefined : (!entry || entry.stm !== num)) continue;
          if (this.objects.has(objNum)) continue;
          try {
            this.objects.set(objNum, new Parser(bytes, offset).parseValue());
          } catch {
            this.objects.set(objNum, null);
          }
        }
      } catch {
        // One unreadable object stream costs the objects inside it, not the
        // document. They resolve to null and the rewrite carries on without.
      }
    }
  }

  /* ---------------------------------------------------------- the repair */

  /**
   * Believe the file rather than its table.
   *
   * One pass looking for "<num> <gen> obj", taking the last of each number,
   * which is the incremental-update rule: a later object supersedes an earlier
   * one with the same number. False positives are possible - those three bytes
   * can occur inside a compressed stream - and are dealt with by requiring the
   * object to parse before it is kept.
   */
  rebuildByScanning() {
    const { bytes } = this;
    this.entries.clear();
    this.objects.clear();

    for (const { num, offset } of scanObjectHeaders(bytes)) {
      this.entries.set(num, { offset });
    }

    // The trailer, or whatever is standing in for one. A classic file has the
    // word; a 1.5 file keeps the same keys in its xref stream's dictionary.
    this.trailer = new Map();
    for (let at = indexOfAscii(bytes, 'trailer'); at >= 0;
      at = indexOfAscii(bytes, 'trailer', at + 7)) {
      try {
        const found = new Parser(bytes, at + 7, (ref) => this.resolve(ref)).parseValue();
        if (found instanceof Map && found.has('Root')) this.trailer = found;
      } catch {
        // Not every occurrence of the word is a trailer.
      }
    }

    if (!this.trailer.has('Root')) this.findRootTheHardWay();
  }

  /** No usable trailer: look for the catalogue itself, and the xref streams
   *  that carry the same keys. The first is what damaged files need; the
   *  second is what a 1.5 file with a broken startxref needs. */
  findRootTheHardWay() {
    for (const num of this.entries.keys()) {
      const value = this.getObject(num);
      const dict = value instanceof PdfStream ? value.dict : value;
      if (!(dict instanceof Map)) continue;

      if (value instanceof PdfStream && isName(dict.get('Type'), 'XRef') && dict.has('Root')) {
        for (const [key, entry] of dict) {
          if (!this.trailer.has(key)) this.trailer.set(key, entry);
        }
      }
      if (isName(dict.get('Type'), 'Catalog') && !this.trailer.has('Root')) {
        this.trailer.set('Root', new Ref(num, 0));
      }
    }
  }

  /* -------------------------------------------------------------- objects */

  /** Parse the object numbered `num`, or hand back the copy already parsed. */
  getObject(num) {
    if (this.objects.has(num)) return this.objects.get(num);

    const entry = this.entries.get(num);
    if (!entry || !('offset' in entry)) {
      this.objects.set(num, null);
      return null;
    }

    // /Length can point at another object, which can - in a broken file - point
    // back here. The guard turns that into a null rather than a locked tab.
    if (this.parsing.has(num)) return null;
    this.parsing.add(num);

    let value = null;
    try {
      const parsed = parseIndirectObject(this.bytes, entry.offset, (ref) => this.resolve(ref));
      // The table said object 12 is here. If the file says otherwise, the
      // table is the thing that is wrong, and the whole document is suspect.
      if (parsed.num === num) value = parsed.value;
      else this.repaired = true;
    } catch {
      value = null;
    } finally {
      this.parsing.delete(num);
    }

    this.objects.set(num, value);
    return value;
  }

  /** Parse everything, so that nothing later has to be async. */
  loadAll() {
    for (const num of [...this.entries.keys()]) this.getObject(num);
  }

  /** A Ref becomes the thing it points at; anything else is itself. */
  resolve(value) {
    let seen = 0;
    let current = value;
    while (current instanceof Ref) {
      if (seen > 64) return null; // a reference cycle
      seen += 1;
      current = this.getObject(current.num);
    }
    return current;
  }

  /** `doc.get(dict, 'Width')`, resolved. */
  get(dict, key) {
    if (!(dict instanceof Map)) return null;
    return this.resolve(dict.get(key));
  }

  get catalog() {
    const root = this.resolve(this.trailer.get('Root'));
    return root instanceof Map ? root : null;
  }

  get info() {
    const info = this.resolve(this.trailer.get('Info'));
    return info instanceof Map ? info : null;
  }

  /**
   * How many pages, counted by walking the tree rather than trusting /Count.
   *
   * They disagree more often than they should, and a page count that is merely
   * copied out of the file is not worth showing beside numbers that were
   * measured.
   */
  countPages() {
    const seen = new Set();
    let pages = 0;

    const walk = (node, depth) => {
      if (!(node instanceof Map) || depth > 64) return;
      const kids = this.get(node, 'Kids');
      if (!Array.isArray(kids)) {
        if (isName(node.get('Type'), 'Page') || node.has('Contents')) pages += 1;
        return;
      }
      for (const kid of kids) {
        const key = kid instanceof Ref ? kid.key : null;
        if (key) {
          if (seen.has(key)) continue;
          seen.add(key);
        }
        walk(this.resolve(kid), depth + 1);
      }
    };

    walk(this.get(this.catalog, 'Pages'), 0);
    return pages;
  }
}

/**
 * Every "12 0 obj" in the file, in the order they appear.
 *
 * Used twice: to rebuild a document whose table is wrong, and to measure how
 * much of a file is old copies of objects that a later edit replaced. Both want
 * the same walk, and the second is the reason this returns every occurrence
 * rather than the last of each number.
 *
 * False positives are possible - those three bytes can occur inside a
 * compressed stream - so the caller checks that what is there parses.
 *
 * @param {Uint8Array} bytes
 * @returns {{num: number, offset: number}[]}
 */
export function scanObjectHeaders(bytes) {
  const found = [];

  for (let at = indexOfAscii(bytes, 'obj'); at >= 0; at = indexOfAscii(bytes, 'obj', at + 3)) {
    // Walk back over "  12 0 " to find where the object number starts.
    let i = at - 1;
    while (i >= 0 && isSpace(bytes[i])) i -= 1;
    const genEnd = i + 1;
    while (i >= 0 && isDigitByte(bytes[i])) i -= 1;
    const genStart = i + 1;
    if (genStart === genEnd) continue;
    while (i >= 0 && isSpace(bytes[i])) i -= 1;
    const numEnd = i + 1;
    if (numEnd === genStart) continue;
    while (i >= 0 && isDigitByte(bytes[i])) i -= 1;
    const numStart = i + 1;
    if (numStart === numEnd) continue;
    // The number must start a token: a digit before it means this is the tail
    // of something longer.
    if (numStart > 0 && !isSpace(bytes[numStart - 1]) && bytes[numStart - 1] !== 0x3e) continue;

    const num = Number.parseInt(ascii(bytes, numStart, numEnd), 10);
    if (Number.isInteger(num)) found.push({ num, offset: numStart });
  }

  return found;
}

function isSpace(code) {
  return code === 0x20 || code === 0x0a || code === 0x0d || code === 0x09
    || code === 0x00 || code === 0x0c;
}

function isDigitByte(code) {
  return code >= 0x30 && code <= 0x39;
}
