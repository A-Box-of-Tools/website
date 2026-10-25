/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export class GifFormatError extends Error{
constructor(key,values={}){
super(key);
this.name='GifFormatError';
this.values=values;
}
}
class Truncated extends Error{}
const BLOCK_EXTENSION=0x21;
const BLOCK_IMAGE=0x2c;
const BLOCK_TRAILER=0x3b;
const EXT_GRAPHIC_CONTROL=0xf9;
const EXT_COMMENT=0xfe;
const EXT_PLAIN_TEXT=0x01;
const EXT_APPLICATION=0xff;
const latin1=new TextDecoder('latin1');
const INTERLACE_PASSES=[[0,8],[4,8],[2,4],[1,2]];
export function decodeGif(bytes,{maxPixels=512e6}={}){
if(bytes.length<13)throw new GifFormatError('gif.tooshort');
const signature=latin1.decode(bytes.subarray(0,6));
if(signature!=='GIF87a'&&signature!=='GIF89a'){
throw new GifFormatError('gif.notagif');
}
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
const packed=bytes[10];
const gif={
version:signature,
width:view.getUint16(6,true),
height:view.getUint16(8,true),
backgroundIndex:bytes[11],
loopCount:null,
globalPalette:null,
frames:[],
comment:null,
truncated:null,
};
let at=13;
if(packed&0x80){
const size=1<<((packed&7)+1);
gif.globalPalette=bytes.subarray(at,at+size*3);
at+=size*3;
}
let control=null;
let decoded=0;
const reader={at};
try{
while(reader.at<bytes.length){
const marker=bytes[reader.at];
if(marker===BLOCK_TRAILER)break;
if(marker===BLOCK_EXTENSION){
reader.at+=1;
const label=bytes[reader.at];
reader.at+=1;
if(label===EXT_GRAPHIC_CONTROL){
control=readGraphicControl(bytes,view,reader);
}else if(label===EXT_COMMENT){
const text=latin1.decode(readSubBlocks(bytes,reader)).trim();
if(text&&!gif.comment)gif.comment=text;
}else if(label===EXT_APPLICATION){
readApplication(bytes,reader,gif);
}else if(label===EXT_PLAIN_TEXT){
skipHeader(bytes,reader);
readSubBlocks(bytes,reader);
control=null;
}else{
readSubBlocks(bytes,reader);
}
continue;
}
if(marker===BLOCK_IMAGE){
const frame=readImage(bytes,view,reader,gif,control);
gif.frames.push(frame);
control=null;
decoded+=frame.width*frame.height;
if(decoded>maxPixels){
gif.truncated={key:'gif.enormous',values:{n:gif.frames.length}};
break;
}
continue;
}
if(marker===0){
reader.at+=1;
continue;
}
throw new Truncated(`unknown block 0x${marker.toString(16)}`);
}
}catch(error){
if(!(error instanceof Truncated))throw error;
gif.truncated={key:gif.frames.length?'gif.midframe':'gif.damaged',values:{}};
}
if(!gif.frames.length){
const why=gif.truncated??{key:'gif.noframes',values:{}};
throw new GifFormatError(why.key,why.values);
}
if(!gif.width||!gif.height){
for(const frame of gif.frames){
gif.width=Math.max(gif.width,frame.x+frame.width);
gif.height=Math.max(gif.height,frame.y+frame.height);
}
}
return gif;
}
function readGraphicControl(bytes,view,reader){
const size=bytes[reader.at];
if(reader.at+1+size>=bytes.length)throw new Truncated('graphic control');
const flags=bytes[reader.at+1];
const control={
disposal:(flags>>2)&7,
delay:view.getUint16(reader.at+2,true),
transparentIndex:flags&1?bytes[reader.at+4]:-1,
};
reader.at+=1+size;
readSubBlocks(bytes,reader);
return control;
}
function readApplication(bytes,reader,gif){
const size=bytes[reader.at];
const name=latin1.decode(bytes.subarray(reader.at+1,reader.at+1+size));
reader.at+=1+size;
const payload=readSubBlocks(bytes,reader);
if(name.startsWith('NETSCAPE')&&payload.length>=3&&payload[0]===1){
gif.loopCount=payload[1]|(payload[2]<<8);
}
}
function readImage(bytes,view,reader,gif,control){
if(reader.at+10>bytes.length)throw new Truncated('image descriptor');
const flags=bytes[reader.at+9];
const frame={
x:view.getUint16(reader.at+1,true),
y:view.getUint16(reader.at+3,true),
width:view.getUint16(reader.at+5,true),
height:view.getUint16(reader.at+7,true),
interlaced:Boolean(flags&0x40),
hasLocalPalette:Boolean(flags&0x80),
disposal:control?.disposal??0,
delay:control?.delay??0,
transparentIndex:control?.transparentIndex??-1,
palette:gif.globalPalette,
indices:null,
dataBytes:0,
partial:false,
};
reader.at+=10;
if(frame.hasLocalPalette){
const size=1<<((flags&7)+1);
frame.palette=bytes.subarray(reader.at,reader.at+size*3);
reader.at+=size*3;
}
if(reader.at>=bytes.length)throw new Truncated('image data');
const minCodeSize=bytes[reader.at];
reader.at+=1;
const from=reader.at;
const data=readSubBlocks(bytes,reader);
frame.dataBytes=reader.at-from;
if(!frame.palette||frame.palette.length<3)frame.palette=greyPalette();
const pixels=frame.width*frame.height;
if(!pixels)throw new Truncated('a frame of no size');
const decoded=lzwDecode(data,minCodeSize,pixels);
frame.partial=decoded.partial;
frame.indices=frame.interlaced
?deinterlace(decoded.indices,frame.width,frame.height)
:decoded.indices;
return frame;
}
function skipHeader(bytes,reader){
const size=bytes[reader.at];
reader.at+=1+size;
}
function readSubBlocks(bytes,reader){
const runs=[];
let total=0;
for(;;){
if(reader.at>=bytes.length)throw new Truncated('sub-blocks');
const size=bytes[reader.at];
reader.at+=1;
if(size===0)break;
if(reader.at+size>bytes.length)throw new Truncated('sub-block payload');
runs.push(bytes.subarray(reader.at,reader.at+size));
reader.at+=size;
total+=size;
}
if(runs.length===1)return runs[0];
const out=new Uint8Array(total);
let at=0;
for(const run of runs){
out.set(run,at);
at+=run.length;
}
return out;
}
function greyPalette(){
const table=new Uint8Array(256*3);
for(let i=0;i<256;i+=1){
table[i*3]=i;
table[i*3+1]=i;
table[i*3+2]=i;
}
return table;
}
export function lzwDecode(data,minCodeSize,pixels){
const codeSize=Math.min(8,Math.max(2,minCodeSize));
const clearCode=1<<codeSize;
const endCode=clearCode+1;
const prefix=new Uint16Array(4096);
const suffix=new Uint8Array(4096);
const stack=new Uint8Array(4096);
for(let i=0;i<clearCode;i+=1)suffix[i]=i;
const out=new Uint8Array(pixels);
let written=0;
let width=codeSize+1;
let next=endCode+1;
let previous=-1;
let bits=0;
let bitCount=0;
let at=0;
while(written<pixels){
while(bitCount<width){
if(at>=data.length)return{indices:out,partial:true};
bits|=data[at]<<bitCount;
at+=1;
bitCount+=8;
}
const code=bits&((1<<width)-1);
bits>>=width;
bitCount-=width;
if(code===endCode)return{indices:out,partial:written<pixels};
if(code===clearCode){
width=codeSize+1;
next=endCode+1;
previous=-1;
continue;
}
let top=0;
let current=code;
if(code>=next){
if(previous<0||code>next)return{indices:out,partial:true};
stack[top]=suffix[previous];
top+=1;
current=previous;
}
while(current>=clearCode){
if(top>=stack.length)return{indices:out,partial:true};
stack[top]=suffix[current];
top+=1;
current=prefix[current];
}
const first=suffix[current];
stack[top]=first;
top+=1;
while(top>0&&written<pixels){
top-=1;
out[written]=stack[top];
written+=1;
}
if(previous>=0&&next<4096){
prefix[next]=previous;
suffix[next]=first;
next+=1;
if(next===(1<<width)&&width<12)width+=1;
}
previous=code;
}
return{indices:out,partial:false};
}
export function deinterlace(indices,width,height){
const out=new Uint8Array(indices.length);
let from=0;
for(const[start,step]of INTERLACE_PASSES){
for(let row=start;row<height;row+=step){
out.set(indices.subarray(from,from+width),row*width);
from+=width;
}
}
return out;
}
export function playedDelay(centiseconds){
return(centiseconds<2?10:centiseconds)/100;
}
export function totalDuration(frames){
return frames.reduce((total,frame)=>total+playedDelay(frame.delay),0);
}
