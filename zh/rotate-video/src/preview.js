/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{FileWindow}from'./shared/mp4-reader.js?v=fee04efe77';
import{decoderConfig,micros}from'./shared/webcodecs.js?v=fee04efe77';
import{drawScaled}from'./shared/frame-canvas.js?v=fee04efe77';
const PATIENCE=60;
export async function firstFrame(file,video){
if(typeof VideoDecoder!=='function')return null;
let bitmap=null;
let failure=null;
const decoder=new VideoDecoder({
output:(frame)=>{
try{
if(!bitmap)bitmap=frame.clone();
}catch(error){
failure??=error;
}finally{
frame.close();
}
},
error:(error)=>{failure??=error;},
});
try{
decoder.configure(decoderConfig(video));
const window=new FileWindow(file);
const first=video.samples.findIndex((s)=>s.isKey);
if(first<0)return null;
const last=Math.min(video.samples.length,first+PATIENCE);
for(let i=first;i<last&&!bitmap&&!failure;i+=1){
const sample=video.samples[i];
const data=await window.read(sample.offset,sample.size);
decoder.decode(new EncodedVideoChunk({
type:sample.isKey?'key':'delta',
timestamp:micros(sample.pts,video.timescale),
data,
}));
}
await decoder.flush().catch(()=>{});
}catch{
return null;
}finally{
if(decoder.state!=='closed')decoder.close();
}
if(!bitmap)return null;
try{
const picture=await createImageBitmap(bitmap);
return picture;
}catch{
return null;
}finally{
bitmap.close();
}
}
export function drawPreview(canvas,frame,rotation,box){
const onSide=rotation===90||rotation===270;
const shownWidth=onSide?frame.height:frame.width;
const shownHeight=onSide?frame.width:frame.height;
const scale=Math.min(1,box.width/shownWidth,box.height/shownHeight);
const width=Math.max(1,Math.round(shownWidth*scale));
const height=Math.max(1,Math.round(shownHeight*scale));
canvas.width=width;
canvas.height=height;
const ctx=canvas.getContext('2d');
drawScaled(ctx,frame,{
rotation,displayWidth:shownWidth,displayHeight:shownHeight,width,height,
});
}
