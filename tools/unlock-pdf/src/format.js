/**
 * The few things this tool has to turn into words.
 *
 * Every function here hands back a phrase key and the blanks to fill in, never
 * a sentence: this file is copied byte for byte into fifteen languages, so a
 * string written here would be English at fourteen of its addresses. main.js
 * resolves them through phrase(). See "The strings in the JavaScript" in the
 * repository README.
 */

/** "1 page" or "6 pages" - two keys, because English is the only one of these
 *  fifteen languages where a plural is a suffix. */
export function pages(n) {
  return { key: n === 1 ? 'count.pages.one' : 'count.pages.many', values: { n } };
}

/**
 * How the document's encryption is named on the page.
 *
 * The revision goes in the sentence beside the cipher because it is what
 * actually decides the algorithm, and because two files can both say "AES-256"
 * and be a decade and a withdrawn specification apart.
 */
export function scheme({ cipher, bits, revision }) {
  return { key: cipher === 'aes' ? 'scheme.aes' : 'scheme.rc4', values: { bits, r: revision } };
}

/**
 * What the encryption on this file is worth, which is a different question
 * from what it is called.
 *
 * The page says this out loud because it is the thing a visitor cannot see and
 * would want to know: a document they were told was secure may have been
 * protected by a 40-bit key since 1994.
 */
export function strength({ cipher, bits, revision }) {
  if (cipher === 'rc4') return bits <= 40 ? 'scheme.age.weak' : 'scheme.age.dated';
  // AES-128 is where the cipher and the key derivation part company: the
  // encryption is modern and the password is still hashed the 1994 way, which
  // is the half that decides what a guess costs.
  if (bits <= 128) return 'scheme.age.aes128';
  return revision === 5 ? 'scheme.age.old256' : 'scheme.age.current';
}

/** What to call the finished file. The extension is kept, because it is still
 *  a PDF; the name says what happened so the two cannot be confused. */
export function outName(name) {
  const stem = name.replace(/\.pdf$/i, '') || 'document';
  return `${stem}-unlocked.pdf`;
}
