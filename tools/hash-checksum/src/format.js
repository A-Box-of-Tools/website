/**
 * Numbers, as a person would say them.
 *
 * Small on purpose. The only figures this page shows are how big the file is,
 * how far through it the reading has got, and how fast that is going - and the
 * last of those is here rather than inline because a rate that jumps about
 * every four megabytes is unreadable, and smoothing it is a decision rather
 * than a division.
 */

/** Bytes, at the precision a person would read them out at. */
export function fileSize(count) {
  if (count < 1024) return `${count} B`;
  if (count < 1024 * 1024) return `${(count / 1024).toFixed(count < 10240 ? 1 : 0)} KB`;
  if (count < 1024 * 1024 * 1024) return `${(count / 1048576).toFixed(count < 10485760 ? 2 : 1)} MB`;
  return `${(count / 1073741824).toFixed(2)} GB`;
}

export const exact = (count) => `${count.toLocaleString()} bytes`;

export const percent = (fraction) => `${Math.min(100, Math.round(fraction * 100))}%`;

/**
 * A reading rate, smoothed.
 *
 * The instantaneous figure swings by a factor of five between one chunk and the
 * next - the first few come out of the operating system cache and the rest come
 * off the disk - and a number that flickers is one nobody can read. This is an
 * exponential average with a short memory: quick enough to notice that a file
 * is being read off a network drive, slow enough to sit still.
 */
export function smooth(previous, sample) {
  if (!Number.isFinite(sample) || sample <= 0) return previous;
  if (previous === null) return sample;
  return previous * 0.7 + sample * 0.3;
}

/** Megabytes a second, or null while there is not yet anything to divide. */
export function rate(bytes, seconds) {
  if (seconds <= 0) return null;
  return bytes / seconds / 1048576;
}

/** Seconds, as a person would say a wait. */
export function remaining(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  if (seconds < 90) return `${Math.max(1, Math.round(seconds))}s`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
}

/** `1 file` / `2 files`, without a second call to work out which. */
export const plural = (value, one, many) => `${value} ${value === 1 ? one : many}`;
