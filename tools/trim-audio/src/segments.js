/**
 * The audio trimmer's segments: shared/js/segments.js, with this tool's idea
 * of the shortest segment worth keeping, and the length format its rows show.
 */

import * as shared from './shared/segments.js';

export {
  TIMESTAMP_FORMATS, formatClock, openSegment, parseClock, readTimestamps,
} from './shared/segments.js';

/**
 * The shortest segment worth keeping. A millisecond is about forty-eight
 * samples at the rate most things record at - short enough that no mark made
 * on purpose is refused, long enough that a double-tap of `o` does not leave
 * an empty row behind.
 */
const MIN_SEGMENT = 0.001;

export const segmentRanges = (segments) => shared.segmentRanges(segments, MIN_SEGMENT);
export const totalCaptured = (segments) => shared.totalCaptured(segments, MIN_SEGMENT);
export const writeTimestamps = (segments, options = {}) => (
  shared.writeTimestamps(segments, { ...options, minSegment: MIN_SEGMENT }));

/**
 * A *length* - how long something runs for - written for a person to read.
 *
 * Rounded to tenths once and then taken apart, for the reason formatClock
 * is: decomposing first and rounding the piece writes 59.96 seconds as
 * "0:60.0", which is a minute that never learned it was a minute.
 *
 * Tenths rather than thousandths because this answers "how long is it", and
 * nobody marks a recording against the length of the whole thing. The exact
 * instants are formatClock's job.
 */
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return '-';
  const tenths = Math.round(Math.max(0, seconds) * 10);
  const whole = Math.floor(tenths / 10);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const shown = `${String(whole % 60).padStart(2, '0')}.${tenths % 10}`;
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${shown}`
    : `${minutes}:${shown}`;
}
