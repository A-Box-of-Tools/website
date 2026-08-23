/**
 * The only source of randomness in this tool.
 *
 * Every choice the page makes - each character, each word, each separator -
 * comes through `randomInt` below, and `randomInt` has exactly one input:
 * `crypto.getRandomValues`, which is the browser's cryptographically secure
 * generator, seeded and reseeded by the operating system. There is no
 * `Math.random` anywhere in this folder, and there is no way to add one
 * without this file changing.
 *
 * WHY THAT MATTERS MORE THAN IT SOUNDS
 *
 * `Math.random` is fast, uniform enough to shuffle a deck, and useless here.
 * Browsers implement it with xorshift128+, which has no secret internal state
 * worth the name: a handful of consecutive outputs are enough to recover the
 * state and compute every value it will produce next and every value it
 * produced before. A password generator built on it produces passwords that
 * look random and are enumerable by anybody who has seen one of them.
 *
 * WHY THE MODULO IS NOT SIMPLY TAKEN
 *
 * `getRandomValues` fills 32-bit words, and the obvious way to turn one into a
 * number below `bound` is `value % bound`. That is biased whenever `bound`
 * does not divide 2^32, which is almost always. With a 26-letter alphabet the
 * first 6 letters come up very slightly more often than the last 20 - the
 * effect is tiny, about one part in 165 million, and it is still a real
 * reduction in the strength of every password made this way, and it is
 * completely avoidable.
 *
 * So this rejects instead. Anything at or above the largest multiple of
 * `bound` that fits in 32 bits is thrown away and another word is drawn. The
 * result is exactly uniform, and the cost is a loop that, for every alphabet
 * this tool can build, ends on the first try more than 99.999% of the time.
 */

/** 2^32: one more than the largest value `getRandomValues` writes into a word. */
const RANGE = 0x1_0000_0000;

/**
 * A uniformly distributed integer in [0, bound).
 *
 * Throws rather than guessing for a bound outside 1..2^32, because every
 * caller here passes the length of something it has just built, and a zero
 * length means the caller has a bug that a "random" 0 would hide.
 */
export function randomInt(bound) {
  if (!Number.isInteger(bound) || bound < 1 || bound > RANGE) {
    throw new RangeError(`randomInt needs a whole bound in 1..2^32, not ${bound}`);
  }
  if (bound === 1) return 0;

  // The largest multiple of `bound` that fits: everything below this divides
  // evenly into `bound` buckets, and everything at or above it is the short
  // final bucket that would make some values likelier than others.
  const limit = RANGE - (RANGE % bound);
  const word = new Uint32Array(1);

  for (;;) {
    crypto.getRandomValues(word);
    if (word[0] < limit) return word[0] % bound;
  }
}

/** A uniformly chosen member of `list`, which may be a string or an array. */
export function pick(list) {
  return list[randomInt(list.length)];
}
