/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ascii,u16,u32,zeros,concat,box,fullBox}from'./shared/mp4-boxes.js?v=517f38ef82';
export const VIDEO_TIMESCALE=90000;
const CHUNK_SECONDS=1;
const UNITY_MATRIX=concat([
u32(0x00010000),u32(0),u32(0),
u32(0),u32(0x00010000),u32(0),
u32(0),u32(0),u32(0x40000000),
]);
function ftyp(){
return box('ftyp',ascii('isom'),u32(0x200),
ascii('isom'),ascii('iso2'),ascii('avc1'),ascii('mp41'));
}
const MOVIE_TIMESCALE=1000;
function mvhd(durationMs,trackCount){
return fullBox('mvhd',0,0,
u32(0),
u32(0),
u32(MOVIE_TIMESCALE),
u32(durationMs),
u32(0x00010000),
u16(0x0100),
zeros(2),
zeros(8),
UNITY_MATRIX,
zeros(24),
u32(trackCount+1),
);
}
function tkhd(id,durationMs,width,height,isAudio){
return fullBox('tkhd',0,0x000007,
u32(0),
u32(0),
u32(id),
zeros(4),
u32(durationMs),
zeros(8),
u16(0),
u16(0),
u16(isAudio?0x0100:0),
zeros(2),
UNITY_MATRIX,
u32(width<<16),
u32(height<<16),
);
}
function mdhd(timescale,duration){
return fullBox('mdhd',0,0,
u32(0),
u32(0),
u32(timescale),
u32(duration),
u16(0x55c4),
u16(0),
);
}
function hdlr(kind,name){
return fullBox('hdlr',0,0,
u32(0),
ascii(kind),
zeros(12),
ascii(`${name}\0`),
);
}
function dinf(){
return box('dinf',fullBox('dref',0,0,u32(1),fullBox('url ',0,1)));
}
function avc1(width,height,avcC){
const compressorName=zeros(32);
return box('avc1',
zeros(6),
u16(1),
u16(0),
u16(0),
zeros(12),
u16(width),
u16(height),
u32(0x00480000),
u32(0x00480000),
u32(0),
u16(1),
compressorName,
u16(0x0018),
u16(0xffff),
box('avcC',avcC),
);
}
function stts(durations){
const entries=[];
for(const duration of durations){
const last=entries[entries.length-1];
if(last&&last.delta===duration)last.count++;
else entries.push({count:1,delta:duration});
}
const payload=[u32(entries.length)];
for(const entry of entries)payload.push(u32(entry.count),u32(entry.delta));
return fullBox('stts',0,0,...payload);
}
function stss(indices){
const payload=[u32(indices.length)];
for(const index of indices)payload.push(u32(index+1));
return fullBox('stss',0,0,...payload);
}
function stsc(perChunk){
const entries=[];
perChunk.forEach((count,index)=>{
const last=entries[entries.length-1];
if(last&&last.count===count)return;
entries.push({first:index+1,count});
});
const payload=[u32(entries.length)];
for(const entry of entries)payload.push(u32(entry.first),u32(entry.count),u32(1));
return fullBox('stsc',0,0,...payload);
}
function stsz(sizes){
const payload=[u32(0),u32(sizes.length)];
for(const size of sizes)payload.push(u32(size));
return fullBox('stsz',0,0,...payload);
}
function elst(delayMs,durationMs){
return fullBox('elst',0,0,
u32(2),
u32(delayMs),u32(0xffffffff),u32(0x00010000),
u32(durationMs),u32(0),u32(0x00010000),
);
}
function stco(offsets){
const payload=[u32(offsets.length)];
for(const offset of offsets)payload.push(u32(offset));
return fullBox('stco',0,0,...payload);
}
class Track{
constructor(kind,timescale){
this.kind=kind;
this.timescale=timescale;
this.samples=[];
this.chunks=[];
}
get bytes(){
return this.samples.reduce((total,sample)=>total+sample.data.byteLength,0);
}
get durationTs(){
return this.samples.reduce((total,sample)=>total+sample.duration,0);
}
}
export class Mp4Writer{
constructor({width,height}){
this.width=width;
this.height=height;
this.avcC=null;
this.video=new Track('vide',VIDEO_TIMESCALE);
this.audio=null;
}
setDecoderConfig(description){
if(this.avcC)return;
if(!description)throw new Error('mp4.noconfig');
this.avcC=description instanceof Uint8Array
?description
:new Uint8Array(description instanceof ArrayBuffer
?description
:description.buffer.slice(
description.byteOffset,description.byteOffset+description.byteLength));
}
addVideoSample(data,isKey,timeTs){
this.video.samples.push({data,isKey,time:timeTs,duration:0});
}
openAudioTrack({sampleEntry,timescale}){
this.audio=new Track('soun',timescale);
this.audio.entry=sampleEntry;
}
addAudioSample(data,timeTs,durationTs){
this.audio.samples.push({data,isKey:true,time:timeTs,duration:durationTs});
}
#closeVideoDurations(){
const samples=this.video.samples;
if(!samples.length)return;
samples.sort((a,b)=>a.time-b.time);
for(let i=0;i<samples.length-1;i++){
samples[i].duration=Math.max(1,Math.round(samples[i+1].time-samples[i].time));
}
const last=samples[samples.length-1];
last.duration=samples.length>1
?samples[samples.length-2].duration
:Math.round(VIDEO_TIMESCALE/30);
}
#interleave(tracks,mdatDataOffset){
const chunks=[];
for(const track of tracks){
track.chunks=[];
let at=0;
while(at<track.samples.length){
const start=track.samples[at].time/track.timescale;
let count=1;
while(at+count<track.samples.length
&&track.samples[at+count].time/track.timescale-start<CHUNK_SECONDS)count++;
chunks.push({track,first:at,count,start});
at+=count;
}
}
chunks.sort((a,b)=>(a.start-b.start)||(tracks.indexOf(a.track)-tracks.indexOf(b.track)));
let offset=mdatDataOffset;
for(const chunk of chunks){
chunk.offset=offset;
for(let i=0;i<chunk.count;i++){
offset+=chunk.track.samples[chunk.first+i].data.byteLength;
}
chunk.track.chunks.push(chunk);
}
return chunks;
}
#trak(track,id,origin){
const sizes=track.samples.map((sample)=>sample.data.byteLength);
const keyframes=[];
track.samples.forEach((sample,index)=>{if(sample.isKey)keyframes.push(index);});
const allKeyframes=keyframes.length===track.samples.length;
const isAudio=track.kind==='soun';
const entry=isAudio?track.entry:avc1(this.width,this.height,this.avcC);
const stbl=box('stbl',
fullBox('stsd',0,0,u32(1),entry),
stts(track.samples.map((sample)=>sample.duration)),
...(allKeyframes?[]:[stss(keyframes)]),
stsc(track.chunks.map((chunk)=>chunk.count)),
stsz(sizes),
stco(track.chunks.map((chunk)=>chunk.offset)),
);
const minf=box('minf',
isAudio
?fullBox('smhd',0,0,u16(0),u16(0))
:fullBox('vmhd',0,1,u16(0),zeros(6)),
dinf(),
stbl,
);
const durationTs=track.durationTs;
const durationMs=Math.round(durationTs/track.timescale*MOVIE_TIMESCALE);
const delayMs=Math.round(
Math.max(0,track.samples[0].time/track.timescale-origin)*MOVIE_TIMESCALE);
return box('trak',
tkhd(id,durationMs+delayMs,isAudio?0:this.width,isAudio?0:this.height,isAudio),
...(delayMs>0?[box('edts',elst(delayMs,durationMs))]:[]),
box('mdia',
mdhd(track.timescale,durationTs),
hdlr(track.kind,isAudio?'SoundHandler':'VideoHandler'),
minf,
),
);
}
finalize(){
if(!this.video.samples.length)throw new Error('mp4.noframes');
if(!this.avcC)throw new Error('mp4.noconfig');
this.#closeVideoDurations();
const tracks=this.audio&&this.audio.samples.length?[this.video,this.audio]:[this.video];
const totalBytes=tracks.reduce((total,track)=>total+track.bytes,0);
if(totalBytes>0xfffffff0){
throw new Error('mp4.toobig');
}
const origin=Math.min(...tracks.map((track)=>track.samples[0].time/track.timescale));
const durationMs=Math.max(...tracks.map((track)=>Math.round(
(track.durationTs/track.timescale
+track.samples[0].time/track.timescale-origin)*MOVIE_TIMESCALE)));
const build=(mdatDataOffset)=>{
const chunks=this.#interleave(tracks,mdatDataOffset);
const moov=box('moov',
mvhd(durationMs,tracks.length),
...tracks.map((track,index)=>this.#trak(track,index+1,origin)),
);
return{moov,chunks};
};
const header=ftyp();
const probe=build(0);
const mdatDataOffset=header.byteLength+probe.moov.byteLength+8;
const{moov,chunks}=build(mdatDataOffset);
if(moov.byteLength!==probe.moov.byteLength){
throw new Error('mp4.unstable');
}
const mdatHeader=concat([u32(totalBytes+8),ascii('mdat')]);
const parts=[header,moov,mdatHeader];
for(const chunk of chunks){
for(let i=0;i<chunk.count;i++){
parts.push(chunk.track.samples[chunk.first+i].data);
}
}
return new Blob(parts,{type:'video/mp4'});
}
}
