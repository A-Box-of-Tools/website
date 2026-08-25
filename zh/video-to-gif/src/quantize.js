/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const HIST_BITS=5;
const HIST_SIZE=1<<(HIST_BITS*3);
const CACHE_BITS=6;
const CACHE_SIZE=1<<(CACHE_BITS*3);
const BAYER=[
[0,32,8,40,2,34,10,42],
[48,16,56,24,50,18,58,26],
[12,44,4,36,14,46,6,38],
[60,28,52,20,62,30,54,22],
[3,35,11,43,1,33,9,41],
[51,19,59,27,49,17,57,25],
[15,47,7,39,13,45,5,37],
[63,31,55,23,61,29,53,21],
];
const DITHER=new Float32Array(64);
for(let y=0;y<8;y+=1){
for(let x=0;x<8;x+=1)DITHER[y*8+x]=BAYER[y][x]/64-0.5+1/128;
}
const MIN_AMPLITUDE=6;
const MAX_AMPLITUDE=40;
export class ColorHistogram{
counts=new Uint32Array(HIST_SIZE);
sums=new Float64Array(HIST_SIZE*3);
pixels=0;
add(rgba,step=1){
const stride=Math.max(1,Math.floor(step))*4;
for(let at=0;at<rgba.length;at+=stride){
const r=rgba[at];
const g=rgba[at+1];
const b=rgba[at+2];
const bin=((r>>3)<<10)|((g>>3)<<5)|(b>>3);
this.counts[bin]+=1;
this.sums[bin*3]+=r;
this.sums[bin*3+1]+=g;
this.sums[bin*3+2]+=b;
this.pixels+=1;
}
}
}
function occupied(histogram){
const bins=[];
for(let bin=0;bin<HIST_SIZE;bin+=1){
if(histogram.counts[bin])bins.push(bin);
}
return Int32Array.from(bins);
}
const channelOf=(bin,channel)=>(bin>>(10-channel*5))&31;
function averageColor(histogram,bins,from,to){
let count=0;
let r=0;
let g=0;
let b=0;
for(let i=from;i<to;i+=1){
const bin=bins[i];
count+=histogram.counts[bin];
r+=histogram.sums[bin*3];
g+=histogram.sums[bin*3+1];
b+=histogram.sums[bin*3+2];
}
if(!count)return[0,0,0];
return[
Math.min(255,Math.round(r/count)),
Math.min(255,Math.round(g/count)),
Math.min(255,Math.round(b/count)),
];
}
function measure(histogram,bins,from,to){
let count=0;
const low=[31,31,31];
const high=[0,0,0];
for(let i=from;i<to;i+=1){
const bin=bins[i];
count+=histogram.counts[bin];
for(let channel=0;channel<3;channel+=1){
const value=channelOf(bin,channel);
if(value<low[channel])low[channel]=value;
if(value>high[channel])high[channel]=value;
}
}
let longest=0;
let extent=high[0]-low[0];
for(let channel=1;channel<3;channel+=1){
if(high[channel]-low[channel]>extent){
extent=high[channel]-low[channel];
longest=channel;
}
}
return{from,to,count,longest,extent};
}
export function medianCut(histogram,maxColors){
const bins=occupied(histogram);
if(!bins.length)return new Uint8Array([0,0,0]);
const sortable=Array.from(bins);
let boxes=[measure(histogram,sortable,0,sortable.length)];
while(boxes.length<maxColors){
let best=-1;
let bestScore=0;
for(let i=0;i<boxes.length;i+=1){
const box=boxes[i];
if(box.to-box.from<2||box.extent===0)continue;
const score=box.count*(box.extent+1);
if(score>bestScore){
bestScore=score;
best=i;
}
}
if(best<0)break;
const box=boxes[best];
const slice=sortable.slice(box.from,box.to)
.sort((a,b)=>channelOf(a,box.longest)-channelOf(b,box.longest));
for(let i=0;i<slice.length;i+=1)sortable[box.from+i]=slice[i];
const half=box.count/2;
let running=0;
let cut=box.from;
while(cut<box.to-1){
running+=histogram.counts[sortable[cut]];
cut+=1;
if(running>=half)break;
}
boxes.splice(best,1,
measure(histogram,sortable,box.from,cut),
measure(histogram,sortable,cut,box.to));
}
const palette=new Uint8Array(boxes.length*3);
boxes.forEach((box,i)=>{
const[r,g,b]=averageColor(histogram,sortable,box.from,box.to);
palette[i*3]=r;
palette[i*3+1]=g;
palette[i*3+2]=b;
});
return palette;
}
export function amplitudeFor(palette){
const colors=palette.length/3;
if(colors<2)return 0;
const distances=[];
for(let i=0;i<colors;i+=1){
let nearest=Infinity;
for(let j=0;j<colors;j+=1){
if(i===j)continue;
const dr=palette[i*3]-palette[j*3];
const dg=palette[i*3+1]-palette[j*3+1];
const db=palette[i*3+2]-palette[j*3+2];
const distance=dr*dr+dg*dg+db*db;
if(distance<nearest)nearest=distance;
}
distances.push(Math.sqrt(nearest));
}
distances.sort((a,b)=>a-b);
const median=distances[distances.length>>1];
return Math.min(MAX_AMPLITUDE,Math.max(MIN_AMPLITUDE,median));
}
export class Palette{
#cache=new Int16Array(CACHE_SIZE).fill(-1);
constructor(rgb){
this.rgb=rgb;
this.size=rgb.length/3;
}
indexOf(r,g,b){
const key=((r>>2)<<(CACHE_BITS*2))|((g>>2)<<CACHE_BITS)|(b>>2);
const cached=this.#cache[key];
if(cached>=0)return cached;
const cr=((key>>(CACHE_BITS*2))<<2)|2;
const cg=(((key>>CACHE_BITS)&63)<<2)|2;
const cb=((key&63)<<2)|2;
let best=0;
let bestDistance=Infinity;
for(let i=0;i<this.size;i+=1){
const dr=cr-this.rgb[i*3];
const dg=cg-this.rgb[i*3+1];
const db=cb-this.rgb[i*3+2];
const distance=dr*dr+dg*dg+db*db;
if(distance<bestDistance){
bestDistance=distance;
best=i;
}
}
this.#cache[key]=best;
return best;
}
}
export function quantizeFrame(rgba,width,height,palette,amplitude=0,into=null){
const out=into??new Uint8Array(width*height);
if(!amplitude){
for(let i=0,at=0;i<out.length;i+=1,at+=4){
out[i]=palette.indexOf(rgba[at],rgba[at+1],rgba[at+2]);
}
return out;
}
for(let y=0;y<height;y+=1){
const row=y*width;
const dithers=(y&7)*8;
for(let x=0;x<width;x+=1){
const at=(row+x)*4;
const offset=DITHER[dithers+(x&7)]*amplitude;
const r=Math.max(0,Math.min(255,rgba[at]+offset));
const g=Math.max(0,Math.min(255,rgba[at+1]+offset));
const b=Math.max(0,Math.min(255,rgba[at+2]+offset));
out[row+x]=palette.indexOf(r,g,b);
}
}
return out;
}
