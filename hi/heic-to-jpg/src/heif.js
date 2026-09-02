/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{said}from'./shared/errors.js';
const ENGINE=new URL('../vendor/libheif.js',import.meta.url);
let loading=null;
export function warmEngine(){
engine().catch(()=>{
});
}
export function engine(){
loading??=load();
return loading;
}
async function load(){
await new Promise((resolve,reject)=>{
const script=document.createElement('script');
script.src=ENGINE.href;
script.async=true;
script.addEventListener('load',resolve,{once:true});
script.addEventListener('error',
()=>reject(said('heif.noload')),{once:true});
document.head.append(script);
});
const factory=globalThis.libheif;
if(typeof factory!=='function'){
throw said('heif.nostart');
}
return factory();
}
export async function decodeHeic(bytes){
const libheif=await engine();
const decoder=new libheif.HeifDecoder();
let images;
try{
images=decoder.decode(bytes);
}catch(error){
throw said('heif.noread',{detail:error.message});
}
if(!images||images.length===0){
throw said('heif.nopicture');
}
const out=[];
try{
for(const image of images){
const width=image.get_width();
const height=image.get_height();
if(!(width>0&&height>0)){
throw said('heif.nosize');
}
const surface={
width,
height,
data:new Uint8ClampedArray(width*height*4),
};
await new Promise((resolve,reject)=>{
image.display(surface,(result)=>{
if(result)resolve();
else reject(said('heif.nodraw'));
});
});
out.push({
width,
height,
pixels:surface.data,
primary:isPrimary(image,out.length),
});
}
}finally{
for(const image of images)image.free?.();
}
return out;
}
function isPrimary(image,index){
try{
return Boolean(image.is_primary());
}catch{
return index===0;
}
}
