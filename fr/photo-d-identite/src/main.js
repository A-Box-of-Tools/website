/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ltr,phrase}from'./shared/phrases.js?v=635af5de27';
import{messageBox}from'./shared/message-box.js?v=635af5de27';
import{
SPECS,backgroundOf,countryLabel,documentLabel,matchCountries,
orderedCountries,portalBytes,portalPixels,specById,specFromHash,specsOf,
trim,withCustom,
}from'./specs.js?v=635af5de27';
import{createCombo}from'./combo.js?v=635af5de27';
import{
fitFrame,frameAspect,guideLines,measure,passes,printPixels,resampling,
}from'./geometry.js?v=635af5de27';
import{PAPERS,bestSheet,describeSheet,paperById}from'./sheet.js?v=635af5de27';
import{
checkBackground,checkSignature,readBackground,readSignature,
}from'./background.js?v=635af5de27';
import{
decode,drawCrop,drawCropInto,drawSheet,encodePrint,encodeToBand,free,
release,samplePixels,sizeText,
}from'./encode.js?v=635af5de27';
import{WORKING_EDGE,findMarks}from'./detect.js?v=635af5de27';
import{Cropper}from'./cropper.js?v=635af5de27';
import{Marks}from'./marks.js?v=635af5de27';
import{
centreText,docSize,outName,readyText,resamplingText,sourceLine,
specFacts,statusClass,stemOf,tiltText,verdictText,
}from'./files.js?v=635af5de27';
import{readingLabel,wireFilePicker}from'./shared/file-picker.js?v=635af5de27';
import{makeExample}from'./example.js?v=635af5de27';
import{readRequirements}from'./requirements.js?v=635af5de27';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
loaded:$('loaded'),
loadedName:$('loaded-name'),
clearPhoto:$('clear-photo'),
loadError:$('load-error'),
filterNote:$('filter-note'),
countryCombo:$('country-combo'),
country:$('country'),
countryList:$('country-list'),
countryToggle:$('country-toggle'),
docList:$('doc-list'),
outcome:$('outcome'),
outcomeCanvas:$('outcome-canvas'),
outcomeSize:$('outcome-size'),
specFacts:$('spec-facts'),
specNotes:$('spec-notes'),
specSource:$('spec-source'),
customPanel:$('custom-panel'),
readRules:$('read-rules'),
readText:$('read-text'),
readButton:$('read-button'),
readResult:$('read-result'),
readStatus:$('read-status'),
readFound:$('read-found'),
readNotes:$('read-notes'),
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
};
const{show:showLoadError,clear:clearLoadError}=messageBox(el.loadError);
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
let specId=specFromHash(window.location.hash)??SPECS[0].id;
let busy=false;
let loading=false;
let loadGeneration=0;
let exportGeneration=0;
let markMode='auto';
let lastFinding=null;
let reading=null;
let lastMetrics=null;
let backgroundTimer=0;
let resultUrls=[];
const bytesText=(bytes)=>sizeText(bytes,phrase);
const cropper=new Cropper(el.stage,{onChange:onCropChange,t:phrase});
const marks=new Marks(el.stage,{
t:phrase,
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
const collator=new Intl.Collator(document.documentElement.lang||'en');
const countries=orderedCountries(phrase,collator.compare);
const asRow=(one)=>({
value:one.country,
label:one.label,
data:{rules:one.specs.map((spec)=>spec.id).join(' ')},
});
const countryCombo=createCombo({
root:el.countryCombo,
input:el.country,
list:el.countryList,
toggle:el.countryToggle,
rowsFor:(typed)=>matchCountries(countries,typed,phrase).map(asRow),
chosen:()=>{
const key=currentSpec().country;
return{value:key,label:countryLabel(key,phrase)};
},
onChoose:(key)=>{
if(key===currentSpec().country)return;
const[first]=specsOf(key);
if(!first)return;
specId=first.id;
buildDocList();
renderSpec();
readBackgroundNow();
},
onNarrow:(count)=>{
el.filterNote.classList.toggle('visually-hidden',count!==null&&count>0);
el.filterNote.textContent=count===null?''
:phrase(count===0?'filter.none':count===1?'filter.one':'filter.count',
{n:count});
},
});
function buildDocList(){
const chosen=currentSpec().country;
el.docList.replaceChildren(...specsOf(chosen).map((spec)=>{
const label=document.createElement('label');
label.className='mode doc-choice';
const radio=document.createElement('input');
radio.type='radio';
radio.name='document';
radio.id=`doc-${spec.id}`;
radio.value=spec.id;
radio.checked=spec.id===specId;
radio.addEventListener('change',()=>{
if(!radio.checked)return;
specId=spec.id;
renderSpec();
readBackgroundNow();
});
const name=document.createElement('strong');
name.textContent=documentLabel(spec,phrase);
const size=document.createElement('span');
size.className='doc-size';
size.textContent=docSize(spec,phrase);
const text=document.createElement('span');
text.append(name,size);
label.append(radio,text);
return label;
}));
}
function buildPaperSelect(){
for(const paper of PAPERS){
const option=document.createElement('option');
option.value=paper.id;
option.textContent=phrase(paper.label);
el.paper.append(option);
}
}
function renderSpec(){
const spec=currentSpec();
const facts=specFacts(spec,phrase);
el.specFacts.replaceChildren(...facts.flatMap(([term,value])=>{
const dt=document.createElement('dt');
dt.textContent=term;
const dd=document.createElement('dd');
dd.textContent=value;
return[dt,dd];
}));
el.specNotes.replaceChildren(...spec.notes.map((note)=>{
const li=document.createElement('li');
li.textContent=phrase(note);
return li;
}));
el.specSource.textContent=sourceLine(spec,phrase);
el.customPanel.hidden=spec.id!=='custom';
el.readRules.hidden=spec.id!=='custom';
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
el.backgroundLede.textContent=phrase(signature?'lede.signature':'lede.portrait');
el.dpiField.hidden=!spec.print;
el.paperField.hidden=!spec.print;
el.dpiNote.textContent=spec.print
?phrase('dpi.note',{
floor:spec.print.dpi,
chosen:el.printDpi.value,
size:describePrint(spec),
})
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
return pixels?phrase('print.pixels',{width:pixels.width,height:pixels.height}):'';
}
function renderPaperNote(){
const spec=currentSpec();
if(!spec.print){
el.paperNote.textContent='';
return;
}
const plan=sheetPlan(spec);
el.paperNote.textContent=phrase('paper.note',{sheet:describeSheet(plan,phrase)});
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
example:makeExample,
});
async function load(file){
if(!file||busy)return;
const generation=++loadGeneration;
loading=true;
el.make.disabled=true;
clearLoadError();
picker.busy(readingLabel(1));
try{
if(!looksLikeImage(file))throw new Error('load.notimage');
const decoded=await decode(file);
if(generation!==loadGeneration){
release(decoded.bitmap);
return;
}
clearResults();
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
el.loadedName.textContent=phrase('load.named',
{name:file.name,width:photo.width,height:photo.height});
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
if(generation!==loadGeneration)return;
showLoadError(phrase('load.failed',{name:file.name,why:phrase(error.message)}));
}finally{
if(generation===loadGeneration){
loading=false;
picker.done();
el.make.disabled=busy||!photo;
}
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
loadGeneration+=1;
exportGeneration+=1;
el.progress.hidden=true;
loading=false;
picker.done();
clearResults();
dropPhoto();
el.preview.removeAttribute('src');
el.loaded.hidden=true;
el.frameControls.hidden=true;
el.frameEmpty.hidden=false;
el.outcome.hidden=true;
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
const list=missing
.map(([side,value])=>phrase('short.side',{value,side:phrase(`side.${side}`)}))
.reduce((a,b)=>phrase('join.list',{a,b}));
el.shortNote.textContent=phrase('short.note',{list});
}
}
function onCropChange(){
refreshFrame();
clearTimeout(backgroundTimer);
backgroundTimer=setTimeout(readBackgroundNow,180);
}
const PREVIEW_EDGE=220;
let previewPending=0;
function drawPreview(){
if(!photo||previewPending)return;
previewPending=requestAnimationFrame(()=>{
previewPending=0;
if(!photo)return;
const spec=currentSpec();
const aspect=frameAspect(spec);
const height=PREVIEW_EDGE*(window.devicePixelRatio||1);
drawCropInto(el.outcomeCanvas,photo.bitmap,cropper.rect,{
width:Math.round(height*aspect),
height:Math.round(height),
},{background:backgroundOf(spec,phrase).hex});
el.outcomeCanvas.style.width=`${Math.round(PREVIEW_EDGE * aspect)}px`;
el.outcomeCanvas.style.height=`${PREVIEW_EDGE}px`;
el.outcomeSize.textContent=docSize(spec,phrase);
el.outcome.hidden=false;
});
}
function refreshFrame(){
if(!photo)return;
drawPreview();
const spec=currentSpec();
const rect=cropper.rect;
if(spec.kind==='signature'||!marks.placed){
cropper.setGuides(null);
el.geometryChecks.replaceChildren();
el.make.disabled=busy||loading;
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
el.make.disabled=busy||loading;
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
function boxName(input){
return input.closest('label')?.firstChild?.textContent.replace(/\s+/g,' ').trim()??'';
}
function boxValue(input){
return input instanceof HTMLSelectElement
?input.selectedOptions[0]?.textContent.trim()??input.value
:ltr(input.value);
}
function quote(text,{from,to}){
const q=document.createElement('q');
q.dir='auto';
q.textContent=text.slice(from,to).replace(/\s+/g,' ').trim();
return q;
}
function fieldsLine(...children){
const line=document.createElement('span');
line.className='read-fields';
line.append(...children);
return line;
}
function readRules(){
const text=el.readText.value;
if(!text.trim()){
el.readResult.hidden=true;
el.readText.focus();
return;
}
const reading=readRequirements(text);
for(const{field,value}of reading.found)CUSTOM_FIELDS[field].value=String(value);
const stretches=new Map();
for(const found of reading.found){
const at=[found.from,found.to].join(':');
if(!stretches.has(at))stretches.set(at,{from:found.from,to:found.to,fields:[]});
stretches.get(at).fields.push(found.field);
}
el.readFound.replaceChildren(...[...stretches.values()]
.sort((a,b)=>a.from-b.from)
.map((stretch)=>{
const li=document.createElement('li');
li.append(quote(text,stretch),fieldsLine(...stretch.fields.map((field)=>{
const box=document.createElement('span');
const value=document.createElement('b');
value.textContent=boxValue(CUSTOM_FIELDS[field]);
box.append(`${boxName(CUSTOM_FIELDS[field])} `,value);
return box;
})));
return li;
}));
el.readNotes.replaceChildren(
...reading.notes.map((note)=>{
const li=document.createElement('li');
li.append(`${phrase(note.key)} `,...note.spans.map((s)=>quote(text,s)));
return li;
}),
...reading.unused.map((unused)=>{
const li=document.createElement('li');
li.append(quote(text,unused),fieldsLine(phrase(unused.key)));
return li;
}),
);
const anything=reading.notes.length||reading.unused.length;
el.readStatus.textContent=phrase(reading.found.length?'read.done'
:anything?'read.kept':'read.none');
el.readFound.hidden=!reading.found.length;
el.readNotes.hidden=!anything;
el.readResult.hidden=false;
if(reading.found.length){
el.customPanel.open=true;
renderSpec();
readBackgroundNow();
}
}
el.readButton.addEventListener('click',readRules);
el.make.addEventListener('click',run);
el.printDpi.addEventListener('change',()=>{renderSpec();});
el.paper.addEventListener('change',renderPaperNote);
for(const input of Object.values(CUSTOM_FIELDS)){
input.addEventListener('change',()=>{renderSpec();readBackgroundNow();});
}
async function run(){
if(!photo||loading||busy)return;
const generation=++exportGeneration;
busy=true;
el.make.disabled=true;
clearResults();
showProgress(0,'cropping');
const spec=structuredClone(currentSpec());
const rect={...cropper.rect};
const stem=stemOf(photo.file.name);
const dpi=Number(el.printDpi.value)||spec.print?.dpi||300;
const paper=paperById(el.paper.value);
const made=[];
let printCanvas=null;
let digitalCanvas=null;
try{
if(spec.print)printCanvas=drawCrop(photo.bitmap,rect,printPixels(spec,dpi));
if(spec.digital)digitalCanvas=drawCrop(photo.bitmap,rect,portalPixels(spec));
if(spec.print){
const size=printPixels(spec,dpi);
showProgress(0.15,phrase('step.print',
{width:trim(spec.print.widthMm),height:trim(spec.print.heightMm)}));
const{blob}=await encodePrint(printCanvas,{dpi});
if(generation!==exportGeneration)return;
made.push({
blob,
pixels:size,
name:outName(stem,spec,'print'),
title:phrase('out.print',
{width:trim(spec.print.widthMm),height:trim(spec.print.heightMm)}),
detail:phrase('out.print.detail',{
width:size.width,height:size.height,size:bytesText(blob.size),dpi,
}),
});
showProgress(0.5,phrase('step.sheet'));
const plan=bestSheet({
photo:{widthMm:spec.print.widthMm,heightMm:spec.print.heightMm},paper,dpi,
});
if(plan.count>0){
const sheetCanvas=drawSheet(plan,printCanvas);
let sheet;
try{
sheet=await encodePrint(sheetCanvas,{dpi,quality:0.92});
}finally{
free(sheetCanvas);
}
if(generation!==exportGeneration)return;
made.push({
blob:sheet.blob,
pixels:plan.canvas,
name:outName(stem,spec,'sheet',{paper:paper.id}),
title:phrase('out.sheet',{paper:phrase(paper.label)}),
detail:phrase('out.sheet.detail',{
sheet:describeSheet(plan,phrase),size:bytesText(sheet.blob.size),dpi,
}),
});
}
}
if(spec.digital){
const size=portalPixels(spec);
showProgress(0.75,phrase('step.upload',{label:phrase(spec.digital.label)}));
const band=portalBytes(spec);
const result=await encodeToBand(digitalCanvas,band,phrase);
made.push({
blob:new Blob([result.bytes],{type:'image/jpeg'}),
pixels:size,
name:outName(stem,spec,'upload',size),
title:phrase('out.upload',{width:size.width,height:size.height}),
detail:phrase(result.encodes===1?'out.upload.detail.one':'out.upload.detail.many',{
size:bytesText(result.bytes.length),n:result.encodes,how:result.how,
}),
warn:!result.fitted,
});
}
if(generation!==exportGeneration)return;
showProgress(1,phrase('step.done'));
renderResults(made);
}catch(error){
if(generation===exportGeneration)showLoadError(phrase('make.failed',{why:phrase(error.message)}));
}finally{
if(printCanvas)free(printCanvas);
if(digitalCanvas)free(digitalCanvas);
busy=false;
el.make.disabled=loading||!photo;
setTimeout(()=>{
if(generation===exportGeneration&&!busy)el.progress.hidden=true;
},600);
}
}
function clearResults(){
for(const url of resultUrls)URL.revokeObjectURL(url);
resultUrls=[];
el.resultList.replaceChildren();
el.results.hidden=true;
}
function renderResults(made){
el.resultList.replaceChildren(...made.map((item)=>{
const url=URL.createObjectURL(item.blob);
resultUrls.push(url);
const li=document.createElement('li');
li.className=`result-row${item.warn ? ' result-warn' : ''}`;
const thumb=document.createElement('img');
thumb.className='result-thumb';
thumb.src=url;
thumb.width=item.pixels.width;
thumb.height=item.pixels.height;
thumb.alt=phrase('thumb.alt',{title:item.title});
thumb.loading='lazy';
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
link.textContent=phrase('out.download');
const name=document.createElement('p');
name.className='result-name';
name.textContent=item.name;
const text=document.createElement('div');
text.className='result-text';
text.append(head,detail,name);
li.append(thumb,text,link);
return li;
}));
el.results.hidden=made.length===0;
}
function showProgress(fraction,label){
el.progress.hidden=false;
el.progressBar.style.width=`${Math.round(fraction * 100)}%`;
el.progressLabel.textContent=label;
}
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
window.addEventListener('error',(event)=>{
showLoadError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showLoadError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
countryCombo.refresh();
buildDocList();
buildPaperSelect();
renderSpec();
document.getElementById('boot-warning')?.remove();
