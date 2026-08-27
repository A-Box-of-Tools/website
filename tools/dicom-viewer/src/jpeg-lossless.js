/**
 * JPEG Lossless, the one compressed transfer syntax that matters and that the
 * browser will not touch. ITU T.81 annex H, DICOM transfer syntaxes
 * 1.2.840.10008.1.2.4.57 and .70.
 *
 * WHY THIS IS HERE AND NOT LEFT TO THE BROWSER
 *
 * Every browser has a JPEG decoder and none of them will decode this. What they
 * implement is the baseline and progressive DCT modes, which are lossy and
 * eight bits deep. Lossless JPEG shares the file structure - the same markers,
 * the same Huffman coding - and nothing else: there is no DCT, no quantisation
 * and no eight-bit limit. It is a predictor and a difference coder, and it is
 * what the majority of the CT and MR studies that come out of a hospital
 * archive on a disc are compressed with.
 *
 * Handing one of those to `<img>` produces a broken image icon, which is why a
 * DICOM viewer that leans on the browser opens a suspiciously small number of
 * real files. Sixteen bits of signed Hounsfield units also cannot survive a
 * decoder that hands back eight-bit RGB, so even where a browser did decode it
 * the numbers under the window/level control would be gone.
 *
 * HOW IT WORKS, IN ONE PARAGRAPH
 *
 * Each sample is predicted from up to three neighbours already decoded - the
 * one to the left, the one above, and the one above-left - by one of seven
 * fixed formulas the scan header names. The difference between the prediction
 * and the truth is Huffman coded as a magnitude category followed by that many
 * raw bits. That is the whole codec. It is exact, it is about half the size of
 * the original, and it decodes in one pass with no buffers but the previous row.
 */

import { refuse } from './refusal.js';

/** Markers, by the byte after the 0xFF. */
const SOF3 = 0xc3;
const DHT = 0xc4;
const SOI = 0xd8;
const EOI = 0xd9;
const SOS = 0xda;
const DRI = 0xdd;

/**
 * One JPEG lossless frame.
 *
 * @param {Uint8Array} bytes
 * @returns {{width: number, height: number, precision: number, components: number,
 *   samples: Uint16Array}} samples interleaved, one entry per sample per pixel,
 *   unsigned and not yet shifted for the file's pixel representation - pixels.js
 *   owns that, because whether a value is signed is a property of the DICOM
 *   header and not of the JPEG stream.
 */
export function decodeJPEGLossless(bytes) {
  const state = {
    frame: null,
    huffman: [],
    restartInterval: 0,
    output: null,
  };

  let at = 0;
  if (!(bytes[0] === 0xff && bytes[1] === SOI)) {
    throw refuse('jpeg.nosoi');
  }
  at = 2;

  while (at < bytes.length) {
    if (bytes[at] !== 0xff) {
      // Fill bytes between segments are legal and some encoders emit them.
      at += 1;
      continue;
    }
    const marker = bytes[at + 1];
    at += 2;
    if (marker === 0xff || marker === 0x00) continue;
    if (marker === EOI) break;

    const length = (bytes[at] << 8) | bytes[at + 1];
    const from = at + 2;
    const to = at + length;

    if (marker === SOF3) {
      state.frame = readFrameHeader(bytes, from);
      state.output = new Uint16Array(
        state.frame.width * state.frame.height * state.frame.components.length,
      );
    } else if (marker === DHT) {
      readHuffmanTables(bytes, from, to, state.huffman);
    } else if (marker === DRI) {
      state.restartInterval = (bytes[from] << 8) | bytes[from + 1];
    } else if (marker === SOS) {
      if (!state.frame) throw refuse('jpeg.scanfirst');
      at = readScan(bytes, from, to, state);
      continue;
    } else if (isBaseline(marker)) {
      throw refuse('jpeg.dct');
    }

    at = to;
  }

  if (!state.frame) throw refuse('jpeg.noframe');

  return {
    width: state.frame.width,
    height: state.frame.height,
    precision: state.frame.precision,
    components: state.frame.components.length,
    samples: state.output,
  };
}

/**
 * The DCT start-of-frame markers, named so the error can say what the file
 * actually is.
 *
 * Worth the four lines: a fragment that turns out to be baseline JPEG inside a
 * lossless transfer syntax is a real thing that happens when a converter
 * transcodes the pixels and forgets to change (0002,0010), and "not a lossless
 * one" sends somebody to the right place far faster than a Huffman error would.
 */
