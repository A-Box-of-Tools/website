/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{isName,PdfString,Ref}from'./shared/pdf-objects.js?v=9577a93b49';
const INHERITED=['Resources','MediaBox','CropBox','Rotate'];
const DEFAULT_BOX=[0,0,612,792];
export function readPages(doc){
const found=[];
const seen=new Set();
const walk=(node,ref,inherited,depth)=>{
if(!(node instanceof Map)||depth>64||found.length>20000)return;
const carried=new Map(inherited);
for(const key of INHERITED){
if(node.has(key))carried.set(key,node.get(key));
}
const kids=doc.resolve(node.get('Kids'));
if(!Array.isArray(kids)){
if(isName(node.get('Type'),'Pages'))return;
found.push(describe(doc,node,ref,carried));
return;
}
for(const kid of kids){
const key=kid instanceof Ref?kid.key:null;
if(key){
if(seen.has(key))continue;
seen.add(key);
}
walk(doc.resolve(kid),kid instanceof Ref?kid:null,carried,depth+1);
}
};
walk(doc.get(doc.catalog,'Pages'),null,new Map(),0);
return found;
}
function describe(doc,dict,ref,carried){
const inherited=new Map();
for(const key of INHERITED){
if(!dict.has(key)&&carried.has(key))inherited.set(key,carried.get(key));
}
const box=normalizeBox(doc.resolve(dict.get('MediaBox')??carried.get('MediaBox')));
const rotate=normalizeRotation(doc.resolve(dict.get('Rotate')??carried.get('Rotate')));
const turned=rotate===90||rotate===270;
return{
ref,
dict,
inherited,
box,
rotate,
width:turned?box[3]-box[1]:box[2]-box[0],
height:turned?box[2]-box[0]:box[3]-box[1],
};
}
export function normalizeBox(value){
if(!Array.isArray(value)||value.length<4)return[...DEFAULT_BOX];
const numbers=value.slice(0,4).map((n)=>(Number.isFinite(n)?n:0));
const box=[
Math.min(numbers[0],numbers[2]),Math.min(numbers[1],numbers[3]),
Math.max(numbers[0],numbers[2]),Math.max(numbers[1],numbers[3]),
];
if(box[2]-box[0]<1||box[3]-box[1]<1)return[...DEFAULT_BOX];
return box;
}
export function normalizeRotation(value){
if(!Number.isFinite(value))return 0;
const turns=Math.round(value/90)%4;
return((turns+4)%4)*90;
}
const NAMED=[
['A3',841.89,1190.55],
['A4',595.28,841.89],
['A5',419.53,595.28],
['A6',297.64,419.53],
['B5',498.90,708.66],
['Letter',612,792],
['Legal',612,1008],
['Tabloid',792,1224],
['Executive',522,756],
];
const TOLERANCE=3;
export function sizeLabel(width,height){
const portrait=width<=height;
const short=Math.min(width,height);
const long=Math.max(width,height);
for(const[label,w,h]of NAMED){
if(Math.abs(short-w)<=TOLERANCE&&Math.abs(long-h)<=TOLERANCE){
return`${label} ${portrait ? 'portrait' : 'landscape'}`;
}
}
const inches=[width/72,height/72];
if(inches.every((value)=>Math.abs(value-Math.round(value*2)/2)<0.02)){
return`${trim(inches[0])} × ${trim(inches[1])} in`;
}
return`${Math.round((width / 72) * 25.4)} × ${Math.round((height / 72) * 25.4)} mm`;
}
function trim(value){
return String(Math.round(value*2)/2);
}
export function decodeText(value){
const bytes=value?.bytes;
if(!bytes||!bytes.length)return'';
if(bytes[0]===0xfe&&bytes[1]===0xff){
let text='';
for(let i=2;i+1<bytes.length;i+=2){
text+=String.fromCharCode((bytes[i]<<8)|bytes[i+1]);
}
return text.replace(/\0/g,'').trim();
}
let text='';
for(const byte of bytes)text+=String.fromCharCode(byte);
return text.replace(/\0/g,'').trim();
}
export function documentTitle(doc){
const info=doc.info;
const title=info instanceof Map?doc.resolve(info.get('Title')):null;
const text=title instanceof PdfString?decodeText(title):'';
return text.length>0&&text.length<200?text:'';
}
