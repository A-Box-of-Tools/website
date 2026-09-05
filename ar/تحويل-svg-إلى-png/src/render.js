/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{sizedSvg}from'./svg.js?v=954778cf04';
export const PNG='image/png';
export const JPEG='image/jpeg';
export const WEBP='image/webp';
export const FORMATS={
[PNG]:{label:'PNG',ext:'png',lossy:false,alpha:true},
[JPEG]:{label:'JPEG',ext:'jpg',lossy:true,alpha:false},
[WEBP]:{label:'WebP',ext:'webp',lossy:true,alpha:true},
};
async function canEncode(mime){
const canvas=document.createElement('canvas');
canvas.width=1;
canvas.height=1;
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,mime,0.8));
return Boolean(blob)&&blob.type===mime;
}
export async function encodableTypes(){
const found=new Set([PNG,JPEG]);
if(await canEncode(WEBP))found.add(WEBP);
return found;
}
export async function loadAt(text,width,height,{stretch=false}={}){
const markup=sizedSvg(text,width,height,{stretch});
const url=URL.createObjectURL(new Blob([markup],{type:'image/svg+xml'}));
const image=new Image();
try{
await new Promise((resolve,reject)=>{
image.onload=()=>resolve();
image.onerror=()=>reject(new Error('draw.failed'));
image.src=url;
});
if(typeof image.decode==='function'){
try{
await image.decode();
}catch{
}
}
}catch(error){
URL.revokeObjectURL(url);
throw error;
}
return{image,release:()=>URL.revokeObjectURL(url)};
}
export function draw(image,plan,{background}){
const canvas=document.createElement('canvas');
canvas.width=plan.width;
canvas.height=plan.height;
const ctx=canvas.getContext('2d',{alpha:!background});
ctx.imageSmoothingEnabled=true;
ctx.imageSmoothingQuality='high';
if(background){
ctx.fillStyle=background;
ctx.fillRect(0,0,canvas.width,canvas.height);
}
ctx.drawImage(image,plan.draw.x,plan.draw.y,plan.draw.width,plan.draw.height);
return canvas;
}
export async function encode(canvas,mime,quality){
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,mime,quality));
if(!blob){
throw Object.assign(new Error('encode.refused'),
{values:{format:FORMATS[mime]?.label??mime}});
}
return blob;
}
export async function rasterize(text,plan,{mime,quality,background}){
const held=await loadAt(text,plan.draw.width,plan.draw.height,{stretch:plan.stretch});
let canvas;
try{
canvas=draw(held.image,plan,{background});
return await encode(canvas,mime,quality);
}finally{
held.release();
if(canvas){
canvas.width=0;
canvas.height=0;
}
}
}
