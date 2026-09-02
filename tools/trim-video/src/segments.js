/**
 * The video cutter's segments: shared/js/segments.js, with this tool's idea
 * of the shortest segment worth keeping.
 */

import * as shared from './shared/segments.js';

export {
  TIMESTAMP_FORMATS, formatClock, openSegment, parseClock, readTimestamps,
} from './shared/segments.js';

/** The shortest segment worth keeping - under a frame at any sane rate. */
const MIN_SEGMENT = 0.02;

export const segmentRanges = (segments) => shared.segmentRanges(segments, MIN_SEGMENT);
export const totalCaptured = (segments) => shared.totalCaptured(segments, MIN_SEGMENT);
export const writeTimestamps = (segments, options = {}) => (
  shared.writeTimestamps(segments, { ...options, minSegment: MIN_SEGMENT }));
