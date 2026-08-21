/**
 * The GIF89a writer.
 *
 * Everything here is bookkeeping around what lzw.js produces: a signature, a
 * screen descriptor, a colour table, and then one small header per frame saying
 * how long to hold it and what to do with it afterwards. Not one byte of it is
 * compression, and none of it needs anything the browser does not already have.
 *
 * The shape follows src/mp4.js in the video tool for the same reason: a
 * container is a header wrapped around data somebody else produced, and writing
 * one by hand is a few hundred lines rather than a dependency.
 *
 * WHAT THIS WRITER DOES NOT DO
 *
 * Every frame is written whole, at the full size of the canvas. A GIF may also
 * write a frame as a rectangle covering only the part that changed, which is
 * how a screen recording of a mostly-still window ends up so small. That is a
 * real saving and it is deliberately not here: this tool turns separate
 * pictures into an animation, and separate pictures differ everywhere, so the
 * changed rectangle is almost always the whole frame. A tool that cuts a GIF
 * out of a video would want it, and would be the place to write it.
 *
 * @see https://www.w3.org/Graphics/GIF/spec-gif89a.txt
 */

import { ByteSink } from './bytes.js';
import { lzwEncode } from './lzw.js';

/** Blocks in the data stream, by their leading byte. */
const EXTENSION = 0x21;
const IMAGE_DESCRIPTOR = 0x2c;
const TRAILER = 0x3b;
const GRAPHIC_CONTROL = 0xf9;
const APPLICATION = 0xff;

/**
 * Disposal methods, which say what to leave behind when a frame's time is up.
 *
 * KEEP is right for opaque frames that cover the whole canvas: the next frame
 * paints straight over this one and nothing has to be cleared. RESTORE_BG is
 * what transparency needs, because otherwise the transparent parts of the next
 * frame show the previous one through them, and an animation of separate
 * pictures turns into a pile of them.
 */
const DISPOSAL_KEEP = 1;
const DISPOSAL_RESTORE_BG = 2;

/** The largest a GIF can say it is: both fields are 16 bits. */
export const MAX_SIDE = 65535;

/**
 * Round a colour table up to the power of two the format insists on.
 *
 * A table is 2, 4, 8 ... 256 entries and its size is stored as the exponent
 * minus one, in three bits. Padding is black, and unreferenced, so it costs
 * three bytes per unused entry and nothing else.
 *
 * @returns {{table: Uint8Array, depth: number}} depth is bits per index, 1..8
 */
export function padPalette(palette) {
  const colours = Math.max(1, Math.floor(palette.length / 3));

  let depth = 1;
  while ((1 << depth) < colours) depth += 1;
  if (depth > 8) throw new RangeError(`a colour table holds at most 256 colours, got ${colours}`);

  const table = new Uint8Array((1 << depth) * 3);
  table.set(palette.subarray(0, colours * 3));
  return { table, depth };
}

/**
 * The LZW minimum code size for a table of this depth.
 *
 * Never below 2, even for a two-colour image where one bit per pixel would do.
 * A one-bit code size is unrepresentable in the coder - the clear and end codes
 * would not fit beside the two colours - and the specification rules it out
 * for exactly that reason.
 */
const codeSizeFor = (depth) => Math.max(2, depth);

/**
 * A GIF being written, one frame at a time.
 *
 * Frames are appended as they are encoded rather than collected and written at
 * the end, so the only pixels in memory at once are the frame being worked on.
 * A hundred-frame animation is a real thing somebody will make, and holding all
 * hundred as RGBA would be several hundred megabytes.
 */
