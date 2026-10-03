/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const LITTLE=0x4949;
const MAKE=0x010f;
const MODEL=0x0110;
const ORIENTATION=0x0112;
const EXIF_IFD=0x8769;
const GPS_IFD=0x8825;
const DATE_TIME_ORIGINAL=0x9003;
const DATE_TIME=0x0132;
const ASCII=2;
const SHORT=3;
const ENTRY=12;
const MAX_SEGMENT=0xfffd;
const EXIF_ID=[0x45,0x78,0x69,0x66,0x00,0x00];
function reader(tiff){
if(tiff.length<8)return null;
const view=new DataView(tiff.buffer,tiff.byteOffset,tiff.byteLength);
const order=view.getUint16(0);
const little=order===LITTLE;
if(!little&&order!==0x4d4d)return null;
if(view.getUint16(2,little)!==42)return null;
return{
view,
little,
u16:(at)=>view.getUint16(at,little),
u32:(at)=>view.getUint32(at,little),
first:view.getUint32(4,little),
};
}
function directories(tiff,read){
const found=[];
let at=read.first;
while(at>0&&at+2<=tiff.length&&found.length<4){
const count=read.u16(at);
const end=at+2+count*ENTRY;
if(end+4>tiff.length)break;
found.push({at,count});
at=read.u32(end);
}
return found;
}
function entries(read,directory,visit){
for(let i=0;i<directory.count;i+=1){
const at=directory.at+2+i*ENTRY;
visit({
tag:read.u16(at),
type:read.u16(at+2),
count:read.u32(at+4),
value:at+8,
});
}
}
function text(tiff,read,entry){
if(entry.type!==ASCII||entry.count===0)return'';
const size=entry.count;
const at=size<=4?entry.value:read.u32(entry.value);
if(at+size>tiff.length)return'';
let out='';
for(let i=0;i<size;i+=1){
const code=tiff[at+i];
if(code===0)break;
out+=String.fromCharCode(code);
}
return out.trim();
}
export function describeExif(tiff){
const nothing={present:false,camera:'',taken:'',gps:false,bytes:0};
if(!tiff)return nothing;
const read=reader(tiff);
if(!read)return nothing;
let make='';
let model='';
let taken='';
let gps=false;
let exifAt=0;
const all=directories(tiff,read);
if(all.length===0)return nothing;
entries(read,all[0],(entry)=>{
if(entry.tag===MAKE)make=text(tiff,read,entry);
else if(entry.tag===MODEL)model=text(tiff,read,entry);
else if(entry.tag===DATE_TIME)taken=text(tiff,read,entry);
else if(entry.tag===EXIF_IFD)exifAt=read.u32(entry.value);
else if(entry.tag===GPS_IFD){
const at=read.u32(entry.value);
gps=at>0&&at+2<=tiff.length&&read.u16(at)>0;
}
});
if(exifAt>0&&exifAt+2<=tiff.length){
const count=read.u16(exifAt);
if(exifAt+2+count*ENTRY+4<=tiff.length){
entries(read,{at:exifAt,count},(entry)=>{
if(entry.tag===DATE_TIME_ORIGINAL)taken=text(tiff,read,entry)||taken;
});
}
}
const camera=model.toLowerCase().startsWith(make.toLowerCase())&&make
?model
:[make,model].filter(Boolean).join(' ');
return{present:true,camera,taken:readableDate(taken),gps,bytes:tiff.length};
}
function readableDate(stamp){
const match=/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}:\d{2})/.exec(stamp);
return match?`${match[1]}-${match[2]}-${match[3]} ${match[4]}`:stamp;
}
export function uprightExif(tiff){
const copy=tiff.slice();
const read=reader(copy);
if(!read)return copy;
for(const directory of directories(copy,read)){
entries(read,directory,(entry)=>{
if(entry.tag!==ORIENTATION||entry.type!==SHORT||entry.count!==1)return;
read.view.setUint16(entry.value,1,read.little);
});
}
return copy;
}
export function fitsInJpeg(tiff){
return tiff.length+EXIF_ID.length<=MAX_SEGMENT;
}
export function withExif(jpeg,tiff){
const payload=EXIF_ID.length+tiff.length;
const segment=new Uint8Array(4+payload);
segment[0]=0xff;
segment[1]=0xe1;
segment[2]=((payload+2)>>8)&0xff;
segment[3]=(payload+2)&0xff;
segment.set(EXIF_ID,4);
segment.set(tiff,4+EXIF_ID.length);
const at=afterHeader(jpeg);
if(at<0)return jpeg;
const out=new Uint8Array(jpeg.length+segment.length);
out.set(jpeg.subarray(0,at),0);
out.set(segment,at);
out.set(jpeg.subarray(at),at+segment.length);
return out;
}
function afterHeader(jpeg){
if(jpeg.length<4||jpeg[0]!==0xff||jpeg[1]!==0xd8)return-1;
if(jpeg[2]===0xff&&jpeg[3]===0xe0&&jpeg.length>=6){
return 4+((jpeg[4]<<8)|jpeg[5]);
}
return 2;
}
