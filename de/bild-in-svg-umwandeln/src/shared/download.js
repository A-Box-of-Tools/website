/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function saveBlob(blob,name){
const url=URL.createObjectURL(blob);
const link=document.createElement('a');
link.href=url;
link.download=name;
link.rel='noopener';
document.body.append(link);
link.click();
link.remove();
setTimeout(()=>URL.revokeObjectURL(url),60_000);
}
export function downloadLink(link,type='text/plain;charset=utf-8'){
let url=null;
const clear=()=>{
if(url)URL.revokeObjectURL(url);
url=null;
link.hidden=true;
};
return{
offer(content,name){
clear();
if(content==='')return;
url=URL.createObjectURL(
content instanceof Blob?content:new Blob([content],{type}));
link.href=url;
link.download=name;
link.hidden=false;
},
clear,
};
}
