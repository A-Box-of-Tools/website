/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{GifWriter}from'./gif.js';
import{createHistogram,addToHistogram,buildPalette,mapFrame}from'./quantize.js';
import{drawFrame}from'./compose.js';
import{decodeFull}from'./images.js';
import{throwIfAborted}from'./shared/errors.js';
const yieldToPage=()=>new Promise((resolve)=>setTimeout(resolve,0));
export function loopValue(mode,times){
if(mode==='once')return null;
if(mode==='forever')return 0;
const value=Math.round(Number(times));
return Number.isFinite(value)?Math.max(1,Math.min(65535,value)):0;
}
export async function encodeGif({items,settings,onProgress,signal}){
const{
width,height,fit,background,colors,dither,sharedPalette,transparent,loop,
}=settings;
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
const ctx=canvas.getContext('2d',{alpha:true,willReadFrequently:true});
const reserved=transparent?1:0;
const wanted=Math.max(2,Math.min(256,colors)-reserved);
const total=items.length*(sharedPalette?2:1);
let step=0;
const report=(phase)=>{
step+=1;
onProgress?.({phase,done:step,total});
};
const pixelsFor=async(item)=>{
const bitmap=await decodeFull(item);
try{
drawFrame(ctx,bitmap,{fit,background:transparent?null:background});
}finally{
bitmap.close();
}
return ctx.getImageData(0,0,width,height).data;
};
let shared=null;
if(sharedPalette){
const histogram=createHistogram();
for(const item of items){
throwIfAborted(signal);
addToHistogram(histogram,await pixelsFor(item),transparent);
report('palette');
await yieldToPage();
}
shared=withReserved(buildPalette(histogram,wanted),reserved);
}
const writer=new GifWriter({width,height,palette:shared,loop});
for(const item of items){
throwIfAborted(signal);
const rgba=await pixelsFor(item);
let palette=shared;
if(!palette){
const histogram=addToHistogram(createHistogram(),rgba,transparent);
palette=withReserved(buildPalette(histogram,wanted),reserved);
}
writer.addFrame({
indices:mapFrame(rgba,width,height,palette,{
dither,
from:reserved,
transparentIndex:transparent?0:-1,
}),
palette:shared?null:palette,
delay:Math.round(item.delay*100),
transparentIndex:transparent?0:-1,
});
report('writing');
await yieldToPage();
}
const bytes=writer.finalize();
return{
blob:new Blob([bytes],{type:'image/gif'}),
width,
height,
frames:writer.frames,
};
}
function withReserved(palette,reserved){
if(reserved===0)return palette;
const out=new Uint8Array(palette.length+reserved*3);
out.set(palette,reserved*3);
return out;
}
