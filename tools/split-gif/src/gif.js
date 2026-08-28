/**
 * The GIF reader: the container, and the LZW coder underneath it.
 *
 * This is the mirror image of the writer in `/gif-maker/`, and it is written
 * from the same document - the GIF89a specification of 1990, which is short,
 * freely available, and has not changed since. Reading one is a header, a
 * colour table, and then a stream of blocks: an extension carrying how long the
 * next picture is held, an image descriptor saying where it goes, and its
 * pixels as palette indices run through LZW.
 *
 * WHY THIS IS HAND-WRITTEN WHEN THE BROWSER CAN ALREADY DECODE A GIF
 *
 * The browser can draw one. It cannot hand you the parts. `<img>` gives an
 * animation that plays; `drawImage` of one gives the first frame forever;
 * `ImageDecoder` gives composited frames and durations, and exists in Chromium
 * and Firefox but not in Safari. None of them will tell you that frame 12 is a
 * 40x30 patch at (100, 8) with index 7 held back as transparent - and that is
 * exactly what somebody taking a GIF apart is looking for. So the format is
 * read here, the same way in every browser, and the result is the frames as the
 * file actually stores them rather than as one particular renderer paints them.
 *
 * WHAT IT IS LENIENT ABOUT, AND WHY
 *
 * GIFs in the wild are frequently damaged: truncated downloads, files with the
 * trailer missing, a last frame whose code stream stops in the middle. A reader
 * that throws on those hands somebody a "not a GIF" message about a file their
 * browser plays perfectly well. So anything after the header is best-effort -
 * whatever frames were complete come back, with `truncated` saying what went
 * wrong - and only a file that is not a GIF at all, or that carries no frame
 * this reader could read, is an error.
 *
 * @see https://www.w3.org/Graphics/GIF/spec-gif89a.txt
 */

/** Thrown when the bytes are not a GIF, or hold no frame worth showing. */
export class GifFormatError extends Error {
  constructor(key, values = {}) {
    super(key);
    this.name = 'GifFormatError';
    // A phrase key and its blanks; main.js resolves them. This file is
    // copied byte for byte into fifteen languages.
    this.values = values;
  }
}

/** Thrown internally when a block runs off the end of the file. */
class Truncated extends Error {}

const BLOCK_EXTENSION = 0x21;
const BLOCK_IMAGE = 0x2c;
const BLOCK_TRAILER = 0x3b;

const EXT_GRAPHIC_CONTROL = 0xf9;
const EXT_COMMENT = 0xfe;
const EXT_PLAIN_TEXT = 0x01;
const EXT_APPLICATION = 0xff;

const latin1 = new TextDecoder('latin1');

/**
 * The four passes an interlaced GIF stores its rows in: start row, then the
 * step between rows. It is the format's answer to a slow modem - the picture
 * arrives as every eighth row, then fills in - and it is still legal, so a
 * reader that ignores the bit produces a recognisable image with its rows in
 * the wrong order, which is the kind of bug that looks like a corrupt file.
 */
const INTERLACE_PASSES = [[0, 8], [4, 8], [2, 4], [1, 2]];

/**
 * Read a GIF.
 *
 * Nothing here composites: each frame comes back as the file stores it - its
 * own rectangle, its own indices, its own palette - and putting them on top of
 * each other in the way the disposal methods describe is compose.js's job. The
 * two are separate because they fail differently. Parsing is about bytes and is
 * either right or wrong; composition is about what a renderer chooses to do
 * with an under-specified rule, and there is more than one defensible answer.
 *
 * @param {Uint8Array} bytes
 * @param {object} [options]
 * @param {number} [options.maxPixels]  a ceiling on the decoded pixels held at
 *   once. A GIF is a handful of kilobytes that expands to one byte per pixel
 *   per frame, so a 5 MB file can be a gigabyte of indices - which is a browser
 *   tab dying rather than an error anybody can act on. Past the ceiling the
 *   frames already read are returned and `truncated` says why.
 * @returns {{
 *   width: number, height: number, backgroundIndex: number,
 *   loopCount: number|null, globalPalette: Uint8Array|null,
 *   frames: object[], comment: string|null, truncated: string|null,
 * }}
 */
