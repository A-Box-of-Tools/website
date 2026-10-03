/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=5b77b17058';
export function fileSize(count){
if(count<1024)return`${count} B`;
if(count<1024*1024)return`${(count / 1024).toFixed(count < 10240 ? 1 : 0)} KB`;
if(count<1024*1024*1024)return`${(count / 1048576).toFixed(count < 10485760 ? 2 : 1)} MB`;
return`${(count / 1073741824).toFixed(2)} GB`;
}
export const exact=(count)=>phrase('size.bytes',{n:count.toLocaleString()});
export const percent=(fraction)=>`${Math.min(100, Math.round(fraction * 100))}%`;
export function smooth(previous,sample){
if(!Number.isFinite(sample)||sample<=0)return previous;
if(previous===null)return sample;
return previous*0.7+sample*0.3;
}
export function rate(bytes,seconds){
if(seconds<=0)return null;
return bytes/seconds/1048576;
}
export function remaining(seconds){
if(!Number.isFinite(seconds)||seconds<0)return null;
if(seconds<90)return phrase('time.seconds',{n:Math.max(1,Math.round(seconds))});
const minutes=Math.round(seconds/60);
return phrase('time.minutes',{n:minutes});
}
export const plural=(value,one,many)=>`${value} ${value === 1 ? one : many}`;
