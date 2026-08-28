/**
 * The symbol itself: where every module goes, which of the eight masks is used,
 * and the two copies of the format information.
 *
 * Everything drawn here is either a function pattern - something a reader looks
 * for rather than reads - or one of the data bits from qr-encode.js walked into
 * place in the specification's zigzag. The masking at the end is the part that
 * surprises people: the data is XORed with one of eight fixed patterns, chosen
 * by scoring the result, because a symbol full of blank space or accidental
 * finder patterns is a symbol a scanner gives up on.
 */

import { encodeText } from './qr-encode.js';
import {
  alignmentPositions, LEVEL_BITS, RECOVERY, sizeOf,
} from './qr-tables.js';

/** The eight mask conditions, by their number in the specification. */
const MASKS = [
  (row, col) => (row + col) % 2 === 0,
  (row) => row % 2 === 0,
  (row, col) => col % 3 === 0,
  (row, col) => (row + col) % 3 === 0,
  (row, col) => (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0,
  (row, col) => ((row * col) % 2) + ((row * col) % 3) === 0,
  (row, col) => (((row * col) % 2) + ((row * col) % 3)) % 2 === 0,
  (row, col) => (((row + col) % 2) + ((row * col) % 3)) % 2 === 0,
];

/** The finder-like run the third penalty rule is looking for, and its mirror. */
const FINDER_RUN = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];

class QrSymbol {
  constructor(version) {
    this.version = version;
    this.size = sizeOf(version);
    /** 1 for a dark module, 0 for a light one. */
    this.modules = new Uint8Array(this.size * this.size);
    /** 1 where a function pattern sits, so the data walk knows to step over it. */
    this.reserved = new Uint8Array(this.size * this.size);
  }

  at(row, col) {
    return this.modules[row * this.size + col];
  }

  set(row, col, dark) {
    this.modules[row * this.size + col] = dark ? 1 : 0;
  }

  /** Draw something a reader looks for, and mark it as not-data. */
  setFunction(row, col, dark) {
    this.set(row, col, dark);
    this.reserved[row * this.size + col] = 1;
  }

  isReserved(row, col) {
    return this.reserved[row * this.size + col] === 1;
  }
}

/**
 * The three corners, the timing lines, the alignment grid, and the reserved
 * information areas.
 *
 * The format bits are written with a placeholder mask here rather than being
 * left for later, because what matters at this point is that their squares are
 * marked reserved before the data walk starts stepping over things.
 */
function drawFunctionPatterns(symbol) {
  const { size } = symbol;

  // Timing patterns first: the finder patterns overwrite their own ends.
  for (let i = 0; i < size; i += 1) {
    symbol.setFunction(6, i, i % 2 === 0);
    symbol.setFunction(i, 6, i % 2 === 0);
  }

  for (const [row, col] of [[3, 3], [3, size - 4], [size - 4, 3]]) {
    drawFinder(symbol, row, col);
  }

  const positions = alignmentPositions(symbol.version);
  for (const row of positions) {
    for (const col of positions) {
      // The three corners already hold a finder pattern; an alignment pattern
      // on top of one would be drawing over the thing it sits beside.
      const corner = (row === 6 && col === 6)
        || (row === 6 && col === size - 7)
        || (row === size - 7 && col === 6);
      if (!corner) drawAlignment(symbol, row, col);
    }
  }

  drawFormat(symbol, 'M', 0);
  drawVersion(symbol);
}

/** A finder pattern and its light separator, seven and nine modules across. */
function drawFinder(symbol, row, col) {
  for (let dy = -4; dy <= 4; dy += 1) {
    for (let dx = -4; dx <= 4; dx += 1) {
      const y = row + dy;
      const x = col + dx;
      if (y < 0 || y >= symbol.size || x < 0 || x >= symbol.size) continue;
      const ring = Math.max(Math.abs(dx), Math.abs(dy));
      symbol.setFunction(y, x, ring !== 2 && ring !== 4);
    }
  }
}

/** The smaller five-module square that keeps a big symbol from drifting. */
function drawAlignment(symbol, row, col) {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      symbol.setFunction(row + dy, col + dx, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
}

/**
 * The fifteen format bits, written twice.
 *
 * Five bits of content - the level and the mask - and ten of BCH error
 * correction, then XORed with 0x5412 so that a symbol whose level and mask are
 * both zero does not come out as a run of fifteen light modules that a reader
 * would fail to locate.
 */
function drawFormat(symbol, level, mask) {
  const data = (LEVEL_BITS[level] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;

  const bit = (i) => ((bits >>> i) & 1) === 1;
  const { size } = symbol;

  // Around the top-left finder, reading up the column and along the row.
  for (let i = 0; i <= 5; i += 1) symbol.setFunction(i, 8, bit(i));
  symbol.setFunction(7, 8, bit(6));
  symbol.setFunction(8, 8, bit(7));
  symbol.setFunction(8, 7, bit(8));
  for (let i = 9; i < 15; i += 1) symbol.setFunction(8, 14 - i, bit(i));

  // The second copy, split between the other two corners.
  for (let i = 0; i < 8; i += 1) symbol.setFunction(8, size - 1 - i, bit(i));
  for (let i = 8; i < 15; i += 1) symbol.setFunction(size - 15 + i, 8, bit(i));

  // The dark module. It is always dark, in every symbol ever made, and it is
  // the one module in a QR code that carries no information at all.
  symbol.setFunction(size - 8, 8, true);
}

/** Version 7 and up say which version they are, twice, in eighteen bits. */
function drawVersion(symbol) {
  if (symbol.version < 7) return;

  let rem = symbol.version;
  for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  const bits = (symbol.version << 12) | rem;

  for (let i = 0; i < 18; i += 1) {
    const dark = ((bits >>> i) & 1) === 1;
    const a = symbol.size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    symbol.setFunction(b, a, dark);
    symbol.setFunction(a, b, dark);
  }
}

/**
 * Walk the codewords into the symbol.
 *
 * Two columns at a time, right to left, alternating up and down, skipping
 * anything already reserved. Column 6 is skipped entirely because the vertical
 * timing pattern lives there and would otherwise split every pair.
 */
function drawCodewords(symbol, codewords) {
  const { size } = symbol;
  let i = 0;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vertical = 0; vertical < size; vertical += 1) {
      for (let j = 0; j < 2; j += 1) {
        const col = right - j;
        const upward = ((right + 1) & 2) === 0;
        const row = upward ? size - 1 - vertical : vertical;
        if (symbol.isReserved(row, col) || i >= codewords.length * 8) continue;
        symbol.set(row, col, ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) === 1);
        i += 1;
      }
    }
  }
}

