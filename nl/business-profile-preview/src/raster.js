/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function svgBlob(svg){
return new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
}
export async function toPng(drawn,scale=1){
const url=URL.createObjectURL(svgBlob(drawn.svg));
try{
const image=new Image();
image.width=drawn.width;
image.height=drawn.height;
await new Promise((resolve,reject)=>{
image.onload=resolve;
image.onerror=()=>reject(new Error('save.nosvg'));
image.src=url;
});
const canvas=document.createElement('canvas');
canvas.width=Math.round(drawn.width*scale);
canvas.height=Math.round(drawn.height*scale);
const context=canvas.getContext('2d');
context.fillStyle='#ffffff';
context.fillRect(0,0,canvas.width,canvas.height);
context.imageSmoothingQuality='high';
context.drawImage(image,0,0,canvas.width,canvas.height);
return await new Promise((resolve,reject)=>{
canvas.toBlob((blob)=>{
if(blob)resolve(blob);
else reject(new Error('save.nopng'));
},'image/png');
});
}finally{
URL.revokeObjectURL(url);
}
}
