/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{FORMATS}from'./codecs.js';
export function bytes(n){
if(n<1024)return`${n} bytes`;
if(n<1024*1024)return`${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
return`${(n / (1024 * 1024)).toFixed(2)} MB`;
}
export function dimensions(width,height){
return`${width} × ${height}`;
}
export function outName(name,mime,width,height){
const ext=FORMATS[mime]?.ext??'jpg';
const stem=name.replace(/\.[^.]+$/,'')||'image';
return`${stem}-${width}x${height}.${ext}`;
}
export function change(before,after){
if(before===0)return'';
const delta=Math.round(((before-after)/before)*100);
if(delta===0)return'about the same size';
return delta>0?`${delta}% smaller`:`${-delta}% larger`;
}
export const countOf=(n)=>`${n} image${n === 1 ? '' : 's'}`;
export function scaleText(scale){
const percent=scale*100;
if(percent>=10)return`${Math.round(percent)}%`;
return`${percent.toFixed(1)}%`;
}
export function describePlan(size,crop,result,mime){
const parts=[];
const cropped=crop.width!==size.width||crop.height!==size.height;
if(cropped){
parts.push(`cropped to ${dimensions(crop.width, crop.height)}`);
}
if(result.canvas.width!==crop.width||result.canvas.height!==crop.height){
parts.push(`${cropped ? 'then ' : ''}resized to ${dimensions(result.canvas.width, result.canvas.height)}`);
}else if(!cropped){
parts.push(`kept at ${dimensions(result.canvas.width, result.canvas.height)}`);
}
if(result.padded)parts.push('padded out to the exact frame you asked for');
if(mime)parts.push(`written as ${FORMATS[mime]?.label ?? mime}`);
return`${parts.join(', ')}.`;
}
