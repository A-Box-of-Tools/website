/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function blocks(size,compress){
const block=new Uint8Array(size);
const view=new DataView(block.buffer);
let filled=0;
let length=0;
return{
update(chunk){
length+=chunk.length;
let at=0;
while(at<chunk.length){
const take=Math.min(size-filled,chunk.length-at);
block.set(chunk.subarray(at,at+take),filled);
filled+=take;
at+=take;
if(filled===size){
compress(view);
filled=0;
}
}
},
finish(lengthBytes,write){
block[filled]=0x80;
filled+=1;
if(filled>size-lengthBytes){
block.fill(0,filled);
compress(view);
filled=0;
}
block.fill(0,filled);
write(view,size-lengthBytes,length);
compress(view);
},
};
}
export function bitLength(bytes){
const bits=bytes*8;
return{hi:Math.floor(bits/0x100000000),lo:bits>>>0};
}
