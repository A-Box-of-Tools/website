/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=86bf417deb';
import{messageBox}from'./shared/message-box.js?v=86bf417deb';
import{readingLabel,wireFilePicker}from'./shared/file-picker.js?v=86bf417deb';
import{throwIfAborted}from'./shared/errors.js?v=86bf417deb';
import{orderedLoads}from'./shared/ordered-loads.js?v=86bf417deb';
import{WORKING_EDGE,findPageQuad}from'./shared/document-detect.js?v=86bf417deb';
import{
clampPoint,copyQuad,orderCorners,outputSize,pageAspect,scaleQuad,wholeFrame,
}from'./shared/document-geometry.js?v=86bf417deb';
import{turnQuad,warpPage}from'./warp.js?v=86bf417deb';
import{cleanPage}from'./clean.js?v=86bf417deb';
import{writeScan}from'./write-scan.js?v=86bf417deb';
import{
coverage,errorDetail,fileSummary,matchPaper,photoBatch,ratioText,scanQuality,sizeText,snapshotPages,
}from'./pages.js?v=86bf417deb';
import{Corners}from'./stage.js?v=86bf417deb';
import{makeExample}from'./example.js?v=86bf417deb';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
example:$('example-button'),
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
saveSettings:$('save-settings'),
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
cancel:$('cancel'),
cancelNote:$('cancel-note'),
result:$('result'),
resultFacts:$('result-facts'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showError,clear:clearError}=messageBox(el.loadError);
const EDIT_EDGE=1000;
const PREVIEW_EDGE=900;
const HISTORY=40;
let pages=[];
let current=0;
let resultUrl=null;
let busy=false;
let running=null;
let revision=0;
let loading=0;
let skipped=[];
let undecodable=[];
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
try{
const context=canvas.getContext('2d',{willReadFrequently:true});
context.imageSmoothingEnabled=true;
context.imageSmoothingQuality='high';
context.drawImage(bitmap,0,0,canvas.width,canvas.height);
return canvas;
}catch(error){
clearCanvas(canvas);
throw error;
}
}
function importNotices(){
const lines=[];
for(const[files,one,many]of[
[skipped,'error.skipped.one','error.skipped.many'],
[undecodable,'error.decode.one','error.decode.many'],
]){
if(!files.length)continue;
const{count,names,more}=fileSummary(files);
const listed=more?phrase('error.more',{names,count:more}):names;
lines.push(phrase(count===1?one:many,{count,names:listed}));
}
if(lines.length)showError(lines.join(' '));
}
const imports=orderedLoads({
async read(file){
let decoded;
try{
decoded=await decode(file);
const page=preparePage(file,decoded);
await new Promise(resolve=>setTimeout(resolve,0));
return page;
}finally{
decoded?.bitmap.close?.();
}
},
complete({items,errors}){
const first=pages.length;
pages.push(...items);
if(items.length)outputChanged();
undecodable.push(...errors.map(({value})=>value));
importNotices();
if(items.length)select(first);
refresh();
schedulePreview();
},
status(pending){
loading=pending;
if(pending)picker.busy(readingLabel(pending));
else picker.done();
refresh();
},
discard(page){clearCanvas(page.preview);},
});
function addFiles(files){
if(busy){
setExporting(true);
return;
}
outputChanged();
if(!imports.pending){
clearError();
skipped=[];
undecodable=[];
}
const{accepted,refused}=photoBatch(files);
skipped.push(...refused);
importNotices();
return imports.add(accepted);
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
try{
detect(page);
return page;
}catch(error){
clearCanvas(preview);
throw error;
}
}
function detect(page){
const working=shrinkTo(page.preview,page.preview.width,page.preview.height,WORKING_EDGE);
try{
const context=working.getContext('2d',{willReadFrequently:true});
const image=context.getImageData(0,0,working.width,working.height);
const found=findPageQuad(image);
const up=page.width/working.width;
page.quad=scaleQuad(found.quad,up).map((point)=>clampPoint(point,page.width,page.height));
page.found=found.found;
page.reason=found.reason;
page.edited=false;
page.history=[];
}finally{
clearCanvas(working);
}
}
function select(index){
if(busy)return;
current=Math.min(pages.length-1,Math.max(0,index));
refresh();
schedulePreview();
}
function removePage(index){
if(busy)return;
outputChanged();
const[removed]=pages.splice(index,1);
if(removed)clearCanvas(removed.preview);
if(current>=pages.length)current=Math.max(0,pages.length-1);
refresh();
schedulePreview();
}
function movePage(index,by){
if(busy)return;
const to=index+by;
if(to<0||to>=pages.length)return;
outputChanged();
[pages[index],pages[to]]=[pages[to],pages[index]];
current=to;
refresh();
schedulePreview();
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
if(busy)return;
const page=pages[current];
if(!page)return;
page.history.push(copyQuad(page.quad));
if(page.history.length>HISTORY)page.history.shift();
el.undo.disabled=false;
}
function moveCorner(index,point){
if(busy)return;
const page=pages[current];
if(!page)return;
const quad=copyQuad(page.quad);
quad[index]=clampPoint(point,page.width,page.height);
outputChanged();
page.quad=orderCorners(quad);
page.edited=true;
drawCorners();
schedulePreview();
}
function undo(){
if(busy)return;
const page=pages[current];
const previous=page?.history.pop();
if(!previous)return;
outputChanged();
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
el.stripToolbar.hidden=!any&&!loading;
el.editControls.hidden=!any;
el.editEmpty.hidden=any;
el.cleanControls.hidden=!any;
el.cleanEmpty.hidden=any;
el.savePdf.disabled=!any||busy||loading>0;
el.saveImages.disabled=!any||busy||loading>0;
setExporting(busy);
el.countLabel.textContent=any
?phrase(pages.length===1?'page.count':'page.counts',{count:pages.length})
:'';
renderStrip();
if(!page){
retirePreview();
clearCanvas(el.photo);
clearCanvas(el.scanPreview);
el.scanFacts.replaceChildren();
el.detectNote.textContent='';
corners.setSource(0,0);
return;
}
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
function retirePreview(){
previewToken+=1;
window.clearTimeout(previewTimer);
el.scanBusy.hidden=true;
}
function schedulePreview(){
retirePreview();
if(pages[current])previewTimer=window.setTimeout(renderPreview,120);
}
async function renderPreview(){
const page=pages[current];
if(!page)return;
const options=settings();
const quad=copyQuad(page.quad);
const token=previewToken+1;
previewToken=token;
el.scanBusy.hidden=false;
await new Promise((resolve)=>setTimeout(resolve,0));
if(previewToken!==token||pages[current]!==page)return;
try{
const scaled=scaleQuad(quad,1/page.scale);
const shape=pageAspect(scaled,page.preview.width,page.preview.height);
const size=outputSize(scaled,shape.aspect,PREVIEW_EDGE);
const source=page.preview
.getContext('2d',{willReadFrequently:true})
.getImageData(0,0,page.preview.width,page.preview.height);
const flat=warpPage(source,scaled,size);
const cleaned=cleanPage(flat,options);
if(previewToken!==token||pages[current]!==page)return;
el.scanPreview.width=cleaned.width;
el.scanPreview.height=cleaned.height;
el.scanPreview.getContext('2d')
.putImageData(new ImageData(cleaned.data,cleaned.width,cleaned.height),0,0);
describeScan(page,shape,options,quad);
renderStrip();
}catch(error){
if(previewToken===token&&pages[current]===page){
showError(phrase('error.failed',{detail:errorDetail(error,phrase)}));
}
}finally{
if(previewToken===token)el.scanBusy.hidden=true;
}
}
function describeScan(page,shape,options,quad){
const size=outputSize(quad,shape.aspect,options.maxSide);
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
async function renderFull(page,options,signal){
throwIfAborted(signal);
const decoded=await decode(page.file);
let canvas;
try{
throwIfAborted(signal);
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
canvas=shrinkTo(
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
if(canvas)clearCanvas(canvas);
decoded.bitmap.close?.();
}
}
function clearCanvas(canvas){
canvas.width=0;
canvas.height=0;
}
function clearResult(){
if(resultUrl)URL.revokeObjectURL(resultUrl);
resultUrl=null;
el.result.hidden=true;
el.resultFacts.replaceChildren();
el.download.removeAttribute('href');
el.download.removeAttribute('download');
}
function outputChanged(){
revision+=1;
if(running)cancelExport();
clearResult();
if(!busy)el.busy.hidden=true;
}
function setExporting(active){
busy=active;
for(const area of[el.dropzone,el.stripToolbar,el.strip,el.editControls,
el.cleanControls,el.saveSettings])area.inert=active;
el.fileInput.disabled=active;
el.example.inert=active;
el.modeGroup.disabled=active;
for(const input of el.saveSettings.querySelectorAll('input, select'))input.disabled=active;
el.cancel.hidden=!active;
el.cancelNote.hidden=!active;
}
function cancelExport(){
const job=running;
if(!job)return;
running=null;
job.controller.abort();
setExporting(false);
el.busy.textContent=phrase('busy.cancelled');
el.busy.hidden=false;
refresh();
(job.kind==='pdf'?el.savePdf:el.saveImages).focus({preventScroll:true});
}
function resultFacts(result){
const{blob,name,count,kind,mono,extension}=result;
const facts=[phrase(kind==='pdf'?'result.pdf':'result.images',{
name,size:sizeText(blob.size),
pages:phrase(count===1?'page.count':'page.counts',{count}),
})];
if(kind==='pdf'){
facts.push(phrase(mono?'result.mono':'result.jpeg'),phrase('result.clean'));
}else if(count>1){
facts.push(phrase(extension==='png'?'result.png':'result.jpeg'));
}
return facts;
}
async function run(kind){
if(busy||loading||el.dropzone.classList.contains('busy')||!pages.length){
if(!pages.length)showError(phrase('error.none'));
return;
}
const job={
controller:new AbortController(),revision,kind,
pages:snapshotPages(pages),options:Object.freeze(settings()),
};
running=job;
const owns=()=>running===job&&revision===job.revision&&!job.controller.signal.aborted;
clearResult();
clearError();
setExporting(true);
refresh();
el.busy.hidden=false;
el.cancel.focus({preventScroll:true});
const report=(key,values)=>{
if(owns())el.busy.textContent=phrase(key,values);
};
try{
const result=await writeScan(job.pages,job.options,{
kind,signal:job.controller.signal,renderPage:renderFull,report,
});
if(owns())show(result.blob,result.name,resultFacts(result));
}catch(error){
if(owns()&&error.name!=='AbortError'){
showError(phrase('error.failed',{detail:errorDetail(error,phrase)}));
}
}finally{
if(owns()){
const returnFocus=document.activeElement===el.cancel;
running=null;
setExporting(false);
el.busy.hidden=true;
refresh();
schedulePreview();
if(returnFocus)(kind==='pdf'?el.savePdf:el.saveImages).focus({preventScroll:true});
}
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
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles:(files)=>addFiles(files),
example:makeExample,
});
el.detectOne.addEventListener('click',()=>{
if(busy)return;
const page=pages[current];
if(!page)return;
outputChanged();
detect(page);
refresh();
schedulePreview();
});
el.detectAll.addEventListener('click',()=>{
if(busy)return;
outputChanged();
for(const page of pages)detect(page);
refresh();
schedulePreview();
});
el.wholePhoto.addEventListener('click',()=>{
if(busy)return;
const page=pages[current];
if(!page)return;
snapshot();
outputChanged();
page.quad=wholeFrame(page.width,page.height);
page.edited=true;
refresh();
schedulePreview();
});
const turn=(times)=>{
if(busy)return;
const page=pages[current];
if(!page)return;
snapshot();
outputChanged();
for(let i=0;i<times;i+=1)page.quad=turnQuad(page.quad);
refresh();
schedulePreview();
};
el.turnRight.addEventListener('click',()=>turn(1));
el.turnLeft.addEventListener('click',()=>turn(3));
el.undo.addEventListener('click',undo);
el.clearAll.addEventListener('click',()=>{
if(busy)return;
outputChanged();
for(const page of pages)clearCanvas(page.preview);
pages=[];
current=0;
imports.reset();
skipped=[];
undecodable=[];
clearError();
refresh();
});
for(const[input,event,preview]of[
[el.modeGroup,'change',true],[el.strength,'input',true],
[el.maxSide,'change',true],[el.pageSize,'change',false],
[el.dpi,'change',false],[el.margin,'input',false],
[el.quality,'input',false],[el.title,'input',false],
]){
input.addEventListener(event,()=>{
outputChanged();
showSettingNotes();
if(preview)schedulePreview();
});
}
el.savePdf.addEventListener('click',()=>run('pdf'));
el.saveImages.addEventListener('click',()=>run('images'));
el.cancel.addEventListener('click',cancelExport);
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
