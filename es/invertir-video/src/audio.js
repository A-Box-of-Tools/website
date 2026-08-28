/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const TARGET_BITRATE=160_000;
const AAC_CODEC='mp4a.40.2';
const ENCODE_STEP=1024;
function descriptorLength(view,at){
let value=0;
let next=at;
for(let i=0;i<4;i++){
const byte=view.getUint8(next);
next++;
value=(value<<7)|(byte&0x7f);
if(!(byte&0x80))break;
}
return{value,next};
}
function fourcc(view,at){
return String.fromCharCode(
view.getUint8(at),view.getUint8(at+1),view.getUint8(at+2),view.getUint8(at+3));
}
function objectType(asc){
if(!asc.length)return 2;
const top=asc[0]>>3;
if(top!==31)return top;
if(asc.length<2)return 2;
return 32+(((asc[0]&0x7)<<3)|(asc[1]>>5));
}
export function audioDecoderConfig(track){
if(!track?.sampleEntry||track.entryType!=='mp4a')return null;
const entry=track.sampleEntry;
const view=new DataView(entry.buffer,entry.byteOffset,entry.byteLength);
let at=8+28;
let esds=null;
while(at+8<=entry.byteLength){
const size=view.getUint32(at);
if(size<8||at+size>entry.byteLength)break;
if(fourcc(view,at+4)==='esds'){
esds={body:at+8,end:at+size};
break;
}
at+=size;
}
if(!esds)return null;
try{
let read=esds.body+4;
if(view.getUint8(read)!==0x03)return null;
read=descriptorLength(view,read+1).next;
read+=2;
const flags=view.getUint8(read);
read+=1;
if(flags&0x80)read+=2;
if(flags&0x40)read+=1+view.getUint8(read);
if(flags&0x20)read+=2;
if(view.getUint8(read)!==0x04)return null;
read=descriptorLength(view,read+1).next;
const indication=view.getUint8(read);
if(indication!==0x40)return null;
read+=1+1+3+4+4;
if(view.getUint8(read)!==0x05)return null;
const length=descriptorLength(view,read+1);
const asc=new Uint8Array(
entry.buffer.slice(
entry.byteOffset+length.next,entry.byteOffset+length.next+length.value));
if(!asc.length)return null;
return{
codec:`mp4a.40.${objectType(asc)}`,
description:asc,
sampleRate:Math.round(track.sampleRate),
numberOfChannels:track.channels,
};
}catch{
return null;
}
}
function bytes(...values){
return new Uint8Array(values);
}
function concat(parts){
let length=0;
for(const part of parts)length+=part.byteLength;
const out=new Uint8Array(length);
let at=0;
for(const part of parts){
out.set(part,at);
at+=part.byteLength;
}
return out;
}
function u16(n){
return bytes((n>>8)&0xff,n&0xff);
}
function u32(n){
return bytes((n>>>24)&0xff,(n>>>16)&0xff,(n>>>8)&0xff,n&0xff);
}
function box(type,...payload){
const body=concat(payload);
const header=concat([u32(body.byteLength+8),bytes(
type.charCodeAt(0),type.charCodeAt(1),type.charCodeAt(2),type.charCodeAt(3))]);
return concat([header,body]);
}
function descriptor(tag,...payload){
const body=concat(payload);
if(body.byteLength>0x7f){
throw new Error('audio.descriptor');
}
return concat([bytes(tag,body.byteLength),body]);
}
export function mp4aSampleEntry({channels,sampleRate,asc,bitrate=TARGET_BITRATE}){
const esds=box('esds',u32(0),
descriptor(0x03,
u16(1),
bytes(0x00),
descriptor(0x04,
bytes(0x40),
bytes(0x15),
bytes(0,0,0),
u32(bitrate),
u32(bitrate),
descriptor(0x05,asc),
),
descriptor(0x06,bytes(0x02)),
),
);
return box('mp4a',
new Uint8Array(6),
u16(1),
new Uint8Array(8),
u16(channels),
u16(16),
u16(0),
u16(0),
u32(sampleRate<<16),
esds,
);
}
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
