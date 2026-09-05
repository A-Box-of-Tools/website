/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{audioDecoderConfig,mp4aSampleEntry}from'./shared/aac.js?v=6ce570d903';
export{audioDecoderConfig,mp4aSampleEntry};
const TARGET_BITRATE=160_000;
const AAC_CODEC='mp4a.40.2';
export async function canReEncodeAudio({sampleRate,numberOfChannels}){
if(typeof window==='undefined')return false;
if(typeof window.AudioEncoder!=='function'||typeof window.AudioDecoder!=='function'){
return false;
}
try{
const{supported}=await AudioEncoder.isConfigSupported({
codec:AAC_CODEC,
sampleRate,
numberOfChannels,
bitrate:TARGET_BITRATE,
});
return Boolean(supported);
}catch{
return false;
}
}
export function targetAudioFormat(clips){
let sampleRate=0;
let numberOfChannels=0;
for(const clip of clips){
const audio=clip.media?.audio;
if(!audio?.samples.length)continue;
sampleRate=Math.max(sampleRate,Math.round(audio.sampleRate));
numberOfChannels=Math.max(numberOfChannels,audio.channels);
}
return{
sampleRate:Math.min(48000,sampleRate||48000),
numberOfChannels:Math.min(2,numberOfChannels||2),
};
}
async function decodeSections({file,media,plans,config,signal}){
const track=media.audio;
const chunks=[];
let failure=null;
const decoder=new AudioDecoder({
output:(data)=>{
try{
const planes=[];
const count=data.numberOfFrames;
for(let channel=0;channel<data.numberOfChannels;channel++){
const plane=new Float32Array(count);
data.copyTo(plane,{planeIndex:channel,format:'f32-planar'});
planes.push(plane);
}
chunks.push({planes,timestamp:data.timestamp,count});
}catch(error){
failure??=error;
}finally{
data.close();
}
},
error:(error)=>{failure??=error;},
});
decoder.configure(config);
const wanted=[];
try{
for(const plan of plans){
if(!plan.audio)continue;
const first=chunks.length;
for(let i=plan.audio.from;i<=plan.audio.to;i++){
if(signal?.aborted)throw Object.assign(new Error('Cancelled.'),{name:'AbortError'});
if(failure)throw failure;
const sample=track.samples[i];
const data=new Uint8Array(
await file.slice(sample.offset,sample.offset+sample.size).arrayBuffer());
decoder.decode(new EncodedAudioChunk({
type:'key',
timestamp:Math.round(sample.dts/track.timescale*1_000_000),
data,
}));
}
await decoder.flush();
if(failure)throw failure;
const decoded=chunks.slice(first);
const startedAt=decoded.length?decoded[0].timestamp/1_000_000:plan.start;
const skip=Math.max(0,Math.round((plan.start-startedAt)*config.sampleRate));
const length=Math.max(0,Math.round((plan.end-plan.start)*config.sampleRate));
wanted.push({decoded,skip,length});
}
}finally{
if(decoder.state!=='closed')decoder.close();
}
const total=wanted.reduce((sum,section)=>sum+section.length,0);
const channels=[];
for(let c=0;c<config.numberOfChannels;c++)channels.push(new Float32Array(total));
let at=0;
for(const section of wanted){
let seen=0;
let written=0;
for(const chunk of section.decoded){
for(let i=0;i<chunk.count&&written<section.length;i++){
if(seen+i<section.skip)continue;
for(let c=0;c<channels.length;c++){
const plane=chunk.planes[Math.min(c,chunk.planes.length-1)];
channels[c][at+written]=plane?plane[i]:0;
}
written++;
}
seen+=chunk.count;
if(written>=section.length)break;
}
at+=section.length;
}
return{channels,sampleRate:config.sampleRate};
}
async function resample(channels,from,to){
if(from===to||!channels[0]?.length)return channels;
const length=Math.max(1,Math.round(channels[0].length*to/from));
const context=new OfflineAudioContext(channels.length,length,to);
const buffer=context.createBuffer(channels.length,channels[0].length,from);
for(let c=0;c<channels.length;c++)buffer.copyToChannel(channels[c],c);
const source=context.createBufferSource();
source.buffer=buffer;
source.connect(context.destination);
source.start();
const rendered=await context.startRendering();
const out=[];
for(let c=0;c<channels.length;c++)out.push(rendered.getChannelData(c).slice());
return out;
}
export async function encodeJoinedAudio({
clips,format,onProgress,signal,
}){
const{sampleRate,numberOfChannels}=format;
if(!await canReEncodeAudio(format))return null;
const encoded=[];
let asc=null;
let failure=null;
const encoder=new AudioEncoder({
output:(chunk,metadata)=>{
try{
if(!asc&&metadata?.decoderConfig?.description){
const description=metadata.decoderConfig.description;
asc=description instanceof Uint8Array
?new Uint8Array(description)
:new Uint8Array(description instanceof ArrayBuffer
?description
:description.buffer.slice(
description.byteOffset,description.byteOffset+description.byteLength));
}
const data=new Uint8Array(chunk.byteLength);
chunk.copyTo(data);
encoded.push({data,timestamp:chunk.timestamp,duration:chunk.duration});
}catch(error){
failure??=error;
}
},
error:(error)=>{failure??=error;},
});
encoder.configure({
codec:AAC_CODEC,sampleRate,numberOfChannels,bitrate:TARGET_BITRATE,
});
let at=0;
try{
for(let index=0;index<clips.length;index++){
const clip=clips[index];
if(signal?.aborted)throw Object.assign(new Error('Cancelled.'),{name:'AbortError'});
if(failure)throw failure;
onProgress?.({phase:'sound',done:index,total:clips.length});
const seconds=clip.plans.reduce((sum,plan)=>sum+(plan.end-plan.start),0);
let channels;
const config=clip.media.audio&&clip.media.audio.samples.length
?audioDecoderConfig(clip.media.audio)
:null;
if(config){
const decoded=await decodeSections({
file:clip.file,media:clip.media,plans:clip.plans,config,signal,
});
channels=await resample(decoded.channels,decoded.sampleRate,sampleRate);
}else{
const length=Math.max(0,Math.round(seconds*sampleRate));
channels=[];
for(let c=0;c<numberOfChannels;c++)channels.push(new Float32Array(length));
}
while(channels.length<numberOfChannels)channels.push(channels[0]);
const length=channels[0].length;
const step=1024;
for(let offset=0;offset<length;offset+=step){
if(failure)throw failure;
const count=Math.min(step,length-offset);
const interleaved=new Float32Array(count*numberOfChannels);
for(let c=0;c<numberOfChannels;c++){
const plane=channels[c];
for(let i=0;i<count;i++)interleaved[i*numberOfChannels+c]=plane[offset+i];
}
const data=new AudioData({
format:'f32',
sampleRate,
numberOfFrames:count,
numberOfChannels,
timestamp:Math.round((at+offset)/sampleRate*1_000_000),
data:interleaved,
});
try{
encoder.encode(data);
}finally{
data.close();
}
}
at+=length;
}
await encoder.flush();
if(failure)throw failure;
if(!encoded.length||!asc){
throw new Error('audio.noencode');
}
}finally{
if(encoder.state!=='closed')encoder.close();
}
const samples=encoded.map((chunk,index)=>{
const next=encoded[index+1];
const start=Math.round(chunk.timestamp/1_000_000*sampleRate);
const end=next
?Math.round(next.timestamp/1_000_000*sampleRate)
:start+Math.round((chunk.duration??21_333)/1_000_000*sampleRate);
return{data:chunk.data,dts:start,duration:Math.max(1,end-start)};
});
return{
sampleEntry:mp4aSampleEntry({channels:numberOfChannels,sampleRate,asc}),
timescale:sampleRate,
samples,
};
}
