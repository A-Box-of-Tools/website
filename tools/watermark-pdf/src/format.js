/**
 * The few things this tool has to turn into words.
 *
 * Every function here hands back a phrase key and the blanks to fill in, never
 * a sentence: this file is copied byte for byte into every language, so a
 * string written here would be English at every address but one. main.js
 * resolves them through phrase(). See "The strings in the JavaScript" in the
 * repository README.
 */

/** "1 page" or "6 pages" - two keys, because English is the only one of these
 *  languages where a plural is a suffix. */
export function pages(n) {
  return { key: n === 1 ? 'count.pages.one' : 'count.pages.many', values: { n } };
}

/** What to call the finished file. The extension is kept, because it is still
 *  a PDF; the name says what happened so the two cannot be confused. */
export function outName(name) {
  const stem = name.replace(/\.pdf$/i, '') || 'document';
  return `${stem}-watermarked.pdf`;
}
