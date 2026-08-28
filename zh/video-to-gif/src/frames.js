/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{FileWindow}from'./demux.js';
import{drawScaled,frameCanvas}from'./draw.js';
const QUEUE_LIMIT=8;
const REORDER_SLACK=0.5;
const SEEK_TIMEOUT=10_000;
class AbortedError extends Error{
constructor(){
super('Cancelled.');
this.name='AbortError';
}
}
function throwIfAborted(signal){
if(signal?.aborted)throw new AbortedError();
}
export function decoderConfig(video){
const config={
codec:video.codec,
codedWidth:video.codedWidth,
codedHeight:video.codedHeight,
};
if(video.description)config.description=video.description;
return config;
}
class Sampler{
#times;
#ctx;
#width;
#height;
#histogram;
#step;
frames=[];
#drawn=false;
constructor({times,ctx,width,height,histogram,step}){
this.#times=times;
this.#ctx=ctx;
this.#width=width;
this.#height=height;
this.#histogram=histogram;
this.#step=step;
}
get done(){
return this.frames.length>=this.#times.length;
}
#take(){
const{data}=this.#ctx.getImageData(0,0,this.#width,this.#height);
this.#histogram?.add(data,this.#step);
this.frames.push(data);
}
offer(time,paint){
if(this.#drawn){
while(!this.done&&this.#times[this.frames.length]<time-1e-9)this.#take();
}
if(this.done)return;
paint();
this.#drawn=true;
}
finish(){
if(!this.#drawn)return;
while(!this.done)this.#take();
}
}
export async function framesByDecoding({
file,media,times,width,height,histogram,step=1,onProgress,signal,
}){
const{video}=media;
const{canvas,ctx}=frameCanvas(width,height);
const sampler=new Sampler({times,ctx,width,height,histogram,step});
const startTicks=times[0]*video.timescale;
const endTicks=times[times.length-1]*video.timescale;
let first=0;
for(let i=0;i<video.samples.length;i+=1){
if(video.samples[i].isKey&&video.samples[i].pts<=startTicks)first=i;
if(video.samples[i].pts>startTicks)break;
}
let failure=null;
const decoder=new VideoDecoder({
output:(frame)=>{
try{
if(failure||sampler.done)return;
sampler.offer(frame.timestamp/1_000_000,()=>drawScaled(ctx,frame,{
rotation:video.rotation,
displayWidth:video.displayWidth,
displayHeight:video.displayHeight,
width,
height,
}));
onProgress?.({phase:'reading',done:sampler.frames.length,total:times.length});
}catch(error){
failure??=error;
}finally{
frame.close();
}
},
error:(error)=>{failure??=error;},
});
decoder.configure(decoderConfig(video));
const window=new FileWindow(file);
try{
for(let i=first;i<video.samples.length;i+=1){
throwIfAborted(signal);
if(failure)throw failure;
if(sampler.done)break;
const sample=video.samples[i];
const bytes=await window.read(sample.offset,sample.size);
decoder.decode(new EncodedVideoChunk({
type:sample.isKey?'key':'delta',
timestamp:Math.round(sample.pts/video.timescale*1_000_000),
data:bytes,
}));
if(sample.pts>endTicks+REORDER_SLACK*video.timescale)break;
while(decoder.decodeQueueSize>QUEUE_LIMIT)await tick(decoder);
}
await decoder.flush();
if(failure)throw failure;
sampler.finish();
if(!sampler.frames.length)throw new Error('read.noframes');
return sampler.frames;
}finally{
if(decoder.state!=='closed')decoder.close();
canvas.width=0;
}
}
function tick(decoder){
return new Promise((resolve)=>{
let settled=false;
const done=()=>{
if(settled)return;
settled=true;
clearTimeout(timer);
decoder.removeEventListener('dequeue',done);
resolve();
};
const timer=setTimeout(done,20);
decoder.addEventListener('dequeue',done);
});
}
export async function framesByPlaying({
video,times,width,height,histogram,step=1,onProgress,signal,
}){
const{canvas,ctx}=frameCanvas(width,height);
const frames=[];
video.pause();
try{
for(let i=0;i<times.length;i+=1){
throwIfAborted(signal);
await seek(video,times[i]);
drawScaled(ctx,video,{
displayWidth:video.videoWidth,
displayHeight:video.videoHeight,
width,
height,
});
const{data}=ctx.getImageData(0,0,width,height);
histogram?.add(data,step);
frames.push(data);
onProgress?.({phase:'reading',done:frames.length,total:times.length});
}
return frames;
}finally{
canvas.width=0;
}
}
function seek(video,seconds){
return new Promise((resolve,reject)=>{
let settled=false;
const finish=()=>{
if(settled)return;
settled=true;
clearTimeout(timer);
video.removeEventListener('seeked',onSeeked);
video.removeEventListener('error',onError);
resolve();
};
const onSeeked=()=>{
if(typeof video.requestVideoFrameCallback==='function'){
video.requestVideoFrameCallback(()=>finish());
setTimeout(finish,120);
}else{
setTimeout(finish,40);
}
};
const onError=()=>{
if(settled)return;
settled=true;
clearTimeout(timer);
video.removeEventListener('seeked',onSeeked);
reject(new Error('play.stopped'));
};
const timer=setTimeout(finish,SEEK_TIMEOUT);
video.addEventListener('seeked',onSeeked,{once:true});
video.addEventListener('error',onError,{once:true});
if(Math.abs(video.currentTime-seconds)<1e-4)finish();
else video.currentTime=seconds;
});
}
