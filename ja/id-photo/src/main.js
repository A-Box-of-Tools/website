/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{
SPECS,backgroundOf,pixelLabel,portalBytes,portalPixels,printLabel,
specById,specsByCountry,trim,withCustom,
}from'./specs.js';
import{
fitFrame,frameAspect,guideLines,measure,passes,printPixels,resampling,
}from'./geometry.js';
import{PAPERS,bestSheet,describeSheet,paperById}from'./sheet.js';
import{
checkBackground,checkSignature,readBackground,readSignature,
}from'./background.js';
import{
decode,drawCrop,drawSheet,encodePrint,encodeToBand,free,release,
samplePixels,sizeText,
}from'./encode.js';
import{WORKING_EDGE,findMarks}from'./detect.js';
import{Cropper}from'./cropper.js';
import{Marks}from'./marks.js';
import{
bandText,centreText,outName,readyText,resamplingText,statusClass,stemOf,
tiltText,verdictText,
}from'./files.js';
import{readingLabel,wireFilePicker}from'./shared/file-picker.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
loaded:$('loaded'),
loadedName:$('loaded-name'),
clearPhoto:$('clear-photo'),
loadError:$('load-error'),
specSelect:$('spec'),
specFacts:$('spec-facts'),
specNotes:$('spec-notes'),
specSource:$('spec-source'),
customPanel:$('custom-panel'),
frameEmpty:$('frame-empty'),
frameControls:$('frame-controls'),
markHint:$('mark-hint'),
markModes:$('mark-mode-auto').closest('.mark-mode'),
modeAuto:$('mark-mode-auto'),
modeManual:$('mark-mode-manual'),
markNote:$('mark-note'),
markWhy:$('mark-why'),
stage:$('stage'),
preview:$('preview'),
fitBox:$('fit-box'),
resetMarks:$('reset-marks'),
wholePhoto:$('whole-photo'),
shortNote:$('short-note'),
geometryChecks:$('geometry-checks'),
resampleNote:$('resample-note'),
backgroundLede:$('background-lede'),
swatches:$('swatches'),
swatchFound:$('swatch-found'),
swatchFoundText:$('swatch-found-text'),
swatchWanted:$('swatch-wanted'),
swatchWantedText:$('swatch-wanted-text'),
backgroundChecks:$('background-checks'),
backgroundNote:$('background-note'),
readyLine:$('ready-line'),
dpiField:$('dpi-field'),
printDpi:$('print-dpi'),
dpiNote:$('dpi-note'),
paperField:$('paper-field'),
paper:$('paper'),
paperNote:$('paper-note'),
make:$('make'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
results:$('results'),
resultList:$('result-list'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
networkCount:$('network-count'),
networkDot:$('network-dot'),
offlineStatus:$('offline-status'),
offlineDot:$('offline-dot'),
};
const CUSTOM_FIELDS={
widthMm:$('custom-width'),
heightMm:$('custom-height'),
dpi:$('custom-dpi'),
headMinMm:$('custom-head-min'),
headMaxMm:$('custom-head-max'),
background:$('custom-background'),
pxWidth:$('custom-px-width'),
pxHeight:$('custom-px-height'),
minKb:$('custom-min-kb'),
maxKb:$('custom-max-kb'),
};
let photo=null;
let specId=SPECS[0].id;
let busy=false;
let markMode='auto';
let lastFinding=null;
let reading=null;
let lastMetrics=null;
let backgroundTimer=0;
let resultUrls=[];
const cropper=new Cropper(el.stage,{onChange:onCropChange});
const marks=new Marks(el.stage,{
onChange:(_,why)=>{
if(why==='drag'&&markMode==='auto'){
markMode='manual';
el.modeManual.checked=true;
lastFinding={quality:'edited',notes:[]};
renderMarkNote();
}
refreshFrame();
},
});
function currentSpec(){
const spec=specById(specId);
if(spec.id!=='custom')return spec;
const values=Object.fromEntries(
Object.entries(CUSTOM_FIELDS).map(([key,input])=>[key,input.value]),
);
return withCustom(spec,values);
}
function buildSpecSelect(){
for(const group of specsByCountry()){
const optgroup=document.createElement('optgroup');
optgroup.label=group.country;
for(const spec of group.specs){
const option=document.createElement('option');
option.value=spec.id;
option.textContent=spec.document;
optgroup.append(option);
}
el.specSelect.append(optgroup);
}
el.specSelect.value=specId;
}
function buildPaperSelect(){
for(const paper of PAPERS){
const option=document.createElement('option');
option.value=paper.id;
option.textContent=paper.label;
el.paper.append(option);
}
}
const guidance=(text,advisory)=>(advisory?phrase('band.guidance',{band:text}):text);
function renderSpec(){
const spec=currentSpec();
const background=backgroundOf(spec,phrase);
const heightMm=spec.print?.heightMm??null;
const facts=[[phrase('facts.print'),printLabel(spec)]];
if(spec.kind!=='signature'){
facts.push(
[phrase('facts.head'),guidance(bandText(spec.head,heightMm,phrase),spec.head.advisory)],
[phrase('facts.eye'),guidance(bandText(spec.eye,heightMm,phrase),spec.eye.advisory)],
);
}
facts.push([phrase('facts.background'),background.label]);
if(spec.digital){
const bytes=portalBytes(spec);
const size=Number.isFinite(bytes.max)
?(bytes.min?`${sizeText(bytes.min)} to ${sizeText(bytes.max)}`:`up to ${sizeText(bytes.max)}`)
:(bytes.min?`${sizeText(bytes.min)} and up`:'no file-size rule stated');
facts.push([spec.digital.label,`${pixelLabel(spec)}, JPEG, ${size}`]);
}else{
facts.push(['Upload rule','none published - this one is a print']);
}
el.specFacts.replaceChildren(...facts.flatMap(([term,value])=>{
const dt=document.createElement('dt');
dt.textContent=term;
const dd=document.createElement('dd');
dd.textContent=value;
return[dt,dd];
}));
el.specNotes.replaceChildren(...spec.notes.map((note)=>{
const li=document.createElement('li');
li.textContent=note;
return li;
}));
el.specSource.textContent=spec.source.checked
?`Transcribed from ${spec.source.authority} - ${spec.source.document}. Checked ${spec.source.checked}. `
+'Rules change; the figures above are what to check against the form in front of you.'
:'Your own figures. Nothing here is checked against anything.';
el.customPanel.hidden=spec.id!=='custom';
const signature=spec.kind==='signature';
el.markHint.hidden=signature;
el.markModes.hidden=signature;
el.markNote.hidden=signature;
el.markWhy.hidden=signature;
el.fitBox.hidden=signature;
el.resetMarks.hidden=signature;
if(signature)marks.hide();
else if(photo){
if(marks.placed)marks.show();
else placeMarks();
}
el.backgroundLede.textContent=signature
?'A signature is checked differently: that the paper is light, that there is ink '
+'on it, and that the crop has not taken in a ruled line or the edge of the page.'
:'Read from a band across the top of the crop and down each side, above the '
+'shoulders - the parts of the frame that ought to be nothing but background. '
+'Measured in CIE Lab rather than in RGB, because two greys forty RGB units '
+'apart are indistinguishable and forty units of blue is a different colour.';
el.dpiField.hidden=!spec.print;
el.paperField.hidden=!spec.print;
el.dpiNote.textContent=spec.print
?`${spec.print.dpi} dpi is this rule's floor. At ${el.printDpi.value} dpi the file `
+`comes out ${describePrint(spec)}, and the JPEG carries that resolution in its `
+'header, so a print shop prints it at the right size rather than guessing.'
:'';
if(photo){
cropper.setAspect(frameAspect(spec));
if(signature)marks.hide();
else if(marks.placed)fitToRule();
refreshFrame();
}
renderPaperNote();
}
function describePrint(spec){
const pixels=printPixels(spec,Number(el.printDpi.value));
return pixels?`${pixels.width} x ${pixels.height} pixels`:'';
}
function renderPaperNote(){
const spec=currentSpec();
if(!spec.print){
el.paperNote.textContent='';
return;
}
const plan=sheetPlan(spec);
el.paperNote.textContent=`${describeSheet(plan)}, with cut marks in the gaps and `
+'nothing printed over a photograph.';
}
function sheetPlan(spec){
return bestSheet({
photo:{widthMm:spec.print.widthMm,heightMm:spec.print.heightMm},
paper:paperById(el.paper.value),
dpi:Number(el.printDpi.value)||spec.print.dpi,
});
}
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
load(files[0]);
},
});
async function load(file){
if(!file||busy)return;
clearLoadError();
picker.busy(readingLabel(1));
try{
if(!looksLikeImage(file))throw new Error('that is not an image this browser can open.');
const decoded=await decode(file);
dropPhoto();
photo={
file,
url:URL.createObjectURL(file),
bitmap:decoded.bitmap,
width:decoded.width,
height:decoded.height,
};
el.preview.src=photo.url;
el.stage.style.aspectRatio=`${photo.width} / ${photo.height}`;
el.stage.style.maxWidth=`calc(62vh * ${photo.width / photo.height})`;
el.loadedName.textContent=`${file.name} - ${photo.width} x ${photo.height} pixels`;
el.loaded.hidden=false;
el.frameEmpty.hidden=true;
el.frameControls.hidden=false;
cropper.setSource(photo.width,photo.height);
cropper.setAspect(frameAspect(currentSpec()));
marks.setSource(photo.width,photo.height);
if(currentSpec().kind!=='signature'){
placeMarks();
fitToRule();
}
refreshFrame();
}catch(error){
showLoadError(`${file.name}: ${error.message}`);
}finally{
picker.done();
}
}
function looksLikeImage(file){
return file.type.startsWith('image/')||/\.(jpe?g|png|webp|bmp|gif|avif|heic)$/i.test(file.name);
}
function dropPhoto(){
if(!photo)return;
URL.revokeObjectURL(photo.url);
release(photo.bitmap);
photo=null;
}
el.clearPhoto.addEventListener('click',()=>{
dropPhoto();
el.preview.removeAttribute('src');
el.loaded.hidden=true;
el.frameControls.hidden=true;
el.frameEmpty.hidden=false;
el.results.hidden=true;
el.make.disabled=true;
reading=null;
lastFinding=null;
marks.clear();
renderBackground();
});
function placeMarks(){
if(!photo)return;
lastFinding=markMode==='auto'?detect():{quality:'manual',notes:[]};
if(lastFinding?.marks)marks.place(lastFinding.marks);
else marks.open();
renderMarkNote();
}
function detect(){
try{
const pixels=samplePixels(
photo.bitmap,
{x:0,y:0,width:photo.width,height:photo.height},
WORKING_EDGE,
);
const found=findMarks(pixels);
if(!found.marks)return found;
const scaleX=photo.width/pixels.width;
const scaleY=photo.height/pixels.height;
return{
...found,
marks:Object.fromEntries(Object.entries(found.marks).map(([key,point])=>[key,{
x:point.x*scaleX,
y:point.y*scaleY,
}])),
};
}catch{
return{marks:null,quality:'none',notes:['background']};
}
}
function renderMarkNote(){
const quality=lastFinding?.quality??'manual';
el.markNote.textContent=phrase(`marks.${quality}`);
el.markWhy.replaceChildren(...(lastFinding?.notes??[]).map((note)=>{
const li=document.createElement('li');
li.textContent=phrase(`marks.why.${note}`);
return li;
}));
el.resetMarks.textContent=phrase(
markMode==='auto'?'marks.button.again':'marks.button.back',
);
}
function fitToRule(){
if(!photo||!marks.placed)return;
const spec=currentSpec();
const fitted=fitFrame(marks.marks,spec,photo);
cropper.setRect(fitted.rect);
const short=fitted.short;
const missing=Object.entries(short).filter(([,value])=>value>2);
el.shortNote.hidden=missing.length===0;
if(missing.length){
const parts=missing.map(([side,value])=>`${value} px at the ${side}`);
el.shortNote.textContent=`The rule wanted more picture than there is: ${parts.join(', ')}. `
+'The box has been kept inside the photograph instead, which is why the figures '
+'below may not all be green. A photo taken a step further back is the fix.';
}
}
function onCropChange(){
refreshFrame();
clearTimeout(backgroundTimer);
backgroundTimer=setTimeout(readBackgroundNow,180);
}
function refreshFrame(){
if(!photo)return;
const spec=currentSpec();
const rect=cropper.rect;
if(spec.kind==='signature'||!marks.placed){
cropper.setGuides(null);
el.geometryChecks.replaceChildren();
el.make.disabled=false;
lastMetrics=null;
renderResample(spec,rect);
renderReady(spec);
return;
}
const metrics=measure(rect,marks.marks,spec);
lastMetrics=metrics;
const lines=guideLines(spec);
const points=marks.marks;
cropper.setGuides({
eye:lines.eye,
head:lines.head,
marks:{
crown:(points.crown.y-rect.y)/rect.height,
chin:(points.chin.y-rect.y)/rect.height,
},
pass:{head:metrics.head.status==='ok',eye:metrics.eye.status==='ok'},
});
const heightMm=spec.print?.heightMm??null;
const rows=[
[metrics.head,verdictText(metrics.head,'head',heightMm,phrase)],
[metrics.eye,verdictText(metrics.eye,'eye',heightMm,phrase)],
[metrics.centre,centreText(metrics.centre,phrase)],
[metrics.tilt,tiltText(metrics.tilt,phrase)],
];
el.geometryChecks.replaceChildren(...rows.map(([check,text])=>checkRow(
statusClass(check.status,check.advisory),text,
)));
renderResample(spec,rect);
renderReady(spec);
el.make.disabled=false;
}
function checkRow(status,text){
const li=document.createElement('li');
li.className=`check check-${status}`;
const mark=document.createElement('span');
mark.className='check-mark';
mark.textContent=status==='good'?'✓':status==='warn'?'!':'✗';
const body=document.createElement('span');
body.textContent=text;
li.append(mark,body);
return li;
}
function renderResample(spec,rect){
const outputs=[printPixels(spec,Number(el.printDpi.value)),portalPixels(spec)]
.filter(Boolean);
if(!outputs.length){
el.resampleNote.textContent='';
return;
}
const largest=outputs.reduce((a,b)=>(a.height>=b.height?a:b));
el.resampleNote.textContent=resamplingText(resampling(rect,largest),phrase);
}
function renderReady(){
el.readyLine.textContent=readyText(
lastMetrics?passes(lastMetrics):true,
reading?.status??'unknown',
phrase,
);
}
el.fitBox.addEventListener('click',fitToRule);
el.wholePhoto.addEventListener('click',()=>cropper.maximize());
el.resetMarks.addEventListener('click',()=>{
placeMarks();
fitToRule();
});
for(const radio of[el.modeAuto,el.modeManual]){
radio.addEventListener('change',()=>{
if(!radio.checked)return;
markMode=radio.value;
if(markMode==='auto'){
placeMarks();
fitToRule();
}else{
lastFinding={quality:'manual',notes:[]};
renderMarkNote();
}
});
}
function readBackgroundNow(){
if(!photo)return;
const spec=currentSpec();
const pixels=samplePixels(photo.bitmap,cropper.rect);
if(spec.kind==='signature'){
reading=checkSignature(readSignature(pixels));
reading.found=null;
}else{
const read=readBackground(pixels);
reading=checkBackground(read,backgroundOf(spec,phrase));
reading.found=read;
}
renderBackground();
renderReady();
}
function renderBackground(){
const spec=currentSpec();
const wanted=backgroundOf(spec,phrase);
if(!reading){
el.swatches.hidden=true;
el.backgroundChecks.replaceChildren();
el.backgroundNote.textContent='';
return;
}
el.swatches.hidden=!reading.found;
if(reading.found){
el.swatchFound.style.background=reading.found.hex;
el.swatchFoundText.textContent=reading.found.hex;
el.swatchWanted.style.background=wanted.hex;
el.swatchWantedText.textContent=`${wanted.label} (${wanted.hex})`;
}
el.backgroundChecks.replaceChildren(...reading.findings.map(
(finding)=>checkRow(finding.status,phrase(finding.phrase,finding.values)),
));
el.backgroundNote.textContent=spec.kind==='signature'
?phrase('bg.signature.note')
:phrase('bg.note',{colour:wanted.note});
}
el.make.addEventListener('click',run);
el.printDpi.addEventListener('change',()=>{renderSpec();});
el.paper.addEventListener('change',renderPaperNote);
el.specSelect.addEventListener('change',()=>{
specId=el.specSelect.value;
renderSpec();
readBackgroundNow();
});
for(const input of Object.values(CUSTOM_FIELDS)){
input.addEventListener('change',()=>{renderSpec();readBackgroundNow();});
}
async function run(){
if(!photo||busy)return;
busy=true;
el.make.disabled=true;
el.results.hidden=true;
showProgress(0,'cropping');
for(const url of resultUrls)URL.revokeObjectURL(url);
resultUrls=[];
const spec=currentSpec();
const rect=cropper.rect;
const stem=stemOf(photo.file.name);
const made=[];
try{
const dpi=Number(el.printDpi.value)||spec.print?.dpi||300;
let printCanvas=null;
if(spec.print){
const size=printPixels(spec,dpi);
showProgress(0.15,`writing the ${trim(spec.print.widthMm)} x ${trim(spec.print.heightMm)} mm print`);
printCanvas=drawCrop(photo.bitmap,rect,size);
const{blob}=await encodePrint(printCanvas,{dpi});
made.push({
blob,
name:outName(stem,spec,'print'),
title:`The print - ${trim(spec.print.widthMm)} x ${trim(spec.print.heightMm)} mm`,
detail:`${size.width} x ${size.height} pixels, ${sizeText(blob.size)}, tagged ${dpi} dpi `
+'in the file itself so a print shop reproduces it at the right size.',
});
showProgress(0.5,'laying out the sheet');
const plan=sheetPlan(spec);
if(plan.count>0){
const sheetCanvas=drawSheet(plan,printCanvas);
const sheet=await encodePrint(sheetCanvas,{dpi,quality:0.92});
free(sheetCanvas);
made.push({
blob:sheet.blob,
name:outName(stem,spec,'sheet',{paper:paperById(el.paper.value).id}),
title:`The sheet - ${paperById(el.paper.value).label}`,
detail:`${describeSheet(plan)}, ${sizeText(sheet.blob.size)}, tagged ${dpi} dpi. `
+'Print it at 100 per cent - "fit to page" is what makes a sheet come out '
+'the wrong size.',
});
}
}
if(spec.digital){
const size=portalPixels(spec);
showProgress(0.75,`squeezing to ${spec.digital.label.toLowerCase()}`);
const canvas=drawCrop(photo.bitmap,rect,size);
const band=portalBytes(spec);
const result=await encodeToBand(canvas,band);
free(canvas);
made.push({
blob:new Blob([result.bytes],{type:'image/jpeg'}),
name:outName(stem,spec,'upload',size),
title:`The upload - ${size.width} x ${size.height}`,
detail:`${sizeText(result.bytes.length)} after ${result.encodes} `
+`${result.encodes === 1 ? 'encode' : 'encodes'}. ${result.how}`,
warn:!result.fitted,
});
}
if(printCanvas)free(printCanvas);
showProgress(1,'done');
renderResults(made);
}catch(error){
showLoadError(`Something went wrong making the files: ${error.message}`);
}finally{
busy=false;
el.make.disabled=false;
setTimeout(()=>{el.progress.hidden=true;},600);
}
}
function renderResults(made){
el.resultList.replaceChildren(...made.map((item)=>{
const url=URL.createObjectURL(item.blob);
resultUrls.push(url);
const li=document.createElement('li');
li.className=`result-row${item.warn ? ' result-warn' : ''}`;
const head=document.createElement('p');
head.className='result-title';
head.textContent=item.title;
const detail=document.createElement('p');
detail.className='result-detail';
detail.textContent=item.detail;
const link=document.createElement('a');
link.className='primary as-button';
link.href=url;
link.download=item.name;
link.textContent='Download';
const name=document.createElement('p');
name.className='result-name';
name.textContent=item.name;
const text=document.createElement('div');
text.className='result-text';
text.append(head,detail,name);
li.append(text,link);
return li;
}));
el.results.hidden=made.length===0;
}
function showProgress(fraction,label){
el.progress.hidden=false;
el.progressBar.style.width=`${Math.round(fraction * 100)}%`;
el.progressLabel.textContent=label;
}
function showLoadError(message){
el.loadError.textContent=message;
el.loadError.hidden=false;
}
function clearLoadError(){
el.loadError.textContent='';
el.loadError.hidden=true;
}
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
const PLATFORM_HOSTS=/(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;
function monitorNetwork(){
const platform=new Set();
const unexplained=new Set();
const inspect=(entries)=>{
for(const entry of entries){
if(entry.name.startsWith('blob:')||entry.name.startsWith('data:'))continue;
const url=new URL(entry.name,location.href);
if(url.origin===location.origin)continue;
if(PLATFORM_HOSTS.test(url.hostname))platform.add(url.hostname);
else unexplained.add(url.hostname);
}
const total=performance.getEntriesByType('resource')
.filter((e)=>!e.name.startsWith('blob:')&&!e.name.startsWith('data:')).length;
const clean=unexplained.size===0;
const platformNote=platform.size
?phrase(platform.size===1?'net.platform.one':'net.platform.many',
{hosts:platform.size})
:'';
el.networkCount.textContent=clean
?phrase('net.clean',{total,platform:platformNote})
:phrase('net.dirty',{hosts:[...unexplained].join(', '),platform:platformNote});
el.networkCount.className=clean?'good':'warn';
el.networkDot.className=`live-dot ${clean ? 'good' : 'warn'}`;
};
inspect(performance.getEntriesByType('resource'));
try{
new PerformanceObserver((list)=>inspect(list.getEntries())).observe({type:'resource',buffered:true});
}catch{
}
}
async function registerServiceWorker(){
const fail=(message,detail)=>{
el.offlineStatus.textContent=message;
el.offlineDot.className='live-dot';
if(detail){
el.offlineStatus.title=detail;
console.info('Offline caching unavailable:',detail);
}
};
if(!('serviceWorker'in navigator)){
fail(phrase('offline.none'));
return;
}
if(!window.isSecureContext){
fail(phrase('offline.insecure'));
return;
}
try{
await navigator.serviceWorker.register('sw.js');
await navigator.serviceWorker.ready;
el.offlineStatus.textContent=phrase('offline.ready');
el.offlineStatus.className='good';
el.offlineDot.className='live-dot good';
}catch(error){
fail(phrase('offline.failed'),error.message);
}
}
window.addEventListener('error',(event)=>{
showLoadError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showLoadError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
buildSpecSelect();
buildPaperSelect();
renderSpec();
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
