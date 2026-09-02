/**
 * tools/qr-barcode/src - the QR encoder.
 *
 * The interesting half of this file is the reader at the bottom. A test that
 * checks an encoder against itself proves nothing, so the symbols made here are
 * decoded the way a scanner would: read the format information out of the
 * modules, undo the mask it names, walk the data out in the specification's
 * zigzag, undo the interleaving, and read the header. If the string does not
 * come back, the test fails - and it will fail for a wrong mask, a wrong
 * placement, a wrong block split or a wrong header just as readily as for a
 * wrong bit.
 *
 * The fixed vectors above it come from outside this repository: the worked
 * example in ISO/IEC 18004 itself, and the published capacity table.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { generator, multiply, remainder } from '../../tools/qr-barcode/src/gf256.js';
import {
  blockLayout, countBits, dataCapacity, LEVELS, remainderBits, sizeOf,
  totalCodewords,
} from '../../shared/js/qr-tables.js';
import {
  capacityFor, chooseMode, encodeText, fitVersion,
} from '../../tools/qr-barcode/src/qr-encode.js';
import { makeQr } from '../../tools/qr-barcode/src/qr.js';

/**
 * The stand-in for phrase(). The encoder's refusal is a key and its blanks now;
 * the sentence it becomes lives in body.html, in fifteen languages.
 */
const say = (key, values = {}) => [key, ...Object.entries(values)
  .map(([name, value]) => `${name}=${value}`)].join(' ');

/* ------------------------------------------------------- the field itself */

test('gf256: the field wraps at the primitive polynomial', () => {
  // a^7 is 0x80, and a^8 is that shifted once more and reduced by 0x11d.
  assert.equal(multiply(2, 0x80), 0x1d);
  assert.equal(multiply(1, 200), 200);
  assert.equal(multiply(0, 200), 0);
  assert.equal(multiply(3, 7), 9);
});

test('gf256: multiplication is commutative and associative', () => {
  for (let a = 1; a < 256; a += 37) {
    for (let b = 1; b < 256; b += 29) {
      assert.equal(multiply(a, b), multiply(b, a));
      for (let c = 1; c < 256; c += 53) {
        assert.equal(multiply(multiply(a, b), c), multiply(a, multiply(b, c)));
      }
    }
  }
});

test('gf256: the generator polynomials the specification prints', () => {
  // The specification prints these as powers of a rather than as bytes, so
  // they are converted here - with a field built in this file, from the same
  // primitive polynomial and nothing else, so that a wrong table in the tool
  // cannot be checked against itself.
  const power = (n) => {
    let value = 1;
    for (let i = 0; i < n; i += 1) {
      value <<= 1;
      if (value & 0x100) value ^= 0x11d;
    }
    return value;
  };

  const degree7 = [87, 229, 146, 149, 238, 102, 21];
  const degree10 = [251, 67, 46, 61, 118, 70, 64, 94, 32, 45];
  assert.deepEqual([...generator(7)], degree7.map(power));
  assert.deepEqual([...generator(10)], degree10.map(power));
});

test('gf256: every codeword has zero syndromes', () => {
  // The definition of a Reed-Solomon codeword: data followed by its remainder
  // is divisible by the generator, so evaluating it at a^0 .. a^(n-1) gives
  // zero every time. This is what a reader uses to notice damage.
  const data = new Uint8Array(20);
  for (let i = 0; i < data.length; i += 1) data[i] = (i * 37 + 11) & 0xff;
  const degree = 10;
  const whole = [...data, ...remainder(data, degree)];

  for (let i = 0; i < degree; i += 1) {
    // Horner, in the field: the root is a^i, which is multiply-by-2 i times.
    let root = 1;
    for (let k = 0; k < i; k += 1) root = multiply(root, 2);
    let value = 0;
    for (const byte of whole) value = multiply(value, root) ^ byte;
    assert.equal(value, 0, `syndrome ${i}`);
  }
});

/* --------------------------------------------------------------- the tables */

