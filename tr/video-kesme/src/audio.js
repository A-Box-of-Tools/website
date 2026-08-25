/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const TARGET_BITRATE=160_000;
const AAC_CODEC='mp4a.40.2';
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
throw new Error('Internal error: the audio description is larger than expected.');
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
throw new Error('The sound was decoded but nothing came back from the encoder.');
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
