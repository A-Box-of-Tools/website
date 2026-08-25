/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const MAX_BLOCK=255;
const MAX_CODES=4096;
const encoder=new TextEncoder();
function ascii(text){
return encoder.encode(text);
}
export function tableBits(colors){
let bits=2;
while((1<<bits)<colors)bits+=1;
return Math.min(8,bits);
}
function subBlocks(data){
const blocks=Math.ceil(data.length/MAX_BLOCK)||0;
const out=new Uint8Array(data.length+blocks+1);
let at=0;
let from=0;
while(from<data.length){
const size=Math.min(MAX_BLOCK,data.length-from);
out[at]=size;
out.set(data.subarray(from,from+size),at+1);
at+=size+1;
from+=size;
}
out[at]=0;
return out.subarray(0,at+1);
}
export function lzwEncode(indices,minCodeSize){
const codeSize=Math.max(2,minCodeSize);
const clearCode=1<<codeSize;
const endCode=clearCode+1;
const dictionary=new Int32Array(1<<(12+8));
const out=[];
let bitBuffer=0;
let bitCount=0;
let width=codeSize+1;
let next=endCode+1;
const emit=(code)=>{
bitBuffer|=code<<bitCount;
bitCount+=width;
while(bitCount>=8){
out.push(bitBuffer&0xff);
bitBuffer>>=8;
bitCount-=8;
}
};
const reset=()=>{
dictionary.fill(0);
width=codeSize+1;
next=endCode+1;
};
emit(clearCode);
if(indices.length){
let prefix=indices[0];
for(let i=1;i<indices.length;i+=1){
const k=indices[i];
const key=(prefix<<8)|k;
const found=dictionary[key];
if(found){
prefix=found-1;
continue;
}
emit(prefix);
if(next<MAX_CODES){
dictionary[key]=next+1;
if(next===(1<<width)&&width<12)width+=1;
next+=1;
}else{
emit(clearCode);
reset();
}
prefix=k;
}
emit(prefix);
}
emit(endCode);
if(bitCount>0)out.push(bitBuffer&0xff);
return subBlocks(Uint8Array.from(out));
}
export function diffFrame(previous,current,width,height,transparent){
let minX=width;
let minY=height;
let maxX=-1;
let maxY=-1;
for(let y=0;y<height;y+=1){
const row=y*width;
for(let x=0;x<width;x+=1){
if(previous[row+x]===current[row+x])continue;
if(x<minX)minX=x;
if(x>maxX)maxX=x;
if(y<minY)minY=y;
if(y>maxY)maxY=y;
}
}
if(maxX<0)return null;
const boxWidth=maxX-minX+1;
const boxHeight=maxY-minY+1;
const indices=new Uint8Array(boxWidth*boxHeight);
let unchanged=0;
for(let y=0;y<boxHeight;y+=1){
const from=(y+minY)*width+minX;
const to=y*boxWidth;
for(let x=0;x<boxWidth;x+=1){
const before=previous[from+x];
const after=current[from+x];
if(before===after){
indices[to+x]=transparent;
unchanged+=1;
}else{
indices[to+x]=after;
}
}
}
return{
x:minX,
y:minY,
width:boxWidth,
height:boxHeight,
indices,
transparent:unchanged>0,
};
}
export class GifWriter{
#chunks=[];
#width;
#height;
#bits;
#bytes=0;
constructor({width,height,palette,loop=0,transparentIndex=null}){
this.#width=width;
this.#height=height;
this.#bits=tableBits(Math.max(
palette.length/3,
transparentIndex===null?0:transparentIndex+1,
));
this.#writeHeader(palette,loop);
}
get byteLength(){
return this.#bytes;
}
#push(bytes){
this.#chunks.push(bytes);
this.#bytes+=bytes.length;
}
#writeHeader(palette,loop){
this.#push(ascii('GIF89a'));
const screen=new Uint8Array(7);
const view=new DataView(screen.buffer);
view.setUint16(0,this.#width,true);
view.setUint16(2,this.#height,true);
screen[4]=0x80|0x70|(this.#bits-1);
screen[5]=0;
screen[6]=0;
this.#push(screen);
const table=new Uint8Array((1<<this.#bits)*3);
table.set(palette.subarray(0,table.length));
this.#push(table);
const netscape=new Uint8Array([
0x21,0xff,0x0b,
...ascii('NETSCAPE2.0'),
0x03,0x01,loop&0xff,(loop>>8)&0xff,0x00,
]);
this.#push(netscape);
}
addFrame(indices,{
delay,x=0,y=0,width=this.#width,height=this.#height,transparent=null,
}){
const control=new Uint8Array(8);
const view=new DataView(control.buffer);
control[0]=0x21;
control[1]=0xf9;
control[2]=0x04;
control[3]=(1<<2)|(transparent===null?0:1);
view.setUint16(4,Math.max(0,Math.round(delay)),true);
control[6]=transparent===null?0:transparent;
control[7]=0;
this.#push(control);
const descriptor=new Uint8Array(10);
const descriptorView=new DataView(descriptor.buffer);
descriptor[0]=0x2c;
descriptorView.setUint16(1,x,true);
descriptorView.setUint16(3,y,true);
descriptorView.setUint16(5,width,true);
descriptorView.setUint16(7,height,true);
descriptor[9]=0;
this.#push(descriptor);
const minCodeSize=Math.max(2,this.#bits);
this.#push(new Uint8Array([minCodeSize]));
this.#push(lzwEncode(indices,minCodeSize));
}
finish(){
this.#push(new Uint8Array([0x3b]));
return new Blob(this.#chunks,{type:'image/gif'});
}
}
