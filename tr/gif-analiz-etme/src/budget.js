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
{key:'header',bytes:HEADER_BYTES},
{
key:'global',
bytes:gif.globalPalette?gif.globalPalette.bytes:0,
note:gif.globalPalette?'budget.global.note':'budget.global.none',
values:gif.globalPalette?{colours:gif.globalPalette.count}:undefined,
},
{key:'local',bytes:localTables},
{key:'control',bytes:controls},
{key:'descriptor',bytes:descriptors},
{key:'pixels',bytes:pixels},
{key:'framing',bytes:framing},
{key:'metadata',bytes:metadata},
{key:'trailer',bytes:gif.trailerAt>=0?1:0},
{key:'after',bytes:gif.trailingBytes},
];
const accounted=rows.reduce((sum,row)=>sum+row.bytes,0);
const missing=gif.size-accounted;
if(missing!==0){
rows.push({
key:missing>0?'unaccounted':'twice',
bytes:Math.abs(missing),
});
}
for(const row of rows){
row.share=gif.size>0?row.bytes/gif.size:0;
row.label=`budget.${row.key}.label`;
row.note??=`budget.${row.key}.note`;
}
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
