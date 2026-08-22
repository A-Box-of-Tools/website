/**
 * The GIF89a writer, and the LZW coder underneath it.
 *
 * A GIF is a header, a palette, and then one block per frame: where it goes,
 * how long it stays, and its pixels as palette indices run through LZW. None of
 * that is a codec in the modern sense - there is no motion estimation and no
 * frequency transform anywhere in it - which is why it can be written out here
 * in a few hundred lines rather than vendored as an engine.
 *
 * Two decisions in this file do most of the work of keeping the file small:
 *
 *   - **One global palette, not one per frame.** A local table costs 768 bytes
 *     a frame, and worse, it makes every frame a different set of colours, so
 *     the same unchanged background quantizes to different indices and the
 *     differencing below finds nothing to skip. One table for the whole
 *     animation is both smaller and what makes the next point possible.
 *   - **Only what changed is stored.** Each frame is written as the smallest
 *     rectangle that differs from the frame before it, with the pixels that did
 *     not change marked transparent and disposal set to "leave it in place", so
 *     the previous frame shows through. A talking head against a still wall
 *     therefore costs a face per frame rather than a picture per frame. The
 *     caller does the comparing - see diffFrame() - because it is the caller
 *     that knows both frames.
 *
 * Written against the GIF89a specification (1990), which is short, freely
 * available, and has not changed since.
 */

/** Sub-block length. The format stores payloads as chunks of at most 255. */
const MAX_BLOCK = 255;

/** The largest code the format allows before the dictionary has to be reset. */
const MAX_CODES = 4096;

const encoder = new TextEncoder();

/** Bytes for a run of ASCII, for the four fixed strings this format has. */
function ascii(text) {
  return encoder.encode(text);
}

/**
 * How many bits an index needs, and therefore how big the colour table is
 * written as. The format stores a power of two from 4 to 256, so a palette of
 * 200 colours is written as 256 and the unused entries are zeroes.
 *
 * Two is the floor rather than one: there is no one-bit LZW code size in this
 * format, so even a two-colour animation codes in two bits and carries a table
 * of four.
 */
export function tableBits(colors) {
  let bits = 2;
  while ((1 << bits) < colors) bits += 1;
  return Math.min(8, bits);
}

/**
 * Pack a payload into the format's sub-blocks: a length byte, up to 255 bytes,
 * repeated, then a zero.
 */
function subBlocks(data) {
  const blocks = Math.ceil(data.length / MAX_BLOCK) || 0;
  const out = new Uint8Array(data.length + blocks + 1);
  let at = 0;
  let from = 0;
  while (from < data.length) {
    const size = Math.min(MAX_BLOCK, data.length - from);
    out[at] = size;
    out.set(data.subarray(from, from + size), at + 1);
    at += size + 1;
    from += size;
  }
  out[at] = 0;
  return out.subarray(0, at + 1);
}

/**
 * GIF's variant of LZW: variable-width codes, LSB first, with an explicit clear
 * code and an end code sitting immediately above the palette.
 *
 * The dictionary is an array rather than a Map because the lookup is the inner
 * loop of the whole tool - it runs once per pixel of every frame - and the key
 * is already a small integer: a prefix code under 4096 and a byte, which pack
 * into twenty bits. A flat Int32Array indexed by that pair answers in one read.
 * Entries hold code + 1 so that zero can mean "not present" and the table can be
 * cleared with fill(0), which is what a dictionary reset has to do.
 *
 * @param {Uint8Array} indices  one palette index per pixel
 * @param {number} minCodeSize  bits per index, at least 2 - the format has no
 *   one-bit code size, so a two-colour image still uses two.
 * @returns {Uint8Array} the code stream, already in sub-blocks and terminated.
 */
