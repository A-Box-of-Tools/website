/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const SEQUENTIAL=new Set([0xc0,0xc1]);
const FRAME=new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,
0xc9,0xca,0xcb,0xcd,0xce,0xcf]);
export function inspectJpeg(bytes){
if(bytes.length<4||bytes[0]!==0xff||bytes[1]!==0xd8)return null;
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
const iccParts=[];
let frame=null;
let orientation=1;
let at=2;
while(at+4<=bytes.length){
if(bytes[at]!==0xff){
at+=1;
continue;
}
const marker=bytes[at+1];
at+=2;
if(marker===0xff){at-=1;continue;}
if(marker===0xd8||marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
if(marker===0xd9||marker===0xda)break;
const length=view.getUint16(at);
if(length<2||at+length>bytes.length)return null;
const body=bytes.subarray(at+2,at+length);
if(FRAME.has(marker)&&!frame){
if(body.length<6)return null;
frame={
sequential:SEQUENTIAL.has(marker),
height:(body[1]<<8)|body[2],
width:(body[3]<<8)|body[4],
components:body[5],
};
}else if(marker===0xe1&&startsWith(body,'Exif\0\0')){
orientation=readOrientation(body.subarray(6))??orientation;
}else if(marker===0xe2&&startsWith(body,'ICC_PROFILE\0')){
iccParts.push({index:body[12],data:body.subarray(14)});
}
at+=length;
}
if(!frame||!frame.width||!frame.height)return null;
return{...frame,orientation,icc:joinIcc(iccParts)};
}
function startsWith(bytes,prefix){
if(bytes.length<prefix.length)return false;
for(let i=0;i<prefix.length;i+=1){
if(bytes[i]!==prefix.charCodeAt(i))return false;
}
return true;
}
function joinIcc(parts){
if(!parts.length)return null;
parts.sort((a,b)=>a.index-b.index);
const total=parts.reduce((sum,part)=>sum+part.data.length,0);
const out=new Uint8Array(total);
let at=0;
for(const part of parts){
out.set(part.data,at);
at+=part.data.length;
}
return out;
}
function readOrientation(tiff){
if(tiff.length<8)return null;
const view=new DataView(tiff.buffer,tiff.byteOffset,tiff.byteLength);
const little=tiff[0]===0x49&&tiff[1]===0x49;
const big=tiff[0]===0x4d&&tiff[1]===0x4d;
if(!little&&!big)return null;
if(view.getUint16(2,little)!==42)return null;
const ifd=view.getUint32(4,little);
if(ifd+2>tiff.length)return null;
const count=view.getUint16(ifd,little);
for(let i=0;i<count;i+=1){
const entry=ifd+2+i*12;
if(entry+12>tiff.length)return null;
if(view.getUint16(entry,little)!==0x0112)continue;
const value=view.getUint16(entry+8,little);
return value>=1&&value<=8?value:null;
}
return null;
}
