/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{loadImages as loadList}from'./shared/image-list.js';
export{decodeFull,moveItem,releaseItem,sortItems}from'./shared/image-list.js';
const THUMB_MAX=200;
export const DEFAULT_DELAY=0.5;
export const MIN_DELAY=0.02;
export const MAX_DELAY=60;
export function loadImages(files,delay){
return loadList(files,{thumbMax:THUMB_MAX,fields:()=>({delay:clampDelay(delay)})});
}
export function clampDelay(seconds){
const value=Number(seconds);
if(!Number.isFinite(value))return DEFAULT_DELAY;
return Math.min(MAX_DELAY,Math.max(MIN_DELAY,Math.round(value*100)/100));
}
