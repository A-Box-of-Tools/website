/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{formatNumber,formatString,formatValue}from'./content.js';
import{PdfString}from'./objects.js';
import{decodeText,encodeText}from'./strings.js';
import{cornersOf,endOf}from'./text.js';
export function planEdits(page,removing,{boxes=true,remove=null}={}){
const splices=new Map();
const byOperator=new Map();
for(const index of removing){
const glyph=page.glyphs[index];
if(!glyph)continue;
const key=`${glyph.sid} ${glyph.op}`;
if(!byOperator.has(key))byOperator.set(key,[]);
byOperator.get(key).push(glyph);
}
for(const glyphs of byOperator.values()){
const{sid,op}=glyphs[0];
const stream=page.streams.get(sid);
const operator=stream?.ops?.[op];
if(!operator)continue;
const text=rewrite(operator,glyphs);
if(text===null)continue;
if(!splices.has(sid))splices.set(sid,[]);
splices.get(sid).push({start:operator.start,end:operator.end,text});
}
if(remove)markedText(page,remove,splices);
const marks=boxes?blackBoxes(page,removing):[];
return{splices,overlay:overlayFor(page,marks),marks};
}
function markedText(page,remove,splices){
for(const mark of page.marked){
const stream=page.streams.get(mark.sid);
const operator=stream?.ops?.[mark.op];
if(!operator)continue;
let changed=false;
for(const key of['ActualText','Alt','E']){
const value=mark.dict.get(key);
if(!(value instanceof PdfString))continue;
const before=decodeText(value.bytes);
const after=remove(before);
if(after===before)continue;
mark.dict.set(key,new PdfString(encodeText(after)));
changed=true;
}
if(!changed)continue;
const tag=operator.args[operator.args.length-2];
if(!splices.has(mark.sid))splices.set(mark.sid,[]);
splices.get(mark.sid).push({
start:operator.start,
end:operator.end,
text:`${formatValue(tag)} ${formatValue(mark.dict)} BDC`,
});
}
}
function rewrite(operator,glyphs){
const removed=new Map();
for(const glyph of glyphs){
if(!removed.has(glyph.part))removed.set(glyph.part,[]);
removed.get(glyph.part).push(glyph);
}
const last=operator.args[operator.args.length-1];
if(operator.name==='Tj'||operator.name==="'"||operator.name==='"'){
if(!(last instanceof PdfString))return null;
const array=arrayFor(last.bytes,removed.get(-1)??[]);
if(operator.name==='Tj')return`${array} TJ`;
if(operator.name==="'")return`T* ${array} TJ`;
const spacing=operator.args.slice(-3,-1).map(Number);
if(spacing.length!==2||!spacing.every(Number.isFinite))return null;
return`${formatNumber(spacing[0])} Tw ${formatNumber(spacing[1])} Tc `
+`T* ${array} TJ`;
}
if(operator.name!=='TJ'||!Array.isArray(last))return null;
const parts=last.map((item,part)=>{
if(item instanceof PdfString){
return arrayFor(item.bytes,removed.get(part)??[],true);
}
return Number.isFinite(item)?formatNumber(item):'';
});
return`[${parts.filter(Boolean).join(' ')}] TJ`;
}
function arrayFor(bytes,glyphs,bare=false){
const cuts=[...glyphs].sort((a,b)=>a.at-b.at);
const pieces=[];
let at=0;
for(let index=0;index<cuts.length;){
let last=index;
while(last+1<cuts.length
&&cuts[last+1].at===cuts[last].at+cuts[last].size)last+=1;
const run=cuts.slice(index,last+1);
const from=run[0].at;
const to=run[run.length-1].at+run[run.length-1].size;
if(from>at)pieces.push(formatString(bytes.subarray(at,from)));
const kern=kernFor(run);
if(kern)pieces.push(kern);
at=to;
index=last+1;
}
if(at<bytes.length)pieces.push(formatString(bytes.subarray(at)));
const body=pieces.join(' ');
return bare?body:`[${body}]`;
}
function kernFor(run){
const size=run[0].fontSize;
if(!size)return'';
let advance=0;
for(const glyph of run){
advance+=(glyph.advanceWidth/1000)*glyph.fontSize
+glyph.charSpacing+glyph.wordSpacing;
}
const kern=(-advance*1000)/size;
return Math.abs(kern)<0.0005?'':formatNumber(round(kern));
}
function round(value){
return Math.round(value*1000)/1000;
}
function blackBoxes(page,removing){
const ordered=[...removing]
.map((index)=>page.glyphs[index])
.filter(Boolean)
.sort((a,b)=>a.order-b.order);
const runs=[];
let current=null;
for(const glyph of ordered){
if(current&&joins(current[current.length-1],glyph))current.push(glyph);
else{
current=[glyph];
runs.push(current);
}
}
return runs.map((run)=>{
const first=cornersOf(run[0]);
const last=cornersOf(run[run.length-1]);
return{
points:[first[0],last[1],last[2],first[3]],
invisible:run.every((glyph)=>glyph.invisible),
};
});
}
function joins(previous,glyph){
if(glyph.order!==previous.order+1)return false;
const size=Math.max(previous.height,1);
if(Math.abs(glyph.origin.y-previous.origin.y)>size*0.1)return false;
const end=endOf(previous);
return Math.hypot(glyph.origin.x-end.x,glyph.origin.y-end.y)<size;
}
function overlayFor(page,marks){
if(!marks.length)return'';
let out=`\n${'Q'.repeat(Math.max(0, page.unbalanced ?? 0))}\nq 0 g\n`;
for(const mark of marks){
const[a,b,c,d]=mark.points;
out+=`${point(a)} m ${point(b)} l ${point(c)} l ${point(d)} l h f\n`;
}
return`${out}Q\n`;
}
function point({x,y}){
return`${formatNumber(round(x))} ${formatNumber(round(y))}`;
}
