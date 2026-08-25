/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function fileSize(count){
if(count<1024)return`${count} B`;
if(count<1024*1024)return`${(count / 1024).toFixed(count < 10240 ? 1 : 0)} KB`;
return`${(count / 1048576).toFixed(count < 10485760 ? 2 : 1)} MB`;
}
export const exact=(count)=>`${count.toLocaleString()} bytes`;
export function delay(centiseconds){
if(centiseconds===0)return'0s';
const value=centiseconds/100;
return value>=10?`${value.toFixed(1)}s`:`${value.toFixed(2)}s`;
}
export function clock(centiseconds){
const total=centiseconds/100;
if(total<60)return`${total.toFixed(total < 10 ? 2 : 1)}s`;
const minutes=Math.floor(total/60);
const seconds=total-minutes*60;
return`${minutes}m ${seconds.toFixed(1)}s`;
}
export function rate(frames,centiseconds){
if(frames<2||centiseconds<=0)return null;
return frames/(centiseconds/100);
}
export const percent=(fraction)=>{
const value=fraction*100;
if(value===0)return'0%';
if(value<0.1)return'<0.1%';
return`${value.toFixed(value < 10 ? 1 : 0)}%`;
};
export const count=(value)=>value.toLocaleString();
export function hex(colors,index){
const at=index*3;
const pair=(byte)=>byte.toString(16).padStart(2,'0');
return`#${pair(colors[at])}${pair(colors[at + 1])}${pair(colors[at + 2])}`.toUpperCase();
}
export const plural=(value,one,many)=>`${count(value)} ${value === 1 ? one : many}`;
