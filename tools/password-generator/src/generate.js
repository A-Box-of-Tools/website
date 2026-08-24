/**
 * Turning the settings on the page into a password or a passphrase.
 *
 * Every draw goes through `randomInt` in random.js, and every count the page
 * reports about what it made comes from the two `...Space` functions in
 * strength.js, fed by `classSizes` and `phraseChoices` below. That is on
 * purpose: the arithmetic that claims a strength and the code that produces
 * the string read the same numbers out of the same place, so the claim cannot
 * drift away from what was actually done.
 */

import { pick, randomInt } from './random.js';
import { wordlist } from './wordlist.js';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';

/**
 * The two symbol sets, and what is missing from both.
 *
 * `full` leaves out the space, the two quotes, the backtick and the backslash.
 * None of them is weak - they are as random as any other character - and all
 * five are the ones that turn a working password into a support ticket: a
 * space that a login form trims, a quote that ends a string in whatever the
 * password is pasted into, a backslash that a config file reads as an escape.
 * Twenty-eight symbols instead of thirty-three costs about a quarter of a bit
 * per character, and buys a password that survives being typed into things.
 *
 * `safe` is the set that virtually every site with a symbol rule accepts. It
 * is there for the forms that demand a symbol and then reject most of them,
 * which is a real and infuriating category.
 */
export const SYMBOL_SETS = {
  full: '!#$%&()*+,-./:;<=>?@[]^_{|}~',
  safe: '!@#$%^&*',
};

/**
 * The characters dropped when look-alikes are turned off.
 *
 * Capital i, lower-case L, one and the pipe are one shape in most fonts, and
 * capital O and zero are another. This is for a password that has to be read
 * off a screen and typed somewhere else, or dictated down a phone, and it is
 * not free: it takes about half a bit off each character, so the page adds
 * length rather than pretending it costs nothing.
 */
export const LOOKALIKES = 'Il1|O0';

/** Take every character of `remove` out of `chars`. */
function without(chars, remove) {
  return [...chars].filter((ch) => !remove.includes(ch)).join('');
}

/**
 * The character classes a set of options switches on, each already stripped of
 * whatever it is not allowed to contain.
 *
 * Returned as a list of classes rather than one alphabet because both things
 * that follow need the split: "at least one of each" has to know which
 * characters belong to which class, and the exact count of possible passwords
 * is inclusion-exclusion over the class sizes.
 */
export function alphabet(options) {
  const symbols = SYMBOL_SETS[options.symbolSet] ?? SYMBOL_SETS.full;
  const chosen = [
    ['lower', options.lower ? LOWER : ''],
    ['upper', options.upper ? UPPER : ''],
    ['digits', options.digits ? DIGITS : ''],
    ['symbols', options.symbols ? symbols : ''],
  ];

  return chosen
    .map(([id, chars]) => ({
      id,
      chars: options.avoidLookalikes ? without(chars, LOOKALIKES) : chars,
    }))
    .filter((entry) => entry.chars.length > 0);
}

/** The size of each switched-on class, which is what strength.js counts with. */
export function classSizes(options) {
  return alphabet(options).map((entry) => entry.chars.length);
}

/**
 * How many attempts `password` will make before deciding something is wrong.
 *
 * "At least one of each class" is met by throwing away a candidate that misses
 * one and drawing again, which keeps every remaining password exactly as
 * likely as every other. The usual alternative - generate freely, then
 * overwrite a random position with a digit - is a bias: the character it
 * replaced is gone from the distribution, and an attacker who knows the tool
 * knows one position in every password is drawn from ten values instead of
 * ninety-four.
 *
 * The cost of doing it honestly is a loop, and a loop needs a way out. For the
 * shortest password this page will make with all four classes required, the
 * odds are about one in twenty, so a thousand tries is not a limit anybody
 * reaches; it is there so that a future setting that makes the condition
 * impossible fails loudly instead of hanging the tab.
 */
const MAX_ATTEMPTS = 1000;

/**
 * A password of `length` characters drawn from the classes `options` allows.
 */
export function password(options) {
  const classes = alphabet(options);
  const length = options.length;

  if (classes.length === 0) throw new Error('no character classes are switched on');
  if (length < 1) throw new Error('a password needs a length');
  if (options.requireEach && length < classes.length) {
    throw new Error(`${length} characters cannot hold one of each of ${classes.length} classes`);
  }

  const all = classes.map((entry) => entry.chars).join('');
  const members = classes.map((entry) => new Set(entry.chars));

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const chars = Array.from({ length }, () => pick(all));
    if (!options.requireEach
        || members.every((set) => chars.some((ch) => set.has(ch)))) {
      return chars.join('');
    }
  }

  throw new Error('could not meet the "one of each" rule; loosen the settings');
}

const SEPARATORS = {
  hyphen: '-',
  space: ' ',
  dot: '.',
  underscore: '_',
  none: '',
};

/** Every word capitalised the way `style` asks for. */
function cased(words, style) {
  if (style === 'upper') return words.map((word) => word.toUpperCase());
  if (style === 'title') {
    return words.map((word) => word[0].toUpperCase() + word.slice(1));
  }
  return words;
}

/**
 * The independent choices a passphrase makes besides the words, as the number
 * of values each one had.
 *
 * Capitalisation and a fixed separator are not in here and never will be. Both
 * are rules, not choices: an attacker reads them off this page and applies
 * them to every candidate for free. A digit *between* the words is a choice,
 * because which digit is drawn each time.
 */
export function phraseChoices(options) {
  const extras = [];
  if (options.separator === 'digit' && options.words > 1) {
    extras.push(...Array(options.words - 1).fill(10));
  }
  if (options.addDigit) extras.push(10);
  if (options.addSymbol) extras.push(SYMBOL_SETS.safe.length);
  return extras;
}

/**
 * A passphrase of `words` words from the chosen list.
 *
 * Words are drawn with replacement, which is what makes the count in
 * strength.js `size^words` rather than a falling factorial. Drawing without
 * replacement would be very slightly stronger and would also mean a passphrase
 * cannot repeat a word, which is a fact about the passphrase that an attacker
 * can use; with replacement is what diceware has always meant.
 */
export function passphrase(options) {
  const list = wordlist(options.list);
  const count = options.words;

  if (count < 1) throw new Error('a passphrase needs at least one word');

  const words = cased(
    Array.from({ length: count }, () => pick(list)),
    options.capitals,
  );

  const joined = options.separator === 'digit'
    ? words.reduce((text, word, index) => (
      index === 0 ? word : `${text}${randomInt(10)}${word}`))
    : words.join(SEPARATORS[options.separator] ?? '-');

  const tail = (options.addDigit ? String(randomInt(10)) : '')
    + (options.addSymbol ? pick(SYMBOL_SETS.safe) : '');

  return joined + tail;
}

/** One result of whichever kind `options.mode` asks for. */
export function generate(options) {
  return options.mode === 'passphrase' ? passphrase(options) : password(options);
}
