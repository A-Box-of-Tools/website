/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{bitLength,blocks}from'./blocks.js';
const K=new Int32Array([
0xd76aa478|0,0xe8c7b756|0,0x242070db|0,0xc1bdceee|0,
0xf57c0faf|0,0x4787c62a|0,0xa8304613|0,0xfd469501|0,
0x698098d8|0,0x8b44f7af|0,0xffff5bb1|0,0x895cd7be|0,
0x6b901122|0,0xfd987193|0,0xa679438e|0,0x49b40821|0,
0xf61e2562|0,0xc040b340|0,0x265e5a51|0,0xe9b6c7aa|0,
0xd62f105d|0,0x02441453|0,0xd8a1e681|0,0xe7d3fbc8|0,
0x21e1cde6|0,0xc33707d6|0,0xf4d50d87|0,0x455a14ed|0,
0xa9e3e905|0,0xfcefa3f8|0,0x676f02d9|0,0x8d2a4c8a|0,
0xfffa3942|0,0x8771f681|0,0x6d9d6122|0,0xfde5380c|0,
0xa4beea44|0,0x4bdecfa9|0,0xf6bb4b60|0,0xbebfbc70|0,
0x289b7ec6|0,0xeaa127fa|0,0xd4ef3085|0,0x04881d05|0,
0xd9d4d039|0,0xe6db99e5|0,0x1fa27cf8|0,0xc4ac5665|0,
0xf4292244|0,0x432aff97|0,0xab9423a7|0,0xfc93a039|0,
0x655b59c3|0,0x8f0ccc92|0,0xffeff47d|0,0x85845dd1|0,
0x6fa87e4f|0,0xfe2ce6e0|0,0xa3014314|0,0x4e0811a1|0,
0xf7537e82|0,0xbd3af235|0,0x2ad7d2bb|0,0xeb86d391|0,
]);
const S=new Int32Array([
7,12,17,22,
5,9,14,20,
4,11,16,23,
6,10,15,21,
]);
export function md5(){
let a0=0x67452301|0;
let b0=0xefcdab89|0;
let c0=0x98badcfe|0;
let d0=0x10325476|0;
const m=new Int32Array(16);
const compress=(view)=>{
for(let i=0;i<16;i+=1)m[i]=view.getInt32(i*4,true);
let a=a0;
let b=b0;
let c=c0;
let d=d0;
for(let i=0;i<64;i+=1){
let f;
let g;
if(i<16){
f=(b&c)|(~b&d);
g=i;
}else if(i<32){
f=(d&b)|(~d&c);
g=(5*i+1)&15;
}else if(i<48){
f=b^c^d;
g=(3*i+5)&15;
}else{
f=c^(b|~d);
g=(7*i)&15;
}
const sum=(a+f+K[i]+m[g])|0;
const shift=S[((i>>4)<<2)|(i&3)];
a=d;
d=c;
c=b;
b=(b+((sum<<shift)|(sum>>>(32-shift))))|0;
}
a0=(a0+a)|0;
b0=(b0+b)|0;
c0=(c0+c)|0;
d0=(d0+d)|0;
};
const state=blocks(64,compress);
return{
update(chunk){state.update(chunk);},
digest(){
state.finish(8,(view,at,bytes)=>{
const{hi,lo}=bitLength(bytes);
view.setUint32(at,lo,true);
view.setUint32(at+4,hi,true);
});
const out=new Uint8Array(16);
const view=new DataView(out.buffer);
view.setInt32(0,a0,true);
view.setInt32(4,b0,true);
view.setInt32(8,c0,true);
view.setInt32(12,d0,true);
return out;
},
};
}
