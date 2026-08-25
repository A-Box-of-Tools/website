/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function hasWebCodecs(){
return typeof window.VideoDecoder==='function'
&&typeof window.VideoFrame==='function';
}
export async function canDecode(config){
if(!hasWebCodecs())return false;
try{
const{supported}=await VideoDecoder.isConfigSupported(config);
return Boolean(supported);
}catch{
return false;
}
}
export async function encodableTypes(candidates=['image/webp','image/jpeg']){
const ok=new Set(['image/png']);
const canvas=document.createElement('canvas');
canvas.width=1;
canvas.height=1;
for(const type of candidates){
const blob=await new Promise((resolve)=>{
try{
canvas.toBlob(resolve,type,0.9);
}catch{
resolve(null);
}
});
if(blob&&blob.type===type)ok.add(type);
}
return ok;
}