export class GifWriter {
  /**
   * @param {object} options
   * @param {number} options.width
   * @param {number} options.height
   * @param {Uint8Array} [options.palette]  a table shared by every frame
   * @param {number|null} [options.loop]  0 for forever, n to play n times, or
   *   null to write no loop block at all - which is how you say "play once" in
   *   a way every decoder agrees about
   */
  constructor({ width, height, palette = null, loop = 0 }) {
    if (!(width >= 1 && width <= MAX_SIDE) || !(height >= 1 && height <= MAX_SIDE)) {
      throw new RangeError(`a GIF is 1..${MAX_SIDE} pixels each way, got ${width}x${height}`);
    }

    this.width = Math.floor(width);
    this.height = Math.floor(height);
    this.out = new ByteSink(1 << 16);
    this.frames = 0;

    const global = palette ? padPalette(palette) : null;
    this.global = global;

    this.out.ascii('GIF89a');

    // The logical screen descriptor. The three middle bits of the packed byte
    // are the "colour resolution", which says how many bits of colour the
    // original had; nothing reads it, and every encoder writes the table's own
    // depth there.
    this.out.u16(this.width);
    this.out.u16(this.height);
    this.out.byte(
      (global ? 0x80 : 0)
      | (((global ? global.depth : 8) - 1) << 4)
      | (global ? global.depth - 1 : 0),
    );
    this.out.byte(0); // background colour index
    this.out.byte(0); // pixel aspect ratio: 0 means "square", i.e. do not adjust

    if (global) this.out.write(global.table);

    if (loop !== null) this.writeLoop(loop);
  }

  /**
   * The Netscape application extension, which is the only reason a GIF loops.
   *
   * It is not in the specification - it is a private block from Navigator 2.0
   * that everything has implemented since, which is why it is written as an
   * application extension with a name and a version in it rather than as a
   * field of its own.
   */
  writeLoop(times) {
    const out = this.out;
    out.byte(EXTENSION);
    out.byte(APPLICATION);
    out.byte(11);           // the length of the two strings below
    out.ascii('NETSCAPE');
    out.ascii('2.0');
    out.byte(3);            // the length of this sub-block
    out.byte(1);            // sub-block id: the loop counter
    out.u16(Math.max(0, Math.min(65535, Math.floor(times))));
    out.byte(0);            // block terminator
  }

  /**
   * Append one frame.
   *
   * @param {object} frame
   * @param {Uint8Array} frame.indices  one palette index per pixel, row-major
   * @param {Uint8Array} [frame.palette]  a table for this frame alone; without
   *   one the frame uses the writer's shared table
   * @param {number} frame.delay  hundredths of a second to hold it
   * @param {number} [frame.transparentIndex]  -1 for none
   */
  addFrame({ indices, palette = null, delay, transparentIndex = -1 }) {
    if (indices.length !== this.width * this.height) {
      throw new RangeError(
        `frame is ${indices.length} pixels, expected ${this.width * this.height}`,
      );
    }

    const local = palette ? padPalette(palette) : null;
    const active = local ?? this.global;
    if (!active) throw new Error('a frame needs either a shared palette or one of its own');

    const out = this.out;
    const transparent = transparentIndex >= 0;

    // The graphic control extension: the delay, and what to do afterwards.
    out.byte(EXTENSION);
    out.byte(GRAPHIC_CONTROL);
    out.byte(4);
    out.byte(((transparent ? DISPOSAL_RESTORE_BG : DISPOSAL_KEEP) << 2) | (transparent ? 1 : 0));
    out.u16(Math.max(0, Math.min(65535, Math.round(delay))));
    out.byte(transparent ? transparentIndex : 0);
    out.byte(0);

    // The image descriptor. Always the whole canvas - see the note at the top.
    out.byte(IMAGE_DESCRIPTOR);
    out.u16(0);
    out.u16(0);
    out.u16(this.width);
    out.u16(this.height);
    out.byte(local ? 0x80 | (local.depth - 1) : 0);
    if (local) out.write(local.table);

    const minCodeSize = codeSizeFor(active.depth);
    out.byte(minCodeSize);
    writeSubBlocks(out, lzwEncode(indices, minCodeSize));

    this.frames += 1;
  }

  /** The finished file. Bytes rather than a Blob: what to wrap them in is the
   *  caller's business, and the tests would only have to unwrap it again. */
  finalize() {
    if (this.frames === 0) throw new Error('a GIF needs at least one frame');
    this.out.byte(TRAILER);
    return this.out.done();
  }
}

/**
 * Cut a run of bytes into the sub-blocks the format stores data in: a length
 * byte, up to 255 bytes, and a zero at the end. The length is one byte, which
 * is the whole reason this exists.
 */
function writeSubBlocks(out, data) {
  for (let at = 0; at < data.length; at += 255) {
    const run = data.subarray(at, Math.min(at + 255, data.length));
    out.byte(run.length);
    out.write(run);
  }
  out.byte(0);
}
