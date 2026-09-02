/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function traceContours(mask,options={}){
const{w,h,bits}=mask;
const joinDiagonals=options.joinDiagonals===true;
const minArea=options.minArea??0;
const ink=(x,y)=>(x>=0&&y>=0&&x<w&&y<h&&bits[y*w+x]===1);
const hSeen=new Uint8Array(w*(h+1));
const vSeen=new Uint8Array((w+1)*h);
const out=[];
const limit=8*(w+1)*(h+1);
for(let sy=0;sy<h;sy++){
for(let sx=0;sx<w;sx++){
if(!ink(sx,sy)||ink(sx,sy-1))continue;
if(hSeen[sy*w+sx])continue;
const xs=[];
const ys=[];
let x=sx,y=sy,dx=1,dy=0,steps=0;
for(;;){
xs.push(x);ys.push(y);
if(dy===0)hSeen[y*w+(dx>0?x:x-1)]=1;
else vSeen[(dy>0?y:y-1)*(w+1)+x]=1;
x+=dx;y+=dy;
const lx=dy,ly=-dx;
const rx=-dy,ry=dx;
const front=ink(x+(dx+rx-1)/2,y+(dy+ry-1)/2);
const back=ink(x+(dx+lx-1)/2,y+(dy+ly-1)/2);
if(!front){
if(back&&joinDiagonals){dx=lx;dy=ly;}
else{dx=rx;dy=ry;}
}else if(back){
dx=lx;dy=ly;
}
if(x===sx&&y===sy&&dx===1&&dy===0)break;
if(++steps>limit)break;
}
let twice=0;
for(let i=0,n=xs.length;i<n;i++){
const j=i+1===n?0:i+1;
twice+=xs[i]*ys[j]-xs[j]*ys[i];
}
const area=twice/2;
if(Math.abs(area)>=minArea){
out.push({xs:Int32Array.from(xs),ys:Int32Array.from(ys),area});
}
}
}
return out;
}
