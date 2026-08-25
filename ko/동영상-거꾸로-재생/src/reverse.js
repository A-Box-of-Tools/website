/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{FileWindow}from'./demux.js';
import{Mp4Writer,avcSampleEntry}from'./mp4.js';
import{drawFitted}from'./draw.js';
import{pickH264Codec}from'./support.js';
import{reversedAudioTrack}from'./audio.js';
import{
averageFps,closeDurations,frameWindows,gopRanges,outputSize,reversedTimes,windowLimit,
}from'./timeline.js';
const VIDEO_TIMESCALE=90000;
const QUALITY_BPP={low:0.05,medium:0.1,high:0.2};
const QUALITY_HEADROOM={low:0.8,medium:1.25,high:2};
const MIN_BITRATE=200_000;
const MAX_BITRATE=60_000_000;
const QUEUE_LIMIT=8;
const STALL_TIMEOUT_MS=30_000;
const KEYFRAME_SECONDS=2;
const GROUP_CACHE_BYTES=64<<20;
class AbortedError extends Error{
constructor(){
super('Reverse cancelled.');
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
export function chooseBitrate({video,size,fps,quality}){
const pixels=size.width*size.height;
const byPixels=pixels*fps*(QUALITY_BPP[quality]??QUALITY_BPP.medium);
const sourceBytes=video.samples.reduce((total,sample)=>total+sample.size,0);
const seconds=video.duration/video.timescale;
let ceiling=byPixels;
if(seconds>0){
const sourceRate=sourceBytes*8/seconds;
ceiling=Math.min(ceiling,sourceRate*(QUALITY_HEADROOM[quality]??1.25));
}
return Math.round(Math.min(MAX_BITRATE,Math.max(MIN_BITRATE,ceiling)));
}
const BITMAP_BYTES_PER_PIXEL=4;
async function framesAreOpaque(video,file){
const key=video.samples.findIndex((sample)=>sample.isKey);
if(key<0)return false;
return new Promise((resolve)=>{
let settled=false;
const answer=(value)=>{
if(settled)return;
settled=true;
clearTimeout(timer);
if(probe.state!=='closed')probe.close();
resolve(value);
};
const timer=setTimeout(()=>answer(false),5000);
const probe=new VideoDecoder({
output:(frame)=>{
const format=frame.format;
frame.close();
answer(format===null);
},
error:()=>answer(false),
});
try{
probe.configure(decoderConfig(video));
const sample=video.samples[key];
file.slice(sample.offset,sample.offset+sample.size).arrayBuffer()
.then((data)=>{
probe.decode(new EncodedVideoChunk({
type:'key',
timestamp:micros(sample.pts,video.timescale),
data:new Uint8Array(data),
}));
return probe.flush();
})
.catch(()=>answer(false));
}catch{
answer(false);
}
});
}
function withStallTimeout(promise,which){
let timer=null;
const stalled=new Promise((resolve,reject)=>{
timer=setTimeout(()=>reject(new Error(
`The video ${which} stopped responding partway through, without reporting a reason. `
+'A shorter clip, a lower quality setting, or a different browser is worth trying.')),
STALL_TIMEOUT_MS);
});
return Promise.race([promise,stalled]).finally(()=>clearTimeout(timer));
}
async function settle(decoder,encoder){
let bestSeen=decoder.decodeQueueSize+encoder.encodeQueueSize;
let progressAt=Date.now();
while(decoder.decodeQueueSize>QUEUE_LIMIT||encoder.encodeQueueSize>QUEUE_LIMIT){
const size=decoder.decodeQueueSize+encoder.encodeQueueSize;
if(size<bestSeen){
bestSeen=size;
progressAt=Date.now();
}else if(Date.now()-progressAt>STALL_TIMEOUT_MS){
throw new Error('The video decoder or encoder stopped responding partway through, without '
+'reporting a reason. A shorter clip, a lower quality setting, or a different browser '
+'is worth trying.');
}
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
async function readGroup(file,samples,group){
let low=Infinity;
let high=0;
for(let i=group.from;i<=group.to;i++){
low=Math.min(low,samples[i].offset);
high=Math.max(high,samples[i].offset+samples[i].size);
}
if(high-low>GROUP_CACHE_BYTES){
return{
async get(index){
const sample=samples[index];
return new Uint8Array(
await file.slice(sample.offset,sample.offset+sample.size).arrayBuffer());
},
};
}
const bytes=new Uint8Array(await file.slice(low,high).arrayBuffer());
return{
async get(index){
const sample=samples[index];
return bytes.subarray(sample.offset-low,sample.offset-low+sample.size);
},
};
}
export async function reverseExact({
file,media,quality='medium',keepAudio=true,onProgress,signal,
}){
const{video,audio}=media;
const frame=outputSize(video);
const fps=averageFps(video);
const bitrate=chooseBitrate({video,size:frame,fps,quality});
const codec=await pickH264Codec({
width:frame.width,height:frame.height,framerate:Math.round(fps),bitrate,
});
if(!codec){
throw new Error(`This browser will not encode H.264 at ${frame.width}x${frame.height}. `
+'A smaller clip will work; this one will not.');
}
onProgress?.({phase:'preparing',done:0,total:video.samples.length});
const times=reversedTimes(video);
const groups=gopRanges(video.samples);
const opaque=await framesAreOpaque(video,file);
const limit=windowLimit(
video.codedWidth,video.codedHeight,undefined,opaque?BITMAP_BYTES_PER_PIXEL:1.5);
const canvas=document.createElement('canvas');
canvas.width=frame.width;
canvas.height=frame.height;
const ctx=canvas.getContext('2d',{alpha:false});
const encoded=[];
let avcC=null;
let failure=null;
let drawn=0;
let lastKeyframeUs=-Infinity;
const encoder=new VideoEncoder({
output:(chunk,metadata)=>{
try{
if(!avcC&&metadata?.decoderConfig?.description){
const description=metadata.decoderConfig.description;
avcC=description instanceof Uint8Array
?description
:new Uint8Array(description instanceof ArrayBuffer
?description
:description.buffer.slice(
description.byteOffset,description.byteOffset+description.byteLength));
}
const data=new Uint8Array(chunk.byteLength);
chunk.copyTo(data);
encoded.push({
data,
isKey:chunk.type==='key',
time:Math.round(chunk.timestamp/1_000_000*VIDEO_TIMESCALE),
});
}catch(error){
failure??=error;
}
},
error:(error)=>{failure??=error;},
});
encoder.configure({
codec,
width:frame.width,
height:frame.height,
bitrate,
framerate:Math.round(fps),
avc:{format:'avc'},
alpha:'discard',
latencyMode:'quality',
});
let wanted=new Map();
let kept=[];
let copies=[];
const decoder=new VideoDecoder({
output:(videoFrame)=>{
if(!wanted.has(videoFrame.timestamp)){
videoFrame.close();
return;
}
try{
const rect=videoFrame.visibleRect;
const slot={
timestamp:videoFrame.timestamp,
format:videoFrame.format,
width:rect?rect.width:videoFrame.codedWidth,
height:rect?rect.height:videoFrame.codedHeight,
displayWidth:videoFrame.displayWidth,
displayHeight:videoFrame.displayHeight,
colorSpace:videoFrame.colorSpace,
data:null,
layout:null,
bitmap:null,
};
kept.push(slot);
copies.push((slot.format===null
?createImageBitmap(videoFrame).then((bitmap)=>{slot.bitmap=bitmap;})
:(()=>{
const buffer=new ArrayBuffer(videoFrame.allocationSize());
return videoFrame.copyTo(buffer).then((layout)=>{
slot.data=buffer;
slot.layout=layout;
});
})())
.catch((error)=>{failure??=error;})
.finally(()=>videoFrame.close()));
}catch(error){
failure??=error;
videoFrame.close();
}
},
error:(error)=>{failure??=error;},
});
decoder.configure(decoderConfig(video));
const drawable=(slot)=>(slot.bitmap?slot.bitmap:new VideoFrame(slot.data,{
format:slot.format,
codedWidth:slot.width,
codedHeight:slot.height,
timestamp:slot.timestamp,
layout:slot.layout,
displayWidth:slot.displayWidth,
displayHeight:slot.displayHeight,
colorSpace:slot.colorSpace,
}));
const discard=(slot)=>{
slot.bitmap?.close();
slot.bitmap=null;
slot.data=null;
};
const needsCanvas=(source)=>video.rotation!==0
||frame.width!==video.displayWidth
||frame.height!==video.displayHeight
||(source.codedWidth??source.width)!==frame.width
||(source.codedHeight??source.height)!==frame.height;
const emit=(source,index)=>{
try{
const timestamp=micros(times.start[index],video.timescale);
const duration=micros(times.duration[index],video.timescale);
const keyFrame=timestamp-lastKeyframeUs>=KEYFRAME_SECONDS*1_000_000;
if(keyFrame)lastKeyframeUs=timestamp;
let picture;
if(needsCanvas(source)){
drawFitted(ctx,source,{
rotation:video.rotation,
displayWidth:video.displayWidth,
displayHeight:video.displayHeight,
frame,
});
picture=new VideoFrame(canvas,{timestamp,duration});
}else{
picture=new VideoFrame(source,{timestamp,duration});
}
try{
encoder.encode(picture,{keyFrame});
}finally{
picture.close();
}
drawn++;
}catch(error){
failure??=error;
}finally{
source.close();
}
};
const total=video.samples.length;
try{
for(let g=groups.length-1;g>=0;g--){
const group=groups[g];
const shown=[];
for(let i=group.from;i<=group.to;i++)shown.push(i);
shown.sort((a,b)=>video.samples[a].pts-video.samples[b].pts);
const bytes=await readGroup(file,video.samples,group);
for(const window of frameWindows(shown.length,limit)){
throwIfAborted(signal);
if(failure)throw failure;
const run=shown.slice(window.from,window.to+1);
wanted=new Map(
run.map((index)=>[micros(video.samples[index].pts,video.timescale),index]));
kept=[];
copies=[];
const until=Math.max(...run);
for(let i=group.from;i<=until;i++){
throwIfAborted(signal);
if(failure)throw failure;
await settle(decoder,encoder);
const sample=video.samples[i];
decoder.decode(new EncodedVideoChunk({
type:sample.isKey?'key':'delta',
timestamp:micros(sample.pts,video.timescale),
data:await bytes.get(i),
}));
}
await withStallTimeout(decoder.flush(),'decoder');
await Promise.all(copies);
copies=[];
if(failure)throw failure;
kept.sort((a,b)=>b.timestamp-a.timestamp);
for(const slot of kept){
if(!slot.data&&!slot.bitmap)continue;
emit(drawable(slot),wanted.get(slot.timestamp));
discard(slot);
await settle(decoder,encoder);
}
kept=[];
onProgress?.({phase:'reversing',done:drawn,total});
}
}
onProgress?.({phase:'finishing',done:drawn,total});
await withStallTimeout(encoder.flush(),'encoder');
if(failure)throw failure;
if(!encoded.length)throw new Error('No frames could be decoded from this file.');
if(!avcC)throw new Error('The encoder never reported a decoder configuration.');
}finally{
await Promise.allSettled(copies);
for(const slot of kept)discard(slot);
kept=[];
copies=[];
if(decoder.state!=='closed')decoder.close();
if(encoder.state!=='closed')encoder.close();
}
let sound=null;
let warning=null;
if(keepAudio&&audio?.samples.length){
const result=await reversedAudioTrack({file,audio,onProgress,signal});
sound=result.track;
warning=result.note;
}
return{
blob:writeFile({frame,avcC,encoded,fps,sound}),
extension:'mp4',
codec,
frames:encoded.length,
exact:true,
warning,
};
}
export function writeFile({frame,avcC,encoded,fps,sound}){
const writer=new Mp4Writer();
const videoTrack=writer.addTrack({
kind:'vide',
timescale:VIDEO_TIMESCALE,
sampleEntry:avcSampleEntry(frame.width,frame.height,avcC),
matrix:null,
width:frame.width<<16,
height:frame.height<<16,
});
encoded.sort((a,b)=>a.time-b.time);
const tail=Math.max(1,Math.round(VIDEO_TIMESCALE/Math.max(1,fps)));
for(const sample of closeDurations(encoded.map((chunk)=>({
data:chunk.data,isKey:chunk.isKey,dts:chunk.time,pts:chunk.time,tailDuration:tail,
})))){
videoTrack.addSample(sample);
}
if(sound){
const audioTrack=writer.addTrack({
kind:'soun',
timescale:sound.timescale,
sampleEntry:sound.sampleEntry,
});
for(const sample of sound.samples){
audioTrack.addSample({
data:sample.data,
isKey:true,
dts:sample.dts,
pts:sample.dts,
duration:sample.duration,
});
}
}
return writer.finalize();
}
export{VIDEO_TIMESCALE};
