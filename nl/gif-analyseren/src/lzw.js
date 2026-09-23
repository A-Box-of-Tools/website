/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const MAX_CODES=4096;
export function lzwDecode(data,minCodeSize,pixelCount){
if(minCodeSize<2||minCodeSize>8){
return fail(pixelCount,
{key:'decode.codesize',values:{size:minCodeSize}});
}
const clearCode=1<<minCodeSize;
const endCode=clearCode+1;
const indices=new Uint8Array(pixelCount);
const prefix=new Uint16Array(MAX_CODES);
const suffix=new Uint8Array(MAX_CODES);
const stack=new Uint8Array(MAX_CODES);
for(let code=0;code<clearCode;code+=1)suffix[code]=code;
let next=endCode+1;
let width=minCodeSize+1;
let previous=-1;
let bitBuffer=0;
let bitCount=0;
let at=0;
let out=0;
let codes=0;
let clears=0;
let complete=false;
let truncated=false;
let corrupt=null;
reading:while(true){
while(bitCount<width){
if(at>=data.length){
truncated=true;
break reading;
}
bitBuffer|=data[at]<<bitCount;
at+=1;
bitCount+=8;
}
const code=bitBuffer&((1<<width)-1);
bitBuffer>>=width;
bitCount-=width;
codes+=1;
if(code===clearCode){
next=endCode+1;
width=minCodeSize+1;
previous=-1;
clears+=1;
continue;
}
if(code===endCode){
complete=true;
break;
}
if(previous<0){
if(code>=clearCode){
corrupt={key:'decode.codefirst',values:{code:code.toLocaleString()}};
break;
}
if(out<pixelCount)indices[out]=suffix[code];
out+=1;
previous=code;
continue;
}
let walk=code;
let top=0;
if(code>next){
corrupt={
key:'decode.codemissing',
values:{code:code.toLocaleString(),entries:next.toLocaleString()},
};
break;
}
if(code===next){
stack[top]=firstByte(prefix,suffix,clearCode,previous);
top+=1;
walk=previous;
}
while(walk>=clearCode){
stack[top]=suffix[walk];
top+=1;
walk=prefix[walk];
}
stack[top]=walk;
top+=1;
while(top>0){
top-=1;
if(out<pixelCount)indices[out]=stack[top];
out+=1;
}
if(next<MAX_CODES){
prefix[next]=previous;
suffix[next]=walk;
next+=1;
if(next===(1<<width)&&width<12)width+=1;
}
previous=code;
}
return{
indices,
pixels:Math.min(out,pixelCount),
overrun:Math.max(0,out-pixelCount),
codes,
clears,
bytesRead:at,
complete,
truncated,
corrupt,
};
}
function firstByte(prefix,suffix,clearCode,code){
let walk=code;
while(walk>=clearCode)walk=prefix[walk];
return walk;
}
function fail(pixelCount,why){
return{
indices:new Uint8Array(pixelCount),
pixels:0,
overrun:0,
codes:0,
clears:0,
bytesRead:0,
complete:false,
truncated:false,
corrupt:why,
};
}