export function lzwEncode(indices, minCodeSize) {
  const codeSize = Math.max(2, minCodeSize);
  const clearCode = 1 << codeSize;
  const endCode = clearCode + 1;

  const dictionary = new Int32Array(1 << (12 + 8));
  const out = [];

  let bitBuffer = 0;
  let bitCount = 0;
  let width = codeSize + 1;
  let next = endCode + 1;

  const emit = (code) => {
    bitBuffer |= code << bitCount;
    bitCount += width;
    while (bitCount >= 8) {
      out.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  };

  const reset = () => {
    dictionary.fill(0);
    width = codeSize + 1;
    next = endCode + 1;
  };

  emit(clearCode);

  if (indices.length) {
    let prefix = indices[0];

    for (let i = 1; i < indices.length; i += 1) {
      const k = indices[i];
      const key = (prefix << 8) | k;
      const found = dictionary[key];

      if (found) {
        prefix = found - 1;
        continue;
      }

      emit(prefix);

      if (next < MAX_CODES) {
        dictionary[key] = next + 1;
        // The width grows one code *after* the dictionary passes a power of
        // two, because the decoder adds its own entry a step behind the
        // encoder. Off by one here and the stream decodes to noise.
        if (next === (1 << width) && width < 12) width += 1;
        next += 1;
      } else {
        emit(clearCode);
        reset();
      }

      prefix = k;
    }

    emit(prefix);
  }

  emit(endCode);

  if (bitCount > 0) out.push(bitBuffer & 0xff);

  return subBlocks(Uint8Array.from(out));
}

/**
 * The rectangle in which two frames differ, and the pixels inside it that did
 * not change.
 *
 * Comparison is on palette indices rather than on the original colours, which
 * is the only comparison that is safe: two pixels with the same index paint the
 * same colour, so leaving the earlier one showing is not an approximation of the
 * later one, it is the later one. Comparing source pixels with a tolerance
 * would be a guess, and the guesses accumulate over a frame that is never fully
 * redrawn.
 *
 * @param {Uint8Array} previous  indices of the frame already on screen
 * @param {Uint8Array} current   indices of the frame being written
 * @param {number} width
 * @param {number} height
 * @param {number} transparent   the index reserved for "unchanged"
 * @returns {{x: number, y: number, width: number, height: number,
 *            indices: Uint8Array, transparent: boolean}|null}
 *   null when the two frames are identical and the frame need not be written at
 *   all beyond its delay.
 */
export function diffFrame(previous, current, width, height, transparent) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    for (let x = 0; x < width; x += 1) {
      if (previous[row + x] === current[row + x]) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) return null;

  const boxWidth = maxX - minX + 1;
  const boxHeight = maxY - minY + 1;
  const indices = new Uint8Array(boxWidth * boxHeight);

  let unchanged = 0;
  for (let y = 0; y < boxHeight; y += 1) {
    const from = (y + minY) * width + minX;
    const to = y * boxWidth;
    for (let x = 0; x < boxWidth; x += 1) {
      const before = previous[from + x];
      const after = current[from + x];
      if (before === after) {
        indices[to + x] = transparent;
        unchanged += 1;
      } else {
        indices[to + x] = after;
      }
    }
  }

  return {
    x: minX,
    y: minY,
    width: boxWidth,
    height: boxHeight,
    indices,
    transparent: unchanged > 0,
  };
}

/**
 * Assembles the file.
 *
 * Chunks are kept in a list and handed to a Blob at the end rather than being
 * copied into one growing buffer, so a long animation costs its own size in
 * memory once rather than twice.
 */
export class GifWriter {
  #chunks = [];
  #width;
  #height;
  #bits;
  #bytes = 0;

