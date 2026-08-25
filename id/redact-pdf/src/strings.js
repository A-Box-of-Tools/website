/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{PdfStream,PdfString}from'./objects.js';
const TEXT_KEYS=[
'Title','Author','Subject','Keywords','Creator','Producer',
'Contents','RC','Subj','T','V','DV','TU','Alt','ActualText','E',
'Desc','F','UF',
];
export function decodeText(bytes){
if(bytes.length>=2&&bytes[0]===0xfe&&bytes[1]===0xff){
let text='';
for(let at=2;at+1<bytes.length;at+=2){
text+=String.fromCharCode((bytes[at]<<8)|bytes[at+1]);
}
return text;
}
let text='';
for(const byte of bytes)text+=String.fromCharCode(byte);
return text;
}
export function encodeText(text){
const out=new Uint8Array(2+text.length*2);
out[0]=0xfe;
out[1]=0xff;
for(let at=0;at<text.length;at+=1){
const code=text.charCodeAt(at);
out[2+at*2]=(code>>8)&0xff;
out[3+at*2]=code&0xff;
}
return out;
}
export function scrubStrings(doc,remove){
let changed=0;
const where=new Set();
for(const value of doc.objects.values()){
const dict=value instanceof PdfStream?value.dict:value;
if(!(dict instanceof Map))continue;
for(const key of TEXT_KEYS){
const item=dict.get(key);
if(!(item instanceof PdfString))continue;
if(key==='T'&&isFieldName(dict))continue;
const before=decodeText(item.bytes);
const after=remove(before);
if(after===before)continue;
dict.set(key,new PdfString(encodeText(after)));
changed+=1;
where.add(describe(key));
}
}
return{changed,where:[...where]};
}
function isFieldName(dict){
return dict.has('FT')||dict.has('Ff')||dict.has('Kids');
}
function describe(key){
if(key==='V'||key==='DV'||key==='TU')return'a form field';
if(key==='Contents'||key==='RC'||key==='Subj'||key==='T')return'a comment';
if(key==='ActualText'||key==='Alt'||key==='E')return'a copy-and-paste replacement';
if(key==='F'||key==='UF'||key==='Desc')return'an attachment';
return'the document properties';
}
export function harvestStrings(doc){
const found=[];
const visit=(value,depth)=>{
if(depth>32)return;
if(value instanceof PdfString){
const text=decodeText(value.bytes);
if(text.trim())found.push(text);
return;
}
if(Array.isArray(value)){
for(const item of value)visit(item,depth+1);
return;
}
const dict=value instanceof PdfStream?value.dict:value;
if(dict instanceof Map){
for(const[key,item]of dict){
if(key==='ID'||key==='O'||key==='U')continue;
visit(item,depth+1);
}
}
};
for(const value of doc.objects.values())visit(value,0);
return found;
}
export function removeCarriedFiles(doc){
let attachments=0;
let actions=0;
for(const value of doc.objects.values()){
const dict=value instanceof PdfStream?value.dict:value;
if(!(dict instanceof Map))continue;
if(dict.has('EF')){
dict.delete('EF');
attachments+=1;
}
if(dict.has('EmbeddedFiles')){
dict.delete('EmbeddedFiles');
attachments+=1;
}
for(const key of['JS','OpenAction','AA']){
if(dict.has(key)){
dict.delete(key);
actions+=1;
}
}
}
const names=doc.get(doc.catalog,'Names');
if(names instanceof Map&&names.has('JavaScript')){
names.delete('JavaScript');
actions+=1;
}
return{attachments,actions};
}
