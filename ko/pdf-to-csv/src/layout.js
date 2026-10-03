/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{endOf}from'./shared/pdf-text.js?v=d4c7e8c12a';
const CHUNK_GAP=0.9;
const SIZE_RANGE=[0.6,1.6];
const RIVER_WIDTH=9;
const RIVER_SIDE=3;
const RIVER_CROSSING=0.06;
const SAME_BASELINE=0.3;
const MAX_REGIONS_DEPTH=3;
export function pageRuns(page){
const byOrder=new Map();
for(const glyph of page.glyphs)byOrder.set(glyph.order,glyph);
const box=page.box;
const onPage=(y)=>!box||(y>=box.y-1&&y<=box.y+box.height+1);
const lines=[];
for(const{from,to}of page.lines){
const runs=[];
const heights=[];
let run=null;
let y=null;
for(let at=from;at<to;at+=1){
const character=page.text[at];
const glyph=byOrder.get(page.owner[at]);
if(!glyph||character===' '){
run=null;
continue;
}
if(y===null)y=glyph.origin.y;
heights.push(glyph.height);
if(!run){
run={text:'',x0:glyph.origin.x,x1:glyph.origin.x,y:glyph.origin.y};
runs.push(run);
}
run.text+=character;
run.x1=Math.max(run.x1,endOf(glyph).x);
}
if(runs.length&&onPage(y))lines.push({y,runs,height:median(heights)});
}
return lines;
}
export function median(values){
if(!values.length)return 0;
const sorted=[...values].sort((a,b)=>a-b);
return sorted[sorted.length>>1];
}
export function bodySized(lines,usual=median(lines.map((line)=>line.height))){
if(!usual)return lines;
return lines.filter((line)=>isBodySized(line,usual));
}
export function isBodySized(line,usual){
return line.height>=usual*SIZE_RANGE[0]&&line.height<=usual*SIZE_RANGE[1];
}
export function chunksOf(line){
const gap=Math.max(line.height,1)*CHUNK_GAP;
const chunks=[];
let chunk=null;
for(const run of[...line.runs].sort((a,b)=>a.x0-b.x0)){
if(chunk&&run.x0-chunk.x1<gap){
chunk.text+=` ${run.text}`;
chunk.x1=Math.max(chunk.x1,run.x1);
chunk.runs.push(run);
}else{
chunk={text:run.text,x0:run.x0,x1:run.x1,runs:[run]};
chunks.push(chunk);
}
}
return chunks;
}
export function splitRegions(lines,depth=0){
if(depth>=MAX_REGIONS_DEPTH||lines.length<RIVER_SIDE*2)return[lines];
const river=findRiver(lines);
if(!river)return[lines];
const middle=(river.from+river.to)/2;
const left=[];
const right=[];
for(const line of lines){
const west=line.runs.filter((run)=>(run.x0+run.x1)/2<middle);
const east=line.runs.filter((run)=>(run.x0+run.x1)/2>=middle);
if(west.length)left.push({...line,runs:west});
if(east.length)right.push({...line,runs:east});
}
return[...splitRegions(left,depth+1),...splitRegions(right,depth+1)];
}
function findRiver(lines){
let left=Infinity;
let right=-Infinity;
for(const line of lines){
for(const run of line.runs){
left=Math.min(left,run.x0);
right=Math.max(right,run.x1);
}
}
if(!Number.isFinite(left)||right-left<RIVER_WIDTH*3)return null;
const width=Math.ceil(right-left)+1;
const printed=new Int32Array(width);
for(const line of lines){
const seen=new Uint8Array(width);
for(const run of line.runs){
const from=Math.max(0,Math.floor(run.x0-left));
const to=Math.min(width-1,Math.ceil(run.x1-left));
for(let x=from;x<=to;x+=1)seen[x]=1;
}
for(let x=0;x<width;x+=1)printed[x]+=seen[x];
}
const allowed=Math.max(2,Math.floor(lines.length*RIVER_CROSSING));
const candidates=[];
let start=null;
for(let x=0;x<=width;x+=1){
const empty=x<width&&printed[x]<=allowed;
if(empty&&start===null)start=x;
if(!empty&&start!==null){
if(x-start>=RIVER_WIDTH&&start>0&&x<width){
candidates.push({from:left+start,to:left+x-1});
}
start=null;
}
}
let best=null;
for(const strip of candidates){
const tally=sides(lines,strip);
if(tally.west<RIVER_SIDE||tally.east<RIVER_SIDE)continue;
const width=strip.to-strip.from;
if(!best||tally.crossing<best.crossing
||(tally.crossing===best.crossing&&width>best.width)){
best={...strip,crossing:tally.crossing,width};
}
}
return best;
}
function sides(lines,strip){
let west=0;
let east=0;
let crossing=0;
for(const line of lines){
const w=line.runs.filter((run)=>run.x1<=strip.from+1);
const e=line.runs.filter((run)=>run.x0>=strip.to-1);
const over=line.runs.length-w.length-e.length;
if(over>0||(w.length&&e.length&&Math.abs(baseline(w)-baseline(e))<=SAME_BASELINE)){
crossing+=1;
}else{
if(w.length)west+=1;
if(e.length)east+=1;
}
}
return{west,east,crossing};
}
function baseline(runs){
return median(runs.map((run)=>run.y??0));
}
