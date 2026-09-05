/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{FORMATS}from'./codecs.js?v=6ce0c50246';
export function bytes(n){
if(n<1024)return{key:'size.bytes',values:{amount:n}};
if(n<1024*1024){
return{key:'size.kb',values:{amount:(n/1024).toFixed(n<10240?1:0)}};
}
return{key:'size.mb',values:{amount:(n/(1024*1024)).toFixed(2)}};
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
if(before===0)return null;
const delta=Math.round(((before-after)/before)*100);
if(delta===0)return{key:'change.same'};
return delta>0
?{key:'change.smaller',values:{percent:delta}}
:{key:'change.larger',values:{percent:-delta}};
}
export function matchText(ssim){
const values={percent:(ssim*100).toFixed(1)};
if(ssim>=0.995)return{key:'match.identical',values};
if(ssim>=0.985)return{key:'match.invisible',values};
if(ssim>=0.96)return{key:'match.close',values};
if(ssim>=0.92)return{key:'match.softened',values};
return{key:'match.visible',values};
}
export function psnrText(psnr){
return Number.isFinite(psnr)
?{key:'psnr.db',values:{db:psnr.toFixed(1)}}
:{key:'psnr.identical'};
}