export function decodeGif(bytes, { maxPixels = 512e6 } = {}) {
  if (bytes.length < 13) throw new GifFormatError('gif.tooshort');

  const signature = latin1.decode(bytes.subarray(0, 6));
  if (signature !== 'GIF87a' && signature !== 'GIF89a') {
    throw new GifFormatError('gif.notagif');
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const packed = bytes[10];

  const gif = {
    version: signature,
    width: view.getUint16(6, true),
    height: view.getUint16(8, true),
    backgroundIndex: bytes[11],
    loopCount: null,
    globalPalette: null,
    frames: [],
    comment: null,
    truncated: null,
  };

  let at = 13;
  if (packed & 0x80) {
    const size = 1 << ((packed & 7) + 1);
    gif.globalPalette = bytes.subarray(at, at + size * 3);
    at += size * 3;
  }

  // The state a graphic control extension leaves behind for the picture that
  // follows it. It is a separate block from the image on purpose - GIF87a had
  // no delays at all - so a frame with no control block in front of it is legal
  // and means "no delay, no transparency, dispose however you like".
  let control = null;
  let decoded = 0;

  const reader = { at };

  try {
    while (reader.at < bytes.length) {
      const marker = bytes[reader.at];

      if (marker === BLOCK_TRAILER) break;

      if (marker === BLOCK_EXTENSION) {
        reader.at += 1;
        const label = bytes[reader.at];
        reader.at += 1;

        if (label === EXT_GRAPHIC_CONTROL) {
          control = readGraphicControl(bytes, view, reader);
        } else if (label === EXT_COMMENT) {
          const text = latin1.decode(readSubBlocks(bytes, reader)).trim();
          if (text && !gif.comment) gif.comment = text;
        } else if (label === EXT_APPLICATION) {
          readApplication(bytes, reader, gif);
        } else if (label === EXT_PLAIN_TEXT) {
          // A block of text the renderer was meant to draw in a grid of cells.
          // Nothing has honoured it since the 1990s, and it is a graphic block,
          // so it consumes the control that came before it.
          skipHeader(bytes, reader);
          readSubBlocks(bytes, reader);
          control = null;
        } else {
          readSubBlocks(bytes, reader);
        }

        continue;
      }

      if (marker === BLOCK_IMAGE) {
        const frame = readImage(bytes, view, reader, gif, control);
        gif.frames.push(frame);
        control = null;

        decoded += frame.width * frame.height;
        if (decoded > maxPixels) {
          // A key and its blank; main.js resolves it. This file is copied byte
          // for byte into fifteen languages.
          gif.truncated = { key: 'gif.enormous', values: { n: gif.frames.length } };
          break;
        }
        continue;
      }

      // Anything else is a byte the format has no meaning for. Padding between
      // blocks is common enough in files written by old tools that stepping
      // over it is worth more than refusing the file, but a run of it means the
      // stream is lost rather than merely untidy.
      if (marker === 0) {
        reader.at += 1;
        continue;
      }

      throw new Truncated(`unknown block 0x${marker.toString(16)}`);
    }
  } catch (error) {
    if (!(error instanceof Truncated)) throw error;
    gif.truncated = { key: gif.frames.length ? 'gif.midframe' : 'gif.damaged', values: {} };
  }

  if (!gif.frames.length) {
    const why = gif.truncated ?? { key: 'gif.noframes', values: {} };
    throw new GifFormatError(why.key, why.values);
  }

  // A logical screen of 0x0 is illegal and does happen. Everything downstream
  // needs a canvas to draw on, so it is taken from the frames instead.
  if (!gif.width || !gif.height) {
    for (const frame of gif.frames) {
      gif.width = Math.max(gif.width, frame.x + frame.width);
      gif.height = Math.max(gif.height, frame.y + frame.height);
    }
  }

  return gif;
}

/** The four bytes that say how long a frame is held, and what happens after. */
function readGraphicControl(bytes, view, reader) {
  const size = bytes[reader.at];
  if (reader.at + 1 + size >= bytes.length) throw new Truncated('graphic control');

  const flags = bytes[reader.at + 1];
  const control = {
    disposal: (flags >> 2) & 7,
    delay: view.getUint16(reader.at + 2, true),
    transparentIndex: flags & 1 ? bytes[reader.at + 4] : -1,
  };

  // The block's own length is honoured rather than assumed to be four, so a
  // writer that padded it does not throw the whole stream out of step.
  reader.at += 1 + size;
  readSubBlocks(bytes, reader);
  return control;
}

/**
 * The application extension. Only one of them matters: Netscape's, from 1995,
 * which is still the only way a GIF says "play this again" - it never made it
 * into the specification and every browser implements it anyway.
 */
function readApplication(bytes, reader, gif) {
  const size = bytes[reader.at];
  const name = latin1.decode(bytes.subarray(reader.at + 1, reader.at + 1 + size));
  reader.at += 1 + size;

  const payload = readSubBlocks(bytes, reader);
  if (name.startsWith('NETSCAPE') && payload.length >= 3 && payload[0] === 1) {
    gif.loopCount = payload[1] | (payload[2] << 8);
  }
}

/** One picture: where it goes, which table it uses, and its pixels. */
function readImage(bytes, view, reader, gif, control) {
  if (reader.at + 10 > bytes.length) throw new Truncated('image descriptor');

  const flags = bytes[reader.at + 9];
  const frame = {
    x: view.getUint16(reader.at + 1, true),
    y: view.getUint16(reader.at + 3, true),
    width: view.getUint16(reader.at + 5, true),
    height: view.getUint16(reader.at + 7, true),
    interlaced: Boolean(flags & 0x40),
    hasLocalPalette: Boolean(flags & 0x80),
    disposal: control?.disposal ?? 0,
    delay: control?.delay ?? 0,
    transparentIndex: control?.transparentIndex ?? -1,
    palette: gif.globalPalette,
    indices: null,
    dataBytes: 0,
    partial: false,
  };
  reader.at += 10;

  if (frame.hasLocalPalette) {
    const size = 1 << ((flags & 7) + 1);
    frame.palette = bytes.subarray(reader.at, reader.at + size * 3);
    reader.at += size * 3;
  }

  if (reader.at >= bytes.length) throw new Truncated('image data');
  const minCodeSize = bytes[reader.at];
  reader.at += 1;

  const from = reader.at;
  const data = readSubBlocks(bytes, reader);
  frame.dataBytes = reader.at - from;

  // A frame with no palette at all is legal only in the sense that the file
  // says so; there is nothing to draw it with. Grey ramps are what other
  // readers substitute, and it keeps the rest of the file readable.
  if (!frame.palette || frame.palette.length < 3) frame.palette = greyPalette();

  const pixels = frame.width * frame.height;
  if (!pixels) throw new Truncated('a frame of no size');

  const decoded = lzwDecode(data, minCodeSize, pixels);
  frame.partial = decoded.partial;
  frame.indices = frame.interlaced
    ? deinterlace(decoded.indices, frame.width, frame.height)
    : decoded.indices;

  return frame;
}

/** Step over an extension's fixed header, whatever length it claims. */
function skipHeader(bytes, reader) {
  const size = bytes[reader.at];
  reader.at += 1 + size;
}

/**
 * The format stores every payload as a chain of sub-blocks: a length byte, up
 * to 255 bytes, repeated, and a zero to finish. Reading them is the one place a
 * damaged file is most likely to be noticed, because a length byte that is
 * wrong walks the cursor straight off the end.
 */
function readSubBlocks(bytes, reader) {
  const runs = [];
  let total = 0;

  for (;;) {
    if (reader.at >= bytes.length) throw new Truncated('sub-blocks');
    const size = bytes[reader.at];
    reader.at += 1;
    if (size === 0) break;

    if (reader.at + size > bytes.length) throw new Truncated('sub-block payload');
    runs.push(bytes.subarray(reader.at, reader.at + size));
    reader.at += size;
    total += size;
  }

  if (runs.length === 1) return runs[0];

  const out = new Uint8Array(total);
  let at = 0;
  for (const run of runs) {
    out.set(run, at);
    at += run.length;
  }
  return out;
}

/** A 256-entry grey ramp, for a frame whose file forgot to carry a table. */
function greyPalette() {
  const table = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i += 1) {
    table[i * 3] = i;
    table[i * 3 + 1] = i;
    table[i * 3 + 2] = i;
  }
  return table;
}

