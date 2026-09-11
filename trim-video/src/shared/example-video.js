/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{drawPhoto}from'./example-photo.js?v=2edd1cacc6';
import{pickH264Codec}from'./video-support.js?v=2edd1cacc6';
import{Mp4Muxer}from'./mp4-muxer.js?v=2edd1cacc6';
const BREATH=24;
function turn(){
return new Promise((settle)=>{
const channel=new MessageChannel();
channel.port1.onmessage=()=>{channel.port1.close();settle();};
channel.port2.postMessage(0);
});
}
const PAN=6;
export function clipPainter(width,height,total,fps){
const wide=document.createElement('canvas');
wide.width=width+PAN*Math.max(1,total);
wide.height=height;
drawPhoto(wide.getContext('2d',{willReadFrequently:true}),wide.width,height);
return(ctx,index)=>{
ctx.drawImage(wide,index*PAN,0,width,height,0,0,width,height);
drawMarks(ctx,width,height,index,total,fps);
};
}
function drawMarks(ctx,width,height,index,total,fps){
const done=index/Math.max(1,total-1);
const barHeight=Math.max(4,Math.round(height*0.018));
const barY=height-barHeight*3;
ctx.fillStyle='rgba(0,0,0,0.45)';
ctx.fillRect(0,barY,width,barHeight);
ctx.fillStyle='#f2b134';
ctx.fillRect(0,barY,Math.round(width*done),barHeight);
const second=Math.floor(index/fps);
const seconds=Math.max(1,Math.ceil(total/fps));
const pitch=width/(seconds+1);
const r=Math.max(6,Math.round(height*0.022));
for(let s=0;s<seconds;s+=1){
ctx.beginPath();
ctx.arc(pitch*(s+1),barY-r*2.2,r,0,Math.PI*2);
ctx.fillStyle=s===second?'#ffffff':'rgba(255,255,255,0.28)';
ctx.fill();
}
}
export async function exampleVideoFile(name,{
width=960,height=540,fps=25,seconds=6,
}={}){
if(typeof VideoEncoder!=='function'||typeof VideoFrame!=='function'){
throw new Error('example.nowebcodecs');
}
const total=Math.max(1,Math.round(fps*seconds));
const bitrate=Math.round(width*height*fps*0.12);
const codec=await pickH264Codec({width,height,framerate:fps,bitrate});
if(!codec)throw new Error('example.noh264');
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
const ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:true});
const paint=clipPainter(width,height,total,fps);
const muxer=new Mp4Muxer({width,height});
let failure=null;
const encoder=new VideoEncoder({
output:(chunk,metadata)=>{
try{
if(metadata?.decoderConfig?.description){
muxer.setDecoderConfig(metadata.decoderConfig.description);
}
const data=new Uint8Array(chunk.byteLength);
chunk.copyTo(data);
muxer.addSample(data,chunk.type==='key',1/fps);
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
framerate:fps,
avc:{format:'avc'},
alpha:'discard',
latencyMode:'quality',
});
const frameDurationUs=1_000_000/fps;
try{
for(let i=0;i<total;i+=1){
if(failure)throw failure;
paint(ctx,i);
const frame=new VideoFrame(canvas,{
timestamp:Math.round(i*frameDurationUs),
duration:Math.round(frameDurationUs),
});
try{
encoder.encode(frame,{keyFrame:i%fps===0});
}finally{
frame.close();
}
while(encoder.encodeQueueSize>BREATH)await turn();
}
await encoder.flush();
if(failure)throw failure;
const blob=muxer.finalize();
return new File([blob],name,{type:'video/mp4',lastModified:Date.now()});
}finally{
if(encoder.state!=='closed')encoder.close();
}
}
