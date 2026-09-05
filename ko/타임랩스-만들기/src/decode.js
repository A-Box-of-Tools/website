/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{FileWindow}from'./shared/mp4-reader.js?v=afd42a1152';
import{decodeRuns}from'./plan.js?v=afd42a1152';
import{drawScaled,frameCanvas}from'./shared/frame-canvas.js?v=afd42a1152';
import{decoderConfig,settle}from'./shared/webcodecs.js?v=afd42a1152';
import{throwIfAborted}from'./shared/errors.js?v=afd42a1152';
class Sampler{
#times;
#canvas;
#write;
#served=0;
#drawn=false;
constructor({times,canvas,write}){
this.#times=times;
this.#canvas=canvas;
this.#write=write;
}
get served(){
return this.#served;
}
get done(){
return this.#served>=this.#times.length;
}
offer(time,paint){
if(this.#drawn){
while(!this.done&&this.#times[this.#served]<time-1e-9){
this.#write(this.#canvas);
this.#served+=1;
}
}
if(this.done)return;
paint();
this.#drawn=true;
}
finish(){
if(!this.#drawn)return;
while(!this.done){
this.#write(this.#canvas);
this.#served+=1;
}
}
}
export async function timelapseByDecoding({
file,media,times,width,height,writer,onProgress,signal,
}){
const{video}=media;
const{canvas,ctx}=frameCanvas(width,height);
const runs=decodeRuns({samples:video.samples,timescale:video.timescale,times});
const sampler=new Sampler({
times,
canvas,
write:(source)=>writer.write(source),
});
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
let fed=0;
for(const run of runs){
if(sampler.done)break;
for(let i=run.first;i<=run.last;i+=1){
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
await settle([decoder]);
while(writer.busy)await writer.settle();
fed+=1;
if(fed%10===0){
onProgress?.({phase:'working',done:sampler.served,total:times.length});
}
}
}
await decoder.flush();
if(failure)throw failure;
sampler.finish();
onProgress?.({phase:'finishing',done:times.length,total:times.length});
return await writer.finish();
}finally{
if(decoder.state!=='closed')decoder.close();
canvas.width=0;
}
}
export async function previewFrame({file,media,atSeconds=0,maxWidth=640,signal}){
const{video}=media;
const times=[Math.max(0,atSeconds)];
const[run]=decodeRuns({samples:video.samples,timescale:video.timescale,times});
if(!run)throw new Error('decode.noframes');
const scale=Math.min(1,maxWidth/video.displayWidth);
const width=Math.max(2,Math.round(video.displayWidth*scale));
const height=Math.max(2,Math.round(video.displayHeight*scale));
const{canvas,ctx}=frameCanvas(width,height);
let failure=null;
let drawn=false;
const sampler=new Sampler({times,canvas,write:()=>{drawn=true;}});
const decoder=new VideoDecoder({
output:(frame)=>{
try{
if(failure)return;
sampler.offer(frame.timestamp/1_000_000,()=>drawScaled(ctx,frame,{
rotation:video.rotation,
displayWidth:video.displayWidth,
displayHeight:video.displayHeight,
width,
height,
}));
}catch(error){
failure??=error;
}finally{
frame.close();
}
},
error:(error)=>{failure??=error;},
});
decoder.configure(decoderConfig(video));
const window=new FileWindow(file,4<<20);
try{
for(let i=run.first;i<=run.last;i+=1){
throwIfAborted(signal);
if(failure)throw failure;
const sample=video.samples[i];
const bytes=await window.read(sample.offset,sample.size);
decoder.decode(new EncodedVideoChunk({
type:sample.isKey?'key':'delta',
timestamp:Math.round(sample.pts/video.timescale*1_000_000),
data:bytes,
}));
}
await decoder.flush();
if(failure)throw failure;
sampler.finish();
if(!drawn)throw new Error('decode.nodraw');
return canvas;
}finally{
if(decoder.state!=='closed')decoder.close();
}
}
