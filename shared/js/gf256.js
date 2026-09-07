/**
 * Reed-Solomon error correction over GF(256), which is the arithmetic a QR
 * code is built on.
 *
 * A QR code is readable with a torn corner because every block of data carries
 * a set of check codewords computed here. The reader can rebuild whatever it
 * could not see from them, up to half as many codewords as there are checks.
 * That is the whole reason the format survives being printed on a coffee cup.
 *
 * The field is the one the specification names: bytes, added with XOR, and
 * multiplied modulo the polynomial x^8 + x^4 + x^3 + x^2 + 1, which is 0x11d.
 * Nothing here is particular to QR beyond that constant - the same code
 * computes the checks for a CD or a Data Matrix, with a different modulus.
 */

/** The primitive polynomial from the QR specification. */
const MODULUS = 0x11d;

// Two tables and every multiplication becomes an addition. EXP is doubled in
// length so that a sum of two logs - which can reach 508 - can be looked up
// without a modulo on every multiply.
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= MODULUS;
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255];
})();

/** a * b in GF(256). Zero is not in the log table, so it is answered first. */
export function multiply(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

/**
 * The generator polynomial for `degree` check codewords:
 *
 *     (x - a^0)(x - a^1) ... (x - a^(degree-1))
 *
 * Returned as `degree` coefficients, highest power first, with the leading 1
 * left off because it is always 1 and dividing by it is a no-op.
 */
export function generator(degree) {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i += 1) {
    const next = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j += 1) {
      next[j] ^= poly[j];
      next[j + 1] ^= multiply(poly[j], EXP[i]);
    }
    poly = next;
  }
  return poly.subarray(1);
}

// Built on demand and kept. A page that draws a code on every keystroke would
// otherwise rebuild the same polynomial dozens of times a second.
const generators = new Map();

function generatorFor(degree) {
  let poly = generators.get(degree);
  if (!poly) {
    poly = generator(degree);
    generators.set(degree, poly);
  }
  return poly;
}

/**
 * The `degree` error-correction codewords for one block of data.
 *
 * This is polynomial long division: the data, shifted up by `degree`, divided
 * by the generator above. The remainder is what a QR reader uses to work out
 * which codewords it misread, so it is appended to the data rather than
 * replacing any of it.
 *
 * @param {Uint8Array} data one block, in the order it goes into the symbol
 * @param {number} degree how many check codewords this block gets
 * @returns {Uint8Array} exactly `degree` codewords
 */
export function remainder(data, degree) {
  const poly = generatorFor(degree);
  const result = new Uint8Array(degree);

  for (const byte of data) {
    // The coefficient leaving the top of the window decides how much of the
    // generator to subtract; subtraction in this field is XOR.
    const factor = byte ^ result[0];
    result.copyWithin(0, 1);
    result[degree - 1] = 0;
    if (factor === 0) continue;
    for (let i = 0; i < degree; i += 1) result[i] ^= multiply(poly[i], factor);
  }

  return result;
}
