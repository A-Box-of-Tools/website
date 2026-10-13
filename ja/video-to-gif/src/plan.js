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
export function frameCount({start,end,fps}){
const span=Math.max(0,end-start);
const rate=Math.max(0.1,Math.min(MAX_FPS,fps));
return Math.max(1,Math.floor(span*rate+1e-6));
}
export function frameTimes({start,end,fps}){
const rate=Math.max(0.1,Math.min(MAX_FPS,fps));
const count=frameCount({start,end,fps});
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
const MIB=2**20;
export function planningLimit(deviceMemory){
if(!Number.isFinite(deviceMemory)||deviceMemory<=0)return 192*MIB;
return(deviceMemory<=2?96:deviceMemory<=4?192:384)*MIB;
}
export function workingMemory({frames,width,height,sourceWidth,sourceHeight,
packetBytes=0}){
if(![frames,width,height,sourceWidth,sourceHeight].every(n=>
Number.isSafeInteger(n)&&n>0)
||!Number.isSafeInteger(packetBytes)||packetBytes<0)return Infinity;
const pixels=width*height;
const bytes=frames*pixels*8+pixels*48
+sourceWidth*sourceHeight*8+packetBytes*3+32*MIB;
return Number.isSafeInteger(bytes)?bytes:Infinity;
}
export function smallerWidth({frames,width,sourceWidth,sourceHeight,
codedWidth=sourceWidth,codedHeight=sourceHeight,packetBytes=0,limit}){
if(![width,sourceWidth,sourceHeight,limit].every(n=>Number.isFinite(n)&&n>0))return null;
let low=16,high=Math.min(1920,Math.floor(width)-1),best=null;
while(low<=high){
const next=Math.floor((low+high)/2);
const bytes=workingMemory({frames,...outputSize(sourceWidth,sourceHeight,next),
sourceWidth:codedWidth,sourceHeight:codedHeight,packetBytes});
if(bytes<=limit){best=next;low=next+1;}
else high=next-1;
}
return best;
}
