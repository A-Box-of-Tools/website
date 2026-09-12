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
 *   - **Decrypt on its own.** A document with an /Encrypt dictionary is turned
 *     away with a message saying so - even the empty-password kind that
 *     scanners emit, which is technically openable - unless the caller passes
 *     an `unlock` function to `open`. One tool does: /unlock-pdf/, whose whole
 *     job is taking that protection off and which asks the visitor before it
 *     does. Everything else here still refuses, because a tool that quietly
 *     stripped a document's protection on the way to doing something else
 *     would be a surprising tool.
 *
 *     What this file knows about encryption is only how to *apply* a cipher:
 *     which strings and streams are covered by one, which are exempt, and when
 *     the key has to exist. The ciphers, the key derivation and the password
 *     itself are the caller's, in shared/js/pdf-crypt.js, which only the two
 *     tools that deal in encryption ask for, so the four that refuse encrypted
 *     files carry no crypto to refuse them with.
 *   - **Lazily.** Every object is parsed at open. A reader that renders one page
 *     wants the opposite, but this rewrites the whole file, so it needs all of
 *     them anyway, and having them means `resolve` can be an ordinary function
 *     instead of spreading `await` through every caller.
 */

import { decodeStream, filterNames } from './pdf-filters.js';
import {
  ascii, indexOfAscii, isName, lastIndexOfAscii, Name, Parser, parseIndirectObject,
  PdfStream, PdfString, PdfSyntaxError, Ref,
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

    /** The caller's `unlock`, or null when it did not offer one. */
    this.unlock = null;
    /**
     * The cipher this document is under: null once it is known there is none,
     * and undefined until the question has been asked. The difference matters -
     * `setUpCrypt` is called from three places and must do its work once.
     * @type {{decryptString: Function, decryptStream: Function,
     *         encryptMetadata: boolean, filter: Function}|null|undefined}
     */
    this.crypt = undefined;
    /** The /Encrypt dictionary's own object number: the one thing in an
     *  encrypted file that is not itself encrypted. */
    this.encryptNum = -1;
  }

  /**
   * Read a file into a document.
   *
   * @param {Uint8Array} bytes
   * @returns {Promise<PdfDocument>}
   */
  static async open(bytes, { unlock = null } = {}) {
    const doc = new PdfDocument(bytes);
    doc.unlock = unlock;
    doc.readHeader();

    try {
      await doc.readXref();
    } catch (error) {
      // "This is encrypted" and "the password was wrong" are answers, not
      // damage. Falling through to the repair below would scan the whole file,
      // find exactly the same objects, fail to read them for exactly the same
      // reason, and tell the visitor their document was broken.
      if (error instanceof EncryptedPdfError || error?.fromUnlock) throw error;
      doc.entries.clear();
      doc.trailer = new Map();
    }

    if (!doc.looksUsable()) {
      doc.rebuildByScanning();
      doc.repaired = true;
      // Before the object streams rather than after: an /ObjStm in an
      // encrypted file is encrypted, so unpacking one without the key gives a
      // page tree full of nulls instead of an error.
      await doc.setUpCrypt();
      await doc.expandObjectStreams({ discover: true });
    }

    // The single refusal point. Reached already in both paths above when the
    // file is encrypted; still here because a file whose xref chain read
    // cleanly and whose catalogue looked fine has been through neither.
    await doc.setUpCrypt();

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
    await this.setUpCrypt();
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

  /* ----------------------------------------------------------- encryption */

  /**
   * Work out whether this document is encrypted, and if so get the key.
   *
   * Called three times on the way through `open` and does its work on the
   * first, because the answer decides whether the steps after it can read
   * anything at all. The order it sits in is the whole subtlety here: an
   * object stream in an encrypted file is encrypted as a stream, so it has to
   * be decrypted before it is unpacked, and the objects that come out of it
   * are then already in the clear and must not be decrypted a second time.
   */
  async setUpCrypt() {
    if (this.crypt !== undefined) return;

    // The presence of the entry decides this, not what it resolves to. An
    // /Encrypt pointing at an object that is not there is a broken encrypted
    // file, and the strings and streams in it are still ciphertext - treating
    // it as unencrypted would hand every caller a document full of noise
    // instead of refusing it.
    const ref = this.trailer.get('Encrypt');
    if (!ref) {
      this.crypt = null;
      return;
    }

    if (!this.unlock) throw new EncryptedPdfError('read.encrypted');

    this.encryptNum = ref instanceof Ref ? ref.num : -1;

    try {
      // Possibly not a dictionary, per the paragraph above. What to say about
      // that belongs to the caller, which is the half that has a page to say
      // it on.
      this.crypt = await this.unlock(this.resolve(ref), this);
    } catch (error) {
      // Marked so `open` can tell a refused password from a damaged file and
      // not answer the first with the second. Nothing else reads this.
      if (error instanceof Error) error.fromUnlock = true;
      throw error;
    }

    // Anything parsed while looking for the key was read as ciphertext - the
    // /Length values the xref chain resolved, and whatever they dragged in.
    // Working out which of them mattered costs more than parsing them again.
    this.objects.clear();
  }

  /**
   * Undo the document's encryption on one object, in place.
   *
   * Every string and every stream in an encrypted PDF is enciphered under a
   * key derived from the document key and the *object's own number*, so that
   * two identical strings in different objects do not encipher alike. That is
   * why this takes the number and the generation, and why it can only be done
   * to an object whose number is known - which top-level objects have in their
   * header, and objects unpacked from an /ObjStm do not need, because the
   * container was decrypted whole.
   *
   * Four things in an encrypted file are not encrypted, and each of them
   * corrupts the document quietly if this gets it wrong:
   *
   *   - the /Encrypt dictionary, whose /O and /U are what the password is
   *     checked against;
   *   - cross-reference streams, which a reader has to find the file with
   *     before it could possibly have a key;
   *   - the XMP metadata packet, when /EncryptMetadata is false - which is how
   *     a document says "index me, but do not read me";
   *   - any stream whose filter chain names /Crypt with /Identity, which is
   *     the format's way of exempting one stream by hand.
   */
  decryptObject(value, num, gen) {
    if (!this.crypt || num === this.encryptNum) return value;

    if (value instanceof PdfStream) {
      const filter = this.streamFilterName(value.dict);
      if (filter !== null) {
        value.raw = this.crypt.decryptStream(value.raw, num, gen, filter);
      }
    }

    // The strings go through whatever the document's string filter is, which
    // is a separate choice from the stream one and is usually the same.
    const seen = new Set();
    const walk = (item, depth) => {
      if (depth > 200) return item;

      if (item instanceof PdfString) {
        return new PdfString(this.crypt.decryptString(item.bytes, num, gen));
      }

      if (Array.isArray(item)) {
        for (let i = 0; i < item.length; i += 1) item[i] = walk(item[i], depth + 1);
        return item;
      }

      const dict = item instanceof PdfStream ? item.dict : item;
      if (dict instanceof Map && !seen.has(dict)) {
        seen.add(dict);
        // Safe to write back while iterating: every key already exists.
        for (const [key, entry] of dict) dict.set(key, walk(entry, depth + 1));
      }

      return item;
    };

    return walk(value, 0);
  }

  /**
   * Which crypt filter covers this stream's bytes, or null for "none".
   *
   * A name rather than a boolean because a document may define several - /CF
   * is a table of them - and a stream may name the one it wants in its own
   * filter chain. In practice files define StdCF and use it for everything,
   * and the only other value anybody writes is /Identity.
   *
   * The /Crypt entry is taken out of the chain on the way past. Undoing it is
   * this file's job and it has now been done; leaving it there would hand
   * pdf-filters.js a filter it is right to refuse.
   */
  streamFilterName(dict) {
    if (isName(dict.get('Type'), 'XRef')) return null;
    if (isName(dict.get('Type'), 'Metadata') && !this.crypt.encryptMetadata) return null;

    const names = filterNames(dict, (v) => this.resolve(v));
    const at = names.indexOf('Crypt');
    if (at < 0) return this.crypt.streamFilter;

    const parms = this.resolve(dict.get('DecodeParms') ?? dict.get('DP'));
    const entry = this.resolve(Array.isArray(parms) ? parms[at] : parms);
    const named = entry instanceof Map ? this.resolve(entry.get('Name')) : null;

    dropFilterAt(dict, at);
    // The default when a /Crypt filter names nothing is /Identity: the entry
    // exists precisely to say "not this one".
    return named instanceof Name && named.value !== 'Identity' ? named.value : null;
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
      if (parsed.num === num) {
        // Here rather than in a pass afterwards: this is the one place an
        // object's generation is known, and the key depends on it. The header
        // is believed over the table, which throws the generation away.
        value = this.decryptObject(parsed.value, num, parsed.gen);
      } else this.repaired = true;
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

/**
 * Take entry `at` out of a stream's /Filter and its /DecodeParms together.
 *
 * The two lists are positional, so removing from one without the other shifts
 * every later filter on to the wrong parameters - which on a Flate stream with
 * a predictor is a picture full of diagonal streaks rather than an error.
 */
function dropFilterAt(dict, at) {
  const filter = dict.get('Filter');
  if (Array.isArray(filter)) {
    filter.splice(at, 1);
    if (filter.length === 1) dict.set('Filter', filter[0]);
    else if (filter.length === 0) dict.delete('Filter');
  } else {
    dict.delete('Filter');
  }

  const key = dict.has('DecodeParms') ? 'DecodeParms' : 'DP';
  const parms = dict.get(key);
  if (Array.isArray(parms)) {
    parms.splice(at, 1);
    if (parms.length === 0) dict.delete(key);
  } else if (parms !== undefined) {
    dict.delete(key);
  }
}

function isSpace(code) {
  return code === 0x20 || code === 0x0a || code === 0x0d || code === 0x09
    || code === 0x00 || code === 0x0c;
}

function isDigitByte(code) {
  return code >= 0x30 && code <= 0x39;
}
