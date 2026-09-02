/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{applySplices,encode}from'./content.js';
import{planEdits}from'./edit.js';
import{PdfStream,Ref}from'./shared/pdf-objects.js';
import{removeCarriedFiles,scrubStrings}from'./strings.js';
import{stripMetadata,writeDocument}from'./shared/pdf-writer.js';
export async function redact(doc,pages,chosen,options={},hooks={}){
const{
boxes=true,elsewhere=true,attachments=true,texts=[],
}=options;
const report={
pages:[],
shared:0,
overImage:0,
strings:{changed:0,where:[]},
attachments:0,
actions:0,
metadata:0,
};
const scrub=texts.length?remover(texts):null;
const jobs=new Map();
pages.forEach((page,index)=>{
const removing=chosen.get(index);
if(!removing||!removing.size)return;
const plan=planEdits(page,removing,{boxes,remove:scrub});
const behind=[...removing].filter((glyph)=>hidesBehindPicture(page,glyph));
for(const[sid,splices]of plan.splices){
const stream=page.streams.get(sid);
if(!stream)continue;
const key=sid==='page'?`page:${index}`:sid;
if(!jobs.has(key)){
jobs.set(key,{page,stream,splices:[],overlay:'',pages:0});
}
const job=jobs.get(key);
job.splices.push(...splices);
job.pages+=1;
}
if(plan.overlay&&page.streams.has('page')){
const key=`page:${index}`;
if(!jobs.has(key)){
jobs.set(key,{
page,stream:page.streams.get('page'),splices:[],overlay:'',pages:1,
});
}
jobs.get(key).overlay=plan.overlay;
}
report.overImage+=behind.length;
report.pages.push({
number:page.number,
removed:removing.size,
boxes:plan.marks.length,
overImage:behind.length,
});
});
for(const[key,job]of jobs){
const bytes=applySplices(job.stream.bytes,job.splices);
if(key.startsWith('page:'))writePageContent(doc,job.page,bytes,job.overlay);
else writeStream(job.stream.stream,bytes);
if(job.pages>1)report.shared+=1;
}
hooks.onProgress?.('edited');
if(scrub&&elsewhere)report.strings=scrubStrings(doc,scrub);
if(attachments){
const carried=removeCarriedFiles(doc);
report.attachments=carried.attachments;
report.actions=carried.actions;
}
report.metadata=stripMetadata(doc);
hooks.onProgress?.('writing');
const blob=await writeDocument(doc,{signal:hooks.signal});
return{bytes:new Uint8Array(await blob.arrayBuffer()),report};
}
export function remover(texts){
const ordered=[...new Set(texts.filter(Boolean))]
.sort((a,b)=>b.length-a.length);
return(text)=>{
let out=text;
for(const term of ordered){
if(!term.trim())continue;
out=out.split(term).join('');
}
return out;
};
}
function writePageContent(doc,page,bytes,overlay){
const tail=overlay?encode(overlay):new Uint8Array(0);
const joined=new Uint8Array(bytes.length+tail.length);
joined.set(bytes,0);
joined.set(tail,bytes.length);
const stream=new PdfStream(new Map([['Length',joined.length]]),joined);
page.page.set('Contents',addObject(doc,stream));
}
function writeStream(stream,bytes){
stream.raw=bytes;
stream.dict.delete('Filter');
stream.dict.delete('DecodeParms');
stream.dict.set('Length',bytes.length);
}
function addObject(doc,value){
let number=1;
for(const key of doc.objects.keys())if(key>=number)number=key+1;
for(const key of doc.entries.keys())if(key>=number)number=key+1;
doc.objects.set(number,value);
return new Ref(number,0);
}
function hidesBehindPicture(page,index){
const glyph=page.glyphs[index];
if(!glyph)return false;
if(glyph.invisible)return true;
return page.images.some((image)=>{
const box=unitSquare(image.ctm);
return glyph.origin.x>=box.left&&glyph.origin.x<=box.right
&&glyph.origin.y>=box.bottom&&glyph.origin.y<=box.top;
});
}
function unitSquare(m){
if(!Array.isArray(m))return{left:0,right:0,top:0,bottom:0};
const xs=[m[4],m[0]+m[4],m[2]+m[4],m[0]+m[2]+m[4]];
const ys=[m[5],m[1]+m[5],m[3]+m[5],m[1]+m[3]+m[5]];
return{
left:Math.min(...xs),
right:Math.max(...xs),
bottom:Math.min(...ys),
top:Math.max(...ys),
};
}
