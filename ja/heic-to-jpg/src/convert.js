/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{encodePixels,FORMATS,JPEG}from'./codecs.js?v=b168080f3b';
import{readExif}from'./boxes.js?v=b168080f3b';
import{fitsInJpeg,uprightExif,withExif}from'./exif.js?v=b168080f3b';
import{decodeHeic}from'./heif.js?v=b168080f3b';
import{AVIF,decode,encode,release}from'./shared/image-convert.js?v=b168080f3b';
import{outName}from'./files.js?v=b168080f3b';
export function captureBatch(items,{mime,quality,keepExif}){
return{
settings:Object.freeze({mime,quality,keepExif,hasHeic:items.some(item=>!item.avif)}),
batch:Object.freeze(items.map((item)=>Object.freeze({
id:item.id,file:item.file,avif:item.avif,
exif:Object.freeze({...item.exif}),
}))),
};
}
export async function convertOne(item,settings,onStep,{
decodeHeic:readHeic=decodeHeic,encodePixels:writePixels=encodePixels,
readExif:readMetadata=readExif,decode:readBrowser=decode,
encode:writeBrowser=encode,release:dispose=release,
}={}){
const{mime,quality,keepExif}=settings;
if(item.avif){
onStep('step.decoding');
const picture=await readBrowser(new Blob([item.file],{type:AVIF}));
try{
onStep('step.writing.file',{format:FORMATS[mime].label});
const blob=await writeBrowser(picture.bitmap,{
width:picture.width,height:picture.height,mime,quality,background:mime===JPEG?'#ffffff':undefined,
});
return[{
inputId:item.id,name:item.file.name,before:item.file.size,after:blob.size,blob,
mime,quality,width:picture.width,height:picture.height,
metadata:'none',exif:item.exif,part:0,parts:1,
outName:outName(item.file.name,mime),
}];
}finally{dispose(picture.bitmap);}
}
const bytes=new Uint8Array(await item.file.arrayBuffer());
onStep('step.decoding');
const pictures=await readHeic(bytes);
const tiff=keepExif&&mime===JPEG?readMetadata(bytes):null;
const out=[];
for(const[index,picture]of pictures.entries()){
onStep(pictures.length>1?'step.writing.picture':'step.writing.file',
pictures.length>1
?{index:index+1,total:pictures.length}
:{format:FORMATS[mime].label});
let blob=await writePixels(picture,{mime,quality});
let metadata='none';
if(tiff&&picture.primary){
if(fitsInJpeg(tiff)){
const patched=withExif(new Uint8Array(await blob.arrayBuffer()),uprightExif(tiff));
blob=new Blob([patched],{type:JPEG});
metadata='kept';
}else{
metadata='too large';
}
}
out.push({
inputId:item.id,
name:item.file.name,
before:item.file.size,
after:blob.size,
blob,
mime,
quality,
width:picture.width,
height:picture.height,
metadata,
exif:item.exif,
part:pictures.length>1?index+1:0,
parts:pictures.length,
outName:outName(item.file.name,mime,index),
});
}
return out;
}
