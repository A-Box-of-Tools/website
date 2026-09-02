/**
 * Sizes and durations as words, through the caller's phrase().
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/format.js and the
 * build copies it to <tool>/src/shared/format.js for the tools that ask for
 * it with `js_parts = ["format", ...]`. It imports nothing.
 *
 * Twenty-three tools carried a byte formatter of their own, and between them
 * those twenty-three were eleven different formatters: some had a tier below
 * a kilobyte and some started at "0 KB", some gave kilobytes a decimal and
 * some did not, some had a gigabyte tier, and two keys were in use for the
 * bytes tier. None of those differences is a decision anybody recorded, but
 * every one is a number a visitor can see, so this file does not pick a
 * winner. Each function takes the caller's `phrase` and a `style` naming the
 * tiers and the decimals, and every tool's output is what it was before: the
 * differences are one line in each tool instead of six, where a pass that
 * wants to unify them can read them side by side.
 *
 * KB and MB mean 1024 and 1024*1024 throughout, which is what a file manager
 * shows on every platform except macOS, and what people mean by "about 3 MB".
 */

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

const pad = (n) => String(n).padStart(2, '0');

/**
 * A size as a phrase: "512 bytes", "4.5 KB", "1.2 MB".
 *
 * @param {number} n  bytes
 * @param {(key: string, values?: object) => string} t  the caller's phrase()
 * @param {object} [style]
 * @param {string} [style.under]  the key below a kilobyte, taking {n}; leave
 *   it out and kilobytes start at zero, "0 KB" included
 * @param {number|'auto'} [style.kb=0]  decimals in kilobytes; 'auto' is one
 *   below 10 KB and none above, where a tenth stops being a difference
 * @param {number} [style.mb=1]  decimals in megabytes
 * @param {string} [style.gb]  the key from a gigabyte up, taking {n} to two
 *   decimals; leave it out and megabytes carry on
 * @returns {string}
 */
export function sizeText(n, t, { under, kb = 0, mb = 1, gb } = {}) {
  // An estimate can be NaN or negative before there is a file to measure;
  // nothing about that is worth showing beyond a zero.
  const size = Number.isFinite(n) && n > 0 ? n : 0;
  if (under && size < KB) return t(under, { n: Math.round(size) });
  if (size < MB) {
    const decimals = kb === 'auto' ? (size < 10 * KB ? 1 : 0) : kb;
    return t('size.kb', { n: (size / KB).toFixed(decimals) });
  }
  if (gb && size >= GB) return t(gb, { n: (size / GB).toFixed(2) });
  return t('size.mb', { n: (size / MB).toFixed(mb) });
}

/**
 * A duration as a phrase: "4.2s", "12s", "3m 05s" - and "2h 14m" for the
 * tools that name an hours key.
 *
 * The keys are `time.seconds` with {n}, `time.minutes` with {minutes} and a
 * two-digit {seconds}, and the caller's hours key with {hours} and a
 * two-digit {minutes}.
 *
 * @param {number} seconds
 * @param {(key: string, values?: object) => string} t  the caller's phrase()
 * @param {object} [style]
 * @param {string} [style.hours]  the key from an hour up; leave it out and
 *   minutes carry on past sixty
 * @param {number|'auto'} [style.decimals='auto']  decimals below a minute: a
 *   fixed count, or 'auto' for one under ten seconds and none from there,
 *   which is where a tenth stops being something a person can see
 * @returns {string}
 */
export function durationText(seconds, t, { hours, decimals = 'auto' } = {}) {
  const whole = Math.max(0, Math.round(seconds));
  if (hours && whole >= 3600) {
    return t(hours, {
      hours: Math.floor(whole / 3600),
      minutes: pad(Math.floor((whole % 3600) / 60)),
    });
  }
  const minutes = Math.floor(whole / 60);
  if (minutes) return t('time.minutes', { minutes, seconds: pad(whole % 60) });
  const n = decimals === 'auto'
    ? (seconds < 10 ? seconds.toFixed(1) : whole)
    : seconds.toFixed(decimals);
  return t('time.seconds', { n });
}

/**
 * m:ss.mmm, or h:mm:ss.mmm past an hour: short enough to read, exact enough
 * to type back into the field it came from. No phrase, because there are no
 * words in it.
 *
 * Rounded to milliseconds once, before it is taken apart. Flooring the
 * seconds and rounding the fraction separately writes 3.9996 as `0:03.1000`,
 * four digits in a three-digit field, which parses back as 3.1 - so a mark
 * that was only ever shown would move nine tenths of a second the moment
 * somebody edited the row beside it.
 *
 * @param {number} seconds
 * @returns {string}
 */
export function clockText(seconds) {
  const total = Math.round(Math.max(0, seconds || 0) * 1000);
  const whole = Math.floor(total / 1000);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const tail = `${pad(whole % 60)}.${String(total % 1000).padStart(3, '0')}`;
  return hours ? `${hours}:${pad(minutes)}:${tail}` : `${minutes}:${tail}`;
}
