/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{drawFrame}from'./compose.js';
import{decodeFull}from'./images.js';
import{pickWebmMimeType}from'./support.js';
export async function recordToWebm({items,settings,onProgress,signal}){
const{width,height,fps,fit,background,quality}=settings;
const mimeType=pickWebmMimeType();
if(!mimeType)throw new Error('This browser supports neither WebCodecs nor canvas recording.');
const bitsPerPixel={low:0.03,medium:0.07,high:0.15}[quality]??0.07;
const videoBitsPerSecond=Math.min(50_000_000,Math.round(width*height*fps*bitsPerPixel));
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
const ctx=canvas.getContext('2d',{alpha:false});
const bitmaps=new Map();
const decoding=new Map();
const prefetch=(index)=>{
if(index>=items.length||bitmaps.has(index)||decoding.has(index))return;
const promise=decodeFull(items[index])
.then((bitmap)=>{bitmaps.set(index,bitmap);})
.catch(()=>{})
.finally(()=>{decoding.delete(index);});
decoding.set(index,promise);
};
prefetch(0);
await decoding.get(0);
if(bitmaps.has(0))drawFrame(ctx,bitmaps.get(0),{fit,background});
prefetch(1);
const boundaries=[];
let clock=0;
for(const item of items){
clock+=Math.max(0.1,item.duration);
boundaries.push(clock);
}
const totalSeconds=clock;
const stream=canvas.captureStream(fps);
const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond});
const parts=[];
recorder.ondataavailable=(event)=>{if(event.data.size)parts.push(event.data);};
const finished=new Promise((resolve,reject)=>{
recorder.onstop=resolve;
recorder.onerror=(event)=>reject(event.error??new Error('Recording failed.'));
});
const cleanup=()=>{
for(const bitmap of bitmaps.values())bitmap.close();
bitmaps.clear();
for(const track of stream.getTracks())track.stop();
};
let wentHidden=document.hidden;
const onVisibility=()=>{if(document.hidden)wentHidden=true;};
document.addEventListener('visibilitychange',onVisibility);
recorder.start();
const startedAt=performance.now();
try{
await new Promise((resolve,reject)=>{
let shownIndex=0;
let settled=false;
const interval=1000/fps;
const deadline=startedAt+totalSeconds*3000+30000;
const settle=(fn,value)=>{
if(settled)return;
settled=true;
fn(value);
};
const tick=()=>{
if(settled)return;
if(signal?.aborted){
const error=new Error('Export cancelled.');
error.name='AbortError';
settle(reject,error);
return;
}
const now=performance.now();
if(now>deadline){
settle(reject,new Error(
'Recording stalled — this browser pauses canvas capture in background tabs. '
+'Keep this tab visible while the video is being created.',
));
return;
}
const elapsed=(now-startedAt)/1000;
let index=boundaries.findIndex((end)=>elapsed<end);
if(index===-1)index=items.length-1;
if(index!==shownIndex&&bitmaps.has(index)){
const previous=bitmaps.get(shownIndex);
if(previous){
previous.close();
bitmaps.delete(shownIndex);
}
shownIndex=index;
prefetch(index+1);
}
const bitmap=bitmaps.get(shownIndex);
if(bitmap)drawFrame(ctx,bitmap,{fit,background});
onProgress?.({
phase:'recording',
done:Math.min(elapsed,totalSeconds),
total:totalSeconds,
realtime:true,
});
if(elapsed>=totalSeconds)settle(resolve);
else setTimeout(tick,interval);
};
setTimeout(tick,interval);
});
recorder.stop();
await finished;
const extension=mimeType.includes('webm')?'webm':'mp4';
return{
blob:new Blob(parts,{type:mimeType}),
extension,
codec:mimeType,
warning:wentHidden
?'The tab was hidden during recording, so some frames may be missing. '
+'Re-run the export with this tab visible for a clean result.'
:null,
};
}catch(error){
if(recorder.state!=='inactive')recorder.stop();
throw error;
}finally{
document.removeEventListener('visibilitychange',onVisibility);
cleanup();
}
}
