/**
 * tools/password-generator/src - the generator, the counting, and the lists.
 *
 * Two things here are worth more than the rest of the file.
 *
 * The first is the rejection test. `randomInt` throws away a draw that would
 * bias the result, and a test that only checks the answer is in range cannot
 * tell whether it did: the bias is one part in a hundred and sixty-five
 * million, which no amount of sampling will find. So `crypto.getRandomValues`
 * is replaced by a script for the length of one test, the first value in it is
 * the one that has to be rejected, and the assertion is that the second value
 * is the one that came back.
 *
 * The second is the counting. `passwordSpace` is inclusion-exclusion over up
 * to sixteen terms, which is exactly the shape of arithmetic that is wrong by
 * a sign and looks plausible anyway. It is checked here against brute force -
 * every string of the given length actually enumerated and counted - for
 * alphabets small enough to enumerate, which is a check that cannot agree with
 * a wrong formula.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { pick, randomInt } from '../../tools/password-generator/src/random.js';
import {
  alphabet, classSizes, LOOKALIKES, passphrase, password, phraseChoices,
  SYMBOL_SETS,
} from '../../tools/password-generator/src/generate.js';
import {
  bits, crackTime, log2, passphraseSpace, passwordSpace, rating, scientific,
} from '../../tools/password-generator/src/strength.js';
import { LONG, SHORT, wordlist } from '../../tools/password-generator/src/wordlist.js';

/* ------------------------------------------------------------ the randomness */

test('randomInt: stays inside the bound and reaches both ends of it', () => {
  const seen = new Set();
  for (let i = 0; i < 4000; i += 1) {
    const value = randomInt(7);
    assert.ok(Number.isInteger(value) && value >= 0 && value < 7);
    seen.add(value);
  }
  assert.equal(seen.size, 7);
});

test('randomInt: refuses a bound it cannot be uniform over', () => {
  assert.throws(() => randomInt(0), RangeError);
  assert.throws(() => randomInt(-3), RangeError);
  assert.throws(() => randomInt(2.5), RangeError);
  assert.throws(() => randomInt(2 ** 32 + 1), RangeError);
  // One possible answer needs no randomness and must not consume any.
  assert.equal(randomInt(1), 0);
});

test('randomInt: throws away the draw that would bias the result', () => {
  const real = globalThis.crypto.getRandomValues;
  // 2^32 leaves a remainder of 1 over 3, so 0xffffffff is the single value
  // that belongs to no complete bucket and has to be drawn again.
  const script = [0xffff_ffff, 7];

  globalThis.crypto.getRandomValues = (array) => {
    array[0] = script.shift();
    return array;
  };
  try {
    assert.equal(randomInt(3), 1);
    assert.equal(script.length, 0, 'the biased draw was used instead of rejected');
  } finally {
    globalThis.crypto.getRandomValues = real;
  }
});

test('randomInt: is flat across its bound', () => {
  // A crude chi-square: 12,000 draws over 6 buckets, expected 2,000 each. The
  // tolerance is loose enough that this will not fail once a month on a
  // correct generator, and tight enough to catch a modulo bias put back in.
  const counts = new Array(6).fill(0);
  for (let i = 0; i < 12_000; i += 1) counts[randomInt(6)] += 1;

  const chi = counts.reduce((sum, n) => sum + ((n - 2000) ** 2) / 2000, 0);
  assert.ok(chi < 25, `chi-square ${chi} over 5 degrees of freedom`);
});

test('pick: works on a string as well as an array', () => {
  for (let i = 0; i < 200; i += 1) {
    assert.ok('abc'.includes(pick('abc')));
    assert.ok([1, 2, 3].includes(pick([1, 2, 3])));
  }
});

/* --------------------------------------------------------------- the alphabet */

const ALL_ON = {
  mode: 'password',
  length: 16,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  symbolSet: 'full',
  requireEach: false,
  avoidLookalikes: false,
};

