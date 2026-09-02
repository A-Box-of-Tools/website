/**
 * The PDF object syntax: the half of the format that images-to-pdf never
 * needed.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/pdf-objects.js and
 * the build copies it to <tool>/src/shared/pdf-objects.js for every tool that
 * asks for it with `js_parts = ["pdf-objects", ...]`. It is one of four that
 * travel together - the grammar here, the reader, the filters and the writer -
 * and the compressor, the merger and the redactor all ask for all four. They
 * were three byte-identical copies each until the tests could follow a
 * `./shared/` import; see tests/js/resolve-shared.mjs.
 *
 * images-to-pdf writes documents, so it could get away with a writer and no
 * reader at all - a PDF it produced was one it had just built in memory. The
 * tools that ask for this open files somebody else made, which means the
 * whole grammar: numbers, names, strings in two spellings, arrays,
 * dictionaries, streams, and the indirect reference that ties them together.
 *
 * The grammar is small. Eight kinds of value, one of which is a dictionary
 * with a byte stream stapled to it, and a reference written as "12 0 R". What
 * makes real files awkward is not the grammar but everything around it, and
 * the notes below say where each concession is and which broken-file case put
 * it there.
 *
 * Values are modelled so that reading and writing are the same shape:
 *
 *   number   -> a JS number            null    -> null
 *   boolean  -> a JS boolean           name    -> Name
 *   string   -> PdfString (bytes)      array   -> a JS array
 *   dict     -> a Map, keyed by name without the slash
 *   stream   -> PdfStream: a Map, plus the raw bytes exactly as they were
 *   ref      -> Ref
 *
 * A Map rather than a plain object because PDF names may be anything at all -
 * "/constructor" and "/__proto__" are legal keys, and a plain object would
 * hand an oddly shaped document a prototype to walk into.
 */

/** A PDF name, written /Like /This. The slash is punctuation, not part of it. */
export class Name {
  constructor(value) {
    this.value = value;
  }
}

/** Names are compared constantly, so keep one instance per spelling. */
const NAMES = new Map();

export function name(value) {
  let made = NAMES.get(value);
  if (!made) {
    made = new Name(value);
    NAMES.set(value, made);
  }
  return made;
}

/** True when `value` is the name `wanted`. Undefined and nulls answer false. */
export function isName(value, wanted) {
  return value instanceof Name && value.value === wanted;
}

/** An indirect reference: "12 0 R", the object number and its generation. */
export class Ref {
  constructor(num, gen) {
    this.num = num;
    this.gen = gen;
  }

  get key() {
    return `${this.num},${this.gen}`;
  }
}

/**
 * A PDF string, kept as bytes.
 *
 * Not as a JS string: the bytes may be PDFDocEncoding, UTF-16, or - in a
 * ToUnicode map or a form field - not text at all. Decoding on the way in and
 * re-encoding on the way out would change files this tool is only meant to be
 * passing through.
 */
export class PdfString {
  constructor(bytes) {
    this.bytes = bytes;
  }
}

/** A dictionary with bytes attached. `raw` is the stream still encoded, exactly
 *  as it appeared in the file; decoding happens in filters.js, on demand. */
export class PdfStream {
  constructor(dict, raw) {
    this.dict = dict;
    this.raw = raw;
  }
}

/* ------------------------------------------------------------ byte classes */

const SPACE = new Uint8Array(256);
for (const code of [0x00, 0x09, 0x0a, 0x0c, 0x0d, 0x20]) SPACE[code] = 1;

const DELIM = new Uint8Array(256);
for (const char of '()<>[]{}/%') DELIM[char.charCodeAt(0)] = 1;

/** Neither whitespace nor a delimiter: the bytes a name or keyword is made of. */
function regular(code) {
  return !SPACE[code] && !DELIM[code];
}

function isDigit(code) {
  return code >= 0x30 && code <= 0x39;
}

function hexValue(code) {
  if (code >= 0x30 && code <= 0x39) return code - 0x30;
  if (code >= 0x41 && code <= 0x46) return code - 0x37;
  if (code >= 0x61 && code <= 0x66) return code - 0x57;
  return -1;
}

/** ASCII bytes as a string, for keywords and numbers. Not for file content. */
export function ascii(bytes, from, to) {
  let text = '';
  const end = Math.min(to, bytes.length);
  for (let i = from; i < end; i += 1) text += String.fromCharCode(bytes[i]);
  return text;
}

