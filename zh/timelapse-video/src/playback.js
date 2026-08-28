/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{drawScaled,frameCanvas}from'./draw.js';
const SEEK_TIMEOUT=10_000;
class AbortedError extends Error{
constructor(){
super('Cancelled.');
this.name='AbortError';
}
}
const said=(key,values={})=>Object.assign(new Error(key),{values});
const MEDIA_ERRORS={
1:'media.aborted',
2:'media.notread',
3:'media.nodecode',
4:'media.unsupported',
};
function playerDied(video,done,total){
return said('play.died',{
done,
total,
why:{key:MEDIA_ERRORS[video.error?.code]??'media.stopped',values:{}},
});
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
const failure=new Error('play.seekfailed');
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
