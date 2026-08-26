/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{
clampPoint,isConvex,orderCorners,quadArea,sharpestCorner,wholeFrame,
}from'./geometry.js';
export const WORKING_EDGE=480;
const THETA_STEPS=180;
const RHO_STEP=2;
const SMEAR=5;
const SMEAR_WEIGHT=[1,0.83,0.67,0.5,0.33,0.2];
const PEAK_THETA=3;
const PEAK_RHO=4;
const MAX_PER_ANGLE=4;
const MAX_ANGLE_BANDS=6;
const ANGLE_BAND=10;
const BORDER_SUPPORT=0.3;
const MIN_SIDE_SUPPORT=0.25;
const ACCEPT_SCORE=0.42;
const CLEAR_STEP=0.5;
const DISAGREEMENT=0.45;
const MIN_AREA_SHARE=0.1;
const MIN_SEPARATION_SHARE=0.12;
const MAX_PAIRS=90;
const MAX_PAIRS_PER_ANGLE=16;
const PARALLEL_TOLERANCE=32;
const SQUARE_TOLERANCE=40;
const RADIANS=Math.PI/180;
export function findPageQuad(image){
const{width,height}=image;
const frame=wholeFrame(width,height);
if(width<24||height<24){
return{quad:frame,found:false,score:0,reason:'detect.tiny'};
}
const grey=blur(luma(image),width,height);
const edges=gradient(grey,width,height);
const bars=thresholds(edges.magnitude);
if(bars.strong<=0){
return{quad:frame,found:false,score:0,reason:'detect.flat'};
}
const lines=strongLines(edges,width,height,bars.vote);
const best=bestQuad(lines,edges,width,height,bars.support);
if(!best)return{quad:frame,found:false,score:0,reason:'detect.nothing'};
const quad=best.quad.map((point)=>clampPoint(point,width,height));
return{
quad,
found:best.score>=ACCEPT_SCORE,
score:best.score,
reason:best.score>=ACCEPT_SCORE?'detect.found':'detect.unsure',
};
}
function luma(image){
const{data,width,height}=image;
const out=new Float32Array(width*height);
for(let i=0,p=0;p<out.length;i+=4,p+=1){
out[p]=0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];
}
return out;
}
function blur(values,width,height){
const across=new Float32Array(values.length);
for(let y=0;y<height;y+=1){
const row=y*width;
for(let x=0;x<width;x+=1){
const left=values[row+Math.max(0,x-1)];
const right=values[row+Math.min(width-1,x+1)];
across[row+x]=(left+values[row+x]+right)/3;
}
}
const out=new Float32Array(values.length);
for(let y=0;y<height;y+=1){
const up=Math.max(0,y-1)*width;
const down=Math.min(height-1,y+1)*width;
const row=y*width;
for(let x=0;x<width;x+=1){
out[row+x]=(across[up+x]+across[row+x]+across[down+x])/3;
}
}
return out;
}
function gradient(grey,width,height){
const gx=new Float32Array(grey.length);
const gy=new Float32Array(grey.length);
const magnitude=new Float32Array(grey.length);
for(let y=1;y<height-1;y+=1){
for(let x=1;x<width-1;x+=1){
const at=y*width+x;
const up=at-width;
const down=at+width;
const dx=(grey[up+1]+2*grey[at+1]+grey[down+1])
-(grey[up-1]+2*grey[at-1]+grey[down-1]);
const dy=(grey[down-1]+2*grey[down]+grey[down+1])
-(grey[up-1]+2*grey[up]+grey[up+1]);
gx[at]=dx/4;
gy[at]=dy/4;
magnitude[at]=Math.hypot(gx[at],gy[at]);
}
}
return{gx,gy,magnitude};
}
function thresholds(magnitude){
let peak=0;
for(let i=0;i<magnitude.length;i+=1){
if(magnitude[i]>peak)peak=magnitude[i];
}
if(peak<=0)return{strong:0,vote:0,support:0};
const bins=new Uint32Array(256);
const scale=255/peak;
let counted=0;
for(let i=0;i<magnitude.length;i+=1){
if(magnitude[i]<=0)continue;
bins[Math.min(255,Math.round(magnitude[i]*scale))]+=1;
counted+=1;
}
let seen=0;
let bin=255;
for(let i=0;i<256;i+=1){
seen+=bins[i];
if(seen>=counted*0.99){
bin=i;
break;
}
}
const strong=(bin/scale)||peak;
return{
strong,
vote:Math.max(8,strong*0.35),
support:Math.max(5,strong*0.15),
};
}
function accumulate({gx,gy,magnitude},width,height,bar){
const diagonal=Math.hypot(width,height)/2;
const rhoBins=Math.ceil((2*diagonal)/RHO_STEP)+2;
const centre=rhoBins/2;
const votes=new Float32Array(THETA_STEPS*rhoBins);
const cos=new Float32Array(THETA_STEPS);
const sin=new Float32Array(THETA_STEPS);
for(let t=0;t<THETA_STEPS;t+=1){
cos[t]=Math.cos(t*RADIANS);
sin[t]=Math.sin(t*RADIANS);
}
const halfWidth=width/2;
const halfHeight=height/2;
for(let y=1;y<height-1;y+=1){
for(let x=1;x<width-1;x+=1){
const at=y*width+x;
const strength=magnitude[at];
if(strength<bar)continue;
let angle=Math.atan2(gy[at],gx[at])/RADIANS;
if(angle<0)angle+=180;
const middle=Math.round(angle)%THETA_STEPS;
const px=x-halfWidth;
const py=y-halfHeight;
for(let step=-SMEAR;step<=SMEAR;step+=1){
const t=(middle+step+THETA_STEPS)%THETA_STEPS;
const rho=px*cos[t]+py*sin[t];
const bin=Math.round(centre+rho/RHO_STEP);
if(bin<0||bin>=rhoBins)continue;
votes[t*rhoBins+bin]+=strength*SMEAR_WEIGHT[Math.abs(step)];
}
}
}
return{votes,rhoBins,centre,cos,sin};
}
function strongLines(edges,width,height,bar){
const{votes,rhoBins,centre}=accumulate(edges,width,height,bar);
const peaks=[];
for(let t=0;t<THETA_STEPS;t+=1){
for(let r=1;r<rhoBins-1;r+=1){
const value=votes[t*rhoBins+r];
if(value<=0)continue;
let top=true;
for(let dt=-PEAK_THETA;dt<=PEAK_THETA&&top;dt+=1){
const tt=((t+dt)%THETA_STEPS+THETA_STEPS)%THETA_STEPS;
for(let dr=-PEAK_RHO;dr<=PEAK_RHO;dr+=1){
const rr=r+dr;
if(rr<0||rr>=rhoBins)continue;
if(votes[tt*rhoBins+rr]>value){
top=false;
break;
}
}
}
if(!top)continue;
peaks.push({
theta:t*RADIANS,
rho:(r-centre)*RHO_STEP,
votes:value,
border:false,
});
}
}
peaks.sort((a,b)=>b.votes-a.votes);
const distinct=[];
for(const peak of peaks){
if(distinct.some((other)=>nearlyTheSameLine(peak,other,width,height)))continue;
distinct.push(peak);
}
const kept=shareOutByAngle(distinct);
const nominal=medianVotes(kept);
for(const border of[
{theta:0,rho:-width/2},
{theta:0,rho:width/2},
{theta:Math.PI/2,rho:-height/2},
{theta:Math.PI/2,rho:height/2},
]){
kept.push({...border,votes:nominal,border:true});
}
return kept;
}
function shareOutByAngle(lines){
const bands=new Map();
for(const line of lines){
const band=Math.round(line.theta/RADIANS/ANGLE_BAND)%(180/ANGLE_BAND);
if(!bands.has(band))bands.set(band,[]);
bands.get(band).push(line);
}
const strongest=[...bands.values()]
.sort((a,b)=>b[0].votes-a[0].votes)
.slice(0,MAX_ANGLE_BANDS);
const kept=[];
for(const band of strongest){
const chosen=new Set(band.slice(0,MAX_PER_ANGLE));
const worth=band.filter((line)=>line.votes>=band[0].votes*0.3);
if(worth.length){
chosen.add(worth.reduce((a,b)=>(b.rho<a.rho?b:a)));
chosen.add(worth.reduce((a,b)=>(b.rho>a.rho?b:a)));
}
kept.push(...chosen);
}
return kept;
}
function medianVotes(lines){
if(!lines.length)return 0;
const sorted=lines.map((line)=>line.votes).sort((a,b)=>a-b);
return sorted[Math.floor(sorted.length/2)];
}
function nearlyTheSameLine(a,b,width,height){
const{angle,gap}=relate(a,b);
return Math.abs(angle)<4&&Math.abs(gap)<Math.min(width,height)*0.04;
}
function relate(a,b){
let difference=(b.theta-a.theta)/RADIANS;
let rho=b.rho;
if(difference>90){
difference-=180;
rho=-rho;
}else if(difference<-90){
difference+=180;
rho=-rho;
}
return{angle:difference,gap:rho-a.rho};
}
function intersect(a,b,width,height){
const ca=Math.cos(a.theta);
const sa=Math.sin(a.theta);
const cb=Math.cos(b.theta);
const sb=Math.sin(b.theta);
const det=ca*sb-sa*cb;
if(Math.abs(det)<1e-6)return null;
return{
x:(a.rho*sb-b.rho*sa)/det+width/2,
y:(ca*b.rho-cb*a.rho)/det+height/2,
};
}
function oppositePairs(lines,width,height){
const apart=Math.min(width,height)*MIN_SEPARATION_SHARE;
const pairs=[];
for(let i=0;i<lines.length;i+=1){
for(let j=i+1;j<lines.length;j+=1){
const{angle,gap}=relate(lines[i],lines[j]);
if(Math.abs(angle)>PARALLEL_TOLERANCE)continue;
if(Math.abs(gap)<apart)continue;
let theta=lines[i].theta+(angle*RADIANS)/2;
if(theta<0)theta+=Math.PI;
if(theta>=Math.PI)theta-=Math.PI;
pairs.push({
lines:[lines[i],lines[j]],
theta,
votes:Math.min(lines[i].votes,lines[j].votes),
borders:(lines[i].border?1:0)+(lines[j].border?1:0),
});
}
}
const bands=new Map();
for(const pair of pairs){
const band=Math.round(pair.theta/RADIANS/ANGLE_BAND)%(180/ANGLE_BAND);
if(!bands.has(band))bands.set(band,[]);
bands.get(band).push(pair);
}
const shared=[];
for(const band of bands.values()){
band.sort((a,b)=>b.votes-a.votes);
shared.push(...band.slice(0,MAX_PAIRS_PER_ANGLE));
}
return shared.sort((a,b)=>b.votes-a.votes).slice(0,MAX_PAIRS);
}
function bestQuad(lines,edges,width,height,bar){
const pairs=oppositePairs(lines,width,height);
const area=width*height;
let best=null;
for(let i=0;i<pairs.length;i+=1){
for(let j=i+1;j<pairs.length;j+=1){
const across=pairs[i];
const down=pairs[j];
let between=Math.abs(across.theta-down.theta)/RADIANS;
if(between>90)between=180-between;
if(Math.abs(between-90)>SQUARE_TOLERANCE)continue;
if(across.borders+down.borders>=4)continue;
const corners=[];
let usable=true;
for(const a of across.lines){
for(const b of down.lines){
const point=intersect(a,b,width,height);
if(!point||point.x<-width*0.02||point.x>width*1.02
||point.y<-height*0.02||point.y>height*1.02){
usable=false;
}
if(!usable)break;
corners.push(point);
}
if(!usable)break;
}
if(!usable)continue;
const quad=orderCorners(corners);
if(!isConvex(quad))continue;
if(sharpestCorner(quad)<40)continue;
const share=quadArea(quad)/area;
if(share<MIN_AREA_SHARE)continue;
const score=scoreQuad(quad,[...across.lines,...down.lines],edges,width,height,bar,share);
if(score!==null&&(!best||score>best.score))best={quad,score};
}
}
return best;
}
function scoreQuad(quad,lines,edges,width,height,bar,share){
const sides=[];
for(let i=0;i<4;i+=1){
const line=sideLine(quad,i,lines,width,height);
sides.push(line?.border
?{support:BORDER_SUPPORT,polarity:0}
:sideEvidence(quad[i],quad[(i+1)%4],edges,width,height,bar));
}
const weakest=Math.min(...sides.map((side)=>side.support));
if(weakest<MIN_SIDE_SUPPORT)return null;
const mean=sides.reduce((sum,side)=>sum+side.support,0)/4;
const opinions=sides.map((side)=>side.polarity).filter((value)=>Math.abs(value)>CLEAR_STEP);
const agree=opinions.length>=2
&&(opinions.every((value)=>value>0)||opinions.every((value)=>value<0));
return mean*share**0.35*(agree?1:DISAGREEMENT);
}
function sideLine(quad,index,lines,width,height){
const a=quad[index];
const b=quad[(index+1)%4];
const offset=(point,line)=>Math.abs(
(point.x-width/2)*Math.cos(line.theta)
+(point.y-height/2)*Math.sin(line.theta)
-line.rho,
);
let best=null;
let closest=Infinity;
for(const line of lines){
const away=Math.max(offset(a,line),offset(b,line));
if(away<closest){
closest=away;
best=line;
}
}
return best;
}
function sideEvidence(a,b,{gx,gy,magnitude},width,height,bar){
const length=Math.hypot(b.x-a.x,b.y-a.y);
if(length<8)return{support:0,polarity:0};
const steps=Math.min(64,Math.max(16,Math.round(length/3)));
const nx=-(b.y-a.y)/length;
const ny=(b.x-a.x)/length;
let credit=0;
let taken=0;
let signed=0;
let total=0;
for(let i=0;i<steps;i+=1){
const along=0.06+(0.88*i)/(steps-1);
const x=a.x+(b.x-a.x)*along;
const y=a.y+(b.y-a.y)*along;
let best=0;
for(let off=-2;off<=2;off+=1){
const sx=Math.round(x+nx*off);
const sy=Math.round(y+ny*off);
if(sx<1||sy<1||sx>=width-1||sy>=height-1)continue;
const at=sy*width+sx;
if(magnitude[at]<bar)continue;
const across=gx[at]*nx+gy[at]*ny;
if(Math.abs(across)>Math.abs(best))best=across;
}
taken+=1;
credit+=Math.min(1,Math.abs(best)/(bar*2));
signed+=best;
total+=Math.abs(best);
}
return{
support:taken?credit/taken:0,
polarity:total>0?signed/total:0,
};
}
