/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=cff3c8840c';
import{measureImage}from'./shared/media.js?v=cff3c8840c';
import{saveBlob}from'./shared/download.js?v=cff3c8840c';
import{messageBox}from'./shared/message-box.js?v=cff3c8840c';
import{
decode,encodableTypes,keepFormat,release,render as renderImage,
FORMATS,JPEG,PNG,WEBP,READABLE,
}from'./codecs.js?v=cff3c8840c';
import{
fromFractions,isUntouched,parseRatio,plan,ratioCrop,toFractions,wholeOf,
}from'./geometry.js?v=cff3c8840c';
import{Cropper}from'./shared/cropper.js?v=cff3c8840c';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=cff3c8840c';
import{
bytes,change as changeOf,countOf as imageCount,describePlan as planText,
dimensions,outName,scaleText,
}from'./files.js?v=cff3c8840c';
import{makeZip}from'./shared/zip.js?v=cff3c8840c';
const $=(id)=>document.getElementById(id);
const humanBytes=(n)=>bytes(n,phrase);
const change=(before,after)=>changeOf(before,after,phrase);
const countOf=(n)=>imageCount(n,phrase);
const describePlan=(size,crop,result,mime)=>planText(size,crop,result,mime,phrase);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
fileList:$('file-list'),
listToolbar:$('list-toolbar'),
countLabel:$('count-label'),
clearAll:$('clear-all'),
loadError:$('load-error'),
cropEmpty:$('crop-empty'),
cropControls:$('crop-controls'),
stage:$('stage'),
stageName:$('stage-name'),
preview:$('preview'),
stageNote:$('stage-note'),
aspectRow:$('aspect-row'),
swapAspect:$('swap-aspect'),
cropX:$('crop-x'),
cropY:$('crop-y'),
cropW:$('crop-w'),
cropH:$('crop-h'),
cropMax:$('crop-max'),
cropCentre:$('crop-centre'),
cropReset:$('crop-reset'),
applyRow:$('apply-row'),
applyNote:$('apply-note'),
cropApplyAll:$('crop-apply-all'),
resizeMode:$('resize-mode'),
pixelsFields:$('pixels-fields'),
longestFields:$('longest-fields'),
percentFields:$('percent-fields'),
sizeW:$('size-w'),
sizeH:$('size-h'),
swapSize:$('swap-size'),
sizePresets:$('size-presets'),
fitRow:$('fit-row'),
fit:$('fit'),
sizeLongest:$('size-longest'),
longestPresets:$('longest-presets'),
sizePercent:$('size-percent'),
percentPresets:$('percent-presets'),
enlargeRow:$('enlarge-row'),
noEnlarge:$('no-enlarge'),
sizeSummary:$('size-summary'),
format:$('format'),
formatNote:$('format-note'),
qualityField:$('quality-field'),
quality:$('quality'),
qualityValue:$('quality-value'),
background:$('background'),
planSummary:$('plan-summary'),
run:$('run'),
cancel:$('cancel'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
results:$('results'),
resultList:$('result-list'),
downloadZip:$('download-zip'),
resultsSummary:$('results-summary'),
viewer:$('viewer'),
viewerName:$('viewer-name'),
viewerClose:$('viewer-close'),
viewerImage:$('viewer-image'),
viewerCaption:$('viewer-caption'),
viewerFacts:$('viewer-facts'),
viewerCompare:$('viewer-compare'),
viewerDownload:$('viewer-download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showLoadError,clear:clearLoadError}=messageBox(el.loadError);
let items=[];
let nextId=1;
let busy=false;
let stopping=false;
let referenceId=null;
let results=[];
let resultUrls=[];
let writable=new Set([JPEG,PNG]);
let loadingPreview=false;
const cropper=new Cropper(el.stage,{
label:phrase('crop.box'),
minSize:8,
onChange(rect){
writeCropFields(rect);
if(loadingPreview)return;
const reference=referenceItem();
if(reference?.size)reference.crop=rect;
clearResults();
refreshOutcomes();
renderCropCard();
renderSummaries();
},
});
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
addFiles(files);
},
});
async function addFiles(files){
if(!files?.length||busy)return;
picker.busy(readingLabel(files.length));
const failures=[];
try{
for(const file of files){
if(!isImage(file)){
failures.push(phrase('load.notimage',{name:file.name}));
continue;
}
const item={
id:nextId,
file,
thumbUrl:URL.createObjectURL(file),
size:null,
crop:null,
aspectKey:'free',
};
nextId+=1;
item.size=await measureImage(item.thumbUrl);
if(!item.size){
URL.revokeObjectURL(item.thumbUrl);
failures.push(phrase('load.undecodable',{name:file.name}));
continue;
}
item.crop=wholeOf(item.size);
items.push(item);
}
}finally{
picker.done();
}
if(failures.length)showLoadError(failures.join('\n'));
else clearLoadError();
clearResults();
ensureReference();
render();
}
function isImage(file){
if(!file.type)return/\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name);
return READABLE.includes(file.type)||file.type.startsWith('image/');
}
function removeItem(id){
const at=items.findIndex((i)=>i.id===id);
if(at<0)return;
URL.revokeObjectURL(items[at].thumbUrl);
items.splice(at,1);
clearResults();
ensureReference();
render();
}
el.clearAll.addEventListener('click',()=>{
for(const item of items)URL.revokeObjectURL(item.thumbUrl);
items=[];
clearResults();
clearLoadError();
ensureReference();
render();
});
const referenceItem=()=>items.find((i)=>i.id===referenceId)??null;
function ensureReference(){
if(!items.some((i)=>i.id===referenceId))referenceId=items[0]?.id??null;
const reference=referenceItem();
if(!reference?.size)return;
el.preview.src=reference.thumbUrl;
el.preview.alt=phrase('preview.alt',{name:reference.file.name});
el.stage.style.aspectRatio=`${reference.size.width} / ${reference.size.height}`;
el.stage.style.maxWidth=`calc(62vh * ${reference.size.width / reference.size.height})`;
loadingPreview=true;
try{
cropper.setSource(reference.size.width,reference.size.height);
cropper.setAspect(aspectValue(reference.aspectKey,reference));
cropper.setRect(reference.crop);
}finally{
loadingPreview=false;
}
markAspect();
}
function showItem(id){
if(id===referenceId||busy)return;
referenceId=id;
ensureReference();
render();
}
function render(){
const any=items.length>0;
el.listToolbar.hidden=!any;
el.clearAll.disabled=busy;
el.countLabel.textContent=any
?phrase('list.count',
{count:countOf(items.length),size:humanBytes(totalBytes())})
:'';
renderList();
renderCropCard();
renderSizeFields();
renderFormatFields();
renderSummaries();
el.run.disabled=!any||busy;
el.run.textContent=phrase(items.length===1?'run.one':'run.many');
}
const totalBytes=()=>items.reduce((n,i)=>n+i.file.size,0);
function renderList(){
el.fileList.replaceChildren();
const choosable=items.length>1;
for(const item of items){
const li=document.createElement('li');
li.className='file-row';
const shown=item.id===referenceId&&choosable;
if(shown)li.classList.add('file-shown');
const main=document.createElement(choosable?'button':'div');
main.className='file-main-wrap';
if(choosable){
main.type='button';
main.setAttribute('aria-pressed',String(shown));
main.title=phrase(shown?'row.shown':'row.draw',
{name:item.file.name});
main.disabled=busy;
main.addEventListener('click',()=>showItem(item.id));
}
const thumb=document.createElement('img');
thumb.className='file-thumb';
thumb.src=item.thumbUrl;
thumb.alt='';
main.appendChild(thumb);
const text=document.createElement('div');
text.className='file-main';
const name=document.createElement('p');
name.className='file-name';
name.textContent=item.file.name;
text.appendChild(name);
const sub=document.createElement('p');
sub.className='file-sub';
sub.textContent=[
FORMATS[item.file.type]?.label??(item.file.type||'image').replace('image/','').toUpperCase(),
humanBytes(item.file.size),
item.size?dimensions(item.size.width,item.size.height):null,
].filter(Boolean).join(' · ');
text.appendChild(sub);
if(item.size){
const note=document.createElement('p');
paintOutcome(note,previewOf(item));
text.appendChild(note);
}
main.appendChild(text);
if(shown){
const badge=document.createElement('span');
badge.className='file-badge';
badge.textContent=phrase('row.badge');
main.appendChild(badge);
}
li.appendChild(main);
const remove=document.createElement('button');
remove.type='button';
remove.className='row-remove';
remove.title=phrase('row.remove',{name:item.file.name});
remove.setAttribute('aria-label',remove.title);
remove.textContent='×';
remove.disabled=busy;
remove.addEventListener('click',()=>removeItem(item.id));
li.appendChild(remove);
el.fileList.appendChild(li);
}
}
function paintOutcome(node,outcome){
node.className=outcome.untouched?'file-note':'file-outcome';
node.textContent=outcome.untouched
?phrase('row.untouched')
:phrase('row.becomes',
{size:dimensions(outcome.canvas.width,outcome.canvas.height)});
}
function refreshOutcomes(){
const rows=el.fileList.children;
items.forEach((item,index)=>{
const node=rows[index]?.querySelector('.file-outcome, .file-note');
if(node&&item.size)paintOutcome(node,previewOf(item));
});
}
function renderCropCard(){
const reference=referenceItem();
el.cropEmpty.hidden=Boolean(items.length);
el.cropControls.hidden=!reference;
cropper.setEnabled(Boolean(reference)&&!busy);
if(!reference){
el.stageNote.hidden=true;
return;
}
const others=items.filter((i)=>i.id!==referenceId);
el.stageName.textContent=others.length
?phrase('stage.name',{name:reference.file.name})
:'';
el.applyRow.hidden=!others.length;
el.applyNote.textContent=others.length
?applyNoteText(reference,others.length)
:'';
if(!others.length){
el.stageNote.hidden=true;
return;
}
el.stageNote.hidden=false;
el.stageNote.textContent=phrase('stage.note',{note:othersNoteText(others)});
}
function othersNoteText(others){
const cropped=others.filter(isCropped);
if(others.length===1){
return phrase(cropped.length?'others.one.cropped':'others.one.whole',
{name:others[0].file.name});
}
if(!cropped.length){
return phrase('others.none',{count:countOf(others.length)});
}
if(cropped.length===others.length){
return others.length===2
?phrase('others.all.two')
:phrase('others.all.many',{n:others.length});
}
return phrase(cropped.length===1?'others.some.one':'others.some.many',
{n:cropped.length,total:others.length});
}
function applyNoteText(reference,count){
const same=items.every((i)=>i.size
&&i.size.width===reference.size.width&&i.size.height===reference.size.height);
if(same){
return phrase(count===1?'apply.same.one':'apply.same.many');
}
if(reference.aspectKey==='free')return phrase('apply.free');
if(reference.aspectKey==='source')return phrase('apply.source');
return phrase('apply.ratio',{ratio:reference.aspectKey});
}
function isCropped(item){
return Boolean(item.size&&item.crop
&&(item.crop.width!==item.size.width||item.crop.height!==item.size.height));
}
function renderSizeFields(){
const mode=el.resizeMode.value;
el.pixelsFields.hidden=mode!=='pixels';
el.longestFields.hidden=mode!=='longest';
el.percentFields.hidden=mode!=='percent';
const both=Boolean(field(el.sizeW)&&field(el.sizeH));
el.fitRow.hidden=mode!=='pixels'||!both;
el.enlargeRow.hidden=mode==='none'||mode==='percent';
}
function renderFormatFields(){
const choice=el.format.value;
el.qualityField.hidden=choice===PNG;
el.qualityValue.textContent=el.quality.value;
const key={
keep:'format.keep',
[JPEG]:'format.jpeg',
[PNG]:'format.png',
[WEBP]:'format.webp',
}[choice];
el.formatNote.textContent=key?phrase(key):'';
}
function renderSummaries(){
const reference=referenceItem();
if(!reference?.size){
el.sizeSummary.textContent=phrase('summary.empty');
el.planSummary.textContent='';
return;
}
const outcome=previewOf(reference);
const crop=outcome.crop;
const cropped=crop.width!==reference.size.width||crop.height!==reference.size.height;
const name=reference.file.name;
if(outcome.untouched){
el.sizeSummary.textContent=phrase('summary.untouched',{
name,
size:dimensions(reference.size.width,reference.size.height),
});
}else{
const scale=phrase(
`scale.${outcome.scale > 1 ? 'up' : 'of'}.${cropped ? 'crop' : 'original'}`,
{percent:scaleText(outcome.scale)});
el.sizeSummary.textContent=phrase(
`summary.${cropped ? 'cropped' : 'plain'}${outcome.padded ? '.padded' : ''}`,{
name,
size:dimensions(reference.size.width,reference.size.height),
crop:dimensions(crop.width,crop.height),
out:dimensions(outcome.canvas.width,outcome.canvas.height),
scale,
});
}
const mime=outputMime(reference.file.type);
const rest=items.length===2
?phrase('rest.two')
:phrase('rest.many',{count:countOf(items.length-1)});
const nothingAtAll=el.format.value==='keep'
&&items.every((i)=>i.size&&previewOf(i).untouched);
const plan=describePlan(reference.size,crop,outcome,mime);
el.planSummary.textContent=nothingAtAll
?phrase('summary.nothing')
:items.length===1
?phrase('summary.plan.one',{plan})
:phrase('summary.plan.many',{name,plan,rest});
}
const settled=()=>{
clearResults();
render();
};
el.resizeMode.addEventListener('change',settled);
el.format.addEventListener('change',settled);
el.fit.addEventListener('change',settled);
el.noEnlarge.addEventListener('change',settled);
el.background.addEventListener('change',settled);
for(const control of[el.sizeW,el.sizeH,el.sizeLongest,el.sizePercent]){
control.addEventListener('input',settled);
}
el.quality.addEventListener('input',()=>{
el.qualityValue.textContent=el.quality.value;
clearResults();
});
el.swapSize.addEventListener('click',()=>{
const width=el.sizeW.value;
el.sizeW.value=el.sizeH.value;
el.sizeH.value=width;
settled();
});
el.sizePresets.addEventListener('click',(event)=>{
const button=event.target.closest('button[data-w]');
if(!button)return;
el.sizeW.value=button.dataset.w;
el.sizeH.value=button.dataset.h;
settled();
});
el.longestPresets.addEventListener('click',(event)=>{
const button=event.target.closest('button[data-longest]');
if(!button)return;
el.sizeLongest.value=button.dataset.longest;
settled();
});
el.percentPresets.addEventListener('click',(event)=>{
const button=event.target.closest('button[data-percent]');
if(!button)return;
el.sizePercent.value=button.dataset.percent;
settled();
});
el.aspectRow.addEventListener('click',(event)=>{
const button=event.target.closest('button[data-aspect]');
if(!button)return;
applyAspect(button.dataset.aspect);
});
el.swapAspect.addEventListener('click',()=>{
const reference=referenceItem();
if(!reference||!cropper.aspect)return;
applyAspect(flipKey(reference.aspectKey));
});
const flipKey=(key)=>{
const pair=key.match(/^(\d+):(\d+)$/);
return pair?`${pair[2]}:${pair[1]}`:key;
};
function aspectValue(key,item){
if(key==='source')return item.size.width/item.size.height;
return key==='free'?null:parseRatio(key);
}
function applyAspect(key){
const reference=referenceItem();
if(!reference?.size)return;
reference.aspectKey=key;
markAspect();
cropper.setAspect(aspectValue(key,reference));
}
function markAspect(){
const key=referenceItem()?.aspectKey??'free';
for(const button of el.aspectRow.querySelectorAll('button[data-aspect]')){
const active=button.dataset.aspect===key;
button.classList.toggle('active',active);
button.setAttribute('aria-pressed',String(active));
}
el.swapAspect.disabled=!/^\d+:\d+$/.test(key);
}
for(const control of[el.cropX,el.cropY,el.cropW,el.cropH]){
control.addEventListener('change',()=>{
cropper.setRect({
x:Number(el.cropX.value)||0,
y:Number(el.cropY.value)||0,
width:Number(el.cropW.value)||1,
height:Number(el.cropH.value)||1,
});
});
}
el.cropMax.addEventListener('click',()=>cropper.maximize());
el.cropCentre.addEventListener('click',()=>cropper.centre());
el.cropReset.addEventListener('click',()=>{
applyAspect('free');
cropper.reset();
});
el.cropApplyAll.addEventListener('click',()=>{
const reference=referenceItem();
if(!reference?.size||busy)return;
const fractions=toFractions(reference.crop,reference.size);
for(const item of items){
if(item.id===reference.id||!item.size)continue;
const rect=fromFractions(fractions,item.size);
item.aspectKey=reference.aspectKey;
const aspect=aspectValue(reference.aspectKey,item);
item.crop=aspect?ratioCrop(rect,aspect):rect;
}
clearResults();
render();
});
function writeCropFields(rect){
el.cropX.value=String(rect.x);
el.cropY.value=String(rect.y);
el.cropW.value=String(rect.width);
el.cropH.value=String(rect.height);
}
function field(input){
const value=Number.parseFloat(input.value);
return Number.isFinite(value)&&value>=1?Math.round(value):null;
}
function resizeSettings(){
return{
mode:el.resizeMode.value,
width:field(el.sizeW),
height:field(el.sizeH),
fit:el.fit.value,
longest:field(el.sizeLongest)??1,
percent:Number.parseFloat(el.sizePercent.value)||100,
noEnlarge:el.noEnlarge.checked,
};
}
function cropFor(item){
return item.crop??wholeOf(item.size);
}
function previewOf(item){
const crop=cropFor(item);
const laid=plan(crop,resizeSettings());
return{
...laid,
crop:laid.source,
untouched:el.format.value==='keep'&&isUntouched(item.size,laid),
};
}
function outputMime(sourceType){
const choice=el.format.value;
return choice==='keep'?keepFormat(sourceType,writable):choice;
}
el.run.addEventListener('click',async()=>{
if(!items.length||busy)return;
busy=true;
stopping=false;
clearResults();
clearLoadError();
render();
el.progress.hidden=false;
el.cancel.hidden=false;
const collected=[];
const failures=[];
let stopped=false;
try{
for(const[index,item]of items.entries()){
if(stopping){stopped=true;break;}
showProgress(index,items.length,item.file.name);
try{
collected.push(await processOne(item));
}catch(error){
failures.push(phrase('run.failed',{
name:item.file.name,
reason:phrase(error.message,error.values),
}));
}
await new Promise((resolve)=>setTimeout(resolve,0));
}
}finally{
busy=false;
stopping=false;
el.cancel.hidden=true;
el.progress.hidden=!stopped;
render();
}
if(stopped){
el.progressLabel.textContent=collected.length
?phrase('progress.stopped',{done:collected.length,total:items.length})
:phrase('progress.stopped.none');
}
if(failures.length)showLoadError(failures.join('\n'));
results=collected;
showResults();
});
el.cancel.addEventListener('click',()=>{stopping=true;});
function showProgress(index,total,name){
el.progressBar.style.width=`${Math.round((index / total) * 100)}%`;
el.progressLabel.textContent=phrase('progress.at',
{index:index+1,total,name});
}
async function processOne(item){
const laid=previewOf(item);
const base={item,name:item.file.name,before:item.file.size,size:item.size};
if(laid.untouched){
return{
...base,
blob:item.file,
after:item.file.size,
mime:item.file.type||JPEG,
crop:laid.source,
canvas:laid.canvas,
scale:1,
padded:false,
untouched:true,
outName:item.file.name,
};
}
const source=await decode(item.file);
try{
const mime=outputMime(item.file.type);
const blob=await renderImage(source.bitmap,laid,{
mime,
quality:Number(el.quality.value)/100,
background:el.background.value,
});
return{
...base,
blob,
after:blob.size,
mime,
crop:laid.source,
canvas:laid.canvas,
scale:laid.scale,
padded:laid.padded,
untouched:false,
outName:outName(item.file.name,mime,laid.canvas.width,laid.canvas.height),
};
}finally{
release(source.bitmap);
}
}
function clearResults(){
if(el.viewer.open)el.viewer.close();
for(const url of resultUrls)URL.revokeObjectURL(url);
resultUrls=[];
results=[];
el.resultList.replaceChildren();
el.results.hidden=true;
el.downloadZip.hidden=true;
el.resultsSummary.textContent='';
}
function showResults(){
el.resultList.replaceChildren();
if(!results.length)return;
el.results.hidden=false;
for(const result of results){
result.url=URL.createObjectURL(result.blob);
resultUrls.push(result.url);
el.resultList.appendChild(resultRow(result));
}
const before=results.reduce((n,r)=>n+r.before,0);
const after=results.reduce((n,r)=>n+r.after,0);
const untouched=results.filter((r)=>r.untouched).length;
const totals={
before:humanBytes(before),
after:humanBytes(after),
change:change(before,after),
};
el.resultsSummary.textContent=untouched===results.length
?phrase('results.nothing')
:untouched
?phrase(untouched===1?'results.totals.one':'results.totals.many',
{...totals,count:countOf(untouched)})
:phrase('results.totals',totals);
el.downloadZip.hidden=results.length<2;
el.downloadZip.onclick=async()=>{
el.downloadZip.disabled=true;
try{
const files=await Promise.all(results.map(async(r)=>({
name:r.outName,
data:new Uint8Array(await r.blob.arrayBuffer()),
})));
saveBlob(makeZip(files),'resized-images.zip');
}finally{
el.downloadZip.disabled=false;
}
};
}
function resultRow(result){
const li=document.createElement('li');
li.className='result-row';
if(result.untouched)li.classList.add('result-untouched');
const open=document.createElement('button');
open.type='button';
open.className='result-open';
open.title=phrase('result.open',{name:result.outName});
open.setAttribute('aria-label',open.title);
open.addEventListener('click',()=>openViewer(result));
const thumb=document.createElement('img');
thumb.className='result-thumb';
thumb.src=result.url;
thumb.alt='';
thumb.loading='lazy';
open.appendChild(thumb);
li.appendChild(open);
const text=document.createElement('div');
text.className='result-text';
const name=document.createElement('p');
name.className='result-name';
name.textContent=result.outName;
text.appendChild(name);
const headline=document.createElement('p');
headline.className='result-headline';
headline.textContent=headlineOf(result);
text.appendChild(headline);
const detail=document.createElement('p');
detail.className='result-detail';
detail.textContent=detailOf(result);
text.appendChild(detail);
li.appendChild(text);
const actions=document.createElement('div');
actions.className='result-actions';
const view=document.createElement('button');
view.type='button';
view.className='ghost';
view.textContent=phrase('result.view');
view.addEventListener('click',()=>openViewer(result));
actions.appendChild(view);
const link=document.createElement('a');
link.className='primary as-button';
link.href=result.url;
link.download=result.outName;
link.textContent=phrase('result.download');
actions.appendChild(link);
li.appendChild(actions);
return li;
}
function headlineOf(result){
return result.untouched
?phrase('result.head.untouched',{
size:dimensions(result.size.width,result.size.height),
bytes:humanBytes(result.before),
})
:phrase('result.head',{
before:dimensions(result.size.width,result.size.height),
after:dimensions(result.canvas.width,result.canvas.height),
beforebytes:humanBytes(result.before),
afterbytes:humanBytes(result.after),
change:change(result.before,result.after),
});
}
function detailOf(result){
return result.untouched
?phrase('result.untouched')
:phrase('plan.only',
{plan:describePlan(result.size,result.crop,result,result.mime)});
}
let viewing=null;
let viewingOriginal=false;
function openViewer(result){
viewing=result;
viewingOriginal=false;
paintViewer();
el.viewer.showModal();
}
function paintViewer(){
const result=viewing;
if(!result)return;
const original=viewingOriginal;
el.viewerName.textContent=result.outName;
el.viewerImage.src=original?result.item.thumbUrl:result.url;
el.viewerImage.alt=phrase(original?'viewer.alt.original':'viewer.alt.result',
{name:result.name});
el.viewerCaption.textContent=original
?phrase('viewer.caption.original',{
name:result.name,
size:dimensions(result.size.width,result.size.height),
})
:detailOf(result);
el.viewerCompare.hidden=result.untouched;
el.viewerCompare.textContent=
phrase(original?'viewer.showresult':'viewer.showoriginal');
el.viewerCompare.setAttribute('aria-pressed',String(original));
el.viewerDownload.href=result.url;
el.viewerDownload.download=result.outName;
el.viewerFacts.replaceChildren();
for(const[term,value]of viewerFacts(result)){
const row=document.createElement('div');
const dt=document.createElement('dt');
dt.textContent=term;
const dd=document.createElement('dd');
dd.textContent=value;
row.append(dt,dd);
el.viewerFacts.appendChild(row);
}
}
function viewerFacts(result){
const size=(w,h,n)=>`${dimensions(w, h)} · ${humanBytes(n)}`;
const facts=[
[phrase('fact.savedas'),result.outName],
[phrase('fact.format'),FORMATS[result.mime]?.label??result.mime],
[phrase('fact.before'),size(result.size.width,result.size.height,result.before)],
];
if(result.untouched){
facts.push([phrase('fact.after'),phrase('fact.after.same')]);
facts.push([phrase('fact.metadata'),phrase('fact.metadata.kept')]);
return facts;
}
facts.push([phrase('fact.after'),
size(result.canvas.width,result.canvas.height,result.after)]);
facts.push([phrase('fact.filesize'),change(result.before,result.after)]);
const cropped=result.crop.width!==result.size.width||result.crop.height!==result.size.height;
facts.push([phrase('fact.cropped'),cropped
?phrase('fact.crop.yes',{
size:dimensions(result.crop.width,result.crop.height),
x:result.crop.x,
y:result.crop.y,
})
:phrase('fact.crop.no')]);
facts.push([phrase('fact.scale'),
phrase(cropped?'fact.scale.crop':'fact.scale.original',
{percent:scaleText(result.scale)})]);
if(result.padded)facts.push([phrase('fact.padding'),phrase('fact.padding.yes')]);
if(FORMATS[result.mime]?.lossy)facts.push([phrase('fact.quality'),el.quality.value]);
facts.push([phrase('fact.metadata'),phrase('fact.metadata.gone')]);
return facts;
}
el.viewerCompare.addEventListener('click',()=>{
viewingOriginal=!viewingOriginal;
paintViewer();
});
el.viewerClose.addEventListener('click',()=>el.viewer.close());
el.viewer.addEventListener('click',(event)=>{
if(event.target===el.viewer)el.viewer.close();
});
el.viewer.addEventListener('close',()=>{
viewing=null;
viewingOriginal=false;
el.viewerImage.removeAttribute('src');
});
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
async function checkEncoders(){
writable=await encodableTypes();
if(writable.has(WEBP))return;
for(const option of el.format.options){
if(option.value===WEBP){
option.disabled=true;
option.textContent=phrase('format.webp.no');
}
}
if(el.format.value===WEBP)el.format.value='keep';
render();
}
window.addEventListener('error',(event)=>{
showLoadError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showLoadError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
markAspect();
render();
checkEncoders();
document.getElementById('boot-warning')?.remove();
