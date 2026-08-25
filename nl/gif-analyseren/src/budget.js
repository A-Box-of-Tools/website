/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{HEADER_BYTES}from'./gif.js';
export function budget(gif){
let controls=0;
let descriptors=0;
let localTables=0;
let pixels=0;
let framing=0;
for(const frame of gif.frames){
if(frame.control)controls+=frame.control.bytes;
descriptors+=11;
if(frame.palette)localTables+=frame.palette.bytes;
pixels+=frame.payloadBytes;
framing+=frame.framingBytes;
}
let metadata=0;
for(const extension of gif.extensions)metadata+=extension.bytes;
const rows=[
{
key:'header',
label:'Header and screen descriptor',
bytes:HEADER_BYTES,
note:'The signature, the canvas size, and the flags. Thirteen bytes, in every GIF ever made.',
},
{
key:'global',
label:'Global colour table',
bytes:gif.globalPalette?gif.globalPalette.bytes:0,
note:gif.globalPalette
?`${gif.globalPalette.count} colours at three bytes each, shared by every frame that does not bring its own.`
:'This file has none: every frame carries its own palette.',
},
{
key:'local',
label:'Per-frame colour tables',
bytes:localTables,
note:'A palette of its own for a frame that needed different colours. Three bytes a colour, every time.',
},
{
key:'control',
label:'Frame timing blocks',
bytes:controls,
note:'Eight bytes per frame: the delay, the disposal method, and which colour is transparent.',
},
{
key:'descriptor',
label:'Frame descriptors',
bytes:descriptors,
note:'Eleven bytes per frame: where the rectangle sits, how big it is, and the compressor’s starting code size.',
},
{
key:'pixels',
label:'Compressed pixels',
bytes:pixels,
note:'The picture itself, LZW-compressed. On a healthy GIF this is nearly all of the file.',
},
{
key:'framing',
label:'Block framing',
bytes:framing,
note:'One length byte for every 255 bytes of data, plus a zero to end each run. Unavoidable, and worth seeing.',
},
{
key:'metadata',
label:'Comments and metadata',
bytes:metadata,
note:'Loop blocks, comments, colour profiles, and any XMP an editor left behind.',
},
{
key:'trailer',
label:'Trailer',
bytes:gif.trailerAt>=0?1:0,
note:'One byte saying the file is over.',
},
{
key:'after',
label:'Bytes after the end',
bytes:gif.trailingBytes,
note:'Data sitting past the trailer. No decoder reads it, and it is pure weight.',
},
];
const accounted=rows.reduce((sum,row)=>sum+row.bytes,0);
const missing=gif.size-accounted;
if(missing!==0){
rows.push({
key:'unaccounted',
label:missing>0?'Not accounted for':'Counted twice',
bytes:Math.abs(missing),
note:missing>0
?'Bytes inside blocks this reader stopped at. A file that ends mid-block leaves some.'
:'The blocks overlap, which means this file disagrees with itself about where they start.',
});
}
for(const row of rows)row.share=gif.size>0?row.bytes/gif.size:0;
return{total:gif.size,accounted,rows};
}
export function paletteWaste(gif,used){
let declared=0;
let referenced=0;
for(const[index,frame]of gif.frames.entries()){
if(!frame.palette||!used[index])continue;
declared+=frame.palette.count;
referenced+=count(used[index],frame.palette.count);
}
if(gif.globalPalette){
declared+=gif.globalPalette.count;
const union=new Uint8Array(256);
for(const[index,frame]of gif.frames.entries()){
if(frame.palette||!used[index])continue;
for(let i=0;i<256;i+=1)if(used[index][i])union[i]=1;
}
referenced+=count(union,gif.globalPalette.count);
}
return{
declared,
referenced,
wastedEntries:Math.max(0,declared-referenced),
wastedBytes:Math.max(0,declared-referenced)*3,
};
}
const count=(flags,limit)=>{
let total=0;
for(let i=0;i<limit;i+=1)if(flags[i])total+=1;
return total;
};
export function distinctColors(gif,used){
const seen=new Set();
for(const[index,frame]of gif.frames.entries()){
const palette=frame.palette??gif.globalPalette;
if(!palette)continue;
const flags=used[index];
for(let i=0;i<palette.count;i+=1){
if(flags&&!flags[i])continue;
const at=i*3;
seen.add((palette.colors[at]<<16)|(palette.colors[at+1]<<8)|palette.colors[at+2]);
}
}
return seen;
}
