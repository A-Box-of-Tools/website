/**
 * The other half of the PDF grammar: the language a page is drawn in.
 *
 * `objects.js` reads the file's skeleton - dictionaries, arrays, streams, the
 * references between them. None of that says what is on a page. What is on a
 * page is a separate little stack language living inside a stream, and it is
 * the only place the words themselves exist:
 *
 *     BT /F1 12 Tf 72 700 Td (Dear Mr Smith) Tj ET
 *
 * The merger and the compressor both got away without ever reading it. One
 * moves pages whole and the other re-encodes the pictures they refer to, so
 * for both of them a content stream is a run of bytes to copy. This tool has
 * to open it, find where in it a particular word was shown, and write the
 * stream back without that word in it - which is the entire difference between
 * taking the words out and drawing a rectangle over them.
 *
 * WHY THIS HANDS BACK BYTE RANGES
 *
 * Every operator carries the offsets it occupied in the stream it came from,
 * and `edit.js` splices rather than re-serialises. The alternative - parse
 * everything, write everything back - would put every number, every path and
 * every image on this page through a printer of ours, and a redaction tool is
 * the last place to be rewriting the parts nobody asked about. Splicing means
 * a page comes out byte for byte as it went in apart from the operators that
 * showed the removed words, which is a claim worth being able to make.
 *
 * The grammar is postfix: operands accumulate, an operator consumes them.
 * There is no way to tell an operator from a keyword operand by shape, so the
 * rule used here is the one every reader uses - a token that begins like a
 * value is a value, and anything else is the operator that ends the line.
 */

import { Name, Parser, PdfString } from './objects.js';

/** Bytes that begin an operand: a name, a string, an array, a dictionary, a
 *  number. Everything else at that position is the operator. */
function startsValue(code) {
  if (code === 0x2f || code === 0x28 || code === 0x5b || code === 0x3c) return true;
  if (code >= 0x30 && code <= 0x39) return true;
  return code === 0x2b || code === 0x2d || code === 0x2e;
}

/**
 * One content stream as a list of operators.
 *
 * Malformed input is stepped over rather than thrown on. A content stream is
 * not the file's structure: a stray bracket in the middle of a page costs that
 * one drawing operation, where refusing the page would cost the redaction.
 *
 * @param {Uint8Array} bytes  the stream, already decoded by filters.js
 * @returns {{name: string, args: any[], start: number, end: number}[]}
 *   `start` is where this operator's first operand began and `end` is just
 *   past the operator itself, so [start, end) is the whole of it.
 */
export function lex(bytes) {
  const ops = [];
  const parser = new Parser(bytes, 0);
  let args = [];
  let argsStart = -1;

  const flush = () => {
    args = [];
    argsStart = -1;
  };

  for (;;) {
    parser.skip();
    if (parser.pos >= bytes.length) break;
    const at = parser.pos;

    if (startsValue(bytes[at])) {
      let value;
      try {
        value = parser.parseValue();
      } catch {
        // An unclosed array or a string that runs off the end. Move on by one
        // byte; the operators after it are still worth having.
        parser.pos = at + 1;
        continue;
      }
      if (parser.pos <= at) parser.pos = at + 1; // a parser that made no progress
      if (argsStart < 0) argsStart = at;
      args.push(value);
      continue;
    }

    const word = parser.peekKeyword();
    if (!word) {
      // A ']' or '>' with nothing open, which is what a truncated array leaves
      // behind. Not an operator, and not worth an entry.
      parser.pos = at + 1;
      continue;
    }
    parser.pos = at + word.length;

    if (word === 'BI') {
      const image = readInlineImage(parser, bytes, argsStart < 0 ? at : argsStart);
      if (image) ops.push(image);
      flush();
      continue;
    }

    ops.push({
      name: word,
      args,
      start: argsStart < 0 ? at : argsStart,
      end: parser.pos,
    });
    flush();
  }

  return ops;
}

