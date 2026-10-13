/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const DEFAULTS={
epsilon:'auto',
epsilonRange:[0.6,1.5],
epsilonOfThickness:0.35,
cornerFactor:4,
cornerAngle:65,
flatBulge:0.08,
minRun:3,
maxShift:2.0,
};
export function fitContour(contour,options={}){
const o={...DEFAULTS,...options};
const{xs,ys}=contour;
const n=xs.length;
const epsilon=o.epsilon==='auto'?autoEpsilon(contour,o):o.epsilon;
let keep=simplifyClosed(xs,ys,epsilon);
keep=dropHesitations(keep,n,o.minRun);
if(keep.length<3)keep=staircaseCorners(xs,ys);
if(keep.length<3)keep=[0,Math.floor(n/3),Math.floor((2*n)/3)];
const m=keep.length;
const lines=new Array(m);
for(let i=0;i<m;i++)lines[i]=fitLine(xs,ys,keep[i],keep[(i+1)%m],n);
const vertices=new Array(m);
for(let i=0;i<m;i++){
const at=keep[i];
vertices[i]=meetOfLines(lines[(i-1+m)%m],lines[i],xs[at],ys[at],o.maxShift);
}
return{...curveThrough(vertices,o,epsilon),vertices,epsilon};
}
function autoEpsilon(contour,o){
const perimeter=contour.xs.length;
const thickness=perimeter>0?(2*Math.abs(contour.area))/perimeter:0;
const[lo,hi]=o.epsilonRange;
return Math.max(lo,Math.min(hi,thickness*o.epsilonOfThickness));
}
function simplifyClosed(xs,ys,epsilon){
const n=xs.length;
if(n<4)return[...xs.keys()];
let cx=0,cy=0;
for(let i=0;i<n;i++){cx+=xs[i];cy+=ys[i];}
cx/=n;cy/=n;
let a=0,far=-1;
for(let i=0;i<n;i++){
const d=(xs[i]-cx)**2+(ys[i]-cy)**2;
if(d>far){far=d;a=i;}
}
let b=a,far2=-1;
for(let i=0;i<n;i++){
const d=(xs[i]-xs[a])**2+(ys[i]-ys[a])**2;
if(d>far2){far2=d;b=i;}
}
const order=new Array(n+1);
for(let k=0;k<=n;k++)order[k]=(a+k)%n;
const posB=(b-a+n)%n;
const kept=new Uint8Array(n+1);
kept[0]=1;
kept[posB]=1;
kept[n]=1;
rdp(xs,ys,order,0,posB,epsilon,kept);
rdp(xs,ys,order,posB,n,epsilon,kept);
const out=[];
for(let k=0;k<n;k++)if(kept[k])out.push(order[k]);
return out;
}
function rdp(xs,ys,order,lo,hi,epsilon,kept){
const stack=[[lo,hi]];
while(stack.length){
const[i,j]=stack.pop();
if(j<=i+1)continue;
const ax=xs[order[i]],ay=ys[order[i]];
const bx=xs[order[j]],by=ys[order[j]];
let ex=bx-ax,ey=by-ay;
const len=Math.hypot(ex,ey);
if(len>0){ex/=len;ey/=len;}
let worst=-1,at=-1;
for(let k=i+1;k<j;k++){
const px=xs[order[k]]-ax,py=ys[order[k]]-ay;
const d=len>0?Math.abs(px*ey-py*ex):Math.hypot(px,py);
if(d>worst){worst=d;at=k;}
}
if(worst>epsilon){
kept[at]=1;
stack.push([i,at],[at,j]);
}
}
}
function dropHesitations(keep,n,minRun){
if(keep.length<=4)return keep;
const out=keep.slice();
for(let i=0;i<out.length&&out.length>4;i++){
const m=out.length;
const before=(out[i]-out[(i-1+m)%m]+n)%n;
const after=(out[(i+1)%m]-out[i]+n)%n;
if(Math.min(before,after)>=minRun)continue;
if(before+after<minRun*3)continue;
out.splice(i,1);
i--;
}
return out;
}
function staircaseCorners(xs,ys){
const n=xs.length;
const out=[];
for(let i=0;i<n;i++){
const p=(i-1+n)%n,q=(i+1)%n;
if((xs[i]-xs[p])!==(xs[q]-xs[i])||(ys[i]-ys[p])!==(ys[q]-ys[i]))out.push(i);
}
return out;
}
function fitLine(xs,ys,from,to,n){
let count=(to-from+n)%n;
if(count===0)count=n;
count+=1;
let sx=0,sy=0;
for(let k=0,i=from;k<count;k++,i=(i+1)%n){sx+=xs[i];sy+=ys[i];}
const mx=sx/count,my=sy/count;
let sxx=0,sxy=0,syy=0;
for(let k=0,i=from;k<count;k++,i=(i+1)%n){
const dx=xs[i]-mx,dy=ys[i]-my;
sxx+=dx*dx;sxy+=dx*dy;syy+=dy*dy;
}
const t=sxx+syy,det=sxx*syy-sxy*sxy;
const lambda=t/2+Math.sqrt(Math.max(0,(t*t)/4-det));
let ux=sxy,uy=lambda-sxx;
if(Math.abs(ux)+Math.abs(uy)<1e-9){ux=lambda-syy;uy=sxy;}
const len=Math.hypot(ux,uy);
if(len<1e-9){
const ex=xs[to]-xs[from],ey=ys[to]-ys[from];
const l=Math.hypot(ex,ey)||1;
return{cx:mx,cy:my,dx:ex/l,dy:ey/l};
}
return{cx:mx,cy:my,dx:ux/len,dy:uy/len};
}
function meetOfLines(a,b,latticeX,latticeY,maxShift){
const cross=a.dx*b.dy-a.dy*b.dx;
let px,py;
if(Math.abs(cross)>0.3){
const t=((b.cx-a.cx)*b.dy-(b.cy-a.cy)*b.dx)/cross;
px=a.cx+t*a.dx;
py=a.cy+t*a.dy;
}else{
const p1=project(a,latticeX,latticeY);
const p2=project(b,latticeX,latticeY);
px=(p1[0]+p2[0])/2;
py=(p1[1]+p2[1])/2;
}
const ox=px-latticeX,oy=py-latticeY;
const d=Math.hypot(ox,oy);
if(d>maxShift){px=latticeX+(ox/d)*maxShift;py=latticeY+(oy/d)*maxShift;}
return{x:px,y:py};
}
function project(line,x,y){
const t=(x-line.cx)*line.dx+(y-line.cy)*line.dy;
return[line.cx+t*line.dx,line.cy+t*line.dy];
}
function curveThrough(v,o,epsilon){
const m=v.length;
const mid=(p,q)=>({x:(p.x+q.x)/2,y:(p.y+q.y)/2});
const lerp=(p,q,t)=>({x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t});
const cosLimit=Math.cos((o.cornerAngle*Math.PI)/180);
const cornerBulge=o.cornerFactor*epsilon;
const cmds=[];
let corners=0,smooth=0,flat=0;
let start=null;
for(let i=0;i<m;i++){
const prev=v[(i-1+m)%m],cur=v[i],next=v[(i+1)%m];
const m1=mid(prev,cur),m2=mid(cur,next);
const ex=next.x-prev.x,ey=next.y-prev.y;
const chord=Math.hypot(ex,ey);
const bulge=chord<1e-9
?Math.hypot(cur.x-prev.x,cur.y-prev.y)
:Math.abs((cur.x-prev.x)*ey-(cur.y-prev.y)*ex)/chord;
const ax=cur.x-prev.x,ay=cur.y-prev.y;
const bx=next.x-cur.x,by=next.y-cur.y;
const la=Math.hypot(ax,ay)||1e-9,lb=Math.hypot(bx,by)||1e-9;
const cosTurn=(ax*bx+ay*by)/(la*lb);
if(start===null)start=[m1.x,m1.y];
if(bulge<o.flatBulge){
cmds.push({t:'L',p:[m2.x,m2.y]});
flat++;
}else if(bulge>=cornerBulge||cosTurn<=cosLimit){
cmds.push({t:'L',p:[cur.x,cur.y]});
cmds.push({t:'L',p:[m2.x,m2.y]});
corners++;
}else{
const k=2/3+(1/3)*Math.min(1,bulge/cornerBulge);
const c1=lerp(m1,cur,k),c2=lerp(m2,cur,k);
cmds.push({t:'C',c1:[c1.x,c1.y],c2:[c2.x,c2.y],p:[m2.x,m2.y]});
smooth++;
}
}
return{start,cmds,corners,smooth,flat};
}
