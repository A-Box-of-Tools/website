/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{
decode,encodableTypes,keepFormat,release,render as renderImage,
FORMATS,JPEG,PNG,WEBP,READABLE,
}from'./codecs.js';
import{
fromFractions,isUntouched,parseRatio,plan,ratioCrop,toFractions,wholeOf,
}from'./geometry.js';
import{Cropper}from'./cropper.js';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js';
import{
bytes as humanBytes,change,countOf,describePlan,dimensions,outName,scaleText,
}from'./files.js';
import{makeZip}from'./shared/zip.js';
const $=(id)=>document.getElementById(id);
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
networkCount:$('network-count'),
networkDot:$('network-dot'),
offlineStatus:$('offline-status'),
offlineDot:$('offline-dot'),
};
let items=[];
let nextId=1;
let busy=false;
let referenceId=null;
let results=[];
let resultUrls=[];
let writable=new Set([JPEG,PNG]);
let loadingPreview=false;
const cropper=new Cropper(el.stage,{
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
failures.push(`${file.name}: not an image this tool can read.`);
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
item.size=await measure(item.thumbUrl);
if(!item.size){
URL.revokeObjectURL(item.thumbUrl);
failures.push(`${file.name}: this browser could not decode it.`);
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
function measure(url){
return new Promise((resolve)=>{
const img=new Image();
img.onload=()=>resolve({width:img.naturalWidth,height:img.naturalHeight});
img.onerror=()=>resolve(null);
img.src=url;
});
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
el.preview.alt=`Preview of ${reference.file.name}`;
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
?`${countOf(items.length)}, ${humanBytes(totalBytes())} in total`
:'';
renderList();
renderCropCard();
renderSizeFields();
renderFormatFields();
renderSummaries();
el.run.disabled=!any||busy;
el.run.textContent=items.length===1?'Resize the image':'Resize the images';
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
main.title=shown
?`${item.file.name} is the one in the crop preview`
:`Draw the crop box on ${item.file.name}`;
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
badge.textContent='In the preview';
main.appendChild(badge);
}
li.appendChild(main);
const remove=document.createElement('button');
remove.type='button';
remove.className='row-remove';
remove.title=`Take ${item.file.name} off the list`;
remove.setAttribute('aria-label',`Take ${item.file.name} off the list`);
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
?'Nothing is being changed, so this one is passed through exactly as it is.'
:`becomes ${dimensions(outcome.canvas.width, outcome.canvas.height)}`;
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
el.stageName.textContent=others.length?`Drawing on ${reference.file.name}. `:'';
el.applyRow.hidden=!others.length;
el.applyNote.textContent=others.length
?applyNoteText(reference,others.length)
:'';
if(!others.length){
el.stageNote.hidden=true;
return;
}
el.stageNote.hidden=false;
el.stageNote.textContent=`Every image keeps its own box. ${othersNoteText(others)}`;
}
function othersNoteText(others){
const cropped=others.filter(isCropped);
if(others.length===1){
return cropped.length
?`${others[0].file.name} has a box of its own.`
:`${others[0].file.name} is still on the whole picture - pick it from the list above to crop that one too.`;
}
if(!cropped.length){
return`The other ${countOf(others.length)} are still on the whole picture - pick one from `
+'the list above to crop it.';
}
if(cropped.length===others.length){
return others.length===2
?'Both of the others have a box of their own.'
:`All ${others.length} of the others have a box of their own.`;
}
return`${cropped.length} of the other ${others.length} ${cropped.length === 1 ? 'has' : 'have'} `
+'a box of its own; the rest are still on the whole picture.';
}
function applyNoteText(reference,count){
const same=items.every((i)=>i.size
&&i.size.width===reference.size.width&&i.size.height===reference.size.height);
if(same){
return`Every image on the list is exactly this size, so ${count === 1 ? 'the other one gets' : 'they all get'} `
+'exactly this box.';
}
return reference.aspectKey==='free'
?'The same relative area on each - the same fractions of its own width and height - because '
+'they are not all the same size.'
:`The largest ${aspectLabel(reference.aspectKey)} box that fits the same relative area of each, `
+'so every result comes out the shape you locked even though they are not all the same size.';
}
function isCropped(item){
return Boolean(item.size&&item.crop
&&(item.crop.width!==item.size.width||item.crop.height!==item.size.height));
}
function aspectLabel(key){
return key==='source'?"picture's own shape":key;
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
const note={
keep:'A JPEG stays a JPEG, a PNG stays a PNG. Anything this browser cannot write - a GIF, a BMP - comes out as PNG, which keeps transparency and flat colour.',
[JPEG]:'Small and universal, and no transparency: anything see-through is filled with the background colour.',
[PNG]:'Lossless and transparent, and much larger than the other two on a photograph.',
[WEBP]:'Smaller than JPEG at the same quality, keeps transparency, and every current browser opens it.',
}[choice]??'';
el.formatNote.textContent=note;
}
function renderSummaries(){
const reference=referenceItem();
if(!reference?.size){
el.sizeSummary.textContent='Add an image and this will say exactly what it becomes.';
el.planSummary.textContent='';
return;
}
const outcome=previewOf(reference);
const crop=outcome.crop;
const cropped=crop.width!==reference.size.width||crop.height!==reference.size.height;
const name=reference.file.name;
if(outcome.untouched){
el.sizeSummary.textContent=`Nothing is being changed: ${name} is `
+`${dimensions(reference.size.width, reference.size.height)} and comes back exactly as it `
+'went in, byte for byte.';
}else{
const from=cropped?'of what the box keeps':'of the original';
const scale=outcome.scale>1
?`enlarged to ${scaleText(outcome.scale)} ${from}`
:`${scaleText(outcome.scale)} ${from}`;
el.sizeSummary.textContent=`${name} is ${dimensions(reference.size.width, reference.size.height)}.`
+(cropped?` The box keeps ${dimensions(crop.width, crop.height)} of it.`:'')
+` It comes out ${dimensions(outcome.canvas.width, outcome.canvas.height)}`
+(outcome.padded
?` - the picture at ${scale}, on a background filling the rest of that frame.`
:` - ${scale}.`);
}
const mime=outputMime(reference.file.type);
const rest=items.length===1
?''
:items.length===2
?' The other image gets the same size and format settings, with its own crop.'
:` The other ${countOf(items.length - 1)} get the same size and format settings, each with its own crop.`;
const nothingAtAll=el.format.value==='keep'
&&items.every((i)=>i.size&&previewOf(i).untouched);
el.planSummary.textContent=nothingAtAll
?'Nothing is cropped, nothing is resized and the format is unchanged, so there is nothing '
+'to re-encode: every file is handed straight back byte for byte, EXIF tags and all, '
+'because none of them is ever opened up.'
:`${items.length === 1 ? 'The image is' : `${name} is`} `
+`${describePlan(reference.size, crop, outcome, mime).replace(/\.$/, '')}`
+` - and the EXIF and GPS tags do not survive, because a canvas holds pixels and nothing else.${rest}`;
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
clearResults();
clearLoadError();
render();
el.progress.hidden=false;
const collected=[];
const failures=[];
try{
for(const[index,item]of items.entries()){
showProgress(index,items.length,item.file.name);
try{
collected.push(await processOne(item));
}catch(error){
failures.push(`${item.file.name}: ${error.message}`);
}
await new Promise((resolve)=>setTimeout(resolve,0));
}
}finally{
busy=false;
el.progress.hidden=true;
render();
}
if(failures.length)showLoadError(failures.join('\n'));
results=collected;
showResults();
});
function showProgress(index,total,name){
el.progressBar.style.width=`${Math.round((index / total) * 100)}%`;
el.progressLabel.textContent=`${index + 1} of ${total}: ${name}`;
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
const totals=`${humanBytes(before)} in, ${humanBytes(after)} out - ${change(before, after)}.`;
el.resultsSummary.textContent=untouched===results.length
?'Nothing was asked for, so nothing was done: every file came back exactly as it went in.'
:untouched
?`${totals} ${countOf(untouched)} needed no change and were passed straight through.`
:totals;
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
open.title=`Look at ${result.outName} full size`;
open.setAttribute('aria-label',`Look at ${result.outName} full size`);
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
view.textContent='View';
view.addEventListener('click',()=>openViewer(result));
actions.appendChild(view);
const link=document.createElement('a');
link.className='primary as-button';
link.href=result.url;
link.download=result.outName;
link.textContent='Download';
actions.appendChild(link);
li.appendChild(actions);
return li;
}
function headlineOf(result){
return result.untouched
?`${dimensions(result.size.width, result.size.height)} · ${humanBytes(result.before)} - unchanged`
:`${dimensions(result.size.width, result.size.height)} → ${dimensions(result.canvas.width, result.canvas.height)}`
+` · ${humanBytes(result.before)} → ${humanBytes(result.after)} · ${change(result.before, result.after)}`;
}
function detailOf(result){
return result.untouched
?'Passed through byte for byte, metadata and all: nothing about this file was being changed.'
:describePlan(result.size,result.crop,result,result.mime);
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
el.viewerImage.alt=`${original ? 'The original' : 'The result'}: ${result.name}`;
el.viewerCaption.textContent=original
?`The original ${result.name}, at ${dimensions(result.size.width, result.size.height)}. Both are shown at the size this dialog has room for, which is the only fair way to compare them.`
:detailOf(result);
el.viewerCompare.hidden=result.untouched;
el.viewerCompare.textContent=original?'Show the result':'Show the original';
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
const facts=[
['Saved as',result.outName],
['Format',FORMATS[result.mime]?.label??result.mime],
['Before',`${dimensions(result.size.width, result.size.height)} · ${humanBytes(result.before)}`],
];
if(result.untouched){
facts.push(['After','the same file, byte for byte']);
facts.push(['Metadata','kept - this file was never opened up']);
return facts;
}
facts.push(['After',`${dimensions(result.canvas.width, result.canvas.height)} · ${humanBytes(result.after)}`]);
facts.push(['File size',change(result.before,result.after)]);
const cropped=result.crop.width!==result.size.width||result.crop.height!==result.size.height;
facts.push(['Cropped',cropped
?`${dimensions(result.crop.width, result.crop.height)}, from ${result.crop.x} across and ${result.crop.y} down`
:'no - the whole picture went through']);
facts.push(['Scale',`${scaleText(result.scale)} of ${cropped ? 'the crop' : 'the original'}`]);
if(result.padded)facts.push(['Padding','yes - the picture sits on the background colour']);
if(FORMATS[result.mime]?.lossy)facts.push(['Quality',el.quality.value]);
facts.push(['Metadata','not carried over - a canvas holds pixels and nothing else']);
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
function saveBlob(blob,name){
const url=URL.createObjectURL(blob);
const link=document.createElement('a');
link.href=url;
link.download=name;
link.click();
setTimeout(()=>URL.revokeObjectURL(url),60000);
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
const platformNote=platform.size===0
?''
:` The page's own ad, measurement and donate-button scripts loaded from ${platform.size} host${platform.size === 1 ? '' : 's'}; not one of them was given an image or a byte of one.`;
el.networkCount.textContent=clean
?`your images have gone nowhere. ${total} files loaded, all of them this page's own.${platformNote}`
:`something contacted ${[...unexplained].join(', ')}, which this tool never does. Treat that as worth investigating.${platformNote}`;
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
async function checkEncoders(){
writable=await encodableTypes();
if(writable.has(WEBP))return;
for(const option of el.format.options){
if(option.value===WEBP){
option.disabled=true;
option.textContent='WebP - not supported by this browser';
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
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
