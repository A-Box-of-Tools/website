/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ByteSink}from'./bytes.js?v=935edb04f5';
import{lzwEncode}from'./lzw.js?v=935edb04f5';
const EXTENSION=0x21;
const IMAGE_DESCRIPTOR=0x2c;
const TRAILER=0x3b;
const GRAPHIC_CONTROL=0xf9;
const APPLICATION=0xff;
const DISPOSAL_KEEP=1;
const DISPOSAL_RESTORE_BG=2;
export const MAX_SIDE=65535;
export function padPalette(palette){
const colours=Math.max(1,Math.floor(palette.length/3));
let depth=1;
while((1<<depth)<colours)depth+=1;
if(depth>8)throw new RangeError(`a colour table holds at most 256 colours, got ${colours}`);
const table=new Uint8Array((1<<depth)*3);
table.set(palette.subarray(0,colours*3));
return{table,depth};
}
const codeSizeFor=(depth)=>Math.max(2,depth);
export class GifWriter{
constructor({width,height,palette=null,loop=0}){
if(!(width>=1&&width<=MAX_SIDE)||!(height>=1&&height<=MAX_SIDE)){
throw new RangeError(`a GIF is 1..${MAX_SIDE} pixels each way, got ${width}x${height}`);
}
this.width=Math.floor(width);
this.height=Math.floor(height);
this.out=new ByteSink(1<<16);
this.frames=0;
const global=palette?padPalette(palette):null;
this.global=global;
this.out.ascii('GIF89a');
this.out.u16(this.width);
this.out.u16(this.height);
this.out.byte(
(global?0x80:0)
|(((global?global.depth:8)-1)<<4)
|(global?global.depth-1:0),
);
this.out.byte(0);
this.out.byte(0);
if(global)this.out.write(global.table);
if(loop!==null)this.writeLoop(loop);
}
writeLoop(times){
const out=this.out;
out.byte(EXTENSION);
out.byte(APPLICATION);
out.byte(11);
out.ascii('NETSCAPE');
out.ascii('2.0');
out.byte(3);
out.byte(1);
out.u16(Math.max(0,Math.min(65535,Math.floor(times))));
out.byte(0);
}
addFrame({indices,palette=null,delay,transparentIndex=-1}){
if(indices.length!==this.width*this.height){
throw new RangeError(
`frame is ${indices.length} pixels, expected ${this.width * this.height}`,
);
}
const local=palette?padPalette(palette):null;
const active=local??this.global;
if(!active)throw new Error('a frame needs either a shared palette or one of its own');
const out=this.out;
const transparent=transparentIndex>=0;
out.byte(EXTENSION);
out.byte(GRAPHIC_CONTROL);
out.byte(4);
out.byte(((transparent?DISPOSAL_RESTORE_BG:DISPOSAL_KEEP)<<2)|(transparent?1:0));
out.u16(Math.max(0,Math.min(65535,Math.round(delay))));
out.byte(transparent?transparentIndex:0);
out.byte(0);
out.byte(IMAGE_DESCRIPTOR);
out.u16(0);
out.u16(0);
out.u16(this.width);
out.u16(this.height);
out.byte(local?0x80|(local.depth-1):0);
if(local)out.write(local.table);
const minCodeSize=codeSizeFor(active.depth);
out.byte(minCodeSize);
writeSubBlocks(out,lzwEncode(indices,minCodeSize));
this.frames+=1;
}
finalize(){
if(this.frames===0)throw new Error('a GIF needs at least one frame');
this.out.byte(TRAILER);
return this.out.done();
}
}
function writeSubBlocks(out,data){
for(let at=0;at<data.length;at+=255){
const run=data.subarray(at,Math.min(at+255,data.length));
out.byte(run.length);
out.write(run);
}
out.byte(0);
}
