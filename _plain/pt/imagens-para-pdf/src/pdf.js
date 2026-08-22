/**
 * A PDF writer, written out the way src/mp4.js in the Images to Video tool
 * writes an MP4: a container built by hand, so that nothing has to be fetched
 * to make one.
 *
 * A PDF is a list of numbered objects, a cross-reference table saying what byte
 * each one starts at, and a trailer pointing at the catalogue. That is the whole
 * format as far as this file is concerned. Everything here writes those three
 * things and nothing else - there is no parser, no reader, and no general
 * purpose object model, because a tool that only ever puts pictures on pages
 * needs none of it.
 *
 * Bytes are accumulated as an array of chunks and handed to a Blob at the end.
 * The image streams are the large part and they are pushed in whole, so the
 * peak memory cost is roughly the size of the finished file rather than twice
 * it, which a single growing string or ArrayBuffer would have cost.
 */

/** Points per inch. PDF's default user space unit is 1/72 inch. */
export const PT_PER_INCH = 72;
/** Points per millimetre. */
export const PT_PER_MM = 72 / 25.4;

/**
 * Format a number for a content stream.
 *
 * PDF has no exponent notation, so `String(1e-7)` would write "1e-7" and the
 * file would be corrupt at exactly the point it looked fine. Four decimal
 * places is finer than a printer can resolve and keeps every value this tool
 * produces well clear of that.
 */
export function num(value) {
  if (!Number.isFinite(value)) return '0';
  const fixed = value.toFixed(4);
  // Trim the trailing zeros a fixed-point conversion leaves behind, so a page
  // box reads "595.2756 841.8898" rather than dragging four zeros around.
  return fixed.replace(/\.?0+$/, '') || '0';
}

/** Latin-1 bytes for the structural parts of the file, which are all ASCII. */
function latin1(text) {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) out[i] = text.charCodeAt(i) & 0xff;
  return out;
}

/**
 * A PDF text string, written as UTF-16BE hex.
 *
 * The alternative - a literal (string) - has to escape parentheses and
 * backslashes and cannot carry anything outside Latin-1 without the same BOM
 * anyway. Hex has one rule and no escaping, so a document title containing a
 * bracket, an em dash or an emoji cannot break the file.
 */
export function textString(value) {
  let hex = 'FEFF';
  for (const unit of utf16Units(value)) hex += unit.toString(16).padStart(4, '0').toUpperCase();
  return `<${hex}>`;
}

function* utf16Units(value) {
  for (let i = 0; i < value.length; i += 1) yield value.charCodeAt(i);
}

export class PdfWriter {
  constructor() {
    /** @type {Uint8Array[]} */
    this.chunks = [];
    this.length = 0;
    /** Byte offset of each object, indexed by id - 1. */
    this.offsets = [];

    // The second line is a comment holding four bytes above 127. It is in every
    // PDF for one reason: it tells anything moving the file around - an FTP
    // client in the 1990s, a mail gateway now - that this is binary and must
    // not have its line endings "helpfully" translated.
    this.raw(latin1('%PDF-1.7\n'));
    this.raw(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));
  }

  raw(bytes) {
    this.chunks.push(bytes);
    this.length += bytes.length;
  }

  ascii(text) {
    this.raw(latin1(text));
  }

  /** Claim the next object number without writing anything yet. */
  reserve() {
    this.offsets.push(0);
    return this.offsets.length;
  }

  /** Write a reserved object whose body is a dictionary or other plain syntax. */
  object(id, body) {
    this.offsets[id - 1] = this.length;
    this.ascii(`${id} 0 obj\n${body}\nendobj\n`);
  }

  /**
   * Write a stream object: a dictionary, then the bytes it describes.
   *
   * `entries` is written as-is between the dictionary braces; /Length is added
   * here because only this method knows it, and getting it wrong is the classic
   * way to produce a PDF that opens in one reader and not another.
   */
  stream(id, entries, data) {
    this.offsets[id - 1] = this.length;
    this.ascii(`${id} 0 obj\n<<${entries} /Length ${data.length}>>\nstream\n`);
    this.raw(data);
    this.ascii('\nendstream\nendobj\n');
  }

  /**
   * Write the cross-reference table and trailer, and hand back the file.
   *
   * Every entry in the table is exactly twenty bytes - ten digits, a space,
   * five digits, a space, one letter, and a two byte ending - because readers
   * are allowed to seek straight to `first + 20 * n` rather than parse it.
   */
  finish({ root, info }) {
    const start = this.length;
    const count = this.offsets.length + 1;

    let table = `xref\n0 ${count}\n0000000000 65535 f\r\n`;
    for (const offset of this.offsets) {
      table += `${String(offset).padStart(10, '0')} 00000 n\r\n`;
    }
    this.ascii(table);

    // No /ID. It is optional for a file that is not encrypted and not being
    // updated incrementally, and the usual way to fill it - a hash of the time
    // and the file name - would put something in the document that this tool
    // has spent the rest of its existence keeping out of it.
    const trailer = info
      ? `<< /Size ${count} /Root ${root} 0 R /Info ${info} 0 R >>`
      : `<< /Size ${count} /Root ${root} 0 R >>`;
    this.ascii(`trailer\n${trailer}\nstartxref\n${start}\n%%EOF\n`);

    return new Blob(this.chunks, { type: 'application/pdf' });
  }
}
