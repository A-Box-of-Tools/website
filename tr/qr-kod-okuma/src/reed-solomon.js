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
function power(exponent){
return EXP[((exponent%255)+255)%255];
}
function inverse(a){
return EXP[255-LOG[a]];
}
function evaluate(poly,x){
let value=0;
for(let i=poly.length-1;i>=0;i-=1)value=multiply(value,x)^poly[i];
return value;
}
function multiplyPoly(a,b,limit){
const length=Math.min(a.length+b.length-1,limit);
const out=new Uint8Array(Math.max(length,1));
for(let i=0;i<a.length;i+=1){
if(a[i]===0)continue;
for(let j=0;j<b.length&&i+j<out.length;j+=1){
out[i+j]^=multiply(a[i],b[j]);
}
}
return out;
}
function syndromes(block,count){
const out=new Uint8Array(count);
for(let j=0;j<count;j+=1){
let value=0;
for(const codeword of block)value=multiply(value,EXP[j])^codeword;
out[j]=value;
}
return out;
}
function errorLocator(syndrome){
let lambda=new Uint8Array([1]);
let previous=new Uint8Array([1]);
let degree=0;
let shift=1;
let last=1;
for(let n=0;n<syndrome.length;n+=1){
let delta=syndrome[n];
for(let i=1;i<=degree&&i<lambda.length;i+=1){
delta^=multiply(lambda[i],syndrome[n-i]);
}
if(delta===0){
shift+=1;
continue;
}
const scale=multiply(delta,inverse(last));
const updated=new Uint8Array(Math.max(lambda.length,previous.length+shift));
updated.set(lambda);
for(let i=0;i<previous.length;i+=1){
updated[i+shift]^=multiply(scale,previous[i]);
}
if(2*degree<=n){
previous=lambda;
last=delta;
degree=n+1-degree;
shift=1;
}else{
shift+=1;
}
lambda=updated;
}
let end=lambda.length;
while(end>1&&lambda[end-1]===0)end-=1;
return lambda.subarray(0,end);
}
function errorPositions(lambda,length){
const positions=[];
for(let p=0;p<255;p+=1){
if(evaluate(lambda,power(-p))!==0)continue;
if(p>=length)return null;
positions.push(p);
}
return positions.length===lambda.length-1?positions:null;
}
export function correct(block,ecCount){
const syndrome=syndromes(block,ecCount);
if(syndrome.every((value)=>value===0))return 0;
const lambda=errorLocator(syndrome);
const positions=errorPositions(lambda,block.length);
if(!positions||positions.length===0)return-1;
const omega=multiplyPoly(syndrome,lambda,ecCount);
const derivative=new Uint8Array(Math.max(lambda.length-1,1));
for(let i=1;i<lambda.length;i+=2)derivative[i-1]=lambda[i];
for(const p of positions){
const bottom=evaluate(derivative,power(-p));
if(bottom===0)return-1;
const top=evaluate(omega,power(-p));
block[block.length-1-p]^=multiply(power(p),multiply(top,inverse(bottom)));
}
if(!syndromes(block,ecCount).every((value)=>value===0))return-1;
return positions.length;
}
