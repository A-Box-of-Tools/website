/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{throwIfAborted}from'./shared/errors.js?v=44ff688333';
export function svgBlob(svg){
return new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
}
export async function toPng(drawn,scale=1,signal){
throwIfAborted(signal);
const url=URL.createObjectURL(svgBlob(drawn.svg));
let canvas;
const image=new Image();
try{
image.width=drawn.width;
image.height=drawn.height;
await new Promise((resolve,reject)=>{
image.onload=resolve;
image.onerror=()=>reject(new Error('save.nosvg'));
image.src=url;
});
throwIfAborted(signal);
canvas=document.createElement('canvas');
canvas.width=Math.round(drawn.width*scale);
canvas.height=Math.round(drawn.height*scale);
const context=canvas.getContext('2d');
context.fillStyle='#ffffff';
context.fillRect(0,0,canvas.width,canvas.height);
context.imageSmoothingQuality='high';
context.drawImage(image,0,0,canvas.width,canvas.height);
const blob=await new Promise((resolve,reject)=>{
canvas.toBlob((blob)=>{
if(blob)resolve(blob);
else reject(new Error('save.nopng'));
},'image/png');
});
throwIfAborted(signal);
return blob;
}finally{
image.onload=image.onerror=null;
image.removeAttribute('src');
if(canvas)canvas.width=canvas.height=0;
URL.revokeObjectURL(url);
}
}
