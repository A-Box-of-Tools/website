/**
 * A cursor over the file's bytes, which refuses to read past the end.
 *
 * Every other reader in this repository could assume it was looking at
 * something this repository had written. This one cannot: a GIF analyzer is
 * pointed at files from anywhere, including files that are half a download, or
 * a JPEG with the wrong extension, or a GIF somebody has deliberately made
 * malformed. So the one thing this file exists to guarantee is that a short
 * read throws a `Truncated` with an offset in it, rather than quietly handing
 * back `undefined` and letting a length field become `NaN` three functions
 * later.
 *
 * Everything is little-endian, because everything in a GIF is.
 */

/**
 * A read that ran off the end of the file. Carries where, so the page can say.
 *
 * The message is a phrase key; the three numbers are its blanks, and they are
 * on the error already for callers that want them on their own.
 */
export class Truncated extends Error {
  constructor(at, wanted, available) {
    super('read.truncated');
    this.name = 'Truncated';
    this.at = at;
    this.wanted = wanted;
    this.available = available;
  }
}

const latin1 = new TextDecoder('latin1');

export class ByteReader {
  /** @param {Uint8Array} bytes */
  constructor(bytes) {
    this.bytes = bytes;
    this.at = 0;
  }

  /** How many bytes are still ahead of the cursor. */
  get left() {
    return this.bytes.length - this.at;
  }

  get done() {
    return this.at >= this.bytes.length;
  }

  need(count) {
    if (this.at + count > this.bytes.length) {
      throw new Truncated(this.at, count, this.bytes.length);
    }
  }

  /** The next byte, without moving. -1 past the end, which is not a byte value. */
  peek() {
    return this.at < this.bytes.length ? this.bytes[this.at] : -1;
  }

  u8() {
    this.need(1);
    return this.bytes[this.at++];
  }

  u16() {
    this.need(2);
    const value = this.bytes[this.at] | (this.bytes[this.at + 1] << 8);
    this.at += 2;
    return value;
  }

  /** A view of the next `count` bytes. Not a copy: nothing here modifies them. */
  slice(count) {
    this.need(count);
    const out = this.bytes.subarray(this.at, this.at + count);
    this.at += count;
    return out;
  }

  /**
   * `count` bytes as text.
   *
   * Latin-1 rather than UTF-8 on purpose. GIF predates Unicode and its two
   * string fields - the signature and an application extension's name - are
   * defined as bytes; decoding them as UTF-8 turns a stray high byte into a
   * replacement character and loses which byte it was.
   */
  ascii(count) {
    return latin1.decode(this.slice(count));
  }

  skip(count) {
    this.need(count);
    this.at += count;
  }
}

/** The same decoding, for bytes already in hand. */
export const text = (bytes) => latin1.decode(bytes);
