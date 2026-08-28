/**
 * The linear barcodes: the striped kind, where the answer is a row of bars
 * rather than a grid of squares.
 *
 * Every one of them is the same idea - a table of patterns, a check digit, and
 * a quiet zone either side - and they differ mostly in what they will hold.
 * The retail three (EAN-13, EAN-8, UPC-A) hold a fixed number of digits and
 * nothing else, because the number is an entry in a global register rather than
 * a message. ITF holds digits in pairs. Code 39 holds capitals and a handful of
 * punctuation. Code 128, in its own file, holds text.
 *
 * Two of the tables here are not written out at all. Code 39's and ITF's are
 * generated from the rule that produced them - "the two wide bars, out of five
 * positions, spell a number between 1 and 10" - because a rule can be checked
 * by reading it and a table of forty-four rows can only be checked by trusting
 * whoever typed it.
 */

import { modules as code128Modules, QUIET as CODE128_QUIET } from './code128.js';

/** How wide a wide element is, in narrow ones. Three scans best. */
const WIDE = 3;

/* --------------------------------------------------------------- EAN & UPC */

/** The odd-parity set. G is R reversed, and R is L inverted, so one table does. */
const EAN_L = [
  '0001101', '0011001', '0010011', '0111101', '0100011',
  '0110001', '0101111', '0111011', '0110111', '0001011',
];

const EAN_R = EAN_L.map((bits) => [...bits].map((bit) => (bit === '0' ? '1' : '0')).join(''));
const EAN_G = EAN_R.map((bits) => [...bits].reverse().join(''));

/**
 * Which of the six left-hand digits are written in the odd set and which in the
 * even one. The pattern itself is what encodes the thirteenth digit: there is
 * no room left for it in the bars, so EAN-13 hides it in the parity of the
 * other six. That is why a UPC-A code is an EAN-13 whose first digit is zero -
 * pattern 0 is all-L, which is exactly what UPC-A always was.
 */
const EAN_PARITY = [
  'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL',
];

/**
 * The GS1 check digit: every second digit counts three times, from the right,
 * and the check is whatever brings the total to a multiple of ten.
 */
export function gs1Check(digits) {
  let sum = 0;
  for (let i = digits.length - 1, weight = 3; i >= 0; i -= 1, weight = 4 - weight) {
    sum += Number(digits[i]) * weight;
  }
  return (10 - (sum % 10)) % 10;
}

/* --------------------------------------------------- Code 39, and ITF's half */

/**
 * The ten "two wide out of five" patterns, in the order that gives each one its
 * value. The positions are worth 1, 2, 4 and 7, and the fifth is worth nothing -
 * so 1+2 is three, 4+7 is eleven, and eleven is the one that stands for zero.
 * Every interleaved 2 of 5 barcode in the world is this table, and so is the
 * bar half of every Code 39 character.
 */
const TWO_OF_FIVE = (() => {
  const weights = [1, 2, 4, 7, 0];
  const byValue = new Map();
  for (let a = 0; a < 5; a += 1) {
    for (let b = a + 1; b < 5; b += 1) {
      const total = weights[a] + weights[b];
      byValue.set(total === 11 ? 10 : total, [a, b]);
    }
  }
  return byValue;
})();

/**
 * Code 39, generated rather than transcribed.
 *
 * Forty of the forty-four characters are one of the ten bar patterns above with
 * one of four spaces widened, which is what the four groups below are; the last
 * four are the only characters with three wide spaces and no wide bar at all.
 */
