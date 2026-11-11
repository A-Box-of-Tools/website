/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function sampleDurations(track){
const samples=track.samples;
const out=new Float64Array(samples.length);
if(!samples.length)return out;
for(let i=0;i<samples.length-1;i++){
out[i]=Math.max(0,samples[i+1].dts-samples[i].dts);
}
const last=samples.length-1;
const previous=last>0?out[last-1]:0;
const declared=track.duration-samples[last].dts;
out[last]=declared>0&&(!previous||declared<=previous*20)
?declared
:(previous||1);
return out;
}
export function keyframeTimes(video){
const times=[];
for(const sample of video.samples){
if(sample.isKey)times.push(sample.pts/video.timescale);
}
times.sort((a,b)=>a-b);
return times;
}
export function keyframeBefore(video,seconds){
const ticks=seconds*video.timescale;
let best=null;
for(const sample of video.samples){
if(!sample.isKey||sample.pts>ticks)continue;
if(best===null||sample.pts>best)best=sample.pts;
}
return best===null?0:best/video.timescale;
}
function keyframeIndexBefore(video,ticks){
let best=-1;
let bestPts=-Infinity;
video.samples.forEach((sample,index)=>{
if(sample.isKey&&sample.pts<=ticks&&sample.pts>bestPts){
best=index;
bestPts=sample.pts;
}
});
if(best>=0)return best;
const first=video.samples.findIndex((sample)=>sample.isKey);
return first>=0?first:0;
}
function lastIndexBefore(samples,from,ticks){
let best=from;
for(let i=from;i<samples.length;i++){
if(samples[i].pts<ticks)best=i;
}
return best;
}
function indexCovering(samples,ticks){
let best=0;
for(let i=0;i<samples.length;i++){
if(samples[i].dts<=ticks)best=i;
else break;
}
return best;
}
export function planRange({
video,audio,videoDurations,audioDurations,start,end,anchor,
}){
const vts=video.timescale;
const startTicks=start*vts;
const endTicks=end*vts;
const from=keyframeIndexBefore(video,startTicks);
const to=Math.max(from,lastIndexBefore(video.samples,from,endTicks));
const base=video.samples[from].dts;
const keyframeSeconds=video.samples[from].pts/vts;
const spanTs=video.samples[to].dts+videoDurations[to]-base;
const anchorSeconds=anchor==='keyframe'?Math.min(keyframeSeconds,start):start;
const plan={
start,
end,
keyframeSeconds,
preRoll:Math.max(0,start-keyframeSeconds),
video:{
from,
to,
base,
spanTs,
editStart:Math.max(0,startTicks-base),
},
audio:null,
};
if(audio&&audio.samples.length){
const ats=audio.timescale;
const audioFrom=indexCovering(audio.samples,anchorSeconds*ats);
const audioTo=Math.max(audioFrom,
lastIndexBefore(audio.samples,audioFrom,end*ats));
const audioBase=audio.samples[audioFrom].dts;
plan.audio={
from:audioFrom,
to:audioTo,
base:audioBase,
spanTs:audio.samples[audioTo].dts+audioDurations[audioTo]-audioBase,
editStart:Math.max(0,start*ats-audioBase),
};
}
return plan;
}
export function planRanges({video,audio,ranges,anchor}){
const videoDurations=sampleDurations(video);
const audioDurations=audio&&audio.samples.length?sampleDurations(audio):null;
const plans=[];
let videoOffset=0;
let audioOffset=0;
for(const range of ranges){
const plan=planRange({
video,audio,videoDurations,audioDurations,
start:range.start,end:range.end,anchor,
});
plan.video.offset=videoOffset;
videoOffset+=plan.video.spanTs;
if(plan.audio){
plan.audio.offset=audioOffset;
audioOffset+=plan.audio.spanTs;
}
plans.push(plan);
}
return{plans,videoDurations,audioDurations};
}
const MIN_SECTION=0.02;
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
export function rangesFor({mode,start,end,duration}){
const kept=end-start>MIN_SECTION?[{start,end}]:[];
return mode==='keep'?kept:invertRanges(kept,duration);
}
export function totalSeconds(ranges){
return ranges.reduce((total,range)=>total+(range.end-range.start),0);
}
