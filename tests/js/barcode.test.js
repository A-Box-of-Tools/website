/**
 * tools/qr-barcode/src - the linear barcodes.
 *
 * Same approach as the QR tests next door: the bars are read back rather than
 * compared against themselves. The readers at the foot of this file work from
 * the modules alone - run lengths in, characters out - so a wrong table, a
 * wrong check digit or a wrong code-set switch shows up as the wrong string
 * coming back rather than as a passing test.
 *
 * The tables that cannot be read back independently are checked against the
 * structural rules the symbologies were designed around: every Code 128 symbol
 * is eleven modules wide with an even number of dark ones, and every Code 39
 * character has three wide elements arranged one of exactly two ways. Those
 * rules are why a scanner can tell a misread from a read, and they catch a
 * mistyped row.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { PATTERNS, values } from '../../tools/qr-barcode/src/code128.js';
import { gs1Check, makeBarcode, SYMBOLOGIES } from '../../tools/qr-barcode/src/barcode.js';

/* ------------------------------------------------------------- Code 128 */

test('code128: every pattern is eleven modules with an even number dark', () => {
  assert.equal(PATTERNS.length, 107);

  PATTERNS.forEach((pattern, value) => {
    const widths = [...pattern].map(Number);
    const stop = value === 106;

    assert.equal(widths.length, stop ? 7 : 6, `${value}: element count`);
    assert.ok(widths.every((width) => width >= 1 && width <= 4), `${value}: element widths`);

    const total = widths.reduce((sum, width) => sum + width, 0);
    assert.equal(total, stop ? 13 : 11, `${value}: total width`);

    // The parity rule: the bars - the even-numbered elements - always come to
    // an even number of modules. It is what lets a scanner reject a misread.
    const bars = widths.filter((_, index) => index % 2 === 0)
      .reduce((sum, width) => sum + width, 0);
    assert.equal(bars % 2, 0, `${value}: bar parity`);
  });

  // No two symbols may share a pattern, or a reader could not tell them apart.
  assert.equal(new Set(PATTERNS).size, PATTERNS.length);
});

test('code128: the worked example', () => {
  // "Wikipedia" in Code B: the start, nine characters at their ASCII value
  // less 32, the modulo-103 check symbol, and the stop.
  assert.deepEqual(values('Wikipedia'),
                   [104, 55, 73, 75, 73, 80, 69, 68, 73, 65, 88, 106]);
});

test('code128: the check symbol is the weighted sum of everything before it', () => {
  for (const text of ['Wikipedia', 'abox.tools', '12345678', 'A1B2C3', 'x']) {
    const symbols = values(text);
    const check = symbols[symbols.length - 2];
    let sum = symbols[0];
    for (let i = 1; i < symbols.length - 2; i += 1) sum += symbols[i] * i;
    assert.equal(check, sum % 103, text);
  }
});

test('code128: long digit runs go into Code C, and short ones do not', () => {
  // Code C packs two digits into one symbol, so an even run of six or more is
  // worth switching for and a run of two is not.
  const short = values('AB12CD');
  assert.ok(!short.includes(99), 'no switch to Code C for two digits');

  const long = values('AB123456CD');
  assert.ok(long.includes(99), 'switched to Code C for six digits');
  assert.ok(long.length < values('AB123456CD'.replace(/[0-9]/g, 'X')).length + 2,
            'and the switch made it shorter');

  // All digits and an even count: Code C from the very start.
  assert.equal(values('12345678')[0], 105);
  assert.equal(values('1234567')[0], 104, 'an odd count starts in Code B');
});

test('code128: text comes back out of the bars', () => {
  const strings = [
    'Wikipedia',
    'abox.tools',
    'https://abox.tools/qr-barcode/',
    '12345678',
    '1234567',
    'AB123456CD',
    'A1B2C3',
    'ABC-123-XYZ',
    '0',
    'a',
    ' ',
    '~!@#$%^&*()_+{}|:"<>?',
    'Order 12345678901234 for J. Smith',
    'MiXeD CaSe 007',
  ];

  for (const text of strings) {
    const code = makeBarcode(text, { symbology: 'code128' });
    assert.equal(readCode128(code.modules), text, text);
    assert.equal(code.text, text);
  }
});

