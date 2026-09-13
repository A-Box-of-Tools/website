/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function pages(n){
return{key:n===1?'count.pages.one':'count.pages.many',values:{n}};
}
export function refusedList(keys){
if(keys.length===0)return null;
if(keys.length===1)return{key:keys[0],values:{}};
if(keys.length===2)return{key:'list.two',values:{a:keys[0],b:keys[1]}};
return{key:'list.three',values:{a:keys[0],b:keys[1],c:keys[2]}};
}
export function outName(name){
const stem=name.replace(/\.pdf$/i,'')||'document';
return`${stem}-protected.pdf`;
}