const isBaseline = (marker) => marker === 0xc0 || marker === 0xc1 || marker === 0xc2
  || marker === 0xc5 || marker === 0xc6 || marker === 0xc7 || marker === 0xc9
  || marker === 0xca || marker === 0xcb;

function readFrameHeader(bytes, at) {
  const precision = bytes[at];
  const height = (bytes[at + 1] << 8) | bytes[at + 2];
  const width = (bytes[at + 3] << 8) | bytes[at + 4];
  const count = bytes[at + 5];
  const components = [];

  for (let index = 0; index < count; index += 1) {
    const base = at + 6 + index * 3;
    const sampling = bytes[base + 1];
    const horizontal = sampling >> 4;
    const vertical = sampling & 15;
    if (horizontal !== 1 || vertical !== 1) {
      // Subsampling means one chrominance sample per several luminance samples,
      // and it is a lossy idea: it exists for photographs of faces, not for
      // measurements. No encoder writes a subsampled lossless frame, so rather
      // than carry an upsampler for a file that should not exist, this says so.
      throw refuse('jpeg.subsampled');
    }
    components.push({ id: bytes[base], index });
  }

  if (precision < 2 || precision > 16) {
    throw refuse('jpeg.precision', { bits: precision });
  }
  if (width === 0 || height === 0) throw refuse('jpeg.nosize');

  return { precision, width, height, components };
}

/**
 * Huffman tables, by class and slot.
 *
 * Only the DC class is ever used: lossless JPEG codes one magnitude category
 * per sample and has no AC coefficients to code, because it has no
 * coefficients at all.
 */
function readHuffmanTables(bytes, from, to, tables) {
  let at = from;
  while (at < to) {
    const slot = bytes[at] & 15;
    at += 1;

    const counts = bytes.subarray(at, at + 16);
    at += 16;

    let total = 0;
    for (const count of counts) total += count;

    const symbols = bytes.subarray(at, at + total);
    at += total;

    tables[slot] = buildHuffman(counts, symbols);
  }
}

/**
 * The canonical decode tables of T.81 figure F.15: the smallest and largest
 * code of each length, and where in the symbol list that length starts.
 *
 * A Map from code to symbol would be shorter to write and is what a first
 * version of this did. It is also a hash lookup per bit, which on a
 * three-thousand-pixel-square mammogram is seventy million of them.
 */
function buildHuffman(counts, symbols) {
  const mincode = new Int32Array(17);
  const maxcode = new Int32Array(17).fill(-1);
  const valptr = new Int32Array(17);

  let code = 0;
  let index = 0;
  for (let length = 1; length <= 16; length += 1) {
    const count = counts[length - 1];
    if (count > 0) {
      valptr[length] = index;
      mincode[length] = code;
      index += count;
      code += count;
      maxcode[length] = code - 1;
    }
    code <<= 1;
  }
  return { mincode, maxcode, valptr, symbols };
}

/**
 * A bit at a time, out of an entropy-coded segment.
 *
 * The byte stuffing is the only subtle part. A 0xFF byte inside the compressed
 * data is written as 0xFF 0x00 so that it cannot be mistaken for a marker; a
 * 0xFF followed by anything else *is* a marker and ends the segment. Missing
 * that turns a restart marker into sixteen bits of garbage and the rest of the
 * image into noise.
 */
class BitReader {
  constructor(bytes, at) {
    this.bytes = bytes;
    this.at = at;
    this.buffer = 0;
    this.count = 0;
    this.marker = 0;
  }

  bit() {
    if (this.count === 0) {
      if (this.at >= this.bytes.length) {
        this.marker = EOI;
        return 0;
      }
      let byte = this.bytes[this.at];
      if (byte === 0xff) {
        const next = this.bytes[this.at + 1];
        if (next !== 0x00) {
          this.marker = next ?? EOI;
          return 0;
        }
        this.at += 1;
      }
      this.at += 1;
      this.buffer = byte;
      this.count = 8;
    }
    this.count -= 1;
    return (this.buffer >> this.count) & 1;
  }

  bits(count) {
    let value = 0;
    for (let step = 0; step < count; step += 1) value = (value << 1) | this.bit();
    return value;
  }

  /** Throw away the rest of the current byte, which is what a restart needs. */
  align() {
    this.count = 0;
  }