/**
 * Undo LZW.
 *
 * The decoder is one entry behind the encoder, and that is the whole subtlety
 * of the algorithm. When the encoder writes a code it immediately learns the
 * entry it just proved; the decoder cannot learn that entry until it reads the
 * *next* code, because the new entry ends with that code's first pixel. Which
 * means a stream can legally contain a code the decoder has not defined yet -
 * the encoder used an entry the instant it created it - and the answer for that
 * one case is the previous run plus its own first pixel. That is the branch
 * marked below, and a decoder without it produces confetti on perfectly valid
 * files.
 *
 * The code width grows on the same schedule, and for the same reason it is
 * checked against a table that is one entry behind: see the note at the top of
 * `/gif-maker/src/lzw.js`, which is the other half of this pair.
 *
 * @param {Uint8Array} data     the code stream, sub-blocks already joined
 * @param {number} minCodeSize  bits per index, as the image descriptor gave it
 * @param {number} pixels       how many indices the frame's rectangle holds
 * @returns {{indices: Uint8Array, partial: boolean}}
 */
export function lzwDecode(data, minCodeSize, pixels) {
  const codeSize = Math.min(8, Math.max(2, minCodeSize));
  const clearCode = 1 << codeSize;
  const endCode = clearCode + 1;

  // Every entry is a previous code plus one pixel, so the table is two flat
  // arrays rather than a tree of objects: a run is walked backwards through
  // `prefix` and pushed onto a stack, which is why the stack is as long as the
  // largest run the dictionary can hold.
  const prefix = new Uint16Array(4096);
  const suffix = new Uint8Array(4096);
  const stack = new Uint8Array(4096);

  for (let i = 0; i < clearCode; i += 1) suffix[i] = i;

  const out = new Uint8Array(pixels);
  let written = 0;

  let width = codeSize + 1;
  let next = endCode + 1;
  let previous = -1;

  let bits = 0;
  let bitCount = 0;
  let at = 0;

  while (written < pixels) {
    while (bitCount < width) {
      if (at >= data.length) return { indices: out, partial: true };
      bits |= data[at] << bitCount;
      at += 1;
      bitCount += 8;
    }

    const code = bits & ((1 << width) - 1);
    bits >>= width;
    bitCount -= width;

    if (code === endCode) return { indices: out, partial: written < pixels };

    if (code === clearCode) {
      width = codeSize + 1;
      next = endCode + 1;
      previous = -1;
      continue;
    }

    let top = 0;
    let current = code;

    if (code >= next) {
      // The one code that is not in the table yet. Only ever legal immediately
      // after another code, and only ever means "the last run, then its own
      // first pixel".
      if (previous < 0 || code > next) return { indices: out, partial: true };
      stack[top] = suffix[previous];
      top += 1;
      current = previous;
    }

    while (current >= clearCode) {
      if (top >= stack.length) return { indices: out, partial: true };
      stack[top] = suffix[current];
      top += 1;
      current = prefix[current];
    }
    const first = suffix[current];
    stack[top] = first;
    top += 1;

    while (top > 0 && written < pixels) {
      top -= 1;
      out[written] = stack[top];
      written += 1;
    }

    if (previous >= 0 && next < 4096) {
      prefix[next] = previous;
      suffix[next] = first;
      next += 1;
      // Checked after the entry is added and against the width the encoder was
      // using when it wrote the code just read - the two sides stay in step
      // only if this is the last thing done with `next`.
      if (next === (1 << width) && width < 12) width += 1;
    }

    previous = code;
  }

  return { indices: out, partial: false };
}

