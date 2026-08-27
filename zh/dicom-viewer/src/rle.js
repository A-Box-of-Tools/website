/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{refuse}from'./refusal.js';
export function decodeRLE(bytes,pixels,samples,bytesPerSample){
if(bytes.length<64){
throw refuse('rle.short');
}
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
const count=view.getUint32(0,true);
const wanted=samples*bytesPerSample;
if(count<1||count>15){
throw refuse('rle.segments',{count});
}
if(count<wanted){
throw refuse('rle.wrongcount',{wanted,count});
}
const offsets=[];
for(let at=0;at<count;at+=1)offsets.push(view.getUint32(4+at*4,true));
const out=new Uint8Array(pixels*wanted);
for(let segment=0;segment<wanted;segment+=1){
const from=offsets[segment];
const to=segment+1<count?offsets[segment+1]:bytes.length;
if(from<64||from>bytes.length||to>bytes.length||to<from){
throw refuse('rle.outside',{segment});
}
const sample=Math.floor(segment/bytesPerSample);
const byte=segment%bytesPerSample;
const start=sample*bytesPerSample+(bytesPerSample-1-byte);
unpack(bytes.subarray(from,to),out,start,wanted,pixels);
}
return out;
}
function unpack(segment,out,start,stride,pixels){
const end=start+pixels*stride;
let write=start;
let at=0;
while(at<segment.length&&write<end){
const control=segment[at++];
if(control===128)continue;
if(control<128){
const run=control+1;
for(let step=0;step<run&&at<segment.length&&write<end;step+=1){
out[write]=segment[at++];
write+=stride;
}
continue;
}
const run=257-control;
if(at>=segment.length)break;
const value=segment[at++];
for(let step=0;step<run&&write<end;step+=1){
out[write]=value;
write+=stride;
}
}
}
