/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{Mp4Muxer}from'./shared/mp4-muxer.js';
import{drawFrame}from'./compose.js';
import{decodeFull}from'./images.js';
import{pickH264Codec}from'./support.js';
import{settle}from'./shared/webcodecs.js';
import{throwIfAborted}from'./shared/errors.js';
const QUALITY_BPP={low:0.03,medium:0.07,high:0.15};
const MAX_BITRATE=50_000_000;
export function countFrames(items,fps){
return items.reduce((total,item)=>total+Math.max(1,Math.round(item.duration*fps)),0);
}
export async function encodeToMp4({items,settings,onProgress,signal}){
const{width,height,fps,fit,background,quality}=settings;
const bitrate=Math.min(
MAX_BITRATE,
Math.round(width*height*fps*(QUALITY_BPP[quality]??QUALITY_BPP.medium)),
);
const codec=await pickH264Codec({width,height,framerate:fps,bitrate});
if(!codec){
throw Object.assign(new Error('encode.noh264'),{values:{width,height}});
}
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
const ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:false});
const muxer=new Mp4Muxer({width,height});
let encoderError=null;
const encoder=new VideoEncoder({
output:(chunk,metadata)=>{
try{
if(metadata?.decoderConfig?.description){
muxer.setDecoderConfig(metadata.decoderConfig.description);
}
const data=new Uint8Array(chunk.byteLength);
chunk.copyTo(data);
muxer.addSample(data,chunk.type==='key',1/fps);
}catch(err){
encoderError??=err;
}
},
error:(err)=>{encoderError??=err;},
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
const totalFrames=countFrames(items,fps);
const frameDurationUs=1_000_000/fps;
let frameIndex=0;
try{
for(const item of items){
throwIfAborted(signal);
if(encoderError)throw encoderError;
const bitmap=await decodeFull(item);
try{
drawFrame(ctx,bitmap,{fit,background});
}finally{
bitmap.close();
}
const frames=Math.max(1,Math.round(item.duration*fps));
for(let i=0;i<frames;i++){
throwIfAborted(signal);
if(encoderError)throw encoderError;
await settle([encoder]);
const frame=new VideoFrame(canvas,{
timestamp:Math.round(frameIndex*frameDurationUs),
duration:Math.round(frameDurationUs),
});
try{
encoder.encode(frame,{keyFrame:i===0});
}finally{
frame.close();
}
frameIndex++;
if(frameIndex%5===0||frameIndex===totalFrames){
onProgress?.({phase:'encoding',done:frameIndex,total:totalFrames});
}
}
}
onProgress?.({phase:'finishing',done:totalFrames,total:totalFrames});
await encoder.flush();
if(encoderError)throw encoderError;
return{blob:muxer.finalize(),extension:'mp4',codec};
}finally{
if(encoder.state!=='closed')encoder.close();
}
}
