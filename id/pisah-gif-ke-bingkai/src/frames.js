/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const THUMB_MAX=168;
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
canvas.width=width;
canvas.height=height;
const context=canvas.getContext('2d');
context.putImageData(new ImageData(pixels,width,height),0,0);
return canvas;
}
export function encodePng(pixels,width,height){
const canvas=pixelsToCanvas(pixels,width,height);
return new Promise((resolve,reject)=>{
canvas.toBlob((blob)=>{
if(blob)resolve(blob);
else reject(new Error('png.nowrite'));
},'image/png');
});
}
export function thumbnail(pixels,width,height){
const scale=Math.min(1,THUMB_MAX/Math.max(width,height));
const small=document.createElement('canvas');
small.width=Math.max(1,Math.round(width*scale));
small.height=Math.max(1,Math.round(height*scale));
const context=small.getContext('2d');
context.imageSmoothingEnabled=false;
context.drawImage(pixelsToCanvas(pixels,width,height),0,0,small.width,small.height);
return new Promise((resolve,reject)=>{
small.toBlob((blob)=>{
if(blob)resolve({url:URL.createObjectURL(blob),width:small.width,height:small.height});
else reject(new Error('png.nopreview'));
},'image/png');
});
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
export function formatBytes(bytes,t){
if(bytes<1024)return t('size.b',{n:bytes});
if(bytes<1024*1024){
return t('size.kb',{n:(bytes/1024).toFixed(bytes<10240?1:0)});
}
return t('size.mb',{n:(bytes/(1024*1024)).toFixed(1)});
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
