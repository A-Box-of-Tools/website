/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import*as shared from'./shared/segments.js';
export{
TIMESTAMP_FORMATS,formatClock,openSegment,parseClock,readTimestamps,
}from'./shared/segments.js';
const MIN_SEGMENT=0.02;
export const segmentRanges=(segments)=>shared.segmentRanges(segments,MIN_SEGMENT);
export const totalCaptured=(segments)=>shared.totalCaptured(segments,MIN_SEGMENT);
export const writeTimestamps=(segments,options={})=>(
shared.writeTimestamps(segments,{...options,minSegment:MIN_SEGMENT}));
