/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function bytes(n,t){
if(n<1024)return t('size.b',{n});
if(n<1024*1024)return t('size.kb',{n:(n/1024).toFixed(n<10240?1:0)});
return t('size.mb',{n:(n/(1024*1024)).toFixed(2)});
}
export const dimensions=(width,height)=>`${width} × ${height}`;
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
export function sourceKey(intrinsic){
switch(intrinsic.source){
case'attributes':
return'source.attributes';
case'mixed':
return'source.mixed';
case'viewbox':
return'source.viewbox';
default:
return'source.default';
}
}
