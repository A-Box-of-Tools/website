/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export class Truncated extends Error{
constructor(at,wanted,available){
super(`the file ends at ${available} bytes; ${wanted} more were needed at ${at}`);
this.name='Truncated';
this.at=at;
this.wanted=wanted;
this.available=available;
}
}
const latin1=new TextDecoder('latin1');
export class ByteReader{
constructor(bytes){
this.bytes=bytes;
this.at=0;
}
get left(){
return this.bytes.length-this.at;
}
get done(){
return this.at>=this.bytes.length;
}
need(count){
if(this.at+count>this.bytes.length){
throw new Truncated(this.at,count,this.bytes.length);
}
}
peek(){
return this.at<this.bytes.length?this.bytes[this.at]:-1;
}
u8(){
this.need(1);
return this.bytes[this.at++];
}
u16(){
this.need(2);
const value=this.bytes[this.at]|(this.bytes[this.at+1]<<8);
this.at+=2;
return value;
}
slice(count){
this.need(count);
const out=this.bytes.subarray(this.at,this.at+count);
this.at+=count;
return out;
}
ascii(count){
return latin1.decode(this.slice(count));
}
skip(count){
this.need(count);
this.at+=count;
}
}
export const text=(bytes)=>latin1.decode(bytes);