test('tables: the sizes and codeword counts of the two end versions', () => {
  assert.equal(sizeOf(1), 21);
  assert.equal(sizeOf(40), 177);
  assert.equal(totalCodewords(1), 26);
  assert.equal(totalCodewords(40), 3706);
  assert.equal(remainderBits(1), 0);
  assert.equal(remainderBits(2), 7);
  assert.equal(remainderBits(40), 0);
});

test('tables: the published character capacities', () => {
  // From the capacity table in ISO/IEC 18004. These are the numbers a user
  // sees quoted everywhere, and they pin down both error-correction tables at
  // once: get either wrong and the byte capacity moves.
  const expected = [
    // version, level, numeric, alphanumeric, byte
    [1, 'L', 41, 25, 17], [1, 'M', 34, 20, 14],
    [1, 'Q', 27, 16, 11], [1, 'H', 17, 10, 7],
    [2, 'L', 77, 47, 32], [3, 'L', 127, 77, 53],
    [4, 'M', 149, 90, 62], [5, 'Q', 144, 87, 60],
    [5, 'H', 106, 64, 44], [7, 'H', 154, 93, 64],
    [10, 'L', 652, 395, 271],
    [10, 'M', 513, 311, 213], [10, 'Q', 364, 221, 151],
    [10, 'H', 288, 174, 119], [20, 'M', 1600, 970, 666],
    [40, 'L', 7089, 4296, 2953],
    [40, 'M', 5596, 3391, 2331], [40, 'Q', 3993, 2420, 1663],
    [40, 'H', 3057, 1852, 1273],
  ];

  for (const [version, level, numeric, alphanumeric, byte] of expected) {
    assert.equal(capacityFor('numeric', version, level), numeric,
                 `${version}-${level} numeric`);
    assert.equal(capacityFor('alphanumeric', version, level), alphanumeric,
                 `${version}-${level} alphanumeric`);
    assert.equal(capacityFor('byte', version, level), byte, `${version}-${level} byte`);
  }
});

test('tables: every block split accounts for every codeword', () => {
  for (let version = 1; version <= 40; version += 1) {
    for (const level of LEVELS) {
      const layout = blockLayout(version, level);
      const counted = layout.shortLength * (layout.blocks - layout.longBlocks)
        + (layout.shortLength + 1) * layout.longBlocks;
      assert.equal(counted, layout.dataCodewords, `${version}-${level}`);
      assert.equal(layout.dataCodewords + layout.ecPerBlock * layout.blocks,
                   totalCodewords(version), `${version}-${level} total`);
      // A block longer than 255 codewords could not be corrected in GF(256).
      assert.ok(layout.shortLength + 1 + layout.ecPerBlock <= 255, `${version}-${level} block`);
      assert.ok(layout.shortLength >= 1, `${version}-${level} empty block`);
    }
  }
});

/* ------------------------------------------------------------ the encoding */

test('encode: the worked example from the specification', () => {
  // ISO/IEC 18004 encodes "01234567" at version 1, level M, and prints both
  // halves of the result. Sixteen data codewords and ten of error correction.
  const result = encodeText('01234567', { level: 'M' }, say);
  assert.equal(result.version, 1);
  assert.equal(result.mode, 'numeric');
  assert.deepEqual([...result.codewords], [
    0x10, 0x20, 0x0c, 0x56, 0x61, 0x80, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11,
    0xec, 0x11, 0xec, 0x11,
    0xa5, 0x24, 0xd4, 0xc1, 0xed, 0x36, 0xc7, 0x87, 0x2c, 0x55,
  ]);
});

test('encode: the narrowest mode that fits the text', () => {
  assert.equal(chooseMode('0123456789'), 'numeric');
  assert.equal(chooseMode(''), 'numeric');
  assert.equal(chooseMode('HELLO WORLD'), 'alphanumeric');
  assert.equal(chooseMode('HTTPS://ABOX.TOOLS/'), 'alphanumeric');
  assert.equal(chooseMode('hello world'), 'byte');
  assert.equal(chooseMode('https://abox.tools/'), 'byte');
  assert.equal(chooseMode('café'), 'byte');
});

