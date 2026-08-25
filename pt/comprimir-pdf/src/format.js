/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function bytes(n){
if(!Number.isFinite(n)||n<0)return'0 bytes';
if(n<1024)return`${Math.round(n)} bytes`;
if(n<1024*1024)return`${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
return`${(n / (1024 * 1024)).toFixed(2)} MB`;
}
export function change(before,after){
if(!before)return'';
const delta=Math.round(((before-after)/before)*100);
if(delta===0)return'about the same size';
return delta>0?`${delta}% smaller`:`${-delta}% larger`;
}
export function share(part,whole){
if(!whole)return'0%';
const percent=(part/whole)*100;
if(percent>0&&percent<1)return'<1%';
if(percent>99&&part<whole)return'99%';
return`${Math.round(percent)}%`;
}
export function dpi(value){
if(!(value>0))return'';
return`${Math.round(value)} DPI`;
}
export function dimensions(width,height){
return`${width} × ${height}`;
}
export function outName(name){
const stem=name.replace(/\.pdf$/i,'')||'document';
return`${stem}-compressed.pdf`;
}
export function count(n,singular,plural=`${singular}s`){
return`${n} ${n === 1 ? singular : plural}`;
}