test('alphabet: switching a class off removes exactly that class', () => {
  assert.deepEqual(classSizes(ALL_ON), [26, 26, 10, 28]);
  assert.deepEqual(classSizes({ ...ALL_ON, symbols: false }), [26, 26, 10]);
  assert.deepEqual(classSizes({ ...ALL_ON, upper: false, digits: false }), [26, 28]);
  assert.deepEqual(classSizes({ ...ALL_ON, symbolSet: 'safe' }), [26, 26, 10, 8]);
  assert.deepEqual(
    classSizes({
      ...ALL_ON, lower: false, upper: false, digits: false, symbols: false,
    }),
    [],
  );
});

test('alphabet: no symbol set contains what would break a paste', () => {
  for (const set of Object.values(SYMBOL_SETS)) {
    for (const forbidden of [' ', '"', "'", '`', '\\']) {
      assert.ok(!set.includes(forbidden), `${forbidden} is in a symbol set`);
    }
    // A set with a repeat in it would make one character likelier than the
    // rest and would overstate its own size in the arithmetic.
    assert.equal(new Set(set).size, set.length);
  }
});

test('alphabet: look-alikes come out of every class at once', () => {
  const chars = alphabet({ ...ALL_ON, avoidLookalikes: true })
    .map((entry) => entry.chars).join('');
  for (const ch of LOOKALIKES) assert.ok(!chars.includes(ch), `${ch} survived`);
  assert.deepEqual(classSizes({ ...ALL_ON, avoidLookalikes: true }), [25, 24, 8, 27]);
});

/* -------------------------------------------------------------- the passwords */

test('password: is the length asked for, out of the alphabet allowed', () => {
  const allowed = new Set(alphabet(ALL_ON).flatMap((entry) => [...entry.chars]));
  for (const length of [6, 20, 128]) {
    const made = password({ ...ALL_ON, length });
    assert.equal(made.length, length);
    for (const ch of made) assert.ok(allowed.has(ch), `${ch} is outside the alphabet`);
  }
});

test('password: "one of each" is always met, and is met by rejection', () => {
  const options = { ...ALL_ON, length: 6, requireEach: true };
  for (let i = 0; i < 400; i += 1) {
    const made = password(options);
    assert.equal(made.length, 6);
    for (const { chars } of alphabet(options)) {
      assert.ok([...made].some((ch) => chars.includes(ch)),
        `${made} has nothing from ${chars.slice(0, 8)}`);
    }
  }
});

test('password: refuses what it cannot do rather than doing it badly', () => {
  assert.throws(() => password({ ...ALL_ON, length: 3, requireEach: true }), /cannot hold/);
  assert.throws(() => password({
    ...ALL_ON, lower: false, upper: false, digits: false, symbols: false,
  }), /no character classes/);
  assert.throws(() => password({ ...ALL_ON, length: 0 }), /needs a length/);
});

test('password: the look-alike setting reaches the output', () => {
  const made = Array.from({ length: 60 }, () => password({
    ...ALL_ON, length: 64, avoidLookalikes: true,
  })).join('');
  for (const ch of LOOKALIKES) assert.ok(!made.includes(ch), `${ch} was generated`);
});

/* ------------------------------------------------------------ the passphrases */

const PHRASE = {
  mode: 'passphrase',
  words: 5,
  list: 'long',
  separator: 'hyphen',
  capitals: 'lower',
  addDigit: false,
  addSymbol: false,
};

/*
 * Every membership check below splits on a space, and that is not arbitrary.
 * Four words on the long list carry a hyphen of their own - `drop-down`,
 * `felt-tip`, `t-shirt`, `yo-yo` - so splitting a hyphen-joined phrase back
 * into words is ambiguous and a test that did it would fail about once in
 * every four hundred runs. A space is the one separator no word contains.
 */

test('passphrase: is words from the chosen list, joined as asked', () => {
  const spaced = passphrase({ ...PHRASE, separator: 'space' }).split(' ');
  assert.equal(spaced.length, 5);
  for (const word of spaced) assert.ok(LONG.includes(word), `${word} is not on the list`);

  const shortList = passphrase({ ...PHRASE, list: 'short', separator: 'space' }).split(' ');
  assert.equal(shortList.length, 5);
  for (const word of shortList) assert.ok(SHORT.includes(word), `${word} is not on the list`);

  const hyphenated = passphrase(PHRASE);
  assert.ok(!hyphenated.includes(' '));
  assert.ok((hyphenated.match(/-/g) ?? []).length >= 4);
  // Letters and the hyphens the four hyphenated words bring with them, and
  // nothing else: no separator was asked for and none was added.
  assert.equal(passphrase({ ...PHRASE, separator: 'none' }).match(/[^a-z-]/), null);
});

