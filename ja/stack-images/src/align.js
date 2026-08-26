/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{fft2}from'./fft.js';
export const ALIGN_MODES=['none','translate','similarity'];
export const MAX_ROTATION=30;
export const MIN_SCALE=0.8;
export const MAX_SCALE=1.25;
export const WEAK_PEAK=4;
export const NO_MOVE=Object.freeze({dx:0,dy:0,angle:0,scale:1,confidence:0});
export function window2d(values,size){
let total=0;
for(let i=0;i<values.length;i+=1)total+=values[i];
const mean=total/values.length;
const taper=new Float64Array(size);
for(let i=0;i<size;i+=1){
taper[i]=0.5-0.5*Math.cos((2*Math.PI*i)/(size-1));
}
for(let y=0;y<size;y+=1){
for(let x=0;x<size;x+=1){
values[y*size+x]=(values[y*size+x]-mean)*taper[y]*taper[x];
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
let strongest=0;
for(let i=0;i<n;i+=1){
const re=aRe[i]*bRe[i]+aIm[i]*bIm[i];
const im=aIm[i]*bRe[i]-aRe[i]*bIm[i];
aRe[i]=re;
aIm[i]=im;
const magnitude=Math.hypot(re,im);
if(magnitude>strongest)strongest=magnitude;
}
const floor=strongest*1e-6;
for(let i=0;i<n;i+=1){
const magnitude=Math.hypot(aRe[i],aIm[i]);
if(magnitude<=floor){
aRe[i]=0;
aIm[i]=0;
}else{
aRe[i]/=magnitude;
aIm[i]/=magnitude;
}
}
fft2(aRe,aIm,size,true);
let peak=-Infinity;
let peakAt=0;
let total=0;
let squares=0;
for(let i=0;i<n;i+=1){
const value=aRe[i];
total+=value;
squares+=value*value;
if(value>peak){peak=value;peakAt=i;}
}
const mean=total/n;
const deviation=Math.sqrt(Math.max(0,squares/n-mean*mean))||1e-12;
const px=peakAt%size;
const py=(peakAt/size)|0;
const at=(x,y)=>aRe[((y+size)%size)*size+((x+size)%size)];
const dx=wrap(px+parabola(at(px-1,py),peak,at(px+1,py)),size);
const dy=wrap(py+parabola(at(px,py-1),peak,at(px,py+1)),size);
return{
dx,
dy,
peak,
confidence:(peak-mean)/deviation,
};
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
if(mode==='none')return{...NO_MOVE,clamped:false};
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
if(Math.abs(angle)>MAX_ROTATION||scale<MIN_SCALE||scale>MAX_SCALE
||!Number.isFinite(scale)||found.confidence<WEAK_PEAK){
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
confidence:shift.confidence,
clamped,
};
}
