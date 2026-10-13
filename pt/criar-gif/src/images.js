/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{loadImages as loadList}from'./shared/image-list.js?v=009daccc92';
export{decodeFull,moveItem,releaseItem,sortItems}from'./shared/image-list.js?v=009daccc92';
const THUMB_MAX=200;
export const DEFAULT_DELAY=0.5;
export const MIN_DELAY=0.02;
export const MAX_DELAY=60;
export function loadImages(files,delay){
return loadList(files,{thumbMax:THUMB_MAX,fields:()=>({delay:boundDelay(delay)})});
}
export function boundDelay(seconds){
const value=Number(seconds);
if(!Number.isFinite(value))return DEFAULT_DELAY;
return Math.min(MAX_DELAY,Math.max(MIN_DELAY,value));
}
export function clampDelay(seconds){
return Math.round(boundDelay(seconds)*100)/100;
}
export function frameDelays(items){
let elapsed=0;
let correction=0;
let written=0;
return items.map((item)=>{
const increment=boundDelay(item.delay)*100-correction;
const next=elapsed+increment;
correction=(next-elapsed)-increment;
elapsed=next;
const end=Math.round(elapsed+Number.EPSILON*Math.max(1,elapsed));
const delay=Math.max(MIN_DELAY*100,Math.min(MAX_DELAY*100,end-written));
written+=delay;
return delay;
});
}
