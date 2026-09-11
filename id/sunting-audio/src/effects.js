/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function reverse(channels){
for(const samples of channels){
for(let i=0,j=samples.length-1;i<j;i+=1,j-=1){
const held=samples[i];
samples[i]=samples[j];
samples[j]=held;
}
}
return channels;
}
export function peak(channels){
let highest=0;
for(const samples of channels){
for(let i=0;i<samples.length;i+=1){
const size=Math.abs(samples[i]);
if(size>highest)highest=size;
}
}
return highest;
}
export function applyGain(channels,gain){
let highest=0;
let over=0;
for(const samples of channels){
for(let i=0;i<samples.length;i+=1){
const value=samples[i]*gain;
samples[i]=value;
const size=Math.abs(value);
if(size>highest)highest=size;
if(size>1)over+=1;
}
}
return{peak:highest,clipped:over};
}
export const dbToGain=(db)=>10**(db/20);
export const gainToDb=(gain)=>(gain>0?20*Math.log10(gain):-Infinity);
export function normalizeGain(currentPeak,targetDb=-1){
if(!(currentPeak>0))return 1;
return dbToGain(targetDb)/currentPeak;
}
