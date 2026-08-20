/* Built from https://github.com/A-Box-of-Tools/website by build.py. Comments and indentation removed; nothing renamed. Verify with: python build.py --check */
const TYPE_SIZES=[0,1,1,2,4,8,1,1,2,4,8,4,8];
export const TYPE={
BYTE:1,
ASCII:2,
SHORT:3,
LONG:4,
RATIONAL:5,
SBYTE:6,
UNDEFINED:7,
SSHORT:8,
SLONG:9,
SRATIONAL:10,
FLOAT:11,
DOUBLE:12,
};
const POINTER_TAGS={0x8769:'exif',0x8825:'gps',0xa005:'interop'};
const THUMB_OFFSET=0x0201;
const THUMB_LENGTH=0x0202;
const XP_TAGS=new Set([0x9c9b,0x9c9c,0x9c9d,0x9c9e,0x9c9f]);
const USER_COMMENT=0x9286;
export const GROUP_ORDER=['ifd0','exif','gps','interop','ifd1'];
const utf8=new TextEncoder();
function decodeText(bytes){
try{
return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
}catch{
return new TextDecoder('latin1').decode(bytes);
}
}
function trimNuls(bytes){
let end=bytes.length;
while(end>0&&bytes[end-1]===0)end-=1;
return bytes.subarray(0,end);
}
function trimNulPairs(bytes){
let end=bytes.length-(bytes.length%2);
while(end>=2&&bytes[end-1]===0&&bytes[end-2]===0)end-=2;
return bytes.subarray(0,end);
}
export function parseExif(bytes){
if(!bytes||bytes.length<8)return{ok:false,error:'The block is too short to be EXIF.'};
const mark=String.fromCharCode(bytes[0],bytes[1]);
if(mark!=='II'&&mark!=='MM'){
return{ok:false,error:'No byte-order mark - this is not a TIFF block.'};
}
const littleEndian=mark==='II';
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
if(view.getUint16(2,littleEndian)!==42){
return{ok:false,error:'The TIFF magic number is wrong.'};
}
const groups={ifd0:[],exif:[],gps:[],interop:[],ifd1:[]};
let thumbnail=null;
const seen=new Set();
const readIfd=(offset,group)=>{
if(offset<=0||offset+2>bytes.length||seen.has(offset))return-1;
seen.add(offset);
const count=view.getUint16(offset,littleEndian);
if(offset+2+count*12+4>bytes.length)return-1;
for(let i=0;i<count;i+=1){
const at=offset+2+i*12;
const tag=view.getUint16(at,littleEndian);
const type=view.getUint16(at+2,littleEndian);
const n=view.getUint32(at+4,littleEndian);
const size=(TYPE_SIZES[type]??0)*n;
if(size===0||size>bytes.length)continue;
let raw;
if(size<=4){
raw=bytes.slice(at+8,at+8+size);
}else{
const valueAt=view.getUint32(at+8,littleEndian);
if(valueAt+size>bytes.length)continue;
raw=bytes.slice(valueAt,valueAt+size);
}
const entry={tag,type,count:n,raw,value:null};
entry.value=decodeValue(entry,littleEndian);
groups[group].push(entry);
const sub=POINTER_TAGS[tag];
if(sub&&group!=='ifd1'){
const target=size<=4?readU32(raw,0,littleEndian):view.getUint32(at+8,littleEndian);
readIfd(target,sub);
}
}
return view.getUint32(offset+2+count*12,littleEndian);
};
const nextOffset=readIfd(view.getUint32(4,littleEndian),'ifd0');
if(nextOffset===-1&&groups.ifd0.length===0){
return{ok:false,error:'The first directory offset points outside the block.'};
}
if(nextOffset>0)readIfd(nextOffset,'ifd1');
const at=groups.ifd1.find((e)=>e.tag===THUMB_OFFSET)?.value;
const len=groups.ifd1.find((e)=>e.tag===THUMB_LENGTH)?.value;
if(typeof at==='number'&&typeof len==='number'&&at>0&&at+len<=bytes.length){
thumbnail=bytes.slice(at,at+len);
}
for(const group of GROUP_ORDER){
groups[group]=groups[group].filter(
(e)=>!POINTER_TAGS[e.tag]&&e.tag!==THUMB_OFFSET&&e.tag!==THUMB_LENGTH,
);
}
return{ok:true,littleEndian,groups,thumbnail};
}
function readU32(raw,at,littleEndian){
if(raw.length<at+4)return 0;
return new DataView(raw.buffer,raw.byteOffset,raw.byteLength).getUint32(at,littleEndian);
}
function decodeValue(entry,le){
const{tag,type,count,raw}=entry;
const view=new DataView(raw.buffer,raw.byteOffset,raw.byteLength);
if(type===TYPE.ASCII)return decodeText(trimNuls(raw)).replace(/\0/g,' ');
if(type===TYPE.BYTE&&XP_TAGS.has(tag)){
return new TextDecoder('utf-16le').decode(trimNulPairs(raw)).replace(/\0/g,'');
}
if(type===TYPE.UNDEFINED){
if(tag===USER_COMMENT)return decodeUserComment(raw);
if(tag===0x9000||tag===0xa000)return decodeText(trimNuls(raw));
return null;
}
const out=[];
const pairs=[];
for(let i=0;i<count;i+=1){
switch(type){
case TYPE.BYTE:out.push(raw[i]);break;
case TYPE.SBYTE:out.push(view.getInt8(i));break;
case TYPE.SHORT:out.push(view.getUint16(i*2,le));break;
case TYPE.SSHORT:out.push(view.getInt16(i*2,le));break;
case TYPE.LONG:out.push(view.getUint32(i*4,le));break;
case TYPE.SLONG:out.push(view.getInt32(i*4,le));break;
case TYPE.FLOAT:out.push(view.getFloat32(i*4,le));break;
case TYPE.DOUBLE:out.push(view.getFloat64(i*8,le));break;
case TYPE.RATIONAL:
case TYPE.SRATIONAL:{
const n=type===TYPE.RATIONAL?view.getUint32(i*8,le):view.getInt32(i*8,le);
const d=type===TYPE.RATIONAL?view.getUint32(i*8+4,le):view.getInt32(i*8+4,le);
pairs.push([n,d]);
out.push(d===0?0:n/d);
break;
}
default:return null;
}
}
if(pairs.length)entry.pairs=count===1?pairs[0]:pairs;
return count===1?out[0]:out;
}
function decodeUserComment(raw){
if(raw.length<=8)return'';
const charset=decodeText(raw.subarray(0,8)).replace(/\0/g,'').trim();
if(charset==='UNICODE'){
const body=trimNulPairs(raw.subarray(8));
const le=body.length>1&&body[1]===0;
return new TextDecoder(le?'utf-16le':'utf-16be').decode(body).replace(/\0/g,'');
}
return decodeText(trimNuls(raw.subarray(8))).replace(/\0/g,'');
}
class Writer{
constructor(littleEndian){
this.le=littleEndian;
this.bytes=new Uint8Array(4096);
this.len=0;
}
reserve(extra){
if(this.len+extra<=this.bytes.length)return;
let size=this.bytes.length*2;
while(size<this.len+extra)size*=2;
const bigger=new Uint8Array(size);
bigger.set(this.bytes.subarray(0,this.len));
this.bytes=bigger;
}
u8(value){this.reserve(1);this.bytes[this.len]=value&0xff;this.len+=1;}
u16(value){
this.reserve(2);
new DataView(this.bytes.buffer).setUint16(this.len,value,this.le);
this.len+=2;
}
u32(value){
this.reserve(4);
new DataView(this.bytes.buffer).setUint32(this.len,value>>>0,this.le);
this.len+=4;
}
write(chunk){this.reserve(chunk.length);this.bytes.set(chunk,this.len);this.len+=chunk.length;}
setU32(at,value){new DataView(this.bytes.buffer).setUint32(at,value>>>0,this.le);}
padToEven(){if(this.len%2)this.u8(0);}
result(){return this.bytes.slice(0,this.len);}
}
function longEntry(tag,value,le){
const raw=new Uint8Array(4);
new DataView(raw.buffer).setUint32(0,value>>>0,le);
return{tag,type:TYPE.LONG,count:1,raw};
}
function writeIfd(w,entries){
const sorted=[...entries].sort((a,b)=>a.tag-b.tag);
w.padToEven();
const start=w.len;
w.u16(sorted.length);
const positions=new Map();
const overflow=[];
for(const entry of sorted){
w.u16(entry.tag);
w.u16(entry.type);
w.u32(entry.count);
const valuePos=w.len;
positions.set(entry.tag,valuePos);
if(entry.raw.length<=4){
const padded=new Uint8Array(4);
padded.set(entry.raw);
w.write(padded);
}else{
w.u32(0);
overflow.push({valuePos,raw:entry.raw});
}
}
const nextPos=w.len;
w.u32(0);
for(const item of overflow){
w.padToEven();
w.setU32(item.valuePos,w.len);
w.write(item.raw);
}
return{start,positions,nextPos};
}
export function serializeExif(model){
const le=model.littleEndian!==false;
const groups={};
for(const name of GROUP_ORDER){
groups[name]=(model.groups?.[name]??[]).filter(
(e)=>!POINTER_TAGS[e.tag]&&e.tag!==THUMB_OFFSET&&e.tag!==THUMB_LENGTH,
);
}
const thumbnail=model.thumbnail?.length?model.thumbnail:null;
const hasInterop=groups.interop.length>0;
const hasExif=groups.exif.length>0||hasInterop;
const hasGps=groups.gps.length>0;
const hasIfd1=groups.ifd1.length>0||thumbnail!==null;
if(!groups.ifd0.length&&!hasExif&&!hasGps&&!hasIfd1)return null;
const w=new Writer(le);
w.u8(le?0x49:0x4d);
w.u8(le?0x49:0x4d);
w.u16(42);
w.u32(8);
const ifd0Entries=[...groups.ifd0];
if(hasExif)ifd0Entries.push(longEntry(0x8769,0,le));
if(hasGps)ifd0Entries.push(longEntry(0x8825,0,le));
const ifd0=writeIfd(w,ifd0Entries);
if(hasExif){
const exifEntries=[...groups.exif];
if(hasInterop)exifEntries.push(longEntry(0xa005,0,le));
const exifIfd=writeIfd(w,exifEntries);
w.setU32(ifd0.positions.get(0x8769),exifIfd.start);
if(hasInterop){
const interopIfd=writeIfd(w,groups.interop);
w.setU32(exifIfd.positions.get(0xa005),interopIfd.start);
}
}
if(hasGps){
const gpsIfd=writeIfd(w,groups.gps);
w.setU32(ifd0.positions.get(0x8825),gpsIfd.start);
}
if(hasIfd1){
const ifd1Entries=[...groups.ifd1];
if(thumbnail){
ifd1Entries.push(longEntry(THUMB_OFFSET,0,le));
ifd1Entries.push(longEntry(THUMB_LENGTH,thumbnail.length,le));
}
const ifd1=writeIfd(w,ifd1Entries);
w.setU32(ifd0.nextPos,ifd1.start);
if(thumbnail){
w.padToEven();
w.setU32(ifd1.positions.get(THUMB_OFFSET),w.len);
w.write(thumbnail);
}
}
return w.result();
}
function encodeUtf16(text,littleEndian){
const out=new Uint8Array(text.length*2);
const view=new DataView(out.buffer);
for(let i=0;i<text.length;i+=1)view.setUint16(i*2,text.charCodeAt(i),littleEndian);
return out;
}
function toRationalPair(value,signed){
const limit=signed?2147483647:4294967295;
if(Number.isInteger(value))return[clamp(value,signed,limit),1];
let den=1;
for(let i=0;i<6;i+=1){
den*=10;
const num=value*den;
if(Math.abs(num-Math.round(num))<1e-9)break;
}
const num=Math.round(value*den);
if(Math.abs(num)>limit)return[clamp(Math.round(value),signed,limit),1];
return[clamp(num,signed,limit),den];
}
function clamp(value,signed,limit){
const low=signed?-limit-1:0;
return Math.max(low,Math.min(limit,Math.round(value)));
}
function encodeValue(tag,type,input,le){
const text=input==null?'':String(input);
if(XP_TAGS.has(tag)){
const body=encodeUtf16(text,true);
const raw=new Uint8Array(body.length+2);
raw.set(body);
return{type:TYPE.BYTE,count:raw.length,raw};
}
if(tag===USER_COMMENT){
const ascii=/^[\x20-\x7e\r\n\t]*$/.test(text);
const header=utf8.encode(ascii?'ASCII\0\0\0':'UNICODE\0');
const body=ascii?utf8.encode(text):encodeUtf16(text,le);
const raw=new Uint8Array(header.length+body.length);
raw.set(header);
raw.set(body,header.length);
return{type:TYPE.UNDEFINED,count:raw.length,raw};
}
if(type===TYPE.ASCII){
const body=utf8.encode(text);
const raw=new Uint8Array(body.length+1);
raw.set(body);
return{type:TYPE.ASCII,count:raw.length,raw};
}
const numbers=text.trim().split(/[\s,]+/).filter(Boolean).map(Number);
if(!numbers.length||numbers.some((n)=>!isFinite(n)))return null;
const size=TYPE_SIZES[type]??0;
if(!size)return null;
const raw=new Uint8Array(numbers.length*size);
const view=new DataView(raw.buffer);
numbers.forEach((n,i)=>{
switch(type){
case TYPE.BYTE:raw[i]=clamp(n,false,255);break;
case TYPE.SBYTE:view.setInt8(i,clamp(n,true,127));break;
case TYPE.SHORT:view.setUint16(i*2,clamp(n,false,65535),le);break;
case TYPE.SSHORT:view.setInt16(i*2,clamp(n,true,32767),le);break;
case TYPE.LONG:view.setUint32(i*4,clamp(n,false,4294967295),le);break;
case TYPE.SLONG:view.setInt32(i*4,clamp(n,true,2147483647),le);break;
case TYPE.FLOAT:view.setFloat32(i*4,n,le);break;
case TYPE.DOUBLE:view.setFloat64(i*8,n,le);break;
case TYPE.RATIONAL:{
const[num,den]=toRationalPair(n,false);
view.setUint32(i*8,num,le);
view.setUint32(i*8+4,den,le);
break;
}
case TYPE.SRATIONAL:{
const[num,den]=toRationalPair(n,true);
view.setInt32(i*8,num,le);
view.setInt32(i*8+4,den,le);
break;
}
default:break;
}
});
return{type,count:numbers.length,raw};
}
export function setEntryValue(entry,input,le){
const encoded=encodeValue(entry.tag,entry.type,input,le);
if(!encoded)return false;
entry.type=encoded.type;
entry.count=encoded.count;
entry.raw=encoded.raw;
entry.edited=true;
delete entry.pairs;
entry.value=decodeValue(entry,le);
return true;
}
export function createEntry(tag,type,input,le){
const encoded=encodeValue(tag,type,input,le);
if(!encoded)return null;
const entry={tag,...encoded,value:null,edited:true};
entry.value=decodeValue(entry,le);
return entry;
}
export function isEdited(model){
return GROUP_ORDER.some((g)=>(model.groups?.[g]??[]).some((e)=>e.edited));
}
