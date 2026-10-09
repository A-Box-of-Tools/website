/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{throwIfAborted}from'./shared/errors.js?v=86bf417deb';
export function packMono({data,width,height}){
const stride=Math.ceil(width/8);
const out=new Uint8Array(stride*height);
for(let y=0;y<height;y+=1){
const row=y*stride;
for(let x=0;x<width;x+=1){
if(data[(y*width+x)*4]>=128)out[row+(x>>3)]|=0x80>>(x&7);
}
}
return out;
}
export async function deflate(bytes){
if(typeof CompressionStream!=='function'){
throw new Error('encode.nodeflate');
}
const stream=new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
return new Uint8Array(await new Response(stream).arrayBuffer());
}
export async function encodePage(page,settings,signal){
throwIfAborted(signal);
const{width,height}=page;
if(page.mono){
const data=await deflate(packMono(page));
throwIfAborted(signal);
return{
kind:'flate1',
data,
width,
height,
gray:true,
};
}
const canvas=document.createElement('canvas');
try{
canvas.width=width;
canvas.height=height;
const context=canvas.getContext('2d');
context.putImageData(new ImageData(page.data,width,height),0,0);
const quality=Math.min(1,Math.max(0.3,Number(settings?.quality)||0.82));
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,'image/jpeg',quality));
throwIfAborted(signal);
if(!blob)throw new Error('encode.nojpeg');
const data=new Uint8Array(await blob.arrayBuffer());
throwIfAborted(signal);
return{kind:'dct',data,width,height,gray:false};
}finally{
canvas.width=0;
canvas.height=0;
}
}
export async function encodeImage(page,settings,signal){
throwIfAborted(signal);
const canvas=document.createElement('canvas');
try{
canvas.width=page.width;
canvas.height=page.height;
const context=canvas.getContext('2d');
context.putImageData(new ImageData(page.data,page.width,page.height),0,0);
const type=page.mono?'image/png':'image/jpeg';
const quality=page.mono
?undefined
:Math.min(1,Math.max(0.3,Number(settings?.quality)||0.82));
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,type,quality));
throwIfAborted(signal);
if(!blob)throw new Error('encode.nopage');
return{blob,extension:page.mono?'png':'jpg'};
}finally{
canvas.width=0;
canvas.height=0;
}
}
