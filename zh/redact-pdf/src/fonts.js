/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{base14Widths,encodingByName,glyphText,STANDARD,WIN_ANSI}from'./base14.js';
import{lex}from'./content.js';
import{decodeStream}from'./shared/pdf-filters.js';
import{Name,PdfStream,PdfString}from'./shared/pdf-objects.js';
const UNITS=1000;
export async function readFont(doc,dict){
const subtype=doc.get(dict,'Subtype');
const kind=subtype instanceof Name?subtype.value:'';
const font=kind==='Type0'
?await composite(doc,dict)
:await simple(doc,dict,kind);
font.toUnicode=await readToUnicode(doc,dict);
font.kind=kind;
return font;
}
async function simple(doc,dict,kind){
const encoding=simpleEncoding(doc,dict,kind);
const widths=simpleWidths(doc,dict,encoding);
const{ascent,descent}=vertical(doc,dict);
const matrix=kind==='Type3'?doc.get(dict,'FontMatrix'):null;
const scale=Array.isArray(matrix)&&Number.isFinite(matrix[0])
?matrix[0]*UNITS:1;
return{
split:splitSingleBytes,
singleByte:true,
text:(code)=>glyphText(encoding[code]??''),
width:(code)=>widths(code)*scale,
ascent,
descent,
scale,
};
}
function splitSingleBytes(bytes){
const out=new Array(bytes.length);
for(let at=0;at<bytes.length;at+=1)out[at]={code:bytes[at],size:1};
return out;
}
function simpleEncoding(doc,dict,kind){
const table=(kind==='TrueType'?WIN_ANSI:STANDARD).slice();
const encoding=doc.get(dict,'Encoding');
const base=encoding instanceof Name
?encodingByName(encoding.value)
:encodingByName(nameOf(doc.get(encoding,'BaseEncoding')));
if(base)base.forEach((glyph,code)=>{table[code]=glyph;});
const differences=doc.get(encoding,'Differences');
if(Array.isArray(differences)){
let code=0;
for(const item of differences.map((value)=>doc.resolve(value))){
if(typeof item==='number')code=Math.trunc(item);
else if(item instanceof Name&&code>=0&&code<256){
table[code]=item.value;
code+=1;
}
}
}
return table;
}
function simpleWidths(doc,dict,encoding){
const first=doc.get(dict,'FirstChar');
const listed=doc.get(dict,'Widths');
const descriptor=doc.get(dict,'FontDescriptor');
const missing=doc.get(descriptor,'MissingWidth');
const table=new Map();
if(Array.isArray(listed)&&Number.isFinite(first)){
listed.forEach((value,index)=>{
const width=doc.resolve(value);
if(Number.isFinite(width))table.set(first+index,width);
});
}
const builtIn=table.size?null:base14Widths(nameOf(doc.get(dict,'BaseFont')));
return(code)=>{
const known=table.get(code);
if(known!==undefined)return known;
if(builtIn)return builtIn.width(encoding[code]??'');
if(Number.isFinite(missing))return missing;
return table.size?0:500;
};
}
async function composite(doc,dict){
const descendants=doc.get(dict,'DescendantFonts');
const first=doc.resolve(Array.isArray(descendants)?descendants[0]:null);
const child=first instanceof Map?first:new Map();
const encoding=doc.get(dict,'Encoding');
const cmap=encoding instanceof PdfStream
?await readCMap(doc,encoding)
:identityCMap();
const widths=cidWidths(doc,child);
const{ascent,descent}=vertical(doc,child);
return{
split:(bytes)=>cmap.split(bytes),
singleByte:cmap.hasSingleBytes,
text:()=>'',
width:(code)=>widths(cmap.cid(code)),
ascent,
descent,
scale:1,
};
}
function identityCMap(){
return{split:splitTwoBytes,cid:(code)=>code,hasSingleBytes:false};
}
function splitTwoBytes(bytes){
const out=[];
for(let at=0;at<bytes.length;at+=2){
out.push({code:(bytes[at]<<8)|(bytes[at+1]??0),size:2});
}
return out;
}
function cidWidths(doc,child){
const fallback=doc.get(child,'DW');
const table=new Map();
const list=doc.get(child,'W');
if(Array.isArray(list)){
let at=0;
while(at<list.length){
const start=doc.resolve(list[at]);
const next=doc.resolve(list[at+1]);
if(Array.isArray(next)){
next.forEach((value,index)=>{
const width=doc.resolve(value);
if(Number.isFinite(width))table.set(start+index,width);
});
at+=2;
}else if(Number.isFinite(start)&&Number.isFinite(next)){
const width=doc.resolve(list[at+2]);
const last=Math.min(next,start+65535);
if(Number.isFinite(width)){
for(let cid=start;cid<=last;cid+=1)table.set(cid,width);
}
at+=3;
}else{
break;
}
}
}
return(cid)=>table.get(cid)??(Number.isFinite(fallback)?fallback:UNITS);
}
async function readCMap(doc,stream){
const ranges=[];
const cids=new Map();
const spans=[];
let bytes;
try{
({bytes}=await decodeStream(stream,(value)=>doc.resolve(value)));
}catch{
return identityCMap();
}
for(const op of lex(bytes)){
if(op.name==='endcodespacerange'){
for(let at=0;at+1<op.args.length;at+=2){
const low=op.args[at];
if(low instanceof PdfString&&low.bytes.length)spans.push(low.bytes.length);
}
}else if(op.name==='endcidrange'){
for(let at=0;at+2<op.args.length;at+=3){
const[low,high,first]=op.args.slice(at,at+3);
if(low instanceof PdfString&&high instanceof PdfString
&&Number.isFinite(first)){
ranges.push({low:codeOf(low.bytes),high:codeOf(high.bytes),first});
}
}
}else if(op.name==='endcidchar'){
for(let at=0;at+1<op.args.length;at+=2){
const[code,cid]=op.args.slice(at,at+2);
if(code instanceof PdfString&&Number.isFinite(cid)){
cids.set(codeOf(code.bytes),cid);
}
}
}
}
const sizes=new Set(spans);
const oneByte=sizes.has(1);
const width=sizes.size===1?[...sizes][0]:0;
return{
hasSingleBytes:oneByte,
split:width===1?splitSingleBytes:splitTwoBytes,
cid(code){
const exact=cids.get(code);
if(exact!==undefined)return exact;
for(const range of ranges){
if(code>=range.low&&code<=range.high)return range.first+(code-range.low);
}
return code;
},
};
}
async function readToUnicode(doc,dict){
const stream=doc.get(dict,'ToUnicode');
if(!(stream instanceof PdfStream))return null;
let bytes;
try{
({bytes}=await decodeStream(stream,(value)=>doc.resolve(value)));
}catch{
return null;
}
const map=new Map();
for(const op of lex(bytes)){
if(op.name==='endbfchar'){
for(let at=0;at+1<op.args.length;at+=2){
const[code,value]=op.args.slice(at,at+2);
if(code instanceof PdfString)map.set(codeOf(code.bytes),unicodeOf(value));
}
}else if(op.name==='endbfrange'){
for(let at=0;at+2<op.args.length;at+=3){
const[low,high,value]=op.args.slice(at,at+3);
if(!(low instanceof PdfString)||!(high instanceof PdfString))continue;
const from=codeOf(low.bytes);
const to=Math.min(codeOf(high.bytes),from+65535);
if(Array.isArray(value)){
for(let code=from;code<=to;code+=1){
map.set(code,unicodeOf(value[code-from]));
}
continue;
}
if(!(value instanceof PdfString))continue;
const text=unicodeOf(value);
for(let code=from;code<=to;code+=1){
map.set(code,step(text,code-from));
}
}
}
}
return map.size?map:null;
}
function codeOf(bytes){
let value=0;
for(const byte of bytes.subarray(0,4))value=(value<<8)|byte;
return value>>>0;
}
function unicodeOf(value){
if(value instanceof Name)return glyphText(value.value);
if(!(value instanceof PdfString))return'';
const{bytes}=value;
let text='';
for(let at=0;at+1<bytes.length;at+=2){
text+=String.fromCharCode((bytes[at]<<8)|bytes[at+1]);
}
if(bytes.length%2)text+=String.fromCharCode(bytes[bytes.length-1]);
return text;
}
function step(text,by){
if(!text||!by)return text;
const last=text.charCodeAt(text.length-1)+by;
if(last>0xffff)return text;
return text.slice(0,-1)+String.fromCharCode(last);
}
function vertical(doc,dict){
const descriptor=doc.get(dict,'FontDescriptor');
const ascent=doc.get(descriptor,'Ascent');
const descent=doc.get(descriptor,'Descent');
const box=doc.get(descriptor,'FontBBox');
const fromBox=Array.isArray(box)
?{top:doc.resolve(box[3]),bottom:doc.resolve(box[1])}
:{};
return{
ascent:pick(ascent,fromBox.top,750),
descent:pick(descent,fromBox.bottom,-220),
};
}
function pick(...values){
for(const value of values)if(Number.isFinite(value)&&value!==0)return value;
return 0;
}
function nameOf(value){
return value instanceof Name?value.value:'';
}
export function glyphsOf(font,bytes){
const out=[];
let at=0;
for(const{code,size}of font.split(bytes)){
const mapped=font.toUnicode?.get(code);
const named=font.text(code);
const text=mapped!==undefined&&mapped!==''?mapped:named;
out.push({
code,
size,
at,
text,
width:font.width(code),
known:text!=='',
});
at+=size;
}
return out;
}
export async function readFonts(doc,resources){
const fonts=new Map();
const dict=doc.get(resources,'Font');
if(!(dict instanceof Map))return fonts;
for(const[key,value]of dict){
const font=doc.resolve(value);
if(font instanceof Map){
try{
fonts.set(key,await readFont(doc,font));
}catch{
}
}
}
return fonts;
}