const CODE39 = (() => {
  const table = new Map();

  const groups = [
    ['1234567890', 3],
    ['ABCDEFGHIJ', 5],
    ['KLMNOPQRST', 7],
    ['UVWXYZ-. *', 1],
  ];

  for (const [characters, wideSpace] of groups) {
    [...characters].forEach((character, index) => {
      const widths = new Array(9).fill(1);
      for (const bar of TWO_OF_FIVE.get(index + 1)) widths[bar * 2] = WIDE;
      widths[wideSpace] = WIDE;
      table.set(character, widths);
    });
  }

  // $ / + % : the four ways to pick three of the four spaces.
  const specials = [['$', [1, 3, 5]], ['/', [1, 3, 7]], ['+', [1, 5, 7]], ['%', [3, 5, 7]]];
  for (const [character, spaces] of specials) {
    const widths = new Array(9).fill(1);
    for (const space of spaces) widths[space] = WIDE;
    table.set(character, widths);
  }

  return table;
})();

/** The value of each character for the optional modulo-43 check character. */
const CODE39_VALUES = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';

/* ------------------------------------------------------------- the builders */

/** A run of light modules. */
function quiet(width) {
  return new Array(width).fill(0);
}

/** Turn "0101" into modules, one per character. */
function bits(pattern) {
  return [...pattern].map(Number);
}

/** Turn a run of element widths into modules, starting with a bar. */
function widths(list, startDark = 1) {
  const out = [];
  let dark = startDark;
  for (const width of list) {
    for (let i = 0; i < width; i += 1) out.push(dark);
    dark ^= 1;
  }
  return out;
}

/**
 * EAN-13, EAN-8 and UPC-A, which are one symbology wearing three labels.
 *
 * @param {string} digits the full number including its check digit
 * @param {'ean13'|'ean8'|'upca'} kind
 */
function retail(digits, kind) {
  const quietLeft = kind === 'ean13' ? 11 : kind === 'upca' ? 9 : 7;
  const quietRight = kind === 'ean13' ? 7 : kind === 'upca' ? 9 : 7;

  const modules = [...quiet(quietLeft)];
  const guards = [...quiet(quietLeft)];
  const mark = (list, guard = false) => {
    for (const module of list) {
      modules.push(module);
      guards.push(guard ? 1 : 0);
    }
  };

  // UPC-A is EAN-13 with a leading zero, which is not a trick - it is what the
  // standard says the two are.
  const full = kind === 'upca' ? `0${digits}` : digits;
  const left = kind === 'ean8' ? full.slice(0, 4) : full.slice(1, 7);
  const right = kind === 'ean8' ? full.slice(4) : full.slice(7);
  const parity = kind === 'ean8' ? 'LLLL' : EAN_PARITY[Number(full[0])];

  mark(bits('101'), true);
  [...left].forEach((digit, index) => {
    mark(bits(parity[index] === 'L' ? EAN_L[Number(digit)] : EAN_G[Number(digit)]));
  });
  mark(bits('01010'), true);
  for (const digit of right) mark(bits(EAN_R[Number(digit)]));
  mark(bits('101'), true);

  for (let i = 0; i < quietRight; i += 1) {
    modules.push(0);
    guards.push(0);
  }

  // Where each group of digits is printed. The outer digits of an EAN-13 and a
  // UPC-A sit in the quiet zone rather than under the bars, which is not
  // decoration: a printed digit out there is what stops somebody trimming the
  // white space off and making the code unreadable.
  const leftStart = quietLeft + 3;
  const rightStart = leftStart + left.length * 7 + 5;
  const labels = [];
  if (kind === 'ean13') {
    labels.push({ text: full[0], from: 0, to: quietLeft, outside: true });
    labels.push({ text: left, from: leftStart, to: leftStart + 42 });
    labels.push({ text: right, from: rightStart, to: rightStart + 42 });
  } else if (kind === 'upca') {
    labels.push({ text: digits[0], from: 0, to: quietLeft, outside: true });
    labels.push({ text: left.slice(1), from: leftStart + 7, to: leftStart + 42 });
    labels.push({ text: right.slice(0, 5), from: rightStart, to: rightStart + 35 });
    labels.push({
      text: digits[digits.length - 1],
      from: modules.length - quietRight,
      to: modules.length,
      outside: true,
    });
  } else {
    labels.push({ text: left, from: leftStart, to: leftStart + 28 });
    labels.push({ text: right, from: rightStart, to: rightStart + 28 });
  }

  return {
    modules: Uint8Array.from(modules),
    guards: Uint8Array.from(guards),
    labels,
    quiet: { left: quietLeft, right: quietRight },
  };
}

