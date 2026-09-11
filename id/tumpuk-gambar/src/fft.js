/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function isPowerOfTwo(n){
return Number.isInteger(n)&&n>=2&&(n&(n-1))===0;
}
const TABLES=new Map();
function tableFor(n){
let table=TABLES.get(n);
if(!table){
const cos=new Float64Array(n/2);
const sin=new Float64Array(n/2);
for(let i=0;i<n/2;i+=1){
cos[i]=Math.cos((-2*Math.PI*i)/n);
sin[i]=Math.sin((-2*Math.PI*i)/n);
}
table={cos,sin};
TABLES.set(n,table);
}
return table;
}
export function fft(re,im,n,inverse=false,offset=0,stride=1){
if(!isPowerOfTwo(n))throw new RangeError(`fft size must be a power of two, got ${n}`);
if(inverse){
for(let i=0;i<n;i+=1)im[offset+i*stride]=-im[offset+i*stride];
}
for(let i=1,j=0;i<n;i+=1){
let bit=n>>1;
for(;j&bit;bit>>=1)j^=bit;
j^=bit;
if(i<j){
const a=offset+i*stride;
const b=offset+j*stride;
const tempRe=re[a];re[a]=re[b];re[b]=tempRe;
const tempIm=im[a];im[a]=im[b];im[b]=tempIm;
}
}
const{cos,sin}=tableFor(n);
for(let len=2;len<=n;len<<=1){
const half=len>>1;
const step=n/len;
for(let start=0;start<n;start+=len){
for(let k=0;k<half;k+=1){
const wRe=cos[k*step];
const wIm=sin[k*step];
const a=offset+(start+k)*stride;
const b=offset+(start+k+half)*stride;
const bRe=re[b]*wRe-im[b]*wIm;
const bIm=re[b]*wIm+im[b]*wRe;
re[b]=re[a]-bRe;
im[b]=im[a]-bIm;
re[a]+=bRe;
im[a]+=bIm;
}
}
}
if(inverse){
for(let i=0;i<n;i+=1){
const at=offset+i*stride;
re[at]/=n;
im[at]=-im[at]/n;
}
}
}
export function fft2(re,im,size,inverse=false){
if(!isPowerOfTwo(size))throw new RangeError(`fft2 size must be a power of two, got ${size}`);
for(let y=0;y<size;y+=1)fft(re,im,size,inverse,y*size,1);
for(let x=0;x<size;x+=1)fft(re,im,size,inverse,x,size);
}
