/**
 * Reed-Solomon over GF(256), from the other end: not "what check codewords
 * does this data get" but "which of these codewords did I misread".
 *
 * This is the module that makes reading a real photograph possible at all. A
 * symbol on a screen samples perfectly and needs none of it; a symbol on a
 * crumpled receipt, behind a reflection, or half in shadow comes back with a
 * handful of codewords wrong, and every one of them is silently wrong - there
 * is nothing inside a codeword that says it is damaged. What says so is the
 * remainder: the encoder appended the data's remainder modulo a generator
 * polynomial, so a clean block divides that generator exactly and a damaged
 * one does not. What is left over both locates the damage and measures it.
 *
 * The field is the specification's - bytes, added with XOR, multiplied modulo
 * x^8 + x^4 + x^3 + x^2 + 1 - and the two tables below are built from it
 * exactly as the generator tool builds its own. Everything after them is the
 * half an encoder has no use for: syndromes, Berlekamp-Massey, a Chien search
 * and Forney's formula. That is why this is its own module rather than a copy
 * of `tools/qr-barcode/src/gf256.js`.
 *
 * A block carrying d check codewords can be repaired up to d/2 wrong ones.
 * Past that the arithmetic does not fail loudly - it answers, and the answer
 * is a plausible block of the wrong bytes - which is why `correct` re-checks
 * its own work before handing it back.
 */

/** The primitive polynomial from the QR specification. */
const MODULUS = 0x11d;

// Two tables, and every multiplication becomes an addition. EXP is doubled in
// length so that a sum of two logs - which reaches 508 - needs no modulo.
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

/** a * b in the field. Zero has no logarithm, so it is answered first. */
export function multiply(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

/** a to the power of `power`, which may be negative. */
function power(exponent) {
  return EXP[((exponent % 255) + 255) % 255];
}

/** 1 / a. Never called with zero. */
function inverse(a) {
  return EXP[255 - LOG[a]];
}

/**
 * Polynomials here are arrays indexed by power, so `poly[0]` is the constant
 * term. That is the reverse of the order codewords arrive in, and it is the
 * order every formula below is written in, so the reversal happens once - in
 * `syndromes` and in the one line of `correct` that writes a repair back -
 * rather than in the middle of the arithmetic.
 */
function evaluate(poly, x) {
  let value = 0;
  for (let i = poly.length - 1; i >= 0; i -= 1) value = multiply(value, x) ^ poly[i];
  return value;
}

/** a(x) * b(x), keeping at most `limit` terms. */
function multiplyPoly(a, b, limit) {
  const length = Math.min(a.length + b.length - 1, limit);
  const out = new Uint8Array(Math.max(length, 1));
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] === 0) continue;
    for (let j = 0; j < b.length && i + j < out.length; j += 1) {
      out[i + j] ^= multiply(a[i], b[j]);
    }
  }
  return out;
}

/**
 * The syndromes: the received block evaluated at each root of the generator.
 *
 * The block arrives with its first codeword as the highest power, which is
 * what Horner's loop below is reading it as. All zero means the block divides
 * the generator exactly and there is nothing to repair.
 */
function syndromes(block, count) {
  const out = new Uint8Array(count);
  for (let j = 0; j < count; j += 1) {
    let value = 0;
    for (const codeword of block) value = multiply(value, EXP[j]) ^ codeword;
    out[j] = value;
  }
  return out;
}

/**
 * Berlekamp-Massey: the shortest shift register that would produce this
 * syndrome sequence. Its connection polynomial is the error locator, whose
 * roots say where the damage is.
 *
 * This rather than the Euclidean algorithm because it is the shorter of the
 * two to read, and because the loop is the textbook one - which matters for
 * something no reader can check against a worked example by eye.
 */
function errorLocator(syndrome) {
  let lambda = new Uint8Array([1]);
  let previous = new Uint8Array([1]);
  let degree = 0;
  let shift = 1;
  let last = 1;

  for (let n = 0; n < syndrome.length; n += 1) {
    let delta = syndrome[n];
    for (let i = 1; i <= degree && i < lambda.length; i += 1) {
      delta ^= multiply(lambda[i], syndrome[n - i]);
    }

    if (delta === 0) {
      shift += 1;
      continue;
    }

    const scale = multiply(delta, inverse(last));
    const updated = new Uint8Array(Math.max(lambda.length, previous.length + shift));
    updated.set(lambda);
    for (let i = 0; i < previous.length; i += 1) {
      updated[i + shift] ^= multiply(scale, previous[i]);
    }

    if (2 * degree <= n) {
      previous = lambda;
      last = delta;
      degree = n + 1 - degree;
      shift = 1;
    } else {
      shift += 1;
    }
    lambda = updated;
  }

  // A trailing zero is not part of the polynomial, and leaving it on would
  // report the degree - and so the number of errors - as one too many.
  let end = lambda.length;
  while (end > 1 && lambda[end - 1] === 0) end -= 1;
  return lambda.subarray(0, end);
}

/**
 * A Chien search: which powers of a are roots of the locator.
 *
 * A root at a^-p says the codeword at power p is the wrong one. Two things
 * mean the answer is not a repair at all but arithmetic on damage the checks
 * cannot carry: a root pointing outside the block, and fewer roots than the
 * locator has degree. Both are reported rather than used.
 */
function errorPositions(lambda, length) {
  const positions = [];
  for (let p = 0; p < 255; p += 1) {
    if (evaluate(lambda, power(-p)) !== 0) continue;
    if (p >= length) return null;
    positions.push(p);
  }
  return positions.length === lambda.length - 1 ? positions : null;
}

/**
 * Repair one block in place.
 *
 * @param {Uint8Array} block  data codewords followed by their check codewords
 * @param {number} ecCount    how many of those are check codewords
 * @returns {number} how many codewords were wrong, or -1 if it could not be done
 */
export function correct(block, ecCount) {
  const syndrome = syndromes(block, ecCount);
  if (syndrome.every((value) => value === 0)) return 0;

  const lambda = errorLocator(syndrome);
  const positions = errorPositions(lambda, block.length);
  if (!positions || positions.length === 0) return -1;

  // Forney's formula. Omega is the syndrome polynomial times the locator, cut
  // to the number of check codewords; the derivative of a polynomial over a
  // field of characteristic two keeps only the odd-powered terms.
  const omega = multiplyPoly(syndrome, lambda, ecCount);
  const derivative = new Uint8Array(Math.max(lambda.length - 1, 1));
  for (let i = 1; i < lambda.length; i += 2) derivative[i - 1] = lambda[i];

  for (const p of positions) {
    const bottom = evaluate(derivative, power(-p));
    if (bottom === 0) return -1;
    const top = evaluate(omega, power(-p));
    block[block.length - 1 - p] ^= multiply(power(p), multiply(top, inverse(bottom)));
  }

  // Damage past what the checks can carry produces a plausible-looking block
  // of the wrong bytes rather than a failure, and a QR reader that hands back
  // the wrong string confidently is worse than one that says it could not
  // read the code. A repaired block divides the generator exactly; one that
  // does not is damage being reported as data.
  if (!syndromes(block, ecCount).every((value) => value === 0)) return -1;
  return positions.length;
}