/** Interleaved 2 of 5: digits in pairs, one as the bars and one as the spaces. */
function interleaved(digits) {
  const QUIET_ITF = 10;
  const modules = [...quiet(QUIET_ITF), ...widths([1, 1, 1, 1])];

  for (let i = 0; i < digits.length; i += 2) {
    const bars = TWO_OF_FIVE.get(Number(digits[i]) === 0 ? 10 : Number(digits[i]));
    const spaces = TWO_OF_FIVE.get(Number(digits[i + 1]) === 0 ? 10 : Number(digits[i + 1]));
    const pair = [];
    for (let k = 0; k < 5; k += 1) {
      pair.push(bars.includes(k) ? WIDE : 1);
      pair.push(spaces.includes(k) ? WIDE : 1);
    }
    modules.push(...widths(pair));
  }

  modules.push(...widths([WIDE, 1, 1]));
  modules.push(...quiet(QUIET_ITF));

  return {
    modules: Uint8Array.from(modules),
    guards: new Uint8Array(modules.length),
    labels: [{ text: digits, from: QUIET_ITF, to: modules.length - QUIET_ITF }],
    quiet: { left: QUIET_ITF, right: QUIET_ITF },
  };
}

/** Code 39, with a narrow space between every character and a * at each end. */
function code39(text, addCheck, t) {
  const QUIET_39 = 10;
  const characters = [...text];

  for (const character of characters) {
    if (!CODE39.has(character) || character === '*') {
      throw new RangeError(t('bar.code39.cannot',
        { char: JSON.stringify(character) }));
    }
  }

  const printed = [...characters];
  if (addCheck) {
    const sum = characters.reduce((total, character) => total + CODE39_VALUES.indexOf(character), 0);
    printed.push(CODE39_VALUES[sum % 43]);
  }

  const modules = [...quiet(QUIET_39)];
  for (const character of ['*', ...printed, '*']) {
    modules.push(...widths(CODE39.get(character)));
    modules.push(0);      // the narrow space between characters
  }
  modules.pop();          // ...except after the last one.
  modules.push(...quiet(QUIET_39));

  return {
    modules: Uint8Array.from(modules),
    guards: new Uint8Array(modules.length),
    labels: [{ text: `*${printed.join('')}*`, from: QUIET_39, to: modules.length - QUIET_39 }],
    quiet: { left: QUIET_39, right: QUIET_39 },
  };
}

/* --------------------------------------------------------------- the front door */

/**
 * Every symbology this tool writes, in the order the menu offers them.
 *
 * `holds` is the sentence shown under the menu, and `check` says what the tool
 * does about the check digit - which for the retail codes is the thing people
 * most often get wrong, because the number on the box already has one.
 *
 * `holds` and `needs` are phrase keys, not sentences. The first is read out
 * beside the menu and the second goes inside a refusal, and this file is
 * copied byte for byte into every language - see shared/js/phrases.js. The
 * names are the symbologies' own and stay as they are printed.
 */
