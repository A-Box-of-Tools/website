/**
 * AES, FIPS 197, in the two key sizes a PDF uses.
 *
 * WHY THIS IS NOT crypto.subtle
 *
 * The browser has AES-CBC in native code and it is not used here, which on a
 * site whose first instinct is always the native API deserves an answer.
 *
 * It is asynchronous. `crypto.subtle.decrypt` returns a promise, and the code
 * that has to call it is `PdfDocument.getObject` - an ordinary synchronous
 * function that the reader, the filters and the writer all lean on, and whose
 * header comment says in as many words that parsing eagerly is what lets
 * `resolve` stay a plain function instead of spreading `await` through every
 * caller. Decrypting a string is not a step that can be bolted on afterwards
 * either: an object is ciphertext until its own number has been mixed into the
 * key, and its number is known in exactly one place, at the moment it is
 * parsed. So the choice is a synchronous cipher here or `await` in three other
 * files and four other tools, and this is the smaller change by a long way.
 *
 * The second reason is smaller and points the same way. WebCrypto's CBC always
 * pads and always unpads: there is no raw mode. Two of the four things PDF
 * asks for - the key-wrapping in /UE and /OE, and the inner loop of the
 * PDF 2.0 password hash - are unpadded by definition, and both would need a
 * trick to get out of it. Written here, they are what the specification says.
 *
 * The SHA family is a different matter: it is needed once, during key
 * derivation, which is already asynchronous because the caller awaits it. That
 * comes from crypto.subtle, and only MD5 - which no browser offers - is
 * hand-written, in shared/js/md5.js.
 *
 * This is the plain byte-at-a-time cipher rather than the fused table version
 * a library would ship. It is a few times slower and reads like the
 * specification, and the files it runs over are documents rather than
 * connections: a ten-megabyte PDF is a fifth of a second.
 */

/** Multiply by x in GF(2^8), which is the whole field arithmetic in one line. */
function xtime(a) {
  return ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 0xff;
}

/**
 * Logarithm and antilogarithm to the base 3, which generates the field.
 *
 * Every multiplication below is then an addition of logarithms, and the
 * multiplicative inverse the S-box is built on is a subtraction. Computed at
 * load rather than written out: unlike MD5's sine table there is nothing here
 * an engine could round differently, because it is all integer arithmetic in a
 * field of 256 elements.
 */
const EXP = new Uint8Array(256);
const LOG = new Uint8Array(256);
{
  let value = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = value;
    LOG[value] = i;
    value ^= xtime(value); // times 3, that being x + 1
  }
  EXP[255] = EXP[0];
}

function mul(a, b) {
  return a && b ? EXP[(LOG[a] + LOG[b]) % 255] : 0;
}

const SBOX = new Uint8Array(256);
const INV_SBOX = new Uint8Array(256);
for (let i = 0; i < 256; i += 1) {
  const inverse = i ? EXP[255 - LOG[i]] : 0;
  // The affine transform: the inverse exclusive-ored with four rotations of
  // itself and a constant. It is what stops the S-box being describable as
  // simple algebra, which is the property the whole cipher rests on.
  let s = inverse;
  for (let bit = 1; bit <= 4; bit += 1) {
    s ^= ((inverse << bit) | (inverse >>> (8 - bit))) & 0xff;
  }
  s ^= 0x63;
  SBOX[i] = s;
  INV_SBOX[s] = i;
}

/** The four coefficients the inverse of MixColumns needs, as lookups. */
const MUL = {};
for (const factor of [2, 3, 9, 11, 13, 14]) {
  const table = new Uint8Array(256);
  for (let i = 0; i < 256; i += 1) table[i] = mul(i, factor);
  MUL[factor] = table;
}

/** The round constants, which are 1, 2, 4, 8 ... in the field. */
const RCON = new Uint8Array(11);
RCON[1] = 1;
for (let i = 2; i < 11; i += 1) RCON[i] = xtime(RCON[i - 1]);

