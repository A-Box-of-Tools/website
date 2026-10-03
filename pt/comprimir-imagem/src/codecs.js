/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const JPEG='image/jpeg';
export const PNG='image/png';
export const WEBP='image/webp';
export const FORMATS={
[JPEG]:{label:'JPEG',ext:'jpg',lossy:true},
[PNG]:{label:'PNG',ext:'png',lossy:false},
[WEBP]:{label:'WebP',ext:'webp',lossy:true},
};
export const READABLE=[JPEG,PNG,WEBP,'image/gif','image/bmp','image/avif'];
function saying(key,values){
const error=new Error(key);
error.values=values;
return error;
}
async function canEncode(mime){
const canvas=document.createElement('canvas');
canvas.width=1;
canvas.height=1;
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,mime,0.8));
return Boolean(blob)&&blob.type===mime;
}
export async function encodableTypes(){
const found=new Set([JPEG,PNG]);
if(await canEncode(WEBP))found.add(WEBP);
return found;
}
export async function encode(source,{width,height,mime,quality}){
const canvas=document.createElement('canvas');
canvas.width=Math.max(1,Math.round(width));
canvas.height=Math.max(1,Math.round(height));
const ctx=canvas.getContext('2d',{alpha:mime!==JPEG});
ctx.imageSmoothingEnabled=true;
ctx.imageSmoothingQuality='high';
if(mime===JPEG){
ctx.fillStyle='#ffffff';
ctx.fillRect(0,0,canvas.width,canvas.height);
}
ctx.drawImage(source,0,0,canvas.width,canvas.height);
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,mime,quality));
if(!blob)throw saying('error.encode',{format:FORMATS[mime]?.label??mime});
canvas.width=0;
canvas.height=0;
return blob;
}
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
element.onerror=()=>reject(saying('error.decode'));
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
