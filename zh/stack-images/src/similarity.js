/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const MIN_INLIERS=4;
const DEGREES=180/Math.PI;
const ORIGIN=Object.freeze({x:0,y:0});
export function apply(fit,x,y,centre=ORIGIN){
const radians=fit.angle/DEGREES;
const cos=Math.cos(radians)*fit.scale;
const sin=Math.sin(radians)*fit.scale;
const dx=x-centre.x;
const dy=y-centre.y;
return{
x:centre.x+dx*cos-dy*sin+fit.dx,
y:centre.y+dx*sin+dy*cos+fit.dy,
};
}
function distance(fit,point,centre){
const at=apply(fit,point.x-point.dx,point.y-point.dy,centre);
return Math.hypot(at.x-point.x,at.y-point.y);
}
function rmsOf(fit,points,centre){
if(!points.length)return 0;
let total=0;
for(const point of points){
const off=distance(fit,point,centre);
total+=off*off;
}
return Math.sqrt(total/points.length);
}
export function fitSimilarity(points,centre=ORIGIN){
const count=points.length;
if(count<2)return null;
let sourceX=0;
let sourceY=0;
let targetX=0;
let targetY=0;
for(const point of points){
sourceX+=point.x-point.dx;
sourceY+=point.y-point.dy;
targetX+=point.x;
targetY+=point.y;
}
sourceX/=count;
sourceY/=count;
targetX/=count;
targetY/=count;
let alongside=0;
let across=0;
let spread=0;
let reach=0;
for(const point of points){
const x=point.x-point.dx-sourceX;
const y=point.y-point.dy-sourceY;
const u=point.x-targetX;
const v=point.y-targetY;
alongside+=x*u+y*v;
across+=x*v-y*u;
spread+=x*x+y*y;
reach+=u*u+v*v;
}
if(!(spread>0)||!(reach>0))return null;
const a=alongside/spread;
const b=across/spread;
const offX=sourceX-centre.x;
const offY=sourceY-centre.y;
const fit={
angle:Math.atan2(b,a)*DEGREES,
scale:Math.hypot(a,b),
dx:targetX-centre.x-(a*offX-b*offY),
dy:targetY-centre.y-(b*offX+a*offY),
rms:0,
};
fit.rms=rmsOf(fit,points,centre);
return fit;
}
export function consensus(points,tolerance,centre=ORIGIN){
const found=[];
for(let i=0;i<points.length;i+=1){
for(let j=i+1;j<points.length;j+=1){
const proposal=fitSimilarity([points[i],points[j]],centre);
if(!proposal)continue;
const inliers=[];
for(let k=0;k<points.length;k+=1){
if(distance(proposal,points[k],centre)<=tolerance)inliers.push(k);
}
found.push({inliers,rms:rmsOf(proposal,inliers.map((k)=>points[k]),centre)});
}
}
let best=null;
for(const candidate of found){
const better=!best
||candidate.inliers.length>best.inliers.length
||(candidate.inliers.length===best.inliers.length&&candidate.rms<best.rms);
if(better)best=candidate;
}
if(!best||best.inliers.length<MIN_INLIERS)return null;
const kept=new Set(best.inliers);
const rival=found.some((candidate)=>candidate.inliers.length===best.inliers.length
&&candidate.inliers.every((k)=>!kept.has(k)));
if(rival)return null;
const fit=fitSimilarity(best.inliers.map((k)=>points[k]),centre);
if(!fit)return null;
return{fit,inliers:best.inliers,rms:fit.rms};
}
