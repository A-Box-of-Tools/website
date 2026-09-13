/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{FileWindow}from'./mp4-reader.js?v=fee04efe77';
import{audioDecoderConfig,mp4aSampleEntry}from'./aac.js?v=fee04efe77';
import{askSupported}from'./codec-support.js?v=fee04efe77';
import{micros,settle}from'./webcodecs.js?v=fee04efe77';
import{throwIfAborted}from'./errors.js?v=fee04efe77';
export function describeSound(audio){
if(!audio||!audio.samples.length)return null;
if(audio.sampleEntry){
const config=audioDecoderConfig(audio);
if(config){
return{
codec:config.codec,
description:config.description,
sampleRate:config.sampleRate,
channels:config.numberOfChannels,
copyable:true,
sampleEntry:audio.sampleEntry,
name:audio.entryType,
};
}
return{
codec:null,
description:null,
sampleRate:audio.sampleRate,
channels:audio.channels,
copyable:false,
sampleEntry:null,
name:audio.entryType,
};
}
return{
codec:audio.codec,
description:audio.description,
sampleRate:audio.sampleRate,
channels:audio.channels,
copyable:Boolean(audio.aac),
sampleEntry:audio.aac
?mp4aSampleEntry({channels:audio.channels,sampleRate:Math.round(audio.sampleRate),asc:audio.description})
:null,
name:audio.codecId,
};
}
export function soundJob(sound,{decodable=true}={}){
if(!sound)return'none';
if(sound.copyable)return'copy';
if(sound.codec&&decodable)return'encode';
return'unknown';
}
const AAC_CODEC='mp4a.40.2';
const AAC_BITRATE=160_000;
const AAC_FRAME=1024;
const STALL_MS=30_000;
const MAX_CHANNELS=2;
export async function canDecodeSound(sound){
if(typeof AudioDecoder!=='function'||!sound?.codec)return false;
const config={codec:sound.codec,sampleRate:sound.sampleRate,numberOfChannels:sound.channels};
if(sound.description)config.description=sound.description;
return await askSupported(AudioDecoder,config)===true;
}
export async function canEncodeAac({sampleRate,channels}){
if(typeof AudioEncoder!=='function')return false;
return await askSupported(AudioEncoder,{
codec:AAC_CODEC,sampleRate,numberOfChannels:channels,bitrate:AAC_BITRATE,
})===true;
}
function downmix(planes){
const count=planes.length;
if(count<=MAX_CHANNELS)return planes;
const frames=planes[0].length;
const left=new Float32Array(frames);
const right=new Float32Array(frames);
const side=0.7071;
for(let i=0;i<frames;i+=1){
let l=planes[0][i];
let r=planes[1][i];
if(count>2){l+=planes[2][i]*side;r+=planes[2][i]*side;}
if(count>4){l+=planes[4][i]*side;}
if(count>5){r+=planes[5][i]*side;}
for(let c=6;c<count;c+=1){
if(c%2===0)l+=planes[c][i]*side;else r+=planes[c][i]*side;
}
left[i]=l;
right[i]=r;
}
return[left,right];
}
export async function reencodeSound({file,audio,sound,onProgress,signal}){
const wanted={
sampleRate:Math.round(sound.sampleRate),
numberOfChannels:Math.min(MAX_CHANNELS,sound.channels),
};
if(!await canEncodeAac({sampleRate:wanted.sampleRate,channels:wanted.numberOfChannels})){
throw new Error('sound.noaac');
}
const encoded=[];
let asc=null;
let failure=null;
let configured={...wanted};
const encoder=new AudioEncoder({
output:(chunk,metadata)=>{
try{
if(!asc&&metadata?.decoderConfig?.description){
asc=new Uint8Array(metadata.decoderConfig.description instanceof ArrayBuffer
?metadata.decoderConfig.description
:metadata.decoderConfig.description.buffer.slice(
metadata.decoderConfig.description.byteOffset,
metadata.decoderConfig.description.byteOffset+metadata.decoderConfig.description.byteLength));
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
encoder.configure({codec:AAC_CODEC,...configured,bitrate:AAC_BITRATE});
const decoder=new AudioDecoder({
output:(data)=>{
try{
if(failure)return;
const channels=data.numberOfChannels;
const rate=data.sampleRate;
const fold=channels>MAX_CHANNELS;
if(rate!==configured.sampleRate||Math.min(channels,MAX_CHANNELS)!==configured.numberOfChannels){
configured={sampleRate:rate,numberOfChannels:Math.min(channels,MAX_CHANNELS)};
encoder.configure({codec:AAC_CODEC,...configured,bitrate:AAC_BITRATE});
}
if(!fold){
encoder.encode(data);
return;
}
const planes=[];
for(let c=0;c<channels;c+=1){
const plane=new Float32Array(data.numberOfFrames);
data.copyTo(plane,{planeIndex:c,format:'f32-planar'});
planes.push(plane);
}
const[left,right]=downmix(planes);
const stereo=new Float32Array(left.length*2);
stereo.set(left,0);
stereo.set(right,left.length);
const folded=new AudioData({
format:'f32-planar',
sampleRate:rate,
numberOfFrames:left.length,
numberOfChannels:2,
timestamp:data.timestamp,
data:stereo,
});
try{
encoder.encode(folded);
}finally{
folded.close();
}
}catch(error){
failure??=error;
}finally{
data.close();
}
},
error:(error)=>{failure??=error;},
});
const config={codec:sound.codec,sampleRate:sound.sampleRate,numberOfChannels:sound.channels};
if(sound.description)config.description=sound.description;
decoder.configure(config);
const window=new FileWindow(file);
const total=audio.samples.length;
try{
for(let i=0;i<total;i+=1){
throwIfAborted(signal);
if(failure)throw failure;
await settle([decoder,encoder],{stallAfter:STALL_MS,stallKey:'stall.sound'});
const sample=audio.samples[i];
const data=await window.read(sample.offset,sample.size);
decoder.decode(new EncodedAudioChunk({
type:'key',
timestamp:micros(sample.pts,audio.timescale),
data,
}));
if(i%50===0||i===total-1){
onProgress?.({phase:'sound',done:i+1,total});
}
}
await decoder.flush();
if(failure)throw failure;
await encoder.flush();
if(failure)throw failure;
if(!encoded.length||!asc)throw new Error('sound.noencode');
}finally{
if(decoder.state!=='closed')decoder.close();
if(encoder.state!=='closed')encoder.close();
}
const{sampleRate,numberOfChannels}=configured;
encoded.sort((a,b)=>a.timestamp-b.timestamp);
const samples=closeGaps(encoded.map((chunk)=>{
const at=Math.round(chunk.timestamp/1_000_000*sampleRate);
return{data:chunk.data,isKey:true,dts:at,pts:at};
}),AAC_FRAME);
return{
sampleEntry:mp4aSampleEntry({channels:numberOfChannels,sampleRate,asc}),
timescale:sampleRate,
samples,
start:samples[0].dts/sampleRate,
};
}
function closeGaps(samples,tail){
for(let i=0;i<samples.length;i+=1){
const next=samples[i+1];
samples[i].duration=next
?Math.max(1,next.dts-samples[i].dts)
:Math.max(1,tail);
}
return samples;
}
