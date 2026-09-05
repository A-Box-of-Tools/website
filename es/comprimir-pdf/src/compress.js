/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{takeInventory}from'./inventory.js?v=3f63a0468a';
import{
decodeImage,findImages,reencode,replaceImage,SKIP,
}from'./images.js?v=3f63a0468a';
import{effectiveDpi,measurePlacements}from'./placements.js?v=3f63a0468a';
import{PdfDocument}from'./shared/pdf-reader.js?v=3f63a0468a';
import{stripMetadata,writeDocument}from'./shared/pdf-writer.js?v=3f63a0468a';
export const PRESETS={
smallest:{dpi:96,quality:0.55},
screen:{dpi:130,quality:0.68},
print:{dpi:220,quality:0.82},
gentle:{dpi:0,quality:0.9},
};
const MIN_PIXELS=32;
export async function compressDocument(bytes,settings,hooks={}){
const{onStage,onProgress,signal}=hooks;
const before=bytes.length;
onStage?.('stage.reading');
const doc=await PdfDocument.open(bytes);
const inventory=takeInventory(doc);
onStage?.('stage.measuring');
const placements=await measurePlacements(doc);
stop(signal);
onStage?.('stage.images');
const images=findImages(doc);
const reports=[];
for(const[index,entry]of images.entries()){
stop(signal);
onProgress?.(index,images.length);
const placement=placements.get(entry.num)??placements.get(entry.maskOf);
reports.push(await handleImage(doc,entry,placement,settings));
await new Promise((resolve)=>setTimeout(resolve,0));
}
onProgress?.(images.length,images.length);
let metadataRemoved=0;
if(settings.stripMeta){
onStage?.('stage.metadata');
metadataRemoved=stripMetadata(doc);
}
onStage?.('stage.writing');
const blob=await writeDocument(doc,{
signal,
onProgress:(done,total)=>onProgress?.(done,total),
});
onStage?.('stage.checking');
const check=await verify(blob,inventory.pages);
return{
blob,
before,
after:blob.size,
inventory,
images:reports,
metadataRemoved,
check,
repaired:doc.repaired,
incremental:doc.incremental,
};
}
function stop(signal){
if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
}
async function handleImage(doc,entry,placement,settings){
const report={
num:entry.num,
before:entry.bytes,
after:entry.bytes,
action:'kept',
note:'',
width:entry.width,
height:entry.height,
dpiBefore:0,
dpiAfter:0,
};
if(entry.skip){
report.note=entry.skip;
return report;
}
if(!placement){
report.note=SKIP.unused;
return report;
}
const dpiBefore=effectiveDpi(entry.width,placement.widthPt);
report.dpiBefore=dpiBefore;
const wanted=settings.dpi>0&&placement.widthPt>0
?Math.round((placement.widthPt/72)*settings.dpi)
:entry.width;
const target=Math.max(MIN_PIXELS,Math.min(entry.width,wanted));
const scale=target/entry.width;
const source=await decodeImage(doc,entry);
if(!source){
report.note=SKIP.unreadable;
return report;
}
try{
const made=await reencode(source,{
width:Math.max(1,Math.round(source.width*scale)),
height:Math.max(1,Math.round(source.height*scale)),
quality:settings.quality,
gray:entry.isSMask,
});
if(!made){
report.note='kept.noencoder';
return report;
}
if(made.bytes.length>=entry.bytes){
report.note='kept.alreadysmall';
return report;
}
replaceImage(entry,made,{gray:entry.isSMask});
report.after=made.bytes.length;
report.width=made.width;
report.height=made.height;
report.dpiAfter=effectiveDpi(made.width,placement.widthPt);
report.action=made.width<entry.width?'downsampled':'recompressed';
return report;
}finally{
if(source.source&&typeof source.source.close==='function')source.source.close();
}
}
async function verify(blob,expectedPages){
try{
const bytes=new Uint8Array(await blob.arrayBuffer());
const reopened=await PdfDocument.open(bytes);
const pages=reopened.countPages();
if(pages!==expectedPages){
return{
ok:false,
text:{key:'check.pages',values:{pages,expected:expectedPages}},
};
}
if(reopened.repaired){
return{ok:false,text:{key:'check.unclean'}};
}
return{
ok:true,
text:{key:pages===1?'check.ok.one':'check.ok.many',values:{pages}},
};
}catch(error){
return{ok:false,text:{key:'check.reopen',values:{detail:error.message}}};
}
}
export function describeSettings(settings){
const quality=Math.round(settings.quality*100);
if(!settings.dpi)return{key:'settings.fullsize',values:{quality}};
return{key:'settings.downsampled',values:{quality,dpi:settings.dpi}};
}