export const SYMBOLOGIES = [
  {
    id: 'code128',
    name: 'Code 128',
    holds: 'bar.code128.holds',
    needs: 'bar.code128.needs',
    pattern: null,
  },
  {
    id: 'ean13',
    name: 'EAN-13',
    holds: 'bar.ean13.holds',
    needs: 'bar.ean13.needs',
    pattern: /^[0-9]{12,13}$/,
  },
  {
    id: 'upca',
    name: 'UPC-A',
    holds: 'bar.upca.holds',
    needs: 'bar.upca.needs',
    pattern: /^[0-9]{11,12}$/,
  },
  {
    id: 'ean8',
    name: 'EAN-8',
    holds: 'bar.ean8.holds',
    needs: 'bar.ean8.needs',
    pattern: /^[0-9]{7,8}$/,
  },
  {
    id: 'itf14',
    name: 'ITF-14',
    holds: 'bar.itf14.holds',
    needs: 'bar.itf14.needs',
    pattern: /^[0-9]{13,14}$/,
  },
  {
    id: 'itf',
    name: 'Interleaved 2 of 5',
    holds: 'bar.itf.holds',
    needs: 'bar.itf.needs',
    pattern: /^([0-9]{2})+$/,
  },
  {
    id: 'code39',
    name: 'Code 39',
    holds: 'bar.code39.holds',
    needs: 'bar.code39.needs',
    pattern: /^[0-9A-Z\-. $/+%]+$/,
  },
];

/**
 * The retail symbologies take a fixed number of digits, and the check digit is
 * either supplied or worked out. Supplying a wrong one is an error rather than
 * something to quietly correct: a mistyped digit that gets fixed for you is a
 * label that scans as the wrong product.
 */
function withCheck(digits, length, name, t) {
  if (digits.length === length) {
    const expected = gs1Check(digits.slice(0, length - 1));
    if (Number(digits[length - 1]) !== expected) {
      throw new RangeError(t('bar.checkdigit',
        { name, expected, actual: digits[length - 1] }));
    }
    return { digits, added: false };
  }
  return { digits: digits + gs1Check(digits), added: true };
}

/**
 * Make a barcode.
 *
 * @param {string} text
 * @param {{symbology: string, code39Check?: boolean}} options
 * @returns {{modules: Uint8Array, guards: Uint8Array, labels: object[],
 *            quiet: {left: number, right: number}, symbology: string, name: string,
 *            text: string, note: string}}
 *   `modules` is one byte per module across, quiet zones included: 1 dark.
 */
export function makeBarcode(text, options, t) {
  const symbology = SYMBOLOGIES.find((entry) => entry.id === options.symbology);
  if (!symbology) throw new RangeError(t('bar.nosuch', { id: options.symbology }));

  const value = symbology.id === 'code39' ? text.toUpperCase() : text;

  if (!value) throw new RangeError(t('bar.empty', { name: symbology.name }));
  if (symbology.pattern && !symbology.pattern.test(value)) {
    throw new RangeError(t('bar.wants',
      { name: symbology.name, needs: t(symbology.needs) }));
  }

  let note = '';
  let drawn;
  let printed = value;

  if (symbology.id === 'ean13' || symbology.id === 'upca' || symbology.id === 'ean8') {
    const length = { ean13: 13, upca: 12, ean8: 8 }[symbology.id];
    const checked = withCheck(value, length, symbology.name, t);
    printed = checked.digits;
    if (checked.added) note = t('bar.added', { digit: printed.slice(-1) });
    drawn = retail(printed, symbology.id);
  } else if (symbology.id === 'itf14') {
    const checked = withCheck(value, 14, 'ITF-14', t);
    printed = checked.digits;
    if (checked.added) note = t('bar.added', { digit: printed.slice(-1) });
    drawn = interleaved(printed);
  } else if (symbology.id === 'itf') {
    drawn = interleaved(value);
  } else if (symbology.id === 'code39') {
    drawn = code39(value, options.code39Check === true, t);
    if (options.code39Check) note = t('bar.modulo43');
    if (value !== text) {
      note = note ? t('bar.andraised', { note }) : t('bar.raised');
    }
  } else {
    drawn = {
      modules: code128Modules(value, t),
      guards: null,
      labels: null,
      quiet: { left: CODE128_QUIET, right: CODE128_QUIET },
    };
    drawn.guards = new Uint8Array(drawn.modules.length);
    drawn.labels = [{
      text: value,
      from: CODE128_QUIET,
      to: drawn.modules.length - CODE128_QUIET,
    }];
  }

  return {
    ...drawn,
    symbology: symbology.id,
    name: symbology.name,
    text: printed,
    note,
  };
}
