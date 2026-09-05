/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import*as shared from'./shared/segments.js?v=2782288283';
export{
TIMESTAMP_FORMATS,formatClock,openSegment,parseClock,readTimestamps,
}from'./shared/segments.js?v=2782288283';
const MIN_SEGMENT=0.001;
export const segmentRanges=(segments)=>shared.segmentRanges(segments,MIN_SEGMENT);
export const totalCaptured=(segments)=>shared.totalCaptured(segments,MIN_SEGMENT);
export const writeTimestamps=(segments,options={})=>(
shared.writeTimestamps(segments,{...options,minSegment:MIN_SEGMENT}));
export function formatDuration(seconds){
if(!Number.isFinite(seconds))return'-';
const tenths=Math.round(Math.max(0,seconds)*10);
const whole=Math.floor(tenths/10);
const hours=Math.floor(whole/3600);
const minutes=Math.floor((whole%3600)/60);
const shown=`${String(whole % 60).padStart(2, '0')}.${tenths % 10}`;
return hours
?`${hours}:${String(minutes).padStart(2, '0')}:${shown}`
:`${minutes}:${shown}`;
}
