/**
 * The striped barcodes, read back: EAN-13, EAN-8, UPC-A, UPC-E, ITF, Code 128
 * and Code 39.
 *
 * A linear barcode is a much smaller problem than a QR code and a much less
 * forgiving one. Smaller, because there is nothing to find: any horizontal line
 * across the symbol holds the whole message, so there is no geometry to work
 * out, no perspective to undo and no grid to sample. Less forgiving, because
 * apart from a check digit there is no error correction anywhere in any of
 * these formats - a misread bar is a wrong number, and nothing in the symbol
 * says so.
 *
 * That shapes everything here.
 *
 * Widths are compared as proportions, never as pixels. A barcode says "this bar
 * is three times the width of that one", and the unit is whatever the printer
 * and the camera between them made it; every pattern below is matched by
 * scaling it to the run it is being compared against.
 *
 * And a single agreeing line is not enough. The picture is scanned along many
 * lines, and down as many columns, because a barcode photographed sideways is
 * still a barcode; an answer is only reported when two lines agree on it, or
 * when the format carries a checksum strong enough to stand alone. Together
 * with the quiet-zone test below, that is the whole defence against a misread,
 * so neither part of it is optional.
 */

/* ------------------------------------------------------------- run matching */

/**
 * How badly a stretch of runs matches a pattern of module widths, or Infinity.
 *
 * The pattern is scaled to the runs rather than the other way round, so the
 * same table reads a barcode printed at two pixels a module and one printed at
 * forty. `tolerance` is how far one element may be out on its own: a barcode
 * whose every bar is 10% wide is fine, and one with a single bar 60% wide is a
 * misread waiting to happen.
 */
function variance(runs, at, pattern, tolerance) {
  let total = 0;
  let expected = 0;
  for (let i = 0; i < pattern.length; i += 1) {
    if (at + i >= runs.length) return Infinity;
    total += runs[at + i];
    expected += pattern[i];
  }
  if (total < expected) return Infinity;

  const unit = total / expected;
  const allowed = tolerance * unit;
  let error = 0;
  for (let i = 0; i < pattern.length; i += 1) {
    const difference = Math.abs(runs[at + i] - pattern[i] * unit);
    if (difference > allowed) return Infinity;
    error += difference;
  }
  return error / total;
}

/**
 * Is there white space in front of this bar, as every one of these formats
 * requires there to be?
 *
 * The quiet zone is part of a barcode - the specifications ask for seven to
 * eleven modules of it - and checking for it is not pedantry. It is the single
 * cheapest thing that separates a barcode from texture: gravel, grass, a page
 * of small print and camera grain all produce runs in every ratio you could
 * want, and none of them produces a clean white gap in front of one. Three
 * modules rather than the specification's ten, because a photograph cropped
 * close is a real thing and noise with three clear modules in front of it is
 * not.
 */
function quietBefore(runs, at, unit) {
  return at === 0 || runs[at - 1] >= unit * 3;
}

/**
 * And white space after it, which matters just as much and for the same
 * reason.
 *
 * Checking only the front leaves the far end of a candidate free to be
 * anything, and in a picture of grain there is always more grain there. Both
 * ends together is what makes an accidental reading need clean margins in two
 * places at once, at the right distance apart - which noise does not manage.
 */
function quietAfter(runs, end, unit) {
  return end >= runs.length || runs[end] >= unit * 3;
}

/** Which of a table of patterns these runs match best. */
function bestPattern(runs, at, patterns, tolerance) {
  let best = -1;
  let bestError = Infinity;
  for (let i = 0; i < patterns.length; i += 1) {
    const error = variance(runs, at, patterns[i], tolerance);
    if (error < bestError) {
      bestError = error;
      best = i;
    }
  }
  return best;
}

/* --------------------------------------------------------------- EAN and UPC */

/**
 * The odd-parity digit patterns, as four element widths each.
 *
 * The even set is these reversed and the right-hand set is these inverted, and
 * inverting swaps bars for spaces without changing a single width - which is
 * why one table of ten reads both halves of the symbol.
 */
