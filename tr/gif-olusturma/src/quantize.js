/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const BINS=32768;
export const ALPHA_CUTOFF=128;
const binOf=(r,g,b)=>((r>>3)<<10)|((g>>3)<<5)|(b>>3);
export function createHistogram(){
return{
counts:new Uint32Array(BINS),
sumR:new Float64Array(BINS),
sumG:new Float64Array(BINS),
sumB:new Float64Array(BINS),
pixels:0,
};
}
export function addToHistogram(histogram,rgba,keepTransparent=false){
const{counts,sumR,sumG,sumB}=histogram;
let pixels=0;
for(let i=0;i<rgba.length;i+=4){
if(keepTransparent&&rgba[i+3]<ALPHA_CUTOFF)continue;
const r=rgba[i];
const g=rgba[i+1];
const b=rgba[i+2];
const bin=binOf(r,g,b);
counts[bin]+=1;
sumR[bin]+=r;
sumG[bin]+=g;
sumB[bin]+=b;
pixels+=1;
}
histogram.pixels+=pixels;
return histogram;
}
export function buildPalette(histogram,maxColors){
const{counts,sumR,sumG,sumB}=histogram;
const occupied=[];
for(let bin=0;bin<BINS;bin+=1){
if(counts[bin]!==0)occupied.push(bin);
}
if(occupied.length===0)return new Uint8Array([0,0,0]);
const order=Int32Array.from(occupied);
const wanted=Math.max(1,Math.min(256,Math.floor(maxColors)));
const pixelsIn=(lo,hi)=>{
let total=0;
for(let i=lo;i<hi;i+=1)total+=counts[order[i]];
return{lo,hi,pixels:total};
};
const boxes=[pixelsIn(0,order.length)];
while(boxes.length<wanted){
let chosen=-1;
let most=0;
for(let i=0;i<boxes.length;i+=1){
const box=boxes[i];
if(box.hi-box.lo<2)continue;
if(box.pixels>most){
most=box.pixels;
chosen=i;
}
}
if(chosen===-1)break;
const box=boxes[chosen];
const at=splitPoint(order,counts,box);
boxes[chosen]=pixelsIn(box.lo,at);
boxes.push(pixelsIn(at,box.hi));
}
const palette=new Uint8Array(boxes.length*3);
for(let i=0;i<boxes.length;i+=1){
let pixels=0;
let r=0;
let g=0;
let b=0;
for(let j=boxes[i].lo;j<boxes[i].hi;j+=1){
const bin=order[j];
pixels+=counts[bin];
r+=sumR[bin];
g+=sumG[bin];
b+=sumB[bin];
}
if(pixels===0)continue;
palette[i*3]=Math.round(r/pixels);
palette[i*3+1]=Math.round(g/pixels);
palette[i*3+2]=Math.round(b/pixels);
}
return palette;
}
function splitPoint(order,counts,box){
let rMin=31;let rMax=0;
let gMin=31;let gMax=0;
let bMin=31;let bMax=0;
for(let i=box.lo;i<box.hi;i+=1){
const bin=order[i];
const r=(bin>>10)&31;
const g=(bin>>5)&31;
const b=bin&31;
if(r<rMin)rMin=r;
if(r>rMax)rMax=r;
if(g<gMin)gMin=g;
if(g>gMax)gMax=g;
if(b<bMin)bMin=b;
if(b>bMax)bMax=b;
}
const spreadR=(rMax-rMin)*2;
const spreadG=(gMax-gMin)*3;
const spreadB=bMax-bMin;
let shift=10;
if(spreadG>=spreadR&&spreadG>=spreadB)shift=5;
else if(spreadB>spreadR&&spreadB>spreadG)shift=0;
const slice=Array.from(order.subarray(box.lo,box.hi));
slice.sort((a,b)=>((a>>shift)&31)-((b>>shift)&31));
order.set(slice,box.lo);
const half=box.pixels/2;
let running=0;
for(let i=box.lo;i<box.hi-1;i+=1){
running+=counts[order[i]];
if(running>=half)return i+1;
}
return box.hi-1;
}
function nearest(palette,from,r,g,b){
const entries=palette.length/3;
let bestIndex=from;
let bestDistance=Infinity;
for(let i=from;i<entries;i+=1){
const dr=r-palette[i*3];
const dg=g-palette[i*3+1];
const db=b-palette[i*3+2];
const distance=dr*dr*2+dg*dg*3+db*db;
if(distance<bestDistance){
bestDistance=distance;
bestIndex=i;
if(distance===0)break;
}
}
return bestIndex;
}
const clamp255=(value)=>(value<0?0:(value>255?255:value));
export function mapFrame(rgba,width,height,palette,options={}){
const{dither=true,from=0,transparentIndex=-1}=options;
const indices=new Uint8Array(width*height);
const cache=new Int16Array(BINS).fill(-1);
const lookup=(r,g,b)=>{
const bin=binOf(r,g,b);
const remembered=cache[bin];
if(remembered>=0)return remembered;
const found=nearest(palette,from,r,g,b);
cache[bin]=found;
return found;
};
if(!dither){
for(let p=0;p<indices.length;p+=1){
const i=p*4;
if(transparentIndex>=0&&rgba[i+3]<ALPHA_CUTOFF){
indices[p]=transparentIndex;
continue;
}
indices[p]=lookup(rgba[i],rgba[i+1],rgba[i+2]);
}
return indices;
}
const work=new Float32Array(width*height*3);
for(let p=0;p<indices.length;p+=1){
work[p*3]=rgba[p*4];
work[p*3+1]=rgba[p*4+1];
work[p*3+2]=rgba[p*4+2];
}
for(let y=0;y<height;y+=1){
const rightwards=(y&1)===0;
const start=rightwards?0:width-1;
const step=rightwards?1:-1;
for(let n=0;n<width;n+=1){
const x=start+n*step;
const p=y*width+x;
if(transparentIndex>=0&&rgba[p*4+3]<ALPHA_CUTOFF){
indices[p]=transparentIndex;
continue;
}
const r=clamp255(work[p*3]);
const g=clamp255(work[p*3+1]);
const b=clamp255(work[p*3+2]);
const index=lookup(r,g,b);
indices[p]=index;
const errR=r-palette[index*3];
const errG=g-palette[index*3+1];
const errB=b-palette[index*3+2];
spread(work,width,height,x+step,y,errR,errG,errB,7/16);
spread(work,width,height,x-step,y+1,errR,errG,errB,3/16);
spread(work,width,height,x,y+1,errR,errG,errB,5/16);
spread(work,width,height,x+step,y+1,errR,errG,errB,1/16);
}
}
return indices;
}
function spread(work,width,height,x,y,errR,errG,errB,share){
if(x<0||x>=width||y<0||y>=height)return;
const w=(y*width+x)*3;
work[w]+=errR*share;
work[w+1]+=errG*share;
work[w+2]+=errB*share;
}
