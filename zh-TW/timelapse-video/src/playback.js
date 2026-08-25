/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{drawScaled,frameCanvas}from'./draw.js';
const SEEK_TIMEOUT=10_000;
class AbortedError extends Error{
constructor(){
super('Cancelled.');
this.name='AbortError';
}
}
const MEDIA_ERRORS={
1:'the read was aborted',
2:'the file could not be read off the disk',
3:'the browser could not decode the video in it',
4:'the browser does not support this format or codec',
};
function playerDied(video,done,total){
const why=MEDIA_ERRORS[video.error?.code]??'the browser stopped being able to read it';
return new Error(`The player stopped after ${done} of ${total} frames: ${why}. `
+'Converting the clip to an ordinary MP4 (H.264) first is the reliable fix.');
}
export async function timelapseByPlaying({
video,times,width,height,writer,onProgress,signal,
}){
const{canvas,ctx}=frameCanvas(width,height);
video.pause();
try{
for(let i=0;i<times.length;i+=1){
if(signal?.aborted)throw new AbortedError();
if(video.error)throw playerDied(video,i,times.length);
try{
await seek(video,times[i]);
}catch(error){
if(error?.name==='PlayerError')throw playerDied(video,i,times.length);
throw error;
}
drawScaled(ctx,video,{
displayWidth:video.videoWidth,
displayHeight:video.videoHeight,
width,
height,
});
writer.write(canvas);
while(writer.busy)await writer.settle();
onProgress?.({phase:'working',done:i+1,total:times.length});
}
onProgress?.({phase:'finishing',done:times.length,total:times.length});
return await writer.finish();
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
const failure=new Error('the player errored during a seek');
failure.name='PlayerError';
reject(failure);
};
const timer=setTimeout(finish,SEEK_TIMEOUT);
video.addEventListener('seeked',onSeeked,{once:true});
video.addEventListener('error',onError,{once:true});
if(Math.abs(video.currentTime-seconds)<1e-4)finish();
else video.currentTime=seconds;
});
}