test('passphrase: capitals are applied without touching the words themselves', () => {
  const title = passphrase({ ...PHRASE, capitals: 'title', separator: 'space' }).split(' ');
  for (const word of title) {
    assert.equal(word[0], word[0].toUpperCase());
    assert.ok(LONG.includes(word.toLowerCase()));
  }
  const upper = passphrase({ ...PHRASE, capitals: 'upper' });
  assert.equal(upper, upper.toUpperCase());
});

test('passphrase: a digit separator puts a digit at every join', () => {
  const made = passphrase({ ...PHRASE, separator: 'digit' });
  const parts = made.split(/[0-9]/);
  assert.equal(parts.length, 5);
  for (const word of parts) assert.ok(LONG.includes(word), `${word} is not on the list`);
});

test('passphrase: the tail is added in the order the page describes', () => {
  const made = passphrase({ ...PHRASE, addDigit: true, addSymbol: true });
  assert.match(made, /[0-9][!@#$%^&*]$/);
  assert.match(passphrase({ ...PHRASE, addDigit: true }), /[0-9]$/);
});

test('phraseChoices: counts only what was actually chosen', () => {
  assert.deepEqual(phraseChoices(PHRASE), []);
  assert.deepEqual(phraseChoices({ ...PHRASE, capitals: 'title' }), [],
    'capitalisation is a rule, not a choice');
  assert.deepEqual(phraseChoices({ ...PHRASE, separator: 'digit' }), [10, 10, 10, 10]);
  assert.deepEqual(phraseChoices({ ...PHRASE, addDigit: true, addSymbol: true }), [10, 8]);
});

/* --------------------------------------------------------------- the counting */

test('log2: exact on powers of two, far past what a double holds', () => {
  assert.equal(log2(1n), 0);
  assert.equal(log2(1024n), 10);
  assert.equal(log2(2n ** 4096n), 4096);
  assert.ok(Math.abs(log2(10n ** 100n) - 332.19280948873626) < 1e-9);
  assert.throws(() => log2(0n), RangeError);
});

/** Every string of `length` over `sizes` classes, counted the slow way. */
function bruteForce(sizes, length, requireEach) {
  const classOf = [];
  for (let index = 0; index < sizes.length; index += 1) {
    for (let n = 0; n < sizes[index]; n += 1) classOf.push(index);
  }

  let count = 0n;
  const total = classOf.length ** length;
  for (let n = 0; n < total; n += 1) {
    const present = new Set();
    let rest = n;
    for (let position = 0; position < length; position += 1) {
      present.add(classOf[rest % classOf.length]);
      rest = Math.floor(rest / classOf.length);
    }
    if (!requireEach || present.size === sizes.length) count += 1n;
  }
  return count;
}

test('passwordSpace: agrees with counting them one at a time', () => {
  for (const sizes of [[2, 2], [3, 1, 2], [2, 2, 2, 1], [5], [4, 3]]) {
    for (const length of [1, 2, 3, 4, 5]) {
      for (const requireEach of [false, true]) {
        assert.equal(
          passwordSpace(sizes, length, requireEach),
          bruteForce(sizes, length, requireEach),
          `sizes ${sizes} length ${length} requireEach ${requireEach}`,
        );
      }
    }
  }
});

test('passwordSpace: the ordinary case is the ordinary answer', () => {
  assert.equal(passwordSpace([26], 10, false), 26n ** 10n);
  assert.equal(passwordSpace([26, 26, 10, 28], 20, false), 90n ** 20n);
  assert.equal(passwordSpace([26, 26, 10, 28], 0, false), 0n);
  assert.equal(passwordSpace([], 20, false), 0n);
  // Too short to hold one of each, so there are none of them.
  assert.equal(passwordSpace([26, 26, 10, 28], 3, true), 0n);
});

test('passwordSpace: requiring a character of each class only ever costs', () => {
  const free = passwordSpace([26, 26, 10, 28], 12, false);
  const required = passwordSpace([26, 26, 10, 28], 12, true);
  assert.ok(required < free);
  // ...and by about half a bit at a typical length, which is the figure the
  // page's own note about this setting quotes.
  const cost = bits(free) - bits(required);
  assert.ok(cost > 0.3 && cost < 0.8, `cost was ${cost} bits`);
});

test('passphraseSpace: is the list size to the power of the words', () => {
  assert.equal(passphraseSpace(7776, 6), 7776n ** 6n);
  assert.equal(passphraseSpace(1296, 8), 1296n ** 8n);
  assert.equal(passphraseSpace(7776, 5, [10, 10, 10, 10]), 7776n ** 5n * 10000n);
  assert.equal(passphraseSpace(7776, 0), 0n);
});

test('bits: the numbers this page will actually print', () => {
  assert.ok(Math.abs(bits(passphraseSpace(7776, 6)) - 77.5) < 0.05);
  assert.ok(Math.abs(bits(passphraseSpace(7776, 4)) - 51.7) < 0.05);
  assert.ok(Math.abs(bits(passphraseSpace(1296, 6)) - 62.0) < 0.05);
  assert.ok(Math.abs(bits(passwordSpace([26, 26, 10, 28], 20, false)) - 129.84) < 0.05);
  assert.equal(bits(0n), 0);
});

test('rating and crackTime: the boundaries are where the page says they are', () => {
  assert.equal(rating(39.9), 'very-weak');
  assert.equal(rating(40), 'weak');
  assert.equal(rating(60), 'fair');
  assert.equal(rating(75), 'strong');
  assert.equal(rating(100), 'very-strong');

  // At 10^11 guesses a second, 2^36 average guesses is about eleven minutes.
  assert.equal(crackTime(20), 'instant');
  assert.equal(crackTime(37), 'instant');
  assert.equal(crackTime(45), 'minutes');
  assert.equal(crackTime(50), 'hours');
  assert.equal(crackTime(56), 'days');
  assert.equal(crackTime(60), 'months');
  assert.equal(crackTime(68), 'years');
  assert.equal(crackTime(80), 'centuries');
  assert.equal(crackTime(128), 'ages');
});

test('scientific: reads as a number a person would write', () => {
  assert.deepEqual(scientific(10), { mantissa: 1, exponent: 3 });
  const big = scientific(77.5);
  assert.equal(big.exponent, 23);
  assert.ok(big.mantissa >= 1 && big.mantissa < 10);
  // 9.99... must round up to the next power rather than print "10 x 10^n".
  const edge = scientific(Math.log2(9.99e5));
  assert.deepEqual(edge, { mantissa: 1, exponent: 6 });
});

/* --------------------------------------------------------------- the lists */

test('wordlist: the two lists are the sizes the arithmetic assumes', () => {
  assert.equal(LONG.length, 7776, '6^5 - the long list is six dice throws');
  assert.equal(SHORT.length, 1296, '6^4 - the short list is four');
  assert.equal(new Set(LONG).size, LONG.length, 'a repeat would be likelier than a word');
  assert.equal(new Set(SHORT).size, SHORT.length);
  assert.equal(wordlist('short'), SHORT);
  assert.equal(wordlist('long'), LONG);
  assert.equal(wordlist('nonsense'), LONG, 'an unknown id falls back to the long list');
});

test('wordlist: every word is typeable and unambiguous', () => {
  for (const list of [LONG, SHORT]) {
    for (const word of list) {
      assert.match(word, /^[a-z][a-z-]*[a-z]$/, `${word} is not plain lower-case`);
      assert.ok(word.length >= 3, `${word} is too short to hear correctly`);
    }
  }
  for (const word of SHORT) {
    assert.ok(word.length <= 5, `${word} is longer than the short list promises`);
  }
});

test('wordlist: no word in the short list begins another', () => {
  // This is what the short list is for: a passphrase from it can be typed with
  // autocomplete, and can be split back into words without a separator.
  const sorted = [...SHORT].sort();
  for (let i = 1; i < sorted.length; i += 1) {
    assert.ok(!sorted[i].startsWith(sorted[i - 1]),
      `${sorted[i - 1]} is the beginning of ${sorted[i]}`);
  }
});
