/**
 * RC4, which is what every PDF written before about 2008 is encrypted with.
 *
 * Nobody should choose this today and nothing here does: it is implemented to
 * *read* files that already exist, which is a different question from what a
 * new document should use. The stream cipher was broken as a matter of
 * academic record by 2013, it was prohibited in TLS in 2015 and gone from the
 * browsers early the year after, and the 40-bit variant that PDF 1.1 shipped
 * with was inside the export limit of its day and is exhaustible on a laptop.
 * All of that is why the tool this sits in says on its own page what a given
 * document's protection was actually worth.
 *
 * The algorithm is small enough to be checked by eye. A 256-byte permutation
 * is shuffled by the key, then walked forever, swapping as it goes, and each
 * step yields one byte to exclusive-or against the message. Because that is
 * all it is, encryption and decryption are the same operation - which is why
 * this file has one function and not two.
 */

/**
 * @param {Uint8Array} key 1 to 256 bytes; PDF uses 5 to 16
 * @param {Uint8Array} data
 * @returns {Uint8Array} a new array, the same length as `data`
 */
export function rc4(key, data) {
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i += 1) s[i] = i;

  for (let i = 0, j = 0; i < 256; i += 1) {
    j = (j + s[i] + key[i % key.length]) & 0xff;
    const swap = s[i];
    s[i] = s[j];
    s[j] = swap;
  }

  const out = new Uint8Array(data.length);
  let i = 0;
  let j = 0;
  for (let at = 0; at < data.length; at += 1) {
    i = (i + 1) & 0xff;
    j = (j + s[i]) & 0xff;
    const swap = s[i];
    s[i] = s[j];
    s[j] = swap;
    out[at] = data[at] ^ s[(s[i] + s[j]) & 0xff];
  }

  return out;
}
