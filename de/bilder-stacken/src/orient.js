/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const EXIF_ID=[0x45,0x78,0x69,0x66,0x00,0x00];
const ORIENTATION_TAG=0x0112;
const MATRICES=[
null,
[1,0,0,1],
[-1,0,0,1],
[-1,0,0,-1],
[1,0,0,-1],
[0,1,1,0],
[0,1,-1,0],
[0,-1,-1,0],
[0,-1,1,0],
];
export function*jpegSegments(bytes){
let at=2;
while(at+4<=bytes.length){
if(bytes[at]!==0xff){at+=1;continue;}
const marker=bytes[at+1];
if(marker===0xff){at+=1;continue;}
if(marker===0xd8||marker===0x01||(marker>=0xd0&&marker<=0xd7)){
at+=2;
continue;
}
const length=(bytes[at+2]<<8)|bytes[at+3];
const frame=marker>=0xc0&&marker<=0xcf
&&marker!==0xc4&&marker!==0xc8&&marker!==0xcc;
const final=marker===0xda||marker===0xd9;
yield{
marker,at,length,complete:at+2+length<=bytes.length,frame,final,
};
if(frame||final||length<2)return;
at+=2+length;
}
}
export function jpegOrientation(bytes){
for(const seg of jpegSegments(bytes)){
if(seg.frame||seg.final||seg.length<2)return null;
if(seg.marker!==0xe1){
if(!seg.complete)return undefined;
continue;
}
const start=seg.at+4;
const end=Math.min(seg.at+2+seg.length,bytes.length);
if(start+EXIF_ID.length>bytes.length)return undefined;
if(isExif(bytes,start)){
const found=tiffOrientation(bytes.subarray(start+EXIF_ID.length,end),!seg.complete);
if(found!==null)return found;
}
if(!seg.complete)return undefined;
}
return undefined;
}
function isExif(bytes,at){
return EXIF_ID.every((byte,i)=>bytes[at+i]===byte);
}
function tiffOrientation(tiff,truncated){
const ranOut=()=>(truncated?undefined:null);
if(tiff.length<8)return ranOut();
let little;
if(tiff[0]===0x49&&tiff[1]===0x49)little=true;
else if(tiff[0]===0x4d&&tiff[1]===0x4d)little=false;
else return null;
const view=new DataView(tiff.buffer,tiff.byteOffset,tiff.byteLength);
if(view.getUint16(2,little)!==42)return null;
const first=view.getUint32(4,little);
if(first<8)return null;
if(first+2>tiff.length)return ranOut();
const count=view.getUint16(first,little);
for(let i=0;i<count;i+=1){
const entry=first+2+i*12;
if(entry+12>tiff.length)return ranOut();
if(view.getUint16(entry,little)!==ORIENTATION_TAG)continue;
if(view.getUint16(entry+2,little)!==3||view.getUint32(entry+4,little)!==1){
return null;
}
const value=view.getUint16(entry+8,little);
return value>=1&&value<=8?value:null;
}
return null;
}
export function orientedSize(width,height,orientation){
return orientation>=5&&orientation<=8
?{width:height,height:width}
:{width,height};
}
export function orientationMatrix(orientation){
return MATRICES[orientation]??MATRICES[1];
}