const EAN_ODD = [
  [3, 2, 1, 1], [2, 2, 2, 1], [2, 1, 2, 2], [1, 4, 1, 1], [1, 1, 3, 2],
  [1, 2, 3, 1], [1, 1, 1, 4], [1, 3, 1, 2], [1, 2, 1, 3], [3, 1, 1, 2],
];

const EAN_EVEN = EAN_ODD.map((pattern) => [...pattern].reverse());

/** The odd set followed by the even one, so a match above 9 means "even". */
const EAN_BOTH = [...EAN_ODD, ...EAN_EVEN];

/**
 * Which of the six left-hand digits are odd and which even, per first digit.
 *
 * This is where the thirteenth digit of an EAN-13 lives. There is no room for
 * it in the bars, so it is written in the parity of the other six - and reading
 * it back means reading that parity out and looking it up here.
 */
const EAN_PARITY = [
  'OOOOOO', 'OOEOEE', 'OOEEOE', 'OOEEEO', 'OEOOEE',
  'OEEOOE', 'OEEEOO', 'OEOEOE', 'OEOEEO', 'OEEOEO',
];

/** The parities of a UPC-E, per check digit, when the number system is zero. */
const UPCE_PARITY = [
  'EEEOOO', 'EEOEOO', 'EEOOEO', 'EEOOOE', 'EOEEOO',
  'EOOEEO', 'EOOOEE', 'EOEOEO', 'EOEOOE', 'EOOEOE',
];

/** The GS1 check digit: every second digit counts three times, from the right. */
export function gs1Check(digits) {
  let sum = 0;
  for (let i = digits.length - 1, weight = 3; i >= 0; i -= 1, weight = 4 - weight) {
    sum += Number(digits[i]) * weight;
  }
  return (10 - (sum % 10)) % 10;
}

/** The six digits of a UPC-E, opened out into the twelve of a UPC-A. */
function expandUpce(system, body, check) {
  const [a, b, c, d, e, last] = body;
  const middle = Number(last) <= 2
    ? `${a}${b}${last}0000${c}${d}${e}`
    : last === '3' ? `${a}${b}${c}00000${d}${e}`
      : last === '4' ? `${a}${b}${c}${d}00000${e}`
        : `${a}${b}${c}${d}${e}0000${last}`;
  return `${system}${middle}${check}`;
}

/**
 * Read six or four digits out of one half of a retail symbol.
 *
 * @returns {{digits: string, parity: string, at: number}|null}
 */
function eanHalf(runs, at, count, patterns) {
  let digits = '';
  let parity = '';
  let cursor = at;

  for (let i = 0; i < count; i += 1) {
    const match = bestPattern(runs, cursor, patterns, 0.7);
    if (match < 0) return null;
    digits += match % 10;
    parity += match >= 10 ? 'E' : 'O';
    cursor += 4;
  }
  return { digits, parity, at: cursor };
}

/**
 * EAN-13, EAN-8, UPC-A and UPC-E, which are one symbology wearing four labels.
 *
 * `at` is a dark run that matched the 1:1:1 start guard. What follows it is
 * either six digits, a five-element middle guard and six more (EAN-13, and so
 * UPC-A), four and four (EAN-8), or six digits and a six-element end guard
 * (UPC-E). Each is tried and each has to end with a guard where a guard
 * belongs, so a half-read of one is not the whole of another.
 */
