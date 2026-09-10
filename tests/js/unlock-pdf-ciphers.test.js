/**
 * The two ciphers, against their own published vectors.
 *
 * These are the tests that do not need a PDF at all. AES and RC4 both have
 * test vectors that have been printed in the same form for decades, and a
 * cipher that matches them is right in a way no amount of round-tripping can
 * establish - a wrong implementation round-trips perfectly with itself.
 *
 * The AES vectors are FIPS 197, appendix C: one block, all three key sizes.
 * They are the reason this file exists rather than the CBC wrapper, because
 * every mistake worth making in AES - the last round leaving MixColumns out,
 * the extra substitution in the 256-bit key schedule, the row shifts going the
 * wrong way - changes the answer to one of these three.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { Aes, cbcDecrypt, cbcEncrypt } from '../../tools/unlock-pdf/src/aes.js';
import { rc4 } from '../../tools/unlock-pdf/src/rc4.js';

const un = (hex) => new Uint8Array(Buffer.from(hex, 'hex'));
const hex = (bytes) => Buffer.from(bytes).toString('hex');
const ascii = (text) => new Uint8Array(Buffer.from(text, 'ascii'));

/** FIPS 197, appendix C: the same plaintext through all three key sizes. */
const PLAINTEXT = '00112233445566778899aabbccddeeff';

const FIPS = [
  ['000102030405060708090a0b0c0d0e0f', '69c4e0d86a7b0430d8cdb78070b4c55a'],
  ['000102030405060708090a0b0c0d0e0f1011121314151617', 'dda97ca4864cdfe06eaf70a0ec0d7191'],
  ['000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    '8ea2b7ca516745bfeafc49904b496089'],
];

for (const [key, expected] of FIPS) {
  test(`AES-${key.length * 4}: FIPS 197 appendix C`, () => {
    const aes = new Aes(un(key));

    const block = un(PLAINTEXT);
    aes.encryptBlock(block);
    assert.equal(hex(block), expected);

    aes.decryptBlock(block);
    assert.equal(hex(block), PLAINTEXT);
  });
}

test('AES refuses a key length it does not have', () => {
  assert.throws(() => new Aes(new Uint8Array(20)), RangeError);
  assert.throws(() => new Aes(new Uint8Array(0)), RangeError);
});

test('CBC agrees with the platform, in both directions', () => {
  // Node's OpenSSL with the padding turned off, which is what PDF's key
  // wrapping and the PDF 2.0 password hash both want.
  for (const bits of [128, 256]) {
    const key = randomBytes(bits / 8);
    const iv = randomBytes(16);
    const data = randomBytes(64);

    const reference = createCipheriv(`aes-${bits}-cbc`, key, iv);
    reference.setAutoPadding(false);
    const want = Buffer.concat([reference.update(data), reference.final()]);

    const aes = new Aes(new Uint8Array(key));
    const got = cbcEncrypt(aes, new Uint8Array(iv), new Uint8Array(data));
    assert.equal(hex(got), want.toString('hex'), `aes-${bits}-cbc encrypt`);

    const back = createDecipheriv(`aes-${bits}-cbc`, key, iv);
    back.setAutoPadding(false);
    assert.equal(
      hex(cbcDecrypt(aes, new Uint8Array(iv), got)),
      Buffer.concat([back.update(want), back.final()]).toString('hex'),
      `aes-${bits}-cbc decrypt`,
    );
  }
});

test('CBC chains: two identical blocks come out different', () => {
  const aes = new Aes(new Uint8Array(16).fill(7));
  const iv = new Uint8Array(16).fill(3);
  const doubled = new Uint8Array(32).fill(0x41);

  const out = cbcEncrypt(aes, iv, doubled);
  assert.notEqual(hex(out.subarray(0, 16)), hex(out.subarray(16)));
  assert.equal(hex(cbcDecrypt(aes, iv, out)), hex(doubled));
});

/* ------------------------------------------------------------------- RC4 */

test('RC4: the published vectors', () => {
  const vectors = [
    ['Key', 'Plaintext', 'bbf316e8d940af0ad3'],
    ['Wiki', 'pedia', '1021bf0420'],
    ['Secret', 'Attack at dawn', '45a01f645fc35b383552544b9bf5'],
  ];

  for (const [key, plaintext, expected] of vectors) {
    assert.equal(hex(rc4(ascii(key), ascii(plaintext))), expected);
  }
});

test('RC4 is its own inverse, which is why there is only one function', () => {
  const key = new Uint8Array(randomBytes(16));
  const data = new Uint8Array(randomBytes(300));
  assert.equal(hex(rc4(key, rc4(key, data))), hex(data));
});
