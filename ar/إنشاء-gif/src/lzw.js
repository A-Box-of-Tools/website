/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ByteSink}from'./bytes.js';
const MAX_CODE=4096;
const MAX_CODE_SIZE=12;
export function lzwEncode(indices,minCodeSize){
if(!Number.isInteger(minCodeSize)||minCodeSize<2||minCodeSize>8){
throw new RangeError(`minCodeSize must be an integer 2..8, got ${minCodeSize}`);
}
const clearCode=1<<minCodeSize;
const endCode=clearCode+1;
const firstFree=endCode+1;
const out=new ByteSink(Math.max(64,indices.length>>1));
let accumulator=0;
let accumulated=0;
let codeSize=minCodeSize+1;
let next=firstFree;
let resetAfterWrite=false;
const emit=(code)=>{
accumulator|=code<<accumulated;
accumulated+=codeSize;
while(accumulated>=8){
out.byte(accumulator&0xff);
accumulator>>=8;
accumulated-=8;
}
if(resetAfterWrite){
codeSize=minCodeSize+1;
resetAfterWrite=false;
}else if(next>(1<<codeSize)-1&&codeSize<MAX_CODE_SIZE){
codeSize+=1;
}
};
emit(clearCode);
if(indices.length>0){
const dictionary=new Map();
let prefix=indices[0];
for(let i=1;i<indices.length;i+=1){
const pixel=indices[i];
const key=(prefix<<8)|pixel;
const known=dictionary.get(key);
if(known!==undefined){
prefix=known;
continue;
}
emit(prefix);
if(next<MAX_CODE){
dictionary.set(key,next);
next+=1;
}else{
resetAfterWrite=true;
emit(clearCode);
dictionary.clear();
next=firstFree;
}
prefix=pixel;
}
emit(prefix);
}
emit(endCode);
if(accumulated>0)out.byte(accumulator&0xff);
return out.done();
}
