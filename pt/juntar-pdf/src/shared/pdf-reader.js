/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{decodeStream}from'./pdf-filters.js?v=9577a93b49';
import{
ascii,indexOfAscii,isName,lastIndexOfAscii,Parser,parseIndirectObject,
PdfStream,PdfSyntaxError,Ref,
}from'./pdf-objects.js?v=9577a93b49';
export class NotAPdfError extends Error{}
export class EncryptedPdfError extends Error{}
export class PdfDocument{
constructor(bytes){
this.bytes=bytes;
this.entries=new Map();
this.objects=new Map();
this.trailer=new Map();
this.repaired=false;
this.incremental=false;
this.version='1.4';
this.parsing=new Set();
}
static async open(bytes){
const doc=new PdfDocument(bytes);
doc.readHeader();
try{
await doc.readXref();
}catch{
doc.entries.clear();
doc.trailer=new Map();
}
if(!doc.looksUsable()){
doc.rebuildByScanning();
doc.repaired=true;
await doc.expandObjectStreams({discover:true});
}
if(doc.trailer.get('Encrypt')){
throw new EncryptedPdfError('read.encrypted');
}
doc.loadAll();
if(!doc.catalog){
throw new NotAPdfError('read.nocatalogue');
}
return doc;
}
readHeader(){
const at=indexOfAscii(this.bytes.subarray(0,1024),'%PDF-');
if(at<0){
throw new NotAPdfError('read.noheader');
}
const found=ascii(this.bytes,at+5,at+8);
if(/^\d\.\d$/.test(found))this.version=found;
}
looksUsable(){
if(this.entries.size===0)return false;
try{
const root=this.resolve(this.trailer.get('Root'));
return root instanceof Map&&root.size>0;
}catch{
return false;
}
}
async readXref(){
const at=lastIndexOfAscii(this.bytes,'startxref',
this.bytes.length)??-1;
if(at<0)throw new PdfSyntaxError('pdf.nostartxref');
const parser=new Parser(this.bytes,at+9);
parser.skip();
let offset=parser.readNumber();
const seen=new Set();
let sections=0;
while(Number.isInteger(offset)&&offset>=0&&offset<this.bytes.length){
if(seen.has(offset))break;
seen.add(offset);
sections+=1;
const trailer=await this.readXrefSection(offset);
if(!trailer)break;
for(const[key,value]of trailer){
if(!this.trailer.has(key))this.trailer.set(key,value);
}
const hybrid=trailer.get('XRefStm');
if(typeof hybrid==='number'&&!seen.has(hybrid)){
seen.add(hybrid);
try{
await this.readXrefSection(hybrid);
}catch{
}
}
offset=trailer.get('Prev');
if(typeof offset!=='number')break;
}
this.incremental=sections>1;
await this.expandObjectStreams();
}
async readXrefSection(offset){
const parser=new Parser(this.bytes,offset);
if(parser.eatKeyword('xref'))return this.readXrefTable(parser);
const{value}=parseIndirectObject(this.bytes,offset,(ref)=>this.resolve(ref));
if(!(value instanceof PdfStream))throw new PdfSyntaxError('pdf.noxref');
await this.readXrefStream(value);
return value.dict;
}
readXrefTable(parser){
for(;;){
parser.skip();
if(parser.eatKeyword('trailer')){
const trailer=parser.parseValue();
return trailer instanceof Map?trailer:new Map();
}
const start=parser.readNumber();
parser.skip();
const count=parser.readNumber();
if(!Number.isInteger(start)||!Number.isInteger(count)||count<0){
throw new PdfSyntaxError('a malformed xref subsection header');
}
for(let i=0;i<count;i+=1){
parser.skip();
const offset=parser.readNumber();
parser.skip();
parser.readNumber();
parser.skip();
const kind=String.fromCharCode(parser.bytes[parser.pos]);
parser.pos+=1;
if(kind==='n'&&!this.entries.has(start+i)){
this.entries.set(start+i,{offset});
}
}
}
}
async readXrefStream(stream){
const{bytes}=await decodeStream(stream,(v)=>this.resolve(v));
const widths=(this.resolve(stream.dict.get('W'))??[]).map((w)=>this.resolve(w));
if(widths.length<3)throw new PdfSyntaxError('pdf.now');
const size=this.resolve(stream.dict.get('Size'))??0;
const index=this.resolve(stream.dict.get('Index'))??[0,size];
const rowBytes=widths.reduce((sum,w)=>sum+w,0);
if(rowBytes<=0)throw new PdfSyntaxError('pdf.zerowidth');
let at=0;
const field=(width)=>{
let value=0;
for(let i=0;i<width;i+=1){
value=value*256+(bytes[at]??0);
at+=1;
}
return value;
};
for(let pair=0;pair+1<index.length;pair+=2){
const start=this.resolve(index[pair]);
const count=this.resolve(index[pair+1]);
for(let i=0;i<count&&at+rowBytes<=bytes.length;i+=1){
const type=widths[0]===0?1:field(widths[0]);
const second=field(widths[1]);
const third=field(widths[2]);
const num=start+i;
if(this.entries.has(num))continue;
if(type===1)this.entries.set(num,{offset:second});
else if(type===2)this.entries.set(num,{stm:second,index:third});
}
}
}
async expandObjectStreams({discover=false}={}){
const wanted=new Set();
for(const entry of this.entries.values()){
if('stm'in entry)wanted.add(entry.stm);
}
if(discover){
for(const num of[...this.entries.keys()]){
const value=this.getObject(num);
if(value instanceof PdfStream&&isName(value.dict.get('Type'),'ObjStm')){
wanted.add(num);
}
}
}
for(const num of wanted){
try{
const container=this.getObject(num);
if(!(container instanceof PdfStream))continue;
const{bytes}=await decodeStream(container,(v)=>this.resolve(v));
const count=this.resolve(container.dict.get('N'))??0;
const first=this.resolve(container.dict.get('First'))??0;
const header=new Parser(bytes,0);
const pairs=[];
for(let i=0;i<count;i+=1){
header.skip();
const objNum=header.readNumber();
header.skip();
const offset=header.readNumber();
if(!Number.isInteger(objNum)||!Number.isInteger(offset))break;
pairs.push([objNum,first+offset]);
}
for(const[objNum,offset]of pairs){
const entry=this.entries.get(objNum);
if(discover?entry!==undefined:(!entry||entry.stm!==num))continue;
if(this.objects.has(objNum))continue;
try{
this.objects.set(objNum,new Parser(bytes,offset).parseValue());
}catch{
this.objects.set(objNum,null);
}
}
}catch{
}
}
}
rebuildByScanning(){
const{bytes}=this;
this.entries.clear();
this.objects.clear();
for(const{num,offset}of scanObjectHeaders(bytes)){
this.entries.set(num,{offset});
}
this.trailer=new Map();
for(let at=indexOfAscii(bytes,'trailer');at>=0;
at=indexOfAscii(bytes,'trailer',at+7)){
try{
const found=new Parser(bytes,at+7,(ref)=>this.resolve(ref)).parseValue();
if(found instanceof Map&&found.has('Root'))this.trailer=found;
}catch{
}
}
if(!this.trailer.has('Root'))this.findRootTheHardWay();
}
findRootTheHardWay(){
for(const num of this.entries.keys()){
const value=this.getObject(num);
const dict=value instanceof PdfStream?value.dict:value;
if(!(dict instanceof Map))continue;
if(value instanceof PdfStream&&isName(dict.get('Type'),'XRef')&&dict.has('Root')){
for(const[key,entry]of dict){
if(!this.trailer.has(key))this.trailer.set(key,entry);
}
}
if(isName(dict.get('Type'),'Catalog')&&!this.trailer.has('Root')){
this.trailer.set('Root',new Ref(num,0));
}
}
}
getObject(num){
if(this.objects.has(num))return this.objects.get(num);
const entry=this.entries.get(num);
if(!entry||!('offset'in entry)){
this.objects.set(num,null);
return null;
}
if(this.parsing.has(num))return null;
this.parsing.add(num);
let value=null;
try{
const parsed=parseIndirectObject(this.bytes,entry.offset,(ref)=>this.resolve(ref));
if(parsed.num===num)value=parsed.value;
else this.repaired=true;
}catch{
value=null;
}finally{
this.parsing.delete(num);
}
this.objects.set(num,value);
return value;
}
loadAll(){
for(const num of[...this.entries.keys()])this.getObject(num);
}
resolve(value){
let seen=0;
let current=value;
while(current instanceof Ref){
if(seen>64)return null;
seen+=1;
current=this.getObject(current.num);
}
return current;
}
get(dict,key){
if(!(dict instanceof Map))return null;
return this.resolve(dict.get(key));
}
get catalog(){
const root=this.resolve(this.trailer.get('Root'));
return root instanceof Map?root:null;
}
get info(){
const info=this.resolve(this.trailer.get('Info'));
return info instanceof Map?info:null;
}
countPages(){
const seen=new Set();
let pages=0;
const walk=(node,depth)=>{
if(!(node instanceof Map)||depth>64)return;
const kids=this.get(node,'Kids');
if(!Array.isArray(kids)){
if(isName(node.get('Type'),'Page')||node.has('Contents'))pages+=1;
return;
}
for(const kid of kids){
const key=kid instanceof Ref?kid.key:null;
if(key){
if(seen.has(key))continue;
seen.add(key);
}
walk(this.resolve(kid),depth+1);
}
};
walk(this.get(this.catalog,'Pages'),0);
return pages;
}
}
export function scanObjectHeaders(bytes){
const found=[];
for(let at=indexOfAscii(bytes,'obj');at>=0;at=indexOfAscii(bytes,'obj',at+3)){
let i=at-1;
while(i>=0&&isSpace(bytes[i]))i-=1;
const genEnd=i+1;
while(i>=0&&isDigitByte(bytes[i]))i-=1;
const genStart=i+1;
if(genStart===genEnd)continue;
while(i>=0&&isSpace(bytes[i]))i-=1;
const numEnd=i+1;
if(numEnd===genStart)continue;
while(i>=0&&isDigitByte(bytes[i]))i-=1;
const numStart=i+1;
if(numStart===numEnd)continue;
if(numStart>0&&!isSpace(bytes[numStart-1])&&bytes[numStart-1]!==0x3e)continue;
const num=Number.parseInt(ascii(bytes,numStart,numEnd),10);
if(Number.isInteger(num))found.push({num,offset:numStart});
}
return found;
}
function isSpace(code){
return code===0x20||code===0x0a||code===0x0d||code===0x09
||code===0x00||code===0x0c;
}
function isDigitByte(code){
return code>=0x30&&code<=0x39;
}
