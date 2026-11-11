/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const MIN_SIZE=6;
export const STYLES=['fill','pixelate','blur'];
export const STRENGTHS={
light:{id:'light',label:'strength.light',blocks:14,blur:22},
medium:{id:'medium',label:'strength.medium',blocks:9,blur:14},
heavy:{id:'heavy',label:'strength.heavy',blocks:5,blur:7},
};
export const strengthOf=(id)=>STRENGTHS[id]??STRENGTHS.medium;
const clamp=(value,low,high)=>Math.max(low,Math.min(value,high));
export function blockSize(rect,strength){
const shorter=Math.min(rect.width,rect.height);
const size=Math.round(shorter/strengthOf(strength).blocks);
return clamp(size,3,Math.max(3,shorter));
}
export function blurRadius(rect,strength){
const shorter=Math.min(rect.width,rect.height);
const radius=Math.round(shorter/strengthOf(strength).blur);
return clamp(radius,2,Math.max(2,shorter));
}
export function blockCount(rect,strength){
const size=blockSize(rect,strength);
return{
across:Math.ceil(rect.width/size),
down:Math.ceil(rect.height/size),
size,
};
}
export function fromDrag(start,end){
const x=Math.round(Math.min(start.x,end.x));
const y=Math.round(Math.min(start.y,end.y));
return{
x,
y,
width:Math.round(Math.abs(end.x-start.x)),
height:Math.round(Math.abs(end.y-start.y)),
};
}
export const isUsable=(rect)=>rect.width>=MIN_SIZE&&rect.height>=MIN_SIZE;
export function clampRect(rect,source){
const width=clamp(Math.round(rect.width),0,source.width);
const height=clamp(Math.round(rect.height),0,source.height);
return{
x:clamp(Math.round(rect.x),0,source.width-width),
y:clamp(Math.round(rect.y),0,source.height-height),
width,
height,
};
}
export const moveRect=(rect,dx,dy,source)=>clampRect(
{...rect,x:rect.x+dx,y:rect.y+dy},source,
);
export const HANDLES=['n','s','e','w','ne','nw','se','sw'];
export function resizeRect(rect,handle,dx,dy,source){
const name=String(handle??'');
const left=rect.x+(name.includes('w')?dx:0);
const top=rect.y+(name.includes('n')?dy:0);
const right=rect.x+rect.width+(name.includes('e')?dx:0);
const bottom=rect.y+rect.height+(name.includes('s')?dy:0);
return clampRect(
fromDrag({x:left,y:top},{x:right,y:bottom}),
source,
);
}
export const contains=(rect,point)=>(
point.x>=rect.x&&point.x<=rect.x+rect.width
&&point.y>=rect.y&&point.y<=rect.y+rect.height
);
export function topmostAt(regions,point){
for(let i=regions.length-1;i>=0;i-=1){
if(contains(regions[i],point))return regions[i];
}
return null;
}
