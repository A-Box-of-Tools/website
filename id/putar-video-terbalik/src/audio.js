/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{audioDecoderConfig,mp4aSampleEntry}from'./shared/aac.js?v=710dc5c362';
export{audioDecoderConfig,mp4aSampleEntry};
const TARGET_BITRATE=160_000;
const AAC_CODEC='mp4a.40.2';
const ENCODE_STEP=1024;
export function reverseChannels(channels){
for(const samples of channels){
for(let i=0,j=samples.length-1;i<j;i++,j--){
const held=samples[i];
samples[i]=samples[j];
samples[j]=held;
}
}
return channels;
}
export async function canEncodeAudio({sampleRate,numberOfChannels}){
if(typeof window==='undefined'||typeof window.AudioEncoder!=='function')return false;
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
export async function decodeTrack({file,track,config,onProgress,signal}){
const pieces=[];
let frames=0;
let failure=null;
const decoder=new AudioDecoder({
output:(data)=>{
try{
const planes=[];
for(let channel=0;channel<data.numberOfChannels;channel++){
const plane=new Float32Array(data.numberOfFrames);
data.copyTo(plane,{planeIndex:channel,format:'f32-planar'});
planes.push(plane);
}
pieces.push(planes);
frames+=data.numberOfFrames;
}catch(error){
failure??=error;
}finally{
data.close();
}
},
error:(error)=>{failure??=error;},
});
decoder.configure(config);
try{
for(let i=0;i<track.samples.length;i++){
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
if(i%200===0)onProgress?.({done:i,total:track.samples.length});
}
await decoder.flush();
if(failure)throw failure;
}finally{
if(decoder.state!=='closed')decoder.close();
}
const count=Math.max(1,pieces[0]?.length??config.numberOfChannels);
const channels=[];
for(let c=0;c<count;c++)channels.push(new Float32Array(frames));
let at=0;
for(const planes of pieces){
const length=planes[0]?.length??0;
for(let c=0;c<count;c++)channels[c].set(planes[Math.min(c,planes.length-1)],at);
at+=length;
}
return{channels,sampleRate:config.sampleRate};
}
export async function decodeWholeFile(file,sampleRate=48000){
const bytes=await file.arrayBuffer();
const context=new OfflineAudioContext(1,1,sampleRate);
const audio=await context.decodeAudioData(bytes);
const channels=[];
for(let c=0;c<audio.numberOfChannels;c++)channels.push(audio.getChannelData(c));
if(!channels.length||!channels[0].length){
throw new Error('audio.nosound');
}
return{channels,sampleRate:audio.sampleRate};
}
export async function encodeAudioTrack({channels,sampleRate,onProgress,signal}){
const numberOfChannels=Math.min(2,Math.max(1,channels.length));
const length=channels[0]?.length??0;
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
try{
for(let offset=0;offset<length;offset+=ENCODE_STEP){
if(signal?.aborted)throw Object.assign(new Error('Cancelled.'),{name:'AbortError'});
if(failure)throw failure;
const count=Math.min(ENCODE_STEP,length-offset);
const interleaved=new Float32Array(count*numberOfChannels);
for(let c=0;c<numberOfChannels;c++){
const plane=channels[Math.min(c,channels.length-1)];
for(let i=0;i<count;i++)interleaved[i*numberOfChannels+c]=plane[offset+i];
}
const data=new AudioData({
format:'f32',
sampleRate,
numberOfFrames:count,
numberOfChannels,
timestamp:Math.round(offset/sampleRate*1_000_000),
data:interleaved,
});
try{
encoder.encode(data);
}finally{
data.close();
}
if((offset/ENCODE_STEP)%200===0)onProgress?.({done:offset,total:length});
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
export async function reversedAudioTrack({
file,audio,maxDecodeBytes=800<<20,onProgress,signal,
}){
const config=audio?audioDecoderConfig(audio):null;
const canDecodeTrack=Boolean(config)&&typeof window.AudioDecoder==='function';
const sampleRate=config?config.sampleRate:48000;
let decoded;
if(canDecodeTrack){
onProgress?.({phase:'sound-reading',done:0,total:1});
decoded=await decodeTrack({file,track:audio,config,signal});
}else{
if(file.size>maxDecodeBytes){
return{
track:null,
note:'audio.toolarge',
};
}
onProgress?.({phase:'sound-reading',done:0,total:1});
try{
decoded=await decodeWholeFile(file,sampleRate);
}catch{
return{
track:null,
note:'audio.unreadable',
};
}
}
if(!decoded.channels.length||!decoded.channels[0].length){
return{track:null,note:null};
}
if(!await canEncodeAudio({
sampleRate:decoded.sampleRate,
numberOfChannels:Math.min(2,decoded.channels.length),
})){
return{
track:null,
note:'audio.noaac',
};
}
reverseChannels(decoded.channels);
onProgress?.({phase:'sound-writing',done:0,total:1});
const track=await encodeAudioTrack({
channels:decoded.channels,
sampleRate:decoded.sampleRate,
onProgress:(progress)=>onProgress?.({phase:'sound-writing',...progress}),
signal,
});
return{track,note:null};
}
