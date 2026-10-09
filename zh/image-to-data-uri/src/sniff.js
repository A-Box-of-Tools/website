/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{imageBrands}from'./shared/image-convert.js?v=31374723d3';
import{decodeSvgText}from'./shared/svg-text.js?v=31374723d3';
function tag(bytes,at,length=4){
let out='';
for(let i=0;i<length;i+=1)out+=String.fromCharCode(bytes[at+i]??0);
return out;
}
const starts=(bytes,...values)=>values.every((v,i)=>bytes[i]===v);
const UNRENDERABLE='sniff.unrenderable';
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
(b)=>imageBrands(b).some((brand)=>brand==='avif'||brand==='avis')
&&{mime:'image/avif',label:'AVIF'},
(b)=>imageBrands(b).some((brand)=>/^(heic|heix|hevc|hevx|mif1|msf1)$/.test(brand))
&&{mime:'image/heic',label:'HEIC',note:UNRENDERABLE},
(b)=>(starts(b,0xff,0x0a)
||starts(b,0x00,0x00,0x00,0x0c,0x4a,0x58,0x4c,0x20,0x0d,0x0a,0x87,0x0a))
&&{mime:'image/jxl',label:'JPEG XL'},
(b)=>(starts(b,0x49,0x49,0x2a,0x00)||starts(b,0x4d,0x4d,0x00,0x2a))
&&{mime:'image/tiff',label:'TIFF',note:UNRENDERABLE},
(b)=>looksLikeSvg(b)&&{mime:'image/svg+xml',label:'SVG'},
];
export function looksLikeSvg(bytes){
let head=decodeSvgText(bytes.subarray(0,1024));
if(head.charCodeAt(0)===0xfeff)head=head.slice(1);
for(let guard=0;guard<32;guard+=1){
head=head.trimStart();
if(/^<svg[\s/>]/.test(head))return true;
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
