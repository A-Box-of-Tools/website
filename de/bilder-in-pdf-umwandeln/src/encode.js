/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{inspectJpeg}from'./jpeg.js';
export async function prepareImage(item,settings){
const limit=Number(settings.maxSide)||0;
const resizing=limit>0&&Math.max(item.width,item.height)>limit;
if(settings.mode==='keep'&&!resizing){
const copied=await copyJpeg(item);
if(copied)return copied;
}
return redraw(item,settings,resizing?limit:0);
}
async function copyJpeg(item){
if(!isJpeg(item))return null;
const bytes=new Uint8Array(await item.file.arrayBuffer());
const info=inspectJpeg(bytes);
if(!info||!info.sequential)return null;
if(info.components!==1&&info.components!==3)return null;
item.width=info.width;
item.height=info.height;
item.orientation=info.orientation;
return{
kind:'dct',
data:bytes,
width:info.width,
height:info.height,
gray:info.components===1,
icc:info.icc,
orientation:info.orientation,
smask:null,
copied:true,
predictor:false,
};
}
function isJpeg(item){
return/^image\/jpe?g$/i.test(item.file.type)||/\.jpe?g$/i.test(item.name);
}
async function redraw(item,settings,limit){
const bitmap=await createImageBitmap(item.file,{imageOrientation:'from-image'});
try{
const scale=limit?Math.min(1,limit/Math.max(bitmap.width,bitmap.height)):1;
const width=Math.max(1,Math.round(bitmap.width*scale));
const height=Math.max(1,Math.round(bitmap.height*scale));
const lossless=settings.mode==='lossless'
||(settings.mode==='keep'&&!isJpeg(item)&&await hasAlpha(bitmap));
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
const ctx=canvas.getContext('2d',{willReadFrequently:lossless});
if(!lossless){
ctx.fillStyle=settings.background||'#ffffff';
ctx.fillRect(0,0,width,height);
}
ctx.drawImage(bitmap,0,0,width,height);
return lossless
?await losslessStream(ctx,width,height)
:await jpegStream(canvas,settings,width,height);
}finally{
bitmap.close();
}
}
async function jpegStream(canvas,settings,width,height){
const quality=Math.min(1,Math.max(0.3,Number(settings.quality)||0.9));
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,'image/jpeg',quality));
if(!blob)throw new Error('encode.nojpeg');
return{
kind:'dct',
data:new Uint8Array(await blob.arrayBuffer()),
width,
height,
gray:false,
icc:null,
orientation:1,
smask:null,
copied:false,
predictor:false,
};
}
async function losslessStream(ctx,width,height){
const{data}=ctx.getImageData(0,0,width,height);
const rgb=new Uint8Array(width*height*3);
const alpha=new Uint8Array(width*height);
let opaque=true;
for(let i=0,p=0,a=0;i<data.length;i+=4,p+=3,a+=1){
rgb[p]=data[i];
rgb[p+1]=data[i+1];
rgb[p+2]=data[i+2];
alpha[a]=data[i+3];
if(data[i+3]!==255)opaque=false;
}
return{
kind:'flate',
data:await deflate(pngFilter(rgb,width,height,3)),
width,
height,
gray:false,
icc:null,
orientation:1,
smask:opaque?null:{data:await deflate(pngFilter(alpha,width,height,1))},
copied:false,
predictor:true,
};
}
async function hasAlpha(bitmap){
const canvas=document.createElement('canvas');
canvas.width=bitmap.width;
canvas.height=bitmap.height;
const ctx=canvas.getContext('2d',{willReadFrequently:true});
ctx.drawImage(bitmap,0,0);
const{data}=ctx.getImageData(0,0,bitmap.width,bitmap.height);
for(let i=3;i<data.length;i+=4){
if(data[i]!==255)return true;
}
return false;
}
function pngFilter(raw,width,height,channels){
const stride=width*channels;
const out=new Uint8Array((stride+1)*height);
const candidate=new Uint8Array(stride);
const best=new Uint8Array(stride);
const zeros=new Uint8Array(stride);
let previous=zeros;
for(let y=0;y<height;y+=1){
const row=raw.subarray(y*stride,y*stride+stride);
let bestType=0;
let bestScore=Infinity;
for(const type of[0,1,2,4]){
let score=0;
let x=0;
for(;x<stride;x+=1){
const left=x>=channels?row[x-channels]:0;
const up=previous[x];
const upLeft=x>=channels?previous[x-channels]:0;
let value;
if(type===0)value=row[x];
else if(type===1)value=row[x]-left;
else if(type===2)value=row[x]-up;
else value=row[x]-paeth(left,up,upLeft);
value&=0xff;
candidate[x]=value;
score+=value<128?value:256-value;
if(score>=bestScore)break;
}
if(x===stride&&score<bestScore){
bestScore=score;
bestType=type;
best.set(candidate);
}
}
out[y*(stride+1)]=bestType;
out.set(best,y*(stride+1)+1);
previous=row;
}
return out;
}
function paeth(a,b,c){
const p=a+b-c;
const pa=Math.abs(p-a);
const pb=Math.abs(p-b);
const pc=Math.abs(p-c);
if(pa<=pb&&pa<=pc)return a;
return pb<=pc?b:c;
}
export async function deflate(bytes){
if(typeof CompressionStream!=='function'){
throw new Error('encode.nodeflate');
}
const stream=new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
return new Uint8Array(await new Response(stream).arrayBuffer());
}
