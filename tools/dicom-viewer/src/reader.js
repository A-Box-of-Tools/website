/**
 * A cursor over the file's bytes that refuses to read past the end, and that
 * can be told which way round the numbers are.
 *
 * Two things make this different from the byte reader in `gif-analyzer/`.
 *
 * **Endianness is a property of the file, not of the format.** A DICOM dataset
 * is little-endian in every transfer syntax anyone still writes, and
 * big-endian in one retired one that hospital archives are still full of. The
 * bytes of the File Meta group are always little-endian regardless, so a
 * single file can need both within a few hundred bytes of each other.
 *
 * **A short read is expected, not exceptional.** This reader is pointed at
 * whatever came off a CD, and half of what a viewer is wanted for is the file
 * that is damaged. So `Truncated` carries the offset it stopped at, and the
 * parse above catches it and keeps everything it had already read rather than
 * throwing the file away over its last element.
 */

/** A read that ran off the end. Carries where, so the page can say. */
export class Truncated extends Error {
  constructor(at, wanted, available) {
    super(`the file ends at ${available} bytes; ${wanted} more were needed at ${at}`);
    this.name = 'Truncated';
    this.at = at;
    this.wanted = wanted;
    this.available = available;
  }
}

export class ByteReader {
  /**
   * @param {Uint8Array} bytes
   * @param {number} [at]      where to start
   * @param {number} [end]     one past the last byte this reader may touch
   */
  constructor(bytes, at = 0, end = bytes.length) {
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    this.at = at;
    this.end = Math.min(end, bytes.length);
    this.little = true;
  }

  get left() {
    return this.end - this.at;
  }

  get done() {
    return this.at >= this.end;
  }

  need(count) {
    if (count < 0 || this.at + count > this.end) {
      throw new Truncated(this.at, count, this.end);
    }
  }

  u8() {
    this.need(1);
    return this.bytes[this.at++];
  }

  u16() {
    this.need(2);
    const value = this.view.getUint16(this.at, this.little);
    this.at += 2;
    return value;
  }

  u32() {
    this.need(4);
    const value = this.view.getUint32(this.at, this.little);
    this.at += 4;
    return value;
  }

  /** A view of the next `count` bytes. Not a copy: nothing here writes to them. */
  slice(count) {
    this.need(count);
    const out = this.bytes.subarray(this.at, this.at + count);
    this.at += count;
    return out;
  }

  skip(count) {
    this.need(count);
    this.at += count;
  }

  /**
   * `count` bytes as ASCII.
   *
   * Only ever used for the four-byte magic and the two letters of a value
   * representation, both of which are defined as ASCII. Text that a person
   * wrote goes through `decodeText` in values.js instead, because that has to
   * know what character set the file declared.
   */
  ascii(count) {
    let out = '';
    for (const byte of this.slice(count)) out += String.fromCharCode(byte);
    return out;
  }
}
