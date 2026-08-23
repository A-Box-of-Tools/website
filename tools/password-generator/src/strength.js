/**
 * How strong the thing that was just made is, counted rather than guessed.
 *
 * THE DIFFERENCE BETWEEN THIS AND A STRENGTH METER
 *
 * The coloured bar under a sign-up box reads the string and scores it: a
 * capital here, a digit there, is it in a list of common passwords. That is
 * the only thing it can do, because whoever typed it is the one who knows how
 * it was chosen, and a score cannot ask.
 *
 * This page is the one that chose, so it does not have to score anything. It
 * knows the set it drew from and how many independent draws it made, so it can
 * count the number of results it could have produced and report that exactly.
 * `correct horse battery staple` scores badly on every meter ever shipped and
 * is worth 44 bits; `P@ssw0rd!` scores well and is worth nothing at all. The
 * number below is about the process, which is the only thing strength has ever
 * been about.
 *
 * WHY BigInt
 *
 * 95^64 does not fit in a double, and neither does 7776^10. Counting in
 * floating point means the answer is an approximation of a number that is
 * exactly knowable, and the inclusion-exclusion below - which subtracts
 * enormous numbers from each other - is exactly where an approximation stops
 * being harmless. The counts here are exact integers and are turned into a
 * bit count once, at the end.
 */

/**
 * log2 of a positive BigInt, to full double precision.
 *
 * `Number(n)` is Infinity above about 2^1024, so the exponent is taken from
 * the bit length and only the top 53 bits - all a double can hold anyway - are
 * converted and used for the fraction.
 */
export function log2(n) {
  if (n <= 0n) throw new RangeError('log2 needs a positive count');

  const bits = n.toString(2).length;
  if (bits <= 53) return Math.log2(Number(n));

  const shift = BigInt(bits - 53);
  return (bits - 53) + Math.log2(Number(n >> shift));
}

/** `base` to the power `exponent`, both whole, as a BigInt. */
function power(base, exponent) {
  return BigInt(base) ** BigInt(exponent);
}

/**
 * How many passwords of this length the chosen settings could produce.
 *
 * `sizes` is the size of each character class that is switched on, after any
 * look-alike characters have been taken out of it.
 *
 * With `requireEach` off the answer is the obvious one: every position is an
 * independent draw from the whole alphabet, so it is N^length.
 *
 * With it on, the set is smaller - it is only those strings that contain at
 * least one character from every class - and the count is inclusion-exclusion
 * over the classes: add every string, take away those missing class A, those
 * missing class B and so on, add back those missing both A and B because they
 * were taken away twice, and so on through all 2^k subsets. With four classes
 * that is sixteen terms, which is why this loops over a bit mask rather than
 * spelling them out.
 *
 * The point of counting the smaller set rather than the larger one is that the
 * smaller one is the truth. "Must contain a digit" removes possibilities; it
 * cannot add any. Reporting N^length for a password made under that rule
 * overstates it, by about half a bit for a typical setting - small, but it is
 * an overstatement in the direction that flatters the tool, which is the
 * direction to be careful in.
 */
export function passwordSpace(sizes, length, requireEach) {
  const total = sizes.reduce((sum, size) => sum + size, 0);
  if (total === 0 || length === 0) return 0n;
  if (!requireEach) return power(total, length);
  if (length < sizes.length) return 0n;

  let count = 0n;
  for (let mask = 0; mask < (1 << sizes.length); mask += 1) {
    let dropped = 0;
    let excluded = 0;
    for (let i = 0; i < sizes.length; i += 1) {
      if (mask & (1 << i)) {
        dropped += 1;
        excluded += sizes[i];
      }
    }
    const term = power(total - excluded, length);
    count += dropped % 2 === 0 ? term : -term;
  }
  return count;
}

