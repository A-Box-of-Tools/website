/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{playedDelay}from'./shared/gif-decode.js?v=4784420433';
export const KEYFRAME_SECONDS=2;
const BPP=0.15;
export const MIN_BITRATE=400_000;
export const MAX_BITRATE=20_000_000;
const MAX_EDGE=3840;
export function frameTimes(frames){
const times=[];
let at=0;
for(const frame of frames){
const duration=playedDelay(frame.delay);
times.push({start:at,duration});
at+=duration;
}
return{times,total:at};
}
export function nominalFps(frames){
if(!frames.length)return 10;
const counts=new Map();
for(const frame of frames){
const delay=playedDelay(frame.delay);
counts.set(delay,(counts.get(delay)??0)+1);
}
let commonest=0.1;
let best=-1;
for(const[delay,count]of counts){
if(count>best){best=count;commonest=delay;}
}
return Math.min(60,Math.max(1,Math.round(1/commonest)));
}
export function outputSize({width,height}){
let w=width;
let h=height;
const long=Math.max(w,h);
let scale=1;
if(long>MAX_EDGE)scale=MAX_EDGE/long;
w=Math.round(w*scale);
h=Math.round(h*scale);
return{
width:Math.max(2,w+(w%2)),
height:Math.max(2,h+(h%2)),
scale,
};
}
export function bitrateFor({width,height,fps}){
const asked=width*height*Math.max(1,fps)*BPP;
const chosen=Math.min(MAX_BITRATE,Math.max(MIN_BITRATE,asked));
return Math.round(chosen/1000)*1000;
}
export function hasTransparency(frames){
return frames.some((frame)=>frame.transparentIndex>=0);
}
export function parseHex(text){
const match=/^#?([0-9a-f]{6})$/i.exec(String(text??'').trim());
if(!match)return{r:255,g:255,b:255};
const n=parseInt(match[1],16);
return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};
}
