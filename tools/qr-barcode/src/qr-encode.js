/**
 * Turning a string into the codewords a QR symbol carries.
 *
 * Three steps, in this order, because each one needs the answer to the last:
 *
 *   1. pick the mode - the alphabet the text is written in;
 *   2. pick the smallest version the text fits in at the chosen level;
 *   3. write the bits, pad them, split them into blocks, and add the
 *      error-correction codewords from gf256.js.
 *
 * The awkward part is that the header carries the character count in a field
 * whose width depends on the version, and the version depends on how many bits
 * the whole thing takes - which includes that field. It is not circular, but it
 * does mean the length has to be recomputed for each version tried, which is
 * what `bitLength` below is for.
 */

import { remainder } from './gf256.js';
import {
  blockLayout, countBits, dataCapacity, remainderBits,
} from './shared/qr-tables.js';

/**
 * The 45 characters alphanumeric mode can hold, in the order that gives each
 * one its value. Two of them pack into 11 bits, which is why a URL typed in
 * capitals makes a visibly smaller code than the same URL in lower case.
 */
export const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

/** The four-bit mode indicators. */
const MODE_BITS = { numeric: 0b0001, alphanumeric: 0b0010, byte: 0b0100 };

/**
 * The narrowest mode this text can be written in.
 *
 * Narrower is smaller: a digit costs 3⅓ bits in numeric mode and 8 in byte
 * mode, so a phone number in the wrong mode is nearly three times the size it
 * needs to be. There is no downside to picking the narrowest - every reader
 * supports all three.
 */
export function chooseMode(text) {
  if (/^[0-9]*$/.test(text)) return 'numeric';
  for (const character of text) {
    if (!ALPHANUMERIC.includes(character)) return 'byte';
  }
  return 'alphanumeric';
}

/** The bytes byte mode will write: the text as UTF-8. */
export function utf8(text) {
  return new TextEncoder().encode(text);
}

/** How many characters - or bytes, in byte mode - this text is. */
function unitCount(text, mode) {
  return mode === 'byte' ? utf8(text).length : [...text].length;
}

/** How many bits the payload itself takes, before the header. */
function payloadBits(count, mode) {
  if (mode === 'numeric') return 10 * Math.floor(count / 3) + [0, 4, 7][count % 3];
  if (mode === 'alphanumeric') return 11 * Math.floor(count / 2) + 6 * (count % 2);
  return 8 * count;
}

/** Header plus payload, for one version. Only the header changes with it. */
function bitLength(count, mode, version) {
  return 4 + countBits(mode, version) + payloadBits(count, mode);
}

/**
 * The smallest version between `min` and `max` that this text fits in.
 *
 * @returns {number} the version, or 0 if it does not fit in `max`
 */
export function fitVersion(text, mode, level, min = 1, max = 40) {
  const count = unitCount(text, mode);
  for (let version = Math.max(1, min); version <= max; version += 1) {
    if (bitLength(count, mode, version) <= dataCapacity(version, level) * 8) {
      return version;
    }
  }
  return 0;
}

/** How many characters of this kind of text a version and level would hold. */
export function capacityFor(mode, version, level) {
  const bits = dataCapacity(version, level) * 8 - 4 - countBits(mode, version);
  if (mode === 'numeric') {
    const whole = Math.floor(bits / 10) * 3;
    const spare = bits % 10;
    return whole + (spare >= 7 ? 2 : spare >= 4 ? 1 : 0);
  }
  if (mode === 'alphanumeric') {
    return Math.floor(bits / 11) * 2 + (bits % 11 >= 6 ? 1 : 0);
  }
  return Math.floor(bits / 8);
}

/** A bit sink. Small enough to be obvious, which matters more here than speed. */
function bitWriter() {
  const bits = [];
  return {
    bits,
    push(value, width) {
      for (let i = width - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1);
    },
  };
}

