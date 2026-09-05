/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{deflate,filterNames}from'./pdf-filters.js?v=48fbbf8377';
import{
name,Name,PdfStream,PdfString,Ref,
}from'./pdf-objects.js?v=48fbbf8377';
const PACK_SIZE=200;
const WORTH_DEFLATING=128;
class ByteWriter{
constructor(){
this.chunks=[];
this.length=0;
}
raw(bytes){
this.chunks.push(bytes);
this.length+=bytes.length;
}
ascii(text){
const out=new Uint8Array(text.length);
for(let i=0;i<text.length;i+=1)out[i]=text.charCodeAt(i)&0xff;
this.raw(out);
}
}
function formatNumber(value){
if(!Number.isFinite(value))return'0';
if(Number.isInteger(value)&&Math.abs(value)<1e15)return String(value);
return value.toFixed(6).replace(/\.?0+$/,'')||'0';
}
function formatName(value){
let out='/';
for(const char of value){
const code=char.charCodeAt(0);
const plain=code>0x20&&code<0x7f&&!'()<>[]{}/%#'.includes(char);
out+=plain?char:`#${code.toString(16).padStart(2, '0')}`;
}
return out;
}
function formatString(bytes){
let out='<';
for(const byte of bytes)out+=byte.toString(16).padStart(2,'0');
return`${out}>`;
}
function serialize(value,renumber,depth=0){
if(depth>200)return'null';
if(value===null||value===undefined)return'null';
if(value===true)return'true';
if(value===false)return'false';
if(typeof value==='number')return formatNumber(value);
if(value instanceof Name)return formatName(value.value);
if(value instanceof PdfString)return formatString(value.bytes);
if(value instanceof Ref){
const renamed=renumber.get(value.num);
return renamed===undefined?'null':`${renamed} 0 R`;
}
if(Array.isArray(value)){
return`[${value.map((item) => serialize(item, renumber, depth + 1)).join(' ')}]`;
}
if(value instanceof PdfStream)return serializeDict(value.dict,renumber,depth);
if(value instanceof Map)return serializeDict(value,renumber,depth);
return'null';
}
function serializeDict(dict,renumber,depth){
let out='<<';
for(const[key,item]of dict){
out+=`${formatName(key)} ${serialize(item, renumber, depth + 1)} `;
}
return`${out.trimEnd()}>>`;
}
export function reachable(doc,roots){
const found=new Set();
const queue=[];
const visit=(value,depth)=>{
if(depth>500)return;
if(value instanceof Ref){
if(found.has(value.num))return;
found.add(value.num);
queue.push(value.num);
return;
}
if(Array.isArray(value)){
for(const item of value)visit(item,depth+1);
return;
}
const dict=value instanceof PdfStream?value.dict:value;
if(dict instanceof Map){
for(const item of dict.values())visit(item,depth+1);
}
};
for(const root of roots)visit(root,0);
for(let at=0;at<queue.length;at+=1){
visit(doc.getObject(queue[at]),0);
}
return found;
}
export function stripMetadata(doc){
let removed=0;
const kill=(dict,key)=>{
if(dict instanceof Map&&dict.has(key)){
dict.delete(key);
removed+=1;
}
};
for(const value of doc.objects.values()){
const dict=value instanceof PdfStream?value.dict:value;
if(!(dict instanceof Map))continue;
kill(dict,'Metadata');
kill(dict,'PieceInfo');
kill(dict,'LastModified');
kill(dict,'Thumb');
}
doc.trailer.delete('Info');
return removed;
}
export async function writeDocument(doc,{onProgress,recompress=true,signal}={}){
const roots=[doc.trailer.get('Root')];
if(doc.trailer.has('Info'))roots.push(doc.trailer.get('Info'));
const live=reachable(doc,roots);
const numbers=[...live].sort((a,b)=>a-b);
const renumber=new Map();
numbers.forEach((num,index)=>renumber.set(num,index+1));
const streams=[];
const packable=[];
for(const num of numbers){
const value=doc.getObject(num);
if(value instanceof PdfStream)streams.push({num,value});
else packable.push({num,value});
}
const writer=new ByteWriter();
const version=doc.version>='1.5'?doc.version:'1.5';
writer.ascii(`%PDF-${version}\n`);
writer.raw(new Uint8Array([0x25,0xe2,0xe3,0xcf,0xd3,0x0a]));
const located=new Map();
const spare={next:numbers.length+1};
let done=0;
const total=streams.length+packable.length;
for(const{num,value}of streams){
if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
const id=renumber.get(num);
located.set(id,{offset:writer.length});
let{raw}=value;
if(recompress&&shouldDeflate(doc,value)){
try{
const packed=await deflate(raw);
if(packed.length<raw.length){
raw=packed;
value.dict.set('Filter',name('FlateDecode'));
}
}catch{
}
}
value.dict.set('Length',raw.length);
writer.ascii(`${id} 0 obj\n${serializeDict(value.dict, renumber, 0)}\nstream\n`);
writer.raw(raw);
writer.ascii('\nendstream\nendobj\n');
done+=1;
if(done%24===0){
onProgress?.(done,total);
await breathe();
}
}
await packObjects(writer,packable,renumber,located,spare,()=>{
done+=1;
if(done%200===0)onProgress?.(done,total);
});
await writeXrefStream(writer,located,renumber,doc,spare);
onProgress?.(total,total);
return new Blob(writer.chunks,{type:'application/pdf'});
}
function breathe(){
return new Promise((resolve)=>setTimeout(resolve,0));
}
function shouldDeflate(doc,stream){
if(stream.raw.length<WORTH_DEFLATING)return false;
return filterNames(stream.dict,(v)=>doc.resolve(v)).length===0;
}
async function packObjects(writer,packable,renumber,located,spare,tick){
for(let start=0;start<packable.length;start+=PACK_SIZE){
const batch=packable.slice(start,start+PACK_SIZE);
let header='';
let body='';
for(const{num,value}of batch){
const id=renumber.get(num);
header+=`${id} ${body.length} `;
body+=`${serialize(value, renumber, 0)}\n`;
tick();
}
const text=header+body;
const bytes=new Uint8Array(text.length);
for(let i=0;i<text.length;i+=1)bytes[i]=text.charCodeAt(i)&0xff;
const id=spare.next;
spare.next+=1;
batch.forEach(({num},index)=>{
located.set(renumber.get(num),{stm:id,index});
});
let data=bytes;
let filter='';
try{
const packed=await deflate(bytes);
if(packed.length<bytes.length){
data=packed;
filter=' /Filter /FlateDecode';
}
}catch{
}
located.set(id,{offset:writer.length});
writer.ascii(`${id} 0 obj\n<< /Type /ObjStm /N ${batch.length} `
+`/First ${header.length}${filter} /Length ${data.length} >>\nstream\n`);
writer.raw(data);
writer.ascii('\nendstream\nendobj\n');
await breathe();
}
}
async function writeXrefStream(writer,located,renumber,doc,spare){
const id=spare.next;
spare.next+=1;
const offset=writer.length;
located.set(id,{offset});
const count=id+1;
const rows=new Uint8Array(count*7);
rows[0]=0;
rows[5]=0xff;
rows[6]=0xff;
for(const[num,place]of located){
const at=num*7;
if(at+7>rows.length)continue;
if('offset'in place){
rows[at]=1;
rows[at+1]=(place.offset>>>24)&0xff;
rows[at+2]=(place.offset>>>16)&0xff;
rows[at+3]=(place.offset>>>8)&0xff;
rows[at+4]=place.offset&0xff;
}else{
rows[at]=2;
rows[at+1]=(place.stm>>>24)&0xff;
rows[at+2]=(place.stm>>>16)&0xff;
rows[at+3]=(place.stm>>>8)&0xff;
rows[at+4]=place.stm&0xff;
rows[at+5]=(place.index>>>8)&0xff;
rows[at+6]=place.index&0xff;
}
}
let data=rows;
let filter='';
try{
const packed=await deflate(rows);
if(packed.length<rows.length){
data=packed;
filter=' /Filter /FlateDecode';
}
}catch{
}
const root=renumber.get(refNumber(doc.trailer.get('Root')));
const info=renumber.get(refNumber(doc.trailer.get('Info')));
let entries=`<< /Type /XRef /Size ${count} /W [1 4 2] `
+`/Root ${root} 0 R`;
if(info!==undefined)entries+=` /Info ${info} 0 R`;
entries+=`${filter} /Length ${data.length} >>`;
writer.ascii(`${id} 0 obj\n${entries}\nstream\n`);
writer.raw(data);
writer.ascii('\nendstream\nendobj\n');
writer.ascii(`startxref\n${offset}\n%%EOF\n`);
}
function refNumber(value){
return value instanceof Ref?value.num:-1;
}
