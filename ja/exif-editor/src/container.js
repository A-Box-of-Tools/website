/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import*as jpeg from'./jpeg.js';
import*as png from'./png.js';
import*as webp from'./webp.js';
import{parseExif,serializeExif}from'./tiff.js';
const HANDLERS={jpeg,png,webp};
export const KIND_NAMES={jpeg:'JPEG',png:'PNG',webp:'WebP'};
const latin1=new TextDecoder('latin1');
export function sniff(bytes){
if(bytes.length>=3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return'jpeg';
if(bytes.length>=8&&bytes[0]===0x89&&latin1.decode(bytes.subarray(1,4))==='PNG')return'png';
if(bytes.length>=12&&latin1.decode(bytes.subarray(0,4))==='RIFF'
&&latin1.decode(bytes.subarray(8,12))==='WEBP')return'webp';
if(bytes.length>=12&&latin1.decode(bytes.subarray(4,8))==='ftyp'){
const brand=latin1.decode(bytes.subarray(8,12));
if(brand.startsWith('hei')||brand.startsWith('mif'))return'heic';
if(brand.startsWith('avi'))return'avif';
}
if(bytes.length>=4&&latin1.decode(bytes.subarray(0,3))==='GIF')return'gif';
if(bytes.length>=4){
const mark=latin1.decode(bytes.subarray(0,2));
if((mark==='II'&&bytes[2]===0x2a)||(mark==='MM'&&bytes[3]===0x2a))return'tiff';
}
return'unknown';
}
const REFUSALS={
heic:'HEIC is a box format built out of nested atoms, and rewriting one safely needs a different parser from the three here. Convert it to JPEG first - the HEIC to JPG tool on this site does that, and can leave the metadata out on the way.',
avif:'AVIF uses the same box format as HEIC, and the same applies: rewriting one needs a parser this tool does not have yet.',
gif:'GIF has comment and application blocks rather than EXIF, and almost never carries anything personal. It is not handled here.',
tiff:'A bare TIFF is all metadata and all image at once, with the pixels addressed by the same offsets this tool would have to move. Editing one is a different job from editing a photo.',
unknown:'This does not look like a JPEG, PNG or WebP.',
};
export async function readImage(file){
return readBytes(new Uint8Array(await file.arrayBuffer()));
}
export async function readBytes(bytes){
const kind=sniff(bytes);
if(!HANDLERS[kind]){
return{ok:false,kind,error:REFUSALS[kind]??REFUSALS.unknown,bytes};
}
const doc=await HANDLERS[kind].read(bytes);
if(!doc.ok)return{ok:false,kind,error:doc.error,bytes};
const meta=HANDLERS[kind].collect(doc);
let exif=null;
if(meta.exif){
const parsed=parseExif(meta.exif);
exif=parsed.ok?parsed:{ok:false,error:parsed.error};
}
return{ok:true,kind,bytes,doc,meta,exif,size:bytes.length};
}
export function exifBytes(exif){
if(!exif?.ok)return null;
return serializeExif(exif);
}
export function serialize(item,plan){
const handler=HANDLERS[item.kind];
if(!handler)throw new Error('This format cannot be written.');
const doc=cloneDoc(item.doc);
handler.apply(doc,plan);
return handler.write(doc);
}
function cloneDoc(doc){
const copy={...doc};
if(doc.segments)copy.segments=[...doc.segments];
if(doc.chunks)copy.chunks=[...doc.chunks];
return copy;
}
export function outputType(kind){
if(kind==='png')return{mime:'image/png',ext:'png'};
if(kind==='webp')return{mime:'image/webp',ext:'webp'};
return{mime:'image/jpeg',ext:'jpg'};
}
