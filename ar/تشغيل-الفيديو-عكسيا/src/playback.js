/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{drawFitted}from'./draw.js';
import{pickH264Codec}from'./support.js';
import{reversedAudioTrack}from'./audio.js';
import{writeFile}from'./reverse.js';
const QUALITY_BPP={low:0.05,medium:0.1,high:0.2};
const QUALITY_HEADROOM={low:0.8,medium:1.25,high:2};
const MIN_BITRATE=200_000;
const MAX_BITRATE=60_000_000;
const KEYFRAME_SECONDS=2;
const QUEUE_LIMIT=8;
const said=(key,values={})=>Object.assign(new Error(key),{values});
const SEEK_TIMEOUT=10_000;
const ASSUMED_FPS=30;
class AbortedError extends Error{
constructor(){
super('Reverse cancelled.');
this.name='AbortError';
}
}
function throwIfAborted(signal){
if(signal?.aborted)throw new AbortedError();
}
export function chooseBitrate({fileSize,seconds,size,fps,quality}){
const pixels=size.width*size.height;
const byPixels=pixels*fps*(QUALITY_BPP[quality]??QUALITY_BPP.medium);
let ceiling=byPixels;
if(seconds>0){
const sourceRate=fileSize*8/seconds;
ceiling=Math.min(ceiling,sourceRate*(QUALITY_HEADROOM[quality]??1.25));
}
return Math.round(Math.min(MAX_BITRATE,Math.max(MIN_BITRATE,ceiling)));
}
export function outputSize(width,height){
return{
width:Math.max(2,Math.floor(width/2)*2),
height:Math.max(2,Math.floor(height/2)*2),
};
}
function seekTo(video,seconds){
return new Promise((resolve,reject)=>{
const done=(fail)=>{
clearTimeout(timer);
video.removeEventListener('seeked',ok);
video.removeEventListener('error',bad);
if(fail)reject(fail);
else resolve();
};
const ok=()=>done(null);
const bad=()=>done(new Error('play.unreadable'));
const timer=setTimeout(()=>done(new Error('play.slowseek')),SEEK_TIMEOUT);
video.addEventListener('seeked',ok,{once:true});
video.addEventListener('error',bad,{once:true});
video.currentTime=seconds;
});
}
export async function measureFps(video,seconds=1){
if(typeof video.requestVideoFrameCallback!=='function'){
return{fps:ASSUMED_FPS,measured:false};
}
try{
await seekTo(video,0);
video.muted=true;
const counted=await new Promise((resolve)=>{
let frames=0;
let first=null;
const stop=setTimeout(()=>resolve({frames,span:0}),(seconds+2)*1000);
const tick=(now,metadata)=>{
const at=metadata.mediaTime;
if(first===null)first=at;
frames++;
if(at-first>=seconds||video.ended){
clearTimeout(stop);
resolve({frames:frames-1,span:at-first});
return;
}
video.requestVideoFrameCallback(tick);
};
video.requestVideoFrameCallback(tick);
video.play().catch(()=>resolve({frames:0,span:0}));
});
video.pause();
if(counted.span<=0||counted.frames<2)return{fps:ASSUMED_FPS,measured:false};
const rate=counted.frames/counted.span;
if(!Number.isFinite(rate)||rate<5||rate>120){
return{fps:ASSUMED_FPS,measured:false};
}
return{fps:Math.round(rate),measured:true};
}catch{
return{fps:ASSUMED_FPS,measured:false};
}
}
async function settle(encoder){
while(encoder.encodeQueueSize>QUEUE_LIMIT){
await new Promise((resolve)=>{
let settled=false;
const done=()=>{
if(settled)return;
settled=true;
clearTimeout(timer);
encoder.removeEventListener('dequeue',done);
resolve();
};
const timer=setTimeout(done,20);
encoder.addEventListener('dequeue',done);
});
}
}
export async function reverseByPlayback({
file,video,duration,fps,quality='medium',keepAudio=true,onProgress,signal,
}){
const frame=outputSize(video.videoWidth,video.videoHeight);
const total=Math.max(1,Math.floor(duration*fps));
const bitrate=chooseBitrate({
fileSize:file.size,seconds:duration,size:frame,fps,quality,
});
const codec=await pickH264Codec({
width:frame.width,height:frame.height,framerate:Math.round(fps),bitrate,
});
if(!codec){
throw said('encode.noh264',{width:frame.width,height:frame.height});
}
onProgress?.({phase:'preparing',done:0,total});
const canvas=document.createElement('canvas');
canvas.width=frame.width;
canvas.height=frame.height;
const ctx=canvas.getContext('2d',{alpha:false});
const encoded=[];
let avcC=null;
let failure=null;
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
time:Math.round(chunk.timestamp/1_000_000*90000),
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
video.pause();
try{
for(let k=0;k<total;k++){
throwIfAborted(signal);
if(failure)throw failure;
const at=Math.min(
Math.max(0,duration-0.0005),
(total-1-k)/fps+0.5/fps);
await seekTo(video,at);
await settle(encoder);
drawFitted(ctx,video,{
rotation:0,
displayWidth:video.videoWidth,
displayHeight:video.videoHeight,
frame,
});
const timestamp=Math.round(k/fps*1_000_000);
const keyFrame=timestamp-lastKeyframeUs>=KEYFRAME_SECONDS*1_000_000;
if(keyFrame)lastKeyframeUs=timestamp;
const picture=new VideoFrame(canvas,{
timestamp,
duration:Math.round(1_000_000/fps),
});
try{
encoder.encode(picture,{keyFrame});
}finally{
picture.close();
}
if(k%5===0||k===total-1){
onProgress?.({phase:'reversing',done:k+1,total});
}
}
onProgress?.({phase:'finishing',done:total,total});
await encoder.flush();
if(failure)throw failure;
if(!encoded.length)throw new Error('play.noframes');
if(!avcC)throw new Error('encode.noconfig');
}finally{
if(encoder.state!=='closed')encoder.close();
}
let sound=null;
let warning=null;
if(keepAudio){
const result=await reversedAudioTrack({file,audio:null,onProgress,signal});
sound=result.track;
warning=result.note;
}
return{
blob:writeFile({frame,avcC,encoded,fps,sound}),
extension:'mp4',
codec,
frames:encoded.length,
exact:false,
warning,
};
}
