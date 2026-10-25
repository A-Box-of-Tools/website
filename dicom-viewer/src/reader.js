/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export class Truncated extends Error{
constructor(at,wanted,available){
super('read.pastend');
this.values={at,wanted,available};
this.name='Truncated';
this.at=at;
this.wanted=wanted;
this.available=available;
}
}
export class ByteReader{
constructor(bytes,at=0,end=bytes.length){
this.bytes=bytes;
this.view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
this.at=at;
this.end=Math.min(end,bytes.length);
this.little=true;
}
get left(){
return this.end-this.at;
}
get done(){
return this.at>=this.end;
}
need(count){
if(count<0||this.at+count>this.end){
throw new Truncated(this.at,count,this.end);
}
}
u8(){
this.need(1);
return this.bytes[this.at++];
}
u16(){
this.need(2);
const value=this.view.getUint16(this.at,this.little);
this.at+=2;
return value;
}
u32(){
this.need(4);
const value=this.view.getUint32(this.at,this.little);
this.at+=4;
return value;
}
slice(count){
this.need(count);
const out=this.bytes.subarray(this.at,this.at+count);
this.at+=count;
return out;
}
skip(count){
this.need(count);
this.at+=count;
}
ascii(count){
let out='';
for(const byte of this.slice(count))out+=String.fromCharCode(byte);
return out;
}
}
