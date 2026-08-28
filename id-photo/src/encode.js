/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{padTo,setDensity}from'./jpeg.js';
export const JPEG='image/jpeg';
export async function decode(file){
if(typeof createImageBitmap==='function'){
try{
const bitmap=await createImageBitmap(file);
return{bitmap,width:bitmap.width,height:bitmap.height};
}catch{
}
}
const url=URL.createObjectURL(file);
try{
const img=await new Promise((resolve,reject)=>{
const element=new Image();
element.onload=()=>resolve(element);
element.onerror=()=>reject(new Error('encode.nodecode'));
element.src=url;
});
return{bitmap:img,width:img.naturalWidth,height:img.naturalHeight};
}finally{
URL.revokeObjectURL(url);
}
}
export function release(bitmap){
if(bitmap&&typeof bitmap.close==='function')bitmap.close();
}
export function drawCrop(source,rect,out,{background='#ffffff'}={}){
const canvas=document.createElement('canvas');
canvas.width=Math.max(1,Math.round(out.width));
canvas.height=Math.max(1,Math.round(out.height));
const ctx=canvas.getContext('2d',{alpha:false});
ctx.imageSmoothingEnabled=true;
ctx.imageSmoothingQuality='high';
ctx.fillStyle=background;
ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.drawImage(
source,
rect.x,rect.y,rect.width,rect.height,
0,0,canvas.width,canvas.height,
);
return canvas;
}
export function samplePixels(source,rect,longEdge=240){
const scale=Math.min(1,longEdge/Math.max(rect.width,rect.height));
const canvas=drawCrop(source,rect,{
width:Math.max(1,Math.round(rect.width*scale)),
height:Math.max(1,Math.round(rect.height*scale)),
});
const ctx=canvas.getContext('2d',{alpha:false});
const image=ctx.getImageData(0,0,canvas.width,canvas.height);
free(canvas);
return image;
}
export function free(canvas){
canvas.width=0;
canvas.height=0;
}
export async function toBytes(canvas,quality){
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,JPEG,quality));
if(!blob)throw new Error('encode.nojpeg');
return new Uint8Array(await blob.arrayBuffer());
}
const CEILING=0.95;
const FLOOR=0.25;
const MAX_ENCODES=10;
export async function encodeToBand(canvas,band,t){
const max=band.max??Infinity;
const min=band.min??0;
let encodes=0;
const attempt=async(quality)=>{
if(encodes>=MAX_ENCODES)throw new Error('encode.gaveup');
encodes+=1;
return{bytes:await toBytes(canvas,quality),quality};
};
let best=await attempt(CEILING);
if(best.bytes.length>max){
const bottom=await attempt(FLOOR);
if(bottom.bytes.length>max){
return finish(bottom,false,t('how.toobig',
{size:sizeText(bottom.bytes.length,t)}));
}
let low=FLOOR;
let high=CEILING;
best=bottom;
for(let round=0;round<5;round+=1){
const mid=(low+high)/2;
const tried=await attempt(mid);
if(tried.bytes.length<=max){
low=mid;
best=tried;
}else{
high=mid;
}
}
}
if(best.bytes.length<min&&best.quality<1){
const top=await attempt(1);
if(top.bytes.length<=max&&top.bytes.length>best.bytes.length)best=top;
}
if(best.bytes.length>=min){
return finish(best,true,t('how.fitted',{
quality:Math.round(best.quality*100),
size:sizeText(best.bytes.length,t),
}));
}
const padded=padTo(best.bytes,min);
return finish(
{bytes:padded,quality:best.quality},
padded.length>=min,
t('how.padded',{
size:sizeText(best.bytes.length,t),
floor:sizeText(min,t),
added:sizeText(padded.length-best.bytes.length,t),
}),
padded.length-best.bytes.length,
);
function finish(result,fitted,how,padding=0){
return{bytes:result.bytes,quality:result.quality,encodes,padded:padding,fitted,how};
}
}
export function sizeText(bytes,t){
if(bytes<1024)return t('size.bytes',{n:bytes});
if(bytes<1024*1024)return t('size.kb',{n:(bytes/1024).toFixed(1)});
return t('size.mb',{n:(bytes/(1024*1024)).toFixed(2)});
}
export async function encodePrint(canvas,{dpi,quality=0.94}){
const bytes=setDensity(await toBytes(canvas,quality),dpi);
return{blob:new Blob([bytes],{type:JPEG}),bytes};
}
export function drawSheet(plan,photo){
const canvas=document.createElement('canvas');
canvas.width=plan.canvas.width;
canvas.height=plan.canvas.height;
const ctx=canvas.getContext('2d',{alpha:false});
ctx.imageSmoothingEnabled=true;
ctx.imageSmoothingQuality='high';
ctx.fillStyle='#ffffff';
ctx.fillRect(0,0,canvas.width,canvas.height);
for(const cell of plan.cells){
ctx.drawImage(photo,cell.x,cell.y,cell.width,cell.height);
}
ctx.strokeStyle='#444444';
ctx.lineWidth=Math.max(1,Math.round(plan.dpi/300));
ctx.beginPath();
for(const mark of plan.marks){
const shift=ctx.lineWidth%2===1?0.5:0;
ctx.moveTo(mark.x1+shift,mark.y1+shift);
ctx.lineTo(mark.x2+shift,mark.y2+shift);
}
ctx.stroke();
return canvas;
}