/**
 * Put an interlaced frame's rows back where they belong.
 *
 * The stored rows arrive in four passes; the row a pass writes to is not the
 * row it was read from. Nothing else in the format moves data around like this,
 * and it is invisible on a still frame of a photograph, which is why a decoder
 * that skips it can look correct on the first file it is tried against.
 */
export function deinterlace(indices, width, height) {
  const out = new Uint8Array(indices.length);
  let from = 0;

  for (const [start, step] of INTERLACE_PASSES) {
    for (let row = start; row < height; row += step) {
      out.set(indices.subarray(from, from + width), row * width);
      from += width;
    }
  }

  return out;
}

/**
 * How long a frame is really held, in seconds.
 *
 * A GIF stores the delay in hundredths of a second, and browsers have clamped
 * anything under two of them to a tenth of a second since the 1990s - a rule
 * written for the spinning globes of the time and never removed. A tool that
 * reported the stored number as the truth would tell somebody their GIF runs at
 * 100 frames a second when every browser plays it at 10, so both numbers are
 * available and the page shows the one that answers the question being asked.
 */
export function playedDelay(centiseconds) {
  return (centiseconds < 2 ? 10 : centiseconds) / 100;
}

/** The whole animation's length as a browser plays it, in seconds. */
export function totalDuration(frames) {
  return frames.reduce((total, frame) => total + playedDelay(frame.delay), 0);
}
