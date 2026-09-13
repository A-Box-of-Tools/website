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

/**
 * "printing", "printing and copying", "printing, copying and changing it".
 *
 * The list is composed through a phrase rather than with a comma written
 * here, because how three things are joined is a fact about the language -
 * some put the conjunction before every item, some use a different comma -
 * and the only place that fact can live is the markup.
 *
 * @param {string[]} keys  the phrase keys of the things refused, in page order
 * @returns {{key: string, values: object}|null} null for an empty list
 */
export function refusedList(keys) {
  if (keys.length === 0) return null;
  if (keys.length === 1) return { key: keys[0], values: {} };
  if (keys.length === 2) return { key: 'list.two', values: { a: keys[0], b: keys[1] } };
  return { key: 'list.three', values: { a: keys[0], b: keys[1], c: keys[2] } };
}

/** What to call the finished file. The extension is kept, because it is still
 *  a PDF; the name says what happened so the two cannot be confused. */
export function outName(name) {
  const stem = name.replace(/\.pdf$/i, '') || 'document';
  return `${stem}-protected.pdf`;
}
