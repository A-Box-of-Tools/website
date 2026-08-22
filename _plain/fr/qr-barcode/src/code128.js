/**
 * Code 128: the barcode that holds text.
 *
 * It is three alphabets in one symbology. Code A holds the control characters
 * and capitals, Code B the rest of printable ASCII, and Code C holds two digits
 * in the space one character takes anywhere else - which is why a fourteen-digit
 * number comes out half the width here that it would in Code 39.
 *
 * The awkward part, and the part below that is worth reading, is deciding when
 * to switch between them. Switching costs one symbol; staying in the wrong set
 * costs one symbol per digit pair. The rule this file uses is the usual one:
 * change into Code C for a run of six digits or more, or for four at either end
 * of the data, and otherwise stay where you are.
 */

/**
 * The 107 patterns, as element widths in modules, bar first.
 *
 * Every one of them is eleven modules across in three bars and three spaces -
 * except the stop pattern, which has a fourth bar - and every one has an even
 * number of dark modules. Both facts are checked in the tests rather than
 * trusted, because a single transposed row here would produce a barcode that
 * scans perfectly as the wrong character.
 */
export const PATTERNS = [
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
];

const START = { A: 103, B: 104, C: 105 };
const STOP = 106;
/** The "switch to this set" symbol, which is the same value from either of the others. */
const SWITCH = { A: 101, B: 100, C: 99 };

/** The quiet zone the specification asks for, in modules. */
export const QUIET = 10;

const isDigitCode = (code) => code >= 48 && code <= 57;

/** Can this character be written in Code A? In Code B? */
const inA = (code) => code < 96;
const inB = (code) => code >= 32 && code <= 127;

/**
 * The symbol values for a string: the start, the data, the checksum and the
 * stop, in the order they are printed.
 *
 * Kept separate from the widths below because the values are the part worth
 * testing - they are what a reader recovers, and reading them back is how the
 * tests check the switching without a scanner.
 */
export function values(text) {
  const codes = [...text].map((character) => character.codePointAt(0));
  const bad = codes.findIndex((code) => code > 127);
  if (bad !== -1) {
    throw new RangeError(
      `Code 128 holds ASCII only, and ${JSON.stringify([...text][bad])} is not. `
      + 'A QR code will hold it.');
  }

  const digits = (from) => {
    let run = 0;
    while (from + run < codes.length && isDigitCode(codes[from + run])) run += 1;
    return run;
  };

  const out = [];
  let set = startSet(codes, digits(0));
  out.push(START[set]);

  let i = 0;
  while (i < codes.length) {
    const run = digits(i);

    // Worth changing into Code C? Six digits anywhere, or four at the end -
    // and at the start the decision was already made above.
    const wantC = run >= 6 || (i + run === codes.length && run >= 4 && run % 2 === 0);

    if (set === 'C' && run >= 2) {
      out.push((codes[i] - 48) * 10 + (codes[i + 1] - 48));
      i += 2;
      continue;
    }

    if (set !== 'C' && wantC) {
      // An odd run has to lose its first digit to the current set, or Code C
      // would swallow the character after it.
      if (run % 2 === 1) {
        out.push(value(codes[i], set));
        i += 1;
      }
      out.push(SWITCH.C);
      set = 'C';
      continue;
    }

    if (set === 'C') {
      // Out of pairs. Leave for whichever set holds what comes next.
      set = inB(codes[i]) && !onlyA(codes[i]) ? 'B' : 'A';
      out.push(SWITCH[set]);
      continue;
    }

    if (!holds(codes[i], set)) {
      const next = set === 'A' ? 'B' : 'A';
      // One stray character is cheaper to shift than to switch for, as long as
      // the character after it belongs to the set we are already in.
      const after = codes[i + 1];
      if (after !== undefined && holds(after, set)) {
        out.push(98);                     // Shift: the next symbol only.
        out.push(value(codes[i], next));
        i += 1;
        continue;
      }
      out.push(SWITCH[next]);
      set = next;
      continue;
    }

    out.push(value(codes[i], set));
    i += 1;
  }

  // The check symbol: the start value, plus each data value times its
  // position, modulo 103. It is never printed as a character.
  let sum = out[0];
  for (let k = 1; k < out.length; k += 1) sum += out[k] * k;
  out.push(sum % 103);
  out.push(STOP);

  return out;
}

/** Only Code A can hold this: the control characters. */
function onlyA(code) {
  return code < 32;
}

function holds(code, set) {
  return set === 'A' ? inA(code) : inB(code);
}

function value(code, set) {
  if (set === 'A') return code < 32 ? code + 64 : code - 32;
  return code - 32;
}

/**
 * Which set to start in.
 *
 * Code C if the whole thing is an even number of digits, or if it opens with
 * four or more. Otherwise Code A only if a control character turns up before
 * any lower-case letter, because those are the two things the sets disagree
 * about; Code B for everything else, which is nearly everything.
 */
function startSet(codes, leading) {
  if (codes.length >= 2 && leading % 2 === 0
    && (leading === codes.length || leading >= 4)) return 'C';

  for (const code of codes) {
    if (onlyA(code)) return 'A';
    if (code > 95) return 'B';
  }
  return 'B';
}

/**
 * The bars and spaces for a string, one entry per module: 1 for dark.
 *
 * Quiet zones are included on both sides. A Code 128 symbol with nothing either
 * side of it is a symbol a scanner cannot find the edge of, so leaving them off
 * would be shipping a barcode that only works on a screenshot.
 */
export function modules(text) {
  const parts = [];
  for (let i = 0; i < QUIET; i += 1) parts.push(0);

  for (const symbol of values(text)) {
    let dark = 1;
    for (const width of PATTERNS[symbol]) {
      for (let i = 0; i < Number(width); i += 1) parts.push(dark);
      dark ^= 1;
    }
  }

  for (let i = 0; i < QUIET; i += 1) parts.push(0);
  return Uint8Array.from(parts);
}
