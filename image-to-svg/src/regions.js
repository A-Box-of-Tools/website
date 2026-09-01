/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{traceContours}from'./contour.js';
export function labelRegions(mask,options={}){
const{w,h,bits}=mask;
const joinDiagonals=options.joinDiagonals===true;
const labels=new Int32Array(w*h);
const stack=new Int32Array(w*h);
let ink=0,paper=0;
for(let seed=0;seed<labels.length;seed++){
if(labels[seed]!==0)continue;
const isInk=bits[seed]===1;
const diagonal=isInk?joinDiagonals:!joinDiagonals;
const id=isInk?++ink:-(++paper);
let top=0;
stack[top++]=seed;
labels[seed]=id;
while(top>0){
const at=stack[--top];
const x=at%w,y=(at/w)|0;
for(let k=0;k<8;k++){
if(!diagonal&&k>=4)break;
const nx=x+NX[k],ny=y+NY[k];
if(nx<0||ny<0||nx>=w||ny>=h)continue;
const n=ny*w+nx;
if(labels[n]!==0||(bits[n]===1)!==isInk)continue;
labels[n]=id;
stack[top++]=n;
}
}
}
return{labels,w,h,ink,paper};
}
const NX=[1,-1,0,0,1,1,-1,-1];
const NY=[0,0,1,-1,1,-1,1,-1];
let stackBuffer=new Int32Array(0);
function stackFor(n){
if(stackBuffer.length<n)stackBuffer=new Int32Array(n);
return stackBuffer;
}
function colourAt(rgba,i,out){
const p=i*4;
const k=rgba[p+3]/255;
out[0]=rgba[p]*k+255*(1-k);
out[1]=rgba[p+1]*k+255*(1-k);
out[2]=rgba[p+2]*k+255*(1-k);
return out;
}
export function selectRegion(mask,labelled,x,y,options={}){
const{w,h,bits,grey,rgba}=mask;
const mode=options.mode??'colour';
const tolerance=options.tolerance??32;
const budget=options.budget??Infinity;
const at=y*w+x;
const pixels=new Uint8Array(w*h);
const wasInk=bits[at]===1;
let size=0;
if(mode==='shape'&&labelled){
const want=labelled.labels[at];
const{labels}=labelled;
for(let i=0;i<labels.length;i++){
if(labels[i]===want){pixels[i]=1;size++;}
}
return{pixels,size,wasInk,truncated:false};
}
const seed=[0,0,0];
const here=[0,0,0];
if(rgba)colourAt(rgba,at,seed);
else seed[0]=seed[1]=seed[2]=grey?grey[at]:(wasInk?0:255);
const limit=tolerance*tolerance*3;
const stack=stackFor(w*h);
let top=0;
stack[top++]=at;
pixels[at]=1;
size=1;
while(top>0&&size<budget){
const cur=stack[--top];
const cx=cur%w,cy=(cur/w)|0;
for(let k=0;k<8;k++){
const nx=cx+NX[k],ny=cy+NY[k];
if(nx<0||ny<0||nx>=w||ny>=h)continue;
const n=ny*w+nx;
if(pixels[n])continue;
if(rgba)colourAt(rgba,n,here);
else here[0]=here[1]=here[2]=grey?grey[n]:(bits[n]===1?0:255);
const dr=here[0]-seed[0],dg=here[1]-seed[1],db=here[2]-seed[2];
if(dr*dr+dg*dg+db*db>limit)continue;
pixels[n]=1;
size++;
stack[top++]=n;
}
}
return{pixels,size,wasInk,truncated:top>0};
}
export function outlineOfSelection(pixels,w,h,maxPoints=Infinity){
const contours=traceContours({w,h,bits:pixels},{minArea:0});
let points=0;
for(const c of contours)points+=c.xs.length;
return points>maxPoints?null:contours;
}
export class MaskEdits{
constructor(w,h){
this.w=w;
this.h=h;
this.overrides=new Uint8Array(w*h);
this.history=[];
this.touched=0;
}
set(pixels,ink){
const value=ink?1:2;
const where=[];
const was=[];
for(let i=0;i<pixels.length;i++){
if(!pixels[i]||this.overrides[i]===value)continue;
where.push(i);
was.push(this.overrides[i]);
this.overrides[i]=value;
}
if(!where.length)return 0;
this.history.push({where:Int32Array.from(where),was:Uint8Array.from(was)});
this.touched+=where.length;
return where.length;
}
flip(){
const swap=(v)=>(v===1?2:v===2?1:0);
for(let i=0;i<this.overrides.length;i++){
this.overrides[i]=swap(this.overrides[i]);
}
for(const step of this.history){
for(let k=0;k<step.was.length;k++)step.was[k]=swap(step.was[k]);
}
}
undo(){
const last=this.history.pop();
if(!last)return false;
for(let k=0;k<last.where.length;k++)this.overrides[last.where[k]]=last.was[k];
this.touched-=last.where.length;
return true;
}
reset(){
this.overrides.fill(0);
this.history.length=0;
this.touched=0;
}
get edits(){return this.history.length;}
apply(mask){
const bits=Uint8Array.from(mask.bits);
for(let i=0;i<bits.length;i++){
const o=this.overrides[i];
if(o===1)bits[i]=1;
else if(o===2)bits[i]=0;
}
return{...mask,bits};
}
}