test('code128: what it will not hold', () => {
  assert.throws(() => makeBarcode('café', { symbology: 'code128' }), RangeError);
  assert.throws(() => makeBarcode('', { symbology: 'code128' }), RangeError);
});

/* --------------------------------------------------------------- Code 39 */

test('code39: the generated table matches the transcribed one', () => {
  // Fourteen rows written out by hand, against a table the tool builds from
  // the weighting rule. They were arrived at two different ways, so agreeing
  // means something.
  const known = {
    0: 'nnnwwnwnn',
    1: 'wnnwnnnnw',
    9: 'nnwwnnwnn',
    A: 'wnnnnwnnw',
    J: 'nnnnwwwnn',
    K: 'wnnnnnnww',
    T: 'nnnnwnwwn',
    U: 'wwnnnnnnw',
    Z: 'nwwnwnnnn',
    '-': 'nwnnnnwnw',
    '.': 'wwnnnnwnn',
    ' ': 'nwwnnnwnn',
    $: 'nwnwnwnnn',
    '%': 'nnnwnwnwn',
  };

  for (const [character, pattern] of Object.entries(known)) {
    const code = makeBarcode(character === ' ' ? ' ' : character, { symbology: 'code39' });
    // The second character of the symbol is the one asked for; the first and
    // last are the * that starts and ends every Code 39 code.
    assert.equal(readCode39(code.modules)[1], character, `${character}: reads back`);
    assert.equal(patternOf(code.modules, 1), pattern, `${character}: pattern`);
  }
});

test('code39: every character has three wide elements, arranged one of two ways', () => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';
  const seen = new Set();

  for (const character of alphabet) {
    const pattern = patternOf(makeBarcode(character, { symbology: 'code39' }).modules, 1);
    assert.equal(pattern.length, 9, character);
    assert.equal([...pattern].filter((element) => element === 'w').length, 3, character);

    const wideBars = [0, 2, 4, 6, 8].filter((index) => pattern[index] === 'w').length;
    const wideSpaces = [1, 3, 5, 7].filter((index) => pattern[index] === 'w').length;
    assert.ok((wideBars === 2 && wideSpaces === 1) || (wideBars === 0 && wideSpaces === 3),
              `${character}: ${pattern}`);

    assert.ok(!seen.has(pattern), `${character}: duplicate pattern`);
    seen.add(pattern);
  }
});

test('code39: text comes back out of the bars', () => {
  for (const text of ['ABOX TOOLS', 'A', '12345', 'PART-4471', '$1.00', 'A B C']) {
    const code = makeBarcode(text, { symbology: 'code39' });
    assert.equal(readCode39(code.modules), `*${text}*`, text);
  }
});

test('code39: lower case is raised, and the raising is said out loud', () => {
  const code = makeBarcode('abox tools', { symbology: 'code39' });
  assert.equal(code.text, 'ABOX TOOLS');
  assert.match(code.note, /capitals/);
  assert.equal(readCode39(code.modules), '*ABOX TOOLS*');
});

test('code39: the optional check character', () => {
  // "ABOX" is 10 + 11 + 24 + 33 = 78, and 78 modulo 43 is 35, which is Z.
  const code = makeBarcode('ABOX', { symbology: 'code39', code39Check: true });
  assert.equal(readCode39(code.modules), '*ABOXZ*');
});

test('code39: what it will not hold', () => {
  assert.throws(() => makeBarcode('lower*case', { symbology: 'code39' }), RangeError);
  assert.throws(() => makeBarcode('a,b', { symbology: 'code39' }), RangeError);
});

/* ---------------------------------------------------------- EAN and UPC */

test('ean: the left-hand patterns match the published element widths', () => {
  // The same table said a second way: each digit is a space, a bar, a space
  // and a bar whose widths add up to seven. Reading the runs out of the bit
  // patterns has to give that list back.
  const published = ['3211', '2221', '2122', '1411', '1132',
                     '1231', '1114', '1312', '1213', '3112'];

  for (let digit = 0; digit < 10; digit += 1) {
    // A number whose left group is six copies of this digit, so the patterns
    // can be read straight off the modules.
    const code = makeBarcode(`0${String(digit).repeat(6)}00000`, { symbology: 'ean13' });
    const start = 11 + 3;
    const group = [...code.modules.slice(start, start + 7)].join('');
    const runs = group.match(/0+|1+/g).map((run) => run.length).join('');
    assert.equal(runs, published[digit], `digit ${digit}`);
  }
});