/** Find `needle` (ASCII) in `bytes` at or after `from`; -1 when it is not there. */
export function indexOfAscii(bytes, needle, from = 0) {
  const first = needle.charCodeAt(0);
  const last = bytes.length - needle.length;
  for (let i = Math.max(0, from); i <= last; i += 1) {
    if (bytes[i] !== first) continue;
    let j = 1;
    while (j < needle.length && bytes[i + j] === needle.charCodeAt(j)) j += 1;
    if (j === needle.length) return i;
  }
  return -1;
}

/** The same search, backwards from `from`. Used to find the last startxref. */
export function lastIndexOfAscii(bytes, needle, from = bytes.length) {
  const first = needle.charCodeAt(0);
  for (let i = Math.min(from, bytes.length - needle.length); i >= 0; i -= 1) {
    if (bytes[i] !== first) continue;
    let j = 1;
    while (j < needle.length && bytes[i + j] === needle.charCodeAt(j)) j += 1;
    if (j === needle.length) return i;
  }
  return -1;
}

/* --------------------------------------------------------------- the parser */

/**
 * A file that is not shaped the way a PDF is.
 *
 * The message is a phrase key and `values` fills its blanks. This file is
 * copied byte for byte into every language and cannot reach the DOM, so
 * the sentence is the page's to compose - see shared/js/phrases.js.
 */
export class PdfSyntaxError extends Error {
  constructor(key, values) {
    super(key);
    this.name = 'PdfSyntaxError';
    this.values = values;
  }
}

/**
 * A cursor over the file's bytes that hands back one value at a time.
 *
 * One of these is made per object parsed rather than one for the whole file,
 * which costs nothing - it holds a reference to the same array - and means a
 * malformed object cannot leave a shared cursor stranded in the middle of a
 * stream.
 */
export class Parser {
  /**
   * @param {Uint8Array} bytes the whole file
   * @param {number} pos where to start
   * @param {(ref: Ref) => any} [resolve] used only for an indirect /Length
   */
  constructor(bytes, pos = 0, resolve = null) {
    this.bytes = bytes;
    this.pos = pos;
    this.resolve = resolve;
  }

  /** Whitespace, and comments, which run to the end of the line. */
  skip() {
    const { bytes } = this;
    while (this.pos < bytes.length) {
      const code = bytes[this.pos];
      if (SPACE[code]) {
        this.pos += 1;
      } else if (code === 0x25) { // '%'
        while (this.pos < bytes.length
               && bytes[this.pos] !== 0x0a && bytes[this.pos] !== 0x0d) this.pos += 1;
      } else {
        return;
      }
    }
  }

  /** The keyword at the cursor without consuming it, or '' if there is none. */
  peekKeyword() {
    this.skip();
    let end = this.pos;
    while (end < this.bytes.length && regular(this.bytes[end])) end += 1;
    return ascii(this.bytes, this.pos, end);
  }

  /** Consume `word` if it is next. @returns {boolean} */
  eatKeyword(word) {
    if (this.peekKeyword() !== word) return false;
    this.pos += word.length;
    return true;
  }

  /**
   * One value.
   *
   * `depth` is not a style choice: a dictionary whose values are dictionaries
   * is ordinary, but a file can be written - by accident or otherwise - with
   * enough nesting to exhaust the stack, and this runs on bytes a stranger
   * sent. Two hundred is far past anything a real document needs.
   */
  parseValue(depth = 0) {
    if (depth > 200) throw new PdfSyntaxError('pdf.deep');
    this.skip();
    if (this.pos >= this.bytes.length) throw new PdfSyntaxError('pdf.short');

    const code = this.bytes[this.pos];

    if (code === 0x2f) return this.parseName();            // /
    if (code === 0x28) return this.parseLiteralString();   // (
    if (code === 0x5b) return this.parseArray(depth);      // [
    if (code === 0x3c) {                                   // < or <<
      return this.bytes[this.pos + 1] === 0x3c
        ? this.parseDictOrStream(depth)
        : this.parseHexString();
    }
    if (isDigit(code) || code === 0x2b || code === 0x2d || code === 0x2e) {
      return this.parseNumberOrRef();
    }

    const word = this.peekKeyword();
    if (word === 'true') { this.pos += 4; return true; }
    if (word === 'false') { this.pos += 5; return false; }
    if (word === 'null') { this.pos += 4; return null; }

    // ']' and '>>' reach here when an array or dictionary is missing a value.
    // Reported rather than skipped: a silent guess here is how a parser ends
    // up writing out a document that is subtly not the one it read.
    // Two keys rather than one with a clause spliced into it: a token out
    // of the file is data and goes in a blank, but "byte" is a word.
    throw word
      ? new PdfSyntaxError('pdf.unexpected', { found: word, at: this.pos })
      : new PdfSyntaxError('pdf.unexpectedbyte',
        { hex: code.toString(16), at: this.pos });
  }