/**
 * BI ... ID <bytes> EI, the one place a content stream stops being tokens.
 *
 * An inline image is a small picture written into the page rather than kept as
 * an object, and after `ID` comes raw image data that can contain anything at
 * all - including the two bytes `EI`, and including something that lexes as
 * fifty operators. Getting its length wrong does not lose an image; it loses
 * the rest of the page, because the lexer resumes in the middle of binary and
 * everything after it is nonsense.
 *
 * So the length is computed from the dictionary whenever the data is
 * unfiltered, which is the case the arithmetic is exact for, and only falls
 * back to searching for a delimited `EI` when a filter makes the size
 * unknowable.
 */
function readInlineImage(parser, bytes, start) {
  const dict = new Map();

  for (;;) {
    parser.skip();
    if (parser.pos >= bytes.length) return null;
    if (parser.eatKeyword('ID')) break;
    if (bytes[parser.pos] !== 0x2f) {
      // Not a name where a key belongs. The image is unreadable from here.
      return null;
    }
    let key;
    let value;
    try {
      key = parser.parseValue();
      value = parser.parseValue();
    } catch {
      return null;
    }
    dict.set(key?.value ?? '', value);
  }

  // Exactly one whitespace byte separates ID from the data, and it belongs to
  // the syntax rather than to the image.
  const data = parser.pos + 1;
  const length = unfilteredLength(dict);
  let end = length < 0 ? findEndOfImage(bytes, data) : data + length;

  if (end < 0 || end > bytes.length) end = bytes.length;
  parser.pos = end;
  parser.skip();
  parser.eatKeyword('EI');

  return {
    name: 'INLINE_IMAGE', args: [dict], start, end: parser.pos,
  };
}

/** How many bytes of pixels an unfiltered inline image holds, or -1 when a
 *  filter means only the encoder knows. */
function unfilteredLength(dict) {
  const filter = dict.get('F') ?? dict.get('Filter');
  if (filter !== undefined && filter !== null
      && !(Array.isArray(filter) && filter.length === 0)) return -1;

  const width = dict.get('W') ?? dict.get('Width');
  const height = dict.get('H') ?? dict.get('Height');
  if (!Number.isFinite(width) || !Number.isFinite(height)) return -1;

  const bits = dict.get('BPC') ?? dict.get('BitsPerComponent') ?? 8;
  const mask = dict.get('IM') ?? dict.get('ImageMask');
  const space = dict.get('CS') ?? dict.get('ColorSpace');
  const components = mask === true ? 1 : componentsIn(space?.value ?? space);
  if (components < 0) return -1;

  return Math.ceil((width * bits * components) / 8) * height;
}

function componentsIn(space) {
  if (space === undefined || space === null) return 1;
  if (space === 'G' || space === 'DeviceGray' || space === 'CalGray') return 1;
  if (space === 'RGB' || space === 'DeviceRGB' || space === 'CalRGB') return 3;
  if (space === 'CMYK' || space === 'DeviceCMYK') return 4;
  if (space === 'I' || space === 'Indexed') return 1;
  return -1; // a named colour space in the page's resources; not worth resolving
}

/** `EI` with whitespace in front of it and nothing regular behind it. Used only
 *  when the dictionary cannot say how long the data is. */
function findEndOfImage(bytes, from) {
  for (let at = from; at + 1 < bytes.length; at += 1) {
    if (bytes[at] !== 0x45 || bytes[at + 1] !== 0x49) continue;
    if (at > from && !isWhite(bytes[at - 1])) continue;
    const after = bytes[at + 2];
    if (after === undefined || isWhite(after) || isDelimiter(after)) return at - 1;
  }
  return -1;
}

function isWhite(code) {
  return code === 0x20 || code === 0x0a || code === 0x0d || code === 0x09
    || code === 0x00 || code === 0x0c;
}

function isDelimiter(code) {
  return '()<>[]{}/%'.includes(String.fromCharCode(code));
}

/* --------------------------------------------------------------- writing */

