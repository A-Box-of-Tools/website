/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const MIN_SPEED=1.1;
export const MAX_SPEED=1000;
export const MIN_FRAMES=2;
export function lengthForSpeed({duration,speed}){
if(!(duration>0)||!(speed>0))return 0;
return duration/speed;
}
export function speedForLength({duration,seconds}){
if(!(duration>0)||!(seconds>0))return MIN_SPEED;
return clampSpeed(duration/seconds);
}
export function clampSpeed(speed){
if(!Number.isFinite(speed))return MIN_SPEED;
return Math.min(MAX_SPEED,Math.max(MIN_SPEED,speed));
}
export function sampleInterval({speed,fps}){
return speed/fps;
}
export function frameTimes({duration,speed,fps}){
const interval=sampleInterval({speed,fps});
if(!(interval>0)||!(duration>0))return[0];
const count=Math.max(1,Math.floor(duration/interval+1e-6));
const times=new Array(count);
for(let i=0;i<count;i+=1)times[i]=i*interval;
return times;
}
export function repeatsFrames({speed,fps,sourceFps}){
if(!(sourceFps>0))return false;
return sampleInterval({speed,fps})<1/sourceFps-1e-9;
}
export function outputSize({width,height,shortEdge=0}){
if(!(width>0)||!(height>0))return{width:2,height:2};
const even=(value)=>Math.max(2,Math.round(value/2)*2);
const shorter=Math.min(width,height);
const scale=shortEdge>0?Math.min(1,shortEdge/shorter):1;
return{width:even(width*scale),height:even(height*scale)};
}
const QUALITY_BPP={low:0.08,medium:0.15,high:0.3};
const MIN_BITRATE=300_000;
const MAX_BITRATE=60_000_000;
export function chooseBitrate({width,height,fps,quality='medium'}){
const bpp=QUALITY_BPP[quality]??QUALITY_BPP.medium;
const rate=width*height*fps*bpp;
return Math.round(Math.min(MAX_BITRATE,Math.max(MIN_BITRATE,rate)));
}
export function estimateBytes({frames,fps,bitrate}){
if(!(fps>0))return 0;
return Math.round(frames/fps*bitrate/8);
}
export const REORDER_SLACK=0.5;
export function reorderSlack(samples,timescale){
if(!samples?.length||!(timescale>0))return 0;
let highest=-Infinity;
let worst=0;
for(const sample of samples){
if(highest>sample.pts)worst=Math.max(worst,highest-sample.pts);
else highest=sample.pts;
}
return Math.min(REORDER_SLACK,worst/timescale);
}
export function decodeRuns({samples,timescale,times,slack}){
const runs=[];
if(!samples?.length||!times?.length)return runs;
if(slack===undefined)slack=reorderSlack(samples,timescale);
const slackTicks=slack*timescale;
let cursor=0;
let key=0;
for(const time of times){
const ticks=time*timescale;
while(cursor<samples.length&&samples[cursor].pts<=ticks){
if(samples[cursor].isKey)key=cursor;
cursor+=1;
}
let last=cursor-1;
while(last+1<samples.length&&samples[last+1].pts<=ticks+slackTicks)last+=1;
if(last<key)last=key;
const open=runs[runs.length-1];
if(open&&key<=open.last+1){
open.last=Math.max(open.last,last);
open.times.push(time);
}else{
runs.push({first:key,last,times:[time]});
}
}
return runs;
}
export function decodeCost(runs,total){
let read=0;
for(const run of runs)read+=run.last-run.first+1;
return{read,total,fraction:total>0?read/total:0};
}