test('encode: the smallest version that holds the text', () => {
  assert.equal(fitVersion('1'.repeat(41), 'numeric', 'L'), 1);
  assert.equal(fitVersion('1'.repeat(42), 'numeric', 'L'), 2);
  assert.equal(fitVersion('a'.repeat(17), 'byte', 'L'), 1);
  assert.equal(fitVersion('a'.repeat(18), 'byte', 'L'), 2);
  assert.equal(fitVersion('a'.repeat(2953), 'byte', 'L'), 40);
  assert.equal(fitVersion('a'.repeat(2954), 'byte', 'L'), 0);
});

test('encode: text that does not fit is refused, not truncated', () => {
  assert.throws(() => encodeText('a'.repeat(2954), { level: 'L' }, say), RangeError);
  assert.throws(() => encodeText('a'.repeat(200), { level: 'L', maxVersion: 5 }, say),
                RangeError);
});

/* -------------------------------------------------------------- the symbol */

test('symbol: the finder patterns and the dark module are where they belong', () => {
  const qr = makeQr('https://abox.tools/', { level: 'M' }, say);
  const at = (row, col) => qr.modules[row * qr.size + col];

  for (const [top, left] of [[0, 0], [0, qr.size - 7], [qr.size - 7, 0]]) {
    for (let dy = 0; dy < 7; dy += 1) {
      for (let dx = 0; dx < 7; dx += 1) {
        const ring = Math.max(Math.abs(dy - 3), Math.abs(dx - 3));
        assert.equal(at(top + dy, left + dx), ring === 2 ? 0 : 1,
                     `finder at ${top},${left} + ${dy},${dx}`);
      }
    }
  }

  // The timing patterns: an unbroken alternation along row and column 6.
  for (let i = 8; i < qr.size - 8; i += 1) {
    assert.equal(at(6, i), i % 2 === 0 ? 1 : 0, `timing column ${i}`);
    assert.equal(at(i, 6), i % 2 === 0 ? 1 : 0, `timing row ${i}`);
  }

  assert.equal(at(qr.size - 8, 8), 1, 'the dark module');
});

test('symbol: the mask is chosen, and forcing one is honoured', () => {
  const chosen = makeQr('https://abox.tools/', { level: 'M' }, say);
  assert.ok(chosen.mask >= 0 && chosen.mask <= 7);

  for (let mask = 0; mask < 8; mask += 1) {
    const forced = makeQr('https://abox.tools/', { level: 'M', mask }, say);
    assert.equal(forced.mask, mask);
    assert.equal(read(forced), 'https://abox.tools/');
  }
});

test('symbol: every level and every mode survives a round trip', () => {
  const strings = [
    '01234567',
    '8675309',
    'HELLO WORLD',
    'HTTPS://ABOX.TOOLS/QR-BARCODE/',
    'https://abox.tools/qr-barcode/',
    'WIFI:T:WPA;S:The Cafe;P:hunter2;;',
    'café — über ✓',
    '你好，世界',
    'a'.repeat(300),
    '9'.repeat(1000),
  ];

  for (const text of strings) {
    for (const level of LEVELS) {
      const qr = makeQr(text, { level }, say);
      assert.equal(read(qr), text, `${level}: ${text.slice(0, 20)}`);
      assert.equal(qr.size, sizeOf(qr.version));
      assert.equal(qr.modules.length, qr.size * qr.size);
    }
  }
});

test('symbol: a bigger version than needed still reads', () => {
  const qr = makeQr('abox.tools', { level: 'H', minVersion: 12 }, say);
  assert.equal(qr.version, 12);
  assert.equal(read(qr), 'abox.tools');
});

test('symbol: versions 7 and up carry readable version information', () => {
  for (const version of [7, 14, 27, 40]) {
    const qr = makeQr('x', { level: 'L', minVersion: version }, say);
    assert.equal(qr.version, version);
    assert.equal(readVersionBits(qr), version);
    assert.equal(read(qr), 'x');
  }
});

/* ------------------------------------------------------------- the reader */

/**
 * Read a finished symbol back, the way a scanner does.
 *
 * Nothing here is imported from the tool. It works from the modules and the
 * published tables alone, so it can disagree with the encoder - which is the
 * only reason it is worth running.
 */
