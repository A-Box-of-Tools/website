/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function parseRanges(text,total,t){
const trimmed=String(text??'').trim();
if(!trimmed)return{pages:[],error:''};
const wanted=new Set();
const bad=[];
for(const piece of trimmed.split(/[,;]+/)){
const part=piece.trim();
if(!part)continue;
const word=part.toLowerCase();
if(word==='all'){
for(let n=1;n<=total;n+=1)wanted.add(n);
continue;
}
if(word==='odd'||word==='even'){
const start=word==='odd'?1:2;
for(let n=start;n<=total;n+=2)wanted.add(n);
continue;
}
if(word==='last'){
if(total)wanted.add(total);
continue;
}
const range=/^(\d*)\s*(?:-|–|\.\.|to)\s*(\d*)$/.exec(part);
if(range&&(range[1]||range[2])){
const from=range[1]?Number(range[1]):1;
const to=range[2]?Number(range[2]):total;
if(from<1||to<1||from>total||to>total){
bad.push(part);
continue;
}
const[low,high]=from<=to?[from,to]:[to,from];
for(let n=low;n<=high;n+=1)wanted.add(n);
continue;
}
if(/^\d+$/.test(part)){
const n=Number(part);
if(n>=1&&n<=total)wanted.add(n);
else bad.push(part);
continue;
}
bad.push(part);
}
const pages=[...wanted].sort((a,b)=>a-b);
if(!bad.length)return{pages,error:''};
return{
pages,
error:t(bad.length===1?'range.bad.one':'range.bad.many',{
list:bad.join(', '),
total:t(total===1?'range.total.one':'range.total.many',{n:total}),
}),
};
}
export function describeRanges(pages,t){
if(!pages.length)return t('range.none');
const runs=[];
let start=pages[0];
let last=pages[0];
for(const page of pages.slice(1)){
if(page===last+1){
last=page;
continue;
}
runs.push([start,last]);
start=page;
last=page;
}
runs.push([start,last]);
return runs.map(([from,to])=>{
if(from===to)return String(from);
if(to===from+1)return t('range.pair',{from,to});
return t('range.run',{from,to});
}).join(', ');
}
export function splitInto(entries,{mode='single',size=1,at=[]}={}){
if(!entries.length)return[];
if(mode==='each')return entries.map((entry,index)=>group([entry],index+1));
if(mode==='every'){
const step=Math.max(1,Math.floor(size)||1);
const parts=[];
for(let start=0;start<entries.length;start+=step){
parts.push(group(entries.slice(start,start+step),start+1));
}
return parts;
}
if(mode==='at'){
const cuts=[...new Set(at.filter((n)=>n>1&&n<=entries.length))]
.sort((a,b)=>a-b);
const parts=[];
let start=0;
for(const cut of[...cuts,entries.length+1]){
const end=Math.min(cut-1,entries.length);
if(end>start)parts.push(group(entries.slice(start,end),start+1));
start=end;
}
return parts;
}
if(mode==='file'){
const bySource=new Map();
for(const entry of entries){
if(!bySource.has(entry.source))bySource.set(entry.source,[]);
bySource.get(entry.source).push(entry);
}
return[...bySource.values()].map((list)=>group(list,1));
}
return[group(entries,1)];
}
function group(list,from){
return{entries:list,from,to:from+list.length-1};
}
export function outputNames(parts,{stem,mode,suffix='edited'}){
const base=clean(stem)||'document';
const names=parts.map((part)=>{
if(parts.length===1)return`${base}-${suffix}.pdf`;
if(mode==='file')return`${clean(labelOf(part)) || base}.pdf`;
if(part.from===part.to)return`${base}-page-${part.from}.pdf`;
return`${base}-pages-${part.from}-${part.to}.pdf`;
});
return unique(names);
}
function unique(names){
const seen=new Map();
return names.map((name)=>{
const taken=seen.get(name)??0;
seen.set(name,taken+1);
if(!taken)return name;
return name.replace(/\.pdf$/i,`-${taken + 1}.pdf`);
});
}
function labelOf(part){
return part.entries[0]?.source?.label??'';
}
function clean(text){
return String(text??'').replace(/\.pdf$/i,'')
.replace(/[\\/:*?"<>|]+/g,'-')
.replace(/\s+/g,' ')
.trim()
.slice(0,80);
}
export function archiveName(stem){
return`${clean(stem) || 'document'}-split.zip`;
}