/**
 * One key, expanded once and used for as many blocks as the caller has.
 *
 * A PDF encrypted with AES-128 derives a fresh key for every object, so an
 * expansion is done a few thousand times on a large document; with AES-256 it
 * is done once for the file. Both are nothing, but it is why this is a class
 * rather than a function taking the key each time.
 */
export class Aes {
  /** @param {Uint8Array} key 16, 24 or 32 bytes */
  constructor(key) {
    const words = key.length / 4;
    if (!Number.isInteger(words) || ![4, 6, 8].includes(words)) {
      throw new RangeError(`AES has no ${key.length}-byte key size`);
    }

    this.rounds = words + 6;
    this.schedule = expandKey(key, words, this.rounds);
  }

  /**
   * Encipher sixteen bytes in place.
   *
   * @param {Uint8Array} state exactly one block, modified
   */
  encryptBlock(state) {
    const { schedule, rounds } = this;
    addRoundKey(state, schedule, 0);

    for (let round = 1; round < rounds; round += 1) {
      substitute(state, SBOX);
      shiftRows(state);
      mixColumns(state);
      addRoundKey(state, schedule, round);
    }

    // The last round leaves MixColumns out. Without that asymmetry encryption
    // and decryption would not be inverses at the ends.
    substitute(state, SBOX);
    shiftRows(state);
    addRoundKey(state, schedule, rounds);
  }

  /**
   * Decipher sixteen bytes in place.
   *
   * @param {Uint8Array} state exactly one block, modified
   */
  decryptBlock(state) {
    const { schedule, rounds } = this;
    addRoundKey(state, schedule, rounds);

    for (let round = rounds - 1; round > 0; round -= 1) {
      invShiftRows(state);
      substitute(state, INV_SBOX);
      addRoundKey(state, schedule, round);
      invMixColumns(state);
    }

    invShiftRows(state);
    substitute(state, INV_SBOX);
    addRoundKey(state, schedule, 0);
  }
}

/* ------------------------------------------------------------- the rounds */

/**
 * The state is sixteen bytes in the order they arrived, which the
 * specification reads as four columns of four. So byte `r + 4c` is row r of
 * column c, and every step below is written in those terms.
 */
function addRoundKey(state, schedule, round) {
  const at = round * 16;
  for (let i = 0; i < 16; i += 1) state[i] ^= schedule[at + i];
}

function substitute(state, table) {
  for (let i = 0; i < 16; i += 1) state[i] = table[state[i]];
}

/** Row r rotates left by r, which is the only step that moves bytes between
 *  columns and therefore the only reason a change spreads sideways. */
function shiftRows(state) {
  const copy = state.slice();
  for (let row = 1; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      state[row + 4 * col] = copy[row + 4 * ((col + row) % 4)];
    }
  }
}

function invShiftRows(state) {
  const copy = state.slice();
  for (let row = 1; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      state[row + 4 * col] = copy[row + 4 * ((col - row + 4) % 4)];
    }
  }
}

/** Each column multiplied by a fixed polynomial, which is what mixes a byte
 *  into the three beside it. */
function mixColumns(state) {
  const two = MUL[2];
  const three = MUL[3];
  for (let col = 0; col < 4; col += 1) {
    const at = col * 4;
    const a = state[at];
    const b = state[at + 1];
    const c = state[at + 2];
    const d = state[at + 3];
    state[at] = two[a] ^ three[b] ^ c ^ d;
    state[at + 1] = a ^ two[b] ^ three[c] ^ d;
    state[at + 2] = a ^ b ^ two[c] ^ three[d];
    state[at + 3] = three[a] ^ b ^ c ^ two[d];
  }
}

