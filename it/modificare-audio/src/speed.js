/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const LOBES=8;
const RESOLUTION=512;
const KERNEL=buildKernel();
function buildKernel(){
const table=new Float32Array(LOBES*RESOLUTION+2);
for(let i=0;i<table.length;i+=1){
const t=i/RESOLUTION;
const u=t/LOBES;
const sinc=t===0?1:Math.sin(Math.PI*t)/(Math.PI*t);
const window=u>=1
?0
:0.42+0.5*Math.cos(Math.PI*u)+0.08*Math.cos(2*Math.PI*u);
table[i]=sinc*window;
}
return table;
}
export const resampledLength=(frames,speed)=>Math.max(1,Math.round(frames/speed));
export async function resample(channels,speed,{onProgress,signal}={}){
if(!(speed>0))throw new Error('speed must be greater than zero');
const frames=channels[0].length;
const outFrames=resampledLength(frames,speed);
const cutoff=Math.min(1,1/speed);
const radius=LOBES/cutoff;
const out=channels.map(()=>new Float32Array(outFrames));
const BLOCK=1<<15;
for(let start=0;start<outFrames;start+=BLOCK){
signal?.throwIfAborted();
const end=Math.min(start+BLOCK,outFrames);
for(let c=0;c<channels.length;c+=1){
const input=channels[c];
const output=out[c];
for(let i=start;i<end;i+=1){
const at=i*speed;
const first=Math.max(0,Math.ceil(at-radius));
const last=Math.min(frames-1,Math.floor(at+radius));
let sum=0;
let weights=0;
for(let j=first;j<=last;j+=1){
const position=Math.abs(j-at)*cutoff*RESOLUTION;
const index=position|0;
const fraction=position-index;
const weight=KERNEL[index]+(KERNEL[index+1]-KERNEL[index])*fraction;
sum+=input[j]*weight;
weights+=weight;
}
output[i]=weights>1e-6?sum/weights:0;
}
}
onProgress?.(end/outFrames);
if(end<outFrames)await pause();
}
return out;
}
const pause=()=>new Promise((resolve)=>{setTimeout(resolve,0);});
