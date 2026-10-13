/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{reverseRange,measureRange,gainRange,dbToGain,normalizeGain}from'./effects.js?v=9096a8ffbb';
import{workCheckpoint}from'./shared/cooperative-work.js?v=9096a8ffbb';
import{resample,resampledLength}from'./speed.js?v=9096a8ffbb';
import{stretch,stretchedLength}from'./stretch.js?v=9096a8ffbb';
export async function render(source,settings,{onProgress,signal,budgetMs}={}){
const report=(done,label)=>onProgress?.(Math.min(1,Math.max(0,done)),label);
const checkpoint=workCheckpoint({signal,budgetMs});
const BLOCK=8192;
await checkpoint(true);
report(0,'step.copying');
let channels=[];
for(const samples of source.channels){
const copy=new Float32Array(samples.length);
for(let from=0;from<samples.length;from+=BLOCK){
copy.set(samples.subarray(from,Math.min(samples.length,from+BLOCK)),from);
await checkpoint();
}
channels.push(copy);
}
if(settings.reverse){
report(0.02,'step.reversing');
for(const samples of channels){
const half=Math.floor(samples.length/2);
for(let from=0;from<half;from+=BLOCK){
reverseRange(samples,from,Math.min(half,from+BLOCK));
await checkpoint();
}
}
}
if(settings.speed!==1){
const label=settings.keepPitch?'step.stretching':'step.resampling';
report(0.05,label);
const onStep=(done)=>report(0.05+done*0.88,label);
channels=settings.keepPitch
?await stretch(channels,settings.speed,source.sampleRate,{onProgress:onStep,signal})
:await resample(channels,settings.speed,{onProgress:onStep,signal});
}
await checkpoint();
report(0.95,'step.level');
let before=0;let clipped=0;
for(const samples of channels){
for(let from=0;from<samples.length;from+=BLOCK){
const result=measureRange(samples,from,Math.min(samples.length,from+BLOCK));
before=Math.max(before,result.peak);clipped+=result.clipped;
await checkpoint();
}
}
const gain=settings.volume.mode==='normalize'
?normalizeGain(before,settings.volume.db):dbToGain(settings.volume.db);
let after=before;
report(0.97,'step.level');
if(gain!==1){
after=0;clipped=0;
for(const samples of channels){
for(let from=0;from<samples.length;from+=BLOCK){
const result=gainRange(samples,gain,from,Math.min(samples.length,from+BLOCK));
after=Math.max(after,result.peak);clipped+=result.clipped;
await checkpoint();
}
}
}
await checkpoint();
report(1,'step.writing');
await checkpoint();
return{channels,peak:after,clipped,gain};
}
export function lengthAfter(frames,speed,keepPitch){
if(speed===1)return frames;
return keepPitch?stretchedLength(frames,speed):resampledLength(frames,speed);
}
