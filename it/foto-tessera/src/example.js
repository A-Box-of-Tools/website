/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
async function fileFromData(name,type){
const{BYTES}=await import('./example-data.js?v=b1f87d6c0c');
const binary=atob(BYTES);
const bytes=new Uint8Array(binary.length);
for(let i=0;i<binary.length;i+=1)bytes[i]=binary.charCodeAt(i);
return new File([bytes],name,{type});
}
export function makeExample(){
return fileFromData('example-portrait.jpg','image/jpeg');
}
