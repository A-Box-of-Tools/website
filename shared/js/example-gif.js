/**
 * An animated GIF, written in the page.
 *
 * The GIF analyser and the GIF splitter both need one to be shown anything,
 * and it is made here rather than fetched for the reason set out at the top of
 * shared/js/example-photo.js.
 *
 * WHY THIS IS NOT /gif-maker/'s ENCODER
 *
 * That one is a real encoder: it quantises an arbitrary set of photographs
 * down to a palette, dithers them, works out per-frame disposal and writes the
 * smallest file it can. It lives in that tool because that is the tool's whole
 * job. This one has a much smaller one - it draws its own frames, so it knows
 * the palette before it starts and never has to choose one - and it lives here
 * because two other tools need a GIF and neither of them should grow an
 * encoder to get one.
 *
 * The LZW below is the real thing rather than the uncompressed-stream trick,
 * and that matters for one of the two callers: the analyser's subject is where
 * a GIF's bytes went, and a file whose compression had been deliberately
 * defeated would answer that question wrongly on a page built to answer it.
 */

import { drawPhoto } from './example-photo.js';

/**
 * A fixed palette: a 6x6x6 colour cube in a 256-entry table.
 *
 * Chosen rather than computed. The frames are drawn by this repository, so
 * their colours are known in advance and an even cube handles a sky, water and
 * grass without this module growing a quantiser it does not otherwise need.
 *
 * It was a 4x4x4 cube in 64 entries first, which was a mistake worth
 * recording: a landscape only reaches nineteen of those sixty-four, so the
 * picture came out visibly banded and the GIF analyser - correctly, on its own
 * example - reported that two thirds of the colour table was never used. Six
 * levels a channel is enough that the sky is a gradient again.
 */
const LEVELS = 6;
const COLOURS = 256;

function palette() {
  const table = new Uint8Array(COLOURS * 3);
  let at = 0;
  for (let r = 0; r < LEVELS; r += 1) {
    for (let g = 0; g < LEVELS; g += 1) {
      for (let b = 0; b < LEVELS; b += 1) {
        table[at++] = Math.round((r / (LEVELS - 1)) * 255);
        table[at++] = Math.round((g / (LEVELS - 1)) * 255);
        table[at++] = Math.round((b / (LEVELS - 1)) * 255);
      }
    }
  }
  return table;
}

/** Map one RGB pixel onto the cube above, with an ordered dither. */
function index(r, g, b, bias) {
  const top = LEVELS - 1;
  const q = (v) => Math.min(top, Math.max(0, Math.round((v / 255) * top + bias)));
  return (q(r) * LEVELS + q(g)) * LEVELS + q(b);
}

/**
 * A 4x4 Bayer matrix, scaled small.
 *
 * Without it a sky quantised to four levels of blue arrives in visible bands,
 * and the example would misrepresent what a GIF of a photograph looks like.
 */
const BAYER = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
].map((v) => (v / 16 - 0.5) * 0.9);

/** GIF's variable-width LZW, least-significant bit first. */
function lzw(indices, minimumCodeSize) {
  const clear = 1 << minimumCodeSize;
  const end = clear + 1;

  const out = [];
  let current = 0;
  let bits = 0;
  let width = minimumCodeSize + 1;

  const emit = (code) => {
    current |= code << bits;
    bits += width;
    while (bits >= 8) {
      out.push(current & 0xff);
      current >>= 8;
      bits -= 8;
    }
  };

  let table = new Map();
  const reset = () => {
    table = new Map();
    for (let i = 0; i < clear; i += 1) table.set(String(i), i);
  };

  reset();
  let next = end + 1;
  emit(clear);

  let prefix = String(indices[0]);
  for (let i = 1; i < indices.length; i += 1) {
    const k = indices[i];
    const combined = `${prefix},${k}`;
    if (table.has(combined)) {
      prefix = combined;
      continue;
    }
    emit(table.get(prefix));
    table.set(combined, next);
    next += 1;
    if (next > 0xfff) {
      emit(clear);
      reset();
      next = end + 1;
      width = minimumCodeSize + 1;
    } else if (next > (1 << width)) {
      width += 1;
    }
    prefix = String(k);
  }
  emit(table.get(prefix));
  emit(end);
  if (bits > 0) out.push(current & 0xff);

  return Uint8Array.from(out);
}

/** Break a byte run into GIF's 255-byte sub-blocks, terminated by a zero. */
function subBlocks(bytes) {
  const parts = [];
  for (let at = 0; at < bytes.length; at += 255) {
    const chunk = bytes.subarray(at, Math.min(at + 255, bytes.length));
    parts.push(Uint8Array.from([chunk.length]), chunk);
  }
  parts.push(Uint8Array.from([0]));
  return parts;
}

const u16 = (v) => Uint8Array.from([v & 0xff, (v >> 8) & 0xff]);
const ascii = (s) => Uint8Array.from([...s].map((c) => c.charCodeAt(0)));

/**
 * Draw the scene, quantise it, and write an animated GIF.
 *
 * @param {string} name
 * @param {object} [options]
 * @param {number} [options.width]
 * @param {number} [options.height]
 * @param {number} [options.frames]
 * @param {number} [options.delay]  hundredths of a second between frames
 * @returns {File}
 */
export function exampleGifFile(name, {
  width = 400, height = 300, frames = 10, delay = 12,
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });

  const parts = [
    ascii('GIF89a'),
    u16(width), u16(height),
    // Global table, 8-bit colour resolution, 256 entries (2^(7+1)).
    Uint8Array.from([0x80 | 0x70 | 0x07, 0, 0]),
    palette(),
    // NETSCAPE2.0, which is the only way a GIF says "loop for ever".
    ascii('!'), Uint8Array.from([0xff, 0x0b]), ascii('NETSCAPE2.0'),
    Uint8Array.from([0x03, 0x01]), u16(0), Uint8Array.from([0]),
  ];

  for (let f = 0; f < frames; f += 1) {
    drawPhoto(ctx, width, height, { shift: f * 24, grainSeed: 400 + f });
    const { data } = ctx.getImageData(0, 0, width, height);

    const indices = new Uint8Array(width * height);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const at = (y * width + x) * 4;
        const bias = BAYER[(y % 4) * 4 + (x % 4)];
        indices[y * width + x] = index(data[at], data[at + 1], data[at + 2], bias);
      }
    }

    parts.push(
      // Graphic control: no transparency, leave the frame in place.
      ascii('!'), Uint8Array.from([0xf9, 0x04, 0x04]), u16(delay), Uint8Array.from([0, 0]),
      ascii(','), u16(0), u16(0), u16(width), u16(height), Uint8Array.from([0]),
      Uint8Array.from([8]),
      ...subBlocks(lzw(indices, 8)),
    );
  }

  parts.push(ascii(';'));
  return new File(parts, name, { type: 'image/gif', lastModified: Date.now() });
}
