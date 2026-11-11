/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function svgBlob(svg){
return new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
}
export async function svgToPng(svg,size,multiple=1){
const url=URL.createObjectURL(svgBlob(svg));
try{
const image=new Image();
image.width=size.width;
image.height=size.height;
await new Promise((resolve,reject)=>{
image.onload=resolve;
image.onerror=()=>reject(new Error('render.nosvg'));
image.src=url;
});
const canvas=document.createElement('canvas');
canvas.width=Math.round(size.width*multiple);
canvas.height=Math.round(size.height*multiple);
canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
return await new Promise((resolve,reject)=>{
canvas.toBlob((blob)=>{
if(blob)resolve(blob);
else reject(new Error('render.nopng'));
},'image/png');
});
}finally{
URL.revokeObjectURL(url);
}
}
