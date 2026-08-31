/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{TRACED}from'./traced.js';
const fmt=(n)=>(Math.round(n*10000)/10000).toString();
const point=(x,y)=>`${fmt(x)} ${fmt(y)}`;
function distance(a,b){
return Math.hypot(a.x-b.x,a.y-b.y);
}
function towards(from,to,howFar){
const length=distance(from,to)||1;
const t=Math.min(howFar/length,0.5);
return{x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t};
}
export function roundedLoop(points){
const parts=[];
const count=points.length;
for(let i=0;i<count;i+=1){
const here=points[i];
const previous=points[(i-1+count)%count];
const next=points[(i+1)%count];
const radius=here.r??0;
const from=radius>0?towards(here,previous,radius):here;
const to=radius>0?towards(here,next,radius):here;
parts.push(`${i === 0 ? 'M' : 'L'}${point(from.x, from.y)}`);
if(radius>0)parts.push(`Q${point(here.x, here.y)} ${point(to.x, to.y)}`);
}
parts.push('Z');
return parts.join('');
}
function ellipse(cx,cy,rx,ry){
return`M${point(cx - rx, cy)}`
+`a${point(rx, ry)} 0 1 0 ${point(rx * 2, 0)}`
+`a${point(rx, ry)} 0 1 0 ${point(-rx * 2, 0)}Z`;
}
function mirrored(right){
const left=right
.slice(1,-1)
.reverse()
.map((p)=>({...p,x:-p.x}));
return[...right,...left];
}
function person(p){
const{y,w,arm}=p;
const soft=w.waist*0.3;
const body=mirrored([
{x:0,y:y.chin-0.01,r:0},
{x:w.neck,y:y.chin,r:w.neck*0.4},
{x:w.shoulder,y:y.shoulder,r:w.shoulder*0.3},
{x:w.chest,y:y.chest,r:soft},
{x:w.waist,y:y.waist,r:soft},
{x:w.hip,y:y.hip,r:soft},
{x:w.thigh,y:y.crotch+(y.knee-y.crotch)*0.25,r:soft},
{x:w.knee,y:y.knee,r:w.knee*0.5},
{x:w.ankle,y:y.ankle,r:w.ankle*0.5},
{x:w.foot,y:1,r:w.foot*0.3},
{x:w.footIn,y:1,r:0},
{x:w.ankleIn,y:y.ankle,r:w.ankle*0.4},
{x:w.kneeIn,y:y.knee,r:w.knee*0.4},
{x:w.thighIn,y:y.crotch,r:w.thigh*0.15},
{x:0,y:y.crotch-0.015,r:0},
]);
const taper=arm.elbowOuter-arm.elbowInner;
const armLoop=(side)=>roundedLoop([
{x:side*arm.topInner,y:y.shoulder+0.014,r:arm.topInner*0.2},
{x:side*arm.topOuter,y:y.shoulder+0.004,r:(arm.topOuter-arm.topInner)*0.6},
{x:side*arm.elbowOuter,y:arm.elbowY,r:taper*0.9},
{x:side*arm.wristOuter,y:arm.wristY,r:(arm.wristOuter-arm.wristInner)*0.5},
{x:side*arm.wristInner,y:arm.wristY,r:(arm.wristOuter-arm.wristInner)*0.5},
{x:side*arm.elbowInner,y:arm.elbowY,r:taper*0.9},
]);
return[
ellipse(0,p.headRatio/2,w.head,p.headRatio/2),
roundedLoop(body),
armLoop(1),
armLoop(-1),
];
}
const PEOPLE={
toddler:{
headRatio:0.222,
y:{
chin:0.222,shoulder:0.3,chest:0.39,waist:0.5,
hip:0.565,crotch:0.62,knee:0.795,ankle:0.955,
},
w:{
head:0.088,neck:0.034,shoulder:0.108,chest:0.104,waist:0.1,
hip:0.102,thigh:0.1,thighIn:0.009,knee:0.068,kneeIn:0.022,
ankle:0.048,ankleIn:0.016,foot:0.062,footIn:0.014,
},
arm:{
topOuter:0.108,topInner:0.072,elbowY:0.47,elbowOuter:0.156,
elbowInner:0.126,wristY:0.635,wristOuter:0.19,wristInner:0.163,
},
},
};
export const SHAPES=[
...Object.entries(TRACED).map(([id,art])=>({
id,
label:`shape.${id}`,
width:art.width,
inner:art.inner,
paths:art.paths,
})),
...Object.entries(PEOPLE).map(([id,p])=>({
id,
label:`shape.${id}`,
width:Math.max(p.arm.wristOuter,p.w.shoulder,p.w.hip,p.w.foot)*2+0.02,
inner:null,
paths:person(p),
})),
{id:'object',label:'shape.object',width:0.6,inner:null,paths:null},
];
const BY_ID=new Map(SHAPES.map((shape)=>[shape.id,shape]));
export function shapeOf(id){
return BY_ID.get(id)??SHAPES[0];
}
