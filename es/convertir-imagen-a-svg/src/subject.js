/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{otsu}from'./mask.js?v=154adf5d1e';
export const SUBJECT_DEFAULTS={
band:0.05,
useBorder:true,
samples:[],
chroma:2.2,
palette:8,
minBorderShare:0.03,
bias:0,
hysteresis:0.45,
close:2,
solid:true,
keep:'largest',
minShare:0.15,
minArea:0.0005,
};
export function subjectMask(image,options={}){
const o={...SUBJECT_DEFAULTS,...options};
const{width:w,height:h,data}=image;
const n=w*h;
const rgb=new Uint8Array(n*3);
const grey=new Uint8Array(n);
for(let i=0;i<n;i++){
const p=i*4;
const k=data[p+3]/255;
const r=data[p]*k+255*(1-k);
const g=data[p+1]*k+255*(1-k);
const b=data[p+2]*k+255*(1-k);
rgb[i*3]=r;rgb[i*3+1]=g;rgb[i*3+2]=b;
grey[i]=(0.299*r+0.587*g+0.114*b)|0;
}
const palette=[
...(o.useBorder?backgroundPalette(rgb,w,h,o):[]),
...o.samples,
];
if(!palette.length)palette.push([255,255,255]);
const distance=distanceToPalette(rgb,n,palette,o.chroma);
const cut=Math.max(0,Math.min(255,otsu(distance)+o.bias));
const low=Math.round(cut*o.hysteresis);
let bits=hysteresis(distance,w,h,cut,cut-low>=MIN_BAND?low:cut);
if(o.close>0)bits=closing(bits,w,h,o.close);
if(o.solid)bits=fillFromOutside(bits,w,h);
const{kept,islands,share}=keepIslands(bits,w,h,o);
return{
w,h,bits:kept,grey,rgba:data,
threshold:cut,distance,islands,share,palette,
};
}
const MIN_BAND=4;
function backgroundPalette(rgb,w,h,o){
const band=Math.max(1,Math.round(Math.min(w,h)*o.band));
const count=new Int32Array(32768);
const sums=new Float64Array(32768*3);
let total=0;
const add=(i)=>{
const r=rgb[i*3],g=rgb[i*3+1],b=rgb[i*3+2];
const bin=((r>>3)<<10)|((g>>3)<<5)|(b>>3);
count[bin]++;
sums[bin*3]+=r;sums[bin*3+1]+=g;sums[bin*3+2]+=b;
total++;
};
for(let y=0;y<h;y++){
const edgeRow=y<band||y>=h-band;
for(let x=0;x<w;x++){
if(edgeRow||x<band||x>=w-band)add(y*w+x);
}
}
if(!total)return[[255,255,255]];
const order=[];
for(let bin=0;bin<32768;bin++)if(count[bin])order.push(bin);
order.sort((a,b)=>count[b]-count[a]);
const floor=total*o.minBorderShare;
const out=[];
for(const bin of order.slice(0,o.palette)){
if(out.length>0&&count[bin]<floor)break;
out.push([
sums[bin*3]/count[bin],
sums[bin*3+1]/count[bin],
sums[bin*3+2]/count[bin],
]);
}
return out;
}
function distanceToPalette(rgb,n,palette,chroma){
const parts=palette.map(([r,g,b])=>{
const y=0.299*r+0.587*g+0.114*b;
return[y,b-y,r-y];
});
const out=new Uint8Array(n);
const k=chroma*chroma;
for(let i=0;i<n;i++){
const r=rgb[i*3],g=rgb[i*3+1],b=rgb[i*3+2];
const y=0.299*r+0.587*g+0.114*b;
const cb=b-y,cr=r-y;
let best=Infinity;
for(const[py,pcb,pcr]of parts){
const dy=y-py,dcb=cb-pcb,dcr=cr-pcr;
const d=dy*dy+k*(dcb*dcb+dcr*dcr);
if(d<best)best=d;
}
out[i]=Math.min(255,Math.sqrt(best));
}
return out;
}
function hysteresis(distance,w,h,high,low){
const bits=new Uint8Array(w*h);
const stack=new Int32Array(w*h);
let top=0;
for(let i=0;i<bits.length;i++){
if(distance[i]>high){bits[i]=1;stack[top++]=i;}
}
const maybe=(i)=>{
if(!bits[i]&&distance[i]>low){bits[i]=1;stack[top++]=i;}
};
while(top>0){
const at=stack[--top];
const x=at%w,y=(at/w)|0;
if(x>0)maybe(at-1);
if(x<w-1)maybe(at+1);
if(y>0)maybe(at-w);
if(y<h-1)maybe(at+w);
if(x>0&&y>0)maybe(at-w-1);
if(x<w-1&&y>0)maybe(at-w+1);
if(x>0&&y<h-1)maybe(at+w-1);
if(x<w-1&&y<h-1)maybe(at+w+1);
}
return bits;
}
function closing(bits,w,h,r){
return boxFilter(boxFilter(bits,w,h,r,'max'),w,h,r,'min');
}
function boxFilter(bits,w,h,r,kind){
const sum=new Int32Array((w+1)*(h+1));
for(let y=0;y<h;y++){
let row=0;
for(let x=0;x<w;x++){
row+=bits[y*w+x];
sum[(y+1)*(w+1)+x+1]=sum[y*(w+1)+x+1]+row;
}
}
const out=new Uint8Array(w*h);
for(let y=0;y<h;y++){
const y0=Math.max(0,y-r),y1=Math.min(h-1,y+r);
for(let x=0;x<w;x++){
const x0=Math.max(0,x-r),x1=Math.min(w-1,x+r);
const total=sum[(y1+1)*(w+1)+x1+1]-sum[y0*(w+1)+x1+1]-
sum[(y1+1)*(w+1)+x0]+sum[y0*(w+1)+x0];
const area=(y1-y0+1)*(x1-x0+1);
out[y*w+x]=kind==='max'?(total>0?1:0):(total===area?1:0);
}
}
return out;
}
function fillFromOutside(bits,w,h){
const outside=new Uint8Array(w*h);
const stack=new Int32Array(w*h);
let top=0;
const push=(i)=>{if(!outside[i]&&!bits[i]){outside[i]=1;stack[top++]=i;}};
for(let x=0;x<w;x++){push(x);push((h-1)*w+x);}
for(let y=0;y<h;y++){push(y*w);push(y*w+w-1);}
while(top>0){
const at=stack[--top];
const x=at%w,y=(at/w)|0;
if(x>0)push(at-1);
if(x<w-1)push(at+1);
if(y>0)push(at-w);
if(y<h-1)push(at+w);
}
const out=new Uint8Array(w*h);
for(let i=0;i<out.length;i++)out[i]=outside[i]?0:1;
return out;
}
function keepIslands(bits,w,h,o){
const labels=new Int32Array(w*h);
const sizes=[0];
const stack=new Int32Array(w*h);
let next=0;
for(let seed=0;seed<labels.length;seed++){
if(labels[seed]!==0||!bits[seed])continue;
const id=++next;
let size=0,top=0;
stack[top++]=seed;
labels[seed]=id;
while(top>0){
const at=stack[--top];
size++;
const x=at%w,y=(at/w)|0;
if(x>0&&!labels[at-1]&&bits[at-1]){labels[at-1]=id;stack[top++]=at-1;}
if(x<w-1&&!labels[at+1]&&bits[at+1]){labels[at+1]=id;stack[top++]=at+1;}
if(y>0&&!labels[at-w]&&bits[at-w]){labels[at-w]=id;stack[top++]=at-w;}
if(y<h-1&&!labels[at+w]&&bits[at+w]){labels[at+w]=id;stack[top++]=at+w;}
}
sizes[id]=size;
}
const biggest=sizes.reduce((a,b)=>Math.max(a,b),0);
const floor=Math.max(biggest*(o.keep==='largest'?1:o.minShare),
w*h*o.minArea);
const kept=new Uint8Array(w*h);
let area=0;
for(let i=0;i<kept.length;i++){
const id=labels[i];
if(id&&sizes[id]>=floor){kept[i]=1;area++;}
}
return{kept,islands:next,share:area/(w*h)};
}
