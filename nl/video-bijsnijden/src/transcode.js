/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{FileWindow}from'./demux.js';
import{Mp4Writer,VIDEO_TIMESCALE}from'./mp4.js';
import{drawCropped}from'./draw.js';
import{pickH264Codec}from'./support.js';
const QUALITY_BPP={low:0.05,medium:0.1,high:0.2};
const QUALITY_HEADROOM={low:0.8,medium:1.25,high:2};
const MIN_BITRATE=200_000;
const MAX_BITRATE=60_000_000;
const QUEUE_LIMIT=8;
const KEYFRAME_SECONDS=2;
class AbortedError extends Error{
constructor(){
super('Crop cancelled.');
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
export function averageFps(video){
const seconds=video.duration/video.timescale;
if(!seconds)return 30;
return Math.min(240,Math.max(1,video.samples.length/seconds));
}
export function chooseBitrate({video,crop,fps,quality}){
const pixels=crop.width*crop.height;
const byPixels=pixels*fps*(QUALITY_BPP[quality]??QUALITY_BPP.medium);
const sourceBytes=video.samples.reduce((total,sample)=>total+sample.size,0);
const seconds=video.duration/video.timescale;
const sourceArea=video.displayWidth*video.displayHeight;
let ceiling=byPixels;
if(seconds>0&&sourceArea>0){
const sourceRate=(sourceBytes*8/seconds)*(pixels/sourceArea);
ceiling=Math.min(ceiling,sourceRate*(QUALITY_HEADROOM[quality]??1.25));
}
return Math.round(Math.min(MAX_BITRATE,Math.max(MIN_BITRATE,ceiling)));
}
async function settle(decoder,encoder){
while(decoder.decodeQueueSize>QUEUE_LIMIT||encoder.encodeQueueSize>QUEUE_LIMIT){
await new Promise((resolve)=>{
let settled=false;
const done=()=>{
if(settled)return;
settled=true;
clearTimeout(timer);
decoder.removeEventListener('dequeue',done);
encoder.removeEventListener('dequeue',done);
resolve();
};
const timer=setTimeout(done,20);
decoder.addEventListener('dequeue',done);
encoder.addEventListener('dequeue',done);
});
}
}
function micros(ticks,timescale){
return Math.round(ticks/timescale*1_000_000);
}
async function readAudio(file,audio,signal){
const window=new FileWindow(file,4<<20);
const out=[];
for(let i=0;i<audio.samples.length;i++){
throwIfAborted(signal);
const sample=audio.samples[i];
const next=audio.samples[i+1];
const bytes=await window.read(sample.offset,sample.size);
out.push({
data:new Uint8Array(bytes),
time:sample.dts,
duration:Math.max(1,Math.round(
(next?next.dts:Math.max(sample.dts+1,audio.duration))-sample.dts)),
});
}
return out;
}
export async function cropExact({
file,media,crop,quality='medium',keepAudio=true,onProgress,signal,
}){
const{video,audio}=media;
const{width,height}=crop;
const fps=averageFps(video);
const bitrate=chooseBitrate({video,crop,fps,quality});
const codec=await pickH264Codec({width,height,framerate:Math.round(fps),bitrate});
if(!codec){
throw new Error(`This browser will not encode H.264 at ${width}x${height}. `
+'Crop a smaller area, or switch the output to WebM.');
}
onProgress?.({phase:'preparing',done:0,total:video.samples.length});
const writer=new Mp4Writer({width,height});
const sound=keepAudio&&audio?await readAudio(file,audio,signal):null;
if(sound?.length){
writer.openAudioTrack({sampleEntry:audio.sampleEntry,timescale:audio.timescale});
for(const sample of sound)writer.addAudioSample(sample.data,sample.time,sample.duration);
}
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
const ctx=canvas.getContext('2d',{alpha:false});
let failure=null;
let encoded=0;
let decoded=0;
let lastKeyframeUs=-Infinity;
const encoder=new VideoEncoder({
output:(chunk,metadata)=>{
try{
if(metadata?.decoderConfig?.description){
writer.setDecoderConfig(metadata.decoderConfig.description);
}
const data=new Uint8Array(chunk.byteLength);
chunk.copyTo(data);
writer.addVideoSample(
data,
chunk.type==='key',
Math.round(chunk.timestamp/1_000_000*VIDEO_TIMESCALE),
);
encoded++;
}catch(error){
failure??=error;
}
},
error:(error)=>{failure??=error;},
});
encoder.configure({
codec,
width,
height,
bitrate,
framerate:Math.round(fps),
avc:{format:'avc'},
alpha:'discard',
latencyMode:'quality',
});
const decoder=new VideoDecoder({
output:(frame)=>{
try{
if(failure)return;
drawCropped(ctx,frame,{
rotation:video.rotation,
displayWidth:video.displayWidth,
displayHeight:video.displayHeight,
crop,
});
const keyFrame=frame.timestamp-lastKeyframeUs>=KEYFRAME_SECONDS*1_000_000;
if(keyFrame)lastKeyframeUs=frame.timestamp;
const cropped=new VideoFrame(canvas,{
timestamp:frame.timestamp,
duration:frame.duration??undefined,
});
try{
encoder.encode(cropped,{keyFrame});
}finally{
cropped.close();
}
decoded++;
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
const total=video.samples.length;
try{
for(let i=0;i<total;i++){
throwIfAborted(signal);
if(failure)throw failure;
await settle(decoder,encoder);
const sample=video.samples[i];
const bytes=await window.read(sample.offset,sample.size);
decoder.decode(new EncodedVideoChunk({
type:sample.isKey?'key':'delta',
timestamp:micros(sample.pts,video.timescale),
duration:undefined,
data:bytes,
}));
if(i%10===0||i===total-1){
onProgress?.({phase:'cropping',done:decoded,total});
}
}
onProgress?.({phase:'finishing',done:decoded,total});
await decoder.flush();
await encoder.flush();
if(failure)throw failure;
if(!encoded)throw new Error('Nothing could be decoded from this file.');
return{blob:writer.finalize(),extension:'mp4',codec,frames:encoded};
}finally{
if(decoder.state!=='closed')decoder.close();
if(encoder.state!=='closed')encoder.close();
}
}
export async function grabFrame({file,media,atSeconds=0,maxWidth=960,signal}){
const{video}=media;
const targetTicks=atSeconds*video.timescale;
let start=0;
for(let i=0;i<video.samples.length;i++){
if(video.samples[i].isKey&&video.samples[i].pts<=targetTicks)start=i;
if(video.samples[i].pts>targetTicks)break;
}
const scale=Math.min(1,maxWidth/video.displayWidth);
const canvas=document.createElement('canvas');
canvas.width=Math.max(2,Math.round(video.displayWidth*scale));
canvas.height=Math.max(2,Math.round(video.displayHeight*scale));
const ctx=canvas.getContext('2d',{alpha:false});
let failure=null;
let drawn=false;
let bestUs=-Infinity;
const targetUs=micros(targetTicks,video.timescale);
const decoder=new VideoDecoder({
output:(frame)=>{
try{
if(!drawn||(frame.timestamp<=targetUs&&frame.timestamp>bestUs)){
drawCropped(ctx,frame,{
rotation:video.rotation,
displayWidth:video.displayWidth,
displayHeight:video.displayHeight,
crop:{x:0,y:0,width:video.displayWidth,height:video.displayHeight},
scale,
});
bestUs=frame.timestamp;
drawn=true;
}
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
for(let i=start;i<video.samples.length;i++){
throwIfAborted(signal);
if(failure)throw failure;
const sample=video.samples[i];
const bytes=await window.read(sample.offset,sample.size);
decoder.decode(new EncodedVideoChunk({
type:sample.isKey?'key':'delta',
timestamp:micros(sample.pts,video.timescale),
data:bytes,
}));
if(sample.pts>targetTicks+video.timescale*0.4)break;
}
await decoder.flush();
if(failure)throw failure;
if(!drawn)throw new Error('No frame could be decoded from this file.');
return canvas;
}finally{
if(decoder.state!=='closed')decoder.close();
}
}
