/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{drawFitted}from'./draw.js?v=ca5dfc20a6';
import{pickH264Codec}from'./shared/video-support.js?v=ca5dfc20a6';
import{reversedAudioTrack}from'./audio.js?v=ca5dfc20a6';
import{writeFile}from'./reverse.js?v=ca5dfc20a6';
import{settle}from'./shared/webcodecs.js?v=ca5dfc20a6';
import{throwIfAborted,said}from'./shared/errors.js?v=ca5dfc20a6';
const QUALITY_BPP={low:0.05,medium:0.1,high:0.2};
const QUALITY_HEADROOM={low:0.8,medium:1.25,high:2};
const MIN_BITRATE=200_000;
const MAX_BITRATE=60_000_000;
const KEYFRAME_SECONDS=2;
const SEEK_TIMEOUT=10_000;
const ASSUMED_FPS=30;
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
function seekTo(video,seconds,signal){
throwIfAborted(signal);
return new Promise((resolve,reject)=>{
const done=(fail)=>{
clearTimeout(timer);
signal?.removeEventListener('abort',cancel);
video.removeEventListener('seeked',ok);
video.removeEventListener('error',bad);
if(fail)reject(fail);
else resolve();
};
const ok=()=>done(null);
const bad=()=>done(new Error('play.unreadable'));
const cancel=()=>{
try{throwIfAborted(signal);}catch(error){done(error);}
};
const timer=setTimeout(()=>done(new Error('play.slowseek')),SEEK_TIMEOUT);
signal?.addEventListener('abort',cancel,{once:true});
video.addEventListener('seeked',ok,{once:true});
video.addEventListener('error',bad,{once:true});
video.currentTime=seconds;
});
}
export async function measureFps(video,seconds=1,signal){
throwIfAborted(signal);
if(typeof video.requestVideoFrameCallback!=='function'){
return{fps:ASSUMED_FPS,measured:false};
}
try{
await seekTo(video,0,signal);
throwIfAborted(signal);
video.muted=true;
const counted=await new Promise((resolve,reject)=>{
let frames=0;
let first=null;
let callback=null;
let finished=false;
const done=(result,error)=>{
if(finished)return;
finished=true;
clearTimeout(stop);
signal?.removeEventListener('abort',cancel);
if(callback!==null)video.cancelVideoFrameCallback?.(callback);
if(error)reject(error);
else resolve(result);
};
const cancel=()=>{
try{throwIfAborted(signal);}catch(error){done(null,error);}
};
const stop=setTimeout(()=>done({frames,span:0}),(seconds+2)*1000);
const tick=(now,metadata)=>{
if(finished)return;
callback=null;
const at=metadata.mediaTime;
if(first===null)first=at;
frames++;
if(at-first>=seconds||video.ended){
done({frames:frames-1,span:at-first});
return;
}
callback=video.requestVideoFrameCallback(tick);
};
signal?.addEventListener('abort',cancel,{once:true});
callback=video.requestVideoFrameCallback(tick);
video.play().catch(()=>done({frames:0,span:0}));
});
throwIfAborted(signal);
if(counted.span<=0||counted.frames<2)return{fps:ASSUMED_FPS,measured:false};
const rate=counted.frames/counted.span;
if(!Number.isFinite(rate)||rate<5||rate>120){
return{fps:ASSUMED_FPS,measured:false};
}
return{fps:Math.round(rate),measured:true};
}catch{
throwIfAborted(signal);
return{fps:ASSUMED_FPS,measured:false};
}finally{
video.pause();
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
await settle([encoder]);
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
