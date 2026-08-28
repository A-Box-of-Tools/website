/**
 * Sizes, shares and resolutions, as words a person would use.
 *
 * The ones with a word in them hand back a phrase key and the blanks to fill
 * it with rather than a finished sentence: this file is copied byte for byte
 * into fifteen languages, so the words live in the tool's body.html and
 * main.js resolves them. compress-image's files.js next door does the same,
 * and for the same reason.
 */

/** KB and MB mean 1024 and 1024*1024, which is what a file manager shows and
 *  what people mean when they say "under 5 MB". */
export function bytes(n) {
  if (!Number.isFinite(n) || n < 0) return { key: 'size.bytes', values: { amount: 0 } };
  if (n < 1024) return { key: 'size.bytes', values: { amount: Math.round(n) } };
  if (n < 1024 * 1024) {
    return { key: 'size.kb', values: { amount: (n / 1024).toFixed(n < 10240 ? 1 : 0) } };
  }
  return { key: 'size.mb', values: { amount: (n / (1024 * 1024)).toFixed(2) } };
}

/** "68% smaller", or the honest answer when a run went the wrong way. */
export function change(before, after) {
  if (!before) return null;
  const delta = Math.round(((before - after) / before) * 100);
  if (delta === 0) return { key: 'change.same' };
  if (delta > 0) return { key: 'change.smaller', values: { percent: delta } };
  return { key: 'change.larger', values: { percent: -delta } };
}

/** A share of the file, never rounded up to 100 unless it really is all of it. */
export function share(part, whole) {
  if (!whole) return '0%';
  const percent = (part / whole) * 100;
  if (percent > 0 && percent < 1) return '<1%';
  if (percent > 99 && part < whole) return '99%';
  return `${Math.round(percent)}%`;
}

/** Pixels per inch of the space the picture is drawn into. */
export function dpi(value) {
  if (!(value > 0)) return '';
  return `${Math.round(value)} DPI`;
}

/** "2480 × 3508", with a real multiplication sign. */
export function dimensions(width, height) {
  return `${width} × ${height}`;
}

/** What to call the finished file. The original extension is kept, because it
 *  is still a PDF; the name says what happened so the two cannot be confused. */
export function outName(name) {
  const stem = name.replace(/\.pdf$/i, '') || 'document';
  return `${stem}-compressed.pdf`;
}

/**
 * "1 image", "14 images", said the same way everywhere.
 *
 * Two phrases per noun rather than one with an `s` appended: English is the
 * only one of these fifteen languages where a plural is a suffix, and three of
 * them do not mark number on the noun at all.
 */
export function count(n, noun) {
  return { key: `count.${noun}.${n === 1 ? 'one' : 'many'}`, values: { n } };
}
