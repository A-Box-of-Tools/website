/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const TIMESTAMP_FORMATS=['seconds','HHMMSSmmm'];
export function formatClock(seconds){
const total=Math.round(Math.max(0,Number(seconds)||0)*1000);
const whole=Math.floor(total/1000);
const pad=(value,size)=>String(value).padStart(size,'0');
return`${pad(Math.floor(whole / 3600), 2)}:${pad(Math.floor(whole / 60) % 60, 2)}`
+`:${pad(whole % 60, 2)}.${pad(total % 1000, 3)}`;
}
export function parseClock(text){
const trimmed=String(text??'').trim();
if(!trimmed)return null;
const parts=trimmed.split(':');
if(parts.length>3)return null;
let total=0;
for(const part of parts){
if(!/^\d*\.?\d*$/.test(part)||part===''||part==='.')return null;
total=total*60+Number(part);
}
return Number.isFinite(total)?total:null;
}
export function segmentRanges(segments,minSegment){
return segments
.filter((segment)=>segment.end!==null&&segment.end-segment.start>minSegment)
.map((segment)=>({start:segment.start,end:segment.end}));
}
export function totalCaptured(segments,minSegment){
return segmentRanges(segments,minSegment)
.reduce((total,range)=>total+(range.end-range.start),0);
}
export function openSegment(segments){
const last=segments[segments.length-1];
return last&&last.end===null?last:null;
}
export function writeTimestamps(segments,{format='seconds',name='',minSegment}={}){
const chosen=TIMESTAMP_FORMATS.includes(format)?format:'seconds';
const lines=[`${chosen},${String(name).replace(/[,\r\n]+/g, ' ').trim()}`];
for(const range of segmentRanges(segments,minSegment)){
lines.push(chosen==='seconds'
?`${range.start.toFixed(3)},${range.end.toFixed(3)}`
:`${formatClock(range.start)},${formatClock(range.end)}`);
}
return`${lines.join('\n')}\n`;
}
export function readTimestamps(text){
const lines=String(text??'').split(/\r?\n/);
let format='seconds';
let name='';
let at=0;
const head=(lines[0]??'').trim().split(',');
if(TIMESTAMP_FORMATS.includes(head[0])){
format=head[0];
name=(head[1]??'').trim();
at=1;
}
const segments=[];
let skipped=0;
for(let i=at;i<lines.length;i++){
const line=lines[i].trim();
if(!line)continue;
const fields=line.split(',');
if(fields.length<2){skipped++;continue;}
const start=parseClock(fields[0]);
const end=parseClock(fields[1]);
if(start===null||end===null||end<=start){skipped++;continue;}
segments.push({start,end});
}
if(!segments.length){
throw new Error('marks.unreadable');
}
return{format,name,segments,skipped};
}
