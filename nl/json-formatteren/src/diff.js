/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const MAX_STEPS=2000;
export function splitLines(text){
const normalised=text.replace(/\r\n?/g,'\n');
const lines=normalised.split('\n');
const trailing=lines.length>1&&lines[lines.length-1]==='';
if(trailing)lines.pop();
return{lines,trailing};
}
export function compareText(aText,bText,options={}){
const a=splitLines(aText);
const b=splitLines(bText);
const key=keyFor(options);
let aLines=a.lines;
let bLines=b.lines;
let aMap=aLines.map((_,index)=>index);
let bMap=bLines.map((_,index)=>index);
if(options.ignoreBlankLines){
aMap=aMap.filter((index)=>aLines[index].trim()!=='');
bMap=bMap.filter((index)=>bLines[index].trim()!=='');
aLines=aMap.map((index)=>a.lines[index]);
bLines=bMap.map((index)=>b.lines[index]);
}
const ops=diffSequences(aLines.map(key),bLines.map(key));
const out=[];
for(const op of ops){
if(op.type==='equal'){
for(let i=0;i<op.count;i+=1){
out.push({
type:'equal',
a:aMap[op.aStart+i],
b:bMap[op.bStart+i],
text:a.lines[aMap[op.aStart+i]],
});
}
continue;
}
if(op.type==='delete'){
for(let i=0;i<op.count;i+=1){
out.push({type:'delete',a:aMap[op.aStart+i],b:null,text:a.lines[aMap[op.aStart+i]]});
}
continue;
}
for(let i=0;i<op.count;i+=1){
out.push({type:'insert',a:null,b:bMap[op.bStart+i],text:b.lines[bMap[op.bStart+i]]});
}
}
const added=out.filter((op)=>op.type==='insert').length;
const removed=out.filter((op)=>op.type==='delete').length;
const same=out.filter((op)=>op.type==='equal').length;
return{
ops:out,
stats:{
added,
removed,
same,
aLines:a.lines.length,
bLines:b.lines.length,
identical:added===0&&removed===0&&aText===bText,
similarity:a.lines.length+b.lines.length===0
?1:(2*same)/(a.lines.length+b.lines.length),
trailingDiffers:a.trailing!==b.trailing,
},
};
}
function keyFor({ignoreWhitespace=false,ignoreCase=false}={}){
return(line)=>{
let value=line;
if(ignoreWhitespace)value=value.trim().replace(/\s+/g,' ');
if(ignoreCase)value=value.toLowerCase();
return value;
};
}
export function diffSequences(a,b){
let start=0;
while(start<a.length&&start<b.length&&a[start]===b[start])start+=1;
let endA=a.length;
let endB=b.length;
while(endA>start&&endB>start&&a[endA-1]===b[endB-1]){endA-=1;endB-=1;}
const middle=walk(a.slice(start,endA),b.slice(start,endB),start);
const ops=[];
if(start)ops.push({type:'equal',aStart:0,bStart:0,count:start});
ops.push(...middle);
if(endA<a.length){
ops.push({type:'equal',aStart:endA,bStart:endB,count:a.length-endA});
}
return merge(ops);
}
function walk(a,b,offset){
if(!a.length&&!b.length)return[];
if(!a.length)return[{type:'insert',aStart:offset,bStart:offset,count:b.length}];
if(!b.length)return[{type:'delete',aStart:offset,bStart:offset,count:a.length}];
const n=a.length;
const m=b.length;
const max=Math.min(MAX_STEPS,n+m);
if(n+m-2*commonCount(a,b)>max)return rewrite(n,m,offset);
const size=2*max+1;
const v=new Int32Array(size);
const trace=[];
for(let d=0;d<=max;d+=1){
trace.push(v.slice());
for(let k=-d;k<=d;k+=2){
const index=k+max;
let x;
if(k===-d||(k!==d&&v[index-1]<v[index+1]))x=v[index+1];
else x=v[index-1]+1;
let y=x-k;
while(x<n&&y<m&&a[x]===b[y]){x+=1;y+=1;}
v[index]=x;
if(x>=n&&y>=m)return backtrack(trace,a,b,d,max,offset);
}
}
return rewrite(n,m,offset);
}
function rewrite(n,m,offset){
const ops=[];
if(n)ops.push({type:'delete',aStart:offset,bStart:offset,count:n});
if(m)ops.push({type:'insert',aStart:offset+n,bStart:offset,count:m});
return ops;
}
function commonCount(a,b){
const counts=new Map();
for(const value of a)counts.set(value,(counts.get(value)??0)+1);
let common=0;
for(const value of b){
const left=counts.get(value);
if(left){
counts.set(value,left-1);
common+=1;
}
}
return common;
}
function backtrack(trace,a,b,d,max,offset){
const ops=[];
let x=a.length;
let y=b.length;
for(let step=d;step>0;step-=1){
const v=trace[step];
const k=x-y;
const index=k+max;
const down=k===-step||(k!==step&&v[index-1]<v[index+1]);
const prevK=down?k+1:k-1;
const prevX=v[prevK+max];
const prevY=prevX-prevK;
while(x>prevX&&y>prevY){
x-=1;
y-=1;
ops.push({type:'equal',aStart:offset+x,bStart:offset+y,count:1});
}
if(down){
y-=1;
ops.push({type:'insert',aStart:offset+x,bStart:offset+y,count:1});
}else{
x-=1;
ops.push({type:'delete',aStart:offset+x,bStart:offset+y,count:1});
}
}
while(x>0&&y>0){
x-=1;
y-=1;
ops.push({type:'equal',aStart:offset+x,bStart:offset+y,count:1});
}
return ops.reverse();
}
function merge(ops){
const out=[];
for(const op of ops){
if(op.count===0)continue;
const last=out[out.length-1];
if(last&&last.type===op.type
&&last.aStart+(last.type==='insert'?0:last.count)===op.aStart
&&last.bStart+(last.type==='delete'?0:last.count)===op.bStart){
last.count+=op.count;
continue;
}
out.push({...op});
}
return out;
}
export function alignRows(ops){
const rows=[];
let index=0;
while(index<ops.length){
const op=ops[index];
if(op.type==='equal'){
rows.push({type:'equal',a:op,b:op});
index+=1;
continue;
}
const deletes=[];
const inserts=[];
while(index<ops.length&&ops[index].type==='delete'){deletes.push(ops[index]);index+=1;}
while(index<ops.length&&ops[index].type==='insert'){inserts.push(ops[index]);index+=1;}
const pairs=Math.max(deletes.length,inserts.length);
for(let i=0;i<pairs;i+=1){
const left=deletes[i]??null;
const right=inserts[i]??null;
if(left&&right)rows.push({type:'change',a:left,b:right});
else if(left)rows.push({type:'delete',a:left,b:null});
else rows.push({type:'insert',a:null,b:right});
}
}
return rows;
}
export function splitWords(line){
return line.match(/[A-Za-z0-9_]+|\s+|[^A-Za-z0-9_\s]/g)??[];
}
export function diffWords(aLine,bLine){
const a=splitWords(aLine);
const b=splitWords(bLine);
const ops=diffSequences(a,b);
const left=[];
const right=[];
const push=(list,same,text)=>{
if(text==='')return;
const last=list[list.length-1];
if(last&&last.same===same){last.text+=text;return;}
list.push({same,text});
};
for(const op of ops){
if(op.type==='equal'){
const text=a.slice(op.aStart,op.aStart+op.count).join('');
push(left,true,text);
push(right,true,text);
continue;
}
if(op.type==='delete'){
push(left,false,a.slice(op.aStart,op.aStart+op.count).join(''));
continue;
}
push(right,false,b.slice(op.bStart,op.bStart+op.count).join(''));
}
return{a:left,b:right};
}
export function unifiedHunks(ops,{context=3}={}){
const changed=ops.map((op)=>op.type!=='equal');
const keep=new Array(ops.length).fill(false);
changed.forEach((isChanged,index)=>{
if(!isChanged)return;
for(let i=Math.max(0,index-context);i<=Math.min(ops.length-1,index+context);i+=1){
keep[i]=true;
}
});
const hunks=[];
let current=null;
let aNext=0;
let bNext=0;
ops.forEach((op,index)=>{
const aHere=op.a??aNext;
const bHere=op.b??bNext;
if(op.type!=='insert')aNext=aHere+1;
if(op.type!=='delete')bNext=bHere+1;
if(!keep[index]){current=null;return;}
if(!current){
current={aStart:aHere+1,bStart:bHere+1,aCount:0,bCount:0,lines:[]};
hunks.push(current);
}
if(op.type!=='insert')current.aCount+=1;
if(op.type!=='delete')current.bCount+=1;
current.lines.push({
sign:op.type==='equal'?' ':op.type==='delete'?'-':'+',
text:op.text,
});
});
return hunks;
}
export function formatUnified(ops,{context=3,aLabel='a',bLabel='b'}={}){
const hunks=unifiedHunks(ops,{context});
if(!hunks.length)return'';
const out=[`--- ${aLabel}`,`+++ ${bLabel}`];
for(const hunk of hunks){
out.push(`@@ -${hunk.aStart},${hunk.aCount} +${hunk.bStart},${hunk.bCount} @@`);
for(const line of hunk.lines)out.push(`${line.sign}${line.text}`);
}
return`${out.join('\n')}\n`;
}
