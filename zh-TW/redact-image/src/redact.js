/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{blockSize,blurRadius,clampRect}from'./regions.js';
export const FILL=[0,0,0];
export function fillRegion(image,rect,colour=FILL){
const{data,width}=image;
const[r,g,b]=colour;
for(let y=rect.y;y<rect.y+rect.height;y+=1){
let at=(y*width+rect.x)*4;
for(let x=0;x<rect.width;x+=1,at+=4){
data[at]=r;
data[at+1]=g;
data[at+2]=b;
data[at+3]=255;
}
}
return image;
}
export function pixelateRegion(image,rect,block){
const{data,width}=image;
const size=Math.max(1,Math.round(block));
const right=rect.x+rect.width;
const bottom=rect.y+rect.height;
for(let by=rect.y;by<bottom;by+=size){
const rows=Math.min(size,bottom-by);
for(let bx=rect.x;bx<right;bx+=size){
const columns=Math.min(size,right-bx);
let r=0;
let g=0;
let b=0;
let a=0;
for(let y=by;y<by+rows;y+=1){
let at=(y*width+bx)*4;
for(let x=0;x<columns;x+=1,at+=4){
r+=data[at];
g+=data[at+1];
b+=data[at+2];
a+=data[at+3];
}
}
const count=rows*columns;
r=Math.round(r/count);
g=Math.round(g/count);
b=Math.round(b/count);
a=Math.round(a/count);
for(let y=by;y<by+rows;y+=1){
let at=(y*width+bx)*4;
for(let x=0;x<columns;x+=1,at+=4){
data[at]=r;
data[at+1]=g;
data[at+2]=b;
data[at+3]=a;
}
}
}
}
return image;
}
function blurLine(src,dst,count,stride,radius){
const window=radius*2+1;
for(let channel=0;channel<4;channel+=1){
const at=(i)=>channel+stride*Math.max(0,Math.min(i,count-1));
let sum=src[at(0)]*(radius+1);
for(let i=1;i<=radius;i+=1)sum+=src[at(i)];
for(let i=0;i<count;i+=1){
dst[channel+stride*i]=sum/window;
sum+=src[at(i+radius+1)]-src[at(i-radius)];
}
}
}
export function blurRegion(image,rect,radius){
const{width:w,height:h}=rect;
if(w<1||h<1)return image;
const r=Math.max(1,Math.min(Math.round(radius),Math.max(w,h)));
const buffer=readRect(image,rect);
const scratch=new Float32Array(buffer.length);
for(let pass=0;pass<3;pass+=1){
for(let y=0;y<h;y+=1){
blurLine(buffer.subarray(y*w*4),scratch.subarray(y*w*4),w,4,r);
}
for(let x=0;x<w;x+=1){
blurLine(scratch.subarray(x*4),buffer.subarray(x*4),h,w*4,r);
}
}
writeRect(image,rect,buffer);
return image;
}
function readRect(image,rect){
const span=rect.width*4;
const out=new Float32Array(span*rect.height);
for(let y=0;y<rect.height;y+=1){
const from=((rect.y+y)*image.width+rect.x)*4;
for(let i=0;i<span;i+=1)out[y*span+i]=image.data[from+i];
}
return out;
}
function writeRect(image,rect,values){
const span=rect.width*4;
for(let y=0;y<rect.height;y+=1){
const to=((rect.y+y)*image.width+rect.x)*4;
for(let i=0;i<span;i+=1)image.data[to+i]=Math.round(values[y*span+i]);
}
}
export function applyRegions(image,regions,strength='medium'){
for(const region of regions){
const rect=clampRect(region,image);
if(rect.width<1||rect.height<1)continue;
if(region.style==='pixelate')pixelateRegion(image,rect,blockSize(rect,strength));
else if(region.style==='blur')blurRegion(image,rect,blurRadius(rect,strength));
else fillRegion(image,rect);
}
return image;
}
