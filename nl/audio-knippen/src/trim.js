/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const MIN_SECTION=0.001;
const BUDGET_MS=12;
const handBack=()=>new Promise((resolve)=>{setTimeout(resolve,0);});
export function invertRanges(ranges,duration){
const ordered=[...ranges].sort((a,b)=>a.start-b.start);
const gaps=[];
let at=0;
for(const range of ordered){
if(range.start>at)gaps.push({start:at,end:Math.min(range.start,duration)});
at=Math.max(at,range.end);
}
if(at<duration)gaps.push({start:at,end:duration});
return gaps.filter((gap)=>gap.end-gap.start>MIN_SECTION);
}
export function totalSeconds(ranges){
return ranges.reduce((total,range)=>total+(range.end-range.start),0);
}
export function planSections(ranges,{sampleRate,totalFrames,fadeSeconds=0}){
const wanted=Math.max(0,Math.round((Number(fadeSeconds)||0)*sampleRate));
const sections=[];
for(const range of ranges){
const from=clamp(Math.round(range.start*sampleRate),0,totalFrames);
const to=clamp(Math.round(range.end*sampleRate),from,totalFrames);
const frames=to-from;
if(frames<1)continue;
const cap=Math.floor(frames/2);
sections.push({
from,
to,
frames,
fadeIn:from>0?Math.min(wanted,cap):0,
fadeOut:to<totalFrames?Math.min(wanted,cap):0,
});
}
return sections;
}
export function sectionFrames(sections){
return sections.reduce((total,section)=>total+section.frames,0);
}
export function isUntouched(sections,totalFrames){
return sections.length===1
&&sections[0].from===0
&&sections[0].to===totalFrames
&&sections[0].fadeIn===0
&&sections[0].fadeOut===0;
}
function applyFades(samples,at,{frames,fadeIn,fadeOut}){
for(let j=0;j<fadeIn;j+=1)samples[at+j]*=j/fadeIn;
for(let j=0;j<fadeOut;j+=1)samples[at+frames-1-j]*=j/fadeOut;
}
function copySection(channels,out,at,section){
for(let c=0;c<channels.length;c+=1){
out[c].set(channels[c].subarray(section.from,section.to),at);
applyFades(out[c],at,section);
}
}
export function cutChannels(channels,sections){
const frames=sectionFrames(sections);
const out=channels.map(()=>new Float32Array(frames));
let at=0;
for(const section of sections){
copySection(channels,out,at,section);
at+=section.frames;
}
return out;
}
export async function trim(source,sections,{onProgress,signal,budgetMs=BUDGET_MS}={}){
const frames=sectionFrames(sections);
if(!frames)throw new Error('There is nothing marked to keep.');
const out=source.channels.map(()=>new Float32Array(frames));
let at=0;
let done=0;
let since=performance.now();
for(const section of sections){
signal?.throwIfAborted();
copySection(source.channels,out,at,section);
at+=section.frames;
done+=1;
onProgress?.(at/frames,`Copying part ${done} of ${sections.length}…`);
if(performance.now()-since>=budgetMs){
await handBack();
since=performance.now();
}
}
signal?.throwIfAborted();
return{channels:out,frames};
}
function clamp(value,low,high){
return Math.max(low,Math.min(high,value));
}