function readRetail(runs, at) {
  const unit = (runs[at] + runs[at + 1] + runs[at + 2]) / 3;
  if (!quietBefore(runs, at, unit)) return null;
  const start = at + 3;

  // EAN-13 and UPC-A.
  const left = eanHalf(runs, start, 6, EAN_BOTH);
  if (left) {
    const first = EAN_PARITY.indexOf(left.parity);
    if (first >= 0 && variance(runs, left.at, [1, 1, 1, 1, 1], 0.7) < Infinity) {
      const right = eanHalf(runs, left.at + 5, 6, EAN_ODD);
      if (right && variance(runs, right.at, [1, 1, 1], 0.7) < Infinity
        && quietAfter(runs, right.at + 3, unit)) {
        const digits = `${first}${left.digits}${right.digits}`;
        if (gs1Check(digits.slice(0, 12)) === Number(digits[12])) {
          // A UPC-A is an EAN-13 whose first digit is zero. That is not a
          // trick of this reader; it is what the two standards say.
          return digits[0] === '0'
            ? { format: 'upca', name: 'UPC-A', text: digits.slice(1), ean: digits }
            : { format: 'ean13', name: 'EAN-13', text: digits, ean: digits };
        }
      }
    }
  }

  // UPC-E, which has no middle guard and half the digits.
  if (left) {
    const check = UPCE_PARITY.indexOf(left.parity);
    const inverted = UPCE_PARITY.indexOf([...left.parity]
      .map((mark) => (mark === 'E' ? 'O' : 'E')).join(''));
    const system = check >= 0 ? 0 : 1;
    const digit = check >= 0 ? check : inverted;
    if (digit >= 0 && variance(runs, left.at, [1, 1, 1, 1, 1, 1], 0.7) < Infinity
      && quietAfter(runs, left.at + 6, unit)) {
      const full = expandUpce(system, left.digits, digit);
      if (gs1Check(full.slice(0, 11)) === Number(full[11])) {
        return {
          format: 'upce',
          name: 'UPC-E',
          text: `${system}${left.digits}${digit}`,
          ean: `0${full}`,
        };
      }
    }
  }

  // EAN-8.
  const short = eanHalf(runs, start, 4, EAN_ODD);
  if (short && variance(runs, short.at, [1, 1, 1, 1, 1], 0.7) < Infinity) {
    const tail = eanHalf(runs, short.at + 5, 4, EAN_ODD);
    if (tail && variance(runs, tail.at, [1, 1, 1], 0.7) < Infinity
      && quietAfter(runs, tail.at + 3, unit)) {
      const digits = short.digits + tail.digits;
      if (gs1Check(digits.slice(0, 7)) === Number(digits[7])) {
        return { format: 'ean8', name: 'EAN-8', text: digits, ean: digits };
      }
    }
  }

  return null;
}

/* ------------------------------------------------------------------ Code 128 */

/**
 * The 107 symbols, as element widths, bar first.
 *
 * The same published table the generator in `/qr-barcode/` writes from. It has
 * to be here rather than shared with it, because a tool ships only its own
 * `src/`; what keeps the two honest is that the tests encode with one and
 * decode with the other, so a transposed row here fails a round trip rather
 * than quietly producing the wrong character.
 */
const CODE128 = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213',
  '122312', '132212', '221213', '221312', '231212', '112232', '122132',
  '122231', '113222', '123122', '123221', '223211', '221132', '221231',
  '213212', '223112', '312131', '311222', '321122', '321221', '312212',
  '322112', '322211', '212123', '212321', '232121', '111323', '131123',
  '131321', '112313', '132113', '132311', '211313', '231113', '231311',
  '112133', '112331', '132131', '113123', '113321', '133121', '313121',
  '211331', '231131', '213113', '213311', '213131', '311123', '311321',
  '331121', '312113', '312311', '332111', '314111', '221411', '431111',
  '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114',
  '413111', '241112', '134111', '111242', '121142', '121241', '114212',
  '124112', '124211', '411212', '421112', '421211', '212141', '214121',
  '412121', '111143', '111341', '131141', '114113', '114311', '411113',
  '411311', '113141', '114131', '311141', '411131', '211412', '211214',
  '211232', '2331112',
].map((widths) => [...widths].map(Number).slice(0, 6));

/**
 * The stop symbol has a fourth bar, so it is seven elements where every other
 * symbol is six. Cut to six above, it is still unlike any of the others, and
 * matching six of everything means one loop rather than a special case in the
 * middle of one.
 */
const CODE128_STOP = 106;

/** Code A's alphabet: the control characters and the capitals. */
function code128A(value) {
  if (value < 64) return String.fromCharCode(value + 32);
  if (value < 96) return String.fromCharCode(value - 64);
  return null;
}

/** Code B's: the whole of printable ASCII. */
function code128B(value) {
  return value < 96 ? String.fromCharCode(value + 32) : null;
}

/**
 * Read a Code 128 symbol.
 *
 * The check symbol is a weighted sum of everything before it, which makes this
 * the one linear format here that can say for itself whether it was read
 * correctly - a stronger guarantee than a retail check digit, because it covers
 * every symbol rather than one digit.
 */
