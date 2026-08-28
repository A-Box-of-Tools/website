/** Sizes, counts and the one judgement this tool is in a position to make. */

/** KB and MB mean 1024 and 1024*1024 here, which is what a file manager shows
 *  on every platform except macOS. */
export function bytes(n, t) {
  if (n < 1024) return t('size.b', { n });
  if (n < 1024 * 1024) return t('size.kb', { n: (n / 1024).toFixed(n < 10240 ? 1 : 0) });
  return t('size.mb', { n: (n / (1024 * 1024)).toFixed(2) });
}

/** "1,204,556" - a character count is read, not compared, so it gets commas. */
export function count(n) {
  return n.toLocaleString('en-US');
}

/** "a third longer", as a number. A data URI is ASCII, so one character is one
 *  byte and the length of the string is the size of the thing. */
export function overhead(fileBytes, uriLength, t) {
  if (!fileBytes) return '';
  const delta = Math.round(((uriLength - fileBytes) / fileBytes) * 100);
  if (delta === 0) return t('overhead.same');
  // Three whole sentences: Turkish writes the sign in front of the number,
  // and a comparison is not built the same way in every language either.
  return delta > 0
    ? t('overhead.larger', { percent: delta })
    : t('overhead.smaller', { percent: -delta });
}

/**
 * Whether inlining this one is a good idea.
 *
 * Worth being blunt about, because the tool that does a thing is the last
 * place anybody gets told not to do it, and an inlined picture has a cost that
 * does not show up anywhere: it is not a separate file any more, so it cannot
 * be cached separately, cannot be fetched in parallel, and is downloaded again
 * in full every time the stylesheet or the page it sits in changes. A 4 KB
 * icon that saves a request is a clear win. A 300 KB photograph on the
 * critical path of every page is a mistake with no error message.
 *
 * The thresholds are round numbers rather than measurements. They are where
 * the advice changes, not where the browser does anything different.
 *
 * `key` names the sentence rather than holding it: this module ships in
 * fifteen languages and only the page can read a phrase.
 *
 * @returns {{level: 'good'|'fair'|'poor', key: string}}
 */
export function verdict(uriLength) {
  if (uriLength <= 2 * 1024) return { level: 'good', key: 'verdict.tiny' };
  if (uriLength <= 10 * 1024) return { level: 'good', key: 'verdict.icon' };
  if (uriLength <= 50 * 1024) return { level: 'fair', key: 'verdict.large' };
  return { level: 'poor', key: 'verdict.toobig' };
}

/**
 * How much of the encoded size is metadata rather than picture.
 *
 * Said as a proportion because that is what makes the case: "30 KB of EXIF" is
 * a fact, and "a third of what you are about to paste is not the picture" is
 * the reason to do something about it.
 */
export function metadataNote(meta, fileBytes, t) {
  const share = fileBytes ? Math.round((meta.bytes / fileBytes) * 100) : 0;
  const values = { size: bytes(meta.bytes, t), kinds: list(meta.kinds, t), percent: share };
  // A clause spliced into a sentence cannot be translated, so the version
  // with the proportion in it is a sentence of its own.
  return t(share >= 5 ? 'meta.share' : 'meta.plain', values);
}

/** "EXIF", "EXIF and XMP", "EXIF, XMP and a colour profile". */
export function list(items, t) {
  const said = items.map((item) => t(item));
  if (said.length <= 1) return said[0] ?? '';
  // The last join is a different word from the others in most languages,
  // so the two separators are two phrases.
  return t('join.and', {
    a: said.slice(0, -1).reduce((x, y) => t('join.comma', { a: x, b: y })),
    b: said[said.length - 1],
  });
}

/** "4032 x 3024", with a real multiplication sign. */
export function dimensions(width, height) {
  return `${width} × ${height}`;
}
