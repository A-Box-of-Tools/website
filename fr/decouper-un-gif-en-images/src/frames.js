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
else reject(new Error('This browser would not write a PNG.'));
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
else reject(new Error('This browser would not draw the previews.'));
},'image/png');
});
}
export function timingList(sourceName,gif,rows){
const lines=[
`# Frames of ${baseName(sourceName)}`,
`# ${gif.width}x${gif.height}, ${gif.frames.length} frames in the original`,
`# Delays are as the file stores them. A browser plays anything under 0.02s`,
`# at 0.1s, which is the "played" column.`,
'',
'file\tstored (s)\tplayed (s)\tx\ty\twidth\theight\tdisposal',
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
export function formatBytes(bytes){
if(bytes<1024)return`${bytes} B`;
if(bytes<1024*1024)return`${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
return`${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
export function formatSeconds(seconds){
if(seconds<1)return`${seconds.toFixed(2)}s`;
if(seconds<10)return`${seconds.toFixed(1)}s`;
return`${Math.round(seconds)}s`;
}
export function disposalLabel(disposal){
if(disposal===2)return'clears its area after';
if(disposal===3)return'restores what was under it';
return'stays on screen';
}
