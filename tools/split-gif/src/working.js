import { logicalScreenPlan } from './shared/gif-working-budget.js';
import { said } from './shared/errors.js';
import { THUMB_MAX } from './frames.js';

export const WORKING_LIMIT = 512 * 2 ** 20;
export const PATCH_PIXEL_LIMIT = 128 * 2 ** 20;
export const ROW_RESERVE = 4096;
export const BOOKKEEPING_RESERVE = 32 * 2 ** 20;

/** Palette views can retain an entire input; aliases must count only once. */
export function retainedBuffers(gif) {
  const views = [gif.globalPalette, ...(gif.frames ?? []).flatMap(frame => [frame.palette, frame.indices])];
  const buffers = new Set(views.filter(ArrayBuffer.isView).map(view => view.buffer));
  let bytes = 0;
  for (const buffer of buffers) bytes += buffer.byteLength;
  return bytes;
}

/** A new disposal-3 slice can briefly coexist with the old saved snapshot. */
export function disposalCopies(gif) {
  return Math.min(2, (gif.frames ?? []).filter(frame => frame.disposal === 3).length);
}

function patchSize(gif) {
  return gif.frames.reduce((largest, frame) => frame.width * frame.height > largest.width * largest.height
    ? { width: frame.width, height: frame.height } : largest, { width: 0, height: 0 });
}

/** The retained preview pictures are small; their DOM rows still need a reserve. */
export function previewRgba(gif, stored = false) {
  let bytes = 0;
  for (const frame of gif.frames ?? []) {
    const width = stored ? frame.width : gif.width;
    const height = stored ? frame.height : gif.height;
    const scale = Math.min(1, THUMB_MAX / Math.max(width, height));
    bytes += Math.max(1, Math.round(width * scale)) * Math.max(1, Math.round(height * scale)) * 4;
  }
  return bytes;
}

/** Source/options scans belong to admission, never to each returning PNG. */
export function gifWorkingBase(gif, { stored = false, sheet = null, limitBytes = WORKING_LIMIT } = {}) {
  const dimensions = stored && !sheet ? patchSize(gif) : gif;
  const copies = 3 + (stored && !sheet ? 0 : disposalCopies(gif));
  const output = sheet ? logicalScreenPlan({ width: sheet.width, height: sheet.height, copies: 2 }) : null;
  if (output && !output.fits) return Object.freeze(output);
  const extraBytes = retainedBuffers(gif) + BOOKKEEPING_RESERVE
    + gif.frames.length * ROW_RESERVE + previewRgba(gif, stored) + (output?.bytes ?? 0);
  return Object.freeze({ ...logicalScreenPlan({ width: dimensions.width, height: dimensions.height,
    copies, extraBytes, limitBytes }), limitBytes });
}

/** Returning native bytes change a frozen estimate without revisiting source rows. */
export function withWorkingBytes(base, { thumbnailBytes = 0, thumbnailRgbaBytes = 0,
  archiveBytes = 0, incomingBytes = 0 } = {}) {
  if (![thumbnailBytes, thumbnailRgbaBytes, archiveBytes, incomingBytes].every(n => Number.isSafeInteger(n) && n >= 0)) {
    return { fits: false, bytes: null, screenBytes: null, reason: 'invalid' };
  }
  if (!base.fits) return base;
  const bytes = base.bytes + thumbnailBytes + thumbnailRgbaBytes + 2 * archiveBytes + 3 * incomingBytes;
  if (!Number.isSafeInteger(bytes)) return { fits: false, bytes: null, screenBytes: null, reason: 'overflow' };
  return { ...base, bytes, fits: bytes <= base.limitBytes, reason: bytes <= base.limitBytes ? null : 'limit' };
}

/** A one-off policy query preserves the same estimate for initial admission. */
export function gifWorkingPlan(gif, options = {}) {
  return withWorkingBytes(gifWorkingBase(gif, options), options);
}

/** The header is a lower bound; decoded patches and disposal add their own cost. */
export function headerWorkingPlan(bytes) {
  if (bytes.byteLength < 13) return null;
  const signature = String.fromCharCode(...bytes.subarray(0, 6));
  if (signature !== 'GIF87a' && signature !== 'GIF89a') return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint16(6, true), height = view.getUint16(8, true);
  if (!width || !height) return null;
  return logicalScreenPlan({ width, height, copies: 3,
    extraBytes: bytes.byteLength + BOOKKEEPING_RESERVE, limitBytes: WORKING_LIMIT });
}

export function requireWorking(plan) {
  if (plan && !plan.fits) throw new Error(plan.reason === 'limit' ? 'gif.workinglimit' : 'gif.workinginvalid');
  return plan;
}

/** The shared archive is ordinary ZIP; its entry count is a sixteen-bit field. */
export function requireZipEntries(frames, timing) {
  const count = frames + (timing ? 1 : 0);
  if (!Number.isSafeInteger(frames) || frames < 1 || count > 65535) {
    throw said('zip.entries', { n: count, limit: 65535 });
  }
  return count;
}
