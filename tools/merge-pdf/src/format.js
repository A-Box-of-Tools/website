/** Sizes and counts, as words a person would use. */

/** KB and MB mean 1024 and 1024*1024, which is what a file manager shows and
 *  what people mean when they say "under 5 MB". */
export function bytes(n) {
  if (!Number.isFinite(n) || n < 0) return '0 bytes';
  if (n < 1024) return `${Math.round(n)} bytes`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/** "1 page", "14 pages", said the same way everywhere. */
export function count(n, singular, plural = `${singular}s`) {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** A file name short enough to sit in a tile, with the end kept - which is
 *  where the part that tells two scans apart usually is. */
export function shortName(text, most = 28) {
  const name = String(text ?? '');
  if (name.length <= most) return name;
  return `${name.slice(0, most - 12)}…${name.slice(-11)}`;
}
