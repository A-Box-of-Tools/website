/**
 * The tables from ISO/IEC 18004 that neither a QR encoder nor a QR reader can
 * derive for itself, and the arithmetic for everything they can.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/qr-tables.js and the
 * build copies it to <tool>/src/shared/qr-tables.js for the two tools that
 * ask for it with `js_parts = ["qr-tables", ...]`: the QR writer and the QR
 * reader. It is one file on purpose - a reader that disagreed with the writer
 * next door about the size of a symbol, or about how its blocks are split,
 * would not be usefully different from it, it would be wrong. The two carried
 * identical copies until the tests could follow a `./shared/` import; see
 * tests/js/resolve-shared.mjs. The field arithmetic is NOT shared: the
 * writer's gf256.js computes a remainder and the reader's reed-solomon.js
 * finds errors, which are different halves of the same mathematics.
 *
 * Two things live here rather than in the encoder or the decoder. The first is the pair of
 * tables below, which are the specification's Table 9 read into two arrays:
 * how many error-correction codewords each block gets, and how many blocks
 * there are, for each of the forty versions at each of the four levels. Those
 * numbers were chosen by the committee and follow no formula.
 *
 * The second is everything that IS a formula - the size of a symbol, how many
 * codewords fit in it, where the alignment patterns go - which is written as
 * arithmetic rather than as a fifth table, because a formula can be read and
 * checked and a table of 40 numbers can only be trusted.
 */

/** The four error-correction levels, weakest first. */
export const LEVELS = ['L', 'M', 'Q', 'H'];

/** Roughly how much of a symbol each level can lose and still be read. */
export const RECOVERY = { L: 7, M: 15, Q: 25, H: 30 };

/**
 * The two bits that stand for each level in the format information. Note that
 * they are not in order: M is 0 and L is 1, which is not a typo here but a
 * decision in the specification.
 */
export const LEVEL_BITS = { L: 1, M: 0, Q: 3, H: 2 };

/**
 * Error-correction codewords per block, indexed by version 1..40.
 *
 * Index 0 is unused, so that a version number indexes its own row rather than
 * every lookup carrying a `- 1`.
 */
const EC_PER_BLOCK = {
  L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30,
    28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30],
  M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26,
    26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28],
  Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28,
    26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30],
  H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28,
    26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30],
};

/** How many blocks the data is split into, indexed by version 1..40. */
const BLOCKS = {
  L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9,
    10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17,
    17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20,
    23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65,
    68],
  H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25,
    25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77,
    81],
};

/** The side of a symbol, in modules. Version 1 is 21, and each step adds 4. */
export function sizeOf(version) {
  return version * 4 + 17;
}

/**
 * How many modules a version has left over for data, once the finder patterns,
 * the timing patterns, the alignment patterns and the reserved information
 * areas have taken theirs.
 *
 * Written as arithmetic because it is arithmetic: the square, minus the three
 * corners and their format strips, minus the two timing lines, minus the
 * alignment grid where it does not overlap what has already been counted, and
 * minus the two version blocks from version 7 upwards.
 */
export function rawDataModules(version) {
  let modules = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const count = alignmentCount(version);
    modules -= (25 * count - 10) * count - 55;
    if (version >= 7) modules -= 36;
  }
  return modules;
}

/** Every codeword a version holds, data and error correction together. */
export function totalCodewords(version) {
  return Math.floor(rawDataModules(version) / 8);
}

/**
 * The bits left over after the last whole codeword. They are written as zeros
 * and read as padding; a version whose module count divides by eight has none.
 */
export function remainderBits(version) {
  return rawDataModules(version) % 8;
}

function alignmentCount(version) {
  return Math.floor(version / 7) + 2;
}

/**
 * The row and column centres of the alignment patterns.
 *
 * The first is always at 6 and the last always at size - 7, and the ones in
 * between are spaced as evenly as an even number allows. Version 32 is the one
 * case where the obvious formula gives a different answer from the published
 * table, so it is named.
 */
export function alignmentPositions(version) {
  if (version === 1) return [];

  const count = alignmentCount(version);
  const step = version === 32
    ? 26
    : Math.ceil((version * 4 + 4) / (count * 2 - 2) / 2) * 2;

  const positions = [6];
  for (let pos = sizeOf(version) - 7; positions.length < count; pos -= step) {
    positions.splice(1, 0, pos);
  }
  return positions;
}

/**
 * How this version and level split the data: the number of blocks, and how
 * long each one is.
 *
 * The blocks are not all the same length. The data is divided as evenly as it
 * will go and the remainder is spread one codeword at a time over the blocks
 * at the end, which is why a symbol can hold, say, two blocks of 15 and two of
 * 16. The reader is expected to know that from the same table.
 */
export function blockLayout(version, level) {
  const ecPerBlock = EC_PER_BLOCK[level][version];
  const blocks = BLOCKS[level][version];
  const dataCodewords = totalCodewords(version) - ecPerBlock * blocks;
  const shortLength = Math.floor(dataCodewords / blocks);
  const longBlocks = dataCodewords % blocks;

  return {
    blocks,
    ecPerBlock,
    dataCodewords,
    shortLength,
    longBlocks,
  };
}

/** How many data codewords a version holds at a level. */
export function dataCapacity(version, level) {
  return blockLayout(version, level).dataCodewords;
}

/**
 * The width of the character-count field, which depends on both the mode and
 * how big the symbol is. Three ranges, and the boundaries are the
 * specification's.
 */
export function countBits(mode, version) {
  const group = version <= 9 ? 0 : version <= 26 ? 1 : 2;
  return { numeric: [10, 12, 14], alphanumeric: [9, 11, 13], byte: [8, 16, 16] }[mode][group];
}