function read(qr) {
  const { size, modules } = qr;
  const at = (row, col) => modules[row * size + col];

  const { level, mask } = readFormat(qr);
  const version = qr.version;

  // Undo the mask over everything that is not a function pattern.
  const reserved = functionModules(version);
  const condition = [
    (r, c) => (r + c) % 2 === 0,
    (r) => r % 2 === 0,
    (r, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
    (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
    (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
  ][mask];

  // Walk the zigzag and collect the bits.
  const bits = [];
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vertical = 0; vertical < size; vertical += 1) {
      for (let j = 0; j < 2; j += 1) {
        const col = right - j;
        const row = ((right + 1) & 2) === 0 ? size - 1 - vertical : vertical;
        if (reserved[row * size + col]) continue;
        bits.push(at(row, col) ^ (condition(row, col) ? 1 : 0));
      }
    }
  }

  const interleaved = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | bits[i + j];
    interleaved.push(byte);
  }

  // Undo the interleaving.
  const layout = blockLayout(version, level);
  const lengths = [];
  for (let i = 0; i < layout.blocks; i += 1) {
    lengths.push(layout.shortLength + (i >= layout.blocks - layout.longBlocks ? 1 : 0));
  }
  const blocks = lengths.map(() => []);
  let cursor = 0;
  for (let i = 0; i <= layout.shortLength; i += 1) {
    for (let b = 0; b < blocks.length; b += 1) {
      if (i < lengths[b]) blocks[b].push(interleaved[cursor++]);
    }
  }
  const data = blocks.flat();

  // And read the header off the front.
  const stream = [];
  for (const byte of data) {
    for (let i = 7; i >= 0; i -= 1) stream.push((byte >> i) & 1);
  }
  let pos = 0;
  const take = (n) => {
    let value = 0;
    for (let i = 0; i < n; i += 1) value = (value << 1) | stream[pos++];
    return value;
  };

  const mode = { 1: 'numeric', 2: 'alphanumeric', 4: 'byte' }[take(4)];
  const count = take(countBits(mode, version));

  if (mode === 'numeric') {
    let out = '';
    for (let left = count; left > 0; left -= 3) {
      const digits = Math.min(3, left);
      out += String(take(digits * 3 + 1)).padStart(digits, '0');
    }
    return out;
  }

  const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
  if (mode === 'alphanumeric') {
    let out = '';
    for (let left = count; left > 0; left -= 2) {
      if (left === 1) {
        out += ALPHANUMERIC[take(6)];
      } else {
        const pair = take(11);
        out += ALPHANUMERIC[Math.floor(pair / 45)] + ALPHANUMERIC[pair % 45];
      }
    }
    return out;
  }

  const bytes = new Uint8Array(count);
  for (let i = 0; i < count; i += 1) bytes[i] = take(8);
  return new TextDecoder().decode(bytes);
}

/** The level and the mask, from the copy beside the top-left finder. */
function readFormat(qr) {
  const { size, modules } = qr;
  const at = (row, col) => modules[row * size + col];

  let bits = 0;
  const put = (index, value) => { bits |= value << index; };
  for (let i = 0; i <= 5; i += 1) put(i, at(i, 8));
  put(6, at(7, 8));
  put(7, at(8, 8));
  put(8, at(8, 7));
  for (let i = 9; i < 15; i += 1) put(i, at(8, 14 - i));

  const unmasked = bits ^ 0x5412;

  // The ten check bits have to agree, or this is not a format string at all.
  const data = unmasked >> 10;
  let rem = data;
  for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  assert.equal(((data << 10) | rem) & 0x7fff, unmasked, 'format information is corrupt');

  return {
    level: { 1: 'L', 0: 'M', 3: 'Q', 2: 'H' }[data >> 3],
    mask: data & 7,
  };
}

/** The version, from the eighteen-bit block above the bottom-left finder. */
function readVersionBits(qr) {
  const { size, modules } = qr;
  let bits = 0;
  for (let i = 0; i < 18; i += 1) {
    const row = Math.floor(i / 3);
    const col = size - 11 + (i % 3);
    bits |= modules[row * size + col] << i;
  }

  const version = bits >> 12;
  let rem = version;
  for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  assert.equal(((version << 12) | rem) & 0x3ffff, bits, 'version information is corrupt');
  return version;
}

