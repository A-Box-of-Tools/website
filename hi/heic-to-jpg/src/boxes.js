/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const HEADER=8;
const LARGE_SIZE=1;
const TO_END=0;
const HEIF_BRANDS=new Set(['heic','heix','heim','heis','hevc','hevx','mif1','msf1']);
const ascii=(bytes,at,length=4)=>{
let out='';
for(let i=0;i<length;i+=1)out+=String.fromCharCode(bytes[at+i]);
return out;
};
function walk(bytes,start,end,visit){
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
let at=start;
while(at+HEADER<=end){
let size=view.getUint32(at);
const type=ascii(bytes,at+4);
let body=at+HEADER;
if(size===LARGE_SIZE){
if(at+16>end)return;
size=Number(view.getBigUint64(at+8));
body=at+16;
}else if(size===TO_END){
size=end-at;
}
if(size<body-at||at+size>end)return;
visit(type,body,at+size);
at+=size;
}
}
const fullBox=(bytes,at)=>({version:bytes[at],at:at+4});
function uint(bytes,at,size){
let value=0;
for(let i=0;i<size;i+=1)value=value*256+bytes[at+i];
return value;
}
function brands(bytes){
const found=[];
walk(bytes,0,bytes.length,(type,from,to)=>{
if(type!=='ftyp'||found.length)return;
for(let at=from;at+4<=to;at+=4){
if(at===from+4)continue;
found.push(ascii(bytes,at));
}
});
return found;
}
export function isAvif(bytes){
return brands(bytes).some((brand)=>brand==='avif'||brand==='avis');
}
export function heifBrand(bytes){
const named=brands(bytes);
if(named.some((brand)=>brand==='avif'||brand==='avis'))return null;
return named.find((brand)=>HEIF_BRANDS.has(brand))??null;
}
function readMeta(bytes){
const result={primary:null,describes:new Map(),items:new Map()};
const types=new Map();
const places=new Map();
let idat=null;
walk(bytes,0,bytes.length,(type,from,to)=>{
if(type!=='meta')return;
walk(bytes,from+4,to,(child,childFrom,childTo)=>{
if(child==='pitm'){
const{version,at}=fullBox(bytes,childFrom);
result.primary=uint(bytes,at,version===0?2:4);
}else if(child==='iinf'){
readItemInfo(bytes,childFrom,childTo,types);
}else if(child==='iloc'){
readItemLocations(bytes,childFrom,places);
}else if(child==='iref'){
readItemReferences(bytes,childFrom,childTo,result.describes);
}else if(child==='idat'){
idat=childFrom;
}
});
});
for(const[id,place]of places){
const from=place.inIdat?(idat===null?-1:idat+place.offset):place.offset;
if(from<0||from+place.length>bytes.length)continue;
result.items.set(id,{type:types.get(id)??'',from,to:from+place.length});
}
return result;
}
function readItemInfo(bytes,from,to,types){
const{version,at}=fullBox(bytes,from);
const countSize=version===0?2:4;
walk(bytes,at+countSize,to,(child,childFrom)=>{
if(child!=='infe')return;
const entry=fullBox(bytes,childFrom);
if(entry.version<2)return;
const idSize=entry.version===2?2:4;
const id=uint(bytes,entry.at,idSize);
types.set(id,ascii(bytes,entry.at+idSize+2));
});
}
function readItemReferences(bytes,from,to,describes){
const{version,at}=fullBox(bytes,from);
const idSize=version===0?2:4;
walk(bytes,at,to,(kind,refFrom)=>{
if(kind!=='cdsc')return;
const source=uint(bytes,refFrom,idSize);
const count=uint(bytes,refFrom+idSize,2);
const targets=[];
for(let i=0;i<count;i+=1){
targets.push(uint(bytes,refFrom+idSize+2+i*idSize,idSize));
}
describes.set(source,targets);
});
}
function readItemLocations(bytes,from,places){
const{version,at}=fullBox(bytes,from);
const offsetSize=bytes[at]>>4;
const lengthSize=bytes[at]&0x0f;
const baseSize=bytes[at+1]>>4;
const indexSize=version===1||version===2?(bytes[at+1]&0x0f):0;
let cursor=at+2;
const count=uint(bytes,cursor,version<2?2:4);
cursor+=version<2?2:4;
for(let i=0;i<count;i+=1){
const id=uint(bytes,cursor,version<2?2:4);
cursor+=version<2?2:4;
let inIdat=false;
if(version===1||version===2){
inIdat=(bytes[cursor+1]&0x0f)===1;
cursor+=2;
}
cursor+=2;
const base=uint(bytes,cursor,baseSize);
cursor+=baseSize;
const extents=uint(bytes,cursor,2);
cursor+=2;
for(let e=0;e<extents;e+=1){
cursor+=indexSize;
const offset=uint(bytes,cursor,offsetSize);
cursor+=offsetSize;
const length=uint(bytes,cursor,lengthSize);
cursor+=lengthSize;
if(e===0)places.set(id,{offset:base+offset,length,inIdat});
}
}
}
export function readExif(bytes){
const meta=readMeta(bytes);
const blocks=[];
for(const[id,item]of meta.items){
if(item.type!=='Exif')continue;
const start=findTiffHeader(bytes,item.from,Math.min(item.from+32,item.to));
if(start>=0)blocks.push({id,tiff:bytes.subarray(start,item.to)});
}
if(blocks.length===0)return null;
const forPrimary=blocks.find(
(block)=>(meta.describes.get(block.id)??[]).includes(meta.primary),
);
return(forPrimary??blocks[0]).tiff;
}
function findTiffHeader(bytes,from,limit){
for(let at=from;at+4<=limit;at+=1){
const little=bytes[at]===0x49&&bytes[at+1]===0x49
&&bytes[at+2]===0x2a&&bytes[at+3]===0x00;
const big=bytes[at]===0x4d&&bytes[at+1]===0x4d
&&bytes[at+2]===0x00&&bytes[at+3]===0x2a;
if(little||big)return at;
}
return-1;
}
