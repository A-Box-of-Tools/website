/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{outputType}from'./container.js?v=a8e748bf06';
export function outName(item,suffix){
const{ext}=outputType(item.kind);
const base=item.name.replace(/\.[^.]+$/,'')||'photo';
return`${base}-${suffix}.${ext}`;
}
export function cleanNames(items){
const used=new Set();
const key=name=>name.normalize('NFC').toLowerCase();
return items.map(item=>{
const original=outName(item,'clean');
const dot=original.lastIndexOf('.');
const stem=original.slice(0,dot);
const extension=original.slice(dot);
let name=original;
let index=1;
while(used.has(key(name)))name=`${stem}-${++index}${extension}`;
used.add(key(name));
return name;
});
}
