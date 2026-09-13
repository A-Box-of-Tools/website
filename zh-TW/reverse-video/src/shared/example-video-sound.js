/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{clipPainter}from'./example-video.js?v=66e991985e';
import{exampleAudio}from'./example-audio.js?v=66e991985e';
import{Mp4Writer,avcSampleEntry}from'./mp4-writer.js?v=66e991985e';
import{mp4aSampleEntry}from'./aac.js?v=66e991985e';
import{pickH264Codec}from'./video-support.js?v=66e991985e';
const VIDEO_TIMESCALE=90000;
const AAC_FRAME=1024;
const BREATH=24;
function turn(){
return new Promise((settle)=>{
const channel=new MessageChannel();
channel.port1.onmessage=()=>{channel.port1.close();settle();};
channel.port2.postMessage(0);
});
}
async function drain(encoder,limit=BREATH){
while(encoder.encodeQueueSize>limit)await turn();
}
async function encodeVideo({width,height,fps,total}){
const bitrate=Math.round(width*height*fps*0.12);
const codec=await pickH264Codec({width,height,framerate:fps,bitrate});
if(!codec)throw new Error('example.noh264');
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
const ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:true});
const paint=clipPainter(width,height,total,fps);
const samples=[];
let description=null;
let failure=null;
const encoder=new VideoEncoder({
output:(chunk,metadata)=>{
try{
if(metadata?.decoderConfig?.description){
description??=new Uint8Array(metadata.decoderConfig.description);
}
const data=new Uint8Array(chunk.byteLength);
chunk.copyTo(data);
samples.push({data,isKey:chunk.type==='key',timestamp:chunk.timestamp});
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
await drain(encoder);
}
await encoder.flush();
if(failure)throw failure;
}finally{
if(encoder.state!=='closed')encoder.close();
}
if(!description)throw new Error('example.noavcc');
samples.sort((a,b)=>a.timestamp-b.timestamp);
return{samples,description};
}
async function encodeAudio({seconds}){
const{channels,sampleRate}=exampleAudio({bars:Math.max(1,Math.round(seconds/2))});
const count=channels.length;
const samples=[];
let description=null;
let failure=null;
const encoder=new AudioEncoder({
output:(chunk,metadata)=>{
try{
if(metadata?.decoderConfig?.description){
description??=new Uint8Array(metadata.decoderConfig.description);
}
const data=new Uint8Array(chunk.byteLength);
chunk.copyTo(data);
samples.push({data,timestamp:chunk.timestamp});
}catch(error){
failure??=error;
}
},
error:(error)=>{failure??=error;},
});
const config={
codec:'mp4a.40.2',
sampleRate,
numberOfChannels:count,
bitrate:128000,
};
const{supported}=await AudioEncoder.isConfigSupported(config);
if(!supported)throw new Error('example.noaac');
encoder.configure(config);
const frames=channels[0].length;
try{
for(let at=0;at<frames;at+=AAC_FRAME){
if(failure)throw failure;
const size=Math.min(AAC_FRAME,frames-at);
const interleaved=new Float32Array(size*count);
for(let c=0;c<count;c+=1){
const channel=channels[c];
for(let i=0;i<size;i+=1)interleaved[i*count+c]=channel[at+i];
}
const data=new AudioData({
format:'f32',
sampleRate,
numberOfFrames:size,
numberOfChannels:count,
timestamp:Math.round((at/sampleRate)*1_000_000),
data:interleaved,
});
try{
encoder.encode(data);
}finally{
data.close();
}
await drain(encoder);
}
await encoder.flush();
if(failure)throw failure;
}finally{
if(encoder.state!=='closed')encoder.close();
}
if(!description)throw new Error('example.noasc');
samples.sort((a,b)=>a.timestamp-b.timestamp);
return{samples,description,sampleRate,channels:count};
}
export async function exampleVideoWithSound(name,{
width=960,height=540,fps=25,seconds=8,
}={}){
if(typeof VideoEncoder!=='function'||typeof AudioEncoder!=='function'){
throw new Error('example.nowebcodecs');
}
const total=Math.max(1,Math.round(fps*seconds));
const video=await encodeVideo({width,height,fps,total});
const audio=await encodeAudio({seconds});
const writer=new Mp4Writer();
const videoTrack=writer.addTrack({
kind:'vide',
timescale:VIDEO_TIMESCALE,
sampleEntry:avcSampleEntry(width,height,video.description),
width:width*65536,
height:height*65536,
});
const tick=VIDEO_TIMESCALE/fps;
video.samples.forEach((sample,i)=>{
videoTrack.addSample({
data:sample.data,
isKey:sample.isKey,
dts:i*tick,
pts:i*tick,
duration:tick,
});
});
const audioTrack=writer.addTrack({
kind:'soun',
timescale:audio.sampleRate,
sampleEntry:mp4aSampleEntry({
channels:audio.channels,
sampleRate:audio.sampleRate,
asc:audio.description,
}),
});
audio.samples.forEach((sample,i)=>{
audioTrack.addSample({
data:sample.data,
isKey:true,
dts:i*AAC_FRAME,
pts:i*AAC_FRAME,
duration:AAC_FRAME,
});
});
const blob=writer.finalize();
return new File([blob],name,{type:'video/mp4',lastModified:Date.now()});
}
