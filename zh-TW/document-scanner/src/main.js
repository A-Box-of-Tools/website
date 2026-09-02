/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{readingLabel,wireFilePicker}from'./shared/file-picker.js';
import{makeZip}from'./shared/zip.js';
import{WORKING_EDGE,findPageQuad}from'./detect.js';
import{
clampPoint,copyQuad,orderCorners,outputSize,pageAspect,scaleQuad,wholeFrame,
}from'./geometry.js';
import{turnQuad,warpPage}from'./warp.js';
import{cleanPage}from'./clean.js';
import{encodeImage,encodePage}from'./encode.js';
import{buildDocument}from'./document.js';
import{
coverage,matchPaper,outName,pageName,ratioText,scanQuality,sizeText,stemOf,
}from'./pages.js';
import{Corners}from'./stage.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
loadError:$('load-error'),
stripToolbar:$('strip-toolbar'),
countLabel:$('count-label'),
detectAll:$('detect-all'),
clearAll:$('clear-all'),
strip:$('page-strip'),
editEmpty:$('edit-empty'),
editControls:$('edit-controls'),
stage:$('stage'),
photo:$('photo'),
detectNote:$('detect-note'),
detectOne:$('detect-one'),
wholePhoto:$('whole-photo'),
turnLeft:$('turn-left'),
turnRight:$('turn-right'),
undo:$('undo'),
cleanEmpty:$('clean-empty'),
cleanControls:$('clean-controls'),
scanPreview:$('scan-preview'),
scanBusy:$('scan-busy'),
scanFacts:$('scan-facts'),
modeGroup:$('mode-group'),
strengthRow:$('strength-row'),
strength:$('strength'),
strengthValue:$('strength-value'),
strengthNote:$('strength-note'),
pageSize:$('page-size'),
sizeNote:$('size-note'),
dpiField:$('dpi-field'),
dpi:$('dpi'),
marginField:$('margin-field'),
margin:$('margin'),
maxSide:$('max-side'),
quality:$('quality'),
qualityValue:$('quality-value'),
qualityField:$('quality-field'),
title:$('title'),
savePdf:$('save-pdf'),
saveImages:$('save-images'),
busy:$('busy'),
result:$('result'),
resultFacts:$('result-facts'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const EDIT_EDGE=1000;
const PREVIEW_EDGE=900;
const HISTORY=40;
let pages=[];
let current=0;
let resultUrl=null;
let busy=false;
let previewToken=0;
let previewTimer=0;
const corners=new Corners(el.stage,{
onChange:(index,point)=>moveCorner(index,point),
onGestureStart:()=>snapshot(),
cornerOf:(index)=>pages[current]?.quad[index]??{x:0,y:0},
describe:(index)=>describeCorner(index),
});
async function decode(file){
if(typeof createImageBitmap==='function'){
try{
const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
return{bitmap,width:bitmap.width,height:bitmap.height};
}catch{
}
}
const url=URL.createObjectURL(file);
try{
const image=await new Promise((resolve,reject)=>{
const element=new Image();
element.onload=()=>resolve(element);
element.onerror=()=>reject(new Error('undecodable'));
element.src=url;
});
return{bitmap:image,width:image.naturalWidth,height:image.naturalHeight};
}finally{
URL.revokeObjectURL(url);
}
}
function shrinkTo(bitmap,width,height,edge){
const scale=edge>0?Math.min(1,edge/Math.max(width,height)):1;
const canvas=document.createElement('canvas');
canvas.width=Math.max(1,Math.round(width*scale));
canvas.height=Math.max(1,Math.round(height*scale));
const context=canvas.getContext('2d',{willReadFrequently:true});
context.imageSmoothingEnabled=true;
context.imageSmoothingQuality='high';
context.drawImage(bitmap,0,0,canvas.width,canvas.height);
return canvas;
}
async function addFiles(files){
clearError();
const wanted=files.filter((file)=>/^image\//i.test(file.type)||/\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name));
if(!wanted.length)return;
picker.busy(readingLabel(wanted.length));
const started=pages.length;
for(const file of wanted){
try{
const decoded=await decode(file);
pages.push(preparePage(file,decoded));
decoded.bitmap.close?.();
}catch{
showError(phrase('error.decode',{name:file.name}));
}
refresh();
await new Promise((resolve)=>setTimeout(resolve,0));
}
picker.done();
if(pages.length>started)select(started);
refresh();
schedulePreview();
}
function preparePage(file,decoded){
const preview=shrinkTo(decoded.bitmap,decoded.width,decoded.height,EDIT_EDGE);
const page={
file,
name:file.name,
width:decoded.width,
height:decoded.height,
preview,
scale:decoded.width/preview.width,
quad:wholeFrame(decoded.width,decoded.height),
found:false,
reason:'detect.nothing',
edited:false,
history:[],
};
detect(page);
return page;
}
function detect(page){
const working=shrinkTo(page.preview,page.preview.width,page.preview.height,WORKING_EDGE);
const context=working.getContext('2d',{willReadFrequently:true});
const image=context.getImageData(0,0,working.width,working.height);
const found=findPageQuad(image);
const up=page.width/working.width;
page.quad=scaleQuad(found.quad,up).map((point)=>clampPoint(point,page.width,page.height));
page.found=found.found;
page.reason=found.reason;
page.edited=false;
page.history=[];
working.width=0;
working.height=0;
}
function select(index){
current=Math.min(pages.length-1,Math.max(0,index));
refresh();
schedulePreview();
}
function removePage(index){
pages.splice(index,1);
if(current>=pages.length)current=Math.max(0,pages.length-1);
refresh();
schedulePreview();
}
function movePage(index,by){
const to=index+by;
if(to<0||to>=pages.length)return;
[pages[index],pages[to]]=[pages[to],pages[index]];
current=to;
refresh();
}
function renderStrip(){
el.strip.replaceChildren(...pages.map((page,index)=>{
const item=document.createElement('li');
item.className=`page-tile${index === current ? ' selected' : ''}`;
const choose=document.createElement('button');
choose.type='button';
choose.className='tile-choose';
choose.setAttribute('aria-label',phrase('page.select',{index:index+1}));
choose.setAttribute('aria-pressed',String(index===current));
choose.addEventListener('click',()=>select(index));
const thumb=document.createElement('canvas');
thumb.className='tile-thumb';
drawThumb(thumb,page);
choose.append(thumb);
const badge=document.createElement('span');
badge.className='tile-badge';
badge.textContent=String(index+1);
choose.append(badge);
if(!page.found&&!page.edited){
const warn=document.createElement('span');
warn.className='tile-warn';
warn.textContent='?';
warn.title=phrase(page.reason);
choose.append(warn);
}
item.append(choose);
const actions=document.createElement('div');
actions.className='tile-actions';
actions.append(
tileButton('‹',phrase('page.earlier',{index:index+1}),()=>movePage(index,-1),index===0),
tileButton('›',phrase('page.later',{index:index+1}),()=>movePage(index,1),index===pages.length-1),
tileButton('×',phrase('page.remove',{index:index+1}),()=>removePage(index),false,'danger'),
);
item.append(actions);
return item;
}));
}
function tileButton(glyph,label,onClick,disabled,extra=''){
const button=document.createElement('button');
button.type='button';
button.className=`tile-button ${extra}`.trim();
button.textContent=glyph;
button.setAttribute('aria-label',label);
button.disabled=disabled;
button.addEventListener('click',onClick);
return button;
}
function drawThumb(canvas,page){
const edge=96;
const scale=Math.min(edge/page.preview.width,edge/page.preview.height);
canvas.width=Math.max(1,Math.round(page.preview.width*scale));
canvas.height=Math.max(1,Math.round(page.preview.height*scale));
const context=canvas.getContext('2d');
context.drawImage(page.preview,0,0,canvas.width,canvas.height);
const shrink=canvas.width/page.width;
context.beginPath();
page.quad.forEach((point,index)=>{
const x=point.x*shrink;
const y=point.y*shrink;
if(index===0)context.moveTo(x,y);
else context.lineTo(x,y);
});
context.closePath();
context.lineWidth=2;
context.strokeStyle=page.found?'rgba(64, 220, 160, 0.95)':'rgba(255, 190, 80, 0.95)';
context.stroke();
}
function snapshot(){
const page=pages[current];
if(!page)return;
page.history.push(copyQuad(page.quad));
if(page.history.length>HISTORY)page.history.shift();
el.undo.disabled=false;
}
function moveCorner(index,point){
const page=pages[current];
if(!page)return;
const quad=copyQuad(page.quad);
quad[index]=clampPoint(point,page.width,page.height);
page.quad=orderCorners(quad);
page.edited=true;
drawCorners();
schedulePreview();
}
function undo(){
const page=pages[current];
const previous=page?.history.pop();
if(!previous)return;
page.quad=previous;
el.undo.disabled=!page.history.length;
refresh();
schedulePreview();
}
function describeCorner(index){
const page=pages[current];
const point=page?.quad[index]??{x:0,y:0};
return phrase('corner.at',{
corner:phrase(['corner.tl','corner.tr','corner.br','corner.bl'][index]),
x:Math.round(point.x),
y:Math.round(point.y),
});
}
function refresh(){
const page=pages[current];
const any=pages.length>0;
el.stripToolbar.hidden=!any;
el.editControls.hidden=!any;
el.editEmpty.hidden=any;
el.cleanControls.hidden=!any;
el.cleanEmpty.hidden=any;
el.savePdf.disabled=!any||busy;
el.saveImages.disabled=!any||busy;
el.countLabel.textContent=any
?phrase(pages.length===1?'page.count':'page.counts',{count:pages.length})
:'';
renderStrip();
if(!page)return;
el.stage.style.aspectRatio=`${page.width} / ${page.height}`;
el.photo.width=page.preview.width;
el.photo.height=page.preview.height;
el.photo.getContext('2d').drawImage(page.preview,0,0);
corners.setSource(page.width,page.height);
drawCorners();
}
function drawCorners(){
const page=pages[current];
if(!page)return;
corners.render(page.quad,{unsure:!page.found&&!page.edited});
el.detectNote.textContent=page.edited?phrase('detect.edited'):phrase(page.reason);
el.detectNote.className=`hint-line${page.found || page.edited ? '' : ' warn-line'}`;
el.undo.disabled=!page.history.length;
}
function schedulePreview(){
window.clearTimeout(previewTimer);
previewTimer=window.setTimeout(renderPreview,120);
}
async function renderPreview(){
const page=pages[current];
if(!page)return;
const token=previewToken+1;
previewToken=token;
el.scanBusy.hidden=false;
await new Promise((resolve)=>setTimeout(resolve,0));
if(previewToken!==token)return;
try{
const quad=scaleQuad(page.quad,1/page.scale);
const shape=pageAspect(quad,page.preview.width,page.preview.height);
const size=outputSize(quad,shape.aspect,PREVIEW_EDGE);
const source=page.preview
.getContext('2d',{willReadFrequently:true})
.getImageData(0,0,page.preview.width,page.preview.height);
const flat=warpPage(source,quad,size);
const cleaned=cleanPage(flat,settings());
if(previewToken!==token)return;
el.scanPreview.width=cleaned.width;
el.scanPreview.height=cleaned.height;
el.scanPreview.getContext('2d')
.putImageData(new ImageData(cleaned.data,cleaned.width,cleaned.height),0,0);
describeScan(page,shape);
renderStrip();
}catch(error){
showError(phrase('error.failed',{detail:phrase(error.message)}));
}finally{
if(previewToken===token)el.scanBusy.hidden=true;
}
}
function describeScan(page,shape){
const quad=page.quad;
const size=outputSize(quad,shape.aspect,Number(el.maxSide.value)||0);
const paper=matchPaper(shape.aspect);
const quality=scanQuality(size.width,shape.aspect);
const share=Math.round(coverage(quad,page.width,page.height)*100);
const lines=[
paper
?phrase(paper.landscape?'shape.sideways':'shape.known',{
ratio:ratioText(shape.aspect),
paper:phrase(paper.key),
})
:phrase('shape.unknown',{ratio:ratioText(shape.aspect)}),
phrase(`method.${shape.method}`),
quality
?phrase(quality.key,{width:size.width,height:size.height,dpi:quality.dpi})
:phrase('quality.pixels',{width:size.width,height:size.height}),
phrase(share<25?'coverage.small':'coverage.note',{percent:share}),
];
el.scanFacts.replaceChildren(...lines.map((line)=>{
const item=document.createElement('li');
item.textContent=line;
return item;
}));
}
function settings(){
return{
mode:el.modeGroup.querySelector('input[name="mode"]:checked')?.value??'colour',
strength:Number(el.strength.value),
pageSize:el.pageSize.value,
dpi:Number(el.dpi.value),
margin:Number(el.margin.value),
maxSide:Number(el.maxSide.value),
quality:Number(el.quality.value)/100,
title:el.title.value,
};
}
function showSettingNotes(){
const mode=settings().mode;
el.strengthRow.hidden=mode==='photo';
el.strengthNote.hidden=mode==='photo';
el.qualityField.hidden=mode==='mono';
const strength=Number(el.strength.value);
el.strengthValue.textContent=String(strength);
el.strengthNote.textContent=phrase(
strength<34?'strength.gentle':(strength>66?'strength.hard':'strength.middling'),
);
const fit=el.pageSize.value==='fit';
el.dpiField.hidden=!fit;
el.marginField.hidden=fit;
el.sizeNote.textContent=fit
?phrase('size.fit')
:phrase('size.named',{name:el.pageSize.selectedOptions[0].textContent.split('—')[0].trim()});
el.qualityValue.textContent=`${el.quality.value}%`;
}
async function renderFull(page,options){
const decoded=await decode(page.file);
try{
const quad=page.quad;
const shape=pageAspect(quad,page.width,page.height);
const size=outputSize(quad,shape.aspect,options.maxSide);
const longestEdge=Math.max(
Math.hypot(quad[1].x-quad[0].x,quad[1].y-quad[0].y),
Math.hypot(quad[2].x-quad[3].x,quad[2].y-quad[3].y),
Math.hypot(quad[3].x-quad[0].x,quad[3].y-quad[0].y),
Math.hypot(quad[2].x-quad[1].x,quad[2].y-quad[1].y),
);
const wanted=Math.max(size.width,size.height);
const factor=Math.min(1,(wanted*1.1)/Math.max(1,longestEdge));
const canvas=shrinkTo(
decoded.bitmap,page.width,page.height,Math.max(page.width,page.height)*factor,
);
const context=canvas.getContext('2d',{willReadFrequently:true});
const source=context.getImageData(0,0,canvas.width,canvas.height);
const applied=canvas.width/page.width;
canvas.width=0;
canvas.height=0;
const flat=warpPage(source,scaleQuad(quad,applied),size);
return cleanPage(flat,options);
}finally{
decoded.bitmap.close?.();
}
}
async function savePdf(){
await run(async(report)=>{
const options=settings();
const encoded=[];
for(const[index,page]of pages.entries()){
report(phrase('busy.page',{done:index+1,total:pages.length}));
const cleaned=await renderFull(page,options);
encoded.push(await encodePage(cleaned,options));
await new Promise((resolve)=>setTimeout(resolve,0));
}
report(phrase('busy.writing'));
const blob=buildDocument(encoded,options);
const name=outName(stemOf(pages[0].name),'pdf');
const mono=options.mode==='mono';
show(blob,name,[
phrase('result.pdf',{
name,
size:sizeText(blob.size),
pages:phrase(pages.length===1?'page.count':'page.counts',{count:pages.length}),
}),
phrase(mono?'result.mono':'result.jpeg'),
phrase('result.clean'),
]);
});
}
async function saveImages(){
await run(async(report)=>{
const options=settings();
const stem=stemOf(pages[0].name);
const files=[];
let extension='jpg';
for(const[index,page]of pages.entries()){
report(phrase('busy.page',{done:index+1,total:pages.length}));
const cleaned=await renderFull(page,options);
const written=await encodeImage(cleaned,options);
extension=written.extension;
files.push({
name:pageName(stem,index,pages.length,written.extension),
blob:written.blob,
});
await new Promise((resolve)=>setTimeout(resolve,0));
}
if(files.length===1){
show(files[0].blob,files[0].name,[
phrase('result.images',{
name:files[0].name,
size:sizeText(files[0].blob.size),
pages:phrase('page.count',{count:1}),
}),
]);
return;
}
const zip=makeZip(await Promise.all(files.map(async({name,blob})=>({
name,
data:new Uint8Array(await blob.arrayBuffer()),
}))));
const name=outName(stem,'zip');
show(zip,name,[
phrase('result.images',{
name,
size:sizeText(zip.size),
pages:phrase('page.counts',{count:files.length}),
}),
phrase(extension==='png'?'result.png':'result.jpeg'),
]);
});
}
async function run(work){
if(busy||!pages.length){
if(!pages.length)showError(phrase('error.none'));
return;
}
busy=true;
el.savePdf.disabled=true;
el.saveImages.disabled=true;
el.busy.hidden=false;
clearError();
const report=(text)=>{
el.busy.textContent=text;
};
report(phrase('busy.page',{done:1,total:pages.length}));
try{
await new Promise((resolve)=>setTimeout(resolve,0));
await work(report);
}catch(error){
showError(phrase('error.failed',{detail:phrase(error.message)}));
}finally{
busy=false;
el.busy.hidden=true;
refresh();
}
}
function show(blob,name,facts){
if(resultUrl)URL.revokeObjectURL(resultUrl);
resultUrl=URL.createObjectURL(blob);
el.download.href=resultUrl;
el.download.download=name;
el.resultFacts.replaceChildren(...facts.map((line)=>{
const item=document.createElement('li');
item.textContent=line;
return item;
}));
el.result.hidden=false;
}
function showError(message){
el.loadError.textContent=message;
el.loadError.hidden=false;
}
function clearError(){
el.loadError.textContent='';
el.loadError.hidden=true;
}
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles:(files)=>addFiles(files),
});
el.detectOne.addEventListener('click',()=>{
const page=pages[current];
if(!page)return;
detect(page);
refresh();
schedulePreview();
});
el.detectAll.addEventListener('click',()=>{
for(const page of pages)detect(page);
refresh();
schedulePreview();
});
el.wholePhoto.addEventListener('click',()=>{
const page=pages[current];
if(!page)return;
snapshot();
page.quad=wholeFrame(page.width,page.height);
page.edited=true;
refresh();
schedulePreview();
});
const turn=(times)=>{
const page=pages[current];
if(!page)return;
snapshot();
for(let i=0;i<times;i+=1)page.quad=turnQuad(page.quad);
refresh();
schedulePreview();
};
el.turnRight.addEventListener('click',()=>turn(1));
el.turnLeft.addEventListener('click',()=>turn(3));
el.undo.addEventListener('click',undo);
el.clearAll.addEventListener('click',()=>{
pages=[];
current=0;
refresh();
});
el.modeGroup.addEventListener('change',()=>{
showSettingNotes();
schedulePreview();
});
el.strength.addEventListener('input',()=>{
showSettingNotes();
schedulePreview();
});
el.maxSide.addEventListener('change',()=>renderPreview());
el.pageSize.addEventListener('change',showSettingNotes);
el.quality.addEventListener('input',showSettingNotes);
el.savePdf.addEventListener('click',savePdf);
el.saveImages.addEventListener('click',saveImages);
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
window.addEventListener('error',(event)=>{
showError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
showSettingNotes();
refresh();
document.getElementById('boot-warning')?.remove();
