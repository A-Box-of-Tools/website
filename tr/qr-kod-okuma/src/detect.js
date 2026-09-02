/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{decodeMatrix,UnreadableError}from'./qr-decode.js';
import{sizeOf}from'./shared/qr-tables.js';
const MAX_MODULES=177;
function isFinderRatio(runs){
let total=0;
for(const run of runs){
if(run===0)return false;
total+=run;
}
if(total<7)return false;
const module=total/7;
const allowance=module/2;
return Math.abs(module-runs[0])<allowance
&&Math.abs(module-runs[1])<allowance
&&Math.abs(3*module-runs[2])<3*allowance
&&Math.abs(module-runs[3])<allowance
&&Math.abs(module-runs[4])<allowance;
}
function centreFromEnd(runs,end){
return end-runs[4]-runs[3]-runs[2]/2;
}
function crossCheck(bits,width,height,startX,startY,stepX,stepY,middle,expected){
const runs=[0,0,0,0,0];
const dark=(x,y)=>(x>=0&&y>=0&&x<width&&y<height
?bits[y*width+x]===1:false);
const centre=middle*2;
const outer=middle*4;
let x=startX;
let y=startY;
while(dark(x,y)&&runs[2]<=centre){
runs[2]+=1;
x-=stepX;
y-=stepY;
}
if(runs[2]>centre)return NaN;
while(!dark(x,y)&&runs[1]<=centre){
runs[1]+=1;
x-=stepX;
y-=stepY;
}
if(runs[1]>centre)return NaN;
while(dark(x,y)&&runs[0]<=outer){
runs[0]+=1;
x-=stepX;
y-=stepY;
}
if(runs[0]>outer)return NaN;
x=startX+stepX;
y=startY+stepY;
while(dark(x,y)&&runs[2]<=centre){
runs[2]+=1;
x+=stepX;
y+=stepY;
}
if(runs[2]>centre)return NaN;
while(!dark(x,y)&&runs[3]<=centre){
runs[3]+=1;
x+=stepX;
y+=stepY;
}
if(runs[3]>centre)return NaN;
while(dark(x,y)&&runs[4]<=outer){
runs[4]+=1;
x+=stepX;
y+=stepY;
}
if(runs[4]>outer)return NaN;
const total=runs[0]+runs[1]+runs[2]+runs[3]+runs[4];
if(expected!==null&&Math.abs(total-expected)*5>=2*expected)return NaN;
if(!isFinderRatio(runs))return NaN;
const end=stepX!==0?x:y;
return centreFromEnd(runs,end);
}
export function findFinders(bits,width,height,dense=false){
const found=[];
const stride=dense?1:Math.max(3,Math.floor((3*height)/(4*MAX_MODULES)));
const remember=(runs,row,endColumn)=>{
const total=runs[0]+runs[1]+runs[2]+runs[3]+runs[4];
let x=centreFromEnd(runs,endColumn);
const y=crossCheck(bits,width,height,Math.floor(x),row,0,1,runs[2],total);
if(Number.isNaN(y))return;
x=crossCheck(bits,width,height,Math.floor(x),Math.floor(y),1,0,runs[2],total);
if(Number.isNaN(x))return;
const diagonal=crossCheck(bits,width,height,Math.floor(x),Math.floor(y),
1,1,runs[2],null);
if(Number.isNaN(diagonal))return;
const size=total/7;
for(const centre of found){
if(Math.abs(centre.x-x)<=size&&Math.abs(centre.y-y)<=size
&&Math.abs(centre.size-size)<=Math.max(size,centre.size)/2){
const n=centre.seen+1;
centre.x=(centre.x*centre.seen+x)/n;
centre.y=(centre.y*centre.seen+y)/n;
centre.size=(centre.size*centre.seen+size)/n;
centre.seen=n;
return;
}
}
found.push({x,y,size,seen:1});
};
for(let row=stride-1;row<height;row+=stride){
const runs=[0,0,0,0,0];
let state=0;
for(let column=0;column<width;column+=1){
if(bits[row*width+column]===1){
if((state&1)===1)state+=1;
runs[state]+=1;
}else if((state&1)===1){
runs[state]+=1;
}else if(state===4){
if(isFinderRatio(runs)){
remember(runs,row,column);
runs.fill(0);
state=0;
}else{
runs[0]=runs[2];
runs[1]=runs[3];
runs[2]=runs[4];
runs[3]=1;
runs[4]=0;
state=3;
}
}else{
state+=1;
runs[state]+=1;
}
}
if(state===4&&isFinderRatio(runs))remember(runs,row,width);
}
return found;
}
function distance(a,b){
return Math.hypot(a.x-b.x,a.y-b.y);
}
export function rankTriples(candidates,keep=4){
if(candidates.length<3)return[];
const pool=[...candidates].sort((a,b)=>b.seen-a.seen).slice(0,12);
const scored=[];
for(let i=0;i<pool.length;i+=1){
for(let j=i+1;j<pool.length;j+=1){
for(let k=j+1;k<pool.length;k+=1){
const three=[pool[i],pool[j],pool[k]];
const sizes=three.map((centre)=>centre.size);
const meanSize=(sizes[0]+sizes[1]+sizes[2])/3;
const spread=Math.max(...sizes)-Math.min(...sizes);
const sides=[
distance(three[0],three[1]),
distance(three[1],three[2]),
distance(three[0],three[2]),
].sort((a,b)=>a-b);
if(sides[0]<meanSize*4)continue;
const corner=Math.acos(
Math.min(1,Math.max(-1,(sides[0]**2+sides[1]**2-sides[2]**2)
/(2*sides[0]*sides[1]))));
if(corner<0.96||corner>2.18)continue;
const legs=Math.abs(sides[0]-sides[1])/sides[1];
const right=Math.abs(sides[2]-sides[1]*Math.SQRT2)/sides[2];
const score=spread/meanSize+legs*2+right*3;
if(score<3)scored.push({three,score});
}
}
}
scored.sort((a,b)=>a.score-b.score);
return scored.slice(0,keep).map((entry)=>entry.three);
}
export function orient(three){
const sides=[
{length:distance(three[0],three[1]),opposite:2},
{length:distance(three[1],three[2]),opposite:0},
{length:distance(three[0],three[2]),opposite:1},
].sort((a,b)=>b.length-a.length);
const topLeft=three[sides[0].opposite];
const others=three.filter((centre)=>centre!==topLeft);
const[a,b]=others;
const cross=(b.x-topLeft.x)*(a.y-topLeft.y)
-(b.y-topLeft.y)*(a.x-topLeft.x);
return cross<0
?{topLeft,topRight:a,bottomLeft:b}
:{topLeft,topRight:b,bottomLeft:a};
}
function runTowards(bits,width,height,fromX,fromY,toX,toY){
const steep=Math.abs(toY-fromY)>Math.abs(toX-fromX);
let[ax,ay,bx,by]=steep?[fromY,fromX,toY,toX]:[fromX,fromY,toX,toY];
const dx=Math.abs(bx-ax);
const dy=Math.abs(by-ay);
const stepX=ax<bx?1:-1;
const stepY=ay<by?1:-1;
let error=-dx/2;
let state=0;
const dark=(x,y)=>{
const realX=steep?y:x;
const realY=steep?x:y;
return realX>=0&&realY>=0&&realX<width&&realY<height
&&bits[realY*width+realX]===1;
};
let x=ax;
let y=ay;
for(;x!==bx+stepX;x+=stepX){
if((state===1)===dark(x,y)){
if(state===2)return Math.hypot(x-ax,y-ay);
state+=1;
}
error+=dy;
if(error>0){
if(y===by)break;
y+=stepY;
error-=dx;
}
}
if(state===2)return Math.hypot(bx+stepX-ax,by-ay);
return NaN;
}
function moduleSizeBetween(bits,width,height,a,b){
const both=(from,to)=>{
const forwards=runTowards(bits,width,height,
Math.round(from.x),Math.round(from.y),
Math.round(to.x),Math.round(to.y));
const backwards=runTowards(bits,width,height,
Math.round(from.x),Math.round(from.y),
Math.round(from.x-(to.x-from.x)),
Math.round(from.y-(to.y-from.y)));
return forwards+backwards-1;
};
const one=both(a,b);
const other=both(b,a);
if(Number.isNaN(one))return Number.isNaN(other)?NaN:other/7;
if(Number.isNaN(other))return one/7;
return(one+other)/14;
}
function isAlignmentRatio(runs,moduleSize){
const allowance=moduleSize/2;
return Math.abs(moduleSize-runs[0])<allowance
&&Math.abs(moduleSize-runs[1])<allowance
&&Math.abs(moduleSize-runs[2])<allowance;
}
function findAlignment(bits,width,height,centreX,centreY,moduleSize,allowance){
const left=Math.max(0,Math.floor(centreX-allowance));
const right=Math.min(width-1,Math.ceil(centreX+allowance));
const top=Math.max(0,Math.floor(centreY-allowance));
const bottom=Math.min(height-1,Math.ceil(centreY+allowance));
if(right-left<moduleSize*3||bottom-top<moduleSize*3)return null;
const candidates=[];
for(let row=top;row<=bottom;row+=1){
const runs=[0,0,0];
let state=0;
for(let column=left;column<=right;column+=1){
const dark=bits[row*width+column]===1;
if(state===1?dark:!dark){
runs[state]+=1;
}else if(state===2){
if(isAlignmentRatio(runs,moduleSize)){
const x=column-runs[2]-runs[1]/2;
const y=alignmentColumn(bits,width,height,Math.round(x),row,
runs[1],runs[0]+runs[1]+runs[2],moduleSize);
if(!Number.isNaN(y))candidates.push({x,y,size:(runs[0]+runs[1]+runs[2])/3});
}
runs[0]=runs[2];
runs[1]=1;
runs[2]=0;
state=1;
}else{
state+=1;
runs[state]+=1;
}
}
}
if(!candidates.length)return null;
return candidates.reduce((best,candidate)=>(
Math.hypot(candidate.x-centreX,candidate.y-centreY)
<Math.hypot(best.x-centreX,best.y-centreY)?candidate:best));
}
function alignmentColumn(bits,width,height,x,startY,middle,expected,moduleSize){
if(x<0||x>=width)return NaN;
const dark=(y)=>y>=0&&y<height&&bits[y*width+x]===1;
const limit=middle*2;
let centre=0;
let y=startY;
while(dark(y)&&centre<=limit){centre+=1;y-=1;}
if(y<0||centre>limit)return NaN;
let above=0;
while(y>=0&&!dark(y)&&above<=limit){above+=1;y-=1;}
if(above>limit)return NaN;
let downward=0;
y=startY+1;
while(dark(y)&&centre+downward<=limit){downward+=1;y+=1;}
if(y>=height||centre+downward>limit)return NaN;
let below=0;
while(y<height&&!dark(y)&&below<=limit){below+=1;y+=1;}
if(below>limit)return NaN;
const runs=[above,centre+downward,below];
const total=runs[0]+runs[1]+runs[2];
if(5*Math.abs(total-expected)>=2*expected)return NaN;
if(!isAlignmentRatio(runs,moduleSize))return NaN;
return y-below-runs[1]/2;
}
function squareToQuad(p){
const dx3=p[0].x-p[1].x+p[2].x-p[3].x;
const dy3=p[0].y-p[1].y+p[2].y-p[3].y;
if(dx3===0&&dy3===0){
return[p[1].x-p[0].x,p[2].x-p[1].x,p[0].x,
p[1].y-p[0].y,p[2].y-p[1].y,p[0].y,
0,0,1];
}
const dx1=p[1].x-p[2].x;
const dx2=p[3].x-p[2].x;
const dy1=p[1].y-p[2].y;
const dy2=p[3].y-p[2].y;
const denominator=dx1*dy2-dx2*dy1;
const a13=(dx3*dy2-dx2*dy3)/denominator;
const a23=(dx1*dy3-dx3*dy1)/denominator;
return[
p[1].x-p[0].x+a13*p[1].x,p[3].x-p[0].x+a23*p[3].x,p[0].x,
p[1].y-p[0].y+a13*p[1].y,p[3].y-p[0].y+a23*p[3].y,p[0].y,
a13,a23,1,
];
}
function adjoint(m){
return[
m[4]*m[8]-m[5]*m[7],m[2]*m[7]-m[1]*m[8],m[1]*m[5]-m[2]*m[4],
m[5]*m[6]-m[3]*m[8],m[0]*m[8]-m[2]*m[6],m[2]*m[3]-m[0]*m[5],
m[3]*m[7]-m[4]*m[6],m[1]*m[6]-m[0]*m[7],m[0]*m[4]-m[1]*m[3],
];
}
function times(a,b){
const out=new Array(9);
for(let row=0;row<3;row+=1){
for(let column=0;column<3;column+=1){
out[row*3+column]=a[row*3]*b[column]
+a[row*3+1]*b[3+column]
+a[row*3+2]*b[6+column];
}
}
return out;
}
function quadToQuad(from,to){
return times(squareToQuad(to),adjoint(squareToQuad(from)));
}
function apply(m,x,y){
const w=m[6]*x+m[7]*y+m[8];
return{x:(m[0]*x+m[1]*y+m[2])/w,y:(m[3]*x+m[4]*y+m[5])/w};
}
function sampleGrid(bits,width,height,dimension,transform){
const modules=new Uint8Array(dimension*dimension);
for(let row=0;row<dimension;row+=1){
for(let column=0;column<dimension;column+=1){
const point=apply(transform,column+0.5,row+0.5);
const x=Math.floor(point.x);
const y=Math.floor(point.y);
if(x<0||y<0||x>=width||y>=height)return null;
modules[row*dimension+column]=bits[y*width+x];
}
}
return modules;
}
function attempt(bits,width,height,corners,dimension,moduleSize){
if(dimension<21||dimension>177||(dimension-17)%4!==0)return null;
const{topLeft,topRight,bottomLeft}=corners;
const far=dimension-3.5;
let bottomRight={
x:topRight.x-topLeft.x+bottomLeft.x,
y:topRight.y-topLeft.y+bottomLeft.y,
};
let sourceBottomRight=far;
if(dimension>21){
const fraction=1-3/(dimension-7);
const guessX=topLeft.x+fraction*(bottomRight.x-topLeft.x);
const guessY=topLeft.y+fraction*(bottomRight.y-topLeft.y);
for(const factor of[4,8,16]){
const found=findAlignment(bits,width,height,guessX,guessY,
moduleSize,moduleSize*factor);
if(found){
bottomRight=found;
sourceBottomRight=dimension-6.5;
break;
}
}
}
const grid=[
{x:3.5,y:3.5},
{x:far,y:3.5},
{x:sourceBottomRight,y:sourceBottomRight},
{x:3.5,y:far},
];
const picture=[topLeft,topRight,bottomRight,bottomLeft];
const modules=sampleGrid(bits,width,height,dimension,
quadToQuad(grid,picture));
if(!modules)return null;
try{
const decoded=decodeMatrix(dimension,modules);
return{...decoded,modules,dimension,corners};
}catch(error){
if(error instanceof UnreadableError)return null;
throw error;
}
}
export function readQr(bits,width,height,dense=false){
for(const three of rankTriples(findFinders(bits,width,height,dense))){
const read=fromCorners(bits,width,height,orient(three));
if(read)return read;
}
return null;
}
function fromCorners(bits,width,height,corners){
const{topLeft,topRight,bottomLeft}=corners;
const measured=[
moduleSizeBetween(bits,width,height,topLeft,topRight),
moduleSizeBetween(bits,width,height,topLeft,bottomLeft),
].filter((value)=>!Number.isNaN(value)&&value>=1);
const moduleSize=measured.length
?measured.reduce((sum,value)=>sum+value,0)/measured.length
:(topLeft.size+topRight.size+bottomLeft.size)/3;
if(!(moduleSize>=1))return null;
const across=Math.round(distance(topLeft,topRight)/moduleSize);
const down=Math.round(distance(topLeft,bottomLeft)/moduleSize);
let guess=Math.round((across+down)/2)+7;
const remainder=((guess%4)+4)%4;
if(remainder===0)guess+=1;
else if(remainder===2)guess-=1;
else if(remainder===3)guess+=2;
for(const dimension of[guess,guess-4,guess+4,guess-8,guess+8]){
const read=attempt(bits,width,height,corners,dimension,moduleSize);
if(read)return read;
}
return null;
}
export const SIZES=Array.from({length:40},(unused,i)=>sizeOf(i+1));
