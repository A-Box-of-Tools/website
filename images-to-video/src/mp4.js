/* Built from https://github.com/A-Box-of-Tools/website by build.py. Comments and indentation removed; nothing renamed. Verify with: python build.py --check */
const TIMESCALE=90000;
function ascii(s){
const out=new Uint8Array(s.length);
for(let i=0;i<s.length;i++)out[i]=s.charCodeAt(i);
return out;
}
function u16(n){
return new Uint8Array([(n>>8)&0xff,n&0xff]);
}
function u32(n){
return new Uint8Array([(n>>>24)&0xff,(n>>>16)&0xff,(n>>>8)&0xff,n&0xff]);
}
function zeros(n){
return new Uint8Array(n);
}
function concat(parts){
let length=0;
for(const p of parts)length+=p.byteLength;
const out=new Uint8Array(length);
let at=0;
for(const p of parts){
out.set(p,at);
at+=p.byteLength;
}
return out;
}
function box(type,...payload){
const body=concat(payload);
return concat([u32(body.byteLength+8),ascii(type),body]);
}
function fullBox(type,version,flags,...payload){
const header=new Uint8Array([version,(flags>>16)&0xff,(flags>>8)&0xff,flags&0xff]);
return box(type,header,...payload);
}
const UNITY_MATRIX=concat([
u32(0x00010000),u32(0),u32(0),
u32(0),u32(0x00010000),u32(0),
u32(0),u32(0),u32(0x40000000),
]);
function ftyp(){
return box('ftyp',ascii('isom'),u32(0x200),ascii('isom'),ascii('iso2'),ascii('avc1'),ascii('mp41'));
}
function mvhd(durationTs){
return fullBox('mvhd',0,0,
u32(0),
u32(0),
u32(TIMESCALE),
u32(durationTs),
u32(0x00010000),
u16(0x0100),
zeros(2),
zeros(8),
UNITY_MATRIX,
zeros(24),
u32(2),
);
}
function tkhd(durationTs,width,height){
return fullBox('tkhd',0,0x000007,
u32(0),
u32(0),
u32(1),
zeros(4),
u32(durationTs),
zeros(8),
u16(0),
u16(0),
u16(0),
zeros(2),
UNITY_MATRIX,
u32(width<<16),
u32(height<<16),
);
}
function mdhd(durationTs){
return fullBox('mdhd',0,0,
u32(0),
u32(0),
u32(TIMESCALE),
u32(durationTs),
u16(0x55c4),
u16(0),
);
}
function hdlr(){
return fullBox('hdlr',0,0,
u32(0),
ascii('vide'),
zeros(12),
ascii('VideoHandler\0'),
);
}
function dinf(){
return box('dinf',fullBox('dref',0,0,u32(1),fullBox('url ',0,1)));
}
function avc1(width,height,avcC){
const compressorName=new Uint8Array(32);
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
for(const d of durations){
const last=entries[entries.length-1];
if(last&&last.delta===d)last.count++;
else entries.push({count:1,delta:d});
}
const payload=[u32(entries.length)];
for(const e of entries)payload.push(u32(e.count),u32(e.delta));
return fullBox('stts',0,0,...payload);
}
function stss(keyframeIndices){
const payload=[u32(keyframeIndices.length)];
for(const i of keyframeIndices)payload.push(u32(i+1));
return fullBox('stss',0,0,...payload);
}
function stsc(sampleCount){
return fullBox('stsc',0,0,u32(1),u32(1),u32(sampleCount),u32(1));
}
function stsz(sizes){
const payload=[u32(0),u32(sizes.length)];
for(const s of sizes)payload.push(u32(s));
return fullBox('stsz',0,0,...payload);
}
function stco(mdatDataOffset){
return fullBox('stco',0,0,u32(1),u32(mdatDataOffset));
}
export class Mp4Muxer{
constructor({width,height}){
this.width=width;
this.height=height;
this.avcC=null;
this.samples=[];
this.totalBytes=0;
}
setDecoderConfig(description){
if(this.avcC)return;
if(!description)throw new Error('Encoder produced no decoder configuration.');
this.avcC=new Uint8Array(
description instanceof ArrayBuffer?description:description.buffer.slice(
description.byteOffset,description.byteOffset+description.byteLength,
),
);
}
addSample(data,isKey,durationSeconds){
this.samples.push({
data,
isKey,
durationTs:Math.max(1,Math.round(durationSeconds*TIMESCALE)),
});
this.totalBytes+=data.byteLength;
}
finalize(){
if(!this.samples.length)throw new Error('No frames were encoded.');
if(!this.avcC)throw new Error('Encoder never reported a decoder configuration.');
if(this.totalBytes>0xfffffff0){
throw new Error('Video exceeds the 4 GB limit. Lower the quality, resolution, or duration.');
}
const durations=this.samples.map((s)=>s.durationTs);
const sizes=this.samples.map((s)=>s.data.byteLength);
const keyframes=[];
this.samples.forEach((s,i)=>{if(s.isKey)keyframes.push(i);});
const totalDuration=durations.reduce((a,b)=>a+b,0);
const allKeyframes=keyframes.length===this.samples.length;
const buildMoov=(mdatDataOffset)=>{
const stbl=box('stbl',
fullBox('stsd',0,0,u32(1),avc1(this.width,this.height,this.avcC)),
stts(durations),
...(allKeyframes?[]:[stss(keyframes)]),
stsc(this.samples.length),
stsz(sizes),
stco(mdatDataOffset),
);
const minf=box('minf',
fullBox('vmhd',0,1,u16(0),zeros(6)),
dinf(),
stbl,
);
const mdia=box('mdia',mdhd(totalDuration),hdlr(),minf);
const trak=box('trak',tkhd(totalDuration,this.width,this.height),mdia);
return box('moov',mvhd(totalDuration),trak);
};
const header=ftyp();
const probe=buildMoov(0);
const mdatDataOffset=header.byteLength+probe.byteLength+8;
const moov=buildMoov(mdatDataOffset);
if(moov.byteLength!==probe.byteLength){
throw new Error('Internal error: moov size was not stable between passes.');
}
const mdatHeader=concat([u32(this.totalBytes+8),ascii('mdat')]);
return new Blob(
[header,moov,mdatHeader,...this.samples.map((s)=>s.data)],
{type:'video/mp4'},
);
}
}
