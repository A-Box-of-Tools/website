/**
 * Sizes and counts, as words a person would use.
 *
 * Both take `t`, the caller's `phrase`. src/ is copied byte for byte into
 * every language, so a word written here is English at fourteen addresses.
 */

/** KB and MB mean 1024 and 1024*1024, which is what a file manager shows and
 *  what people mean when they say "under 5 MB". */
export function bytes(n, t) {
  if (!Number.isFinite(n) || n < 0) return t('size.bytes', { n: 0 });
  if (n < 1024) return t('size.bytes', { n: Math.round(n) });
  if (n < 1024 * 1024) return t('size.kb', { n: (n / 1024).toFixed(n < 10240 ? 1 : 0) });
  return t('size.mb', { n: (n / (1024 * 1024)).toFixed(2) });
}

/**
 * "1 page", "14 pages", said the same way everywhere.
 *
 * The noun is a key rather than a word with an s put on the end. English
 * has two forms and a rule this function could hold; Arabic has six and a
 * rule it could not, and neither has anything to do with what a page is.
 * So each noun is two phrases and the caller names which noun it wants.
 */
export function count(n, noun, t) {
  return t(`count.${noun}.${n === 1 ? 'one' : 'many'}`, { n });
}

/** A file name short enough to sit in a tile, with the end kept - which is
 *  where the part that tells two scans apart usually is. */
export function shortName(text, most = 28) {
  const name = String(text ?? '');
  if (name.length <= most) return name;
  return `${name.slice(0, most - 12)}…${name.slice(-11)}`;
}
