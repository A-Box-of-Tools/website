/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const MINIMUM_DIMENSION=40;
const BLOCK_POWER=3;
const BLOCK_SIZE=1<<BLOCK_POWER;
const MIN_DYNAMIC_RANGE=24;
export function grayscale(data,width,height){
const gray=new Uint8Array(width*height);
for(let i=0;i<gray.length;i+=1){
const at=i*4;
const alpha=data[at+3];
if(alpha===255){
gray[i]=(data[at]*77+data[at+1]*151+data[at+2]*28)>>8;
}else{
const k=alpha/255;
const r=data[at]*k+255*(1-k);
const g=data[at+1]*k+255*(1-k);
const b=data[at+2]*k+255*(1-k);
gray[i]=(r*77+g*151+b*28)>>8;
}
}
return gray;
}
export function otsuThreshold(gray){
const histogram=new Uint32Array(256);
for(const value of gray)histogram[value]+=1;
const total=gray.length;
let sum=0;
for(let i=0;i<256;i+=1)sum+=i*histogram[i];
let sumBelow=0;
let countBelow=0;
let best=0;
let bestVariance=-1;
for(let t=0;t<256;t+=1){
countBelow+=histogram[t];
if(countBelow===0)continue;
const countAbove=total-countBelow;
if(countAbove===0)break;
sumBelow+=t*histogram[t];
const meanBelow=sumBelow/countBelow;
const meanAbove=(sum-sumBelow)/countAbove;
const variance=countBelow*countAbove*(meanBelow-meanAbove)**2;
if(variance>bestVariance){
bestVariance=variance;
best=t;
}
}
return best;
}
export function globalBinarize(gray,width,height){
const threshold=otsuThreshold(gray);
const bits=new Uint8Array(width*height);
for(let i=0;i<bits.length;i+=1)bits[i]=gray[i]<=threshold?1:0;
return bits;
}
export function localBinarize(gray,width,height){
if(width<MINIMUM_DIMENSION||height<MINIMUM_DIMENSION){
return globalBinarize(gray,width,height);
}
const across=Math.ceil(width/BLOCK_SIZE);
const down=Math.ceil(height/BLOCK_SIZE);
const points=new Uint8Array(across*down);
for(let by=0;by<down;by+=1){
const top=Math.min(by*BLOCK_SIZE,height-BLOCK_SIZE);
for(let bx=0;bx<across;bx+=1){
const left=Math.min(bx*BLOCK_SIZE,width-BLOCK_SIZE);
let sum=0;
let min=255;
let max=0;
for(let y=0;y<BLOCK_SIZE;y+=1){
const row=(top+y)*width+left;
for(let x=0;x<BLOCK_SIZE;x+=1){
const value=gray[row+x];
sum+=value;
if(value<min)min=value;
if(value>max)max=value;
}
}
let average;
if(max-min>MIN_DYNAMIC_RANGE){
average=sum>>(BLOCK_POWER*2);
}else{
average=min>>1;
if(by>0&&bx>0){
const neighbours=(points[(by-1)*across+bx]
+2*points[by*across+bx-1]
+points[(by-1)*across+bx-1])>>2;
if(min<neighbours)average=neighbours;
}
}
points[by*across+bx]=average;
}
}
const bits=new Uint8Array(width*height);
for(let by=0;by<down;by+=1){
const top=Math.min(by*BLOCK_SIZE,height-BLOCK_SIZE);
const yFrom=Math.max(by-2,0);
const yTo=Math.min(by+2,down-1);
for(let bx=0;bx<across;bx+=1){
const left=Math.min(bx*BLOCK_SIZE,width-BLOCK_SIZE);
const xFrom=Math.max(bx-2,0);
const xTo=Math.min(bx+2,across-1);
let total=0;
let count=0;
for(let y=yFrom;y<=yTo;y+=1){
for(let x=xFrom;x<=xTo;x+=1){
total+=points[y*across+x];
count+=1;
}
}
const threshold=total/count;
for(let y=0;y<BLOCK_SIZE;y+=1){
const row=(top+y)*width+left;
for(let x=0;x<BLOCK_SIZE;x+=1){
bits[row+x]=gray[row+x]<=threshold?1:0;
}
}
}
}
return bits;
}
export function blur(gray,width,height){
const out=new Uint8Array(gray.length);
for(let y=0;y<height;y+=1){
const up=Math.max(y-1,0)*width;
const here=y*width;
const down=Math.min(y+1,height-1)*width;
for(let x=0;x<width;x+=1){
const left=Math.max(x-1,0);
const right=Math.min(x+1,width-1);
out[here+x]=(gray[up+left]+gray[up+x]+gray[up+right]
+gray[here+left]+gray[here+x]+gray[here+right]
+gray[down+left]+gray[down+x]+gray[down+right])/9;
}
}
return out;
}
export function invert(bits){
const out=new Uint8Array(bits.length);
for(let i=0;i<bits.length;i+=1)out[i]=bits[i]^1;
return out;
}
