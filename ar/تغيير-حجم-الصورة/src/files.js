/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{FORMATS}from'./codecs.js';
import{sizeText}from'./shared/format.js';
export const bytes=(n,t)=>sizeText(n,t,{under:'size.bytes',kb:'auto',mb:2});
export function dimensions(width,height){
return`${width} × ${height}`;
}
export function outName(name,mime,width,height){
const ext=FORMATS[mime]?.ext??'jpg';
const stem=name.replace(/\.[^.]+$/,'')||'image';
return`${stem}-${width}x${height}.${ext}`;
}
export function change(before,after,t){
if(before===0)return'';
const delta=Math.round(((before-after)/before)*100);
if(delta===0)return t('change.same');
return delta>0
?t('change.smaller',{percent:delta})
:t('change.larger',{percent:-delta});
}
export const countOf=(n,t)=>t(n===1?'count.one':'count.many',{n});
export function scaleText(scale){
const percent=scale*100;
if(percent>=10)return String(Math.round(percent));
return percent.toFixed(1);
}
export function describePlan(size,crop,result,mime,t){
const cropped=crop.width!==size.width||crop.height!==size.height;
const resized=result.canvas.width!==crop.width
||result.canvas.height!==crop.height;
const to=dimensions(result.canvas.width,result.canvas.height);
let what;
if(cropped&&resized){
what=t('plan.cropresize',{crop:dimensions(crop.width,crop.height),size:to});
}else if(cropped){
what=t('plan.crop',{crop:dimensions(crop.width,crop.height)});
}else if(resized){
what=t('plan.resize',{size:to});
}else{
what=t('plan.keep',{size:to});
}
if(result.padded)what=t('plan.padded',{what});
if(mime)what=t('plan.written',{what,format:FORMATS[mime]?.label??mime});
return what;
}
