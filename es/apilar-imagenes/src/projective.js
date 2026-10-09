/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{fitSimilarity}from'./similarity.js?v=6f5ce41257';
export const PROJECTIVE_MIN_INLIERS=6;
const ORIGIN=Object.freeze({x:0,y:0});
export function applyHomography(matrix,x,y){
const denominator=matrix[6]*x+matrix[7]*y+matrix[8];
return{
x:(matrix[0]*x+matrix[1]*y+matrix[2])/denominator,
y:(matrix[3]*x+matrix[4]*y+matrix[5])/denominator,
};
}
export function multiplyHomographies(left,right){
const out=new Array(9).fill(0);
for(let row=0;row<3;row+=1){
for(let column=0;column<3;column+=1){
for(let k=0;k<3;k+=1){
out[row*3+column]+=left[row*3+k]*right[k*3+column];
}
}
}
const unit=out[8];
if(Math.abs(unit)>1e-12)return out.map((value)=>value/unit);
return out;
}
export function similarityHomography(move,centre=ORIGIN){
const radians=(move.angle*Math.PI)/180;
const a=Math.cos(radians)*move.scale;
const b=Math.sin(radians)*move.scale;
return[
a,-b,centre.x+move.dx-a*centre.x+b*centre.y,
b,a,centre.y+move.dy-b*centre.x-a*centre.y,
0,0,1,
];
}
function leastSquares(rows,values){
const columns=8;
const a=rows.map((row)=>row.slice());
const b=values.slice();
for(let column=0;column<columns;column+=1){
let norm=0;
for(let row=column;row<a.length;row+=1)norm=Math.hypot(norm,a[row][column]);
if(!(norm>1e-9))return null;
const alpha=a[column][column]>=0?-norm:norm;
const vector=a.slice(column).map((row)=>row[column]);
vector[0]-=alpha;
let square=0;
for(const value of vector)square+=value*value;
if(!(square>1e-18))return null;
for(let next=column;next<columns;next+=1){
let dot=0;
for(let row=column;row<a.length;row+=1){
dot+=vector[row-column]*a[row][next];
}
const factor=(2*dot)/square;
for(let row=column;row<a.length;row+=1){
a[row][next]-=factor*vector[row-column];
}
}
let dot=0;
for(let row=column;row<a.length;row+=1)dot+=vector[row-column]*b[row];
const factor=(2*dot)/square;
for(let row=column;row<a.length;row+=1)b[row]-=factor*vector[row-column];
}
const out=new Array(columns).fill(0);
for(let row=columns-1;row>=0;row-=1){
let remaining=b[row];
for(let column=row+1;column<columns;column+=1){
remaining-=a[row][column]*out[column];
}
if(Math.abs(a[row][row])<1e-9)return null;
out[row]=remaining/a[row][row];
}
return out.every(Number.isFinite)?out:null;
}
export function fitHomography(points,centre=ORIGIN){
if(points.length<4)return null;
const unit=Math.max(1,...points.map((point)=>Math.hypot(
point.x-centre.x,point.y-centre.y,
)));
const rows=[];
const values=[];
for(const point of points){
const x=(point.x-point.dx-centre.x)/unit;
const y=(point.y-point.dy-centre.y)/unit;
const u=(point.x-centre.x)/unit;
const v=(point.y-centre.y)/unit;
rows.push([x,y,1,0,0,0,-u*x,-u*y]);
rows.push([0,0,0,x,y,1,-v*x,-v*y]);
values.push(u,v);
}
const fitted=leastSquares(rows,values);
if(!fitted)return null;
const into=[1/unit,0,-centre.x/unit,0,1/unit,-centre.y/unit,0,0,1];
const back=[unit,0,centre.x,0,unit,centre.y,0,0,1];
return multiplyHomographies(back,multiplyHomographies([...fitted,1],into));
}
function distance(matrix,point){
const at=applyHomography(matrix,point.x-point.dx,point.y-point.dy);
return Math.hypot(at.x-point.x,at.y-point.y);
}
function rms(matrix,points){
let square=0;
for(const point of points)square+=distance(matrix,point)**2;
return Math.sqrt(square/points.length);
}
function bounds(points){
return{
left:Math.min(...points.map((point)=>point.x)),
right:Math.max(...points.map((point)=>point.x)),
top:Math.min(...points.map((point)=>point.y)),
bottom:Math.max(...points.map((point)=>point.y)),
};
}
function distributed(inliers,points,output){
const all=bounds(points);
const found=bounds(inliers);
return found.right-found.left>=(all.right-all.left)*0.75
&&found.bottom-found.top>=(all.bottom-all.top)*0.75
&&found.right-found.left>=output.width*0.5
&&found.bottom-found.top>=output.height*0.5
&&found.right>found.left&&found.bottom>found.top;
}
export function boundedHomography(matrix,output,limit=Infinity){
if(!matrix?.every(Number.isFinite))return false;
const determinant=matrix[0]*(matrix[4]*matrix[8]-matrix[5]*matrix[7])
-matrix[1]*(matrix[3]*matrix[8]-matrix[5]*matrix[6])
+matrix[2]*(matrix[3]*matrix[7]-matrix[4]*matrix[6]);
if(!(determinant>0))return false;
let smallest=Infinity;
let largest=0;
for(const[x,y]of[[0,0],[output.width,0],
[output.width,output.height],[0,output.height]]){
const denominator=matrix[6]*x+matrix[7]*y+matrix[8];
if(!(denominator>0))return false;
smallest=Math.min(smallest,denominator);
largest=Math.max(largest,denominator);
const at=applyHomography(matrix,x,y);
if(!Number.isFinite(at.x)||!Number.isFinite(at.y)
||Math.hypot(at.x-x,at.y-y)>limit)return false;
}
return largest/smallest<=2;
}
export function projectiveConsensus(points,{
centre=ORIGIN,output,limit=Infinity,tolerance=2,
}){
if(points.length<PROJECTIVE_MIN_INLIERS)return null;
let best=null;
for(let a=0;a<points.length-3;a+=1){
for(let b=a+1;b<points.length-2;b+=1){
for(let c=b+1;c<points.length-1;c+=1){
for(let d=c+1;d<points.length;d+=1){
const matrix=fitHomography([points[a],points[b],points[c],points[d]],centre);
if(!matrix)continue;
const indices=[];
for(let index=0;index<points.length;index+=1){
if(distance(matrix,points[index])<=tolerance)indices.push(index);
}
if(indices.length<PROJECTIVE_MIN_INLIERS)continue;
const inliers=indices.map((index)=>points[index]);
if(!distributed(inliers,points,output))continue;
const error=rms(matrix,inliers);
if(!best||indices.length>best.indices.length
||(indices.length===best.indices.length&&error<best.error)){
best={indices,error};
}
}
}
}
}
if(!best)return null;
let inliers=best.indices.map((index)=>points[index]);
let matrix=fitHomography(inliers,centre);
if(!matrix)return null;
const indices=points.map((point,index)=>(distance(matrix,point)<=tolerance?index:-1))
.filter((index)=>index>=0);
if(indices.length<PROJECTIVE_MIN_INLIERS)return null;
inliers=indices.map((index)=>points[index]);
if(!distributed(inliers,points,output))return null;
matrix=fitHomography(inliers,centre);
if(!matrix||!boundedHomography(matrix,output,limit))return null;
const error=rms(matrix,inliers);
const simpler=fitSimilarity(inliers,centre);
if(!simpler||simpler.rms<0.5||simpler.rms-error<0.25
||error>simpler.rms*0.65)return null;
let validationSquare=0;
let validationMax=0;
for(let index=0;index<inliers.length;index+=1){
const heldOut=fitHomography(inliers.filter((_,which)=>which!==index),centre);
if(!heldOut||!boundedHomography(heldOut,output,limit))return null;
const errorAt=distance(heldOut,inliers[index]);
validationSquare+=errorAt*errorAt;
validationMax=Math.max(validationMax,errorAt);
}
if(validationMax>tolerance)return null;
return{
matrix,
inliers:indices,
rms:error,
validation:Math.sqrt(validationSquare/inliers.length),
};
}
