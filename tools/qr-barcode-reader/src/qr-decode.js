/**
 * A sampled QR symbol, turned back into the string somebody encoded.
 *
 * This module starts where `detect.js` stops: it is handed a square of
 * modules, one byte each, and knows nothing about the picture they came out
 * of. Everything from here is the specification read backwards - the format
 * information, the mask, the zigzag, the interleaving, the error correction,
 * and finally the little bit-level language of modes and counts that a QR code
 * actually holds.
 *
 * Two things are worth knowing before reading it.
 *
 * The first is that almost nothing here can be taken on trust. Every field
 * below has its own check - the format information and the version information
 * are BCH-coded, every block of data carries Reed-Solomon check codewords, and
 * a character count that runs off the end of the data is a misread rather than
 * a long string. A reader that skips those checks does not fail on a bad
 * photograph; it hands back a confident, wrong answer, which is the one
 * outcome worse than "could not read it".
 *
 * The second is that a QR code has no character encoding of its own. Byte mode
 * is bytes. The specification says they are Latin-1 unless an ECI header says
 * otherwise, and essentially every generator written since ignores that and
 * emits UTF-8 with no header at all. So the bytes are tried as UTF-8 first and
 * read as Latin-1 only when that is impossible - which is what every scanner
 * in the world does, and the reason a code with an accent in it reads the same
 * here as it does on a phone.
 */

import { correct } from './reed-solomon.js';
import {
  alignmentPositions, blockLayout, countBits, remainderBits, sizeOf, totalCodewords,
} from './shared/qr-tables.js';

/** The 45 characters alphanumeric mode can hold, in the specification's order. */
const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

/** The level each pair of format bits stands for. Not in order; that is the specification. */
const LEVEL_OF_BITS = { 0: 'M', 1: 'L', 2: 'H', 3: 'Q' };

/**
 * What each ECI assignment number names, in the spelling `TextDecoder` knows.
 *
 * Only the ones a generator plausibly emits are here. An assignment not in
 * this table, or one the browser has no decoder for, is not a reason to refuse
 * the code: the bytes are still read, as UTF-8 or Latin-1, and the number is
 * reported so that a reader can see what was claimed.
 */
const ECI_CHARSETS = {
  0: 'ibm866', 1: 'ibm866', 2: 'ibm866',
  3: 'iso-8859-1', 4: 'iso-8859-2', 5: 'iso-8859-3', 6: 'iso-8859-4',
  7: 'iso-8859-5', 8: 'iso-8859-6', 9: 'iso-8859-7', 10: 'iso-8859-8',
  11: 'iso-8859-9', 12: 'iso-8859-10', 13: 'iso-8859-11', 15: 'iso-8859-13',
  16: 'iso-8859-14', 17: 'iso-8859-15', 18: 'iso-8859-16',
  20: 'shift_jis', 21: 'windows-1250', 22: 'windows-1251', 23: 'windows-1252',
  24: 'windows-1256', 25: 'utf-16be', 26: 'utf-8', 27: 'us-ascii',
  28: 'big5', 29: 'gb18030', 30: 'euc-kr',
};

/** A failure this page can explain, as opposed to a bug in it. */
/**
 * A symbol that was found and could not be read.
 *
 * The sentences below are diagnostics, not something a reader is shown:
 * detect.js catches this and answers with a null, so the page says only
 * that it found nothing. That is why they are English in a file copied
 * into fifteen languages - moving them into the markup would translate
 * text nobody reads.
 *
 * If any of them should ever reach the page - "too blurred, try a sharper
 * picture" is a good deal more use than "nothing found" - it becomes a
 * phrase key first, the way every other tool's leaf modules do it.
 */
export class UnreadableError extends Error {}

/* ------------------------------------------------------- the two BCH fields */

/**
 * The fifteen bits of format information, corrected.
 *
 * Five bits of payload - two for the level, three for the mask - and ten of
 * BCH check, XORed with a fixed pattern so that an all-zero format string is
 * not all-zero modules. There are only 32 valid strings, so the correction is
 * a search: take the one within three bits of what was read. Three is what the
 * code can carry, and a symbol whose nearest match is further away than that
 * has not been read well enough to trust anything else in it.
 */
function decodeFormat(raw) {
  let best = -1;
  let bestDistance = 4;

  for (let data = 0; data < 32; data += 1) {
    let rem = data;
    for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const candidate = (((data << 10) | rem) & 0x7fff) ^ 0x5412;

    let distance = 0;
    for (let bits = candidate ^ raw; bits; bits &= bits - 1) distance += 1;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = data;
    } else if (distance === bestDistance) {
      // Two valid strings equally far away means neither can be chosen.
      best = -1;
    }
  }

  if (best < 0) return null;
  return { level: LEVEL_OF_BITS[best >> 3], mask: best & 7, distance: bestDistance };
}

