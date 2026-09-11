/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const MAX_SIDE=256;
const ICONDIR=6;
const ICONDIRENTRY=16;
const DIB_HEADER=40;
const BI_RGB=0;
const MASK_CUTOFF=128;
function refusal(key,values){
const error=new Error(key);
error.values=values;
return error;
}
export function writeIco(entries){
if(!entries.length)throw refusal('ico.empty');
for(const entry of entries){
if(entry.width<1||entry.height<1){
throw refusal('ico.zero');
}
if(entry.width>MAX_SIDE||entry.height>MAX_SIDE){
throw refusal('ico.toobig',{size:`${entry.width}x${entry.height}`});
}
}
const total=ICONDIR+entries.length*ICONDIRENTRY
+entries.reduce((n,entry)=>n+entry.data.length,0);
const out=new Uint8Array(total);
const view=new DataView(out.buffer);
view.setUint16(0,0,true);
view.setUint16(2,1,true);
view.setUint16(4,entries.length,true);
let dir=ICONDIR;
let at=ICONDIR+entries.length*ICONDIRENTRY;
for(const entry of entries){
out[dir]=entry.width%256;
out[dir+1]=entry.height%256;
out[dir+2]=0;
out[dir+3]=0;
view.setUint16(dir+4,1,true);
view.setUint16(dir+6,32,true);
view.setUint32(dir+8,entry.data.length,true);
view.setUint32(dir+12,at,true);
out.set(entry.data,at);
dir+=ICONDIRENTRY;
at+=entry.data.length;
}
return out;
}
export function dibEntry({width,height,data}){
if(data.length!==width*height*4){
throw refusal('ico.pixels');
}
const xorStride=width*4;
const maskStride=((width+31)>>5)*4;
const xorSize=xorStride*height;
const maskSize=maskStride*height;
const out=new Uint8Array(DIB_HEADER+xorSize+maskSize);
const view=new DataView(out.buffer);
view.setUint32(0,DIB_HEADER,true);
view.setInt32(4,width,true);
view.setInt32(8,height*2,true);
view.setUint16(12,1,true);
view.setUint16(14,32,true);
view.setUint32(16,BI_RGB,true);
view.setUint32(20,xorSize+maskSize,true);
view.setInt32(24,0,true);
view.setInt32(28,0,true);
view.setUint32(32,0,true);
view.setUint32(36,0,true);
const xorAt=DIB_HEADER;
const maskAt=xorAt+xorSize;
for(let y=0;y<height;y+=1){
const source=y*xorStride;
const dest=xorAt+(height-1-y)*xorStride;
const maskRow=maskAt+(height-1-y)*maskStride;
for(let x=0;x<width;x+=1){
const from=source+x*4;
const to=dest+x*4;
const alpha=data[from+3];
out[to]=data[from+2];
out[to+1]=data[from+1];
out[to+2]=data[from];
out[to+3]=alpha;
if(alpha<MASK_CUTOFF)out[maskRow+(x>>3)]|=0x80>>(x&7);
}
}
return out;
}
export function readIcoDirectory(bytes){
if(bytes.length<ICONDIR)throw refusal('ico.short');
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
if(view.getUint16(2,true)!==1)throw refusal('ico.type');
const count=view.getUint16(4,true);
const found=[];
for(let i=0;i<count;i+=1){
const dir=ICONDIR+i*ICONDIRENTRY;
if(dir+ICONDIRENTRY>bytes.length)throw refusal('ico.directory');
const size=view.getUint32(dir+8,true);
const offset=view.getUint32(dir+12,true);
if(offset+size>bytes.length)throw refusal('ico.entry');
found.push({
width:bytes[dir]===0?MAX_SIDE:bytes[dir],
height:bytes[dir+1]===0?MAX_SIDE:bytes[dir+1],
kind:isPng(bytes,offset)?'png':'bmp',
bytes:size,
});
}
return found;
}
function isPng(bytes,at){
return bytes[at]===0x89&&bytes[at+1]===0x50
&&bytes[at+2]===0x4e&&bytes[at+3]===0x47;
}
