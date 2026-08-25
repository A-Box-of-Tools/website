/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const FIT={
pad:'pad',
crop:'crop',
stretch:'stretch',
};
export const NOMINAL_VECTOR=1024;
const isVector=(file)=>file.type==='image/svg+xml'||/\.svg$/i.test(file.name??'');
export async function decode(file){
const vector=isVector(file);
if(!vector&&typeof createImageBitmap==='function'){
try{
const bitmap=await createImageBitmap(file);
return{bitmap,width:bitmap.width,height:bitmap.height,vector:false,url:null};
}catch{
}
}
const url=URL.createObjectURL(file);
let img;
try{
img=await new Promise((resolve,reject)=>{
const element=new Image();
element.onload=()=>resolve(element);
element.onerror=()=>reject(new Error('this browser could not decode the picture.'));
element.src=url;
});
}catch(error){
URL.revokeObjectURL(url);
throw error;
}
return{
bitmap:img,
width:img.naturalWidth||(vector?NOMINAL_VECTOR:0),
height:img.naturalHeight||(vector?NOMINAL_VECTOR:0),
vector,
url,
};
}
export function release(decoded){
if(!decoded)return;
if(typeof decoded.bitmap?.close==='function')decoded.bitmap.close();
if(decoded.url)URL.revokeObjectURL(decoded.url);
}
export function plan(width,height,px,fit,inset=0){
const inner=Math.max(1,Math.round(px*(1-2*inset)));
const margin=Math.round((px-inner)/2);
const whole={x:0,y:0,width,height};
if(fit===FIT.stretch||width===height){
return{
source:whole,
draw:{x:margin,y:margin,width:inner,height:inner},
padded:inner!==px,
};
}
if(fit===FIT.crop){
const side=Math.min(width,height);
return{
source:{
x:Math.round((width-side)/2),
y:Math.round((height-side)/2),
width:side,
height:side,
},
draw:{x:margin,y:margin,width:inner,height:inner},
padded:inner!==px,
};
}
const scale=Math.min(inner/width,inner/height);
const drawWidth=Math.max(1,Math.round(width*scale));
const drawHeight=Math.max(1,Math.round(height*scale));
return{
source:whole,
draw:{
x:Math.round((px-drawWidth)/2),
y:Math.round((px-drawHeight)/2),
width:drawWidth,
height:drawHeight,
},
padded:true,
};
}
export function square(source,sourceWidth,sourceHeight,px,{fit,background,inset=0,vector=false}){
const layout=plan(sourceWidth,sourceHeight,px,fit,inset);
const canvas=document.createElement('canvas');
canvas.width=px;
canvas.height=px;
const ctx=canvas.getContext('2d');
ctx.imageSmoothingEnabled=true;
ctx.imageSmoothingQuality='high';
if(background){
ctx.fillStyle=background;
ctx.fillRect(0,0,px,px);
}
const reduced=vector
?{canvas:null,source:layout.source}
:stepDown(source,layout.source,layout.draw.width,layout.draw.height);
ctx.drawImage(
reduced.canvas??source,
reduced.source.x,reduced.source.y,reduced.source.width,reduced.source.height,
layout.draw.x,layout.draw.y,layout.draw.width,layout.draw.height,
);
if(reduced.canvas){
reduced.canvas.width=0;
reduced.canvas.height=0;
}
return canvas;
}
function stepDown(source,rect,targetWidth,targetHeight){
if(rect.width<=targetWidth*2&&rect.height<=targetHeight*2){
return{canvas:null,source:rect};
}
let width=rect.width;
let height=rect.height;
let from=source;
let take=rect;
let scratch=null;
while(width>targetWidth*2&&height>targetHeight*2){
const nextWidth=Math.max(targetWidth,Math.floor(width/2));
const nextHeight=Math.max(targetHeight,Math.floor(height/2));
const step=document.createElement('canvas');
step.width=nextWidth;
step.height=nextHeight;
const ctx=step.getContext('2d');
ctx.imageSmoothingEnabled=true;
ctx.imageSmoothingQuality='high';
ctx.drawImage(from,take.x,take.y,take.width,take.height,0,0,nextWidth,nextHeight);
if(scratch){
scratch.width=0;
scratch.height=0;
}
scratch=step;
from=step;
take={x:0,y:0,width:nextWidth,height:nextHeight};
width=nextWidth;
height=nextHeight;
}
return{canvas:scratch,source:take};
}
export function pixels(canvas){
const ctx=canvas.getContext('2d');
const data=ctx.getImageData(0,0,canvas.width,canvas.height);
return{width:data.width,height:data.height,data:data.data};
}
export async function png(canvas){
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,'image/png'));
if(!blob)throw new Error('this browser would not write a PNG.');
return new Uint8Array(await blob.arrayBuffer());
}
