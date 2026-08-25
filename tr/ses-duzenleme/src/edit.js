/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{reverse,applyGain,peak,dbToGain,normalizeGain}from'./effects.js';
import{resample,resampledLength}from'./speed.js';
import{stretch,stretchedLength}from'./stretch.js';
export async function render(source,settings,{onProgress,signal}={}){
const report=(done,label)=>onProgress?.(Math.min(1,Math.max(0,done)),label);
let channels=source.channels.map((samples)=>Float32Array.from(samples));
signal?.throwIfAborted();
if(settings.reverse){
report(0.02,'Reversing…');
reverse(channels);
}
if(settings.speed!==1){
const label=settings.keepPitch?'Stretching, keeping the pitch…':'Resampling…';
report(0.05,label);
const onStep=(done)=>report(0.05+done*0.88,label);
channels=settings.keepPitch
?await stretch(channels,settings.speed,source.sampleRate,{onProgress:onStep,signal})
:await resample(channels,settings.speed,{onProgress:onStep,signal});
}
signal?.throwIfAborted();
report(0.95,'Setting the level…');
const before=peak(channels);
const gain=settings.volume.mode==='normalize'
?normalizeGain(before,settings.volume.db)
:dbToGain(settings.volume.db);
const after=gain===1?{peak:before,clipped:countOver(channels)}:applyGain(channels,gain);
report(1,'Writing the file…');
return{channels,peak:after.peak,clipped:after.clipped,gain};
}
function countOver(channels){
let over=0;
for(const samples of channels){
for(let i=0;i<samples.length;i+=1)if(Math.abs(samples[i])>1)over+=1;
}
return over;
}
export function lengthAfter(frames,speed,keepPitch){
if(speed===1)return frames;
return keepPitch?stretchedLength(frames,speed):resampledLength(frames,speed);
}
