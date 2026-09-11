/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{chunksOf,isBodySized,median,splitRegions}from'./layout.js?v=d4c7e8c12a';
const ALIGN=4;
const BLOCK_GAP=2.8;
const RHYTHM_BREAK=1.5;
const SPINE_LINES=3;
const ADJACENT=1.6;
const LINE_MATCH=0.5;
const TABLE_MATCH=0.75;
const SPLIT_GAP=0.5;
const ANCHOR_SHARE=0.3;
const HEADING=1.25;
export function findTables(pages){
const blocks=[];
for(const page of pages){
for(const region of splitRegions(page.lines)){
const usual=median(region.map((line)=>line.height));
for(const block of blocksOf(region,usual)){
blocks.push({page:page.number,...block});
}
}
}
const tables=[];
for(const block of blocks){
const last=tables[tables.length-1];
if(last&&sameGrid(last.columns,block.columns)){
last.blocks.push(block);
last.columns=columnsOf(last.blocks.flatMap((b)=>b.lines));
}else{
tables.push({page:block.page,blocks:[block],columns:block.columns});
}
}
return tables;
}
function blocksOf(lines,usual){
const out=[];
let block=null;
let pending=[];
const close=()=>{
if(block&&block.gridLines>=2){
const columns=columnsOf(block.lines);
if(columns.length>=2){
out.push({lines:trimTail(block.lines,columns),columns});
}
}
block=null;
};
for(const line of lines){
const chunks=chunksOf(line);
const grid=chunks.length>=2;
const heading=!isBodySized(line,usual)
||(!grid&&line.height>=usual*HEADING);
if(heading){
close();
pending=[];
continue;
}
if(block&&breaksRhythm(block.lines,line))close();
if(block&&grid&&block.gridLines>=2&&!fits(chunks,block.edges))close();
if(!block){
if(!grid){
pending=[...pending,line].slice(-2);
continue;
}
block={lines:[],edges:[],gridLines:0};
for(const held of pending){
if(gapBetween(held,line)<=ADJACENT*2&&sitsOver(held,chunks))block.lines.push(held);
}
pending=[];
}
block.lines.push(line);
if(grid){
block.gridLines+=1;
block.edges.push(...chunks);
}
}
close();
return out;
}
function gapBetween(upper,lower){
return(upper.y-lower.y)/Math.max(upper.height,lower.height,1);
}
function breaksRhythm(lines,line){
const last=lines[lines.length-1];
if(gapBetween(last,line)>BLOCK_GAP)return true;
if(lines.length<3)return false;
const steps=[];
for(let at=1;at<lines.length;at+=1)steps.push(lines[at-1].y-lines[at].y);
return last.y-line.y>median(steps)*RHYTHM_BREAK;
}
function fits(chunks,edges){
if(!edges.length)return true;
const landed=chunks.filter((chunk)=>edges.some((edge)=>aligned(chunk,edge))).length;
return landed>=Math.ceil(chunks.length*LINE_MATCH);
}
function aligned(a,b){
return Math.abs(a.x0-b.x0)<=ALIGN||Math.abs(a.x1-b.x1)<=ALIGN;
}
function sitsOver(line,chunks){
const starts=new Set();
for(const run of line.runs){
const under=chunks.findIndex((chunk)=>Math.abs(chunk.x0-run.x0)<=ALIGN);
if(under>=0)starts.add(under);
}
return starts.size>=2;
}
function trimTail(lines,columns){
const kept=[...lines];
while(kept.length>1){
const last=kept[kept.length-1];
if(chunksOf(last).length>=2)break;
const above=kept[kept.length-2];
const inside=overlapping(last,columns).length===1;
if(inside&&gapBetween(above,last)<=ADJACENT)break;
kept.pop();
}
return kept;
}
export function columnsOf(lines){
const grid=lines.map(chunksOf).filter((chunks)=>chunks.length>=2);
if(!grid.length)return[];
const fullest=Math.max(...grid.map((chunks)=>chunks.length));
const small=grid.length<=SPINE_LINES;
const edges={left:[],right:[]};
grid.forEach((chunks,line)=>{
const weight=chunks.length-1;
const spine=small&&chunks.length===fullest;
for(const chunk of chunks){
edges.left.push({x:chunk.x0,line,weight,spine,chunk});
edges.right.push({x:chunk.x1,line,weight,spine,chunk});
}
});
const clusters=[...cluster(edges.left),...cluster(edges.right)].map((members)=>{
const votes=new Map();
for(const edge of members)votes.set(edge.line,Math.max(votes.get(edge.line)??0,edge.weight));
return{
lines:votes.size,
score:[...votes.values()].reduce((sum,vote)=>sum+vote,0),
spine:members.some((edge)=>edge.spine),
x0:upperMiddle(members.map((edge)=>edge.chunk.x0)),
x1:lowerMiddle(members.map((edge)=>edge.chunk.x1)),
};
});
const best=Math.max(...clusters.map((c)=>c.score));
const kept=clusters
.filter((c)=>c.spine||(c.lines>=2&&c.score>=best*ANCHOR_SHARE))
.sort((a,b)=>b.score-a.score||Number(b.spine)-Number(a.spine));
const columns=[];
for(const candidate of kept){
const touching=columns.filter((column)=>overlaps(candidate,column));
if(touching.length===0)columns.push({x0:candidate.x0,x1:candidate.x1});
else if(touching.length===1){
touching[0].x0=Math.min(touching[0].x0,candidate.x0);
touching[0].x1=Math.max(touching[0].x1,candidate.x1);
}
}
return columns.sort((a,b)=>a.x0-b.x0);
}
function upperMiddle(values){
const sorted=[...values].sort((a,b)=>a-b);
return sorted[sorted.length>>1];
}
function lowerMiddle(values){
const sorted=[...values].sort((a,b)=>a-b);
return sorted[(sorted.length-1)>>1];
}
function cluster(edges){
const sorted=[...edges].sort((a,b)=>a.x-b.x);
const groups=[];
let group=null;
for(const edge of sorted){
if(group&&edge.x-group[group.length-1].x<=ALIGN&&edge.x-group[0].x<=ALIGN*2){
group.push(edge);
}else{
group=[edge];
groups.push(group);
}
}
return groups;
}
function overlaps(a,b){
return Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)>0.5;
}
function overlapping(item,columns){
const x0=item.x0??Math.min(...item.runs.map((run)=>run.x0));
const x1=item.x1??Math.max(...item.runs.map((run)=>run.x1));
const out=[];
columns.forEach((column,index)=>{
if(overlaps({x0,x1},column))out.push(index);
});
return out;
}
function leftward(item,columns){
let found=0;
columns.forEach((column,index)=>{
if(column.x0<=item.x0+ALIGN)found=index;
});
return found;
}
function sameGrid(a,b){
const[small,large]=a.length<=b.length?[a,b]:[b,a];
let from=0;
let matched=0;
for(const column of small){
for(let at=from;at<large.length;at+=1){
if(aligned(column,large[at])){
matched+=1;
from=at+1;
break;
}
}
}
return matched>=Math.ceil(small.length*TABLE_MATCH);
}
export function cellsOf(line,columns){
const cells=columns.map(()=>[]);
if(!columns.length)return[];
for(const chunk of chunksOf(line)){
const hits=chunk.runs.map((run)=>overlapping(run,columns));
if(hits.some((touched)=>touched.length>1)){
cells[overlapping(chunk,columns)[0]].push(chunk.text);
continue;
}
const anchors=new Set(hits.filter((touched)=>touched.length).map((touched)=>touched[0]));
if(anchors.size<=1){
const into=anchors.size?[...anchors][0]:leftward(chunk,columns);
cells[into].push(chunk.text);
continue;
}
const gap=Math.max(line.height,1)*SPLIT_GAP;
const pieces=[];
let piece=null;
chunk.runs.forEach((run,index)=>{
const column=hits[index][0]??null;
const apart=index>0&&run.x0-chunk.runs[index-1].x1>gap;
if(piece&&column!==null&&piece.column!==null&&column!==piece.column&&apart){
piece=null;
}
if(!piece){
piece={column,words:[]};
pieces.push(piece);
}
if(piece.column===null)piece.column=column;
piece.words.push(run.text);
});
for(const{column,words}of pieces){
cells[column??leftward(chunk,columns)].push(words.join(' '));
}
}
return cells.map((parts)=>parts.join(' ').trim());
}
