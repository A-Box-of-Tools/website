/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ByteReader,Truncated,text}from'./reader.js';
const EXTENSION=0x21;
const IMAGE_DESCRIPTOR=0x2c;
const TRAILER=0x3b;
const GRAPHIC_CONTROL=0xf9;
const COMMENT=0xfe;
const PLAIN_TEXT=0x01;
const APPLICATION=0xff;
const HEADER_BYTES=13;
export const DISPOSALS=[
'Unspecified',
'Leave it in place',
'Clear back to the background',
'Restore what was underneath',
];
export function parseGif(bytes){
if(bytes.length<6||text(bytes.subarray(0,3))!=='GIF'){
throw new NotAGif(`this file starts with ${describe(bytes)}, not "GIF"`);
}
const reader=new ByteReader(bytes);
reader.skip(3);
const version=reader.ascii(3);
const width=reader.u16();
const height=reader.u16();
const packed=reader.u8();
const backgroundIndex=reader.u8();
const aspectByte=reader.u8();
const gif={
size:bytes.length,
version,
width,
height,
colorResolution:((packed>>4)&7)+1,
globalSorted:Boolean(packed&8),
backgroundIndex,
aspectByte,
aspect:aspectByte===0?null:(aspectByte+15)/64,
globalPalette:null,
loop:null,
loopSource:null,
frames:[],
extensions:[],
trailerAt:-1,
trailingBytes:0,
truncated:false,
problems:[],
};
if(packed&0x80){
const count=1<<((packed&7)+1);
gif.globalPalette=readPalette(reader,count,gif.globalSorted);
}
walk(reader,gif);
return gif;
}
export class NotAGif extends Error{
constructor(message){
super(message);
this.name='NotAGif';
}
}
function describe(bytes){
const magic=[
[[0xff,0xd8,0xff],'a JPEG'],
[[0x89,0x50,0x4e,0x47],'a PNG'],
[[0x52,0x49,0x46,0x46],'a RIFF file - a WebP or a WAV'],
[[0x25,0x50,0x44,0x46],'a PDF'],
[[0x50,0x4b,0x03,0x04],'a zip file'],
];
for(const[prefix,name]of magic){
if(prefix.every((byte,i)=>bytes[i]===byte))return name;
}
const head=Array.from(bytes.subarray(0,3),(b)=>b.toString(16).padStart(2,'0'));
return`the bytes ${head.join(' ')}`;
}
function readPalette(reader,count,sorted){
const at=reader.at;
const colors=reader.slice(count*3);
return{at,bytes:count*3,count,sorted,colors};
}
function walk(reader,gif){
let control=null;
const stop=(key,values={})=>{
gif.problems.push({key,values});
};
while(true){
if(reader.done){
gif.truncated=true;
stop('parse.notrailer');
return;
}
const start=reader.at;
let marker;
try{
marker=reader.u8();
if(marker===TRAILER){
gif.trailerAt=start;
gif.trailingBytes=reader.left;
return;
}
if(marker===IMAGE_DESCRIPTOR){
gif.frames.push(readImage(reader,gif,control,control?control.at:start));
control=null;
continue;
}
if(marker!==EXTENSION){
stop('parse.unknownblock',{
at:start.toLocaleString(),
marker:marker.toString(16).padStart(2,'0'),
});
gif.truncated=true;
return;
}
const label=reader.u8();
if(label===GRAPHIC_CONTROL){
if(control){
stop('parse.twocontrols',{
first:control.at.toLocaleString(),
second:start.toLocaleString(),
});
}
control=readControl(reader,start);
continue;
}
gif.extensions.push(readExtension(reader,gif,label,start));
}catch(error){
if(!(error instanceof Truncated))throw error;
gif.truncated=true;
stop('parse.midblock',{at:start.toLocaleString(),detail:error.message});
return;
}
}
}
function readControl(reader,at){
const size=reader.u8();
const fields=reader.slice(size);
const packed=fields[0]??0;
const delay=size>=3?fields[1]|(fields[2]<<8):0;
const transparentIndex=fields[3]??0;
let blocks=0;
while(true){
const next=reader.u8();
if(next===0)break;
reader.skip(next);
blocks+=1;
}
return{
at,
bytes:reader.at-at,
size,
delay,
disposal:(packed>>2)&7,
userInput:Boolean(packed&2),
transparent:Boolean(packed&1),
transparentIndex,
wellFormed:size===4&&blocks===0,
};
}
function readImage(reader,gif,control,at){
const left=reader.u16();
const top=reader.u16();
const width=reader.u16();
const height=reader.u16();
const packed=reader.u8();
const interlaced=Boolean(packed&0x40);
const sorted=Boolean(packed&0x20);
let palette=null;
if(packed&0x80){
palette=readPalette(reader,1<<((packed&7)+1),sorted);
}
const minCodeSize=reader.u8();
const dataAt=reader.at;
const runs=[];
let payloadBytes=0;
while(true){
const size=reader.u8();
if(size===0)break;
runs.push([reader.at,size]);
reader.skip(size);
payloadBytes+=size;
}
const paletteBytes=palette?palette.bytes:0;
return{
index:gif.frames.length,
at,
bytes:(control?control.bytes:0)+11+paletteBytes+payloadBytes+runs.length+1,
control,
left,
top,
width,
height,
interlaced,
palette,
localPalette:Boolean(palette),
minCodeSize,
dataAt,
dataBytes:reader.at-dataAt,
payloadBytes,
framingBytes:runs.length+1,
subBlocks:runs.length,
runs,
delay:control?control.delay:0,
disposal:control?control.disposal:0,
transparentIndex:control&&control.transparent?control.transparentIndex:-1,
};
}
function readExtension(reader,gif,label,at){
const block={at,label,kind:'unknown',name:'',bytes:0,dataBytes:0,text:null};
let head=null;
if(label===APPLICATION){
const size=reader.u8();
head=reader.slice(size);
block.kind='application';
block.name=text(head.subarray(0,8)).trim();
block.auth=text(head.subarray(8,11));
}else if(label===PLAIN_TEXT){
const size=reader.u8();
head=reader.slice(size);
block.kind='plain-text';
block.name='Plain text';
}else if(label===COMMENT){
block.kind='comment';
block.name='Comment';
}else{
block.name=`Extension 0x${label.toString(16).padStart(2, '0')}`;
}
const runs=[];
let dataBytes=0;
while(true){
const size=reader.u8();
if(size===0)break;
runs.push(reader.slice(size));
dataBytes+=size;
}
block.bytes=reader.at-at;
block.dataBytes=dataBytes;
block.subBlocks=runs.length;
if(isXmp(block))block.text=joinText(runs,true);
else if(block.kind==='comment')block.text=joinText(runs,false);
if(block.kind==='application'&&(block.name==='NETSCAPE'||block.name==='ANIMEXTS1.0')){
const first=runs[0];
if(first&&first.length>=3&&first[0]===1){
const times=first[1]|(first[2]<<8);
if(gif.loop===null){
gif.loop=times;
gif.loopSource=block.name;
}
block.loop=times;
}
}
return block;
}
const isXmp=(block)=>block.kind==='application'&&block.name.startsWith('XMP');
function joinText(runs,trimXmpTrailer){
const total=runs.reduce((sum,run)=>sum+run.length,0);
const joined=new Uint8Array(total);
let at=0;
for(const run of runs){
joined.set(run,at);
at+=run.length;
}
const asText=text(joined);
if(!trimXmpTrailer)return asText;
const marker=asText.lastIndexOf('<?xpacket end');
if(marker<0)return asText;
const close=asText.indexOf('>',marker);
return close<0?asText:asText.slice(0,close+1);
}
export function frameData(bytes,frame){
const out=new Uint8Array(frame.payloadBytes);
let at=0;
for(const[start,size]of frame.runs){
out.set(bytes.subarray(start,start+size),at);
at+=size;
}
return out;
}
export const paletteFor=(gif,frame)=>frame.palette??gif.globalPalette;
export{HEADER_BYTES};
