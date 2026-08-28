/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const JPEG='image/jpeg';
export const PNG='image/png';
export const WEBP='image/webp';
export const FORMATS={
[JPEG]:{label:'JPEG',ext:'jpg',lossy:true},
[PNG]:{label:'PNG',ext:'png',lossy:false},
[WEBP]:{label:'WebP',ext:'webp',lossy:true},
};
async function canEncode(mime){
const canvas=document.createElement('canvas');
canvas.width=1;
canvas.height=1;
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,mime,0.8));
return Boolean(blob)&&blob.type===mime;
}
export async function encodableTypes(){
const found=new Set([JPEG,PNG]);
if(await canEncode(WEBP))found.add(WEBP);
return found;
}
export async function encodePixels(picture,{mime,quality}){
const surface=canvas(picture.width,picture.height,true);
surface.ctx.putImageData(
new ImageData(picture.pixels,picture.width,picture.height),0,0,
);
let target=surface;
if(mime===JPEG){
target=canvas(picture.width,picture.height,false);
target.ctx.fillStyle='#ffffff';
target.ctx.fillRect(0,0,picture.width,picture.height);
target.ctx.drawImage(surface.el,0,0);
release(surface.el);
}
const blob=await new Promise((resolve)=>target.el.toBlob(resolve,mime,quality));
release(target.el);
if(!blob)throw said('codec.nowrite',{format:FORMATS[mime]?.label??mime});
return blob;
}
const said=(key,values={})=>Object.assign(new Error(key),{values});
function canvas(width,height,alpha){
const el=document.createElement('canvas');
el.width=width;
el.height=height;
return{el,ctx:el.getContext('2d',{alpha})};
}
function release(el){
el.width=0;
el.height=0;
}