/**
 * Which squares hold a function pattern, worked out from the version alone -
 * the same map a reader builds before it knows anything about the contents.
 */
function functionModules(version) {
  const size = sizeOf(version);
  const reserved = new Uint8Array(size * size);
  const mark = (row, col) => { reserved[row * size + col] = 1; };

  for (let i = 0; i < size; i += 1) {
    mark(6, i);
    mark(i, 6);
  }

  for (const [top, left] of [[0, 0], [0, size - 7], [size - 7, 0]]) {
    for (let dy = -1; dy < 8; dy += 1) {
      for (let dx = -1; dx < 8; dx += 1) {
        const row = top + dy;
        const col = left + dx;
        if (row >= 0 && row < size && col >= 0 && col < size) mark(row, col);
      }
    }
  }

  // The alignment grid, from the same rule the encoder uses. Written out again
  // rather than imported, so a wrong rule cannot agree with itself.
  const positions = [];
  if (version > 1) {
    const count = Math.floor(version / 7) + 2;
    const step = version === 32 ? 26
      : Math.ceil((version * 4 + 4) / (count * 2 - 2) / 2) * 2;
    positions.push(6);
    for (let pos = size - 7; positions.length < count; pos -= step) {
      positions.splice(1, 0, pos);
    }
  }
  for (const row of positions) {
    for (const col of positions) {
      if ((row === 6 && col === 6) || (row === 6 && col === size - 7)
        || (row === size - 7 && col === 6)) continue;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) mark(row + dy, col + dx);
      }
    }
  }

  // The format strips, and the version blocks from version 7 up.
  for (let i = 0; i < 9; i += 1) {
    mark(8, i);
    mark(i, 8);
  }
  for (let i = 0; i < 8; i += 1) {
    mark(8, size - 1 - i);
    mark(size - 1 - i, 8);
  }
  if (version >= 7) {
    for (let i = 0; i < 18; i += 1) {
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      mark(b, a);
      mark(a, b);
    }
  }

  return reserved;
}

test('reader: it can tell a broken symbol from a good one', () => {
  // The round trips above are only worth something if the reader would notice
  // a symbol that had been damaged. The text fills version 1 exactly, so there
  // is no padding for a flipped module to hide in, and the module flipped is
  // the first data one - the bottom right corner, where the header goes.
  const text = 'ABCDEFGHIJKLMNOPQRSTUVWXY';
  const qr = makeQr(text, { level: 'L', mask: 0 }, say);
  assert.equal(qr.version, 1);

  const copy = { ...qr, modules: Uint8Array.from(qr.modules) };
  copy.modules[(qr.size - 1) * qr.size + (qr.size - 1)] ^= 1;

  let damaged;
  try {
    damaged = read(copy);
  } catch {
    damaged = null;   // an unreadable header is also "not the original".
  }
  assert.notEqual(damaged, text);
});

test('encode: capacity is the last character that fits, not the first that does not', () => {
  for (const level of LEVELS) {
    for (const version of [1, 5, 12, 27, 40]) {
      for (const mode of ['numeric', 'alphanumeric', 'byte']) {
        const capacity = capacityFor(mode, version, level);
        const character = { numeric: '7', alphanumeric: 'A', byte: 'a' }[mode];
        assert.equal(fitVersion(character.repeat(capacity), mode, level, 1, version),
                     fitVersion(character.repeat(capacity), mode, level, 1, 40),
                     `${version}-${level} ${mode}: the last one that fits`);
        assert.equal(fitVersion(character.repeat(capacity + 1), mode, level, 1, version),
                     0, `${version}-${level} ${mode}: one too many`);
      }
    }
  }
});

test('tables: the data capacity in codewords is what the block split says', () => {
  for (let version = 1; version <= 40; version += 1) {
    for (const level of LEVELS) {
      assert.equal(dataCapacity(version, level), blockLayout(version, level).dataCodewords);
    }
  }
});
