/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{bitLength,blocks}from'./blocks.js?v=37afe7ce81';
export function sha1(){
let h0=0x67452301|0;
let h1=0xefcdab89|0;
let h2=0x98badcfe|0;
let h3=0x10325476|0;
let h4=0xc3d2e1f0|0;
const w=new Int32Array(80);
const compress=(view)=>{
for(let i=0;i<16;i+=1)w[i]=view.getInt32(i*4,false);
for(let i=16;i<80;i+=1){
const x=w[i-3]^w[i-8]^w[i-14]^w[i-16];
w[i]=(x<<1)|(x>>>31);
}
let a=h0;
let b=h1;
let c=h2;
let d=h3;
let e=h4;
for(let i=0;i<80;i+=1){
let f;
let k;
if(i<20){
f=(b&c)|(~b&d);
k=0x5a827999|0;
}else if(i<40){
f=b^c^d;
k=0x6ed9eba1|0;
}else if(i<60){
f=(b&c)|(b&d)|(c&d);
k=0x8f1bbcdc|0;
}else{
f=b^c^d;
k=0xca62c1d6|0;
}
const t=(((a<<5)|(a>>>27))+f+e+k+w[i])|0;
e=d;
d=c;
c=(b<<30)|(b>>>2);
b=a;
a=t;
}
h0=(h0+a)|0;
h1=(h1+b)|0;
h2=(h2+c)|0;
h3=(h3+d)|0;
h4=(h4+e)|0;
};
const state=blocks(64,compress);
return{
update(chunk){state.update(chunk);},
digest(){
state.finish(8,(view,at,bytes)=>{
const{hi,lo}=bitLength(bytes);
view.setUint32(at,hi,false);
view.setUint32(at+4,lo,false);
});
const out=new Uint8Array(20);
const view=new DataView(out.buffer);
view.setInt32(0,h0,false);
view.setInt32(4,h1,false);
view.setInt32(8,h2,false);
view.setInt32(12,h3,false);
view.setInt32(16,h4,false);
return out;
},
};
}
