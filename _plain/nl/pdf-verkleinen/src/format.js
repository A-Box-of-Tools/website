/** Sizes, shares and resolutions, as words a person would use. */

/** KB and MB mean 1024 and 1024*1024, which is what a file manager shows and
 *  what people mean when they say "under 5 MB". */
export function bytes(n) {
  if (!Number.isFinite(n) || n < 0) return '0 bytes';
  if (n < 1024) return `${Math.round(n)} bytes`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/** "68% smaller", or the honest answer when a run went the wrong way. */
export function change(before, after) {
  if (!before) return '';
  const delta = Math.round(((before - after) / before) * 100);
  if (delta === 0) return 'about the same size';
  return delta > 0 ? `${delta}% smaller` : `${-delta}% larger`;
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

/** "1 image", "14 images", said the same way everywhere. */
export function count(n, singular, plural = `${singular}s`) {
  return `${n} ${n === 1 ? singular : plural}`;
}