/** XOR one of the eight patterns over the data modules. Its own inverse. */
function applyMask(symbol, mask) {
  const condition = MASKS[mask];
  for (let row = 0; row < symbol.size; row += 1) {
    for (let col = 0; col < symbol.size; col += 1) {
      if (symbol.isReserved(row, col)) continue;
      if (condition(row, col)) {
        symbol.modules[row * symbol.size + col] ^= 1;
      }
    }
  }
}

/**
 * Score a masked symbol. Lower is better, and the four rules are the
 * specification's, in its order.
 *
 * They are all about what confuses a scanner rather than what looks tidy: long
 * runs of one colour are hard to measure, blocks of one colour give a decoder
 * nothing to lock onto, anything resembling a finder pattern sends it looking
 * for a symbol that is not there, and a symbol that is mostly dark or mostly
 * light loses contrast against whatever it is printed on.
 */
export function penalty(symbol) {
  const { size } = symbol;
  let score = 0;

  // Rule 1: runs of five or more.
  for (let i = 0; i < size; i += 1) {
    for (const read of [(k) => symbol.at(i, k), (k) => symbol.at(k, i)]) {
      let run = 1;
      for (let k = 1; k < size; k += 1) {
        if (read(k) === read(k - 1)) {
          run += 1;
          if (run === 5) score += 3;
          else if (run > 5) score += 1;
        } else {
          run = 1;
        }
      }
    }
  }

  // Rule 2: every two-by-two block of one colour.
  for (let row = 0; row < size - 1; row += 1) {
    for (let col = 0; col < size - 1; col += 1) {
      const first = symbol.at(row, col);
      if (first === symbol.at(row, col + 1)
        && first === symbol.at(row + 1, col)
        && first === symbol.at(row + 1, col + 1)) score += 3;
    }
  }

  // Rule 3: the 1:1:3:1:1 run with four light modules on one side, either way
  // round, in any row or column.
  for (let i = 0; i < size; i += 1) {
    for (const read of [(k) => symbol.at(i, k), (k) => symbol.at(k, i)]) {
      for (let start = 0; start + FINDER_RUN.length <= size; start += 1) {
        let forward = true;
        let backward = true;
        for (let k = 0; k < FINDER_RUN.length; k += 1) {
          const value = read(start + k);
          if (value !== FINDER_RUN[k]) forward = false;
          if (value !== FINDER_RUN[FINDER_RUN.length - 1 - k]) backward = false;
        }
        if (forward) score += 40;
        if (backward) score += 40;
      }
    }
  }

  // Rule 4: how far the proportion of dark modules is from half.
  let dark = 0;
  for (const module of symbol.modules) dark += module;
  const total = size * size;
  const steps = Math.floor(Math.abs(dark * 20 - total * 10) / total);
  score += steps * 10;

  return score;
}

/**
 * Make a QR code.
 *
 * @param {string} text what to encode
 * @param {{level?: string, mask?: number, minVersion?: number, maxVersion?: number,
 *          mode?: string}} options
 * @returns {{size: number, modules: Uint8Array, version: number, level: string,
 *            mode: string, mask: number, recovery: number, bits: number,
 *            capacityBits: number}}
 *   `modules` is one byte per module, row by row: 1 dark, 0 light.
 */
export function makeQr(text, options = {}, t) {
  const encoded = encodeText(text, options, t);
  const symbol = new QrSymbol(encoded.version);

  drawFunctionPatterns(symbol);
  drawCodewords(symbol, encoded.codewords);

  let mask = options.mask ?? -1;
  if (mask < 0 || mask > 7) {
    let best = Infinity;
    for (let candidate = 0; candidate < 8; candidate += 1) {
      applyMask(symbol, candidate);
      drawFormat(symbol, encoded.level, candidate);
      const score = penalty(symbol);
      if (score < best) {
        best = score;
        mask = candidate;
      }
      applyMask(symbol, candidate);
    }
  }

  applyMask(symbol, mask);
  drawFormat(symbol, encoded.level, mask);

  return {
    size: symbol.size,
    modules: symbol.modules,
    version: encoded.version,
    level: encoded.level,
    mode: encoded.mode,
    mask,
    recovery: RECOVERY[encoded.level],
    bits: encoded.bits,
    capacityBits: encoded.capacityBits,
  };
}
