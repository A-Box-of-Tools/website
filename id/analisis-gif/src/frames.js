/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const DISPOSE_NONE=0;
export const DISPOSE_KEEP=1;
export const DISPOSE_BACKGROUND=2;
export const DISPOSE_PREVIOUS=3;
export function interlaceMap(height){
const map=new Uint32Array(height);
let out=0;
for(const[start,step]of[[0,8],[4,8],[2,4],[1,2]]){
for(let row=start;row<height;row+=step){
map[out]=row;
out+=1;
}
}
return map;
}
export function paintFrame(frame,indices,palette){
const{width,height}=frame;
const pixels=new Uint8ClampedArray(width*height*4);
const used=new Uint8Array(Math.max(palette?palette.count:0,256));
const transparent=frame.transparentIndex;
const rows=frame.interlaced?interlaceMap(height):null;
const colors=palette?palette.colors:null;
const count=palette?palette.count:0;
let missing=0;
for(let row=0;row<height;row+=1){
const target=(rows?rows[row]:row)*width*4;
const source=row*width;
for(let column=0;column<width;column+=1){
const index=indices[source+column];
used[index]=1;
const out=target+column*4;
if(index===transparent)continue;
if(index>=count){
missing+=1;
continue;
}
const rgb=index*3;
pixels[out]=colors[rgb];
pixels[out+1]=colors[rgb+1];
pixels[out+2]=colors[rgb+2];
pixels[out+3]=255;
}
}
return{pixels,used,missing};
}
export class Compositor{
constructor(width,height){
this.width=width;
this.height=height;
this.pixels=new Uint8ClampedArray(width*height*4);
this.saved=null;
}
draw(frame,stored){
if(frame.disposal===DISPOSE_PREVIOUS){
this.saved=this.pixels.slice();
}
const{left,top,width,height}=frame;
for(let row=0;row<height;row+=1){
const y=top+row;
if(y<0||y>=this.height)continue;
for(let column=0;column<width;column+=1){
const x=left+column;
if(x<0||x>=this.width)continue;
const from=(row*width+column)*4;
if(stored[from+3]===0)continue;
const to=(y*this.width+x)*4;
this.pixels[to]=stored[from];
this.pixels[to+1]=stored[from+1];
this.pixels[to+2]=stored[from+2];
this.pixels[to+3]=255;
}
}
const shown=this.pixels.slice();
if(frame.disposal===DISPOSE_BACKGROUND)this.clear(frame);
else if(frame.disposal===DISPOSE_PREVIOUS&&this.saved){
this.pixels.set(this.saved);
this.saved=null;
}
return shown;
}
clear(frame){
const{left,top,width,height}=frame;
for(let row=0;row<height;row+=1){
const y=top+row;
if(y<0||y>=this.height)continue;
const start=(y*this.width+Math.max(0,left))*4;
const span=Math.min(width,this.width-left)*4;
if(span>0)this.pixels.fill(0,start,start+span);
}
}
}
export const isFullCanvas=(gif,frame)=>(
frame.left===0&&frame.top===0
&&frame.width===gif.width&&frame.height===gif.height
);
export function duration(frames){
let nominal=0;
let real=0;
let clamped=0;
for(const frame of frames){
nominal+=frame.delay;
if(frame.delay<2){
real+=10;
clamped+=1;
}else{
real+=frame.delay;
}
}
return{nominal,real,clamped};
}
