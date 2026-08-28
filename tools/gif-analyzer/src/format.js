/**
 * Numbers, as a person would say them.
 *
 * One file rather than one helper per module, because the same quantity has to
 * read the same way in three places - the summary, the byte table and the
 * downloadable report - and three copies of "round it to one decimal unless it
 * is small" is how a page ends up saying 1.0 KB in one row and 1 KB in the next.
 */

/** Bytes, with the exact figure kept for the tooltip that wants it. */
export function fileSize(count) {
  if (count < 1024) return `${count} B`;
  if (count < 1024 * 1024) return `${(count / 1024).toFixed(count < 10240 ? 1 : 0)} KB`;
  return `${(count / 1048576).toFixed(count < 10485760 ? 2 : 1)} MB`;
}

export const exact = (count, t) => t('size.exactbytes', { n: count.toLocaleString() });

/**
 * Hundredths of a second, which is the only unit GIF has.
 *
 * The format stores a delay as a 16-bit count of them, so 0.01s is the finest
 * step a file can express and 655.35s is the longest. Both ends turn up: the
 * first because encoders write 0 or 1 meaning "as fast as possible", and the
 * second in files where somebody wanted a still image that technically
 * animates.
 */
export function delay(centiseconds, t) {
  if (centiseconds === 0) return t('unit.seconds', { n: '0' });
  const value = centiseconds / 100;
  return t('unit.seconds', { n: value.toFixed(value >= 10 ? 1 : 2) });
}

/** A duration in hundredths, as minutes and seconds where that reads better. */
export function clock(centiseconds, t) {
  const total = centiseconds / 100;
  if (total < 60) return t('unit.seconds', { n: total.toFixed(total < 10 ? 2 : 1) });
  const minutes = Math.floor(total / 60);
  const seconds = total - minutes * 60;
  return t('clock.minutes', { minutes, seconds: seconds.toFixed(1) });
}

/** Frames a second, from a total duration. Blank where there is nothing to divide. */
export function rate(frames, centiseconds) {
  if (frames < 2 || centiseconds <= 0) return null;
  return frames / (centiseconds / 100);
}

export const percent = (fraction) => {
  const value = fraction * 100;
  if (value === 0) return '0%';
  if (value < 0.1) return '<0.1%';
  return `${value.toFixed(value < 10 ? 1 : 0)}%`;
};

export const count = (value) => value.toLocaleString();

/** A colour table entry as the hex a person can paste somewhere. */
export function hex(colors, index) {
  const at = index * 3;
  const pair = (byte) => byte.toString(16).padStart(2, '0');
  return `#${pair(colors[at])}${pair(colors[at + 1])}${pair(colors[at + 2])}`.toUpperCase();
}

/**
 * `1 frame` / `2 frames`, as two whole sentences rather than a suffix.
 *
 * The caller names a pair of phrases and this picks between them, which is
 * the same shape findings.js uses. A language whose plural is not an `s` on
 * the end has to be able to write the two out separately, and one that has
 * no plural at all writes the same words twice and loses nothing.
 */
export const plural = (value, key, t) => t(`${key}.${value === 1 ? 'one' : 'many'}`,
  { n: count(value) });