function readCode128(runs, at) {
  const start = bestPattern(runs, at, CODE128.slice(103, 106), 0.7);
  if (start < 0) return null;

  // Every symbol is eleven modules wide, so the six that make up the start
  // pattern say what a module is here.
  let width = 0;
  for (let i = 0; i < 6; i += 1) width += runs[at + i];
  const unit = width / 11;
  if (!quietBefore(runs, at, unit)) return null;

  const values = [];
  let cursor = at + 6;

  for (;;) {
    const value = bestPattern(runs, cursor, CODE128, 0.7);
    if (value < 0) return null;
    cursor += 6;
    if (value === CODE128_STOP) break;
    values.push(value);
    if (values.length > 256) return null;
  }

  // The stop pattern has a seventh element the six-wide match above stepped
  // over, so the quiet zone is one run further on than the cursor.
  if (!quietAfter(runs, cursor + 1, unit)) return null;

  // Start, data, check, stop. The check is the weighted sum of everything
  // before it, which makes this the one linear format here that says for
  // itself whether the whole symbol was read correctly.
  if (!values.length) return null;
  const check = values.pop();
  let checksum = 103 + start;
  values.forEach((value, index) => { checksum += value * (index + 1); });
  if (checksum % 103 !== check) return null;

  let set = 'ABC'[start];
  let shift = null;
  let text = '';

  for (const value of values) {
    const active = shift ?? set;
    shift = null;

    if (active === 'C') {
      if (value < 100) text += String(value).padStart(2, '0');
      else if (value === 100) set = 'B';
      else if (value === 101) set = 'A';
      // 102 is FNC1: a field separator in a GS1 code, and not a character.
      continue;
    }

    if (value < 96) {
      const character = active === 'A' ? code128A(value) : code128B(value);
      if (character === null) return null;
      text += character;
    } else if (value === 98) {
      shift = active === 'A' ? 'B' : 'A';
    } else if (value === 99) {
      set = 'C';
    } else if (value === 100) {
      set = active === 'B' ? 'A' : 'B';
    } else if (value === 101) {
      set = active === 'A' ? 'B' : 'A';
    }
    // 96, 97 and 102 are the other FNC characters: structure, not text.
  }

  return { format: 'code128', name: 'Code 128', text };
}

/* ------------------------------------------------- Code 39 and ITF, generated */

/**
 * The ten "two wide out of five" patterns, by the value each one stands for.
 *
 * Generated from the rule rather than transcribed, because the rule is short
 * enough to check by reading it: the five positions are worth 1, 2, 4, 7 and
 * nothing, two of them are wide, and the pair that adds to eleven is the one
 * that means zero. Every Interleaved 2 of 5 barcode is this table, and so is
 * the bar half of every Code 39 character.
 */
const TWO_OF_FIVE = (() => {
  const weights = [1, 2, 4, 7, 0];
  const byValue = new Map();
  for (let a = 0; a < 5; a += 1) {
    for (let b = a + 1; b < 5; b += 1) {
      const total = weights[a] + weights[b];
      byValue.set(total === 11 ? 0 : total, [a, b]);
    }
  }
  return byValue;
})();

/** The same ten, as five element widths each, indexed by digit. */
const ITF_DIGITS = Array.from({ length: 10 }, (unused, digit) => {
  const wide = TWO_OF_FIVE.get(digit);
  return [0, 1, 2, 3, 4].map((position) => (wide.includes(position) ? 3 : 1));
});

/** Code 39's alphabet, in the order the generated patterns fall out in. */
const CODE39_VALUES = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';

/**
 * Code 39's forty-four characters, as nine element widths each.
 *
 * Forty of them are one of the bar patterns above with one of four spaces
 * widened; the last four are the only characters with three wide spaces and no
 * wide bar. Generated for the same reason as the table above it.
 */
const CODE39 = (() => {
  const table = new Map();
  const groups = [['1234567890', 3], ['ABCDEFGHIJ', 5], ['KLMNOPQRST', 7], ['UVWXYZ-. *', 1]];

  for (const [characters, wideSpace] of groups) {
    [...characters].forEach((character, index) => {
      const widths = new Array(9).fill(1);
      for (const bar of TWO_OF_FIVE.get((index + 1) % 10)) widths[bar * 2] = 3;
      widths[wideSpace] = 3;
      table.set(character, widths);
    });
  }

  for (const [character, spaces] of [['$', [1, 3, 5]], ['/', [1, 3, 7]],
    ['+', [1, 5, 7]], ['%', [3, 5, 7]]]) {
    const widths = new Array(9).fill(1);
    for (const space of spaces) widths[space] = 3;
    table.set(character, widths);
  }

  return table;
})();

