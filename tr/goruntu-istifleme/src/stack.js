/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const RGB=3;
const SORT_DIRECTLY_UP_TO=512;
export function createStack(mode,options){
const build=BUILDERS[mode];
if(!build)throw new RangeError(`unknown mode: ${mode}`);
const{width,height,frames}=options;
if(!(width>0)||!(height>0))throw new RangeError('a band with no size');
if(!(frames>0))throw new RangeError('a stack of no frames');
const given={};
for(const[key,value]of Object.entries(options)){
if(value!==undefined)given[key]=value;
}
return build({kappa:2,gain:1,radius:3,...given,pixels:width*height});
}
function pack(pixels,gain,value){
const out=new Uint8ClampedArray(pixels*4);
for(let i=0,at=0;i<pixels;i+=1,at+=4){
out[at]=value(i*RGB)*gain;
out[at+1]=value(i*RGB+1)*gain;
out[at+2]=value(i*RGB+2)*gain;
out[at+3]=255;
}
return out;
}
function meanStack({pixels,gain}){
const sum=new Float32Array(pixels*RGB);
let counted=0;
return{
passes:1,
beginPass(){},
add(rgba){
for(let i=0,at=0;i<pixels;i+=1,at+=4){
const to=i*RGB;
sum[to]+=rgba[at];
sum[to+1]+=rgba[at+1];
sum[to+2]+=rgba[at+2];
}
counted+=1;
},
endPass(){},
result(){
const divisor=counted||1;
return pack(pixels,gain,(at)=>sum[at]/divisor);
},
};
}
function sumStack({pixels,gain}){
const sum=new Float32Array(pixels*RGB);
return{
passes:1,
beginPass(){},
add(rgba){
for(let i=0,at=0;i<pixels;i+=1,at+=4){
const to=i*RGB;
sum[to]+=rgba[at];
sum[to+1]+=rgba[at+1];
sum[to+2]+=rgba[at+2];
}
},
endPass(){},
result(){
return pack(pixels,gain,(at)=>sum[at]);
},
};
}
function extremeStack({pixels,gain},keepHigher){
const best=new Uint8Array(pixels*RGB);
if(!keepHigher)best.fill(255);
let seen=false;
return{
passes:1,
beginPass(){},
add(rgba){
for(let i=0,at=0;i<pixels;i+=1,at+=4){
const to=i*RGB;
for(let c=0;c<RGB;c+=1){
const value=rgba[at+c];
if(keepHigher?value>best[to+c]:value<best[to+c])best[to+c]=value;
}
}
seen=true;
},
endPass(){},
result(){
if(!seen)return new Uint8ClampedArray(pixels*4);
return pack(pixels,gain,(at)=>best[at]);
},
};
}
function medianStack({pixels,frames,gain}){
const channels=pixels*RGB;
const store=new Uint8Array(channels*frames);
let counted=0;
return{
passes:1,
beginPass(){},
add(rgba,index){
const base=(index??counted)*channels;
for(let i=0,at=0;i<pixels;i+=1,at+=4){
const to=base+i*RGB;
store[to]=rgba[at];
store[to+1]=rgba[at+1];
store[to+2]=rgba[at+2];
}
counted=Math.max(counted,(index??counted)+1);
},
endPass(){},
result(){
const n=counted||1;
const out=new Uint8ClampedArray(pixels*4);
const chunk=Math.min(channels,8192);
const scratch=new Uint8Array(chunk*n);
const values=new Uint8Array(n);
for(let start=0;start<channels;start+=chunk){
const take=Math.min(chunk,channels-start);
for(let f=0;f<n;f+=1){
scratch.set(store.subarray(f*channels+start,f*channels+start+take),f*chunk);
}
for(let j=0;j<take;j+=1){
for(let f=0;f<n;f+=1)values[f]=scratch[f*chunk+j];
const middle=medianOf(values,n);
const channel=start+j;
const pixel=(channel/RGB)|0;
out[pixel*4+(channel-pixel*RGB)]=middle*gain;
}
}
for(let i=0;i<pixels;i+=1)out[i*4+3]=255;
return out;
},
};
}
export function medianOf(values,n=values.length){
if(n===1)return values[0];
if(n<=SORT_DIRECTLY_UP_TO){
for(let i=1;i<n;i+=1){
const value=values[i];
let j=i-1;
while(j>=0&&values[j]>value){
values[j+1]=values[j];
j-=1;
}
values[j+1]=value;
}
}else{
const sorted=Array.prototype.slice.call(values,0,n).sort((a,b)=>a-b);
for(let i=0;i<n;i+=1)values[i]=sorted[i];
}
const half=n>>1;
return n&1?values[half]:(values[half-1]+values[half])/2;
}
function sigmaStack({pixels,kappa,gain}){
const channels=pixels*RGB;
const mean=new Uint8Array(channels);
const SPREAD_STEPS=8;
const spread=new Uint8Array(channels);
let sum=new Float32Array(channels);
let squares=new Float32Array(channels);
let counted=0;
let clipped=null;
let kept=null;
return{
passes:2,
beginPass(pass){
if(pass===1){
clipped=new Float32Array(channels);
kept=new Uint16Array(channels);
}
},
add(rgba,index,pass){
if(pass===0){
for(let i=0,at=0;i<pixels;i+=1,at+=4){
const to=i*RGB;
for(let c=0;c<RGB;c+=1){
const value=rgba[at+c];
sum[to+c]+=value;
squares[to+c]+=value*value;
}
}
counted+=1;
return;
}
for(let i=0,at=0;i<pixels;i+=1,at+=4){
const to=i*RGB;
for(let c=0;c<RGB;c+=1){
const value=rgba[at+c];
const limit=spread[to+c]/SPREAD_STEPS;
if(Math.abs(value-mean[to+c])<=limit){
clipped[to+c]+=value;
kept[to+c]+=1;
}
}
}
},
endPass(pass){
if(pass!==0)return;
const n=counted||1;
for(let i=0;i<channels;i+=1){
const average=sum[i]/n;
const variance=Math.max(0,squares[i]/n-average*average);
mean[i]=Math.round(average);
spread[i]=Math.min(255,Math.round(Math.sqrt(variance)*kappa*SPREAD_STEPS));
}
sum=null;
squares=null;
},
result(){
return pack(pixels,gain,(at)=>(
kept&&kept[at]?clipped[at]/kept[at]:mean[at]
));
},
};
}
function focusStack({pixels,width,height,radius,gain}){
const best=new Uint8Array(pixels*RGB);
const score=new Float32Array(pixels);
const luma=new Float32Array(pixels);
const sharp=new Float32Array(pixels);
score.fill(-1);
return{
passes:1,
beginPass(){},
add(rgba){
for(let i=0,at=0;i<pixels;i+=1,at+=4){
luma[i]=rgba[at]*0.299+rgba[at+1]*0.587+rgba[at+2]*0.114;
}
laplacian(luma,sharp,width,height);
boxBlur(sharp,luma,width,height,radius);
for(let i=0;i<pixels;i+=1){
if(sharp[i]>score[i]){
score[i]=sharp[i];
const to=i*RGB;
const at=i*4;
best[to]=rgba[at];
best[to+1]=rgba[at+1];
best[to+2]=rgba[at+2];
}
}
},
endPass(){},
result(){
return pack(pixels,gain,(at)=>best[at]);
},
};
}
export function laplacian(source,out,width,height){
out.fill(0);
for(let y=1;y<height-1;y+=1){
const row=y*width;
for(let x=1;x<width-1;x+=1){
const at=row+x;
out[at]=Math.abs(
4*source[at]-source[at-1]-source[at+1]
-source[at-width]-source[at+width],
);
}
}
}
export function boxBlur(values,scratch,width,height,radius){
if(radius<1)return;
for(let y=0;y<height;y+=1){
const row=y*width;
let total=0;
for(let x=0;x<Math.min(radius,width);x+=1)total+=values[row+x];
for(let x=0;x<width;x+=1){
const entering=x+radius;
const leaving=x-radius-1;
if(entering<width)total+=values[row+entering];
if(leaving>=0)total-=values[row+leaving];
const from=Math.max(0,x-radius);
const to=Math.min(width-1,x+radius);
scratch[row+x]=total/(to-from+1);
}
}
for(let x=0;x<width;x+=1){
let total=0;
for(let y=0;y<Math.min(radius,height);y+=1)total+=scratch[y*width+x];
for(let y=0;y<height;y+=1){
const entering=y+radius;
const leaving=y-radius-1;
if(entering<height)total+=scratch[entering*width+x];
if(leaving>=0)total-=scratch[leaving*width+x];
const from=Math.max(0,y-radius);
const to=Math.min(height-1,y+radius);
values[y*width+x]=total/(to-from+1);
}
}
}
const BUILDERS={
mean:meanStack,
sum:sumStack,
max:(options)=>extremeStack(options,true),
min:(options)=>extremeStack(options,false),
median:medianStack,
sigma:sigmaStack,
focus:focusStack,
};
