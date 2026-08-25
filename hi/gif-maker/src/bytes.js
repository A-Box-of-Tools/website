/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export class ByteSink{
constructor(capacity=4096){
this.bytes=new Uint8Array(capacity);
this.length=0;
}
reserve(extra){
const needed=this.length+extra;
if(needed<=this.bytes.length)return;
let size=this.bytes.length*2;
while(size<needed)size*=2;
const grown=new Uint8Array(size);
grown.set(this.bytes.subarray(0,this.length));
this.bytes=grown;
}
byte(value){
this.reserve(1);
this.bytes[this.length]=value&0xff;
this.length+=1;
}
u16(value){
this.reserve(2);
this.bytes[this.length]=value&0xff;
this.bytes[this.length+1]=(value>>8)&0xff;
this.length+=2;
}
write(run){
this.reserve(run.length);
this.bytes.set(run,this.length);
this.length+=run.length;
}
ascii(text){
this.reserve(text.length);
for(let i=0;i<text.length;i+=1){
this.bytes[this.length+i]=text.charCodeAt(i)&0xff;
}
this.length+=text.length;
}
done(){
return this.bytes.subarray(0,this.length);
}
}
