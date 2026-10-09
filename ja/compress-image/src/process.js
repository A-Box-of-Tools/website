/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{decode,release,FORMATS,JPEG}from'./codecs.js?v=944001be75';
import{fitToTarget,keepFormat,alternativeFormat,QUALITY_FLOOR}from'./compress.js?v=944001be75';
import{compare,hasTransparency}from'./measure.js?v=944001be75';
import{outName}from'./files.js?v=944001be75';
export function captureSettings({targetBytes,format,allowResize},writable){
return Object.freeze({
targetBytes,format,allowResize,
writable:Object.freeze([...writable]),
});
}
export async function compressOne(item,settings,onStep,{
decode:read=decode,fitToTarget:fit=fitToTarget,score:measure=score,
hasTransparency:transparent=hasTransparency,release:dispose=release,
}={}){
const{targetBytes:target,format:choice,allowResize}=settings;
const writable=new Set(settings.writable);
const base={
item,
name:item.file.name,
before:item.file.size,
size:item.size,
};
if(item.file.size<=target){
return{
...base,
blob:item.file,
after:item.file.size,
mime:item.file.type||JPEG,
untouched:true,
fitted:true,
width:item.size?.width??0,
height:item.size?.height??0,
outName:item.file.name,
};
}
onStep('step.decoding');
const source=await read(item.file);
try{
const alpha=transparent(source.bitmap,source);
const firstMime=choice==='auto'||choice==='keep'
?keepFormat(item.file.type,writable)
:choice;
let winner=await fit(source,{
targetBytes:target,mime:firstMime,allowResize,onStep,
});
let winnerScore=await measure(source,winner);
let encodes=winner.encodes;
const compromised=winner.resized||winner.quality<QUALITY_FLOOR+0.001||!winner.fitted;
if(choice==='auto'&&compromised){
const other=alternativeFormat(firstMime,writable,alpha);
if(other){
onStep('step.trying',{format:FORMATS[other].label});
const rival=await fit(source,{
targetBytes:target,mime:other,allowResize,onStep,
});
const rivalScore=await measure(source,rival);
encodes+=rival.encodes;
if(isBetter(rival,rivalScore,winner,winnerScore)){
winner=rival;
winnerScore=rivalScore;
}
}
}
return{
...base,
blob:winner.blob,
after:winner.blob.size,
mime:winner.mime,
quality:winner.quality,
width:winner.width,
height:winner.height,
resized:winner.resized,
fitted:winner.fitted,
encodes,
changedFormat:winner.mime!==firstMime,
match:winnerScore,
untouched:false,
outName:outName(item.file.name,winner.mime),
};
}finally{
dispose(source.bitmap);
}
}
export async function score(source,candidate,{
decode:read=decode,compare:measure=compare,release:dispose=release,
}={}){
let decoded;
try{
decoded=await read(candidate.blob);
}catch{
return null;
}
try{
return measure(source.bitmap,decoded.bitmap,source);
}finally{
dispose(decoded.bitmap);
}
}
function isBetter(challenger,challengerScore,holder,holderScore){
if(challenger.fitted!==holder.fitted)return challenger.fitted;
if(!challengerScore||!holderScore)return false;
return challengerScore.ssim>holderScore.ssim+0.002;
}
