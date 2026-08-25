/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{FileWindow}from'./demux.js';
import{Mp4Writer,MOVIE_TIMESCALE,avcSampleEntry}from'./mp4.js';
import{planRanges}from'./ranges.js';
import{closeDurations,audioSamplesFor}from'./copy.js';
import{encodeJoinedAudio,targetAudioFormat}from'./audio.js';
import{drawFitted}from'./draw.js';
import{pickH264Codec}from'./support.js';
const VIDEO_TIMESCALE=90000;
const QUALITY_BPP={low:0.05,medium:0.1,high:0.2};
const QUALITY_HEADROOM={low:0.8,medium:1.25,high:2};
const MIN_BITRATE=200_000;
const MAX_BITRATE=60_000_000;
const QUEUE_LIMIT=8;
const KEYFRAME_SECONDS=2;
class AbortedError extends Error{
constructor(){
super('Trim cancelled.');
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
export function outputSize(video){
return{
width:Math.max(2,Math.floor(video.displayWidth/2)*2),
height:Math.max(2,Math.floor(video.displayHeight/2)*2),
};
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
export function chooseJoinBitrate({clips,frame,fps,quality}){
let best=MIN_BITRATE;
for(const clip of clips){
if(!clip.media)continue;
best=Math.max(best,chooseBitrate({
video:clip.media.video,size:frame,fps,quality,
}));
}
return best;
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
export async function joinExact({
clips,frame,quality='medium',audioMode='copy',onProgress,signal,
}){
const usable=clips.filter((clip)=>clip.ranges.length&&clip.media);
if(!usable.length)throw new Error('There is nothing selected to keep.');
const fps=Math.max(...usable.map((clip)=>averageFps(clip.media.video)));
const bitrate=chooseJoinBitrate({clips:usable,frame,fps,quality});
const codec=await pickH264Codec({
width:frame.width,height:frame.height,framerate:Math.round(fps),bitrate,
});
if(!codec){
throw new Error(`This browser will not encode H.264 at ${frame.width}x${frame.height}. `
+'Choose a smaller frame, or use "Keep every byte", which encodes nothing at all.');
}
onProgress?.({phase:'preparing',done:0,total:1});
const canvas=document.createElement('canvas');
canvas.width=frame.width;
canvas.height=frame.height;
const ctx=canvas.getContext('2d',{alpha:false});
const encoded=[];
let avcC=null;
let failure=null;
let drawn=0;
let lastKeyframeUs=-Infinity;
let wantKeyframe=true;
let rangeStartSeconds=0;
let rangeEndSeconds=0;
let rangeOffsetUs=0;
let rotation=0;
let sourceWidth=frame.width;
let sourceHeight=frame.height;
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
const onFrame=(videoFrame)=>{
try{
if(failure)return;
const seconds=videoFrame.timestamp/1_000_000;
if(seconds<rangeStartSeconds-1e-6||seconds>=rangeEndSeconds-1e-6)return;
drawFitted(ctx,videoFrame,{
rotation,
displayWidth:sourceWidth,
displayHeight:sourceHeight,
frame,
});
const timestamp=Math.round((seconds-rangeStartSeconds)*1_000_000+rangeOffsetUs);
const keyFrame=wantKeyframe
||timestamp-lastKeyframeUs>=KEYFRAME_SECONDS*1_000_000;
if(keyFrame){
lastKeyframeUs=timestamp;
wantKeyframe=false;
}
const picture=new VideoFrame(canvas,{
timestamp,
duration:videoFrame.duration??undefined,
});
try{
encoder.encode(picture,{keyFrame});
}finally{
picture.close();
}
drawn++;
}catch(error){
failure??=error;
}finally{
videoFrame.close();
}
};
const total=usable.reduce((count,clip)=>count+clip.media.video.samples.length,0);
let fed=0;
const audioOut=[];
const audioEdits=[];
const forEncoding=[];
let outAudioTs=0;
let seamSeconds=0;
try{
for(const clip of usable){
const{video,audio}=clip.media;
const hasAudio=Boolean(audio?.samples.length);
const planAudio=audioMode!=='none'&&hasAudio?audio:null;
const useAudio=audioMode==='copy'&&hasAudio;
const{plans,audioDurations}=planRanges({
video,
audio:planAudio,
ranges:clip.ranges,
anchor:'start',
});
if(audioMode==='encode'){
forEncoding.push({file:clip.file,media:clip.media,plans});
}
if(useAudio&&!outAudioTs)outAudioTs=audio.timescale;
const audioSeam=outAudioTs?Math.round(seamSeconds*outAudioTs):0;
rotation=video.rotation;
sourceWidth=video.displayWidth;
sourceHeight=video.displayHeight;
const decoder=new VideoDecoder({
output:onFrame,
error:(error)=>{failure??=error;},
});
decoder.configure(decoderConfig(video));
const window=new FileWindow(clip.file);
try{
for(const plan of plans){
rangeStartSeconds=plan.start;
rangeEndSeconds=plan.end;
wantKeyframe=true;
for(let i=plan.video.from;i<=plan.video.to;i++){
throwIfAborted(signal);
if(failure)throw failure;
await settle(decoder,encoder);
const sample=video.samples[i];
const data=await window.read(sample.offset,sample.size);
decoder.decode(new EncodedVideoChunk({
type:sample.isKey?'key':'delta',
timestamp:micros(sample.pts,video.timescale),
data,
}));
fed++;
if(fed%10===0||fed===total){
onProgress?.({phase:'trimming',done:drawn,total});
}
}
await decoder.flush();
if(failure)throw failure;
if(useAudio&&plan.audio){
for(const sample of audioSamplesFor({
file:clip.file,audio,plan,durations:audioDurations,
seam:audioSeam,outTimescale:outAudioTs,
})){
audioOut.push(sample);
}
audioEdits.push({
mediaTime:audioSeam+Math.round(
(plan.audio.offset+plan.audio.editStart)*outAudioTs/audio.timescale),
duration:Math.round((plan.end-plan.start)*MOVIE_TIMESCALE),
});
}
rangeOffsetUs+=Math.round((plan.end-plan.start)*1_000_000);
seamSeconds+=plan.end-plan.start;
}
}finally{
if(decoder.state!=='closed')decoder.close();
}
}
onProgress?.({phase:'finishing',done:drawn,total});
await encoder.flush();
if(failure)throw failure;
if(!encoded.length)throw new Error('No frames could be decoded from what you chose.');
if(!avcC)throw new Error('The encoder never reported a decoder configuration.');
}finally{
if(encoder.state!=='closed')encoder.close();
}
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
let warning=null;
if(audioMode==='copy'&&audioOut.length){
const audioTrack=writer.addTrack({
kind:'soun',
timescale:outAudioTs,
sampleEntry:usable.find((clip)=>clip.media.audio?.samples.length).media.audio.sampleEntry,
});
for(const sample of closeDurations(audioOut))audioTrack.addSample(sample);
let offsetMs=0;
for(const edit of audioEdits){
videoTrack.addEdit(Math.round(offsetMs/MOVIE_TIMESCALE*VIDEO_TIMESCALE),edit.duration);
audioTrack.addEdit(edit.mediaTime,edit.duration);
offsetMs+=edit.duration;
}
}else if(audioMode==='encode'){
onProgress?.({phase:'sound',done:0,total:forEncoding.length});
const format=targetAudioFormat(usable);
const sound=await encodeJoinedAudio({clips:forEncoding,format,onProgress,signal});
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
}else{
warning='These clips describe their sound differently, so it had to be re-encoded '
+'to be joined - and this browser will not encode AAC. The video has been joined '
+'without sound. Chrome and Edge will do it.';
}
}
return{
blob:writer.finalize(),
extension:'mp4',
codec,
frames:encoded.length,
clips:usable.length,
exact:true,
preRoll:0,
warning,
};
}
export function trimExact({
file,media,ranges,quality='medium',keepAudio=true,onProgress,signal,
}){
return joinExact({
clips:[{file,media,ranges}],
frame:outputSize(media.video),
quality,
audioMode:keepAudio&&media.audio?.samples.length?'copy':'none',
onProgress,
signal,
});
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
output:(videoFrame)=>{
try{
if(!drawn||(videoFrame.timestamp<=targetUs&&videoFrame.timestamp>bestUs)){
drawFitted(ctx,videoFrame,{
rotation:video.rotation,
displayWidth:video.displayWidth,
displayHeight:video.displayHeight,
frame:{width:canvas.width,height:canvas.height},
});
bestUs=videoFrame.timestamp;
drawn=true;
}
}catch(error){
failure??=error;
}finally{
videoFrame.close();
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
const data=await window.read(sample.offset,sample.size);
decoder.decode(new EncodedVideoChunk({
type:sample.isKey?'key':'delta',
timestamp:micros(sample.pts,video.timescale),
data,
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
