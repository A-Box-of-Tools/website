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
export function outName(name,mime,index=0){
const ext=FORMATS[mime]?.ext??'jpg';
const stem=name.replace(/\.[^.]+$/,'')||'image';
return index===0?`${stem}.${ext}`:`${stem}-${index + 1}.${ext}`;
}
export function uniqueNames(names){
const seen=new Map();
return names.map((name)=>{
const taken=seen.get(name)??0;
seen.set(name,taken+1);
if(taken===0)return name;
const dot=name.lastIndexOf('.');
const stem=dot>0?name.slice(0,dot):name;
const ext=dot>0?name.slice(dot):'';
let attempt=taken+1;
while(seen.has(`${stem}-${attempt}${ext}`))attempt+=1;
const unique=`${stem}-${attempt}${ext}`;
seen.set(unique,1);
return unique;
});
}
export function change(before,after){
if(before===0)return'';
const delta=Math.round(((before-after)/before)*100);
if(delta===0)return'about the same size';
return delta>0?`${delta}% smaller`:`${-delta}% larger`;
}
export function metadataText(exif){
if(!exif.present)return'no photo details in this file';
const parts=[];
if(exif.gps)parts.push('GPS coordinates');
if(exif.taken)parts.push(exif.taken);
if(exif.camera)parts.push(exif.camera);
return parts.length?parts.join(' · '):'photo details, but nothing identifying';
}
