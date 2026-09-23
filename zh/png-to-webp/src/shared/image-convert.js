/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const JPEG='image/jpeg';
export const PNG='image/png';
export const WEBP='image/webp';
export const AVIF='image/avif';
export const GIF='image/gif';
export const BMP='image/bmp';
export const FORMATS={
[JPEG]:{label:'JPEG',ext:'jpg',alpha:false,lossy:true},
[PNG]:{label:'PNG',ext:'png',alpha:true,lossy:false},
[WEBP]:{label:'WebP',ext:'webp',alpha:true,lossy:true},
[AVIF]:{label:'AVIF',ext:'avif',alpha:true,lossy:true},
[GIF]:{label:'GIF',ext:'gif',alpha:true,lossy:false},
[BMP]:{label:'BMP',ext:'bmp',alpha:false,lossy:false},
};
function saying(key,values){
const error=new Error(key);
error.values=values;
return error;
}
const ascii=(bytes,at,text)=>text
.split('')
.every((ch,index)=>bytes[at+index]===ch.charCodeAt(0));
export function sniff(bytes){
if(!bytes||bytes.length<12)return null;
if(bytes[0]===0x89&&ascii(bytes,1,'PNG'))return PNG;
if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return JPEG;
if(ascii(bytes,0,'GIF8'))return GIF;
if(bytes[0]===0x42&&bytes[1]===0x4d)return BMP;
if(ascii(bytes,0,'RIFF')&&ascii(bytes,8,'WEBP'))return WEBP;
if(ascii(bytes,4,'ftyp')){
const end=Math.min(bytes.length,64);
for(let at=8;at+4<=end;at+=4){
if(ascii(bytes,at,'avif')||ascii(bytes,at,'avis'))return AVIF;
}
}
return null;
}
export function riffChunks(bytes){
const chunks=[];
if(!bytes||bytes.length<12||!ascii(bytes,0,'RIFF'))return chunks;
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
let at=12;
while(at+8<=bytes.length){
const type=String.fromCharCode(bytes[at],bytes[at+1],bytes[at+2],bytes[at+3]);
const size=view.getUint32(at+4,true);
chunks.push({type,size});
at+=8+size+(size&1);
}
return chunks;
}
export function webpFacts(bytes){
const chunks=riffChunks(bytes);
const has=(type)=>chunks.some((chunk)=>chunk.type===type);
const extended=chunks.length>0&&chunks[0].type==='VP8X';
return{
animated:has('ANIM')||has('ANMF'),
alpha:has('ALPH')||Boolean(extended&&(bytes[20]&0x10)),
lossless:has('VP8L'),
};
}
export async function canEncode(mime){
const canvas=document.createElement('canvas');
canvas.width=1;
canvas.height=1;
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,mime,0.8));
return Boolean(blob)&&blob.type===mime;
}
export async function canDecode(mime,sample){
if(typeof ImageDecoder!=='undefined'&&ImageDecoder.isTypeSupported){
try{
return await ImageDecoder.isTypeSupported(mime);
}catch{
}
}
if(!sample)return true;
try{
const bitmap=await createImageBitmap(new Blob([sample],{type:mime}));
release(bitmap);
return true;
}catch{
return false;
}
}
export async function decode(file){
if(typeof createImageBitmap==='function'){
try{
const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
return{bitmap,width:bitmap.width,height:bitmap.height};
}catch{
}
}
const url=URL.createObjectURL(file);
try{
const img=await new Promise((resolve,reject)=>{
const element=new Image();
element.onload=()=>resolve(element);
element.onerror=()=>reject(saying('error.decode'));
element.src=url;
});
return{bitmap:img,width:img.naturalWidth,height:img.naturalHeight};
}finally{
URL.revokeObjectURL(url);
}
}
export function hasAlpha(bitmap,width,height){
const w=Math.max(1,width);
const full=Math.max(1,height);
const band=Math.max(1,Math.min(full,Math.floor(4194304/w)));
const canvas=document.createElement('canvas');
canvas.width=w;
canvas.height=band;
const ctx=canvas.getContext('2d',{willReadFrequently:true});
let found=false;
for(let top=0;top<full&&!found;top+=band){
const rows=Math.min(band,full-top);
ctx.clearRect(0,0,w,band);
ctx.drawImage(bitmap,0,-top);
const{data}=ctx.getImageData(0,0,w,rows);
for(let at=3;at<data.length;at+=4){
if(data[at]!==255){
found=true;
break;
}
}
}
canvas.width=0;
canvas.height=0;
return found;
}
export async function encode(source,{
width,height,mime,quality,background,
}){
const canvas=document.createElement('canvas');
canvas.width=Math.max(1,Math.round(width));
canvas.height=Math.max(1,Math.round(height));
const opaque=!FORMATS[mime]?.alpha;
const ctx=canvas.getContext('2d',{alpha:!opaque});
ctx.imageSmoothingEnabled=true;
ctx.imageSmoothingQuality='high';
if(opaque||background){
ctx.fillStyle=background||'#ffffff';
ctx.fillRect(0,0,canvas.width,canvas.height);
}
ctx.drawImage(source,0,0,canvas.width,canvas.height);
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,mime,quality));
canvas.width=0;
canvas.height=0;
if(!blob)throw saying('error.encode',{format:FORMATS[mime]?.label??mime});
if(blob.type!==mime){
throw saying('error.wrongtype',{format:FORMATS[mime]?.label??mime});
}
return blob;
}
export async function webpPixelChunk(blob){
let at=12;
while(at+8<=blob.size){
const header=new Uint8Array(await blob.slice(at,at+8).arrayBuffer());
const type=String.fromCharCode(header[0],header[1],header[2],header[3]);
const size=new DataView(header.buffer).getUint32(4,true);
if(type==='VP8L'||type==='VP8 ')return type;
at+=8+size+(size&1);
}
return null;
}
export async function encodeWebp(source,{
width,height,lossless,quality,
}){
const blob=await encode(source,{
width,
height,
mime:WEBP,
quality:lossless?1:quality,
});
return{blob,lossless:(await webpPixelChunk(blob))==='VP8L'};
}
export function release(bitmap){
if(bitmap&&typeof bitmap.close==='function')bitmap.close();
}
export function outName(name,ext){
const stem=name.replace(/\.[^./\\]+$/,'')||'image';
return`${stem}.${ext}`;
}
export function uniqueNames(names){
const seen=new Map();
return names.map((name)=>{
const count=seen.get(name)??0;
seen.set(name,count+1);
if(count===0)return name;
const dot=name.lastIndexOf('.');
const stem=dot===-1?name:name.slice(0,dot);
const tail=dot===-1?'':name.slice(dot);
return`${stem}-${count + 1}${tail}`;
});
}
export function change(before,after){
if(!before)return null;
const delta=Math.round(((before-after)/before)*100);
if(delta===0)return{key:'change.same'};
return delta>0
?{key:'change.smaller',values:{percent:delta}}
:{key:'change.larger',values:{percent:-delta}};
}