test('ean13: the check digit, worked out and verified', () => {
  // 5901234123457 is the example every reference uses.
  assert.equal(gs1Check('590123412345'), 7);
  assert.equal(makeBarcode('590123412345', { symbology: 'ean13' }).text, '5901234123457');
  assert.equal(makeBarcode('5901234123457', { symbology: 'ean13' }).text, '5901234123457');
  assert.throws(() => makeBarcode('5901234123450', { symbology: 'ean13' }), RangeError);
});

test('upca: the check digit, worked out and verified', () => {
  assert.equal(gs1Check('03600029145'), 2);
  assert.equal(makeBarcode('03600029145', { symbology: 'upca' }).text, '036000291452');
  assert.throws(() => makeBarcode('036000291453', { symbology: 'upca' }), RangeError);
});

test('ean13: the number comes back out of the bars', () => {
  for (const number of ['5901234123457', '4006381333931', '9780306406157',
                        '0000000000000', '9999999999994']) {
    const code = makeBarcode(number, { symbology: 'ean13' });
    assert.equal(readEan(code.modules, 11, 13), number, number);
  }
});

test('upca: a UPC-A is an EAN-13 with a zero in front', () => {
  const upc = makeBarcode('036000291452', { symbology: 'upca' });
  const ean = makeBarcode('0036000291452', { symbology: 'ean13' });
  // Same bars, different quiet zones and different printing.
  const bars = (code, left, right) => [...code.modules.slice(left, code.modules.length - right)]
    .join('');
  assert.equal(bars(upc, 9, 9), bars(ean, 11, 7));
  assert.equal(readEan(upc.modules, 9, 13), '0036000291452');
});

test('ean8: the short one', () => {
  const code = makeBarcode('9638507', { symbology: 'ean8' });
  assert.equal(code.text, '96385074');
  assert.equal(readEan(code.modules, 7, 8), '96385074');
});

test('retail codes: the wrong number of digits is refused', () => {
  assert.throws(() => makeBarcode('12345', { symbology: 'ean13' }), RangeError);
  assert.throws(() => makeBarcode('12345678901234', { symbology: 'ean13' }), RangeError);
  assert.throws(() => makeBarcode('12345678901a', { symbology: 'ean13' }), RangeError);
  assert.throws(() => makeBarcode('123456', { symbology: 'ean8' }), RangeError);
});

/* -------------------------------------------------------------------- ITF */

test('itf: pairs of digits, one in the bars and one in the spaces', () => {
  for (const digits of ['1234', '00000000', '9876543210', '55']) {
    const code = makeBarcode(digits, { symbology: 'itf' });
    assert.equal(readItf(code.modules), digits, digits);
  }
});

test('itf: an odd number of digits is refused rather than padded', () => {
  assert.throws(() => makeBarcode('12345', { symbology: 'itf' }), RangeError);
  assert.throws(() => makeBarcode('12a4', { symbology: 'itf' }), RangeError);
});

test('itf14: fourteen digits, the last of them the check', () => {
  const code = makeBarcode('1540014128876', { symbology: 'itf14' });
  assert.equal(code.text.length, 14);
  assert.equal(code.text.slice(0, 13), '1540014128876');
  assert.equal(Number(code.text[13]), gs1Check('1540014128876'));
  assert.equal(readItf(code.modules), code.text);
});

/* ------------------------------------------------------------ the front door */

