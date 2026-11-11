/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const ID={
EBML:0x1a45dfa3,
EBMLVersion:0x4286,
EBMLReadVersion:0x42f7,
EBMLMaxIDLength:0x42f2,
EBMLMaxSizeLength:0x42f3,
DocType:0x4282,
DocTypeVersion:0x4287,
DocTypeReadVersion:0x4285,
Segment:0x18538067,
SeekHead:0x114d9b74,
Info:0x1549a966,
TimestampScale:0x2ad7b1,
Duration:0x4489,
MuxingApp:0x4d80,
WritingApp:0x5741,
Tracks:0x1654ae6b,
TrackEntry:0xae,
TrackNumber:0xd7,
TrackUID:0x73c5,
TrackType:0x83,
FlagLacing:0x9c,
DefaultDuration:0x23e383,
CodecID:0x86,
CodecPrivate:0x63a2,
CodecDelay:0x56aa,
SeekPreRoll:0x56bb,
Video:0xe0,
PixelWidth:0xb0,
PixelHeight:0xba,
DisplayWidth:0x54b0,
DisplayHeight:0x54ba,
DisplayUnit:0x54b2,
Audio:0xe1,
SamplingFrequency:0xb5,
Channels:0x9f,
BitDepth:0x6264,
ContentEncodings:0x6d80,
Cluster:0x1f43b675,
Timestamp:0xe7,
SimpleBlock:0xa3,
BlockGroup:0xa0,
Block:0xa1,
BlockDuration:0x9b,
ReferenceBlock:0xfb,
Cues:0x1c53bb6b,
Tags:0x1254c367,
Chapters:0x1043a770,
Attachments:0x1941a469,
Void:0xec,
CRC32:0xbf,
};
const UNKNOWN_SIZE=new Uint8Array([0xff]);
const UNKNOWN_SIZE_WIDE=new Uint8Array([0x01,0xff,0xff,0xff,0xff,0xff,0xff,0xff]);
export function vint(value){
if(!Number.isInteger(value)||value<0)throw new Error('mkv.badsize');
for(let width=1;width<=8;width+=1){
const room=2**(7*width)-1;
if(value<room){
const out=new Uint8Array(width);
let rest=value;
for(let i=width-1;i>=0;i-=1){
out[i]=rest%256;
rest=Math.floor(rest/256);
}
out[0]|=0x80>>(width-1);
return out;
}
}
throw new Error('mkv.badsize');
}
export function signedVint(value){
for(let width=1;width<=8;width+=1){
const half=2**(7*width-1)-1;
if(value>=-half&&value<=half)return vint(value+half);
}
throw new Error('mkv.badsize');
}
function idBytes(id){
const out=[];
let rest=id;
while(rest>0){
out.unshift(rest%256);
rest=Math.floor(rest/256);
}
return new Uint8Array(out);
}
export function concat(parts){
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
export function element(id,payload,{unknown=false,wide=false}={}){
const body=payload instanceof Uint8Array?payload:concat(payload);
const size=unknown?(wide?UNKNOWN_SIZE_WIDE:UNKNOWN_SIZE):vint(body.byteLength);
return concat([idBytes(id),size,body]);
}
export function uint(id,value){
const out=[];
let rest=value;
do{
out.unshift(rest%256);
rest=Math.floor(rest/256);
}while(rest>0);
return element(id,new Uint8Array(out));
}
export function float(id,value){
const out=new Uint8Array(8);
new DataView(out.buffer).setFloat64(0,value);
return element(id,out);
}
export function string(id,text){
return element(id,new TextEncoder().encode(text));
}
export function binary(id,bytes){
return element(id,bytes);
}
function lace(frames,mode){
const count=frames.length;
if(count>256)throw new Error('mkv.toomanyframes');
const head=[new Uint8Array([count-1])];
if(mode==='xiph'){
for(let i=0;i<count-1;i+=1){
let size=frames[i].byteLength;
const run=[];
while(size>=255){run.push(255);size-=255;}
run.push(size);
head.push(new Uint8Array(run));
}
}else if(mode==='ebml'){
head.push(vint(frames[0].byteLength));
for(let i=1;i<count-1;i+=1){
head.push(signedVint(frames[i].byteLength-frames[i-1].byteLength));
}
}else if(mode==='fixed'){
const size=frames[0].byteLength;
if(frames.some((frame)=>frame.byteLength!==size))throw new Error('mkv.unevenframes');
}else{
throw new Error('mkv.badlacing');
}
return concat([...head,...frames]);
}
const LACING_FLAG={xiph:0x02,fixed:0x04,ebml:0x06};
const BLOCK_REACH=32767;
export class MkvWriter{
constructor({timestampScale=1_000_000,live=false,docType='webm'}={}){
this.timestampScale=timestampScale;
this.live=live;
this.docType=docType;
this.tracks=[];
this.blocks=[];
this.leading=[];
this.trailing=[];
}
addVideoTrack({
codecId,codecPrivate=null,width,height,
displayWidth=0,displayHeight=0,defaultDuration=0,extra=[],
}){
const number=this.tracks.length+1;
this.tracks.push({
number,type:1,codecId,codecPrivate,defaultDuration,extra,
video:{width,height,displayWidth,displayHeight},
});
return number;
}
addAudioTrack({
codecId,codecPrivate=null,sampleRate,channels,bitDepth=0,
defaultDuration=0,codecDelay=0,seekPreRoll=0,extra=[],
}){
const number=this.tracks.length+1;
this.tracks.push({
number,type:2,codecId,codecPrivate,defaultDuration,extra,codecDelay,seekPreRoll,
audio:{sampleRate,channels,bitDepth},
});
return number;
}
addBlock(track,{time,isKey=true,data,frames,lacing='ebml',group=null}){
let payload;
let flags=0;
if(frames){
payload=lace(frames,lacing);
flags|=LACING_FLAG[lacing];
}else{
payload=data;
}
this.blocks.push({track,time:Math.round(time),isKey,payload,flags,group});
}
#trackEntry(track){
const parts=[
uint(ID.TrackNumber,track.number),
uint(ID.TrackUID,track.number),
uint(ID.TrackType,track.type),
uint(ID.FlagLacing,1),
string(ID.CodecID,track.codecId),
];
if(track.defaultDuration)parts.push(uint(ID.DefaultDuration,track.defaultDuration));
if(track.codecDelay)parts.push(uint(ID.CodecDelay,track.codecDelay));
if(track.seekPreRoll)parts.push(uint(ID.SeekPreRoll,track.seekPreRoll));
if(track.codecPrivate)parts.push(binary(ID.CodecPrivate,track.codecPrivate));
if(track.video){
const v=track.video;
const video=[uint(ID.PixelWidth,v.width),uint(ID.PixelHeight,v.height)];
if(v.displayWidth)video.push(uint(ID.DisplayWidth,v.displayWidth));
if(v.displayHeight)video.push(uint(ID.DisplayHeight,v.displayHeight));
parts.push(element(ID.Video,video));
}
if(track.audio){
const a=track.audio;
const audio=[float(ID.SamplingFrequency,a.sampleRate),uint(ID.Channels,a.channels)];
if(a.bitDepth)audio.push(uint(ID.BitDepth,a.bitDepth));
parts.push(element(ID.Audio,audio));
}
parts.push(...track.extra);
return element(ID.TrackEntry,parts);
}
#block(block,clusterTime){
const offset=block.time-clusterTime;
const head=new Uint8Array(4);
head[0]=0x80|block.track;
head[1]=(offset>>8)&0xff;
head[2]=offset&0xff;
head[3]=block.flags|(block.group?0:(block.isKey?0x80:0));
const body=concat([head,block.payload]);
if(!block.group)return element(ID.SimpleBlock,body);
const parts=[element(ID.Block,body)];
if(block.group.duration)parts.push(uint(ID.BlockDuration,block.group.duration));
if(!block.isKey)parts.push(element(ID.ReferenceBlock,signedVintBytes(-1)));
return element(ID.BlockGroup,parts);
}
bytes(){
const header=element(ID.EBML,[
uint(ID.EBMLVersion,1),
uint(ID.EBMLReadVersion,1),
uint(ID.EBMLMaxIDLength,4),
uint(ID.EBMLMaxSizeLength,8),
string(ID.DocType,this.docType),
uint(ID.DocTypeVersion,4),
uint(ID.DocTypeReadVersion,2),
]);
let ticks=0;
for(const block of this.blocks){
const track=this.tracks[block.track-1];
const tail=track?.defaultDuration?track.defaultDuration/this.timestampScale:0;
ticks=Math.max(ticks,block.time+tail);
}
const info=[
uint(ID.TimestampScale,this.timestampScale),
string(ID.MuxingApp,'abox.tools'),
string(ID.WritingApp,'abox.tools'),
];
if(!this.live)info.push(float(ID.Duration,ticks));
const clusters=[];
let open=null;
for(const block of this.blocks){
const track=this.tracks[block.track-1];
const keyVideo=track?.type===1&&block.isKey;
if(!open||keyVideo||block.time-open.time>BLOCK_REACH||block.time<open.time){
open={time:block.time,parts:[uint(ID.Timestamp,block.time)]};
clusters.push(open);
}
open.parts.push(this.#block(block,open.time));
}
const segment=[
element(ID.Info,info),
element(ID.Tracks,this.tracks.map((track)=>this.#trackEntry(track))),
...this.leading,
...clusters.map((cluster)=>element(ID.Cluster,cluster.parts,{unknown:this.live})),
...this.trailing,
];
return concat([header,element(ID.Segment,segment,{unknown:this.live,wide:true})]);
}
finalize(){
const type=this.docType==='webm'?'video/webm':'video/x-matroska';
return new Blob([this.bytes()],{type});
}
}
function signedVintBytes(value){
const out=[];
let rest=value;
do{
out.unshift(rest&0xff);
rest>>=8;
}while(rest!==0&&rest!==-1);
if((value<0)!==Boolean(out[0]&0x80))out.unshift(value<0?0xff:0x00);
return new Uint8Array(out);
}
