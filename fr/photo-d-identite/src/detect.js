/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{deltaE,rgbToLab}from'./background.js?v=147d2bfb4a';
export const WORKING_EDGE=480;
const SMALLEST_HEAD=24;
const EYE_LEVEL=0.49;
const HEAD_SHAPE=1.45;
const JAW_WIDTH=0.70;
const JAW_LEVEL=0.5+0.5*Math.sqrt(1-JAW_WIDTH*JAW_WIDTH);
const EYE_BOXES=[[0.055,0.055],[0.09,0.06],[0.14,0.085]];
const clamp=(value,low,high)=>Math.min(high,Math.max(low,value));
function at(sorted,fraction){
if(!sorted.length)return 0;
return sorted[clamp(Math.round((sorted.length-1)*fraction),0,sorted.length-1)];
}
const median=(values)=>at([...values].sort((a,b)=>a-b),0.5);
export function findMarks(image){
const{width,height}=image;
if(!width||!height)return nothing();
const lab=labField(image);
const wall=readWall(lab,width,height);
if(!wall||wall.noise>25)return nothing();
const blob=subjectOf(lab,wall,width,height);
if(!blob||blob.area<width*height*0.04)return nothing();
const crownY=crownOf(blob.rows,height);
if(crownY<0)return nothing();
const shape=silhouette(blob.rows,crownY,height);
if(shape.headWidth<SMALLEST_HEAD)return nothing();
const notes=[];
const cropped=crownY===0;
if(cropped)notes.push('top');
if(wall.noise>12&&!cropped)notes.push('background');
const centreX=centreOf(blob,crownY,shape.head,height);
const eyes=findEyes(lab,blob.mask,width,height,{crownY,centreX,...shape});
if(!eyes)notes.push('eyes');
const eyeY=eyes?(eyes.left.y+eyes.right.y)/2:crownY+EYE_LEVEL*shape.head;
const eyeX=eyes?(eyes.left.x+eyes.right.x)/2:centreX;
let chinY=crownY+(eyeY-crownY)/EYE_LEVEL;
const outlined=shape.jawY>eyeY
?crownY+(shape.jawY-crownY)/JAW_LEVEL
:-1;
if(outlined>0&&Math.abs(outlined-chinY)<=(chinY-crownY)/6){
chinY=(chinY+outlined)/2;
}else{
notes.push('chin');
}
const marks={
crown:{x:crownXOf(blob,crownY,height,centreX),y:crownY},
chin:{x:eyeX,y:chinY},
leftEye:eyes?eyes.left:{x:eyeX-0.20*shape.headWidth,y:eyeY},
rightEye:eyes?eyes.right:{x:eyeX+0.20*shape.headWidth,y:eyeY},
};
return{
marks:contain(marks,width,height),
quality:notes.length?'rough':'measured',
notes,
};
}
const nothing=()=>({marks:null,quality:'none',notes:['background']});
function contain(marks,width,height){
return Object.fromEntries(Object.entries(marks).map(([key,point])=>[key,{
x:clamp(Math.round(point.x),0,width-1),
y:clamp(Math.round(point.y),0,height-1),
}]));
}
function labField({data,width,height}){
const lab=new Float32Array(width*height*3);
for(let i=0,p=0;i<width*height;i+=1,p+=4){
const[l,a,b]=rgbToLab([data[p],data[p+1],data[p+2]]);
lab[i*3]=l;
lab[i*3+1]=a;
lab[i*3+2]=b;
}
return lab;
}
const NOT_WALL=25;
function readWall(lab,width,height){
const edgeX=Math.max(2,Math.round(width*0.06));
const edgeY=Math.max(2,Math.round(height*0.06));
const seen=[];
for(let y=0;y<height;y+=1){
const flanking=y<height*0.6;
for(let x=0;x<width;x+=1){
if(!(y<edgeY||(flanking&&(x<edgeX||x>=width-edgeX))))continue;
const i=(y*width+x)*3;
seen.push([lab[i],lab[i+1],lab[i+2]]);
}
}
if(seen.length<64)return null;
const colour=[0,1,2].map((channel)=>median(seen.map((one)=>one[channel])));
const away=seen.map((one)=>deltaE(one,colour)).sort((a,b)=>a-b);
const wall=away.filter((one)=>one<=NOT_WALL);
if(wall.length<away.length/2)return null;
return{lab:colour,noise:at(wall,0.9)};
}
function subjectOf(lab,wall,width,height){
const count=width*height;
const limit=clamp(wall.noise*2.2,8,26);
const fore=new Uint8Array(count);
const pixel=[0,0,0];
for(let i=0;i<count;i+=1){
pixel[0]=lab[i*3];
pixel[1]=lab[i*3+1];
pixel[2]=lab[i*3+2];
if(deltaE(pixel,wall.lab)>limit)fore[i]=1;
}
const label=new Int32Array(count).fill(-1);
const stack=new Int32Array(count);
const areas=[];
const tops=[];
const bottoms=[];
for(let seed=0;seed<count;seed+=1){
if(!fore[seed]||label[seed]!==-1)continue;
const id=areas.length;
areas.push(0);
tops.push(height);
bottoms.push(0);
let top=0;
stack[top]=seed;
top+=1;
label[seed]=id;
while(top>0){
top-=1;
const here=stack[top];
areas[id]+=1;
const x=here%width;
const y=(here-x)/width;
if(y<tops[id])tops[id]=y;
if(y>bottoms[id])bottoms[id]=y;
if(x>0&&fore[here-1]&&label[here-1]===-1){
label[here-1]=id;
stack[top]=here-1;
top+=1;
}
if(x+1<width&&fore[here+1]&&label[here+1]===-1){
label[here+1]=id;
stack[top]=here+1;
top+=1;
}
if(y>0&&fore[here-width]&&label[here-width]===-1){
label[here-width]=id;
stack[top]=here-width;
top+=1;
}
if(y+1<height&&fore[here+width]&&label[here+width]===-1){
label[here+width]=id;
stack[top]=here+width;
top+=1;
}
}
}
if(!areas.length)return null;
let largest=0;
for(const area of areas)largest=Math.max(largest,area);
let winner=areas.indexOf(largest);
let highest=height;
for(let id=0;id<areas.length;id+=1){
if(areas[id]<largest*0.25)continue;
if(bottoms[id]-tops[id]<height*0.14)continue;
if(tops[id]<highest){
highest=tops[id];
winner=id;
}
}
const rows=new Int32Array(height);
const sumX=new Float64Array(height);
const mask=new Uint8Array(count);
for(let y=0;y<height;y+=1){
for(let x=0;x<width;x+=1){
if(label[y*width+x]!==winner)continue;
mask[y*width+x]=1;
rows[y]+=1;
sumX[y]+=x;
}
}
fillHoles(mask,stack,width,height);
return{rows,sumX,area:areas[winner],mask};
}
function fillHoles(mask,stack,width,height){
const count=width*height;
const wall=new Uint8Array(count);
let top=0;
const reach=(at)=>{
if(mask[at]||wall[at])return;
wall[at]=1;
stack[top]=at;
top+=1;
};
for(let x=0;x<width;x+=1){
reach(x);
reach((height-1)*width+x);
}
for(let y=0;y<height;y+=1){
reach(y*width);
reach(y*width+width-1);
}
while(top>0){
top-=1;
const here=stack[top];
const x=here%width;
const y=(here-x)/width;
if(x>0)reach(here-1);
if(x+1<width)reach(here+1);
if(y>0)reach(here-width);
if(y+1<height)reach(here+width);
}
for(let i=0;i<count;i+=1)if(!wall[i])mask[i]=1;
}
function crownOf(rows,height){
for(let y=0;y+2<height;y+=1){
if(rows[y]>=3&&rows[y+1]>=3&&rows[y+2]>=3)return y;
}
return-1;
}
function crownXOf(blob,crownY,height,fallback){
const span=Math.max(2,Math.round(height*0.03));
let count=0;
let total=0;
for(let y=crownY;y<Math.min(height,crownY+span);y+=1){
count+=blob.rows[y];
total+=blob.sumX[y];
}
return count?total/count:fallback;
}
function centreOf(blob,crownY,head,height){
const from=Math.max(0,Math.round(crownY+0.25*head));
const to=Math.min(height,Math.round(crownY+0.65*head));
let count=0;
let total=0;
for(let y=from;y<to;y+=1){
count+=blob.rows[y];
total+=blob.sumX[y];
}
return count?total/count:0;
}
function smoothed(rows,span){
const out=new Float64Array(rows.length);
for(let y=0;y<rows.length;y+=1){
let total=0;
let seen=0;
for(let k=-span;k<=span;k+=1){
if(y+k<0||y+k>=rows.length)continue;
total+=rows[y+k];
seen+=1;
}
out[y]=total/seen;
}
return out;
}
function silhouette(rows,crownY,height){
const profile=smoothed(rows,Math.max(1,Math.round(height*0.008)));
const below=height-crownY;
let peak=0;
let valley=Infinity;
let neckY=-1;
let end=height;
for(let y=crownY;y<height;y+=1){
const at=profile[y];
if(neckY<0&&at>=peak){
peak=at;
continue;
}
if(at<peak*0.85){
if(at<=valley){
valley=at;
neckY=y;
}else if(at>valley*1.35){
end=y;
break;
}
}
}
const head=clamp(peak*HEAD_SHAPE,0.1*below,0.95*below);
return{headWidth:peak,head,neckY,jawY:jawOf(profile,crownY,head,peak,end)};
}
function jawOf(profile,crownY,head,widest,end){
if(widest<=0)return-1;
const from=Math.max(0,Math.round(crownY+0.55*head));
const to=Math.min(end,Math.round(crownY+1.45*head));
for(let y=from;y<to;y+=1){
if(profile[y]<widest*JAW_WIDTH)return y;
}
return-1;
}
function findEyes(lab,mask,width,height,face){
const{crownY,centreX,headWidth,head}=face;
const x0=Math.max(0,Math.round(centreX-0.58*headWidth));
const x1=Math.min(width,Math.round(centreX+0.58*headWidth));
const y0=Math.max(0,Math.round(crownY+0.15*head));
const y1=Math.min(height,Math.round(crownY+0.85*head));
const w=x1-x0;
const h=y1-y0;
if(w<20||h<14)return null;
const lights=[];
for(let y=y0;y<y1;y+=1){
for(let x=x0;x<x1;x+=1)lights.push(lab[(y*width+x)*3]);
}
lights.sort((a,b)=>a-b);
const skin=at(lights,0.75);
const dark=new Float64Array(w*h);
const outside=new Float64Array(w*h);
for(let y=0;y<h;y+=1){
for(let x=0;x<w;x+=1){
const at3=(y+y0)*width+(x+x0);
dark[y*w+x]=Math.max(0,skin-lab[at3*3]);
outside[y*w+x]=mask[at3]?0:1;
}
}
const sums=integral(dark,w,h);
const off=integral(outside,w,h);
const localCentre=centreX-x0;
let best=null;
for(const[across,down]of EYE_BOXES){
const bw=clamp(Math.round(across*headWidth),3,Math.floor(w/5));
const bh=clamp(Math.round(down*headWidth),2,Math.floor(h/5));
const pair=bestPair(scan(sums,off,w,h,bw,bh),bw,headWidth,localCentre);
if(pair&&(!best||pair.score>best.score))best={...pair,bw,bh};
}
if(!best)return null;
return{
left:pupil(dark,w,h,best.l,best.bw,best.bh,x0,y0),
right:pupil(dark,w,h,best.r,best.bw,best.bh,x0,y0),
};
}
function scan(sums,off,w,h,bw,bh){
const mean=(ax,ay,bx,by)=>patch(sums,w,ax,ay,bx,by)/((bx-ax)*(by-ay));
const found=[];
for(let y=0;y+2*bh<=h;y+=1){
for(let x=bw;x+2*bw<=w;x+=1){
if(patch(off,w,x-bw,y,x+2*bw,y+2*bh)>0)continue;
const inner=mean(x,y,x+bw,y+bh);
if(inner<=0)continue;
const beside=Math.max(
mean(x-bw,y,x,y+bh),
mean(x+bw,y,x+2*bw,y+bh),
mean(x,y+bh,x+bw,y+2*bh),
);
if(inner>beside)found.push({x,y,score:inner-beside});
}
}
return found;
}
function bestPair(found,bw,headWidth,localCentre){
const apart=0.06*headWidth;
const left=pick(found.filter((one)=>one.x+bw/2<localCentre-apart),bw,bw);
const right=pick(found.filter((one)=>one.x+bw/2>localCentre+apart),bw,bw);
const pairs=[];
for(const l of left){
for(const r of right){
const gap=r.x-l.x;
if(gap<0.24*headWidth||gap>0.62*headWidth)continue;
const level=Math.abs(r.y-l.y);
if(level>0.12*headWidth)continue;
const off=Math.abs((l.x+r.x+bw)/2-localCentre);
pairs.push({
l,
r,
y:(l.y+r.y)/2,
score:(l.score+r.score)
*(1-0.5*clamp(level/(0.12*headWidth),0,1))
*(1-0.4*clamp(off/(0.20*headWidth),0,1)),
});
}
}
if(!pairs.length)return null;
pairs.sort((a,b)=>b.score-a.score);
let best=pairs[0];
if(best.score<3)return null;
for(const pair of pairs){
const drop=pair.y-best.y;
if(drop>0.03*headWidth&&drop<0.25*headWidth&&pair.score>best.score*0.45){
best=pair;
break;
}
}
return best;
}
function integral(values,width,height){
const sums=new Float64Array((width+1)*(height+1));
for(let y=0;y<height;y+=1){
let run=0;
for(let x=0;x<width;x+=1){
run+=values[y*width+x];
sums[(y+1)*(width+1)+(x+1)]=sums[y*(width+1)+(x+1)]+run;
}
}
return sums;
}
const patch=(sums,width,ax,ay,bx,by)=>(
sums[by*(width+1)+bx]-sums[ay*(width+1)+bx]
-sums[by*(width+1)+ax]+sums[ay*(width+1)+ax]
);
function pick(boxes,bw,bh){
const sorted=[...boxes].sort((a,b)=>b.score-a.score);
const kept=[];
for(const box of sorted){
if(kept.some((one)=>Math.abs(one.x-box.x)<bw&&Math.abs(one.y-box.y)<bh))continue;
kept.push(box);
if(kept.length===8)break;
}
return kept;
}
function pupil(dark,w,h,box,bw,bh,x0,y0){
let weight=0;
let sx=0;
let sy=0;
for(let y=box.y;y<Math.min(h,box.y+bh);y+=1){
for(let x=box.x;x<Math.min(w,box.x+bw);x+=1){
const value=dark[y*w+x];
weight+=value;
sx+=value*x;
sy+=value*y;
}
}
if(!weight)return{x:x0+box.x+bw/2,y:y0+box.y+bh/2};
return{x:x0+sx/weight,y:y0+sy/weight};
}
