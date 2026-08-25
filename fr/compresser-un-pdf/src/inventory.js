/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{isName,PdfStream,Ref}from'./objects.js';
import{scanObjectHeaders}from'./reader.js';
import{reachable}from'./writer.js';
const GROUPS=[
{id:'images',label:'Images'},
{id:'fonts',label:'Embedded fonts'},
{id:'content',label:'Page content'},
{id:'metadata',label:'Metadata & private data'},
{id:'other',label:'Other streams'},
{id:'structure',label:'Structure & overhead'},
{id:'orphans',label:'Superseded & unreferenced'},
];
export function takeInventory(doc){
const roots=[doc.trailer.get('Root')];
if(doc.trailer.has('Info'))roots.push(doc.trailer.get('Info'));
const live=reachable(doc,roots);
const roles=assignRoles(doc);
const totals=new Map(GROUPS.map((group)=>[group.id,{bytes:0,count:0}]));
let streamBytes=0;
for(const[num,value]of doc.objects){
if(!(value instanceof PdfStream))continue;
const size=value.raw.length;
streamBytes+=size;
const role=roles.get(num)??'other';
const id=role==='structure'||live.has(num)?role:'orphans';
const bucket=totals.get(id)??totals.get('other');
bucket.bytes+=size;
bucket.count+=1;
}
const stale=supersededBytes(doc);
const orphans=totals.get('orphans');
orphans.bytes+=stale.bytes;
orphans.count+=stale.count;
totals.get('structure').bytes=Math.max(0,doc.bytes.length-streamBytes-stale.bytes);
totals.get('structure').count=doc.objects.size;
const groups=GROUPS
.map((group)=>({...group,...totals.get(group.id)}))
.filter((group)=>group.bytes>0);
return{
total:doc.bytes.length,
pages:doc.countPages(),
groups,
images:totals.get('images').bytes,
};
}
function supersededBytes(doc){
const live=new Map();
for(const[num,entry]of doc.entries){
if('offset'in entry)live.set(num,entry.offset);
}
const heads=scanObjectHeaders(doc.bytes).sort((a,b)=>a.offset-b.offset);
let bytes=0;
let count=0;
for(const[index,head]of heads.entries()){
if(live.get(head.num)===head.offset)continue;
const next=heads[index+1]?.offset??doc.bytes.length;
bytes+=Math.max(0,next-head.offset);
count+=1;
}
return{bytes,count};
}
function assignRoles(doc){
const roles=new Map();
const mark=(value,role)=>{
for(const ref of refsIn(value)){
if(!roles.has(ref.num))roles.set(ref.num,role);
}
};
for(const value of doc.objects.values()){
const dict=value instanceof PdfStream?value.dict:value;
if(!(dict instanceof Map))continue;
mark(dict.get('Contents'),'content');
mark(dict.get('FontFile'),'fonts');
mark(dict.get('FontFile2'),'fonts');
mark(dict.get('FontFile3'),'fonts');
mark(dict.get('Metadata'),'metadata');
mark(dict.get('PieceInfo'),'metadata');
mark(dict.get('Thumb'),'metadata');
}
for(const[num,value]of doc.objects){
if(!(value instanceof PdfStream))continue;
const subtype=doc.get(value.dict,'Subtype');
if(isName(subtype,'Image'))roles.set(num,'images');
else if(isName(subtype,'Form'))roles.set(num,'content');
else if(isName(doc.get(value.dict,'Type'),'Metadata'))roles.set(num,'metadata');
else if(isName(doc.get(value.dict,'Type'),'ObjStm'))roles.set(num,'structure');
else if(isName(doc.get(value.dict,'Type'),'XRef'))roles.set(num,'structure');
else if(!roles.has(num)&&looksLikeFont(doc,value))roles.set(num,'fonts');
}
return roles;
}
function looksLikeFont(doc,stream){
if(stream.dict.has('Length1'))return true;
const subtype=doc.get(stream.dict,'Subtype');
return isName(subtype,'Type1C')||isName(subtype,'CIDFontType0C')
||isName(subtype,'OpenType');
}
function refsIn(value){
if(value instanceof Ref)return[value];
if(Array.isArray(value))return value.filter((item)=>item instanceof Ref);
if(value instanceof Map)return[...value.values()].filter((item)=>item instanceof Ref);
return[];
}
export function verdict(inventory){
const share=inventory.total?inventory.images/inventory.total:0;
if(share>0.7){
return{
tone:'good',
text:`${Math.round(share * 100)}% of this file is images, which is what `
+'compresses. Expect a large saving.',
};
}
if(share>0.3){
return{
tone:'ok',
text:`About ${Math.round(share * 100)}% of this file is images. Recompressing `
+'them will help; the rest of the file sets the floor on how small it can get.',
};
}
if(inventory.images>0){
return{
tone:'thin',
text:`Only ${Math.round(share * 100)}% of this file is images, so there is not `
+'much for an image compressor to work on. Most of the saving here will come '
+'from repacking the document and dropping what is no longer referenced.',
};
}
return{
tone:'thin',
text:'There are no images in this file. It is text, vector drawing and fonts, '
+'all of which are already compressed, so expect single digits at best.',
};
}
