/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const THUMB_MAX=200;
export const DEFAULT_DELAY=0.5;
export const MIN_DELAY=0.02;
export const MAX_DELAY=60;
let nextId=1;
const isImage=(file)=>file.type.startsWith('image/');
async function makeThumbnail(bitmap){
const scale=Math.min(1,THUMB_MAX/Math.max(bitmap.width,bitmap.height));
const canvas=document.createElement('canvas');
canvas.width=Math.max(1,Math.round(bitmap.width*scale));
canvas.height=Math.max(1,Math.round(bitmap.height*scale));
canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,'image/jpeg',0.8));
return URL.createObjectURL(blob);
}
export async function loadImages(files,delay){
const items=[];
const skipped=[];
for(const file of Array.from(files)){
if(!isImage(file)){
skipped.push(file.name);
continue;
}
let bitmap;
try{
bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
}catch{
skipped.push(file.name);
continue;
}
try{
items.push({
id:nextId++,
file,
name:file.name,
width:bitmap.width,
height:bitmap.height,
lastModified:file.lastModified,
delay:clampDelay(delay),
thumbUrl:await makeThumbnail(bitmap),
});
}finally{
bitmap.close();
}
}
return{items,skipped};
}
export function clampDelay(seconds){
const value=Number(seconds);
if(!Number.isFinite(value))return DEFAULT_DELAY;
return Math.min(MAX_DELAY,Math.max(MIN_DELAY,Math.round(value*100)/100));
}
export function decodeFull(item){
return createImageBitmap(item.file,{imageOrientation:'from-image'});
}
export function releaseItem(item){
URL.revokeObjectURL(item.thumbUrl);
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
