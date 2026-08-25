/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{decodeStream,deflate,filterNames}from'./filters.js';
import{isName,name,Name,PdfStream,Ref}from'./objects.js';
const TINY=4*1024;
export const SKIP={
jpx:'JPEG 2000 - no browser can decode it',
jbig2:'JBIG2 - no browser can decode it, and it is already tightly packed',
ccitt:'fax-coded (CCITT) - already about as small as bilevel gets',
cmyk:'CMYK - re-encoding risks shifting print colours',
mask:'a stencil mask - one bit per pixel already',
tiny:'already small enough that re-encoding would only cost quality',
colorspace:'an unusual colour space this tool will not guess at',
unreadable:'the image data would not decode',
unused:'never drawn on any page',
};
export function findImages(doc){
const masks=new Map();
const found=[];
for(const[num,value]of doc.objects){
if(!(value instanceof PdfStream))continue;
if(!isName(doc.get(value.dict,'Subtype'),'Image'))continue;
for(const key of['SMask','Mask']){
const ref=value.dict.get(key);
if(ref instanceof Ref)masks.set(ref.num,num);
}
found.push(describe(doc,num,value));
}
for(const entry of found){
if(masks.has(entry.num)){
entry.isSMask=true;
entry.maskOf=masks.get(entry.num);
}
}
return found.sort((a,b)=>b.bytes-a.bytes);
}
function describe(doc,num,stream){
const{dict}=stream;
const filters=filterNames(dict,(v)=>doc.resolve(v));
const width=Math.round(doc.get(dict,'Width')??0);
const height=Math.round(doc.get(dict,'Height')??0);
const bpc=doc.get(dict,'BitsPerComponent')??8;
const entry={
num,
stream,
width,
height,
bytes:stream.raw.length,
kind:filters.includes('DCTDecode')||filters.includes('DCT')?'jpeg':'raw',
colorSpace:'unknown',
isSMask:false,
maskOf:-1,
skip:'',
};
if(filters.includes('JPXDecode'))entry.skip=SKIP.jpx;
else if(filters.includes('JBIG2Decode'))entry.skip=SKIP.jbig2;
else if(filters.includes('CCITTFaxDecode')||filters.includes('CCF'))entry.skip=SKIP.ccitt;
else if(doc.get(dict,'ImageMask')===true)entry.skip=SKIP.mask;
else if(stream.raw.length<TINY)entry.skip=SKIP.tiny;
else if(!(width>0&&height>0))entry.skip=SKIP.unreadable;
const space=colorSpaceOf(doc,doc.get(dict,'ColorSpace'));
entry.colorSpace=space.label;
entry.components=space.components;
entry.bpc=bpc;
if(!entry.skip&&space.kind==='cmyk')entry.skip=SKIP.cmyk;
if(!entry.skip&&entry.kind==='raw'&&space.kind==='unsupported'){
entry.skip=SKIP.colorspace;
}
return entry;
}
function colorSpaceOf(doc,space,depth=0){
if(depth>4)return{kind:'unsupported',label:'nested',components:0};
if(space instanceof Name){
switch(space.value){
case'DeviceGray':case'CalGray':case'G':
return{kind:'gray',label:'grayscale',components:1};
case'DeviceRGB':case'CalRGB':case'RGB':
return{kind:'rgb',label:'RGB',components:3};
case'DeviceCMYK':case'CMYK':
return{kind:'cmyk',label:'CMYK',components:4};
case'Pattern':
return{kind:'unsupported',label:'pattern',components:0};
default:
return{kind:'unsupported',label:space.value,components:0};
}
}
if(Array.isArray(space)&&space.length){
const family=doc.resolve(space[0]);
const label=family instanceof Name?family.value:'';
if(label==='ICCBased'){
const profile=doc.resolve(space[1]);
const n=profile instanceof PdfStream?doc.get(profile.dict,'N'):3;
if(n===1)return{kind:'gray',label:'grayscale (ICC)',components:1};
if(n===4)return{kind:'cmyk',label:'CMYK (ICC)',components:4};
return{kind:'rgb',label:'RGB (ICC)',components:3};
}
if(label==='Indexed'||label==='I'){
const base=colorSpaceOf(doc,doc.resolve(space[1]),depth+1);
const lookup=doc.resolve(space[3]);
return{
kind:base.kind==='rgb'||base.kind==='gray'?'indexed':'unsupported',
label:`indexed ${base.label}`,
components:1,
base,
lookup,
};
}
if(label==='DeviceN'||label==='Separation'){
return{kind:'unsupported',label:label.toLowerCase(),components:0};
}
return{kind:'unsupported',label:label||'array',components:0};
}
return{kind:'unsupported',label:'unstated',components:0};
}
export async function decodeImage(doc,entry){
const{bytes,remaining}=await decodeStream(entry.stream,(v)=>doc.resolve(v));
if(remaining.length){
if(remaining[0]!=='DCTDecode'&&remaining[0]!=='DCT')return null;
if(jpegComponents(bytes)===4)return null;
return decodeBlob(new Blob([bytes],{type:'image/jpeg'}));
}
return decodeSamples(doc,entry,bytes);
}
async function decodeBlob(blob){
if(typeof createImageBitmap==='function'){
try{
const bitmap=await createImageBitmap(blob);
return{source:bitmap,width:bitmap.width,height:bitmap.height};
}catch{
}
}
const url=URL.createObjectURL(blob);
try{
const img=await new Promise((resolve,reject)=>{
const element=new Image();
element.onload=()=>resolve(element);
element.onerror=()=>reject(new Error('this browser could not decode the image'));
element.src=url;
});
return{source:img,width:img.naturalWidth,height:img.naturalHeight};
}catch{
return null;
}finally{
URL.revokeObjectURL(url);
}
}
async function decodeSamples(doc,entry,bytes){
const{width,height}=entry;
const space=colorSpaceOf(doc,doc.get(entry.stream.dict,'ColorSpace'));
const bpc=entry.bpc===16?16:(entry.bpc||8);
const components=space.components||1;
if(!(width>0&&height>0)||width*height>80e6)return null;
if(space.kind==='unsupported'||space.kind==='cmyk')return null;
const palette=space.kind==='indexed'?await paletteBytes(doc,space):null;
if(space.kind==='indexed'&&!palette)return null;
const rowBytes=Math.ceil((width*components*bpc)/8);
if(bytes.length<rowBytes*height){
return null;
}
const rgba=new Uint8ClampedArray(width*height*4);
rgba.fill(255);
if(space.kind!=='indexed'&&bpc===8&&components===3){
for(let y=0;y<height;y+=1){
let from=y*rowBytes;
let to=y*width*4;
for(let x=0;x<width;x+=1){
rgba[to]=bytes[from];
rgba[to+1]=bytes[from+1];
rgba[to+2]=bytes[from+2];
from+=3;
to+=4;
}
}
}else if(space.kind!=='indexed'&&bpc===8&&components===1){
for(let y=0;y<height;y+=1){
let from=y*rowBytes;
let to=y*width*4;
for(let x=0;x<width;x+=1){
const value=bytes[from];
rgba[to]=value;
rgba[to+1]=value;
rgba[to+2]=value;
from+=1;
to+=4;
}
}
}else{
expandGeneral(bytes,rgba,{
width,height,rowBytes,bpc,components,space,palette,
});
}
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
canvas.getContext('2d').putImageData(new ImageData(rgba,width,height),0,0);
return{source:canvas,width,height};
}
function expandGeneral(bytes,rgba,opts){
const{width,height,rowBytes,bpc,components,space,palette}=opts;
const max=(1<<Math.min(bpc,8))-1;
const scale=bpc===8||bpc===16?1:255/max;
const baseComponents=space.kind==='indexed'
?(space.base.components===1?1:3)
:components;
for(let y=0;y<height;y+=1){
const rowStart=y*rowBytes;
let bitAt=0;
for(let x=0;x<width;x+=1){
const out=(y*width+x)*4;
const sample=(index)=>{
if(bpc===8)return bytes[rowStart+(bitAt>>3)+index];
if(bpc===16)return bytes[rowStart+(bitAt>>3)+index*2];
const bit=bitAt+index*bpc;
const shift=8-bpc-(bit&7);
return(bytes[rowStart+(bit>>3)]>>shift)&max;
};
if(space.kind==='indexed'){
const at=sample(0)*baseComponents;
if(baseComponents===1){
const grey=palette[at]??0;
rgba[out]=grey;rgba[out+1]=grey;rgba[out+2]=grey;
}else{
rgba[out]=palette[at]??0;
rgba[out+1]=palette[at+1]??0;
rgba[out+2]=palette[at+2]??0;
}
}else if(components===1){
const value=sample(0)*scale;
rgba[out]=value;rgba[out+1]=value;rgba[out+2]=value;
}else{
rgba[out]=sample(0)*scale;
rgba[out+1]=sample(1)*scale;
rgba[out+2]=sample(2)*scale;
}
bitAt+=components*bpc;
}
}
}
async function paletteBytes(doc,space){
const lookup=space.lookup;
if(lookup instanceof PdfStream){
try{
const{bytes,remaining}=await decodeStream(lookup,(v)=>doc.resolve(v));
return remaining.length?null:bytes;
}catch{
return null;
}
}
if(lookup&&lookup.bytes instanceof Uint8Array)return lookup.bytes;
return null;
}
function jpegComponents(bytes){
const FRAME=new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,
0xc9,0xca,0xcb,0xcd,0xce,0xcf]);
let at=2;
while(at+4<=bytes.length){
if(bytes[at]!==0xff){at+=1;continue;}
const marker=bytes[at+1];
at+=2;
if(marker===0xd8||marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
if(marker===0xd9||marker===0xda)break;
const length=(bytes[at]<<8)|bytes[at+1];
if(length<2)break;
if(FRAME.has(marker))return bytes[at+7]??3;
at+=length;
}
return 3;
}
export async function reencode(source,{width,height,quality,gray}){
const canvas=document.createElement('canvas');
canvas.width=Math.max(1,Math.round(width));
canvas.height=Math.max(1,Math.round(height));
const ctx=canvas.getContext('2d',{alpha:false});
ctx.imageSmoothingEnabled=true;
ctx.imageSmoothingQuality='high';
ctx.fillStyle='#ffffff';
ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.drawImage(source.source,0,0,canvas.width,canvas.height);
const result=gray
?await grayFlate(ctx,canvas.width,canvas.height)
:await jpegBytes(canvas,quality);
const made=result
?{bytes:result,width:canvas.width,height:canvas.height}
:null;
canvas.width=0;
canvas.height=0;
return made;
}
async function jpegBytes(canvas,quality){
const blob=await new Promise((resolve)=>canvas.toBlob(resolve,'image/jpeg',quality));
if(!blob)return null;
return new Uint8Array(await blob.arrayBuffer());
}
async function grayFlate(ctx,width,height){
const{data}=ctx.getImageData(0,0,width,height);
const gray=new Uint8Array(width*height);
for(let i=0;i<gray.length;i+=1){
gray[i]=data[i*4];
}
try{
return await deflate(gray);
}catch{
return null;
}
}
export function replaceImage(entry,made,{gray}){
const{dict}=entry.stream;
dict.set('Width',made.width);
dict.set('Height',made.height);
dict.set('BitsPerComponent',8);
dict.set('ColorSpace',name(gray?'DeviceGray':'DeviceRGB'));
dict.set('Filter',name(gray?'FlateDecode':'DCTDecode'));
dict.set('Length',made.bytes.length);
dict.delete('DecodeParms');
dict.delete('DP');
dict.delete('Decode');
dict.delete('D');
entry.stream.raw=made.bytes;
}
