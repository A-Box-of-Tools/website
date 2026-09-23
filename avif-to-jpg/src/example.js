/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
async function filesFromData(){
const{LANDSCAPE,SQUARE}=await import('./example-data.js?v=04048d2d77');
const decode=(base64,name)=>{
const binary=atob(base64);
const bytes=new Uint8Array(binary.length);
for(let i=0;i<binary.length;i+=1)bytes[i]=binary.charCodeAt(i);
return new File([bytes],name,{type:'image/avif'});
};
return[
decode(LANDSCAPE,'example-landscape.avif'),
decode(SQUARE,'example-square.avif'),
];
}
export function makeExample(){
return filesFromData();
}
