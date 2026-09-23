/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const MODULUS=0x11d;
const EXP=new Uint8Array(512);
const LOG=new Uint8Array(256);
(()=>{
let x=1;
for(let i=0;i<255;i+=1){
EXP[i]=x;
LOG[x]=i;
x<<=1;
if(x&0x100)x^=MODULUS;
}
for(let i=255;i<512;i+=1)EXP[i]=EXP[i-255];
})();
export function multiply(a,b){
if(a===0||b===0)return 0;
return EXP[LOG[a]+LOG[b]];
}
export function generator(degree){
let poly=new Uint8Array([1]);
for(let i=0;i<degree;i+=1){
const next=new Uint8Array(poly.length+1);
for(let j=0;j<poly.length;j+=1){
next[j]^=poly[j];
next[j+1]^=multiply(poly[j],EXP[i]);
}
poly=next;
}
return poly.subarray(1);
}
const generators=new Map();
function generatorFor(degree){
let poly=generators.get(degree);
if(!poly){
poly=generator(degree);
generators.set(degree,poly);
}
return poly;
}
export function remainder(data,degree){
const poly=generatorFor(degree);
const result=new Uint8Array(degree);
for(const byte of data){
const factor=byte^result[0];
result.copyWithin(0,1);
result[degree-1]=0;
if(factor===0)continue;
for(let i=0;i<degree;i+=1)result[i]^=multiply(poly[i],factor);
}
return result;
}