/**
 * The eighteen bits of version information, corrected the same way.
 *
 * Only versions 7 and up carry it, and this reader does not need it - the size
 * of the sampled square already says which version it is. It is read anyway,
 * as a second opinion: if the block is present and names a different version,
 * the grid was sampled at the wrong size and everything after it would be
 * arithmetic on nonsense.
 */
function decodeVersion(raw) {
  let best = 0;
  let bestDistance = 4;

  for (let version = 7; version <= 40; version += 1) {
    let rem = version;
    for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const candidate = ((version << 12) | rem) & 0x3ffff;

    let distance = 0;
    for (let bits = candidate ^ raw; bits; bits &= bits - 1) distance += 1;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = version;
    } else if (distance === bestDistance) {
      best = 0;
    }
  }

  return best;
}

/* ---------------------------------------------------------- the module grid */

/**
 * Which squares hold a function pattern, from the version alone.
 *
 * This is the same map the encoder builds, and it is built before anything is
 * known about the contents - which is the point: the reader has to agree with
 * the writer about where the data is not, or every codeword after the first
 * disagreement is wrong.
 */
function functionModules(version) {
  const size = sizeOf(version);
  const reserved = new Uint8Array(size * size);
  const mark = (row, col) => { reserved[row * size + col] = 1; };

  // The three finder patterns, each with its separator and the format strip.
  for (const [top, left] of [[0, 0], [0, size - 8], [size - 8, 0]]) {
    for (let dy = 0; dy < 9; dy += 1) {
      for (let dx = 0; dx < 9; dx += 1) {
        const row = top + dy;
        const col = left + dx;
        if (row < size && col < size) mark(row, col);
      }
    }
  }

  // The two timing lines.
  for (let i = 0; i < size; i += 1) {
    mark(6, i);
    mark(i, 6);
  }

  // The alignment patterns, except where one would sit on a finder.
  const positions = alignmentPositions(version);
  for (const row of positions) {
    for (const col of positions) {
      const onFinder = (row === 6 && col === 6)
        || (row === 6 && col === size - 7)
        || (row === size - 7 && col === 6);
      if (onFinder) continue;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) mark(row + dy, col + dx);
      }
    }
  }

  // The two version blocks, from version 7.
  if (version >= 7) {
    for (let i = 0; i < 18; i += 1) {
      const a = Math.floor(i / 3);
      const b = size - 11 + (i % 3);
      mark(a, b);
      mark(b, a);
    }
  }

  return reserved;
}

/** The eight mask conditions, in the specification's order. */
const MASKS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

/**
 * Walk the zigzag and collect the codewords, unmasking as it goes.
 *
 * Two modules wide, up the right-hand pair and down the next, skipping the
 * column the vertical timing pattern is in. Function modules are stepped over
 * rather than read, which is why the reserved map above has to be exact.
 */
function readCodewords(size, modules, version, mask) {
  const reserved = functionModules(version);
  const condition = MASKS[mask];
  const codewords = new Uint8Array(totalCodewords(version));

  let count = 0;
  let byte = 0;
  let filled = 0;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vertical = 0; vertical < size; vertical += 1) {
      for (let j = 0; j < 2; j += 1) {
        const col = right - j;
        const row = ((right + 1) & 2) === 0 ? size - 1 - vertical : vertical;
        if (reserved[row * size + col]) continue;

        const bit = modules[row * size + col] ^ (condition(row, col) ? 1 : 0);
        byte = (byte << 1) | bit;
        filled += 1;
        if (filled === 8) {
          codewords[count] = byte;
          count += 1;
          byte = 0;
          filled = 0;
        }
      }
    }
  }

  return codewords;
}

/**
 * Undo the interleaving and repair each block.
 *
 * The encoder cuts the data into blocks, computes each block's check
 * codewords, and then writes one codeword from each block in turn, so that a
 * scratch across the symbol becomes a few wrong codewords in every block
 * rather than a run of them in one. Reading it back means putting the blocks
 * together again first: only then does a block divide its generator, and only
 * then can `correct` say what is wrong with it.
 */
