/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function reverse(channels){
for(const samples of channels)reverseRange(samples,0,Math.floor(samples.length/2));
return channels;
}
export function reverseRange(samples,from,to){
for(let i=from;i<to;i+=1){
const j=samples.length-1-i;
const held=samples[i];samples[i]=samples[j];samples[j]=held;
}
}
export function measureRange(samples,from,to){
let highest=0;let clipped=0;
for(let i=from;i<to;i+=1){
const size=Math.abs(samples[i]);
if(size>highest)highest=size;
if(size>1)clipped+=1;
}
return{peak:highest,clipped};
}
export function peak(channels){
let highest=0;
for(const samples of channels)highest=Math.max(highest,measureRange(samples,0,samples.length).peak);
return highest;
}
export function gainRange(samples,gain,from,to){
let highest=0;let clipped=0;
for(let i=from;i<to;i+=1){
const value=samples[i]*gain;
samples[i]=value;
const size=Math.abs(value);
if(size>highest)highest=size;
if(size>1)clipped+=1;
}
return{peak:highest,clipped};
}
export function applyGain(channels,gain){
let highest=0;let clipped=0;
for(const samples of channels){
const result=gainRange(samples,gain,0,samples.length);
highest=Math.max(highest,result.peak);clipped+=result.clipped;
}
return{peak:highest,clipped};
}
export const dbToGain=(db)=>10**(db/20);
export const gainToDb=(gain)=>(gain>0?20*Math.log10(gain):-Infinity);
export function normalizeGain(currentPeak,targetDb=-1){
if(!(currentPeak>0))return 1;
return dbToGain(targetDb)/currentPeak;
}
