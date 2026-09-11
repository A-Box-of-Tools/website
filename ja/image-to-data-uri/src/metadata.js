/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const ascii=(bytes,at,text)=>{
for(let i=0;i<text.length;i+=1){
if(bytes[at+i]!==text.charCodeAt(i))return false;
}
return true;
};
const tag=(bytes,at)=>String.fromCharCode(
bytes[at]??0,bytes[at+1]??0,bytes[at+2]??0,bytes[at+3]??0,
);
const u32be=(b,at)=>((b[at]<<24|b[at+1]<<16|b[at+2]<<8|b[at+3])>>>0);
const u32le=(b,at)=>((b[at+3]<<24|b[at+2]<<16|b[at+1]<<8|b[at])>>>0);
export function metadata(bytes,mime){
if(mime==='image/jpeg')return jpeg(bytes);
if(mime==='image/png')return png(bytes);
if(mime==='image/webp')return webp(bytes);
return null;
}
export const INSPECTS=['image/jpeg','image/png','image/webp'];
function found(hits){
const kinds=[...new Set(hits.map((hit)=>hit.kind))];
const bytes=hits.reduce((sum,hit)=>sum+hit.bytes,0);
return bytes?{bytes,kinds}:null;
}
function jpeg(bytes){
if(!(bytes[0]===0xff&&bytes[1]===0xd8))return null;
const hits=[];
let at=2;
while(at+4<=bytes.length){
if(bytes[at]!==0xff)break;
const marker=bytes[at+1];
if(marker===0xff){at+=1;continue;}
if(marker===0xd8||marker===0x01||(marker>=0xd0&&marker<=0xd7)){
at+=2;
continue;
}
if(marker===0xda||marker===0xd9)break;
const length=(bytes[at+2]<<8)|bytes[at+3];
if(length<2)break;
const body=at+4;
const kind=jpegKind(bytes,marker,body);
if(kind)hits.push({kind,bytes:length+2});
at+=2+length;
}
return found(hits);
}
function jpegKind(bytes,marker,body){
if(marker===0xe1){
if(ascii(bytes,body,'Exif\0\0'))return'kind.exif';
if(ascii(bytes,body,'http://ns.adobe.com/xap/1.0/\0'))return'kind.xmp';
return null;
}
if(marker===0xe2&&ascii(bytes,body,'ICC_PROFILE\0'))return'kind.icc';
if(marker===0xed&&ascii(bytes,body,'Photoshop 3.0\0'))return'kind.iptc';
if(marker===0xfe)return'kind.comment';
return null;
}
const PNG_CHUNKS={
eXIf:'kind.exif',
iTXt:'kind.text',
tEXt:'kind.text',
zTXt:'kind.text',
iCCP:'kind.icc',
tIME:'kind.time',
};
function png(bytes){
const hits=[];
let at=8;
while(at+12<=bytes.length){
const length=u32be(bytes,at);
const type=tag(bytes,at+4);
const kind=type==='iTXt'&&ascii(bytes,at+8,'XML:com.adobe.xmp\0')
?'kind.xmp'
:PNG_CHUNKS[type];
if(kind)hits.push({kind,bytes:length+12});
if(type==='IEND')break;
at+=length+12;
}
return found(hits);
}
const WEBP_CHUNKS={
EXIF:'kind.exif',
'XMP ':'kind.xmp',
ICCP:'kind.icc',
};
function webp(bytes){
const hits=[];
let at=12;
while(at+8<=bytes.length){
const type=tag(bytes,at);
const size=u32le(bytes,at+4);
const kind=WEBP_CHUNKS[type];
if(kind)hits.push({kind,bytes:size+8});
at+=8+size+(size%2);
}
return found(hits);
}