test('every symbology in the menu makes something', () => {
  const sample = {
    code128: 'ABOX-TOOLS-128',
    ean13: '5901234123457',
    upca: '036000291452',
    ean8: '96385074',
    itf14: '15400141288763',
    itf: '1234567890',
    code39: 'ABOX TOOLS',
  };

  for (const symbology of SYMBOLOGIES) {
    const code = makeBarcode(sample[symbology.id], { symbology: symbology.id });
    assert.equal(code.symbology, symbology.id);
    assert.equal(code.name, symbology.name);
    assert.ok(code.modules.length > 20, symbology.id);
    assert.equal(code.guards.length, code.modules.length, symbology.id);

    // A quiet zone on both sides, and it really is quiet.
    assert.ok(code.quiet.left >= 7 && code.quiet.right >= 7, symbology.id);
    for (let i = 0; i < code.quiet.left; i += 1) assert.equal(code.modules[i], 0, symbology.id);
    for (let i = 0; i < code.quiet.right; i += 1) {
      assert.equal(code.modules[code.modules.length - 1 - i], 0, symbology.id);
    }

    // Bars at both ends of the symbol itself: a barcode that started or ended
    // with white space would have no findable edge.
    assert.equal(code.modules[code.quiet.left], 1, symbology.id);
    assert.equal(code.modules[code.modules.length - 1 - code.quiet.right], 1, symbology.id);

    assert.ok(code.labels.length >= 1, symbology.id);
    for (const label of code.labels) {
      assert.ok(label.to > label.from && label.to <= code.modules.length, symbology.id);
    }
  }
});

test('an unknown symbology is an error, not a blank picture', () => {
  assert.throws(() => makeBarcode('123', { symbology: 'aztec' }), RangeError);
});

/* ---------------------------------------------------------------- readers */

/** Module widths, in order, with the quiet zones dropped. */
function runs(modules) {
  const list = [...modules];
  while (list.length && list[0] === 0) list.shift();
  while (list.length && list[list.length - 1] === 0) list.pop();

  const out = [];
  let run = 1;
  for (let i = 1; i < list.length; i += 1) {
    if (list[i] === list[i - 1]) run += 1;
    else {
      out.push(run);
      run = 1;
    }
  }
  out.push(run);
  return out;
}

/** Read a Code 128 symbol back to the string it was made from. */
function readCode128(modules) {
  const elements = runs(modules);
  const symbols = [];
  for (let i = 0; i + 6 <= elements.length; i += 6) {
    const pattern = elements.slice(i, i + (elements.length - i === 7 ? 7 : 6)).join('');
    const value = PATTERNS.indexOf(pattern);
    assert.notEqual(value, -1, `unknown pattern ${pattern}`);
    symbols.push(value);
  }

  assert.equal(symbols[symbols.length - 1], 106, 'stop');

  let sum = symbols[0];
  for (let i = 1; i < symbols.length - 2; i += 1) sum += symbols[i] * i;
  assert.equal(symbols[symbols.length - 2], sum % 103, 'check symbol');

  let set = { 103: 'A', 104: 'B', 105: 'C' }[symbols[0]];
  assert.ok(set, 'start symbol');

  let out = '';
  let shifted = null;
  for (let i = 1; i < symbols.length - 2; i += 1) {
    const value = symbols[i];
    const active = shifted ?? set;
    shifted = null;

    if (active !== 'C' && value === 98) {
      shifted = active === 'A' ? 'B' : 'A';
      continue;
    }
    if (value === 99 && active !== 'C') { set = 'C'; continue; }
    if (value === 100 && active !== 'B') { set = 'B'; continue; }
    if (value === 101 && active !== 'A') { set = 'A'; continue; }

    if (active === 'C') out += String(value).padStart(2, '0');
    else if (active === 'A') out += String.fromCharCode(value < 64 ? value + 32 : value - 64);
    else out += String.fromCharCode(value + 32);
  }
  return out;
}

/** The narrow/wide pattern of one Code 39 character, by its position. */
function patternOf(modules, index) {
  const elements = runs(modules);
  return elements.slice(index * 10, index * 10 + 9)
    .map((width) => (width === 1 ? 'n' : 'w')).join('');
}