function repair(codewords, version, level) {
  const layout = blockLayout(version, level);
  const lengths = [];
  for (let i = 0; i < layout.blocks; i += 1) {
    lengths.push(layout.shortLength + (i >= layout.blocks - layout.longBlocks ? 1 : 0));
  }

  const blocks = lengths.map((length) => new Uint8Array(length + layout.ecPerBlock));

  let cursor = 0;
  for (let i = 0; i <= layout.shortLength; i += 1) {
    for (let b = 0; b < blocks.length; b += 1) {
      if (i < lengths[b]) blocks[b][i] = codewords[cursor++];
    }
  }
  for (let i = 0; i < layout.ecPerBlock; i += 1) {
    for (let b = 0; b < blocks.length; b += 1) {
      blocks[b][lengths[b] + i] = codewords[cursor++];
    }
  }

  const data = new Uint8Array(layout.dataCodewords);
  let corrections = 0;
  let at = 0;

  for (let b = 0; b < blocks.length; b += 1) {
    const fixed = correct(blocks[b], layout.ecPerBlock);
    if (fixed < 0) {
      throw new UnreadableError(
        'The code was found, but too much of it is damaged or blurred to rebuild. '
        + 'A sharper picture, or one taken straight on, is usually all it needs.');
    }
    corrections += fixed;
    data.set(blocks[b].subarray(0, lengths[b]), at);
    at += lengths[b];
  }

  return { data, corrections, layout };
}

/* ------------------------------------------------------------ the bitstream */

/** A cursor over the data codewords, which the modes below read fields out of. */
function bitReader(data) {
  let pos = 0;
  const total = data.length * 8;
  return {
    left: () => total - pos,
    take(count) {
      if (pos + count > total) {
        throw new UnreadableError(
          'The code was found and rebuilt, but what it holds ran off the end - '
          + 'which usually means it was read at the wrong size. Try again with '
          + 'the whole symbol, including its white margin, in frame.');
      }
      let value = 0;
      for (let i = 0; i < count; i += 1) {
        value = (value << 1) | ((data[pos >> 3] >> (7 - (pos & 7))) & 1);
        pos += 1;
      }
      return value;
    },
  };
}

/** Bytes as text, in whichever encoding the code asked for or implied. */
function decodeBytes(bytes, charset) {
  if (charset) {
    try {
      return new TextDecoder(charset, { fatal: true }).decode(bytes);
    } catch {
      // A charset this browser has no decoder for, or bytes that are not
      // valid in it. Neither is a reason to give up on the code.
    }
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('iso-8859-1').decode(bytes);
  }
}

/** Kanji mode: thirteen bits per character, packed as a Shift-JIS pair. */
function decodeKanji(values) {
  const bytes = new Uint8Array(values.length * 2);
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    const packed = ((Math.floor(value / 0xc0)) << 8) | (value % 0xc0);
    const shifted = packed + (packed < 0x1f00 ? 0x8140 : 0xc140);
    bytes[i * 2] = shifted >> 8;
    bytes[i * 2 + 1] = shifted & 0xff;
  }
  try {
    return new TextDecoder('shift_jis', { fatal: true }).decode(bytes);
  } catch {
    // No Shift-JIS decoder, or a pair that is not a character in it. The
    // segment is dropped rather than filled with replacement characters,
    // because a row of question marks reads as damage the code does not have.
    return '';
  }
}

/**
 * Read the segments out of the repaired data.
 *
 * A QR code is a little language: a four-bit mode, a character count whose
 * width depends on the mode and the version, then the characters, repeated
 * until a terminator or until the data runs out. Byte segments are held back
 * and decoded together at the end of each run, because a UTF-8 character can
 * straddle two segments and decoding them one at a time would cut it in half.
 */