const CODE39_CHARACTERS = [...CODE39.keys()];
const CODE39_PATTERNS = CODE39_CHARACTERS.map((character) => CODE39.get(character));

/**
 * Read a Code 39 symbol, which begins and ends with an asterisk.
 *
 * Code 39 normally carries no check character at all, which is why a single
 * agreeing line is never enough for it: the caller requires two.
 */
function readCode39(runs, at) {
  const asterisk = CODE39.get('*');
  if (variance(runs, at, asterisk, 0.5) === Infinity) return null;

  // The asterisk is nine elements and thirteen modules: three wide, six narrow.
  let width = 0;
  for (let i = 0; i < 9; i += 1) width += runs[at + i];
  const unit = width / 13;
  if (!quietBefore(runs, at, unit)) return null;

  let cursor = at + 9;
  let text = '';

  for (let guard = 0; guard < 100; guard += 1) {
    // Every character is followed by one narrow space, which is not part of
    // either character and is simply stepped over.
    cursor += 1;
    if (cursor >= runs.length) return null;

    if (variance(runs, cursor, asterisk, 0.5) < Infinity) {
      if (!text.length || !quietAfter(runs, cursor + 9, unit)) return null;
      return { format: 'code39', name: 'Code 39', text };
    }

    const match = bestPattern(runs, cursor, CODE39_PATTERNS, 0.5);
    if (match < 0) return null;
    const character = CODE39_CHARACTERS[match];
    if (character === '*') return null;
    text += character;
    cursor += 9;
  }

  return null;
}

/**
 * Read an Interleaved 2 of 5 symbol.
 *
 * Interleaved means what it says: the odd elements are one digit and the even
 * ones the next, so digits only ever come in pairs. A fourteen-digit one with
 * a valid check digit is an ITF-14, which is the code on a shipping carton, and
 * saying so is more useful than saying "Interleaved 2 of 5".
 */
function readItf(runs, at) {
  if (variance(runs, at, [1, 1, 1, 1], 0.5) === Infinity) return null;
  const unit = (runs[at] + runs[at + 1] + runs[at + 2] + runs[at + 3]) / 4;
  if (!quietBefore(runs, at, unit)) return null;

  let cursor = at + 4;
  let digits = '';

  // Digit pairs are taken for as long as they read, and the end pattern is
  // checked afterwards rather than looked for first. Its three elements - a
  // wide bar, a narrow space, a narrow bar - are also the opening of a good
  // many digit pairs, so a reader that stops at the first sight of them stops
  // in the middle of the number about half the time.
  while (cursor + 10 <= runs.length && digits.length < 40) {
    const bars = [0, 2, 4, 6, 8].map((i) => runs[cursor + i]);
    const spaces = [1, 3, 5, 7, 9].map((i) => runs[cursor + i]);
    const first = bestPattern(bars, 0, ITF_DIGITS, 0.6);
    const second = bestPattern(spaces, 0, ITF_DIGITS, 0.6);
    if (first < 0 || second < 0) break;

    digits += `${first}${second}`;
    cursor += 10;
  }

  if (digits.length < 4) return null;
  if (variance(runs, cursor, [3, 1, 1], 0.5) === Infinity) return null;
  if (!quietAfter(runs, cursor + 3, unit)) return null;

  const carton = digits.length === 14 && gs1Check(digits.slice(0, 13)) === Number(digits[13]);
  return {
    format: carton ? 'itf14' : 'itf',
    name: carton ? 'ITF-14' : 'Interleaved 2 of 5',
    text: digits,
    ean: carton ? digits : null,
  };
}

/* ------------------------------------------------------------------ one line */

