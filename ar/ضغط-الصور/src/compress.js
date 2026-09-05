/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{encode,FORMATS,JPEG,PNG,WEBP}from'./codecs.js?v=6ce0c50246';
export const QUALITY_CEILING=0.94;
export const QUALITY_FLOOR=0.62;
export const SEARCH_QUALITY=0.8;
export const MIN_SCALE=0.1;
export const QUALITY_HARD_MIN=0.2;
const MAX_ENCODES=16;
export async function fitToTarget(source,{targetBytes,mime,allowResize,onStep}){
const lossy=FORMATS[mime]?.lossy??true;
let encodes=0;
let best=null;
let smallest=null;
const attempt=async(scale,quality)=>{
if(encodes>=MAX_ENCODES)throw new Error('error.attempts');
encodes+=1;
const width=Math.max(1,Math.round(source.width*scale));
const height=Math.max(1,Math.round(source.height*scale));
const blob=await encode(source.bitmap,{
width,height,mime,quality:lossy?quality:undefined,
});
const made={blob,quality:lossy?quality:1,scale,width,height};
if(blob.size<=targetBytes&&(!best||blob.size>best.blob.size))best=made;
if(!smallest||blob.size<smallest.blob.size)smallest=made;
return made;
};
const fits=(a)=>a.blob.size<=targetBytes;
onStep?.('step.full');
const top=await attempt(1,QUALITY_CEILING);
if(fits(top))return finish(top,true);
if(!lossy){
if(!allowResize)return finish(smallest,false);
onStep?.('step.scale');
await searchScale(attempt,fits,targetBytes,top.blob.size,undefined);
return finish(best??smallest,Boolean(best));
}
onStep?.('step.quality');
const atFloor=await attempt(1,QUALITY_FLOOR);
if(fits(atFloor)){
await bisectQuality(attempt,fits,1,QUALITY_FLOOR,QUALITY_CEILING,6);
return finish(best,true);
}
if(!allowResize){
onStep?.('step.belowFloor');
const bottom=await attempt(1,QUALITY_HARD_MIN);
if(!fits(bottom))return finish(smallest,false);
await bisectQuality(attempt,fits,1,QUALITY_HARD_MIN,QUALITY_FLOOR,5);
return finish(best,true);
}
onStep?.('step.resolution');
const reference=await attempt(1,SEARCH_QUALITY);
await searchScale(attempt,fits,targetBytes,reference.blob.size,SEARCH_QUALITY);
if(!best)return finish(smallest,false);
onStep?.('step.budget');
await bisectQuality(attempt,fits,best.scale,SEARCH_QUALITY,QUALITY_CEILING,3);
return finish(best,true);
function finish(chosen,fitted){
return{
blob:chosen.blob,
width:chosen.width,
height:chosen.height,
quality:chosen.quality,
scale:chosen.scale,
fitted,
resized:chosen.scale<1,
encodes,
mime,
};
}
}
async function bisectQuality(attempt,fits,scale,low,high,rounds){
for(let i=0;i<rounds;i+=1){
const mid=(low+high)/2;
if(fits(await attempt(scale,mid)))low=mid;
else high=mid;
}
}
async function searchScale(attempt,fits,targetBytes,referenceBytes,quality){
const guess=clamp(Math.sqrt(targetBytes/referenceBytes)*0.95,MIN_SCALE,1);
let low=MIN_SCALE;
let high=1;
if(fits(await attempt(guess,quality)))low=guess;
else high=guess;
for(let i=0;i<4;i+=1){
const mid=(low+high)/2;
if(fits(await attempt(mid,quality)))low=mid;
else high=mid;
}
}
function clamp(n,low,high){
return Math.min(high,Math.max(low,n));
}
export function keepFormat(sourceMime,available){
if(available.has(sourceMime)&&FORMATS[sourceMime])return sourceMime;
return sourceMime==='image/gif'?PNG:JPEG;
}
export function alternativeFormat(mime,available,hasAlpha){
if(mime!==WEBP&&available.has(WEBP))return WEBP;
if(mime===PNG&&!hasAlpha)return JPEG;
return null;
}
