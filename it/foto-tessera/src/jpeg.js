/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const SOI=0xd8;
const EOI=0xd9;
const SOS=0xda;
const APP0=0xe0;
const COM=0xfe;
const STANDALONE=new Set([0x01,0xd0,0xd1,0xd2,0xd3,0xd4,0xd5,0xd6,0xd7,SOI,EOI]);
const JFIF=[0x4a,0x46,0x49,0x46,0x00];
export const isJpeg=(bytes)=>bytes.length>3&&bytes[0]===0xff&&bytes[1]===SOI;
export function headerSegments(bytes){
const found=[];
if(!isJpeg(bytes))return found;
let at=2;
while(at+3<bytes.length){
if(bytes[at]!==0xff)break;
const marker=bytes[at+1];
if(marker===SOS||marker===EOI)break;
if(STANDALONE.has(marker)){
at+=2;
continue;
}
const length=(bytes[at+2]<<8)|bytes[at+3];
if(length<2)break;
found.push({marker,at,length,dataAt:at+4});
at+=2+length;
}
return found;
}
const isJfif=(bytes,segment)=>(
segment.marker===APP0
&&segment.length>=16
&&JFIF.every((byte,index)=>bytes[segment.dataAt+index]===byte)
);
export function readDensity(bytes){
const jfif=headerSegments(bytes).find((segment)=>isJfif(bytes,segment));
if(!jfif)return null;
const at=jfif.dataAt+7;
const units=bytes[at];
const x=(bytes[at+1]<<8)|bytes[at+2];
const y=(bytes[at+3]<<8)|bytes[at+4];
const dpi=units===1?x:units===2?Math.round(x*2.54):null;
return{units,x,y,dpi};
}
export function setDensity(bytes,dpi){
const density=Math.max(1,Math.min(65535,Math.round(dpi)));
const jfif=headerSegments(bytes).find((segment)=>isJfif(bytes,segment));
if(jfif){
const out=bytes.slice();
const at=jfif.dataAt+7;
out[at]=1;
out[at+1]=(density>>8)&0xff;
out[at+2]=density&0xff;
out[at+3]=(density>>8)&0xff;
out[at+4]=density&0xff;
return out;
}
const segment=Uint8Array.from([
0xff,APP0,0x00,0x10,...JFIF,0x01,0x01,0x01,
(density>>8)&0xff,density&0xff,
(density>>8)&0xff,density&0xff,
0x00,0x00,
]);
return spliceIn(bytes,2,segment);
}
function commentPoint(bytes){
let at=2;
for(const segment of headerSegments(bytes)){
if(segment.marker>=0xe0&&segment.marker<=0xef)at=segment.at+2+segment.length;
else break;
}
return at;
}
const PADDING_NOTE='Padding added by abox.tools so this file meets the minimum '
+'size the form asks for. It is a JPEG comment segment: the picture itself is '
+'unchanged and every decoder skips these bytes. ';
const MAX_COMMENT=65533;
export function padTo(bytes,target){
const needed=Math.ceil(target)-bytes.length;
if(needed<=0||!isJpeg(bytes))return bytes;
const insertAt=commentPoint(bytes);
const pieces=[];
let left=needed;
while(left>0){
const chunk=Math.min(Math.max(left-4,1),MAX_COMMENT);
pieces.push(comment(chunk));
left-=chunk+4;
}
const payload=concat(pieces);
return spliceIn(bytes,insertAt,payload);
}
function comment(size){
const out=new Uint8Array(size+4);
out[0]=0xff;
out[1]=COM;
out[2]=((size+2)>>8)&0xff;
out[3]=(size+2)&0xff;
for(let i=0;i<size;i+=1){
out[4+i]=i<PADDING_NOTE.length?PADDING_NOTE.charCodeAt(i):0x20;
}
return out;
}
export function readComments(bytes){
return headerSegments(bytes)
.filter((segment)=>segment.marker===COM)
.map((segment)=>String.fromCharCode(
...bytes.slice(segment.dataAt,segment.at+2+segment.length),
));
}
function spliceIn(bytes,at,insert){
const out=new Uint8Array(bytes.length+insert.length);
out.set(bytes.subarray(0,at),0);
out.set(insert,at);
out.set(bytes.subarray(at),at+insert.length);
return out;
}
function concat(pieces){
const total=pieces.reduce((sum,piece)=>sum+piece.length,0);
const out=new Uint8Array(total);
let at=0;
for(const piece of pieces){
out.set(piece,at);
at+=piece.length;
}
return out;
}