function invMixColumns(state) {
  const nine = MUL[9];
  const eleven = MUL[11];
  const thirteen = MUL[13];
  const fourteen = MUL[14];
  for (let col = 0; col < 4; col += 1) {
    const at = col * 4;
    const a = state[at];
    const b = state[at + 1];
    const c = state[at + 2];
    const d = state[at + 3];
    state[at] = fourteen[a] ^ eleven[b] ^ thirteen[c] ^ nine[d];
    state[at + 1] = nine[a] ^ fourteen[b] ^ eleven[c] ^ thirteen[d];
    state[at + 2] = thirteen[a] ^ nine[b] ^ fourteen[c] ^ eleven[d];
    state[at + 3] = eleven[a] ^ thirteen[b] ^ nine[c] ^ fourteen[d];
  }
}

/**
 * The key schedule: one sixteen-byte round key per round, plus one to start.
 *
 * Every word is the previous word exclusive-ored with the word `words` back,
 * except at the top of each group, where it is rotated, substituted and given
 * a round constant - so that two rounds never see the same key material.
 * AES-256 substitutes at the halfway point of each group as well, which is the
 * `words > 6` line and the single most-forgotten line in the algorithm.
 */
function expandKey(key, words, rounds) {
  const total = 4 * (rounds + 1);
  const schedule = new Uint8Array(total * 4);
  schedule.set(key);

  const word = new Uint8Array(4);
  for (let i = words; i < total; i += 1) {
    word.set(schedule.subarray((i - 1) * 4, i * 4));

    if (i % words === 0) {
      const first = word[0];
      word[0] = SBOX[word[1]] ^ RCON[i / words];
      word[1] = SBOX[word[2]];
      word[2] = SBOX[word[3]];
      word[3] = SBOX[first];
    } else if (words > 6 && i % words === 4) {
      for (let b = 0; b < 4; b += 1) word[b] = SBOX[word[b]];
    }

    for (let b = 0; b < 4; b += 1) {
      schedule[i * 4 + b] = schedule[(i - words) * 4 + b] ^ word[b];
    }
  }

  return schedule;
}

/* ---------------------------------------------------------------- CBC */

/**
 * Cipher block chaining, with no padding of any kind.
 *
 * Both directions take a length that is already a multiple of sixteen and
 * return exactly as many bytes. PDF pads its streams and strings with PKCS#7,
 * but it also uses raw CBC in two places - wrapping the file key in /UE and
 * /OE, and the inner loop of the PDF 2.0 password hash - so the padding is the
 * caller's business, in crypt.js, where it can be forgiving about a file whose
 * writer got it slightly wrong.
 *
 * @param {Aes} aes
 * @param {Uint8Array} iv 16 bytes
 * @param {Uint8Array} data a whole number of blocks
 * @returns {Uint8Array}
 */
export function cbcEncrypt(aes, iv, data) {
  const out = new Uint8Array(data.length - (data.length % 16));
  const block = new Uint8Array(16);
  let previous = iv;

  for (let at = 0; at + 16 <= out.length; at += 16) {
    for (let i = 0; i < 16; i += 1) block[i] = data[at + i] ^ previous[i];
    aes.encryptBlock(block);
    out.set(block, at);
    // The ciphertext just written is the next block's mask, which is what
    // makes two identical blocks of plaintext come out different.
    previous = out.subarray(at, at + 16);
  }

  return out;
}

/**
 * @param {Aes} aes
 * @param {Uint8Array} iv 16 bytes
 * @param {Uint8Array} data a whole number of blocks
 * @returns {Uint8Array}
 */
export function cbcDecrypt(aes, iv, data) {
  const out = new Uint8Array(data.length - (data.length % 16));
  const block = new Uint8Array(16);
  let previous = iv;

  for (let at = 0; at + 16 <= out.length; at += 16) {
    block.set(data.subarray(at, at + 16));
    aes.decryptBlock(block);
    for (let i = 0; i < 16; i += 1) out[at + i] = block[i] ^ previous[i];
    // Taken from the input, because the output at this offset has already
    // been overwritten with plaintext.
    previous = data.subarray(at, at + 16);
  }

  return out;
}
