/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{sizeText}from'./shared/format.js?v=33cb8cdd7c';
import{throwIfAborted}from'./shared/errors.js?v=33cb8cdd7c';
export const formatBytes=(n,t)=>sizeText(n,t,{under:'size.b',kb:'auto',mb:1});
export const THUMB_MAX=168;
export function frameName(sourceName,number,total){
const width=Math.max(2,String(total).length);
return`${baseName(sourceName)}-${String(number).padStart(width, '0')}.png`;
}
export function baseName(sourceName){
return String(sourceName??'animation')
.replace(/\.[^./\\]+$/,'')
.replace(/[\\/:*?"<>|]+/g,'_')
.trim()||'animation';
}
export function zipName(sourceName){
return`${baseName(sourceName)}-frames.zip`;
}
export function pixelsToCanvas(pixels,width,height){
const canvas=document.createElement('canvas');
try{
canvas.width=width;canvas.height=height;
canvas.getContext('2d').putImageData(new ImageData(pixels,width,height),0,0);
return canvas;
}catch(error){canvas.width=canvas.height=0;throw error;}
}
export function canvasPng(canvas,signal,failure='png.nowrite'){
throwIfAborted(signal);
return new Promise((resolve,reject)=>{
let settled=false;
const finish=(blob,error)=>{
if(settled)return;
settled=true;
signal?.removeEventListener('abort',abort);
if(error)reject(error);else resolve(blob);
};
const abort=()=>{try{throwIfAborted(signal);}catch(error){finish(null,error);}};
signal?.addEventListener('abort',abort,{once:true});
try{canvas.toBlob(blob=>finish(blob,blob?null:new Error(failure)),'image/png');}
catch(error){finish(null,error);}
});
}
export async function encodePng(pixels,width,height,{signal}={}){
throwIfAborted(signal);
const canvas=pixelsToCanvas(pixels,width,height);
try{return await canvasPng(canvas,signal);}
finally{canvas.width=canvas.height=0;}
}
export async function thumbnail(pixels,width,height,{signal}={}){
throwIfAborted(signal);
const scale=Math.min(1,THUMB_MAX/Math.max(width,height));
const small=document.createElement('canvas');
const outWidth=Math.max(1,Math.round(width*scale));
const outHeight=Math.max(1,Math.round(height*scale));
let full=null;
try{
small.width=outWidth;small.height=outHeight;
const context=small.getContext('2d');
context.imageSmoothingEnabled=false;
full=pixelsToCanvas(pixels,width,height);
context.drawImage(full,0,0,outWidth,outHeight);
full.width=full.height=0;
full=null;
const blob=await canvasPng(small,signal,'png.nopreview');
throwIfAborted(signal);
return{url:URL.createObjectURL(blob),width:outWidth,height:outHeight,bytes:blob.size};
}finally{
if(full)full.width=full.height=0;
small.width=small.height=0;
}
}
export function timingList(sourceName,gif,rows,t){
const lines=[
`# ${t('timing.title', { name: baseName(sourceName) })}`,
`# ${t(gif.frames.length === 1 ? 'timing.size.one' : 'timing.size.many', {
      width: gif.width, height: gif.height, frames: gif.frames.length,
    })}`
,
`# ${t('timing.delays')}`,
'',
['col.file','col.stored','col.played','col.x','col.y',
'col.width','col.height','col.disposal'].map((key)=>t(key)).join('\t'),
];
for(const row of rows){
lines.push([
row.name,
(row.frame.delay/100).toFixed(2),
row.played.toFixed(2),
row.frame.x,
row.frame.y,
row.frame.width,
row.frame.height,
row.frame.disposal,
].join('\t'));
}
return`${lines.join('\n')}\n`;
}
export function formatSeconds(seconds,t){
if(seconds<1)return t('unit.seconds',{n:seconds.toFixed(2)});
if(seconds<10)return t('unit.seconds',{n:seconds.toFixed(1)});
return t('unit.seconds',{n:Math.round(seconds)});
}
export function disposalLabel(disposal,t){
if(disposal===2)return t('disposal.clears');
if(disposal===3)return t('disposal.restores');
return t('disposal.stays');
}
