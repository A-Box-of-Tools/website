/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{homography,project}from'./geometry.js';
const MAX_SAMPLES=2;
const INSET=3;
export function warpPage(source,quad,size){
const width=Math.max(1,Math.round(size.width));
const height=Math.max(1,Math.round(size.height));
const samples=sampleCount(quad,width,height);
const toSource=homography(
[{x:0,y:0},{x:width,y:0},{x:width,y:height},{x:0,y:height}],
inset(quad,INSET*samples),
);
if(!toSource)throw new Error('warp.degenerate');
const out=new Uint8ClampedArray(width*height*4);
const step=1/samples;
const first=step/2;
let at=0;
for(let y=0;y<height;y+=1){
for(let x=0;x<width;x+=1){
let r=0;
let g=0;
let b=0;
for(let sy=0;sy<samples;sy+=1){
for(let sx=0;sx<samples;sx+=1){
const point=project(toSource,x+first+sx*step,y+first+sy*step);
const pixel=bilinear(source,point.x-0.5,point.y-0.5);
r+=pixel[0];
g+=pixel[1];
b+=pixel[2];
}
}
const taken=samples*samples;
out[at]=r/taken;
out[at+1]=g/taken;
out[at+2]=b/taken;
out[at+3]=255;
at+=4;
}
}
return{data:out,width,height};
}
function inset(quad,by){
const sides=[];
for(let i=0;i<4;i+=1){
const a=quad[i];
const b=quad[(i+1)%4];
const length=Math.hypot(b.x-a.x,b.y-a.y);
if(length<1e-6)return quad.map((point)=>({...point}));
const nx=-(b.y-a.y)/length;
const ny=(b.x-a.x)/length;
sides.push({nx,ny,c:(a.x+nx*by)*nx+(a.y+ny*by)*ny});
}
return[0,1,2,3].map((i)=>{
const previous=sides[(i+3)%4];
const here=sides[i];
const det=previous.nx*here.ny-previous.ny*here.nx;
if(Math.abs(det)<1e-9)return{...quad[i]};
return{
x:(previous.c*here.ny-here.c*previous.ny)/det,
y:(previous.nx*here.c-here.nx*previous.c)/det,
};
});
}
function sampleCount(quad,width,height){
const across=Math.max(
Math.hypot(quad[1].x-quad[0].x,quad[1].y-quad[0].y),
Math.hypot(quad[2].x-quad[3].x,quad[2].y-quad[3].y),
);
const down=Math.max(
Math.hypot(quad[3].x-quad[0].x,quad[3].y-quad[0].y),
Math.hypot(quad[2].x-quad[1].x,quad[2].y-quad[1].y),
);
const shrink=Math.max(across/width,down/height);
return Math.min(MAX_SAMPLES,Math.max(1,Math.round(shrink)));
}
function bilinear({data,width,height},x,y){
const x0=Math.floor(x);
const y0=Math.floor(y);
const fx=x-x0;
const fy=y-y0;
const left=clamp(x0,width);
const right=clamp(x0+1,width);
const top=clamp(y0,height)*width;
const bottom=clamp(y0+1,height)*width;
const tl=(top+left)*4;
const tr=(top+right)*4;
const bl=(bottom+left)*4;
const br=(bottom+right)*4;
const out=[0,0,0];
for(let c=0;c<3;c+=1){
const upper=data[tl+c]+(data[tr+c]-data[tl+c])*fx;
const lower=data[bl+c]+(data[br+c]-data[bl+c])*fx;
out[c]=upper+(lower-upper)*fy;
}
return out;
}
const clamp=(value,size)=>(value<0?0:(value>size-1?size-1:value));
export const turnQuad=(quad)=>[quad[3],quad[0],quad[1],quad[2]];
