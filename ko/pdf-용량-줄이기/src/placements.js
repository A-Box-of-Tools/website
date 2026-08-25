/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{decodeStream}from'./filters.js';
import{
indexOfAscii,Name,Parser,PdfStream,Ref,
}from'./objects.js';
const MAX_DEPTH=12;
export async function measurePlacements(doc){
const found=new Map();
const pages=collectPages(doc);
for(const[index,page]of pages.entries()){
const content=await contentBytes(doc,page);
if(!content)continue;
const resources=inheritedResources(doc,page);
try{
await walk(doc,content,resources,IDENTITY,found,index+1,0,new Set());
}catch{
}
}
return found;
}
const IDENTITY=[1,0,0,1,0,0];
function multiply(a,b){
return[
a[0]*b[0]+a[1]*b[2],
a[0]*b[1]+a[1]*b[3],
a[2]*b[0]+a[3]*b[2],
a[2]*b[1]+a[3]*b[3],
a[4]*b[0]+a[5]*b[2]+b[4],
a[4]*b[1]+a[5]*b[3]+b[5],
];
}
function collectPages(doc){
const pages=[];
const seen=new Set();
const walkTree=(node,depth)=>{
if(!(node instanceof Map)||depth>64||pages.length>5000)return;
const kids=doc.get(node,'Kids');
if(!Array.isArray(kids)){
pages.push(node);
return;
}
for(const kid of kids){
if(kid instanceof Ref){
if(seen.has(kid.key))continue;
seen.add(kid.key);
}
walkTree(doc.resolve(kid),depth+1);
}
};
walkTree(doc.get(doc.catalog,'Pages'),0);
return pages;
}
function inheritedResources(doc,page){
let node=page;
for(let depth=0;node instanceof Map&&depth<64;depth+=1){
const resources=doc.get(node,'Resources');
if(resources instanceof Map)return resources;
node=doc.get(node,'Parent');
}
return new Map();
}
async function contentBytes(doc,page){
const contents=doc.get(page,'Contents');
const streams=(Array.isArray(contents)?contents:[contents])
.map((entry)=>doc.resolve(entry))
.filter((entry)=>entry instanceof PdfStream);
if(!streams.length)return null;
const parts=[];
let total=0;
for(const stream of streams){
try{
const{bytes,remaining}=await decodeStream(stream,(v)=>doc.resolve(v));
if(remaining.length)continue;
parts.push(bytes);
total+=bytes.length+1;
}catch{
}
}
if(!parts.length)return null;
const joined=new Uint8Array(total);
let at=0;
for(const part of parts){
joined.set(part,at);
at+=part.length;
joined[at]=0x0a;
at+=1;
}
return joined;
}
async function walk(doc,bytes,resources,matrix,found,page,depth,active){
if(depth>MAX_DEPTH)return;
const xobjects=doc.get(resources,'XObject');
const parser=new Parser(bytes,0);
const stack=[];
let ctm=matrix;
let operands=[];
for(;;){
parser.skip();
if(parser.pos>=bytes.length)return;
const code=bytes[parser.pos];
const startsValue=code===0x2f||code===0x28||code===0x5b
||code===0x3c||code===0x2e||code===0x2b||code===0x2d
||(code>=0x30&&code<=0x39);
if(startsValue){
try{
operands.push(parser.parseValue());
}catch{
parser.pos+=1;
operands=[];
}
if(operands.length>32)operands=operands.slice(-8);
continue;
}
const operator=parser.peekKeyword();
if(!operator){parser.pos+=1;continue;}
parser.pos+=operator.length;
if(operator==='true'||operator==='false'||operator==='null'){
operands.push(operator==='true');
continue;
}
switch(operator){
case'q':
stack.push(ctm);
break;
case'Q':
ctm=stack.pop()??IDENTITY;
break;
case'cm':{
const six=operands.slice(-6);
if(six.length===6&&six.every((n)=>typeof n==='number')){
ctm=multiply(six,ctm);
}
break;
}
case'BI':
parser.pos=endOfInlineImage(bytes,parser.pos);
break;
case'Do':{
const named=operands[operands.length-1];
if(named instanceof Name&&xobjects instanceof Map){
await paint(doc,xobjects,named.value,ctm,found,page,depth,active);
}
break;
}
default:
break;
}
operands=[];
}
}
async function paint(doc,xobjects,key,ctm,found,page,depth,active){
const ref=xobjects.get(key);
const target=doc.resolve(ref);
if(!(target instanceof PdfStream))return;
const subtype=target.dict.get('Subtype');
const num=ref instanceof Ref?ref.num:-1;
if(subtype instanceof Name&&subtype.value==='Image'){
if(num<0)return;
const widthPt=Math.hypot(ctm[0],ctm[1]);
const heightPt=Math.hypot(ctm[2],ctm[3]);
const existing=found.get(num);
if(existing){
existing.widthPt=Math.max(existing.widthPt,widthPt);
existing.heightPt=Math.max(existing.heightPt,heightPt);
existing.uses+=1;
}else{
found.set(num,{widthPt,heightPt,uses:1,firstPage:page});
}
return;
}
if(subtype instanceof Name&&subtype.value==='Form'){
if(num>=0&&active.has(num))return;
if(num>=0)active.add(num);
try{
const{bytes,remaining}=await decodeStream(target,(v)=>doc.resolve(v));
if(remaining.length)return;
const own=doc.get(target.dict,'Matrix');
const inner=Array.isArray(own)&&own.length===6
?multiply(own.map((n)=>doc.resolve(n)),ctm)
:ctm;
const formResources=doc.get(target.dict,'Resources');
await walk(doc,bytes,formResources instanceof Map?formResources:new Map(),
inner,found,page,depth+1,active);
}catch{
}finally{
if(num>=0)active.delete(num);
}
}
}
function endOfInlineImage(bytes,from){
const id=indexOfAscii(bytes,'ID',from);
if(id<0)return bytes.length;
for(let at=id+3;at<bytes.length-1;at+=1){
if(bytes[at]!==0x45||bytes[at+1]!==0x49)continue;
const before=bytes[at-1];
const after=bytes[at+2]??0x20;
const spaced=before===0x20||before===0x0a||before===0x0d||before===0x09;
const ended=after===0x20||after===0x0a||after===0x0d||after===0x09
||after===0x2f||after===0x5b||after===0x51;
if(spaced&&ended)return at+2;
}
return bytes.length;
}
export function effectiveDpi(pixels,points){
if(!(points>0.01)||!(pixels>0))return 0;
return(pixels*72)/points;
}