/** The header and the payload, as bits, for one version. */
function writeSegment(text, mode, version) {
  const writer = bitWriter();
  writer.push(MODE_BITS[mode], 4);
  writer.push(unitCount(text, mode), countBits(mode, version));

  if (mode === 'numeric') {
    for (let i = 0; i < text.length; i += 3) {
      const group = text.slice(i, i + 3);
      writer.push(Number(group), group.length * 3 + 1);
    }
  } else if (mode === 'alphanumeric') {
    const values = [...text].map((character) => ALPHANUMERIC.indexOf(character));
    for (let i = 0; i < values.length; i += 2) {
      if (i + 1 < values.length) writer.push(values[i] * 45 + values[i + 1], 11);
      else writer.push(values[i], 6);
    }
  } else {
    for (const byte of utf8(text)) writer.push(byte, 8);
  }

  return writer.bits;
}

/**
 * Bits to codewords: the terminator, the pad to a whole byte, and then the two
 * pad bytes alternating until the version is full.
 *
 * The pad bytes are 0xEC and 0x11 because the specification says so. They are
 * not random and they are not zero; alternating them keeps the symbol from
 * developing a large blank region, which is the same problem masking exists to
 * solve.
 */
function toCodewords(bits, capacity) {
  const padded = bits.slice(0, capacity * 8);
  // Up to four zeros to say the message has ended, then zeros to the byte.
  const terminator = Math.min(4, capacity * 8 - padded.length);
  for (let i = 0; i < terminator; i += 1) padded.push(0);
  while (padded.length % 8 !== 0) padded.push(0);

  const codewords = new Uint8Array(capacity);
  for (let i = 0; i < padded.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | padded[i + j];
    codewords[i / 8] = byte;
  }

  const pad = [0xec, 0x11];
  for (let i = padded.length / 8, n = 0; i < capacity; i += 1, n += 1) {
    codewords[i] = pad[n % 2];
  }

  return codewords;
}

/**
 * Split into blocks, add the error correction, and interleave.
 *
 * Interleaving is the point of the whole exercise. Every block's codewords are
 * spread across the symbol rather than sitting together, so a coffee ring that
 * destroys one region takes a few codewords from each block instead of every
 * codeword from one - and a few from each is what Reed-Solomon can repair.
 */
export function interleave(codewords, version, level) {
  const layout = blockLayout(version, level);
  const blocks = [];

  let offset = 0;
  for (let i = 0; i < layout.blocks; i += 1) {
    const length = layout.shortLength + (i >= layout.blocks - layout.longBlocks ? 1 : 0);
    const data = codewords.subarray(offset, offset + length);
    offset += length;
    blocks.push({ data, ec: remainder(data, layout.ecPerBlock) });
  }

  const result = new Uint8Array(codewords.length + layout.ecPerBlock * layout.blocks);
  let at = 0;

  // The short blocks have nothing to contribute to the last data column, which
  // is why the long blocks' final codewords all sit together at the end of the
  // data half rather than in the round they belong to.
  for (let i = 0; i <= layout.shortLength; i += 1) {
    for (const block of blocks) {
      if (i < block.data.length) result[at++] = block.data[i];
    }
  }
  for (let i = 0; i < layout.ecPerBlock; i += 1) {
    for (const block of blocks) result[at++] = block.ec[i];
  }

  return result;
}

/**
 * The full pipeline: text in, the codewords of a symbol out.
 *
 * @param {string} text
 * @param {{level?: string, minVersion?: number, maxVersion?: number, mode?: string}} options
 * @returns {{codewords: Uint8Array, version: number, level: string, mode: string,
 *            bits: number, capacityBits: number, remainderBits: number}}
 */
export function encodeText(text, options = {}, t) {
  const level = options.level ?? 'M';
  const mode = options.mode ?? chooseMode(text);
  const version = fitVersion(text, mode, level, options.minVersion ?? 1,
                             options.maxVersion ?? 40);

  if (version === 0) {
    throw new RangeError(t('qr.toolong', {
      level,
      count: unitCount(text, mode),
      unit: t(mode === 'byte' ? 'unit.bytes' : 'unit.characters'),
      most: capacityFor(mode, options.maxVersion ?? 40, level),
    }));
  }

  const capacity = dataCapacity(version, level);
  const bits = writeSegment(text, mode, version);

  return {
    codewords: interleave(toCodewords(bits, capacity), version, level),
    version,
    level,
    mode,
    bits: bits.length,
    capacityBits: capacity * 8,
    remainderBits: remainderBits(version),
  };
}