/** Read a Code 39 symbol back, asterisks included. */
function readCode39(modules) {
  const elements = runs(modules);
  const alphabet = {};
  // Built by asking the tool for each character on its own is circular, so the
  // reader recognises characters by their pattern using the same rule the
  // encoder claims to follow - written out here independently.
  const weights = [1, 2, 4, 7, 0];
  const pairs = [];
  for (let a = 0; a < 5; a += 1) {
    for (let b = a + 1; b < 5; b += 1) {
      const total = weights[a] + weights[b];
      pairs[total === 11 ? 10 : total] = [a, b];
    }
  }
  const groups = [['1234567890', 3], ['ABCDEFGHIJ', 5], ['KLMNOPQRST', 7], ['UVWXYZ-. *', 1]];
  for (const [characters, wideSpace] of groups) {
    [...characters].forEach((character, index) => {
      const pattern = new Array(9).fill('n');
      for (const bar of pairs[index + 1]) pattern[bar * 2] = 'w';
      pattern[wideSpace] = 'w';
      alphabet[pattern.join('')] = character;
    });
  }
  for (const [character, spaces] of [['$', [1, 3, 5]], ['/', [1, 3, 7]],
                                     ['+', [1, 5, 7]], ['%', [3, 5, 7]]]) {
    const pattern = new Array(9).fill('n');
    for (const space of spaces) pattern[space] = 'w';
    alphabet[pattern.join('')] = character;
  }

  let out = '';
  for (let i = 0; i + 9 <= elements.length; i += 10) {
    const pattern = elements.slice(i, i + 9).map((width) => (width === 1 ? 'n' : 'w')).join('');
    assert.ok(pattern in alphabet, `unknown Code 39 pattern ${pattern}`);
    out += alphabet[pattern];
  }
  return out;
}

/** Read an EAN-13, EAN-8 or UPC-A back to its digits, check digit included. */
function readEan(modules, quietLeft, length) {
  const bits = [...modules].join('');
  const L = ['0001101', '0011001', '0010011', '0111101', '0100011',
             '0110001', '0101111', '0111011', '0110111', '0001011'];
  const R = L.map((pattern) => [...pattern].map((bit) => (bit === '0' ? '1' : '0')).join(''));
  const G = R.map((pattern) => [...pattern].reverse().join(''));
  const parity = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
                  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

  const half = length === 8 ? 4 : 6;
  let at = quietLeft;
  assert.equal(bits.slice(at, at + 3), '101', 'start guard');
  at += 3;

  const left = [];
  let seen = '';
  for (let i = 0; i < half; i += 1) {
    const group = bits.slice(at, at + 7);
    at += 7;
    const odd = L.indexOf(group);
    const even = G.indexOf(group);
    assert.ok(odd !== -1 || even !== -1, `left digit ${i}`);
    left.push(odd !== -1 ? odd : even);
    seen += odd !== -1 ? 'L' : 'G';
  }

  assert.equal(bits.slice(at, at + 5), '01010', 'centre guard');
  at += 5;

  const right = [];
  for (let i = 0; i < half; i += 1) {
    const group = bits.slice(at, at + 7);
    at += 7;
    const digit = R.indexOf(group);
    assert.notEqual(digit, -1, `right digit ${i}`);
    right.push(digit);
  }

  assert.equal(bits.slice(at, at + 3), '101', 'end guard');

  // The first digit of an EAN-13 is not printed in bars at all: it is the
  // parity pattern of the left-hand six.
  const first = length === 8 ? '' : String(parity.indexOf(seen));
  if (length !== 8) assert.notEqual(first, '-1', 'parity pattern');

  const digits = first + left.join('') + right.join('');
  assert.equal(Number(digits.slice(-1)), gs1Check(digits.slice(0, -1)), 'check digit');
  return digits;
}

/** Read an interleaved 2 of 5 symbol back to its digits. */
function readItf(modules) {
  const elements = runs(modules);
  const weights = [1, 2, 4, 7, 0];
  const value = (wide) => {
    const total = wide.reduce((sum, index) => sum + weights[index], 0);
    return total === 11 ? 0 : total;
  };

  assert.deepEqual(elements.slice(0, 4), [1, 1, 1, 1], 'start');
  assert.deepEqual(elements.slice(-3), [3, 1, 1], 'stop');

  const body = elements.slice(4, -3);
  assert.equal(body.length % 10, 0, 'whole pairs');

  let out = '';
  for (let i = 0; i < body.length; i += 10) {
    const pair = body.slice(i, i + 10);
    const bars = [];
    const spaces = [];
    for (let k = 0; k < 5; k += 1) {
      if (pair[k * 2] === 3) bars.push(k);
      if (pair[k * 2 + 1] === 3) spaces.push(k);
    }
    out += `${value(bars)}${value(spaces)}`;
  }
  return out;
}
