/**
 * Turning one frame into a file: the format, the quality, and the name.
 *
 * The formats are the browser's own encoders, which is the whole reason this
 * tool needs no engine vendored into it. PNG is the default and the honest one:
 * it stores the decoded frame exactly, so what you get is the picture the video
 * holds at that instant and not a second-generation copy of it. JPEG and WebP
 * are offered because a 4K PNG is eight megabytes and most uses of a still do
 * not need one, but they are lossy, and the page says so where you pick them
 * rather than in a footnote.
 *
 * The names are worth the twenty lines they cost. A folder of stills called
 * `frame1.png`, `frame2.png` is worthless a week later; one where every file
 * carries the time it was taken at can be lined up against the video again by
 * anybody, and sorts into the right order in every file manager, which is what
 * the padding is for.
 */

export const FORMATS = {
  'image/png': { extension: 'png', label: 'PNG', lossless: true },
  'image/jpeg': { extension: 'jpg', label: 'JPEG', lossless: false },
  'image/webp': { extension: 'webp', label: 'WebP', lossless: false },
};

/**
 * One instant, broken up.
 *
 * The whole thing is rounded to milliseconds first and the pieces taken out of
 * that, rather than each piece being rounded on its own. Round the seconds and
 * the milliseconds separately and 12.9999 comes out as "12.1000" - and the two
 * ways of writing this instant, the one under the slider and the one in the
 * file name, drift a millisecond apart from each other besides.
 */
function split(seconds) {
  const total = Math.max(0, Math.round(seconds * 1000));
  const whole = Math.floor(total / 1000);
  return {
    hours: Math.floor(whole / 3600),
    minutes: Math.floor((whole % 3600) / 60),
    secs: whole % 60,
    millis: String(total % 1000).padStart(3, '0'),
  };
}

/**
 * A timecode that is safe as a filename and sorts correctly.
 *
 * Colons are not legal in a Windows filename and are awkward everywhere else,
 * so the usual 00:12.480 becomes 00-12.480. Hours only appear when there are
 * any: nobody wants `00-00-12.480` out of a fifteen-second clip.
 */
export function timecode(seconds) {
  const { hours, minutes, secs, millis } = split(seconds);
  const pad = (value) => String(value).padStart(2, '0');
  const tail = `${pad(minutes)}-${pad(secs)}.${millis}`;
  return hours ? `${pad(hours)}-${tail}` : tail;
}

/** The same instant, written the way a person reads it. */
export function clockTime(seconds) {
  const { hours, minutes, secs, millis } = split(seconds);
  const pad = (value) => String(value).padStart(2, '0');
  return hours
    ? `${hours}:${pad(minutes)}:${pad(secs)}.${millis}`
    : `${minutes}:${pad(secs)}.${millis}`;
}

/**
 * What to call the still taken from `sourceName` at `seconds`.
 *
 * The source's own extension is dropped rather than kept, so a frame out of
 * `holiday.mp4` is `holiday-00-12.480.png` and not `holiday.mp4-...`. Anything
 * a file system would object to in the name is replaced rather than the name
 * being thrown away: people recognise their own file by it.
 */
export function stillName(sourceName, seconds, type) {
  const base = String(sourceName ?? 'video')
    .replace(/\.[^./\\]+$/, '')
    .replace(/[\\/:*?"<>|]+/g, '_')
    .trim() || 'video';
  const { extension } = FORMATS[type] ?? FORMATS['image/png'];
  return `${base}-${timecode(seconds)}.${extension}`;
}

/**
 * Encode a canvas.
 *
 * `canvas.toBlob` hands back null rather than throwing when it cannot encode,
 * which would otherwise surface three steps later as an unreadable download, so
 * that case is turned into an error here.
 *
 * @returns {Promise<Blob>}
 */
export function encodeStill(canvas, { type = 'image/png', quality = 0.92 } = {}) {
  return new Promise((resolve, reject) => {
    const done = (blob) => {
      if (blob) resolve(blob);
      else reject(new Error(`This browser would not write a ${FORMATS[type]?.label ?? type}.`));
    };
    // The quality argument is ignored for PNG, which has none to spend.
    if (type === 'image/png') canvas.toBlob(done, type);
    else canvas.toBlob(done, type, quality);
  });
}