function readSegments(data, version) {
  const bits = bitReader(data);
  const segments = [];
  let text = '';
  let charset = null;
  let eci = null;
  let structuredAppend = null;
  let gs1 = false;

  let pending = [];
  const flush = () => {
    if (!pending.length) return;
    const decoded = decodeBytes(Uint8Array.from(pending), charset);
    text += decoded;
    segments[segments.length - 1].text = decoded;
    pending = [];
  };

  while (bits.left() >= 4) {
    const mode = bits.take(4);
    if (mode === 0) break;

    if (mode !== 4) flush();

    if (mode === 7) {
      // ECI: one, two or three bytes, told apart by their leading bits.
      const first = bits.take(8);
      if ((first & 0x80) === 0) eci = first;
      else if ((first & 0xc0) === 0x80) eci = ((first & 0x3f) << 8) | bits.take(8);
      else eci = ((first & 0x1f) << 16) | bits.take(16);
      charset = ECI_CHARSETS[eci] ?? null;
      continue;
    }

    if (mode === 3) {
      // Structured append: this symbol is one of several. Reported rather
      // than acted on - joining them is the reader's job, not this page's.
      const index = bits.take(4);
      const total = bits.take(4);
      bits.take(8);
      structuredAppend = { index: index + 1, total: total + 1 };
      continue;
    }

    if (mode === 5) { gs1 = true; continue; }
    if (mode === 9) { gs1 = true; bits.take(8); continue; }

    const name = { 1: 'numeric', 2: 'alphanumeric', 4: 'byte', 8: 'kanji' }[mode];
    if (!name) {
      throw new UnreadableError(
        'The code was found and rebuilt, but it uses a mode this reader does not '
        + 'know. That is rare enough to be worth reporting.');
    }

    const count = bits.take(countBits(name, version));

    if (name === 'numeric') {
      let out = '';
      for (let left = count; left > 0; left -= 3) {
        const digits = Math.min(3, left);
        out += String(bits.take(digits * 3 + 1)).padStart(digits, '0');
      }
      segments.push({ mode: name, characters: count, text: out });
      text += out;
    } else if (name === 'alphanumeric') {
      let out = '';
      for (let left = count; left > 0; left -= 2) {
        if (left === 1) {
          out += ALPHANUMERIC[bits.take(6)];
        } else {
          const pair = bits.take(11);
          out += ALPHANUMERIC[Math.floor(pair / 45)] + ALPHANUMERIC[pair % 45];
        }
      }
      segments.push({ mode: name, characters: count, text: out });
      text += out;
    } else if (name === 'byte') {
      for (let i = 0; i < count; i += 1) pending.push(bits.take(8));
      segments.push({ mode: name, characters: count, text: '' });
    } else {
      const values = [];
      for (let i = 0; i < count; i += 1) values.push(bits.take(13));
      const out = decodeKanji(values);
      segments.push({ mode: name, characters: count, text: out });
      text += out;
    }
  }

  flush();
  return { text, segments, eci, structuredAppend, gs1 };
}

/* ------------------------------------------------------------------ the top */

/**
 * Decode one sampled symbol.
 *
 * @param {number} size          the side of the square, in modules
 * @param {Uint8Array} modules   one byte per module, row by row; 1 is dark
 * @returns {{text: string, version: number, level: string, mask: number,
 *            corrections: number, segments: object[], eci: number|null,
 *            structuredAppend: {index: number, total: number}|null,
 *            gs1: boolean, dataCodewords: number, ecCodewords: number}}
 */
export function decodeMatrix(size, modules) {
  if ((size - 17) % 4 !== 0 || size < 21 || size > 177) {
    throw new UnreadableError(`A QR symbol cannot be ${size} modules across.`);
  }
  const version = (size - 17) / 4;
  const at = (row, col) => modules[row * size + col];

  // The format information is written twice, in two places, precisely so that
  // one of them can be destroyed. Both are read and the better of the two is
  // used; a code with the top-left corner torn off still says what level and
  // what mask it was made with.
  let raw = 0;
  for (let i = 0; i <= 5; i += 1) raw |= at(i, 8) << i;
  raw |= at(7, 8) << 6;
  raw |= at(8, 8) << 7;
  raw |= at(8, 7) << 8;
  for (let i = 9; i < 15; i += 1) raw |= at(8, 14 - i) << i;

  let second = 0;
  for (let i = 0; i < 8; i += 1) second |= at(8, size - 1 - i) << i;
  for (let i = 8; i < 15; i += 1) second |= at(size - 15 + i, 8) << i;

  const first = decodeFormat(raw);
  const other = decodeFormat(second);
  const format = !first ? other
    : !other ? first
      : (other.distance < first.distance ? other : first);

  if (!format) {
    throw new UnreadableError(
      'Something square was found, but the strip beside its corner is not a QR '
      + "code's format information. If this is a code, it needs a clearer picture.");
  }

  if (version >= 7) {
    let bits = 0;
    for (let i = 0; i < 18; i += 1) {
      bits |= at(Math.floor(i / 3), size - 11 + (i % 3)) << i;
    }
    const claimed = decodeVersion(bits);
    if (claimed && claimed !== version) {
      throw new UnreadableError(
        'The symbol was measured as one size and says it is another, so it has '
        + 'been read on the wrong grid. Try again from further back, or with '
        + 'the whole code square in frame.');
    }
  }

  const codewords = readCodewords(size, modules, version, format.mask);
  const { data, corrections, layout } = repair(codewords, version, format.level);
  const read = readSegments(data, version);

  return {
    ...read,
    version,
    level: format.level,
    mask: format.mask,
    corrections,
    dataCodewords: layout.dataCodewords,
    ecCodewords: layout.ecPerBlock * layout.blocks,
    blocks: layout.blocks,
    remainderBits: remainderBits(version),
  };
}
