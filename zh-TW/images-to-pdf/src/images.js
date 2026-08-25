/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{inspectJpeg}from'./jpeg.js';
const THUMB_MAX=320;
const HEAD_BYTES=512*1024;
let nextId=1;
export async function loadImages(files){
const items=[];
const skipped=[];
for(const file of Array.from(files)){
if(!looksLikeImage(file)){
skipped.push(`${file.name}: not an image this tool can read.`);
continue;
}
let bitmap;
try{
bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
}catch{
skipped.push(`${file.name}: this browser could not decode it.`);
continue;
}
try{
const jpeg=await peekJpeg(file);
const stored=jpeg
?{width:jpeg.width,height:jpeg.height,orientation:jpeg.orientation}
:{width:bitmap.width,height:bitmap.height,orientation:1};
items.push({
id:nextId++,
file,
name:file.name,
lastModified:file.lastModified,
...stored,
rotate:0,
thumb:await makeThumbnail(bitmap),
});
}finally{
bitmap.close();
}
}
return{items,skipped};
}
function looksLikeImage(file){
if(file.type)return file.type.startsWith('image/');
return/\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name);
}
async function peekJpeg(file){
if(!/^image\/jpe?g$/i.test(file.type)&&!/\.jpe?g$/i.test(file.name))return null;
try{
const head=new Uint8Array(await file.slice(0,HEAD_BYTES).arrayBuffer());
return inspectJpeg(head);
}catch{
return null;
}
}
async function makeThumbnail(bitmap){
const scale=Math.min(1,THUMB_MAX/Math.max(bitmap.width,bitmap.height));
const canvas=document.createElement('canvas');
canvas.width=Math.max(1,Math.round(bitmap.width*scale));
canvas.height=Math.max(1,Math.round(bitmap.height*scale));
canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,'image/jpeg',0.82));
const url=URL.createObjectURL(blob);
const image=new Image();
image.src=url;
try{
await image.decode();
}catch{
}
return{url,image};
}
export function releaseItem(item){
URL.revokeObjectURL(item.thumb.url);
}
export function rotateItem(item,quarters){
item.rotate=(((item.rotate+quarters*90)%360)+360)%360;
}
const collator=new Intl.Collator(undefined,{numeric:true,sensitivity:'base'});
export function sortItems(items,key){
if(key==='name')return items.sort((a,b)=>collator.compare(a.name,b.name));
if(key==='date')return items.sort((a,b)=>a.lastModified-b.lastModified);
if(key==='reverse')return items.reverse();
return items;
}
export function moveItem(items,from,to){
if(to<0||to>=items.length||from===to)return items;
const[moved]=items.splice(from,1);
items.splice(to,0,moved);
return items;
}
