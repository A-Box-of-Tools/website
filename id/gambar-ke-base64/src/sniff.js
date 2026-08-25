/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const utf8=new TextDecoder('utf-8');
function tag(bytes,at,length=4){
let out='';
for(let i=0;i<length;i+=1)out+=String.fromCharCode(bytes[at+i]??0);
return out;
}
const starts=(bytes,...values)=>values.every((v,i)=>bytes[i]===v);
function brands(bytes){
if(bytes.length<12||tag(bytes,4)!=='ftyp')return[];
const declared=(bytes[0]<<24|bytes[1]<<16|bytes[2]<<8|bytes[3])>>>0;
const size=Math.min(declared,bytes.length);
const found=[tag(bytes,8)];
for(let at=16;at+4<=size;at+=4)found.push(tag(bytes,at));
return found;
}
const UNRENDERABLE='No browser except Safari draws this format, so the URI will be valid and the picture will not appear. Convert it first.';
const TESTS=[
(b)=>starts(b,0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a)
&&{mime:'image/png',label:'PNG'},
(b)=>starts(b,0xff,0xd8,0xff)
&&{mime:'image/jpeg',label:'JPEG'},
(b)=>(tag(b,0,6)==='GIF87a'||tag(b,0,6)==='GIF89a')
&&{mime:'image/gif',label:'GIF'},
(b)=>tag(b,0)==='RIFF'&&tag(b,8)==='WEBP'
&&{mime:'image/webp',label:'WebP'},
(b)=>starts(b,0x42,0x4d)
&&{mime:'image/bmp',label:'BMP'},
(b)=>starts(b,0x00,0x00,0x01,0x00)
&&{mime:'image/x-icon',label:'ICO'},
(b)=>brands(b).some((brand)=>brand==='avif'||brand==='avis')
&&{mime:'image/avif',label:'AVIF'},
(b)=>brands(b).some((brand)=>/^(heic|heix|hevc|hevx|mif1|msf1)$/.test(brand))
&&{mime:'image/heic',label:'HEIC',note:UNRENDERABLE},
(b)=>(starts(b,0xff,0x0a)
||starts(b,0x00,0x00,0x00,0x0c,0x4a,0x58,0x4c,0x20,0x0d,0x0a,0x87,0x0a))
&&{mime:'image/jxl',label:'JPEG XL'},
(b)=>(starts(b,0x49,0x49,0x2a,0x00)||starts(b,0x4d,0x4d,0x00,0x2a))
&&{mime:'image/tiff',label:'TIFF',note:UNRENDERABLE},
(b)=>looksLikeSvg(b)&&{mime:'image/svg+xml',label:'SVG'},
];
export function looksLikeSvg(bytes){
let head=utf8.decode(bytes.subarray(0,1024));
if(head.charCodeAt(0)===0xfeff)head=head.slice(1);
for(let guard=0;guard<32;guard+=1){
head=head.trimStart();
if(head.startsWith('<svg'))return true;
if(head.startsWith('<!--')){
const end=head.indexOf('-->');
if(end<0)return false;
head=head.slice(end+3);
continue;
}
if(head.startsWith('<?')||head.startsWith('<!')){
const end=head.indexOf('>');
if(end<0)return false;
head=head.slice(end+1);
continue;
}
return false;
}
return false;
}
export function sniff(bytes){
for(const test of TESTS){
const hit=test(bytes);
if(hit)return hit;
}
return null;
}
export function extensionType(name){
const ext=/\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase();
return ext?EXTENSIONS[ext]??null:null;
}
const EXTENSIONS={
png:'image/png',
jpg:'image/jpeg',
jpeg:'image/jpeg',
jpe:'image/jpeg',
gif:'image/gif',
webp:'image/webp',
bmp:'image/bmp',
ico:'image/x-icon',
cur:'image/x-icon',
avif:'image/avif',
heic:'image/heic',
heif:'image/heic',
jxl:'image/jxl',
tif:'image/tiff',
tiff:'image/tiff',
svg:'image/svg+xml',
};
