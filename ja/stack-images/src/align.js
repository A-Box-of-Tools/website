/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{fft2}from'./fft.js?v=a2fc99e04f';
export const ALIGN_MODES=['none','translate','similarity'];
export const MAX_ROTATION=30;
export const MIN_SCALE=0.8;
export const MAX_SCALE=1.25;
export const WHITEN=128;
export const L_MIN=0.004;
export const N_MAX=0.8;
export const N_MAX_SURVEY=0.45;
const NEXT_REACH=10;
export const P_MAX=0.7;
export function isMeasured({live,plateau=0,next=0},floor=N_MAX){
return live>=L_MIN&&plateau<=P_MAX&&next<=floor;
}
export const NO_MOVE=Object.freeze({dx:0,dy:0,angle:0,scale:1});
export function window2d(values,size,box=null){
const left=box?Math.min(size,Math.max(0,Math.round(box.x))):0;
const top=box?Math.min(size,Math.max(0,Math.round(box.y))):0;
const right=box?Math.min(size,Math.max(left,Math.round(box.x+box.width))):size;
const bottom=box?Math.min(size,Math.max(top,Math.round(box.y+box.height))):size;
const width=right-left;
const height=bottom-top;
if(width<2||height<2){
values.fill(0);
return values;
}
let total=0;
for(let y=top;y<bottom;y+=1){
for(let x=left;x<right;x+=1)total+=values[y*size+x];
}
const mean=total/(width*height);
const taper=(span)=>{
const out=new Float64Array(span);
for(let i=0;i<span;i+=1)out[i]=0.5-0.5*Math.cos((2*Math.PI*i)/(span-1));
return out;
};
const across=taper(width);
const down=taper(height);
for(let y=0;y<size;y+=1){
const inside=y>=top&&y<bottom;
for(let x=0;x<size;x+=1){
values[y*size+x]=inside&&x>=left&&x<right
?(values[y*size+x]-mean)*down[y-top]*across[x-left]
:0;
}
}
return values;
}
export function phaseCorrelate(a,b,size){
const n=size*size;
const aRe=Float64Array.from(a);
const aIm=new Float64Array(n);
const bRe=Float64Array.from(b);
const bIm=new Float64Array(n);
fft2(aRe,aIm,size);
fft2(bRe,bIm,size);
const magnitude=new Float64Array(n);
let strongest=0;
for(let i=0;i<n;i+=1){
const re=aRe[i]*bRe[i]+aIm[i]*bIm[i];
const im=aIm[i]*bRe[i]-aRe[i]*bIm[i];
aRe[i]=re;
aIm[i]=im;
magnitude[i]=Math.hypot(re,im);
if(magnitude[i]>strongest)strongest=magnitude[i];
}
const eps=WHITEN*median(magnitude);
const floor=strongest*1e-6;
let weight=0;
for(let i=0;i<n;i+=1){
const divisor=magnitude[i]+eps;
if(divisor<=floor){
aRe[i]=0;
aIm[i]=0;
}else{
aRe[i]/=divisor;
aIm[i]/=divisor;
weight+=magnitude[i]/divisor;
}
}
fft2(aRe,aIm,size,true);
let peak=-Infinity;
let peakAt=0;
for(let i=0;i<n;i+=1){
if(aRe[i]>peak){peak=aRe[i];peakAt=i;}
}
const px=peakAt%size;
const py=(peakAt/size)|0;
const at=(x,y)=>aRe[((y+size)%size)*size+((x+size)%size)];
const dx=wrap(px+parabola(at(px-1,py),peak,at(px+1,py)),size);
const dy=wrap(py+parabola(at(px,py-1),peak,at(px,py+1)),size);
const r=plateauRadius();
let shoulder=-Infinity;
for(let j=-1;j<=1;j+=1){
for(let i=-1;i<=1;i+=1){
if(i===0&&j===0)continue;
const value=at(px+i*r,py+j*r);
if(value>shoulder)shoulder=value;
}
}
const reach=NEXT_REACH;
const inside=new Uint8Array(size);
for(let x=0;x<size;x+=1){
const away=Math.abs(x-px);
inside[x]=Math.min(away,size-away)<=reach?1:0;
}
let next=-Infinity;
let outside=false;
for(let y=0;y<size;y+=1){
const away=Math.abs(y-py);
const row=y*size;
if(Math.min(away,size-away)<=reach){
for(let x=0;x<size;x+=1){
if(inside[x])continue;
outside=true;
if(aRe[row+x]>next)next=aRe[row+x];
}
}else{
outside=true;
for(let x=0;x<size;x+=1){
if(aRe[row+x]>next)next=aRe[row+x];
}
}
}
return{
dx,
dy,
peak,
live:weight/n,
coherence:weight>0?(peak*n)/weight:0,
plateau:peak>0?shoulder/peak:1,
next:peak>0&&outside?next/peak:1,
};
}
function plateauRadius(){
return 8;
}
function median(values){
const copy=Float64Array.from(values);
const target=copy.length>>1;
let low=0;
let high=copy.length-1;
while(low<high){
const pivot=copy[(low+high)>>1];
let i=low;
let j=high;
while(i<=j){
while(copy[i]<pivot)i+=1;
while(copy[j]>pivot)j-=1;
if(i<=j){
const swap=copy[i];
copy[i]=copy[j];
copy[j]=swap;
i+=1;
j-=1;
}
}
if(j<target)low=i;
else if(i>target)high=j;
else break;
}
return copy[target];
}
function parabola(before,middle,after){
const denominator=before-2*middle+after;
if(!denominator)return 0;
const shift=(0.5*(before-after))/denominator;
return Math.abs(shift)<=1?shift:0;
}
function wrap(value,size){
return value>size/2?value-size:value;
}
export function logSpectrum(values,size){
const re=Float64Array.from(values);
const im=new Float64Array(size*size);
fft2(re,im,size);
const half=size>>1;
const out=new Float64Array(size*size);
for(let y=0;y<size;y+=1){
for(let x=0;x<size;x+=1){
const to=((y+half)%size)*size+((x+half)%size);
out[to]=Math.log1p(Math.hypot(re[y*size+x],im[y*size+x]));
}
}
return out;
}
export function logPolar(spectrum,size){
const centre=size/2;
const maxRadius=centre-1;
const base=Math.log(maxRadius)/size;
const out=new Float64Array(size*size);
for(let row=0;row<size;row+=1){
const angle=(Math.PI*row)/size;
const cos=Math.cos(angle);
const sin=Math.sin(angle);
for(let column=0;column<size;column+=1){
const radius=Math.exp(column*base);
out[row*size+column]=sample(
spectrum,size,centre+radius*cos,centre+radius*sin,
);
}
}
return{values:out,base};
}
function sample(values,size,x,y){
const x0=Math.floor(x);
const y0=Math.floor(y);
if(x0<0||y0<0||x0+1>=size||y0+1>=size)return 0;
const fx=x-x0;
const fy=y-y0;
const top=values[y0*size+x0]*(1-fx)+values[y0*size+x0+1]*fx;
const bottom=values[(y0+1)*size+x0]*(1-fx)+values[(y0+1)*size+x0+1]*fx;
return top*(1-fy)+bottom*fy;
}
export function rotateScale(values,size,degrees,scale){
const out=new Float64Array(size*size);
const radians=(degrees*Math.PI)/180;
const cos=Math.cos(radians)/scale;
const sin=Math.sin(radians)/scale;
const centre=(size-1)/2;
for(let y=0;y<size;y+=1){
const dy=y-centre;
for(let x=0;x<size;x+=1){
const dx=x-centre;
out[y*size+x]=sample(
values,size,centre+dx*cos+dy*sin,centre-dx*sin+dy*cos,
);
}
}
return out;
}
export function estimate(reference,frame,size,mode){
if(mode==='none')return{...NO_MOVE,measured:true,clamped:false};
let angle=0;
let scale=1;
let clamped=false;
let moved=frame;
if(mode==='similarity'){
const a=logPolar(logSpectrum(reference,size),size);
const b=logPolar(logSpectrum(frame,size),size);
const found=phaseCorrelate(
window2d(a.values,size),window2d(b.values,size),size,
);
const measured=(found.dy*180)/size;
angle=measured>90?measured-180:measured;
scale=1/Math.exp(found.dx*b.base);
if(!isMeasured(found)){
angle=0;
scale=1;
}else if(Math.abs(angle)>MAX_ROTATION||scale<MIN_SCALE||scale>MAX_SCALE
||!Number.isFinite(scale)){
angle=0;
scale=1;
clamped=true;
}else{
moved=rotateScale(frame,size,angle,scale);
}
}
const shift=phaseCorrelate(reference,moved,size);
return{
dx:shift.dx,
dy:shift.dy,
angle,
scale,
measured:isMeasured(shift,N_MAX_SURVEY),
clamped,
live:shift.live,
coherence:shift.coherence,
plateau:shift.plateau,
next:shift.next,
};
}
