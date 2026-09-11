/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const MODES=['photo','colour','grey','mono'];
const TILES=16;
const PAPER_PERCENTILE=0.8;
const HOLE=0.6;
export function toLuma({data,width,height}){
const out=new Float32Array(width*height);
for(let i=0,p=0;p<out.length;i+=4,p+=1){
out[p]=0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];
}
return out;
}
export function paperGrid(luma,width,height){
const cell=Math.max(8,Math.round(Math.min(width,height)/TILES));
const cols=Math.max(1,Math.ceil(width/cell));
const rows=Math.max(1,Math.ceil(height/cell));
const grid=new Float32Array(cols*rows);
const bins=new Uint32Array(256);
for(let row=0;row<rows;row+=1){
for(let col=0;col<cols;col+=1){
bins.fill(0);
let counted=0;
const y1=Math.min(height,(row+1)*cell);
const x1=Math.min(width,(col+1)*cell);
for(let y=row*cell;y<y1;y+=1){
const at=y*width;
for(let x=col*cell;x<x1;x+=1){
bins[Math.max(0,Math.min(255,Math.round(luma[at+x])))]+=1;
counted+=1;
}
}
grid[row*cols+col]=counted?percentile(bins,counted,PAPER_PERCENTILE):255;
}
}
return{grid:smooth(fillHoles(grid,cols,rows),cols,rows),cols,rows,cell};
}
function percentile(bins,counted,fraction){
let seen=0;
const want=counted*fraction;
for(let value=0;value<256;value+=1){
seen+=bins[value];
if(seen>=want)return value;
}
return 255;
}
function fillHoles(grid,cols,rows){
const out=new Float32Array(grid);
const neighbours=[];
for(let row=0;row<rows;row+=1){
for(let col=0;col<cols;col+=1){
neighbours.length=0;
for(let dy=-1;dy<=1;dy+=1){
for(let dx=-1;dx<=1;dx+=1){
if(!dx&&!dy)continue;
const y=row+dy;
const x=col+dx;
if(y<0||x<0||y>=rows||x>=cols)continue;
neighbours.push(grid[y*cols+x]);
}
}
if(!neighbours.length)continue;
neighbours.sort((a,b)=>a-b);
const middle=neighbours[Math.floor(neighbours.length/2)];
const own=grid[row*cols+col];
if(own<middle*HOLE)out[row*cols+col]=middle;
}
}
return out;
}
function smooth(grid,cols,rows){
const out=new Float32Array(grid.length);
for(let row=0;row<rows;row+=1){
for(let col=0;col<cols;col+=1){
let total=0;
let taken=0;
for(let dy=-1;dy<=1;dy+=1){
for(let dx=-1;dx<=1;dx+=1){
const y=Math.min(rows-1,Math.max(0,row+dy));
const x=Math.min(cols-1,Math.max(0,col+dx));
total+=grid[y*cols+x];
taken+=1;
}
}
out[row*cols+col]=total/taken;
}
}
return out;
}
export function samplePaper({grid,cols,rows,cell},x,y){
const fx=Math.min(cols-1,Math.max(0,(x-cell/2)/cell));
const fy=Math.min(rows-1,Math.max(0,(y-cell/2)/cell));
const x0=Math.floor(fx);
const y0=Math.floor(fy);
const x1=Math.min(cols-1,x0+1);
const y1=Math.min(rows-1,y0+1);
const ax=fx-x0;
const ay=fy-y0;
const top=grid[y0*cols+x0]*(1-ax)+grid[y0*cols+x1]*ax;
const bottom=grid[y1*cols+x0]*(1-ax)+grid[y1*cols+x1]*ax;
return Math.max(1,top*(1-ay)+bottom*ay);
}
export function levels(strength,mode='grey'){
const amount=Math.min(100,Math.max(0,Number(strength)||0));
const floor=mode==='colour'?0.5:1;
return{black:amount*1.6*floor,white:255-amount*0.25};
}
function sauvolaSettings(width,height,strength){
const amount=Math.min(100,Math.max(0,Number(strength)||0));
return{
window:oddAtLeast(Math.round(Math.min(width,height)/24),15),
k:0.08+amount*0.0034,
};
}
const oddAtLeast=(value,floor)=>{
const size=Math.max(floor,value);
return size%2?size:size+1;
};
export function cleanPage(page,{mode='colour',strength=50}={}){
const{width,height}=page;
if(mode==='photo'){
return{data:page.data,width,height,mono:false,grey:false};
}
const luma=toLuma(page);
const paper=paperGrid(luma,width,height);
const flat=flatten(luma,paper,width,height);
if(mode==='mono'){
const settings=sauvolaSettings(width,height,strength);
const ink=sauvola(flat,width,height,settings);
const data=new Uint8ClampedArray(width*height*4);
for(let p=0,i=0;p<ink.length;p+=1,i+=4){
const value=ink[p]?0:255;
data[i]=value;
data[i+1]=value;
data[i+2]=value;
data[i+3]=255;
}
return{data,width,height,mono:true,grey:true};
}
const{black,white}=levels(strength,mode);
const data=new Uint8ClampedArray(width*height*4);
const span=Math.max(1,white-black);
for(let p=0,i=0;p<flat.length;p+=1,i+=4){
const value=((flat[p]-black)/span)*255;
if(mode==='grey'){
data[i]=value;
data[i+1]=value;
data[i+2]=value;
}else{
const before=Math.max(1,luma[p]);
const scale=value/before;
data[i]=page.data[i]*scale;
data[i+1]=page.data[i+1]*scale;
data[i+2]=page.data[i+2]*scale;
}
data[i+3]=255;
}
return{data,width,height,mono:false,grey:mode==='grey'};
}
function flatten(luma,paper,width,height){
const out=new Float32Array(luma.length);
for(let y=0,p=0;y<height;y+=1){
for(let x=0;x<width;x+=1,p+=1){
out[p]=Math.min(255,(luma[p]/samplePaper(paper,x,y))*255);
}
}
return out;
}
export function sauvola(luma,width,height,{window=25,k=0.25,range=128}={}){
const sums=new Float64Array((width+1)*(height+1));
const squares=new Float64Array((width+1)*(height+1));
for(let y=0;y<height;y+=1){
let rowSum=0;
let rowSquares=0;
for(let x=0;x<width;x+=1){
const value=luma[y*width+x];
rowSum+=value;
rowSquares+=value*value;
const at=(y+1)*(width+1)+(x+1);
sums[at]=sums[at-(width+1)]+rowSum;
squares[at]=squares[at-(width+1)]+rowSquares;
}
}
const half=Math.floor(window/2);
const ink=new Uint8Array(width*height);
for(let y=0;y<height;y+=1){
const top=Math.max(0,y-half);
const bottom=Math.min(height-1,y+half);
for(let x=0;x<width;x+=1){
const left=Math.max(0,x-half);
const right=Math.min(width-1,x+half);
const count=(right-left+1)*(bottom-top+1);
const total=box(sums,width,left,top,right,bottom);
const totalSquares=box(squares,width,left,top,right,bottom);
const mean=total/count;
const variance=Math.max(0,totalSquares/count-mean*mean);
const threshold=mean*(1+k*(Math.sqrt(variance)/range-1));
ink[y*width+x]=luma[y*width+x]<threshold?1:0;
}
}
return ink;
}
function box(table,width,left,top,right,bottom){
const stride=width+1;
return table[(bottom+1)*stride+(right+1)]
-table[top*stride+(right+1)]
-table[(bottom+1)*stride+left]
+table[top*stride+left];
}
