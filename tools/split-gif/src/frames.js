/**
 * Turning a composited frame into a file: the canvas, the PNG, and the name.
 *
 * PNG and nothing else, which is a decision rather than an omission. A GIF
 * frame is at most 256 colours with one bit of transparency; PNG stores exactly
 * that, losslessly, and every one of the three lossy formats a browser can
 * write would throw away the transparency, invent colours the frame never had,
 * and make a *larger* file out of flat artwork. There is no version of "every
 * frame out as its own JPEG" that is not worse at this job.
 *
 * The encoder is the browser's own, which is why this tool vendors nothing: a
 * canvas holding the frame's pixels and `toBlob`. What the browser does not
 * have - and what the two files beside this one are - is the GIF reader that
 * gets the pixels out in the first place.
 */
import { sizeText } from './shared/format.js';
import { throwIfAborted } from './shared/errors.js';

export const formatBytes = (n, t) => sizeText(n, t, { under: 'size.b', kb: 'auto', mb: 1 });

/** Frame thumbnails on the page are drawn no larger than this, in pixels. */
export const THUMB_MAX = 168;

/**
 * The name a frame's file gets.
 *
 * Numbered from one, because the first frame of an animation is frame 1 to
 * everybody who is not a programmer, and zero-padded to the width of the last
 * number so that a file manager sorting by name puts frame 9 before frame 10.
 * A folder of `frame1.png … frame10.png` sorts wrong in every operating system
 * there is, and it is somebody else's afternoon to fix.
 */
export function frameName(sourceName, number, total) {
  const width = Math.max(2, String(total).length);
  return `${baseName(sourceName)}-${String(number).padStart(width, '0')}.png`;
}

/**
 * The source file's name with its extension dropped and anything a file system
 * would object to replaced. People recognise their own file by it, so it is
 * kept rather than thrown away for a generic one.
 */
export function baseName(sourceName) {
  return String(sourceName ?? 'animation')
    .replace(/\.[^./\\]+$/, '')
    .replace(/[\\/:*?"<>|]+/g, '_')
    .trim() || 'animation';
}

/** What the ZIP is called. */
export function zipName(sourceName) {
  return `${baseName(sourceName)}-frames.zip`;
}

/** A canvas holding these pixels, at this size. */
export function pixelsToCanvas(pixels, width, height) {
  const canvas = document.createElement('canvas');
  try {
    canvas.width = width; canvas.height = height;
    canvas.getContext('2d').putImageData(new ImageData(pixels, width, height), 0, 0);
    return canvas;
  } catch (error) { canvas.width = canvas.height = 0; throw error; }
}

/** A late native encoder callback owns no canvas or URL after cancellation. */
export function canvasPng(canvas, signal, failure = 'png.nowrite') {
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (blob, error) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', abort);
      if (error) reject(error); else resolve(blob);
    };
    const abort = () => { try { throwIfAborted(signal); } catch (error) { finish(null, error); } };
    signal?.addEventListener('abort', abort, { once: true });
    try { canvas.toBlob(blob => finish(blob, blob ? null : new Error(failure)), 'image/png'); }
    catch (error) { finish(null, error); }
  });
}

/** Native encoding is cooperative; every owned backing store still retires. */
export async function encodePng(pixels, width, height, { signal } = {}) {
  throwIfAborted(signal);
  const canvas = pixelsToCanvas(pixels, width, height);
  try { return await canvasPng(canvas, signal); }
  finally { canvas.width = canvas.height = 0; }
}

/** Keep thumbnails small, while their PNG inputs remain the original pixels. */
export async function thumbnail(pixels, width, height, { signal } = {}) {
  throwIfAborted(signal);
  const scale = Math.min(1, THUMB_MAX / Math.max(width, height));
  const small = document.createElement('canvas');
  const outWidth = Math.max(1, Math.round(width * scale));
  const outHeight = Math.max(1, Math.round(height * scale));
  let full = null;
  try {
    small.width = outWidth; small.height = outHeight;
    const context = small.getContext('2d');
    context.imageSmoothingEnabled = false;
    full = pixelsToCanvas(pixels, width, height);
    context.drawImage(full, 0, 0, outWidth, outHeight);
    full.width = full.height = 0;
    full = null;
    const blob = await canvasPng(small, signal, 'png.nopreview');
    throwIfAborted(signal);
    return { url: URL.createObjectURL(blob), width: outWidth, height: outHeight, bytes: blob.size };
  } finally {
    if (full) full.width = full.height = 0;
    small.width = small.height = 0;
  }
}

/**
 * The timing list that can go into the ZIP.
 *
 * Splitting a GIF throws away the one thing the frames do not carry: how long
 * each was held. Somebody putting the frames back together - in this site's own
 * GIF Maker, or anywhere else - needs those numbers, and reading them back off
 * a folder of PNGs is impossible. Two columns, tab separated, with a header
 * that says what the units are.
 *
 * The `#` marks and the tabs are written here rather than inside a phrase.
 * phrase() collapses whitespace, so a tab-separated header row cannot be one
 * string - each column is named on its own and this file joins them.
 *
 * @param {object[]} rows  the frames being written, in order
 * @param {(key: string, values?: object) => string} t  the caller's phrase()
 */
export function timingList(sourceName, gif, rows, t) {
  const lines = [
    `# ${t('timing.title', { name: baseName(sourceName) })}`,
    `# ${t(gif.frames.length === 1 ? 'timing.size.one' : 'timing.size.many', {
      width: gif.width, height: gif.height, frames: gif.frames.length,
    })}`,
    `# ${t('timing.delays')}`,
    '',
    ['col.file', 'col.stored', 'col.played', 'col.x', 'col.y',
      'col.width', 'col.height', 'col.disposal'].map((key) => t(key)).join('\t'),
  ];

  for (const row of rows) {
    lines.push([
      row.name,
      (row.frame.delay / 100).toFixed(2),
      row.played.toFixed(2),
      row.frame.x,
      row.frame.y,
      row.frame.width,
      row.frame.height,
      row.frame.disposal,
    ].join('\t'));
  }

  return `${lines.join('\n')}\n`;
}

/** Seconds, written short: 0.08s, 1.2s, 12s. */
export function formatSeconds(seconds, t) {
  if (seconds < 1) return t('unit.seconds', { n: seconds.toFixed(2) });
  if (seconds < 10) return t('unit.seconds', { n: seconds.toFixed(1) });
  return t('unit.seconds', { n: Math.round(seconds) });
}

/** The four disposal methods, in words. */
export function disposalLabel(disposal, t) {
  if (disposal === 2) return t('disposal.clears');
  if (disposal === 3) return t('disposal.restores');
  return t('disposal.stays');
}
