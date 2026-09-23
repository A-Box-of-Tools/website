/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{FileWindow}from'./mp4-reader.js?v=dbc6801bc3';
import{avcSampleEntry}from'./mp4-writer.js?v=dbc6801bc3';
import{drawScaled,frameCanvas}from'./frame-canvas.js?v=dbc6801bc3';
import{pickH264Codec}from'./video-support.js?v=dbc6801bc3';
import{decoderConfig,micros,settle}from'./webcodecs.js?v=dbc6801bc3';
import{throwIfAborted}from'./errors.js?v=dbc6801bc3';
export const VIDEO_TIMESCALE=90000;
const KEYFRAME_SECONDS=2;
const STALL_MS=30_000;
export async function reencodeVideo({
file,video,frame,bitrate,fps,onProgress,signal,
}){
const framerate=Math.max(1,Math.round(fps));
const codec=await pickH264Codec({
width:frame.width,height:frame.height,framerate,bitrate,
});
if(!codec){
const refused=new Error('encode.toobig');
refused.values={size:frame.width+'x'+frame.height};
throw refused;
}
onProgress?.({phase:'preparing',done:0,total:1});
const{ctx}=frameCanvas(frame.width,frame.height);
const canvas=ctx.canvas;
const encoded=[];
let avcC=null;
let failure=null;
let drawn=0;
let lastKeyframeUs=-Infinity;
const encoder=new VideoEncoder({
output:(chunk,metadata)=>{
try{
if(!avcC&&metadata?.decoderConfig?.description){
avcC=bytesOf(metadata.decoderConfig.description);
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
framerate,
bitrateMode:'constant',
avc:{format:'avc'},
alpha:'discard',
latencyMode:'quality',
});
const onFrame=(videoFrame)=>{
try{
if(failure)return;
drawScaled(ctx,videoFrame,{
rotation:video.rotation,
displayWidth:video.displayWidth,
displayHeight:video.displayHeight,
width:frame.width,
height:frame.height,
});
const{timestamp}=videoFrame;
const keyFrame=timestamp-lastKeyframeUs>=KEYFRAME_SECONDS*1_000_000;
if(keyFrame)lastKeyframeUs=timestamp;
const picture=new VideoFrame(canvas,{
timestamp,
duration:videoFrame.duration??undefined,
});
try{
encoder.encode(picture,{keyFrame});
}finally{
picture.close();
}
drawn+=1;
}catch(error){
failure??=error;
}finally{
videoFrame.close();
}
};
const decoder=new VideoDecoder({
output:onFrame,
error:(error)=>{failure??=error;},
});
decoder.configure(decoderConfig(video));
const window=new FileWindow(file);
const total=video.samples.length;
try{
for(let i=0;i<total;i+=1){
throwIfAborted(signal);
if(failure)throw failure;
await settle([decoder,encoder],{stallAfter:STALL_MS,stallKey:'stall.both'});
const sample=video.samples[i];
const data=await window.read(sample.offset,sample.size);
decoder.decode(new EncodedVideoChunk({
type:sample.isKey?'key':'delta',
timestamp:micros(sample.pts,video.timescale),
data,
}));
if(i%10===0||i===total-1){
onProgress?.({phase:'encoding',done:drawn,total});
}
}
await decoder.flush();
if(failure)throw failure;
onProgress?.({phase:'finishing',done:drawn,total});
await encoder.flush();
if(failure)throw failure;
if(!encoded.length)throw new Error('decode.none');
if(!avcC)throw new Error('encode.noconfig');
}finally{
if(decoder.state!=='closed')decoder.close();
if(encoder.state!=='closed')encoder.close();
}
encoded.sort((a,b)=>a.time-b.time);
const tail=Math.max(1,Math.round(VIDEO_TIMESCALE/framerate));
const samples=closeDurations(encoded.map((chunk)=>({
data:chunk.data,isKey:chunk.isKey,dts:chunk.time,pts:chunk.time,tailDuration:tail,
})));
return{
samples,
sampleEntry:avcSampleEntry(frame.width,frame.height,avcC),
codec,
frames:encoded.length,
};
}
export function closeDurations(samples){
for(let i=0;i<samples.length;i+=1){
const next=samples[i+1];
samples[i].duration=next
?Math.max(1,next.dts-samples[i].dts)
:Math.max(1,samples[i].tailDuration);
}
return samples;
}
export function bytesOf(description){
if(description instanceof Uint8Array)return description;
if(description instanceof ArrayBuffer)return new Uint8Array(description);
return new Uint8Array(description.buffer.slice(
description.byteOffset,description.byteOffset+description.byteLength));
}
