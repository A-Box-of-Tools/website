/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function bytes(n){
if(n<1024)return`${n} bytes`;
if(n<1024*1024)return`${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
return`${(n / (1024 * 1024)).toFixed(2)} MB`;
}
export const dimensions=(width,height)=>`${width} × ${height}`;
export const countOf=(n)=>`${n} file${n === 1 ? '' : 's'}`;
export function stemOf(name){
return String(name??'').replace(/\.[^.]+$/,'').trim()||'image';
}
export function outName(sourceName,ext,density=1){
const suffix=density>1?`@${density}x`:'';
return`${stemOf(sourceName)}${suffix}.${ext}`;
}
export const folderFor=(name)=>stemOf(name).replace(/[\\/:*?"<>|]+/g,'-');
export function uniqueNames(names){
const seen=new Map();
return names.map((name)=>{
const key=name.toLowerCase();
const count=seen.get(key)??0;
seen.set(key,count+1);
if(count===0)return name;
const dot=name.lastIndexOf('.');
const stem=dot>0?name.slice(0,dot):name;
const ext=dot>0?name.slice(dot):'';
return`${stem}-${count + 1}${ext}`;
});
}
export function describeSource(intrinsic){
const size=dimensions(intrinsic.width,intrinsic.height);
switch(intrinsic.source){
case'attributes':
return`${size} — the size the file asks for`;
case'mixed':
return`${size} — one side from the file, the other from its viewBox`;
case'viewbox':
return`${size} — no pixel size, taken from the viewBox`;
default:
return`${size} assumed — this file declares no size and no viewBox`;
}
}
