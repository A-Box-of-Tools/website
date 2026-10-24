/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const DECIMATE=4;
export const stretchedLength=(frames,speed)=>Math.max(1,Math.round(frames/speed));
export async function stretch(channels,speed,sampleRate,{onProgress,signal}={}){
if(!(speed>0))throw new Error('speed must be greater than zero');
const frames=channels[0].length;
const outFrames=stretchedLength(frames,speed);
const frame=even(Math.min(Math.round(sampleRate*0.046),Math.floor(frames/2)));
if(frame<64)return shortened(channels,outFrames);
const hop=frame/2;
const search=DECIMATE*Math.max(1,Math.round((sampleRate*0.006)/DECIMATE));
const window=hann(frame);
const mono=mixdown(channels);
const coarse=averageDown(mono);
const out=channels.map(()=>new Float32Array(outFrames));
const weight=new Float32Array(outFrames);
const lastStart=Math.max(0,frames-frame);
let position=0;
let ideal=0;
let outAt=0;
let sincePause=0;
while(outAt<outFrames){
for(let c=0;c<channels.length;c+=1){
const input=channels[c];
const output=out[c];
const limit=Math.min(frame,outFrames-outAt,frames-position);
for(let i=0;i<limit;i+=1)output[outAt+i]+=input[position+i]*window[i];
}
{
const limit=Math.min(frame,outFrames-outAt,frames-position);
for(let i=0;i<limit;i+=1)weight[outAt+i]+=window[i];
}
const continues=position+hop;
ideal+=hop*speed;
const target=Math.min(lastStart,Math.max(0,Math.round(ideal)));
position=target+bestOffset(mono,coarse,continues,target,search,hop,lastStart);
outAt+=hop;
sincePause+=1;
if(sincePause>=64){
signal?.throwIfAborted();
onProgress?.(Math.min(1,outAt/outFrames));
await pause();
sincePause=0;
}
}
for(const output of out){
for(let i=0;i<outFrames;i+=1){
if(weight[i]>1e-4)output[i]/=weight[i];
}
}
onProgress?.(1);
return out;
}
function bestOffset(mono,coarse,continues,target,search,overlap,lastStart){
let bestCoarse=0;
let best=-Infinity;
const shortRef=Math.round(continues/DECIMATE);
const shortLength=Math.floor(overlap/DECIMATE);
for(let offset=-search;offset<=search;offset+=DECIMATE){
const at=target+offset;
if(at<0||at>lastStart)continue;
const score=similarity(coarse,shortRef,Math.round(at/DECIMATE),shortLength);
if(score>best){best=score;bestCoarse=offset;}
}
let bestFine=bestCoarse;
best=-Infinity;
for(let offset=bestCoarse-DECIMATE+1;offset<=bestCoarse+DECIMATE-1;offset+=1){
const at=target+offset;
if(at<0||at>lastStart)continue;
const score=similarity(mono,continues,at,overlap);
if(score>best){best=score;bestFine=offset;}
}
const at=target+bestFine;
return at<0||at>lastStart?0:bestFine;
}
function similarity(signal,refAt,candidateAt,length){
if(refAt<0||candidateAt<0)return-Infinity;
const limit=Math.min(length,signal.length-refAt,signal.length-candidateAt);
if(limit<=0)return-Infinity;
let dot=0;
let energy=0;
for(let i=0;i<limit;i+=1){
const candidate=signal[candidateAt+i];
dot+=signal[refAt+i]*candidate;
energy+=candidate*candidate;
}
return dot/Math.sqrt(energy+1e-9);
}
function hann(length){
const window=new Float32Array(length);
for(let i=0;i<length;i+=1){
window[i]=0.5-0.5*Math.cos((2*Math.PI*i)/length);
}
return window;
}
function mixdown(channels){
if(channels.length===1)return channels[0];
const frames=channels[0].length;
const mono=new Float32Array(frames);
for(const samples of channels){
for(let i=0;i<frames;i+=1)mono[i]+=samples[i];
}
const scale=1/channels.length;
for(let i=0;i<frames;i+=1)mono[i]*=scale;
return mono;
}
function averageDown(mono){
const length=Math.ceil(mono.length/DECIMATE);
const out=new Float32Array(length);
for(let i=0;i<length;i+=1){
let sum=0;
let count=0;
for(let j=i*DECIMATE;j<Math.min(mono.length,i*DECIMATE+DECIMATE);j+=1){
sum+=mono[j];
count+=1;
}
out[i]=count?sum/count:0;
}
return out;
}
function shortened(channels,outFrames){
return channels.map((samples)=>{
const out=new Float32Array(outFrames);
out.set(samples.subarray(0,Math.min(samples.length,outFrames)));
return out;
});
}
const even=(n)=>(n%2===0?n:n-1);
const pause=()=>new Promise((resolve)=>{setTimeout(resolve,0);});
