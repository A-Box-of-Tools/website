/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{bitLength,blocks}from'./blocks.js';
const K_HI=new Int32Array([
0x428a2f98|0,0x71374491|0,0xb5c0fbcf|0,0xe9b5dba5|0,
0x3956c25b|0,0x59f111f1|0,0x923f82a4|0,0xab1c5ed5|0,
0xd807aa98|0,0x12835b01|0,0x243185be|0,0x550c7dc3|0,
0x72be5d74|0,0x80deb1fe|0,0x9bdc06a7|0,0xc19bf174|0,
0xe49b69c1|0,0xefbe4786|0,0x0fc19dc6|0,0x240ca1cc|0,
0x2de92c6f|0,0x4a7484aa|0,0x5cb0a9dc|0,0x76f988da|0,
0x983e5152|0,0xa831c66d|0,0xb00327c8|0,0xbf597fc7|0,
0xc6e00bf3|0,0xd5a79147|0,0x06ca6351|0,0x14292967|0,
0x27b70a85|0,0x2e1b2138|0,0x4d2c6dfc|0,0x53380d13|0,
0x650a7354|0,0x766a0abb|0,0x81c2c92e|0,0x92722c85|0,
0xa2bfe8a1|0,0xa81a664b|0,0xc24b8b70|0,0xc76c51a3|0,
0xd192e819|0,0xd6990624|0,0xf40e3585|0,0x106aa070|0,
0x19a4c116|0,0x1e376c08|0,0x2748774c|0,0x34b0bcb5|0,
0x391c0cb3|0,0x4ed8aa4a|0,0x5b9cca4f|0,0x682e6ff3|0,
0x748f82ee|0,0x78a5636f|0,0x84c87814|0,0x8cc70208|0,
0x90befffa|0,0xa4506ceb|0,0xbef9a3f7|0,0xc67178f2|0,
0xca273ece|0,0xd186b8c7|0,0xeada7dd6|0,0xf57d4f7f|0,
0x06f067aa|0,0x0a637dc5|0,0x113f9804|0,0x1b710b35|0,
0x28db77f5|0,0x32caab7b|0,0x3c9ebe0a|0,0x431d67c4|0,
0x4cc5d4be|0,0x597f299c|0,0x5fcb6fab|0,0x6c44198c|0,
]);
const K_LO=new Int32Array([
0xd728ae22|0,0x23ef65cd|0,0xec4d3b2f|0,0x8189dbbc|0,
0xf348b538|0,0xb605d019|0,0xaf194f9b|0,0xda6d8118|0,
0xa3030242|0,0x45706fbe|0,0x4ee4b28c|0,0xd5ffb4e2|0,
0xf27b896f|0,0x3b1696b1|0,0x25c71235|0,0xcf692694|0,
0x9ef14ad2|0,0x384f25e3|0,0x8b8cd5b5|0,0x77ac9c65|0,
0x592b0275|0,0x6ea6e483|0,0xbd41fbd4|0,0x831153b5|0,
0xee66dfab|0,0x2db43210|0,0x98fb213f|0,0xbeef0ee4|0,
0x3da88fc2|0,0x930aa725|0,0xe003826f|0,0x0a0e6e70|0,
0x46d22ffc|0,0x5c26c926|0,0x5ac42aed|0,0x9d95b3df|0,
0x8baf63de|0,0x3c77b2a8|0,0x47edaee6|0,0x1482353b|0,
0x4cf10364|0,0xbc423001|0,0xd0f89791|0,0x0654be30|0,
0xd6ef5218|0,0x5565a910|0,0x5771202a|0,0x32bbd1b8|0,
0xb8d2d0c8|0,0x5141ab53|0,0xdf8eeb99|0,0xe19b48a8|0,
0xc5c95a63|0,0xe3418acb|0,0x7763e373|0,0xd6b2b8a3|0,
0x5defb2fc|0,0x43172f60|0,0xa1f0ab72|0,0x1a6439ec|0,
0x23631e28|0,0xde82bde9|0,0xb2c67915|0,0xe372532b|0,
0xea26619c|0,0x21c0c207|0,0xcde0eb1e|0,0xee6ed178|0,
0x72176fba|0,0xa2c898a6|0,0xbef90dae|0,0x131c471b|0,
0x23047d84|0,0x40c72493|0,0x15c9bebc|0,0x9c100d4c|0,
0xcb3e42b6|0,0xfc657e2a|0,0x3ad6faec|0,0x4a475817|0,
]);
const INIT_512_HI=new Int32Array([
0x6a09e667|0,0xbb67ae85|0,0x3c6ef372|0,0xa54ff53a|0,
0x510e527f|0,0x9b05688c|0,0x1f83d9ab|0,0x5be0cd19|0,
]);
const INIT_512_LO=new Int32Array([
0xf3bcc908|0,0x84caa73b|0,0xfe94f82b|0,0x5f1d36f1|0,
0xade682d1|0,0x2b3e6c1f|0,0xfb41bd6b|0,0x137e2179|0,
]);
const INIT_384_HI=new Int32Array([
0xcbbb9d5d|0,0x629a292a|0,0x9159015a|0,0x152fecd8|0,
0x67332667|0,0x8eb44a87|0,0xdb0c2e0d|0,0x47b5481d|0,
]);
const INIT_384_LO=new Int32Array([
0xc1059ed8|0,0x367cd507|0,0x3070dd17|0,0xf70e5939|0,
0xffc00b31|0,0x68581511|0,0x64f98fa7|0,0xbefa4fa4|0,
]);
function sha512Family(initHi,initLo,outBytes){
const hHi=Int32Array.from(initHi);
const hLo=Int32Array.from(initLo);
const wHi=new Int32Array(80);
const wLo=new Int32Array(80);
const compress=(view)=>{
for(let i=0;i<16;i+=1){
wHi[i]=view.getInt32(i*8,false);
wLo[i]=view.getInt32(i*8+4,false);
}
for(let i=16;i<80;i+=1){
const xh=wHi[i-15];
const xl=wLo[i-15];
const s0h=((xh>>>1)|(xl<<31))^((xh>>>8)|(xl<<24))^(xh>>>7);
const s0l=((xl>>>1)|(xh<<31))^((xl>>>8)|(xh<<24))^((xl>>>7)|(xh<<25));
const yh=wHi[i-2];
const yl=wLo[i-2];
const s1h=((yh>>>19)|(yl<<13))^((yl>>>29)|(yh<<3))^(yh>>>6);
const s1l=((yl>>>19)|(yh<<13))^((yh>>>29)|(yl<<3))^((yl>>>6)|(yh<<26));
const lo=(wLo[i-16]>>>0)+(s0l>>>0)+(wLo[i-7]>>>0)+(s1l>>>0);
wHi[i]=(wHi[i-16]+s0h+wHi[i-7]+s1h+Math.floor(lo/0x100000000))|0;
wLo[i]=lo|0;
}
let ah=hHi[0];
let al=hLo[0];
let bh=hHi[1];
let bl=hLo[1];
let ch=hHi[2];
let cl=hLo[2];
let dh=hHi[3];
let dl=hLo[3];
let eh=hHi[4];
let el=hLo[4];
let fh=hHi[5];
let fl=hLo[5];
let gh=hHi[6];
let gl=hLo[6];
let hh=hHi[7];
let hl=hLo[7];
for(let i=0;i<80;i+=1){
const s1h=((eh>>>14)|(el<<18))^((eh>>>18)|(el<<14))^((el>>>9)|(eh<<23));
const s1l=((el>>>14)|(eh<<18))^((el>>>18)|(eh<<14))^((eh>>>9)|(el<<23));
const chooseH=(eh&fh)^(~eh&gh);
const chooseL=(el&fl)^(~el&gl);
const t1l=(hl>>>0)+(s1l>>>0)+(chooseL>>>0)+(K_LO[i]>>>0)+(wLo[i]>>>0);
const t1h=(hh+s1h+chooseH+K_HI[i]+wHi[i]+Math.floor(t1l/0x100000000))|0;
const s0h=((ah>>>28)|(al<<4))^((al>>>2)|(ah<<30))^((al>>>7)|(ah<<25));
const s0l=((al>>>28)|(ah<<4))^((ah>>>2)|(al<<30))^((ah>>>7)|(al<<25));
const majH=(ah&bh)^(ah&ch)^(bh&ch);
const majL=(al&bl)^(al&cl)^(bl&cl);
const t2l=(s0l>>>0)+(majL>>>0);
const t2h=(s0h+majH+Math.floor(t2l/0x100000000))|0;
hh=gh;
hl=gl;
gh=fh;
gl=fl;
fh=eh;
fl=el;
const nextEl=(dl>>>0)+((t1l|0)>>>0);
eh=(dh+t1h+Math.floor(nextEl/0x100000000))|0;
el=nextEl|0;
dh=ch;
dl=cl;
ch=bh;
cl=bl;
bh=ah;
bl=al;
const nextAl=((t1l|0)>>>0)+((t2l|0)>>>0);
ah=(t1h+t2h+Math.floor(nextAl/0x100000000))|0;
al=nextAl|0;
}
const add=(i,vh,vl)=>{
const lo=(hLo[i]>>>0)+(vl>>>0);
hHi[i]=(hHi[i]+vh+Math.floor(lo/0x100000000))|0;
hLo[i]=lo|0;
};
add(0,ah,al);
add(1,bh,bl);
add(2,ch,cl);
add(3,dh,dl);
add(4,eh,el);
add(5,fh,fl);
add(6,gh,gl);
add(7,hh,hl);
};
const state=blocks(128,compress);
return{
update(chunk){state.update(chunk);},
digest(){
state.finish(16,(view,at,bytes)=>{
const{hi,lo}=bitLength(bytes);
view.setUint32(at+8,hi,false);
view.setUint32(at+12,lo,false);
});
const out=new Uint8Array(outBytes);
const view=new DataView(out.buffer);
for(let i=0;i*8<outBytes;i+=1){
view.setInt32(i*8,hHi[i],false);
view.setInt32(i*8+4,hLo[i],false);
}
return out;
},
};
}
export function sha512(){
return sha512Family(INIT_512_HI,INIT_512_LO,64);
}
export function sha384(){
return sha512Family(INIT_384_HI,INIT_384_LO,48);
}
