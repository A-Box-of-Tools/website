/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=3e8b71192e';
import{sizeText}from'./shared/format.js?v=3e8b71192e';
import{messageBox}from'./shared/message-box.js?v=3e8b71192e';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=3e8b71192e';
import{loadImages,releaseItem,rotateItem,sortItems,moveItem}from'./images.js?v=3e8b71192e';
import{layoutPage,seenSize,PAGE_SIZES}from'./layout.js?v=3e8b71192e';
import{buildDocument}from'./document.js?v=3e8b71192e';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
loadError:$('load-error'),
list:$('image-list'),
listToolbar:$('list-toolbar'),
countLabel:$('count-label'),
reorderHint:$('reorder-hint'),
clearAll:$('clear-all'),
pageSize:$('page-size'),
customSize:$('custom-size'),
customWidth:$('custom-width'),
customHeight:$('custom-height'),
customUnit:$('custom-unit'),
sizeNote:$('size-note'),
dpiField:$('dpi-field'),
dpi:$('dpi'),
orientationField:$('orientation-field'),
orientation:$('orientation'),
fitField:$('fit-field'),
fit:$('fit'),
margin:$('margin'),
background:$('background'),
mode:$('mode'),
modeNote:$('mode-note'),
qualityField:$('quality-field'),
quality:$('quality'),
maxSide:$('max-side'),
shrinkNote:$('shrink-note'),
docTitle:$('doc-title'),
docAuthor:$('doc-author'),
fileName:$('file-name'),
dated:$('dated'),
preview:$('preview'),
previewEmpty:$('preview-empty'),
previewNav:$('preview-nav'),
previewPrev:$('preview-prev'),
previewNext:$('preview-next'),
previewLabel:$('preview-label'),
sumPages:$('sum-pages'),
sumSize:$('sum-size'),
sumInput:$('sum-input'),
sumCopied:$('sum-copied'),
exportBtn:$('export'),
cancelBtn:$('cancel'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
error:$('error'),
result:$('result'),
resultInfo:$('result-info'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showError,clear:clearError}=messageBox(el.error);
const{show:showLoadError,clear:clearLoadError}=messageBox(el.loadError);
const formatBytes=(n)=>sizeText(n,phrase,{under:'size.b',kb:0,mb:1});
let items=[];
let exporting=false;
let cancelled=false;
let abortController=null;
let resultUrl=null;
let previewAt=0;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
addFiles(files);
},
});
async function addFiles(files){
if(!files?.length||exporting)return;
picker.busy(readingLabel(files.length));
try{
const{items:added,skipped}=await loadImages(files);
items.push(...added);
if(skipped.length){
showLoadError(skipped.map(({key,values})=>phrase(key,values)).join('\n'));
}else clearLoadError();
}finally{
picker.done();
}
render();
}
let dragIndex=null;
let dropAt=null;
function clearDropMarkers(){
for(const node of el.list.querySelectorAll('.insert-before, .insert-after')){
node.classList.remove('insert-before','insert-after');
}
}
function buildItemNode(item,index){
const li=document.createElement('li');
li.className='image-item';
li.dataset.index=String(index);
const handle=document.createElement('button');
handle.type='button';
handle.className='drag-handle';
handle.draggable=true;
handle.textContent='⋮⋮';
const dragLabel=phrase('drag.move',{name:item.name});
handle.title=dragLabel;
handle.setAttribute('aria-label',dragLabel);
const thumbWrap=document.createElement('div');
thumbWrap.className='thumb-wrap';
thumbWrap.draggable=true;
const canvas=document.createElement('canvas');
canvas.className='thumb';
drawThumb(canvas,item);
thumbWrap.append(canvas);
const badge=document.createElement('span');
badge.className='order-badge';
badge.textContent=String(index+1);
thumbWrap.append(badge);
const remove=document.createElement('button');
remove.type='button';
remove.className='remove-btn';
remove.textContent='×';
const removeLabel=phrase('tile.remove',{name:item.name});
remove.title=removeLabel;
remove.setAttribute('aria-label',removeLabel);
remove.addEventListener('click',()=>{
if(exporting)return;
releaseItem(item);
items.splice(index,1);
render();
});
thumbWrap.append(remove);
const meta=document.createElement('div');
meta.className='image-meta';
const seen=seenSize(item);
const name=document.createElement('p');
name.className='image-name';
name.textContent=item.name;
name.title=phrase('join.dash',{
a:item.name,
b:phrase('size.plain',{width:seen.width,height:seen.height}),
});
meta.append(name);
const dims=document.createElement('p');
dims.className='image-dims';
dims.textContent=phrase('join.dot',{
a:phrase('size.plain',{width:seen.width,height:seen.height}),
b:formatBytes(item.file.size),
});
meta.append(dims);
const controls=document.createElement('div');
controls.className='image-controls';
controls.append(
tileButton('↺',phrase('tile.left',{name:item.name}),false,()=>{
if(exporting)return;
rotateItem(item,-1);
render();
}),
tileButton('↻',phrase('tile.right',{name:item.name}),false,()=>{
if(exporting)return;
rotateItem(item,1);
render();
}),
tileButton('‹',phrase('tile.earlier',{name:item.name}),index===0,()=>{
if(exporting)return;
moveItem(items,index,index-1);
render();
}),
tileButton('›',phrase('tile.later',{name:item.name}),index===items.length-1,()=>{
if(exporting)return;
moveItem(items,index,index+1);
render();
}),
);
meta.append(controls);
li.append(handle,thumbWrap,meta);
const startDrag=(event)=>{
if(exporting){event.preventDefault();return;}
dragIndex=index;
li.classList.add('dragging');
event.dataTransfer.effectAllowed='move';
event.dataTransfer.setData('text/plain',String(index));
};
const endDrag=()=>{
dragIndex=null;
dropAt=null;
li.classList.remove('dragging');
clearDropMarkers();
};
for(const source of[handle,thumbWrap]){
source.addEventListener('dragstart',startDrag);
source.addEventListener('dragend',endDrag);
}
li.addEventListener('dragover',(event)=>{
if(dragIndex===null)return;
event.preventDefault();
event.dataTransfer.dropEffect='move';
const rect=li.getBoundingClientRect();
const after=event.clientX>rect.left+rect.width/2;
clearDropMarkers();
li.classList.add(after?'insert-after':'insert-before');
dropAt={index,after};
});
li.addEventListener('drop',(event)=>{
event.preventDefault();
event.stopPropagation();
applyDrop();
});
return li;
}
function tileButton(glyph,label,disabled,onClick){
const button=document.createElement('button');
button.type='button';
button.className='tile-btn';
button.textContent=glyph;
button.title=label;
button.setAttribute('aria-label',label);
button.disabled=disabled;
button.addEventListener('click',onClick);
return button;
}
function drawThumb(canvas,item){
const image=item.thumb.image;
if(!image.naturalWidth)return;
const turned=item.rotate===90||item.rotate===270;
canvas.width=turned?image.naturalHeight:image.naturalWidth;
canvas.height=turned?image.naturalWidth:image.naturalHeight;
const ctx=canvas.getContext('2d');
ctx.save();
ctx.translate(canvas.width/2,canvas.height/2);
ctx.rotate((item.rotate*Math.PI)/180);
ctx.drawImage(image,-image.naturalWidth/2,-image.naturalHeight/2);
ctx.restore();
}
function applyDrop(){
if(dragIndex===null||dropAt===null){
clearDropMarkers();
return;
}
let target=dropAt.after?dropAt.index+1:dropAt.index;
if(dragIndex<target)target-=1;
const from=dragIndex;
dragIndex=null;
dropAt=null;
if(from===target){
clearDropMarkers();
return;
}
moveItem(items,from,target);
render();
}
el.list.addEventListener('dragover',(event)=>{
if(dragIndex!==null)event.preventDefault();
});
el.list.addEventListener('drop',(event)=>{
if(dragIndex===null)return;
event.preventDefault();
applyDrop();
});
for(const button of document.querySelectorAll('[data-sort]')){
button.addEventListener('click',()=>{
if(exporting)return;
sortItems(items,button.dataset.sort);
render();
});
}
el.clearAll.addEventListener('click',()=>{
if(!items.length||exporting)return;
for(const item of items)releaseItem(item);
items=[];
clearLoadError();
render();
});
function currentSettings(){
return{
pageSize:el.pageSize.value,
customWidth:Number(el.customWidth.value),
customHeight:Number(el.customHeight.value),
customUnit:el.customUnit.value,
dpi:Number(el.dpi.value),
orientation:el.orientation.value,
fit:el.fit.value,
margin:Number(el.margin.value),
background:el.background.value,
mode:el.mode.value,
quality:Number(el.quality.value),
maxSide:Number(el.maxSide.value),
title:el.docTitle.value,
author:el.docAuthor.value,
dated:el.dated.checked,
};
}
function syncSettingVisibility(){
const fitPage=el.pageSize.value==='fit';
el.customSize.hidden=el.pageSize.value!=='custom';
el.dpiField.hidden=!fitPage;
el.orientationField.hidden=fitPage;
el.fitField.hidden=fitPage;
el.qualityField.hidden=el.mode.value==='lossless';
el.sizeNote.textContent=phrase(fitPage?'note.fit':'note.page');
el.modeNote.textContent=phrase(`note.mode.${el.mode.value}`);
el.shrinkNote.textContent=phrase(el.maxSide.value==='0'
?'note.full':'note.shrink');
}
const settingInputs=[
[el.pageSize,'change'],[el.customWidth,'input'],[el.customHeight,'input'],
[el.customUnit,'change'],[el.dpi,'change'],[el.orientation,'change'],
[el.fit,'change'],[el.margin,'input'],[el.background,'input'],
[el.mode,'change'],[el.quality,'change'],[el.maxSide,'change'],
];
for(const[input,type]of settingInputs){
input.addEventListener(type,()=>{
clearResult();
refresh();
});
}
el.previewPrev.addEventListener('click',()=>{
previewAt=Math.max(0,previewAt-1);
drawPreview();
});
el.previewNext.addEventListener('click',()=>{
previewAt=Math.min(items.length-1,previewAt+1);
drawPreview();
});
const PREVIEW_MAX=360;
function drawPreview(){
const ctx=el.preview.getContext('2d');
previewAt=Math.min(previewAt,Math.max(0,items.length-1));
const any=items.length>0;
el.preview.classList.toggle('empty',!any);
el.previewEmpty.hidden=any;
el.previewNav.hidden=items.length<2;
el.previewLabel.textContent=phrase('preview.page',
{n:previewAt+1,total:items.length});
el.previewPrev.disabled=previewAt===0;
el.previewNext.disabled=previewAt>=items.length-1;
if(!any)return;
const item=items[previewAt];
const page=layoutPage(item,currentSettings());
const scale=PREVIEW_MAX/Math.max(page.width,page.height);
const ratio=Math.min(2,window.devicePixelRatio||1);
el.preview.width=Math.max(1,Math.round(page.width*scale*ratio));
el.preview.height=Math.max(1,Math.round(page.height*scale*ratio));
el.preview.style.width=`${Math.round(page.width * scale)}px`;
el.preview.style.height=`${Math.round(page.height * scale)}px`;
ctx.setTransform(scale*ratio,0,0,scale*ratio,0,0);
ctx.fillStyle=el.background.value;
ctx.fillRect(0,0,page.width,page.height);
const image=item.thumb.image;
if(!image.naturalWidth)return;
ctx.save();
if(page.clip){
ctx.beginPath();
ctx.rect(page.clip.x,page.height-page.clip.y-page.clip.height,
page.clip.width,page.clip.height);
ctx.clip();
}
const{rect}=page;
ctx.translate(rect.x+rect.width/2,page.height-rect.y-rect.height/2);
ctx.rotate((item.rotate*Math.PI)/180);
const turned=item.rotate===90||item.rotate===270;
const width=turned?rect.height:rect.width;
const height=turned?rect.width:rect.height;
ctx.drawImage(image,-width/2,-height/2,width,height);
ctx.restore();
}
function render(){
clearResult();
el.list.replaceChildren(...items.map(buildItemNode));
refresh();
}
const EMPTY='\u2014';
function refresh(){
const any=items.length>0;
el.listToolbar.hidden=!any;
el.reorderHint.hidden=items.length<2;
el.countLabel.textContent=phrase(items.length===1?'n.image.one':'n.image.many',
{n:items.length});
el.exportBtn.disabled=!any||exporting;
syncSettingVisibility();
updateSummary();
drawPreview();
}
function updateSummary(){
const settings=currentSettings();
el.sumPages.textContent=items.length
?phrase(items.length===1?'n.page.one':'n.page.many',{n:items.length})
:EMPTY;
el.sumSize.textContent=describePageSize(settings);
const bytes=items.reduce((total,item)=>total+item.file.size,0);
el.sumInput.textContent=items.length?formatBytes(bytes):EMPTY;
const kept=items.filter((item)=>likelyCopied(item,settings)).length;
el.sumCopied.textContent=items.length
?phrase('sum.copied',{kept,total:items.length}):EMPTY;
}
function likelyCopied(item,settings){
if(settings.mode!=='keep')return false;
if(settings.maxSide&&Math.max(item.width,item.height)>settings.maxSide)return false;
return/^image\/jpe?g$/i.test(item.file.type)||/\.jpe?g$/i.test(item.name);
}
function describePageSize(settings){
if(!items.length)return EMPTY;
if(settings.pageSize==='fit')return phrase('page.fit');
const named=PAGE_SIZES[settings.pageSize];
const label=named
?phrase('page.mm',{width:trim(named[0]),height:trim(named[1])})
:phrase('page.custom',{
width:trim(settings.customWidth),
height:trim(settings.customHeight),
unit:settings.customUnit,
});
let way=`page.${settings.orientation}`;
if(settings.orientation==='auto'){
const upright=items.filter((item)=>{
const seen=seenSize(item);
return seen.height>=seen.width;
}).length;
way=upright&&upright<items.length
?'page.mixed'
:(upright?'page.portrait':'page.landscape');
}
return phrase('join.comma',{a:label,b:phrase(way)});
}
function trim(value){
return String(Math.round(Number(value)*10)/10);
}
function clearResult(){
if(resultUrl){
URL.revokeObjectURL(resultUrl);
resultUrl=null;
}
el.result.hidden=true;
el.download.removeAttribute('href');
}
function outputName(){
const typed=el.fileName.value.trim().replace(/\.pdf$/i,'');
const safe=typed.replace(/[\\/:*?"<>|]/g,'-').slice(0,120).trim();
return`${safe || 'images'}.pdf`;
}
async function runExport(){
if(!items.length||exporting)return;
exporting=true;
cancelled=false;
abortController=new AbortController();
clearError();
clearResult();
el.exportBtn.disabled=true;
el.cancelBtn.hidden=false;
el.progress.hidden=false;
el.progressBar.style.width='0%';
el.progressLabel.textContent=phrase('step.starting');
const queue=items.map((item)=>({...item}));
try{
const{blob,pages,copied}=await buildDocument(queue,currentSettings(),{
signal:abortController.signal,
onProgress:({done,total,name})=>{
el.progressBar.style.width=`${Math.round((done / total) * 100)}%`;
el.progressLabel.textContent=done<total
?phrase('step.page',{n:done+1,total,name})
:phrase('step.writing');
},
});
resultUrl=URL.createObjectURL(blob);
el.download.href=resultUrl;
el.download.download=outputName();
el.resultInfo.textContent=phrase('join.sentences',{
a:phrase(pages===1?'result.one':'result.many',
{n:pages,size:formatBytes(blob.size)}),
b:phrase(copied?(copied===1?'result.copied.one':'result.copied.many')
:'result.copied.none',{copied,total:pages}),
});
el.result.hidden=false;
}catch(error){
cancelled=error?.name==='AbortError';
if(cancelled)el.progressLabel.textContent=phrase('step.cancelled');
else showError(phrase(error?.message??String(error)));
}finally{
exporting=false;
abortController=null;
el.cancelBtn.hidden=true;
el.exportBtn.disabled=!items.length;
el.progress.hidden=!cancelled;
}
}
el.exportBtn.addEventListener('click',runExport);
el.cancelBtn.addEventListener('click',()=>abortController?.abort());
window.addEventListener('beforeunload',(event)=>{
if(!exporting)return;
event.preventDefault();
event.returnValue='';
});
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
render();
document.getElementById('boot-warning')?.remove();