/** The lengths of the alternating runs along one line. */
function runsOf(read, length) {
  const runs = [];
  const firstIsDark = read(0) === 1;
  let dark = firstIsDark;
  let from = 0;

  for (let i = 1; i <= length; i += 1) {
    const here = i < length && read(i) === 1;
    if (here === dark && i < length) continue;
    runs.push(i - from);
    from = i;
    dark = here;
  }

  return { runs, firstIsDark };
}

/**
 * Every symbology, tried at every dark run along one line.
 *
 * Each format is anchored on a bar, so only the dark runs are start positions -
 * which halves the work and, more usefully, means a decoder is never handed a
 * pattern that begins in the middle of a space.
 */
function readLine(line) {
  const { runs, firstIsDark } = line;
  const results = [];

  // Hundreds of runs across one line is texture, not a barcode - grass, gravel,
  // a page of small print - and trying every decoder at every one of them is
  // how a camera preview drops to two frames a second on a busy scene.
  if (runs.length > 400) return results;

  for (let at = firstIsDark ? 0 : 1; at + 3 < runs.length; at += 2) {
    const retail = readRetail(runs, at);
    if (retail) { results.push(retail); continue; }

    const code128 = readCode128(runs, at);
    if (code128) { results.push(code128); continue; }

    const itf = readItf(runs, at);
    if (itf) { results.push(itf); continue; }

    const code39 = readCode39(runs, at);
    if (code39) results.push(code39);
  }

  return results;
}

/** The same line read from the other end, for a symbol that is upside down. */
function reversed(line) {
  return {
    runs: [...line.runs].reverse(),
    firstIsDark: line.runs.length % 2 === 0 ? !line.firstIsDark : line.firstIsDark,
  };
}

/**
 * The two formats that may be believed from a single line.
 *
 * The bar is a check that a random pattern is unlikely to satisfy by accident,
 * and only these two clear it. Code 128 carries a modulo-103 checksum over
 * every symbol in it, and needs a valid start and a valid stop as well. ITF-14
 * is fourteen digits with a GS1 check digit computed from the other thirteen.
 *
 * A retail check digit alone is not enough, which is not obvious and was found
 * out the hard way: the check digit of an EAN or a UPC agrees with the digits
 * before it about one time in ten, so a picture of static offers a false
 * reading of one often enough to matter. Those need two lines to agree, and
 * two unrelated lines through noise do not.
 */
const SELF_CHECKING = new Set(['itf14', 'code128']);

/**
 * Find and read a linear barcode.
 *
 * Lines are taken across the picture and down it, because a barcode
 * photographed sideways is still a barcode and nothing else in this file cares
 * which way round it is. An answer counts when two lines agree on it, or when
 * one line reads a format that carries its own check.
 *
 * @param {Uint8Array} bits  one byte per pixel; 1 is dark
 * @returns {{format: string, name: string, text: string, lines: number}|null}
 */
export function readLinear(bits, width, height, lines = 24) {
  const tally = new Map();

  const consider = (line) => {
    // One line is one vote, however many places along it a decoder liked the
    // look of. Counting each hit separately let a single line of noise raise
    // its own reading to "three lines agreed", which is the whole thing the
    // count exists to prevent.
    const onThisLine = new Map();
    for (const source of [line, reversed(line)]) {
      for (const found of readLine(source)) {
        onThisLine.set(`${found.format}:${found.text}`, found);
      }
    }
    for (const [key, found] of onThisLine.entries()) {
      const seen = tally.get(key);
      if (seen) seen.lines += 1;
      else tally.set(key, { ...found, lines: 1 });
    }
  };

  // Never more lines than the picture has, or a one-pixel-tall image would be
  // scanned twenty-four times and report that twenty-four lines agreed.
  const across = Math.min(lines, height);
  for (let i = 0; i < across; i += 1) {
    const y = Math.floor(((i + 0.5) * height) / across);
    consider(runsOf((x) => bits[y * width + x], width));
  }

  const down = Math.min(lines, width);
  for (let i = 0; i < down; i += 1) {
    const x = Math.floor(((i + 0.5) * width) / down);
    consider(runsOf((y) => bits[y * width + x], height));
  }

  const believable = [...tally.values()].filter(
    (found) => found.lines >= 2 || SELF_CHECKING.has(found.format));
  if (!believable.length) return null;

  believable.sort((a, b) => b.lines - a.lines);
  return believable[0];
}