  /** Step over a restart marker and start again on the byte after it. */
  restart() {
    this.align();
    while (this.at + 1 < this.bytes.length) {
      if (this.bytes[this.at] === 0xff) {
        const marker = this.bytes[this.at + 1];
        if (marker >= 0xd0 && marker <= 0xd7) {
          this.at += 2;
          this.marker = 0;
          return true;
        }
        if (marker !== 0x00 && marker !== 0xff) return false;
      }
      this.at += 1;
    }
    return false;
  }
}

function decodeSymbol(reader, table) {
  if (!table) throw refuse('jpeg.notable');
  let code = reader.bit();
  for (let length = 1; length <= 16; length += 1) {
    if (table.maxcode[length] >= 0 && code <= table.maxcode[length]) {
      return table.symbols[table.valptr[length] + code - table.mincode[length]];
    }
    code = (code << 1) | reader.bit();
  }
  throw refuse('jpeg.longcode');
}

/**
 * A difference, from its magnitude category and that many raw bits.
 *
 * The category says how many bits follow and how big the number is; the top bit
 * of those says which side of zero it is on. Category 16 is the one special
 * case in lossless mode and means exactly 32768, with no bits after it.
 */
function difference(reader, category) {
  if (category === 0) return 0;
  if (category === 16) return 32768;
  const raw = reader.bits(category);
  const half = 1 << (category - 1);
  return raw < half ? raw - (1 << category) + 1 : raw;
}

/**
 * One scan, which in practice is either the whole image or one component of it.
 *
 * @returns {number} where the scan's data ended, so the marker loop can carry on
 */
function readScan(bytes, from, to, state) {
  const count = bytes[from];
  const scan = [];
  for (let index = 0; index < count; index += 1) {
    const id = bytes[from + 1 + index * 2];
    const table = bytes[from + 2 + index * 2] >> 4;
    const component = state.frame.components.find((each) => each.id === id)
      ?? state.frame.components[index];
    scan.push({ component, table: state.huffman[table] });
  }

  const predictor = bytes[to - 3];
  const shift = bytes[to - 1] & 15;

  const reader = new BitReader(bytes, to);
  decodeSamples(reader, state, scan, predictor, shift);

  // Whatever stopped the reader - the end of the data, or a marker - the marker
  // loop resumes at the byte the reader is looking at.
  return reader.at;
}

/**
 * The predictors of T.81 table H.1.
 *
 * `a` is the sample to the left, `b` the one above, `c` the one above-left.
 * Predictor 0 is only legal in a hierarchical frame and does not appear here;
 * anything above 7 is not a predictor at all.
 */
function predict(mode, a, b, c) {
  switch (mode) {
    case 1: return a;
    case 2: return b;
    case 3: return c;
    case 4: return a + b - c;
    case 5: return a + ((b - c) >> 1);
    case 6: return b + ((a - c) >> 1);
    case 7: return (a + b) >> 1;
    default: return a;
  }
}

function decodeSamples(reader, state, scan, predictor, shift) {
  const { width, height, precision, components } = state.frame;
  const stride = components.length;
  const out = state.output;

  // What the very first sample of the image is predicted from, there being
  // nothing to its left or above it: half of full scale. T.81 H.1.2.1.
  const start = 1 << (precision - 1 - shift);
  const mask = (1 << 16) - 1;

  let sinceRestart = 0;
  let atRestart = true;

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      if (state.restartInterval > 0 && sinceRestart === state.restartInterval) {
        if (!reader.restart()) return;
        sinceRestart = 0;
        atRestart = true;
      }

      for (const { component, table } of scan) {
        const offset = (row * width + column) * stride + component.index;

        let value;
        if (atRestart || (row === 0 && column === 0)) {
          value = start;
        } else if (column === 0) {
          // The first sample of a line has nothing to its left, so it is
          // predicted from the one above whatever the scan's predictor says.
          value = out[offset - width * stride] >> shift;
        } else {
          const a = out[offset - stride] >> shift;
          const b = row === 0 ? 0 : out[offset - width * stride] >> shift;
          const c = row === 0 ? 0 : out[offset - (width + 1) * stride] >> shift;
          value = row === 0 ? a : predict(predictor, a, b, c);
        }

        const category = decodeSymbol(reader, table);
        value = (value + difference(reader, category)) & mask;
        out[offset] = (value << shift) & mask;
      }

      atRestart = false;
      sinceRestart += 1;

      if (reader.marker && reader.marker !== EOI
          && !(reader.marker >= 0xd0 && reader.marker <= 0xd7)) {
        // A marker that is not a restart means the scan is over, whatever the
        // frame header said the size was. Everything decoded so far is kept.
        return;
      }
    }
  }
}