/**
 * How many passphrases the chosen settings could produce.
 *
 * `extras` are the independent choices made alongside the words themselves -
 * a random digit between each pair of words, a digit or a symbol on the end -
 * each given as how many values that choice had. Anything the page decides for
 * you belongs nowhere in this list, and the two obvious candidates are the
 * reason the note exists: capitalising the first letter of every word and
 * joining them with a hyphen are both fixed rules an attacker reads off this
 * page, so both multiply the count by one.
 */
export function passphraseSpace(listSize, words, extras = []) {
  if (listSize === 0 || words === 0) return 0n;
  return extras.reduce((count, choices) => count * BigInt(choices),
    power(listSize, words));
}

/** The count above, in bits - the number people actually compare. */
export function bits(space) {
  return space <= 0n ? 0 : log2(space);
}

/**
 * Where a bit count sits on a five-step scale, as an id the page has words
 * for.
 *
 * The boundaries are judgement, and they are drawn against what an attacker
 * with a graphics card can do rather than against what a sign-up form will
 * accept. 60 bits is roughly the point at which a leaked password database
 * stops being cracked in bulk and starts having to be attacked one account at
 * a time; 75 is comfortably past anything a well-funded attacker will spend on
 * a single ordinary account; 100 is past what is worth arguing about.
 */
export function rating(value) {
  if (value < 40) return 'very-weak';
  if (value < 60) return 'weak';
  if (value < 75) return 'fair';
  if (value < 100) return 'strong';
  return 'very-strong';
}

/**
 * A guess rate an offline attacker plausibly has, in guesses a second.
 *
 * 10^11 is the shape of a single rack of consumer graphics cards against a
 * fast hash - the SHA-256 or MD5 that a site should not have stored a password
 * with, and that leaked databases keep turning out to have been stored with
 * anyway. Against a password hash chosen properly, bcrypt or Argon2, the same
 * hardware manages a few thousand a second and every answer below moves up by
 * about 25 bits.
 *
 * It is deliberately the pessimistic end. A number picked to make this page's
 * output look good would be worth nothing to the person reading it.
 */
export const GUESSES_PER_SECOND = 1e11;

/** Seconds in each unit, for the buckets below. */
const HOUR = 3600;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365.25 * DAY;

/**
 * How long half of that search space takes at the rate above, as one of eight
 * ids the page has a sentence for.
 *
 * Half, not all: the average attack finds the answer halfway through, and
 * quoting the full search is the same overstatement in the same flattering
 * direction as counting the wrong set above.
 *
 * Buckets rather than a number, and that is not a shortcut. "18 billion years"
 * carries an air of measurement that the underlying guess about hardware in
 * ten years' time cannot support, and a reader is better served by a phrase
 * that is honest about being a category.
 */
export function crackTime(value) {
  // In logs: a space of 2^value takes 2^(value-1) guesses at 10^11 a second.
  const seconds = 2 ** (value - 1 - Math.log2(GUESSES_PER_SECOND));

  if (seconds < 1) return 'instant';
  if (seconds < HOUR) return 'minutes';
  if (seconds < DAY) return 'hours';
  if (seconds < MONTH) return 'days';
  if (seconds < YEAR) return 'months';
  if (seconds < 100 * YEAR) return 'years';
  if (seconds < 1e6 * YEAR) return 'centuries';
  return 'ages';
}

/**
 * The same count written the way a number that size is usually written:
 * a mantissa and a power of ten, as `{ mantissa, exponent }`.
 *
 * Derived from the bit count rather than from the digits of the integer,
 * because the integer can be four hundred digits long and nobody wants to
 * read the other three hundred and ninety-six of them.
 */
export function scientific(value) {
  const log10 = value * Math.log10(2);
  const exponent = Math.floor(log10);
  const mantissa = 10 ** (log10 - exponent);

  // 9.99 rounding to 10.0 would print "10 x 10^23", which is not the notation.
  return mantissa >= 9.95
    ? { mantissa: 1, exponent: exponent + 1 }
    : { mantissa: Math.round(mantissa * 10) / 10, exponent };
}
