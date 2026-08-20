/* Built from https://github.com/A-Box-of-Tools/website by build.py. Comments and indentation removed; nothing renamed. Verify with: python build.py --check */
import{FORMATS}from'./codecs.js';
export function bytes(n){
if(n<1024)return`${n} bytes`;
if(n<1024*1024)return`${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
return`${(n / (1024 * 1024)).toFixed(2)} MB`;
}
export const UNITS={KB:1024,MB:1024*1024};
export function targetBytes(value,unit){
const amount=Number.parseFloat(value);
if(!Number.isFinite(amount)||amount<=0)return null;
return Math.round(amount*(UNITS[unit]??UNITS.KB));
}
export function dimensions(width,height){
return`${width} × ${height}`;
}
export function outName(name,mime){
const ext=FORMATS[mime]?.ext??'jpg';
const stem=name.replace(/\.[^.]+$/,'')||'image';
return`${stem}-compressed.${ext}`;
}
export function change(before,after){
if(before===0)return'';
const delta=Math.round(((before-after)/before)*100);
if(delta===0)return'about the same size';
return delta>0?`${delta}% smaller`:`${-delta}% larger`;
}
export function matchText(ssim){
const percent=(ssim*100).toFixed(1);
if(ssim>=0.995)return`${percent}% - indistinguishable`;
if(ssim>=0.985)return`${percent}% - no visible difference`;
if(ssim>=0.96)return`${percent}% - very close`;
if(ssim>=0.92)return`${percent}% - slight softening`;
return`${percent}% - visibly compressed`;
}
export function psnrText(psnr){
return Number.isFinite(psnr)?`${psnr.toFixed(1)} dB`:'identical';
}
