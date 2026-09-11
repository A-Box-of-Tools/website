/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const BIG_ENDIAN=false;
const IFD0=[
[0x010f,'ascii','Contax'],
[0x0110,'ascii','G2'],
[0x0112,'short',1],
[0x0131,'ascii','abox.tools example'],
[0x0132,'ascii','2026:02:14 16:41:07'],
];
const EXIF_IFD=[
[0x829a,'rational',[1,250]],
[0x829d,'rational',[28,10]],
[0x8827,'short',200],
[0x9003,'ascii','2026:02:14 16:41:07'],
[0x920a,'rational',[45,1]],
[0xa002,'long',1600],
[0xa003,'long',1200],
];
const GPS_IFD=[
[0x0001,'ascii','N'],
[0x0002,'rational3',[[51,1],[28,1],[401,10]]],
[0x0003,'ascii','W'],
[0x0004,'rational3',[[0,1],[0,1],[35,10]]],
];
const TYPE={ascii:2,short:3,long:4,rational:5,rational3:5};
function count(kind,value){
if(kind==='ascii')return value.length+1;
if(kind==='rational3')return 3;
return 1;
}
function inlineSize(kind,value){
if(kind==='ascii')return count(kind,value);
if(kind==='short')return 2;
if(kind==='long')return 4;
if(kind==='rational')return 8;
return 24;
}
function writeIfd(view,at,tiffStart,entries,overflowAt,nextIfd=0){
view.setUint16(at,entries.length,BIG_ENDIAN===false?false:true);
let entry=at+2;
let overflow=overflowAt;
for(const[tag,kind,value]of entries){
view.setUint16(entry,tag,false);
view.setUint16(entry+2,TYPE[kind],false);
view.setUint32(entry+4,count(kind,value),false);
const size=inlineSize(kind,value);
if(size<=4){
if(kind==='ascii'){
for(let i=0;i<value.length;i+=1){
view.setUint8(entry+8+i,value.charCodeAt(i));
}
view.setUint8(entry+8+value.length,0);
}else if(kind==='short'){
view.setUint16(entry+8,value,false);
view.setUint16(entry+10,0,false);
}else{
view.setUint32(entry+8,value,false);
}
}else{
view.setUint32(entry+8,overflow-tiffStart,false);
if(kind==='ascii'){
for(let i=0;i<value.length;i+=1){
view.setUint8(overflow+i,value.charCodeAt(i));
}
view.setUint8(overflow+value.length,0);
overflow+=value.length+1;
}else if(kind==='rational'){
view.setUint32(overflow,value[0],false);
view.setUint32(overflow+4,value[1],false);
overflow+=8;
}else{
for(const[n,d]of value){
view.setUint32(overflow,n,false);
view.setUint32(overflow+4,d,false);
overflow+=8;
}
}
}
entry+=12;
}
view.setUint32(entry,nextIfd,false);
return{end:entry+4,overflow};
}
function app1(){
const buffer=new ArrayBuffer(2048);
const view=new DataView(buffer);
let at=0;
view.setUint16(at,0xffe1,false);at+=2;
const lengthAt=at;at+=2;
for(const c of'Exif'){view.setUint8(at,c.charCodeAt(0));at+=1;}
view.setUint8(at,0);at+=1;
view.setUint8(at,0);at+=1;
const tiff=at;
view.setUint16(at,0x4d4d,false);at+=2;
view.setUint16(at,42,false);at+=2;
view.setUint32(at,8,false);at+=4;
const ifd0=[...IFD0,[0x8769,'long',0],[0x8825,'long',0]]
.sort((a,b)=>a[0]-b[0]);
const ifd0At=tiff+8;
const ifd0Size=2+ifd0.length*12+4;
const exifAt=ifd0At+ifd0Size+128;
const exifSize=2+EXIF_IFD.length*12+4;
const gpsAt=exifAt+exifSize+64;
for(const entry of ifd0){
if(entry[0]===0x8769)entry[2]=exifAt-tiff;
if(entry[0]===0x8825)entry[2]=gpsAt-tiff;
}
writeIfd(view,ifd0At,tiff,ifd0,ifd0At+ifd0Size);
writeIfd(view,exifAt,tiff,EXIF_IFD,exifAt+exifSize);
const gps=writeIfd(view,gpsAt,tiff,GPS_IFD,gpsAt+2+GPS_IFD.length*12+4);
const end=Math.max(gps.overflow,gps.end);
view.setUint16(lengthAt,end-tiff+8,false);
return new Uint8Array(buffer,0,end);
}
export async function withExif(jpeg,name){
const bytes=new Uint8Array(await jpeg.arrayBuffer());
if(bytes[0]!==0xff||bytes[1]!==0xd8)throw new Error('example.notjpeg');
let at=2;
if(bytes[at]===0xff&&bytes[at+1]===0xe0){
at+=2+((bytes[at+2]<<8)|bytes[at+3]);
}
const segment=app1();
const out=new Uint8Array(bytes.length+segment.length);
out.set(bytes.subarray(0,at),0);
out.set(segment,at);
out.set(bytes.subarray(at),at+segment.length);
return new File([out],name,{type:'image/jpeg',lastModified:Date.now()});
}
