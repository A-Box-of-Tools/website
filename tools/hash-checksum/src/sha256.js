/**
 * SHA-256, FIPS 180-4.
 *
 * The one people actually mean when they say "the checksum". Every distribution
 * that publishes a hash for an image publishes this one, and it is what the
 * expected value pasted into the page is, four times out of five.
 *
 * Unbroken: nothing better than a brute-force search is known against it, and
 * no collision has ever been produced for the full sixty-four rounds.
 */

import { bitLength, blocks } from './blocks.js';

/** First 32 bits of the fractional parts of the cube roots of the first 64 primes. */
const K = new Int32Array([
  0x428a2f98 | 0, 0x71374491 | 0, 0xb5c0fbcf | 0, 0xe9b5dba5 | 0,
  0x3956c25b | 0, 0x59f111f1 | 0, 0x923f82a4 | 0, 0xab1c5ed5 | 0,
  0xd807aa98 | 0, 0x12835b01 | 0, 0x243185be | 0, 0x550c7dc3 | 0,
  0x72be5d74 | 0, 0x80deb1fe | 0, 0x9bdc06a7 | 0, 0xc19bf174 | 0,
  0xe49b69c1 | 0, 0xefbe4786 | 0, 0x0fc19dc6 | 0, 0x240ca1cc | 0,
  0x2de92c6f | 0, 0x4a7484aa | 0, 0x5cb0a9dc | 0, 0x76f988da | 0,
  0x983e5152 | 0, 0xa831c66d | 0, 0xb00327c8 | 0, 0xbf597fc7 | 0,
  0xc6e00bf3 | 0, 0xd5a79147 | 0, 0x06ca6351 | 0, 0x14292967 | 0,
  0x27b70a85 | 0, 0x2e1b2138 | 0, 0x4d2c6dfc | 0, 0x53380d13 | 0,
  0x650a7354 | 0, 0x766a0abb | 0, 0x81c2c92e | 0, 0x92722c85 | 0,
  0xa2bfe8a1 | 0, 0xa81a664b | 0, 0xc24b8b70 | 0, 0xc76c51a3 | 0,
  0xd192e819 | 0, 0xd6990624 | 0, 0xf40e3585 | 0, 0x106aa070 | 0,
  0x19a4c116 | 0, 0x1e376c08 | 0, 0x2748774c | 0, 0x34b0bcb5 | 0,
  0x391c0cb3 | 0, 0x4ed8aa4a | 0, 0x5b9cca4f | 0, 0x682e6ff3 | 0,
  0x748f82ee | 0, 0x78a5636f | 0, 0x84c87814 | 0, 0x8cc70208 | 0,
  0x90befffa | 0, 0xa4506ceb | 0, 0xbef9a3f7 | 0, 0xc67178f2 | 0,
]);

/** First 32 bits of the fractional parts of the square roots of the first 8 primes. */
const INIT = new Int32Array([
  0x6a09e667 | 0, 0xbb67ae85 | 0, 0x3c6ef372 | 0, 0xa54ff53a | 0,
  0x510e527f | 0, 0x9b05688c | 0, 0x1f83d9ab | 0, 0x5be0cd19 | 0,
]);

/**
 * A running SHA-256.
 *
 * @returns {{update: (chunk: Uint8Array) => void, digest: () => Uint8Array}}
 */
export function sha256() {
  const h = Int32Array.from(INIT);
  const w = new Int32Array(64);

  const compress = (view) => {
    for (let i = 0; i < 16; i += 1) w[i] = view.getInt32(i * 4, false);
    for (let i = 16; i < 64; i += 1) {
      const x = w[i - 15];
      const y = w[i - 2];
      const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let a = h[0];
    let b = h[1];
    let c = h[2];
    let d = h[3];
    let e = h[4];
    let f = h[5];
    let g = h[6];
    let hh = h[7];

    for (let i = 0; i < 64; i += 1) {
      const s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + s1 + ch + K[i] + w[i]) | 0;
      const s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (s0 + maj) | 0;

      hh = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }

    h[0] = (h[0] + a) | 0;
    h[1] = (h[1] + b) | 0;
    h[2] = (h[2] + c) | 0;
    h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0;
    h[5] = (h[5] + f) | 0;
    h[6] = (h[6] + g) | 0;
    h[7] = (h[7] + hh) | 0;
  };

  const state = blocks(64, compress);

  return {
    update(chunk) { state.update(chunk); },

    digest() {
      state.finish(8, (view, at, bytes) => {
        const { hi, lo } = bitLength(bytes);
        view.setUint32(at, hi, false);
        view.setUint32(at + 4, lo, false);
      });

      const out = new Uint8Array(32);
      const view = new DataView(out.buffer);
      for (let i = 0; i < 8; i += 1) view.setInt32(i * 4, h[i], false);
      return out;
    },
  };
}
