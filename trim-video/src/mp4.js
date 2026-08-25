/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const MOVIE_TIMESCALE=1000;
const CHUNK_SECONDS=1;
function ascii(text){
const out=new Uint8Array(text.length);
for(let i=0;i<text.length;i++)out[i]=text.charCodeAt(i);
return out;
}
function u16(n){
return new Uint8Array([(n>>8)&0xff,n&0xff]);
}
function u32(n){
return new Uint8Array([(n>>>24)&0xff,(n>>>16)&0xff,(n>>>8)&0xff,n&0xff]);
}
function i32(n){
return u32(n|0);
}
function zeros(n){
return new Uint8Array(n);
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
function box(type,...payload){
const body=concat(payload);
return concat([u32(body.byteLength+8),ascii(type),body]);
}
function fullBox(type,version,flags,...payload){
const header=new Uint8Array([
version,(flags>>16)&0xff,(flags>>8)&0xff,flags&0xff,
]);
return box(type,header,...payload);
}
const UNITY_MATRIX=concat([
u32(0x00010000),u32(0),u32(0),
u32(0),u32(0x00010000),u32(0),
u32(0),u32(0),u32(0x40000000),
]);
function ftyp(){
return box('ftyp',ascii('isom'),u32(0x200),
ascii('isom'),ascii('iso2'),ascii('avc1'),ascii('mp41'));
}
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
function tkhd(id,durationMs,track){
const isAudio=track.kind==='soun';
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
track.matrix??UNITY_MATRIX,
u32(isAudio?0:track.width),
u32(isAudio?0:track.height),
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
function ctts(offsets){
const entries=[];
for(const offset of offsets){
const last=entries[entries.length-1];
if(last&&last.offset===offset)last.count++;
else entries.push({count:1,offset});
}
const signed=offsets.some((offset)=>offset<0);
const payload=[u32(entries.length)];
for(const entry of entries){
payload.push(u32(entry.count),signed?i32(entry.offset):u32(entry.offset));
}
return fullBox('ctts',signed?1:0,0,...payload);
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
function stco(offsets){
const payload=[u32(offsets.length)];
for(const offset of offsets)payload.push(u32(offset));
return fullBox('stco',0,0,...payload);
}
function elst(edits){
const payload=[u32(edits.length)];
for(const edit of edits){
payload.push(u32(edit.duration),i32(edit.mediaTime),u32(0x00010000));
}
return fullBox('elst',0,0,...payload);
}
class Track{
constructor({kind,timescale,sampleEntry,matrix=null,width=0,height=0}){
if(!sampleEntry||!sampleEntry.byteLength){
throw new Error(`The ${kind === 'soun' ? 'audio' : 'video'} track has no sample entry.`);
}
this.kind=kind;
this.timescale=timescale;
this.entry=sampleEntry;
this.matrix=matrix;
this.width=width;
this.height=height;
this.samples=[];
this.edits=[];
this.chunks=[];
}
addSample({data,isKey,dts,pts,duration}){
this.samples.push({
data,
size:data.byteLength??data.size,
isKey,
dts:Math.round(dts),
pts:Math.round(pts),
duration:Math.max(0,Math.round(duration)),
});
}
addEdit(mediaTime,durationMs){
if(durationMs<=0)return;
this.edits.push({mediaTime:Math.round(mediaTime),duration:Math.round(durationMs)});
}
get bytes(){
return this.samples.reduce((total,sample)=>total+sample.size,0);
}
get durationTs(){
return this.samples.reduce((total,sample)=>total+sample.duration,0);
}
get playedMs(){
if(!this.edits.length){
return Math.round(this.durationTs/this.timescale*MOVIE_TIMESCALE);
}
return this.edits.reduce((total,edit)=>total+edit.duration,0);
}
}
export class Mp4Writer{
constructor(){
this.tracks=[];
}
addTrack(spec){
const track=new Track(spec);
this.tracks.push(track);
return track;
}
#interleave(tracks,mdatDataOffset){
const chunks=[];
for(const track of tracks){
track.chunks=[];
let at=0;
while(at<track.samples.length){
const start=track.samples[at].dts/track.timescale;
let count=1;
while(at+count<track.samples.length
&&track.samples[at+count].dts/track.timescale-start<CHUNK_SECONDS)count++;
chunks.push({track,first:at,count,start});
at+=count;
}
}
chunks.sort((a,b)=>(a.start-b.start)
||(tracks.indexOf(a.track)-tracks.indexOf(b.track)));
let offset=mdatDataOffset;
for(const chunk of chunks){
chunk.offset=offset;
for(let i=0;i<chunk.count;i++){
offset+=chunk.track.samples[chunk.first+i].size;
}
chunk.track.chunks.push(chunk);
}
return chunks;
}
#trak(track,id){
const sizes=track.samples.map((sample)=>sample.size);
const offsets=track.samples.map((sample)=>sample.pts-sample.dts);
const keyframes=[];
track.samples.forEach((sample,index)=>{if(sample.isKey)keyframes.push(index);});
const allKeyframes=keyframes.length===track.samples.length;
const inOrder=offsets.every((offset)=>offset===0);
const isAudio=track.kind==='soun';
const stbl=box('stbl',
fullBox('stsd',0,0,u32(1),track.entry),
stts(track.samples.map((sample)=>sample.duration)),
...(inOrder?[]:[ctts(offsets)]),
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
return box('trak',
tkhd(id,track.playedMs,track),
...(track.edits.length?[box('edts',elst(track.edits))]:[]),
box('mdia',
mdhd(track.timescale,track.durationTs),
hdlr(track.kind,isAudio?'SoundHandler':'VideoHandler'),
minf,
),
);
}
finalize(){
const tracks=this.tracks.filter((track)=>track.samples.length);
if(!tracks.some((track)=>track.kind==='vide')){
throw new Error('The section you chose holds no video frames.');
}
const totalBytes=tracks.reduce((total,track)=>total+track.bytes,0);
if(totalBytes>0xfffffff0){
throw new Error('The trimmed video would pass the 4 GB limit this writer can '
+'address. Choose a shorter section.');
}
const durationMs=Math.max(...tracks.map((track)=>track.playedMs));
const build=(mdatDataOffset)=>{
const chunks=this.#interleave(tracks,mdatDataOffset);
const moov=box('moov',
mvhd(durationMs,tracks.length),
...tracks.map((track,index)=>this.#trak(track,index+1)),
);
return{moov,chunks};
};
const header=ftyp();
const probe=build(0);
const mdatDataOffset=header.byteLength+probe.moov.byteLength+8;
const{moov,chunks}=build(mdatDataOffset);
if(moov.byteLength!==probe.moov.byteLength){
throw new Error('Internal error: the moov size was not stable between passes.');
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
export function avcSampleEntry(width,height,avcC){
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
