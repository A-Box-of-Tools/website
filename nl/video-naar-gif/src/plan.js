/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const CENTIS=100;
export const MIN_DELAY=2;
export const MAX_FPS=CENTIS/MIN_DELAY;
export function outputSize(sourceWidth,sourceHeight,targetWidth){
const width=Math.max(1,Math.round(targetWidth));
if(!sourceWidth||!sourceHeight)return{width,height:width};
const height=Math.max(1,Math.round(width*(sourceHeight/sourceWidth)));
return{width,height};
}
export function frameTimes({start,end,fps}){
const span=Math.max(0,end-start);
const rate=Math.max(0.1,Math.min(MAX_FPS,fps));
const count=Math.max(1,Math.floor(span*rate+1e-6));
const times=new Array(count);
for(let i=0;i<count;i+=1)times[i]=start+i/rate;
return times;
}
export function frameDelays(times,end){
if(!times.length)return[];
const base=times[0];
const edges=times.map((time)=>Math.round((time-base)*CENTIS));
edges.push(Math.round((Math.max(end,times[times.length-1])-base)*CENTIS));
const delays=[];
for(let i=0;i<times.length;i+=1){
delays.push(Math.max(MIN_DELAY,edges[i+1]-edges[i]));
}
return delays;
}
export function workingBytes({frames,width,height}){
return frames*width*height*4;
}
export function estimateBytes({frames,width,height}){
const pixels=frames*width*height;
return{low:Math.round(pixels*0.4/8),high:Math.round(pixels*2.5/8)};
}
