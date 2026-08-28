/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{pickRecorderMimeType}from'./support.js';
const QUALITY_BPP={low:0.05,medium:0.1,high:0.2};
const LOAD_TIMEOUT=20_000;
const SEEK_TIMEOUT=20_000;
export function estimateRecording({size,fps,quality,seconds}){
const bitsPerPixel=QUALITY_BPP[quality]??QUALITY_BPP.medium;
const video=Math.min(50_000_000,Math.round(size.width*size.height*fps*bitsPerPixel));
const audio=128_000;
return Math.round((video+audio)/8*Math.max(0,seconds));
}
function aborted(){
const error=new Error('Trim cancelled.');
error.name='AbortError';
return error;
}
function hiddenPlayer(src){
const video=document.createElement('video');
video.src=src;
video.className='recording-player';
video.playsInline=true;
video.preload='auto';
document.body.append(video);
return video;
}
function whenReady(video,signal){
return new Promise((resolve,reject)=>{
const done=(error)=>{
clearTimeout(timer);
video.removeEventListener('canplay',ok);
video.removeEventListener('error',bad);
signal?.removeEventListener('abort',cancel);
if(error)reject(error);else resolve();
};
const ok=()=>done(null);
const bad=()=>done(new Error('record.noplay'));
const cancel=()=>done(aborted());
const timer=setTimeout(()=>done(new Error('record.slow')),LOAD_TIMEOUT);
if(video.readyState>=2){done(null);return;}
video.addEventListener('canplay',ok,{once:true});
video.addEventListener('error',bad,{once:true});
signal?.addEventListener('abort',cancel,{once:true});
});
}
function seekTo(video,seconds,signal){
return new Promise((resolve,reject)=>{
const done=(error)=>{
clearTimeout(timer);
video.removeEventListener('seeked',ok);
signal?.removeEventListener('abort',cancel);
if(error)reject(error);else resolve();
};
const ok=()=>done(null);
const cancel=()=>done(aborted());
const timer=setTimeout(
()=>done(new Error('record.noseek')),
SEEK_TIMEOUT);
if(Math.abs(video.currentTime-seconds)<0.001){done(null);return;}
video.addEventListener('seeked',ok,{once:true});
signal?.addEventListener('abort',cancel,{once:true});
video.currentTime=seconds;
});
}
export async function trimByRecording({
src,range,size,quality='medium',keepAudio=true,fps=30,onProgress,signal,
}){
const mimeType=pickRecorderMimeType();
if(!mimeType)throw new Error('record.nosupport');
const canvas=document.createElement('canvas');
canvas.width=Math.max(2,Math.floor(size.width/2)*2);
canvas.height=Math.max(2,Math.floor(size.height/2)*2);
const ctx=canvas.getContext('2d',{alpha:false});
const video=hiddenPlayer(src);
let audioContext=null;
let audioMissing=false;
let tracks=[];
let recorder=null;
const teardown=()=>{
video.pause();
for(const track of tracks)track.stop();
video.removeAttribute('src');
video.load();
video.remove();
audioContext?.close().catch(()=>{});
};
let wentHidden=document.hidden;
const onVisibility=()=>{if(document.hidden)wentHidden=true;};
document.addEventListener('visibilitychange',onVisibility);
try{
onProgress?.({phase:'preparing',done:0,total:1});
await whenReady(video,signal);
await seekTo(video,range.start,signal);
let stream=canvas.captureStream(0);
let[videoTrack]=stream.getVideoTracks();
const onDemand=typeof videoTrack.requestFrame==='function';
if(!onDemand){
stream=canvas.captureStream(Math.max(1,Math.round(fps)));
[videoTrack]=stream.getVideoTracks();
}
tracks=[videoTrack];
if(keepAudio){
try{
audioContext=new(window.AudioContext??window.webkitAudioContext)();
const destination=audioContext.createMediaStreamDestination();
audioContext.createMediaElementSource(video).connect(destination);
const[audioTrack]=destination.stream.getAudioTracks();
if(audioTrack)tracks.push(audioTrack);
else audioMissing=true;
}catch{
audioMissing=true;
video.muted=true;
}
}else{
video.muted=true;
}
const bitsPerPixel=QUALITY_BPP[quality]??QUALITY_BPP.medium;
recorder=new MediaRecorder(new MediaStream(tracks),{
mimeType,
videoBitsPerSecond:Math.min(50_000_000,
Math.round(canvas.width*canvas.height*fps*bitsPerPixel)),
});
const parts=[];
recorder.ondataavailable=(event)=>{if(event.data.size)parts.push(event.data);};
const finished=new Promise((resolve,reject)=>{
recorder.onstop=resolve;
recorder.onerror=(event)=>reject(event.error??new Error('Recording failed.'));
});
const wanted=Math.max(0,range.end-range.start);
const draw=()=>{
ctx.drawImage(video,0,0,canvas.width,canvas.height);
if(onDemand)videoTrack.requestFrame();
onProgress?.({
phase:'recording',
done:Math.max(0,video.currentTime-range.start),
total:wanted,
realtime:true,
});
};
await audioContext?.resume().catch(()=>{});
draw();
recorder.start();
await video.play();
await new Promise((resolve,reject)=>{
let settled=false;
const done=(fn,value)=>{
if(settled)return;
settled=true;
clearInterval(ticker);
video.removeEventListener('ended',onEnded);
signal?.removeEventListener('abort',onAbort);
fn(value);
};
const onEnded=()=>done(resolve);
const onAbort=()=>done(reject,aborted());
let presented=0;
let byCallback=typeof video.requestVideoFrameCallback==='function';
const pump=()=>{
if(settled)return;
presented++;
if(video.currentTime>=range.end){done(resolve);return;}
draw();
if(video.ended)done(resolve);
else if(byCallback)video.requestVideoFrameCallback(pump);
};
if(byCallback)video.requestVideoFrameCallback(pump);
const interval=Math.max(10,1000/Math.max(1,fps));
const startedAt=performance.now();
let lastTime=-1;
let stalled=0;
const ticker=setInterval(()=>{
if(settled)return;
if(video.currentTime>=range.end){done(resolve);return;}
if(byCallback&&presented===0&&performance.now()-startedAt>700){
byCallback=false;
}
if(!byCallback)draw();
const now=video.currentTime;
if(now===lastTime)stalled+=interval;
else{stalled=0;lastTime=now;}
const atEnd=Number.isFinite(video.duration)&&video.duration>0
&&now>=video.duration-0.05;
if(video.ended
||(video.paused&&now>0)
||(atEnd&&stalled>400)
||stalled>3000)done(resolve);
},interval);
video.addEventListener('ended',onEnded);
signal?.addEventListener('abort',onAbort);
});
video.pause();
recorder.stop();
await finished;
return{
blob:new Blob(parts,{type:mimeType}),
extension:mimeType.includes('webm')?'webm':'mp4',
codec:mimeType,
exact:true,
preRoll:0,
warning:[
wentHidden?'warn.hidden':null,
audioMissing&&keepAudio?'warn.nosound':null,
].filter(Boolean),
};
}catch(error){
if(recorder&&recorder.state!=='inactive')recorder.stop();
throw error;
}finally{
document.removeEventListener('visibilitychange',onVisibility);
teardown();
}
}