/**
 * A number, in the spelling PDF allows.
 *
 * The same guard the writer keeps, and for the same reason: JavaScript prints
 * 0.0000001 as `1e-7`, PDF has no exponent notation, and a reader meeting one
 * stops parsing the page at that point. Six decimal places is past what any
 * text position needs - a point is 1/72 of an inch.
 *
 * The clamp is the other half of the same guard. Above 1e21 JavaScript reaches
 * for the exponent whichever way the number is printed, `toFixed` included, so
 * a value that large has to be refused rather than formatted. Nothing on a real
 * page comes near it - the largest page a PDF can describe is 14400 units - so
 * a coordinate out here is a broken matrix, and a broken matrix should draw
 * something absurd rather than corrupt the stream after it.
 */
export function formatNumber(value) {
  if (!Number.isFinite(value)) return '0';
  const held = Math.max(-1e10, Math.min(1e10, value));
  if (Number.isInteger(held)) return String(held);
  const text = held.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  return text === '' || text === '-' ? '0' : text;
}

/**
 * A string as hex.
 *
 * Every string this tool writes back into a content stream is one it has just
 * cut a word out of, so it is written in the one spelling that has no escaping
 * rules to get wrong. Twice the bytes of a literal string, against a stream
 * that is about to be deflated anyway.
 */
export function formatString(bytes) {
  let out = '<';
  for (const byte of bytes) out += byte.toString(16).padStart(2, '0');
  return `${out}>`;
}

/** A name, with the bytes that would end it written as #xx. */
function formatName(value) {
  let out = '/';
  for (const character of value) {
    const code = character.charCodeAt(0);
    const plain = code > 0x20 && code < 0x7f && !'()<>[]{}/%#'.includes(character);
    out += plain ? character : `#${code.toString(16).padStart(2, '0')}`;
  }
  return out;
}

/**
 * An operand, written back out.
 *
 * Only one operator needs this: `BDC`, whose second operand is a dictionary
 * written into the page rather than kept as an object, and which may hold the
 * /ActualText that a reader copies in place of the glyphs. Rewriting that
 * dictionary means rewriting the whole operator, keys this tool has no opinion
 * about included, so it needs a printer for the value grammar. Nothing else
 * here is re-serialised - the rest of the page is spliced.
 */
export function formatValue(value, depth = 0) {
  if (depth > 32) return 'null';
  if (value === null || value === undefined) return 'null';
  if (value === true) return 'true';
  if (value === false) return 'false';
  if (typeof value === 'number') return formatNumber(value);
  if (value instanceof Name) return formatName(value.value);
  if (value instanceof PdfString) return formatString(value.bytes);
  if (Array.isArray(value)) {
    return `[${value.map((item) => formatValue(item, depth + 1)).join(' ')}]`;
  }
  if (value instanceof Map) {
    const pairs = [...value].map(([key, item]) => (
      `${formatName(key)} ${formatValue(item, depth + 1)}`));
    return `<<${pairs.join(' ')}>>`;
  }
  return 'null';
}

/** ASCII text as bytes, for splicing back into a stream. */
export function encode(text) {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) out[i] = text.charCodeAt(i) & 0xff;
  return out;
}

/**
 * Replace runs of a stream with new bytes.
 *
 * @param {Uint8Array} bytes
 * @param {{start: number, end: number, text: string}[]} splices  in any order
 * @returns {Uint8Array}
 */
export function applySplices(bytes, splices) {
  if (!splices.length) return bytes;

  const ordered = [...splices].sort((a, b) => a.start - b.start);
  const parts = [];
  let at = 0;

  for (const splice of ordered) {
    if (splice.start < at) continue; // overlapping edits: the first one wins
    parts.push(bytes.subarray(at, splice.start));
    parts.push(encode(splice.text));
    at = splice.end;
  }
  parts.push(bytes.subarray(at));

  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let write = 0;
  for (const part of parts) {
    out.set(part, write);
    write += part.length;
  }
  return out;
}