  /**
   * @param {object} options
   * @param {number} options.width
   * @param {number} options.height
   * @param {Uint8Array} options.palette  RGB triples, at most 256 of them
   * @param {number} [options.loop]  0 for forever, or a repeat count
   * @param {number|null} [options.transparentIndex]  an index held back for the
   *   pixels a frame does not redraw. It is not a colour, so it needs no entry
   *   in the palette - only room for one, which is why it is named here: the
   *   table has to be written large enough to contain it. A palette of 256
   *   colours leaves no room for it and cannot be differenced.
   */
  constructor({ width, height, palette, loop = 0, transparentIndex = null }) {
    this.#width = width;
    this.#height = height;
    this.#bits = tableBits(Math.max(
      palette.length / 3,
      transparentIndex === null ? 0 : transparentIndex + 1,
    ));

    this.#writeHeader(palette, loop);
  }

  get byteLength() {
    return this.#bytes;
  }

  #push(bytes) {
    this.#chunks.push(bytes);
    this.#bytes += bytes.length;
  }

  #writeHeader(palette, loop) {
    this.#push(ascii('GIF89a'));

    const screen = new Uint8Array(7);
    const view = new DataView(screen.buffer);
    view.setUint16(0, this.#width, true);
    view.setUint16(2, this.#height, true);
    // Global table present, eight bits of colour resolution, not sorted, and
    // the table's size as a power of two.
    screen[4] = 0x80 | 0x70 | (this.#bits - 1);
    screen[5] = 0;   // background colour index; nothing here relies on it
    screen[6] = 0;   // pixel aspect ratio: not specified
    this.#push(screen);

    // The table is always a power of two long. A palette of 200 colours is
    // padded with black rather than written short, which the format has no way
    // to express.
    const table = new Uint8Array((1 << this.#bits) * 3);
    table.set(palette.subarray(0, table.length));
    this.#push(table);

    // The looping extension is Netscape's, from 1995, and is still the only way
    // to say "play this again" - it never made it into the specification, and
    // every browser implements it anyway.
    const netscape = new Uint8Array([
      0x21, 0xff, 0x0b,
      ...ascii('NETSCAPE2.0'),
      0x03, 0x01, loop & 0xff, (loop >> 8) & 0xff, 0x00,
    ]);
    this.#push(netscape);
  }

  /**
   * @param {Uint8Array} indices  one index per pixel of this frame's rectangle
   * @param {object} options
   * @param {number} options.delay  centiseconds this frame stays on screen
   * @param {number} [options.x]
   * @param {number} [options.y]
   * @param {number} [options.width]   defaults to the whole picture
   * @param {number} [options.height]
   * @param {number|null} [options.transparent]  index that leaves the previous
   *   frame showing through, or null for an opaque frame
   */
  addFrame(indices, {
    delay, x = 0, y = 0, width = this.#width, height = this.#height, transparent = null,
  }) {
    const control = new Uint8Array(8);
    const view = new DataView(control.buffer);
    control[0] = 0x21;
    control[1] = 0xf9;
    control[2] = 0x04;
    // Disposal method 1 - leave the frame in place - is what makes a partial
    // frame mean anything: the pixels this one does not carry are the ones the
    // last frame left behind. Method 2 (restore to background) would punch a
    // hole instead, which is the classic way a differenced GIF ends up
    // flickering.
    control[3] = (1 << 2) | (transparent === null ? 0 : 1);
    view.setUint16(4, Math.max(0, Math.round(delay)), true);
    control[6] = transparent === null ? 0 : transparent;
    control[7] = 0;
    this.#push(control);

    const descriptor = new Uint8Array(10);
    const descriptorView = new DataView(descriptor.buffer);
    descriptor[0] = 0x2c;
    descriptorView.setUint16(1, x, true);
    descriptorView.setUint16(3, y, true);
    descriptorView.setUint16(5, width, true);
    descriptorView.setUint16(7, height, true);
    descriptor[9] = 0;   // no local colour table, not interlaced
    this.#push(descriptor);

    const minCodeSize = Math.max(2, this.#bits);
    this.#push(new Uint8Array([minCodeSize]));
    this.#push(lzwEncode(indices, minCodeSize));
  }

  /** @returns {Blob} */
  finish() {
    this.#push(new Uint8Array([0x3b]));
    return new Blob(this.#chunks, { type: 'image/gif' });
  }
}
