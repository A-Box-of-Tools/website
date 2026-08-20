/* Built from https://github.com/A-Box-of-Tools/website by build.py. Comments and indentation removed; nothing renamed. Verify with: python build.py --check */
import{crc32}from'./crc32.js';
const SIGNATURE=[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a];
const TEXT_TYPES=new Set(['tEXt','zTXt','iTXt']);
const latin1=new TextDecoder('latin1');
const utf8=new TextEncoder();
const utf8Decoder=new TextDecoder('utf-8');
const XMP_KEYWORD='XML:com.adobe.xmp';
function typeBytes(type){
const out=new Uint8Array(4);
for(let i=0;i<4;i+=1)out[i]=type.charCodeAt(i);
return out;
}
async function inflate(bytes){
const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
return new Uint8Array(await new Response(stream).arrayBuffer());
}
export async function read(bytes){
if(bytes.length<12||SIGNATURE.some((b,i)=>bytes[i]!==b)){
return{ok:false,kind:'png',error:'This does not start like a PNG.'};
}
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
const chunks=[];
let at=8;
while(at+8<=bytes.length){
const length=view.getUint32(at);
const type=latin1.decode(bytes.subarray(at+4,at+8));
if(at+12+length>bytes.length){
return{ok:false,kind:'png',error:'A chunk claims a length that runs off the end of the file.'};
}
const chunk={type,data:bytes.slice(at+8,at+8+length)};
if(TEXT_TYPES.has(type))chunk.text=await readText(chunk);
chunks.push(chunk);
at+=12+length;
if(type==='IEND')break;
}
if(!chunks.length||chunks[0].type!=='IHDR'){
return{ok:false,kind:'png',error:'The header chunk is missing.'};
}
return{ok:true,kind:'png',chunks};
}
export function write(doc){
let total=8;
for(const c of doc.chunks)total+=12+c.data.length;
const out=new Uint8Array(total);
out.set(SIGNATURE);
const view=new DataView(out.buffer);
let at=8;
for(const chunk of doc.chunks){
const type=typeBytes(chunk.type);
view.setUint32(at,chunk.data.length);
out.set(type,at+4);
out.set(chunk.data,at+8);
view.setUint32(at+8+chunk.data.length,crc32([type,chunk.data]));
at+=12+chunk.data.length;
}
return out;
}
const nulAt=(bytes,from)=>{
for(let i=from;i<bytes.length;i+=1)if(bytes[i]===0)return i;
return-1;
};
async function readText(chunk){
const{type,data}=chunk;
const split=nulAt(data,0);
if(split<0)return{keyword:'(malformed)',value:'',encoding:type};
const keyword=latin1.decode(data.subarray(0,split));
try{
if(type==='tEXt'){
return{keyword,value:latin1.decode(data.subarray(split+1)),encoding:type};
}
if(type==='zTXt'){
const body=await inflate(data.subarray(split+2));
return{keyword,value:latin1.decode(body),encoding:type};
}
const compressed=data[split+1]===1;
const langEnd=nulAt(data,split+3);
const transEnd=nulAt(data,langEnd+1);
if(langEnd<0||transEnd<0)return{keyword,value:'',encoding:type};
const body=data.subarray(transEnd+1);
return{
keyword,
value:utf8Decoder.decode(compressed?await inflate(body):body),
encoding:type,
language:latin1.decode(data.subarray(split+3,langEnd)),
};
}catch{
return{keyword,value:null,encoding:type,unreadable:true};
}
}
function makeTextChunk(keyword,value){
const key=keyword.slice(0,79);
const plain=/^[\x20-\xff]*$/.test(value)&&!/[\x80-\x9f]/.test(value);
if(plain){
const data=new Uint8Array(key.length+1+value.length);
for(let i=0;i<key.length;i+=1)data[i]=key.charCodeAt(i);
for(let i=0;i<value.length;i+=1)data[key.length+1+i]=value.charCodeAt(i)&0xff;
return{type:'tEXt',data,text:{keyword:key,value,encoding:'tEXt'}};
}
const body=utf8.encode(value);
const data=new Uint8Array(key.length+5+body.length);
for(let i=0;i<key.length;i+=1)data[i]=key.charCodeAt(i);
data.set(body,key.length+5);
return{type:'iTXt',data,text:{keyword:key,value,encoding:'iTXt'}};
}
function stripExifId(data){
const head=latin1.decode(data.subarray(0,6));
return head==='Exif\0\0'?data.slice(6):data;
}
export function collect(doc){
const meta={
exif:null,xmp:null,iptc:null,icc:null,
comments:[],text:[],extras:[],notes:[],
};
doc.chunks.forEach((chunk,index)=>{
if(chunk.type==='eXIf'&&!meta.exif){
meta.exif=stripExifId(chunk.data);
}else if(TEXT_TYPES.has(chunk.type)){
if(chunk.text?.keyword===XMP_KEYWORD)meta.xmp=chunk.text.value;
else meta.text.push({...chunk.text,index});
}else if(chunk.type==='iCCP'){
const split=nulAt(chunk.data,0);
meta.icc=chunk.data.slice(split+2);
meta.iccName=split>0?latin1.decode(chunk.data.subarray(0,split)):null;
}else if(chunk.type==='tIME'){
meta.extras.push({label:'Last-modified time (tIME)',size:chunk.data.length});
}else if(chunk.type==='dSIG'){
meta.extras.push({label:'Embedded digital signature (dSIG)',size:chunk.data.length});
}
});
return meta;
}
export function apply(doc,plan){
const inserted=[];
if(plan.exif)inserted.push({type:'eXIf',data:plan.exif});
if(Array.isArray(plan.text)){
for(const item of plan.text)inserted.push(makeTextChunk(item.keyword,item.value));
}
if(typeof plan.xmp==='string'&&plan.xmp)inserted.push(makeTextChunk(XMP_KEYWORD,plan.xmp));
const out=[];
for(const chunk of doc.chunks){
if(chunk.type==='IHDR'){
out.push(chunk,...inserted);
continue;
}
if(chunk.type==='eXIf'&&plan.exif!==undefined)continue;
if(TEXT_TYPES.has(chunk.type)){
const isXmp=chunk.text?.keyword===XMP_KEYWORD;
if(isXmp?plan.xmp!==undefined:plan.text!==undefined)continue;
out.push(chunk);
continue;
}
if(chunk.type==='iCCP'&&plan.icc===null)continue;
if((chunk.type==='tIME'||chunk.type==='dSIG')&&plan.extras===null)continue;
out.push(chunk);
}
doc.chunks=out;
}