  parseName() {
    this.pos += 1; // the slash
    const { bytes } = this;
    let value = '';
    while (this.pos < bytes.length && regular(bytes[this.pos])) {
      let code = bytes[this.pos];
      // #41 is how a name carries a byte that would otherwise end it. Names
      // with spaces or slashes in them are rare but entirely legal.
      if (code === 0x23 && hexValue(bytes[this.pos + 1]) >= 0
          && hexValue(bytes[this.pos + 2]) >= 0) {
        code = hexValue(bytes[this.pos + 1]) * 16 + hexValue(bytes[this.pos + 2]);
        this.pos += 2;
      }
      value += String.fromCharCode(code);
      this.pos += 1;
    }
    return name(value);
  }

  /**
   * A number, or the "12 0 R" that only looks like one until the third token.
   *
   * There is no way to tell them apart without looking ahead, so the cursor is
   * saved and put back when the guess is wrong. That happens constantly - every
   * plain integer in the file takes this path - so it stays cheap: two integer
   * scans and no allocation.
   */
  parseNumberOrRef() {
    const start = this.pos;
    const first = this.readNumber();

    if (Number.isInteger(first) && first >= 0) {
      const save = this.pos;
      this.skip();
      if (isDigit(this.bytes[this.pos])) {
        const gen = this.readNumber();
        if (Number.isInteger(gen) && gen >= 0) {
          this.skip();
          if (this.bytes[this.pos] === 0x52 && !regular(this.bytes[this.pos + 1] ?? 0x20)) {
            this.pos += 1; // R
            return new Ref(first, gen);
          }
        }
      }
      this.pos = save;
    }

    if (!Number.isFinite(first)) throw new PdfSyntaxError(`bad number at ${start}`);
    return first;
  }

  readNumber() {
    const { bytes } = this;
    const start = this.pos;
    if (bytes[this.pos] === 0x2b || bytes[this.pos] === 0x2d) this.pos += 1;
    while (this.pos < bytes.length
           && (isDigit(bytes[this.pos]) || bytes[this.pos] === 0x2e
               || bytes[this.pos] === 0x2d)) {
      // A '-' in the middle of a number is a real thing scanners emit
      // ("1.0-2"); readers take the number up to that point, and so does this.
      if (bytes[this.pos] === 0x2d && this.pos > start) break;
      this.pos += 1;
    }
    const value = Number.parseFloat(ascii(bytes, start, this.pos));
    return Number.isFinite(value) ? value : NaN;
  }

  /** (A string), with balanced brackets and backslash escapes. */
  parseLiteralString() {
    this.pos += 1; // (
    const { bytes } = this;
    const out = [];
    let depth = 1;

    while (this.pos < bytes.length) {
      let code = bytes[this.pos];
      this.pos += 1;

      if (code === 0x5c) { // backslash
        code = bytes[this.pos];
        this.pos += 1;
        if (code === 0x6e) { out.push(0x0a); continue; }        // n
        if (code === 0x72) { out.push(0x0d); continue; }        // r
        if (code === 0x74) { out.push(0x09); continue; }        // t
        if (code === 0x62) { out.push(0x08); continue; }        // b
        if (code === 0x66) { out.push(0x0c); continue; }        // f
        if (code === 0x0a) continue;                            // line continuation
        if (code === 0x0d) {
          if (bytes[this.pos] === 0x0a) this.pos += 1;
          continue;
        }
        if (code >= 0x30 && code <= 0x37) {                     // \ddd, octal
          let value = code - 0x30;
          for (let i = 0; i < 2; i += 1) {
            const next = bytes[this.pos];
            if (next < 0x30 || next > 0x37) break;
            value = value * 8 + (next - 0x30);
            this.pos += 1;
          }
          out.push(value & 0xff);
          continue;
        }
        out.push(code); // \( \) \\ and anything else: the byte itself
        continue;
      }

      if (code === 0x28) depth += 1;
      if (code === 0x29) {
        depth -= 1;
        if (depth === 0) break;
      }
      out.push(code);
    }

    return new PdfString(Uint8Array.from(out));
  }

