/**
 * A growable byte buffer.
 *
 * Both halves of the writer build their output one byte at a time and neither
 * knows how long it will be: the LZW coder cannot know until it has compressed
 * the pixels, and the file cannot know until every frame is in. Pushing onto a
 * plain array and calling Uint8Array.from at the end works, but it stores each
 * byte as a boxed number in the meantime, which for a few megabytes of pixel
 * data is a lot of memory to ask for and give back.
 *
 * So: one Uint8Array that doubles when it is full, and a `done()` that hands
 * back a view of the part actually written. Thirty lines, and it is the only
 * allocation strategy in this tool.
 */

export class ByteSink {
  constructor(capacity = 4096) {
    this.bytes = new Uint8Array(capacity);
    this.length = 0;
  }

  /** Make room for at least `extra` more bytes. */
  reserve(extra) {
    const needed = this.length + extra;
    if (needed <= this.bytes.length) return;

    let size = this.bytes.length * 2;
    while (size < needed) size *= 2;

    const grown = new Uint8Array(size);
    grown.set(this.bytes.subarray(0, this.length));
    this.bytes = grown;
  }

  byte(value) {
    this.reserve(1);
    this.bytes[this.length] = value & 0xff;
    this.length += 1;
  }

  /** A 16-bit value, little-endian - which is the only byte order GIF uses. */
  u16(value) {
    this.reserve(2);
    this.bytes[this.length] = value & 0xff;
    this.bytes[this.length + 1] = (value >> 8) & 0xff;
    this.length += 2;
  }

  write(run) {
    this.reserve(run.length);
    this.bytes.set(run, this.length);
    this.length += run.length;
  }

  /** ASCII only: every literal string in a GIF file is a tag or a signature. */
  ascii(text) {
    this.reserve(text.length);
    for (let i = 0; i < text.length; i += 1) {
      this.bytes[this.length + i] = text.charCodeAt(i) & 0xff;
    }
    this.length += text.length;
  }

  /** The bytes written so far. A view, not a copy. */
  done() {
    return this.bytes.subarray(0, this.length);
  }
}
