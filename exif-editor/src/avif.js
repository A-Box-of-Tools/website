/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const MAX_PIXELS=80_000_000;
export async function cleanAvif(bytes){
let bitmap;
let canvas;
try{
try{
bitmap=await createImageBitmap(new Blob([bytes],{type:'image/avif'}),
{imageOrientation:'from-image'});
}catch{
throw new Error('read.avifdecode');
}
const{width,height}=bitmap;
if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)
||width<=0||height<=0||width*height>MAX_PIXELS){
throw new Error('write.aviflarge');
}
canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
const context=canvas.getContext('2d');
if(!context)throw new Error('write.avifpng');
context.drawImage(bitmap,0,0);
const blob=await new Promise((resolve,reject)=>{
try{canvas.toBlob(resolve,'image/png');}
catch{reject(new Error('write.avifpng'));}
});
if(!blob||blob.type!=='image/png')throw new Error('write.avifpng');
return new Uint8Array(await blob.arrayBuffer());
}catch(error){
if(['read.avifdecode','write.aviflarge','write.avifpng'].includes(error.message))throw error;
throw new Error('write.avifpng');
}finally{
bitmap?.close();
if(canvas){canvas.width=0;canvas.height=0;}
}
}
