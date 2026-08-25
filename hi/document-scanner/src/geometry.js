/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const CORNER_KEYS=['tl','tr','br','bl'];
export function orderCorners(points){
if(points.length!==4)throw new Error('a page has four corners.');
const cx=points.reduce((sum,p)=>sum+p.x,0)/4;
const cy=points.reduce((sum,p)=>sum+p.y,0)/4;
const around=[...points].sort(
(a,b)=>Math.atan2(a.y-cy,a.x-cx)-Math.atan2(b.y-cy,b.x-cx),
);
let first=0;
let best=Infinity;
around.forEach((point,index)=>{
const score=point.x+point.y;
if(score<best){
best=score;
first=index;
}
});
return[0,1,2,3].map((step)=>around[(first+step)%4]);
}
function shoelace(quad){
let sum=0;
for(let i=0;i<4;i+=1){
const a=quad[i];
const b=quad[(i+1)%4];
sum+=a.x*b.y-b.x*a.y;
}
return sum;
}
export function quadArea(quad){
return Math.abs(shoelace(quad))/2;
}
export function isConvex(quad){
let sign=0;
for(let i=0;i<4;i+=1){
const a=quad[i];
const b=quad[(i+1)%4];
const c=quad[(i+2)%4];
const cross2=(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);
if(Math.abs(cross2)<1e-9)return false;
const way=cross2>0?1:-1;
if(sign===0)sign=way;
else if(way!==sign)return false;
}
return true;
}
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function edgeLengths(quad){
return[0,1,2,3].map((i)=>distance(quad[i],quad[(i+1)%4]));
}
export function sharpestCorner(quad){
let sharpest=180;
for(let i=0;i<4;i+=1){
const previous=quad[(i+3)%4];
const point=quad[i];
const next=quad[(i+1)%4];
const a=Math.atan2(previous.y-point.y,previous.x-point.x);
const b=Math.atan2(next.y-point.y,next.x-point.x);
let angle=Math.abs(a-b)*(180/Math.PI);
if(angle>180)angle=360-angle;
sharpest=Math.min(sharpest,angle);
}
return sharpest;
}
export function homography(source,destination){
const rows=[];
for(let i=0;i<4;i+=1){
const{x,y}=source[i];
const{x:u,y:v}=destination[i];
rows.push([x,y,1,0,0,0,-u*x,-u*y,u]);
rows.push([0,0,0,x,y,1,-v*x,-v*y,v]);
}
for(let col=0;col<8;col+=1){
let pivot=col;
for(let row=col+1;row<8;row+=1){
if(Math.abs(rows[row][col])>Math.abs(rows[pivot][col]))pivot=row;
}
if(Math.abs(rows[pivot][col])<1e-10)return null;
[rows[col],rows[pivot]]=[rows[pivot],rows[col]];
const lead=rows[col][col];
for(let k=col;k<=8;k+=1)rows[col][k]/=lead;
for(let row=0;row<8;row+=1){
if(row===col)continue;
const factor=rows[row][col];
if(!factor)continue;
for(let k=col;k<=8;k+=1)rows[row][k]-=factor*rows[col][k];
}
}
const h=rows.map((row)=>row[8]);
return[h[0],h[1],h[2],h[3],h[4],h[5],h[6],h[7],1];
}
export function project(h,x,y){
const w=h[6]*x+h[7]*y+h[8];
if(!w)return{x:0,y:0};
return{
x:(h[0]*x+h[1]*y+h[2])/w,
y:(h[3]*x+h[4]*y+h[5])/w,
};
}
const cross=(a,b)=>[
a[1]*b[2]-a[2]*b[1],
a[2]*b[0]-a[0]*b[2],
a[0]*b[1]-a[1]*b[0],
];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export function perspectiveAspect(quad,width,height){
const cx=width/2;
const cy=height/2;
const at=(index)=>[quad[index].x-cx,quad[index].y-cy,1];
const m1=at(0);
const m2=at(1);
const m3=at(3);
const m4=at(2);
const k2d=dot(cross(m2,m4),m3);
const k3d=dot(cross(m3,m4),m2);
if(!k2d||!k3d)return null;
const k2=dot(cross(m1,m4),m3)/k2d;
const k3=dot(cross(m1,m4),m2)/k3d;
const n2=[k2*m2[0]-m1[0],k2*m2[1]-m1[1],k2*m2[2]-m1[2]];
const n3=[k3*m3[0]-m1[0],k3*m3[1]-m1[1],k3*m3[2]-m1[2]];
if(Math.abs(n2[2]*n3[2])<1e-9)return null;
const f2=-(n2[0]*n3[0]+n2[1]*n3[1])/(n2[2]*n3[2]);
if(!(f2>0))return null;
const across=(n2[0]*n2[0]+n2[1]*n2[1])/f2+n2[2]*n2[2];
const down=(n3[0]*n3[0]+n3[1]*n3[1])/f2+n3[2]*n3[2];
if(!(across>0)||!(down>0))return null;
return{aspect:Math.sqrt(across/down),focal:Math.sqrt(f2)};
}
export function edgeAspect(quad){
const[top,right,bottom,left]=edgeLengths(quad);
const across=Math.max(top,bottom);
const down=Math.max(left,right);
return down>0?across/down:1;
}
function foreshortening(quad){
const[top,right,bottom,left]=edgeLengths(quad);
const across=Math.abs(top-bottom)/Math.max(top,bottom,1);
const down=Math.abs(left-right)/Math.max(left,right,1);
return Math.max(across,down);
}
export function pageAspect(quad,width,height){
const edges=edgeAspect(quad);
const solved=perspectiveAspect(quad,width,height);
if(!solved)return{aspect:clampAspect(edges),method:'edges'};
const{aspect}=solved;
if(!(aspect>0.1)||!(aspect<10))return{aspect:clampAspect(edges),method:'edges'};
const allowed=0.08+2.2*foreshortening(quad);
if(Math.abs(Math.log(aspect/edges))>allowed){
return{aspect:clampAspect(edges),method:'edges'};
}
return{aspect:clampAspect(aspect),method:'perspective'};
}
function clampAspect(aspect){
if(!Number.isFinite(aspect)||aspect<=0)return 1;
return Math.min(6,Math.max(1/6,aspect));
}
export function outputSize(quad,aspect,maxSide){
const[top,right,bottom,left]=edgeLengths(quad);
const across=Math.max(top,bottom);
const down=Math.max(left,right);
let height=Math.max(down,across/aspect);
let width=height*aspect;
const longest=Math.max(width,height);
if(maxSide>0&&longest>maxSide){
const scale=maxSide/longest;
width*=scale;
height*=scale;
}
return{
width:Math.max(1,Math.round(width)),
height:Math.max(1,Math.round(height)),
};
}
export const clampPoint=(point,width,height)=>({
x:Math.min(width,Math.max(0,point.x)),
y:Math.min(height,Math.max(0,point.y)),
});
export const wholeFrame=(width,height)=>[
{x:0,y:0},
{x:width,y:0},
{x:width,y:height},
{x:0,y:height},
];
export const copyQuad=(quad)=>quad.map((point)=>({x:point.x,y:point.y}));
export const scaleQuad=(quad,scale)=>quad.map((point)=>({
x:point.x*scale,
y:point.y*scale,
}));
