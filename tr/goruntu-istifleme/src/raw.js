/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const FULL_SIZE_FIRST=['ifd0','sub','jpgfromraw','raf','trak','ifd','prvw'];
export function paged(read,size,pageBytes=1<<16){
const pages=new Map();
function page(index){
let held=pages.get(index);
if(!held){
const at=index*pageBytes;
held=Promise.resolve(read(at,Math.min(pageBytes,size-at)));
pages.set(index,held);
}
return held;
}
return{
size,
async at(offset,length){
if(offset<0||length<0||offset+length>size){
throw new RangeError(`read ${offset}+${length} is outside a ${size}-byte file`);
}
if(length===0)return new Uint8Array(0);
const first=Math.floor(offset/pageBytes);
const last=Math.floor((offset+length-1)/pageBytes);
if(first===last){
const held=await page(first);
const from=offset-first*pageBytes;
return held.subarray(from,from+length);
}
const out=new Uint8Array(length);
let written=0;
for(let index=first;index<=last;index+=1){
const held=await page(index);
const from=Math.max(0,offset-index*pageBytes);
const take=Math.min(held.length-from,length-written);
out.set(held.subarray(from,from+take),written);
written+=take;
}
return out;
},
touched(){
return pages.size*pageBytes;
},
};
}
const TYPE_SIZES=[0,1,1,2,4,8,1,1,2,4,8,4,8];
const TAG={
IMAGE_WIDTH:0x0100,
IMAGE_LENGTH:0x0101,
COMPRESSION:0x0103,
MAKE:0x010f,
MODEL:0x0110,
STRIP_OFFSETS:0x0111,
ORIENTATION:0x0112,
STRIP_BYTE_COUNTS:0x0117,
SUB_IFDS:0x014a,
JPEG_OFFSET:0x0201,
JPEG_LENGTH:0x0202,
JPG_FROM_RAW:0x002e,
};
const JPEG_COMPRESSION=new Set([6,7,0x9c]);
export function tiffHeader(bytes){
let little;
if(bytes[0]===0x49&&bytes[1]===0x49)little=true;
else if(bytes[0]===0x4d&&bytes[1]===0x4d)little=false;
else return null;
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
const magic=view.getUint16(2,little);
if(magic!==42&&magic!==0x55&&magic!==0x4f52&&magic!==0x524f)return null;
const first=view.getUint32(4,little);
if(first<8)return null;
return{little,first};
}
async function readDirectory(file,base,at,little){
const head=await file.at(base+at,2);
const count=new DataView(head.buffer,head.byteOffset,2).getUint16(0,little);
if(count===0||count>4096)return null;
if(base+at+2+count*12+4>file.size)return null;
const bytes=await file.at(base+at+2,count*12+4);
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
const entries=new Map();
for(let i=0;i<count;i+=1){
const start=i*12;
const tag=view.getUint16(start,little);
const type=view.getUint16(start+2,little);
const length=view.getUint32(start+4,little);
const width=TYPE_SIZES[type]??0;
if(!width||length>0xffffff)continue;
const needed=width*length;
entries.set(tag,{
type,
count:length,
at:needed<=4
?base+at+2+start+8
:base+view.getUint32(start+8,little),
bytes:needed,
});
}
return{entries,next:view.getUint32(count*12,little)};
}
async function number(file,entry,little,index=0){
if(!entry||index>=entry.count)return null;
const width=TYPE_SIZES[entry.type];
if(entry.at+(index+1)*width>file.size)return null;
const bytes=await file.at(entry.at+index*width,width);
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
switch(entry.type){
case 1:case 7:return view.getUint8(0);
case 3:return view.getUint16(0,little);
case 4:case 13:return view.getUint32(0,little);
case 8:return view.getInt16(0,little);
case 9:return view.getInt32(0,little);
default:return null;
}
}
async function text(file,entry){
if(!entry||entry.type!==2||entry.count>128)return null;
if(entry.at+entry.count>file.size)return null;
const bytes=await file.at(entry.at,entry.count);
let end=bytes.length;
while(end>0&&bytes[end-1]===0)end-=1;
return new TextDecoder('latin1').decode(bytes.subarray(0,end)).trim()||null;
}
async function candidatesIn(file,dir,base,little,from){
const found=[];
const{entries}=dir;
const width=await number(file,entries.get(TAG.IMAGE_WIDTH),little);
const height=await number(file,entries.get(TAG.IMAGE_LENGTH),little);
const offset=entries.get(TAG.JPEG_OFFSET);
const length=entries.get(TAG.JPEG_LENGTH);
if(offset&&length){
const at=await number(file,offset,little);
const size=await number(file,length,little);
if(at&&size)found.push({offset:base+at,length:size,width,height,from});
}
const compression=await number(file,entries.get(TAG.COMPRESSION),little);
const strips=entries.get(TAG.STRIP_OFFSETS);
const counts=entries.get(TAG.STRIP_BYTE_COUNTS);
if(JPEG_COMPRESSION.has(compression)&&strips&&counts&&strips.count===1){
const at=await number(file,strips,little);
const size=await number(file,counts,little);
if(at&&size)found.push({offset:base+at,length:size,width,height,from});
}
const whole=entries.get(TAG.JPG_FROM_RAW);
if(whole&&whole.bytes>1024&&whole.at+whole.bytes<=file.size){
found.push({
offset:whole.at,length:whole.bytes,width:null,height:null,from:'jpgfromraw',
});
}
return found;
}
async function walkTiff(file,base=0){
if(file.size<16)return null;
const header=tiffHeader(await file.at(base,8));
if(!header)return null;
const{little}=header;
const found=[];
const visited=new Set();
const queue=[{at:header.first,from:'ifd0'}];
let meta={make:null,model:null,orientation:1};
while(queue.length&&visited.size<32){
const{at,from}=queue.shift();
if(at<8||base+at+6>file.size||visited.has(at))continue;
visited.add(at);
let dir=null;
try{
dir=await readDirectory(file,base,at,little);
}catch{
continue;
}
if(!dir)continue;
if(from==='ifd0'){
meta={
make:await text(file,dir.entries.get(TAG.MAKE)),
model:await text(file,dir.entries.get(TAG.MODEL)),
orientation:await number(file,dir.entries.get(TAG.ORIENTATION),little)??1,
};
}
found.push(...await candidatesIn(file,dir,base,little,from));
const subs=dir.entries.get(TAG.SUB_IFDS);
if(subs){
for(let i=0;i<Math.min(subs.count,8);i+=1){
const sub=await number(file,subs,little,i);
if(sub)queue.push({at:sub,from:'sub'});
}
}
if(dir.next)queue.push({at:dir.next,from:'ifd'});
}
return{candidates:found,...meta};
}
const RAF_MAGIC='FUJIFILMCCD-RAW ';
async function walkRaf(file){
if(file.size<96)return null;
const head=await file.at(0,96);
if(new TextDecoder('latin1').decode(head.subarray(0,16))!==RAF_MAGIC)return null;
const view=new DataView(head.buffer,head.byteOffset,head.byteLength);
const offset=view.getUint32(84,false);
const length=view.getUint32(88,false);
if(!offset||!length||offset+length>file.size)return null;
return{
candidates:[{offset,length,width:null,height:null,from:'raf',scan:true}],
make:'FUJIFILM',
model:null,
orientation:1,
};
}
const CONTAINERS=new Set(['moov','trak','mdia','minf','stbl']);
async function boxHeader(file,at,end){
if(at+8>end)return null;
const header=await file.at(at,8);
const view=new DataView(header.buffer,header.byteOffset,8);
let size=view.getUint32(0,false);
const type=new TextDecoder('latin1').decode(header.subarray(4,8));
let body=at+8;
if(size===1){
if(at+16>end)return null;
const large=await file.at(at+8,8);
const big=new DataView(large.buffer,large.byteOffset,8);
size=big.getUint32(0,false)*2**32+big.getUint32(4,false);
body=at+16;
}else if(size===0){
size=end-at;
}
if(size<8||at+size>end)return null;
return{type,size,body,end:at+size};
}
async function walkBmff(file){
if(file.size<16)return null;
const head=await file.at(0,12);
if(new TextDecoder('latin1').decode(head.subarray(4,8))!=='ftyp')return null;
const found=[];
async function descend(start,end,depth,tables){
let at=start;
while(at+8<=end&&depth<8){
const box=await boxHeader(file,at,end);
if(!box)return;
if(CONTAINERS.has(box.type)){
await descend(box.body,box.end,depth+1,tables);
}else if(box.type==='uuid'){
await descend(box.body+16,box.end,depth+1,tables);
}else if(tables&&(box.type==='stco'||box.type==='co64'||box.type==='stsz')){
tables[box.type]=box.body;
}else if(box.type==='PRVW'||box.type==='THMB'){
found.push({
offset:box.body,length:box.end-box.body,width:null,height:null,
from:'prvw',scan:true,
});
}
at=box.end;
}
}
let at=0;
while(at+8<=file.size){
const box=await boxHeader(file,at,file.size);
if(!box)break;
if(box.type==='moov'){
let inner=box.body;
while(inner+8<=box.end){
const sub=await boxHeader(file,inner,box.end);
if(!sub)break;
if(sub.type==='trak'){
const tables={};
await descend(sub.body,sub.end,1,tables);
const range=await firstSample(file,tables);
if(range)found.push({...range,width:null,height:null,from:'trak',scan:true});
}else if(sub.type==='uuid'){
await descend(sub.body+16,sub.end,1,null);
}
inner=sub.end;
}
}
at=box.end;
}
if(!found.length)return null;
return{candidates:found,make:'Canon',model:null,orientation:1};
}
async function firstSample(file,tables){
const offsets=tables.stco??tables.co64;
const wide=tables.stco===undefined;
if(offsets===undefined||tables.stsz===undefined)return null;
if(offsets+8+(wide?8:4)>file.size||tables.stsz+12>file.size)return null;
const head=await file.at(offsets,8);
if(new DataView(head.buffer,head.byteOffset,8).getUint32(4,false)<1)return null;
const where=await file.at(offsets+8,wide?8:4);
const view=new DataView(where.buffer,where.byteOffset,where.byteLength);
const offset=wide
?view.getUint32(0,false)*2**32+view.getUint32(4,false)
:view.getUint32(0,false);
const sizeHead=await file.at(tables.stsz,12);
const uniform=new DataView(sizeHead.buffer,sizeHead.byteOffset,12).getUint32(4,false);
let length=uniform;
if(!length){
if(tables.stsz+16>file.size)return null;
const sizes=await file.at(tables.stsz+12,4);
length=new DataView(sizes.buffer,sizes.byteOffset,4).getUint32(0,false);
}
if(!length||offset+length>file.size)return null;
return{offset,length};
}
export function jpegSize(bytes){
let at=2;
while(at+9<bytes.length){
if(bytes[at]!==0xff){at+=1;continue;}
const marker=bytes[at+1];
if(marker===0xff){at+=1;continue;}
if(marker===0xd8||marker===0x01||(marker>=0xd0&&marker<=0xd7)){
at+=2;
continue;
}
if(marker===0xda||marker===0xd9)return null;
const length=(bytes[at+2]<<8)|bytes[at+3];
if(length<2)return null;
const frame=marker>=0xc0&&marker<=0xcf
&&marker!==0xc4&&marker!==0xc8&&marker!==0xcc;
if(frame){
return{
height:(bytes[at+5]<<8)|bytes[at+6],
width:(bytes[at+7]<<8)|bytes[at+8],
};
}
at+=2+length;
}
return null;
}
function findSoi(bytes,within){
const limit=Math.min(bytes.length-3,within);
for(let at=0;at<=limit;at+=1){
if(bytes[at]===0xff&&bytes[at+1]===0xd8&&bytes[at+2]===0xff)return at;
}
return-1;
}
export const RAW_EXTENSIONS=[
'3fr','arw','cr2','cr3','crw','dcr','dng','erf','iiq','kdc','mef',
'mos','mrw','nef','nrw','orf','pef','raf','raw','rw2','rwl','sr2',
'srf','srw','x3f',
];
export function looksRaw(name){
const dot=String(name).lastIndexOf('.');
return dot>=0&&RAW_EXTENSIONS.includes(name.slice(dot+1).toLowerCase());
}
export async function findPreview(read,size,minimumPixels=640*480){
const file=paged(read,size);
let index=null;
for(const walk of[walkTiff,walkRaf,walkBmff]){
try{
index=await walk(file);
}catch{
index=null;
}
if(index&&index.candidates.length)break;
}
if(!index||!index.candidates.length)return null;
const checked=[];
for(const candidate of index.candidates){
if(candidate.length<1024||candidate.offset+candidate.length>size)continue;
let head;
try{
head=await file.at(candidate.offset,Math.min(candidate.length,4096));
}catch{
continue;
}
const start=findSoi(head,candidate.scan?64:0);
if(start<0)continue;
const declared=jpegSize(head.subarray(start));
checked.push({
offset:candidate.offset+start,
length:candidate.length-start,
width:declared?.width??candidate.width??null,
height:declared?.height??candidate.height??null,
from:candidate.from,
});
}
if(!checked.length)return null;
checked.sort((a,b)=>{
const sized=Number(Boolean(b.width&&b.height))-Number(Boolean(a.width&&a.height));
if(sized)return sized;
if(a.width&&b.width)return(b.width*b.height)-(a.width*a.height);
if(b.length!==a.length)return b.length-a.length;
return FULL_SIZE_FIRST.indexOf(a.from)-FULL_SIZE_FIRST.indexOf(b.from);
});
const best=checked[0];
if(best.width&&best.height&&best.width*best.height<minimumPixels)return null;
return{
...best,
make:index.make??null,
model:index.model??null,
orientation:index.orientation??1,
read:file.touched(),
};
}
