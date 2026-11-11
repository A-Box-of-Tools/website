/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const WORD=/[\p{L}\p{N}_]/u;
export const FINDERS=[
{
id:'email',
pattern:/[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/gu,
},
{
id:'card',
pattern:/\b(?:\d[ -]?){12,18}\d\b/g,
confirm:(text)=>luhn(text.replace(/\D/g,'')),
},
{
id:'iban',
pattern:/\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){2,7}(?:[ ]?[A-Z0-9]{1,3})?\b/g,
confirm:(text)=>mod97(text.replace(/\s/g,'')),
},
{
id:'nationalid',
pattern:/\b(?:\d{3}-\d{2}-\d{4}|[A-CEGHJ-PR-TW-Z]{2}[ ]?(?:\d{2}[ ]?){3}[A-D])\b/g,
},
{
id:'phone',
pattern:/(?:\+\d{1,3}[ .-]?)?(?:\(\d{1,5}\)[ .-]?)?\d{2,5}(?:[ .-]\d{2,6}){1,4}/g,
confirm:(text)=>{
const digits=text.replace(/\D/g,'').length;
return digits>=7&&digits<=15;
},
},
];
export function findPattern(text,id){
const finder=FINDERS.find((item)=>item.id===id);
if(!finder)return[];
const found=[];
const pattern=new RegExp(finder.pattern.source,finder.pattern.flags);
for(const match of text.matchAll(pattern)){
const value=match[0];
if(finder.confirm&&!finder.confirm(value))continue;
const trimmed=value.replace(/[\s.,;:]+$/,'');
if(!trimmed)continue;
found.push({from:match.index,to:match.index+trimmed.length});
}
return found;
}
export function findTerm(text,term,{matchCase=false,wholeWord=false}={}){
const needle=term.trim();
if(!needle)return[];
const pattern=needle
.split(/\s+/)
.map((part)=>part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))
.join('\\s*');
const found=[];
const search=new RegExp(pattern,matchCase?'g':'gi');
for(const match of text.matchAll(search)){
const from=match.index;
const to=from+match[0].length;
if(!match[0])break;
if(wholeWord&&!standsAlone(text,from,to))continue;
found.push({from,to});
}
return found;
}
function standsAlone(text,from,to){
const before=text[from-1];
const after=text[to];
return!(before&&WORD.test(before))&&!(after&&WORD.test(after));
}
export function wordsOf(page){
const words=[];
for(const line of page.lines){
let start=-1;
for(let at=line.from;at<=line.to;at+=1){
const character=at<line.to?page.text[at]:' ';
if(/\s/.test(character)){
if(start>=0){
words.push({from:start,to:at,text:page.text.slice(start,at)});
start=-1;
}
}else if(start<0){
start=at;
}
}
}
return words;
}
export function glyphsIn(page,from,to){
const found=new Set();
for(let at=from;at<to&&at<page.owner.length;at+=1){
const index=page.owner[at];
if(index<0)continue;
found.add(index);
const group=page.glyphs[index]?.group;
if(group===null||group===undefined)continue;
for(const sibling of page.groups.get(group)??[])found.add(sibling);
}
return found;
}
export function contextOf(page,from,to){
const line=page.lines.find((item)=>from>=item.from&&from<=item.to)
??{from:Math.max(0,from-40),to:Math.min(page.text.length,to+40)};
return{
before:page.text.slice(line.from,from),
hit:page.text.slice(from,to),
after:page.text.slice(to,line.to),
};
}
export function mergeRanges(ranges){
const ordered=[...ranges].sort((a,b)=>a.from-b.from||a.to-b.to);
const out=[];
for(const range of ordered){
const last=out[out.length-1];
if(last&&range.from<=last.to)last.to=Math.max(last.to,range.to);
else out.push({...range});
}
return out;
}
export function luhn(digits){
if(digits.length<13||digits.length>19)return false;
let sum=0;
let double=false;
for(let at=digits.length-1;at>=0;at-=1){
let value=digits.charCodeAt(at)-48;
if(value<0||value>9)return false;
if(double){
value*=2;
if(value>9)value-=9;
}
sum+=value;
double=!double;
}
return sum%10===0;
}
export function mod97(account){
if(account.length<15||account.length>34)return false;
if(!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(account))return false;
const moved=account.slice(4)+account.slice(0,4);
let remainder=0;
for(const character of moved){
const value=/\d/.test(character)
?character
:String(character.charCodeAt(0)-55);
for(const digit of value){
remainder=(remainder*10+Number(digit))%97;
}
}
return remainder===1;
}
