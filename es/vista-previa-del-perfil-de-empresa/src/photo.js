/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{throwIfAborted}from'./shared/errors.js?v=44ff688333';
export const LIMITS={
bytes:20*1024*1024,
side:1200,
smallest:8,
};
export function fit(width,height,longest=LIMITS.side){
const scale=Math.min(1,longest/Math.max(width,height));
return{
width:Math.max(1,Math.round(width*scale)),
height:Math.max(1,Math.round(height*scale)),
};
}
export async function readPhoto(file,longest=LIMITS.side,signal){
throwIfAborted(signal);
if(file.size>LIMITS.bytes)throw new Error('photo.toobig');
let bitmap;
try{
bitmap=await createImageBitmap(file);
}catch{
throw new Error('photo.unreadable');
}
let canvas;
try{
throwIfAborted(signal);
if(bitmap.width<LIMITS.smallest||bitmap.height<LIMITS.smallest){
throw new Error('photo.tiny');
}
const size=fit(bitmap.width,bitmap.height,longest);
canvas=document.createElement('canvas');
canvas.width=size.width;
canvas.height=size.height;
const context=canvas.getContext('2d');
context.imageSmoothingQuality='high';
context.drawImage(bitmap,0,0,size.width,size.height);
return{uri:canvas.toDataURL('image/jpeg',0.82),...size};
}finally{
if(canvas)canvas.width=canvas.height=0;
bitmap.close();
}
}