  /** <48656C6C6F>. An odd number of digits means the last one is a high nibble. */
  parseHexString() {
    this.pos += 1; // <
    const { bytes } = this;
    const out = [];
    let high = -1;

    while (this.pos < bytes.length && bytes[this.pos] !== 0x3e) {
      const value = hexValue(bytes[this.pos]);
      this.pos += 1;
      if (value < 0) continue; // whitespace, and anything else, is ignored
      if (high < 0) high = value;
      else { out.push(high * 16 + value); high = -1; }
    }
    if (high >= 0) out.push(high * 16);
    this.pos += 1; // >

    return new PdfString(Uint8Array.from(out));
  }

  parseArray(depth) {
    this.pos += 1; // [
    const out = [];
    for (;;) {
      this.skip();
      if (this.pos >= this.bytes.length) throw new PdfSyntaxError('unclosed array');
      if (this.bytes[this.pos] === 0x5d) { this.pos += 1; return out; }
      out.push(this.parseValue(depth + 1));
    }
  }

  parseDictOrStream(depth) {
    this.pos += 2; // <<
    const dict = new Map();

    for (;;) {
      this.skip();
      if (this.pos >= this.bytes.length) throw new PdfSyntaxError('unclosed dictionary');
      if (this.bytes[this.pos] === 0x3e && this.bytes[this.pos + 1] === 0x3e) {
        this.pos += 2;
        break;
      }
      if (this.bytes[this.pos] !== 0x2f) {
        // A key that is not a name. The file is damaged; skip the token rather
        // than abandon a dictionary that may be almost entirely readable.
        this.parseValue(depth + 1);
        continue;
      }
      const key = this.parseName().value;
      dict.set(key, this.parseValue(depth + 1));
    }

    const save = this.pos;
    if (this.eatKeyword('stream')) return this.readStream(dict);
    this.pos = save;
    return dict;
  }

  /**
   * The bytes after `stream`, which is where trusting the file stops paying.
   *
   * /Length is supposed to say how long the data is, and usually does. When it
   * is missing, indirect and unresolvable, or simply wrong - all three happen,
   * the last one most often in files assembled by scripts - the only honest
   * answer is to find `endstream` and believe that instead. Getting this wrong
   * does not produce a small error: every byte after it is misread.
   */
  readStream(dict) {
    const { bytes } = this;

    // Exactly one CRLF or LF after the keyword, per the spec. A lone CR is not
    // allowed but appears anyway, so it is accepted.
    if (bytes[this.pos] === 0x0d) this.pos += 1;
    if (bytes[this.pos] === 0x0a) this.pos += 1;
    const start = this.pos;

    let length = dict.get('Length');
    if (length instanceof Ref && this.resolve) {
      try {
        length = this.resolve(length);
      } catch {
        length = null;
      }
    }

    let end = -1;
    if (Number.isInteger(length) && length >= 0 && start + length <= bytes.length) {
      // Trust it only if what follows really is the end of a stream.
      const after = new Parser(bytes, start + length);
      after.skip();
      if (ascii(bytes, after.pos, after.pos + 9) === 'endstream') end = start + length;
    }

    if (end < 0) {
      end = indexOfAscii(bytes, 'endstream', start);
      if (end < 0) throw new PdfSyntaxError('pdf.noendstream');
      // The EOL before `endstream` is the file's punctuation, not part of the
      // data. Dropping it is what every reader does, and keeping it corrupts
      // anything whose length matters, which is all of them.
      if (bytes[end - 1] === 0x0a) end -= 1;
      if (bytes[end - 1] === 0x0d) end -= 1;
    }

    const raw = bytes.subarray(start, Math.max(start, end));
    const close = indexOfAscii(bytes, 'endstream', end);
    this.pos = close < 0 ? end : close + 9;

    dict.set('Length', raw.length);
    return new PdfStream(dict, raw);
  }
}

/**
 * Parse the body of "12 0 obj ... endobj" at a byte offset.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset where the object number starts
 * @param {(ref: Ref) => any} [resolve]
 * @returns {{num: number, gen: number, value: any}}
 */
export function parseIndirectObject(bytes, offset, resolve) {
  const parser = new Parser(bytes, offset, resolve);
  parser.skip();
  const num = parser.readNumber();
  parser.skip();
  const gen = parser.readNumber();
  if (!parser.eatKeyword('obj')) throw new PdfSyntaxError('pdf.noobj', { at: offset });
  const value = parser.parseValue();
  return { num, gen, value };
}
