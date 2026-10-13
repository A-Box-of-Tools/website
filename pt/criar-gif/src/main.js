/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase,ltr}from'./shared/phrases.js?v=009daccc92';
import{sizeText,durationText}from'./shared/format.js?v=009daccc92';
import{messageBox}from'./shared/message-box.js?v=009daccc92';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=009daccc92';
import{
loadImages,releaseItem,sortItems,moveItem,decodeFull,
clampDelay,boundDelay,frameDelays,DEFAULT_DELAY,MIN_DELAY,MAX_DELAY,
}from'./images.js?v=009daccc92';
import{drawFrame,resolveOutputSize,MAX_SIDE}from'./compose.js?v=009daccc92';
import{encodeGif,loopValue}from'./encode.js?v=009daccc92';
import{makeExample}from'./example.js?v=009daccc92';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
list:$('frame-list'),
listToolbar:$('list-toolbar'),
reorderHint:$('reorder-hint'),
countLabel:$('count-label'),
clearAll:$('clear-all'),
bulk:$('bulk-delay'),
bulkAmount:$('bulk-amount'),
bulkUnit:$('bulk-unit'),
bulkNote:$('bulk-note'),
applyBulk:$('apply-bulk'),
size:$('size'),
sizeCustom:$('size-custom'),
customWidth:$('custom-width'),
customHeight:$('custom-height'),
sizeNote:$('size-note'),
fit:$('fit'),
background:$('background'),
backgroundField:$('background-field'),
colors:$('colors'),
paletteMode:$('palette-mode'),
paletteNote:$('palette-note'),
dither:$('dither'),
loopMode:$('loop-mode'),
loopTimes:$('loop-times'),
transparent:$('transparent'),
transparentNote:$('transparent-note'),
previewFrame:$('preview-frame'),
preview:$('preview'),
previewEmpty:$('preview-empty'),
sumFrames:$('sum-frames'),
sumDuration:$('sum-duration'),
sumSize:$('sum-size'),
sumLoop:$('sum-loop'),
exportBtn:$('export'),
cancelBtn:$('cancel'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
error:$('error'),
result:$('result'),
resultImage:$('result-image'),
resultInfo:$('result-info'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showError,clear:clearError}=messageBox(el.error);
const formatBytes=(n)=>sizeText(n,phrase,{kb:0,mb:1});
const formatDuration=(seconds)=>durationText(seconds,phrase,{decimals:2});
let items=[];
let exporting=false;
let activeExport=null;
let planRevision=0;
let settingsState=null;
let lastResultUrl=null;
let previewToken=0;
const errorKeys=new Set([...document.querySelectorAll('#phrases [data-phrase]')]
.map((element)=>element.dataset.phrase));
function clearResult(){
el.resultImage.removeAttribute('src');
el.download.removeAttribute('href');
el.download.removeAttribute('download');
el.resultInfo.textContent='';
el.result.hidden=true;
if(lastResultUrl)URL.revokeObjectURL(lastResultUrl);
lastResultUrl=null;
}
function retireExport(){
activeExport?.controller.abort();
activeExport=null;
exporting=false;
el.progress.hidden=true;
el.cancelBtn.hidden=true;
el.exportBtn.disabled=items.length===0;
}
function changedPlan(){
planRevision+=1;
retireExport();
clearResult();
}
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
addFiles(files);
},
example:makeExample,
});
async function addFiles(files){
if(!files?.length)return;
picker.busy(readingLabel(files.length));
try{
const{items:loaded,skipped}=await loadImages(files,defaultDelay());
if(loaded.length){
items=items.concat(loaded);
changedPlan();
}
if(skipped.length){
const names=skipped.slice(0,3)
.reduce((a,b)=>phrase('join.comma',{a,b}));
showError(phrase(skipped.length===1?'read.skipped.one':'read.skipped.many',{
n:skipped.length,
names:skipped.length>3?phrase('list.more',{names}):names,
}));
}else{
clearError();
}
}finally{
picker.done();
}
render();
}
function defaultDelayFrom(unit){
const typed=Number(el.bulkAmount.value);
if(!Number.isFinite(typed)||typed<=0)return DEFAULT_DELAY;
return unit==='fps'?boundDelay(1/typed):clampDelay(typed);
}
const defaultDelay=()=>defaultDelayFrom(el.bulkUnit.value);
let view='large';
let dragIndex=null;
let dropAt=null;
function clearDropMarkers(){
for(const node of el.list.querySelectorAll('.insert-before, .insert-after')){
node.classList.remove('insert-before','insert-after');
}
}
function buildItemNode(item,index,delay){
const li=document.createElement('li');
li.className='frame-item';
li.dataset.index=String(index);
li.dataset.itemId=String(item.id);
const handle=document.createElement('button');
handle.type='button';
handle.className='drag-handle';
handle.draggable=true;
handle.textContent='⋮⋮';
const dragLabel=phrase('tile.drag',{name:item.name});
handle.title=dragLabel;
handle.setAttribute('aria-label',dragLabel);
const thumbWrap=document.createElement('div');
thumbWrap.className='thumb-wrap';
thumbWrap.draggable=true;
const img=document.createElement('img');
img.src=item.thumbUrl;
img.alt=item.name;
img.draggable=false;
thumbWrap.append(img);
const badge=document.createElement('span');
badge.className='order-badge';
badge.textContent=String(index+1);
thumbWrap.append(badge);
const remove=document.createElement('button');
remove.type='button';
remove.className='remove-btn';
remove.textContent='×';
remove.title=phrase('tile.remove',{name:item.name});
remove.setAttribute('aria-label',remove.title);
remove.addEventListener('click',()=>{
releaseItem(item);
items.splice(index,1);
changedPlan();
const neighbor=items[Math.min(index,items.length-1)];
render({itemId:neighbor?.id,action:'remove'});
});
thumbWrap.append(remove);
const meta=document.createElement('div');
meta.className='frame-meta';
const name=document.createElement('p');
name.className='frame-name';
name.textContent=item.name;
const dimensions=ltr(`${item.width}×${item.height}`);
name.title=phrase('tile.name',{name:item.name,dimensions});
meta.append(name);
const controls=document.createElement('div');
controls.className='frame-controls';
const amount=document.createElement('input');
amount.type='number';
amount.min=String(MIN_DELAY);
amount.max=String(MAX_DELAY);
amount.step='0.01';
amount.value=String(delay/100);
amount.setAttribute('aria-label',phrase('tile.delay',{name:item.name}));
amount.addEventListener('change',()=>{
const before=frameDelays(items)[index]/100;
const requested=clampDelay(amount.value);
if(requested!==before){
item.delay=requested;
changedPlan();
}
refreshDelays();
updateSummary();
});
controls.append(amount);
const unit=document.createElement('span');
unit.className='unit';
unit.textContent=phrase('tile.seconds');
controls.append(unit);
const earlier=document.createElement('button');
earlier.type='button';
earlier.className='move-btn';
earlier.dataset.action='earlier';
earlier.textContent='‹';
earlier.title=phrase('tile.earlier',{name:item.name});
earlier.setAttribute('aria-label',earlier.title);
earlier.disabled=index===0;
earlier.addEventListener('click',()=>{
moveItem(items,index,index-1);
changedPlan();
render({itemId:item.id,action:'earlier'});
});
controls.append(earlier);
const later=document.createElement('button');
later.type='button';
later.className='move-btn';
later.dataset.action='later';
later.textContent='›';
later.title=phrase('tile.later',{name:item.name});
later.setAttribute('aria-label',later.title);
later.disabled=index===items.length-1;
later.addEventListener('click',()=>{
moveItem(items,index,index+1);
changedPlan();
render({itemId:item.id,action:'later'});
});
controls.append(later);
meta.append(controls);
li.append(handle,thumbWrap,meta);
const startDrag=(event)=>{
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
changedPlan();
render();
}
function refreshDelays(){
const delays=frameDelays(items);
const inputs=[...el.list.children].map((row)=>row.querySelector('input'));
for(const[index,input]of inputs.entries()){
input.value=String(delays[index]/100);
}
}
function restoreItemFocus({itemId,action}){
const row=[...el.list.children].find((node)=>node.dataset.itemId===String(itemId));
if(!row){
el.fileInput.focus();
return;
}
const wanted=action==='remove'?row.querySelector('.remove-btn')
:row.querySelector(`[data-action="${action}"]`);
const available=[...row.querySelectorAll('.move-btn')].find((button)=>!button.disabled);
const target=wanted&&!wanted.disabled?wanted
:available??row.querySelector('.drag-handle');
target.focus();
}
function render(focus){
const delays=frameDelays(items);
el.list.replaceChildren(...items.map((item,index)=>buildItemNode(item,index,delays[index])));
el.list.className=`frame-list view-${view}`;
const any=items.length>0;
el.listToolbar.hidden=!any;
el.reorderHint.hidden=items.length<2;
el.bulk.hidden=!any;
el.countLabel.textContent=phrase(items.length===1?'n.frame.one':'n.frame.many',
{n:items.length});
el.exportBtn.disabled=!any||exporting;
syncSettingControls();
settingsState=JSON.stringify(currentSettings());
updateSummary();
updatePreview();
if(focus)restoreItemFocus(focus);
}
for(const button of document.querySelectorAll('[data-sort]')){
button.addEventListener('click',()=>{
const before=[...items];
sortItems(items,button.dataset.sort);
if(items.some((item,index)=>item!==before[index]))changedPlan();
render();
});
}
for(const button of document.querySelectorAll('[data-view]')){
button.addEventListener('click',()=>{
view=button.dataset.view;
for(const other of document.querySelectorAll('[data-view]')){
other.classList.toggle('active',other===button);
other.setAttribute('aria-pressed',String(other===button));
}
render();
});
}
el.list.addEventListener('dragover',(event)=>{
if(dragIndex!==null)event.preventDefault();
});
el.list.addEventListener('drop',(event)=>{
if(dragIndex===null)return;
event.preventDefault();
applyDrop();
});
el.clearAll.addEventListener('click',()=>{
if(!items.length)return;
for(const item of items)releaseItem(item);
items=[];
changedPlan();
render({action:'remove'});
});
el.applyBulk.addEventListener('click',()=>{
const delay=defaultDelay();
if(items.some((item)=>item.delay!==delay)){
for(const item of items)item.delay=delay;
changedPlan();
}
render();
});
el.bulkUnit.addEventListener('change',()=>{
const seconds=defaultDelayFrom(el.bulkUnit.value==='fps'?'seconds':'fps');
const toFps=el.bulkUnit.value==='fps';
el.bulkAmount.min=toFps?'1':String(MIN_DELAY);
el.bulkAmount.max=toFps?String(Math.round(1/MIN_DELAY)):String(MAX_DELAY);
el.bulkAmount.step=toFps?'1':'0.01';
el.bulkAmount.value=toFps
?String(Math.min(50,Math.max(1,Math.round(1/seconds))))
:String(clampDelay(seconds));
});
function currentSettings(){
const{width,height}=resolveOutputSize(el.size.value,items,{
width:Number(el.customWidth.value),
height:Number(el.customHeight.value),
});
const mode=el.loopMode.value;
return{
width,
height,
fit:el.fit.value,
background:el.background.value,
colors:Number(el.colors.value),
dither:el.dither.value==='on',
sharedPalette:el.paletteMode.value==='shared',
transparent:el.transparent.value==='on',
loop:loopValue(mode,el.loopTimes.value),
loopMode:mode,
};
}
let previewTimer=0;
function schedulePreview(){
clearTimeout(previewTimer);
previewTimer=setTimeout(updatePreview,150);
}
function syncSettingControls(){
el.sizeCustom.hidden=el.size.value!=='custom';
el.loopTimes.hidden=el.loopMode.value!=='times';
const settings=currentSettings();
el.backgroundField.style.visibility=
el.fit.value==='contain'&&!settings.transparent?'visible':'hidden';
if(el.size.value==='custom'){
el.sizeNote.textContent=phrase('size.custom',
{width:settings.width,height:settings.height,max:MAX_SIDE});
}else if(items.length){
el.sizeNote.textContent=phrase('size.each',
{width:settings.width,height:settings.height});
}else{
el.sizeNote.textContent=phrase('size.fromimages');
}
el.paletteNote.textContent=phrase(settings.sharedPalette
?'note.shared':'note.sharp');
el.transparentNote.textContent=settings.transparent
?phrase('note.transparent')
:'';
el.previewFrame.classList.toggle('checkered',settings.transparent);
}
const EMPTY='\u2014';
function updateSummary(){
if(!items.length){
el.sumFrames.textContent=EMPTY;
el.sumDuration.textContent=EMPTY;
el.sumSize.textContent=EMPTY;
el.sumLoop.textContent=EMPTY;
el.bulkNote.textContent='';
return;
}
const settings=currentSettings();
const total=frameDelays(items).reduce((sum,delay)=>sum+delay,0)/100;
el.sumFrames.textContent=String(items.length);
el.sumDuration.textContent=formatDuration(total);
el.sumSize.textContent=phrase('size.plain',
{width:settings.width,height:settings.height});
el.sumLoop.textContent=settings.loopMode==='forever'
?phrase('loop.forever')
:(settings.loopMode==='once'
?phrase('loop.once')
:phrase(settings.loop===1?'loop.times.one':'loop.times.many',
{n:settings.loop}));
const each=total/items.length;
el.bulkNote.textContent=phrase('bulk.note',
{total:formatDuration(total),fps:(1/each).toFixed(1)});
}
async function updatePreview(){
const token=++previewToken;
if(!items.length){
el.preview.classList.add('empty');
el.previewEmpty.hidden=false;
return;
}
const settings=currentSettings();
el.preview.width=settings.width;
el.preview.height=settings.height;
const ctx=el.preview.getContext('2d');
let bitmap;
try{
bitmap=await decodeFull(items[0]);
}catch{
return;
}
if(token!==previewToken){
bitmap.close();
return;
}
try{
drawFrame(ctx,bitmap,{
fit:settings.fit,
background:settings.transparent?null:settings.background,
});
el.preview.classList.remove('empty');
el.previewEmpty.hidden=true;
}finally{
bitmap.close();
}
}
const settingsInputs=[
el.size,el.customWidth,el.customHeight,
el.fit,el.background,el.colors,el.paletteMode,el.dither,
el.loopMode,el.loopTimes,el.transparent,
];
for(const input of settingsInputs){
for(const type of['change','input']){
input.addEventListener(type,()=>{
const state=JSON.stringify(currentSettings());
if(state!==settingsState){
settingsState=state;
changedPlan();
}
syncSettingControls();
updateSummary();
schedulePreview();
});
}
}
function setProgress({phase,done,total}){
const fraction=total>0?Math.min(1,done/total):0;
el.progressBar.style.width=`${(fraction * 100).toFixed(1)}%`;
el.progressLabel.textContent=phrase(
phase==='palette'?'step.palette':'step.frames',
{
done:done.toLocaleString(),
total:total.toLocaleString(),
percent:Math.round(fraction*100),
},
);
}
function outputFilename(){
const now=new Date();
const stamp=[
now.getFullYear(),
String(now.getMonth()+1).padStart(2,'0'),
String(now.getDate()).padStart(2,'0'),
].join('-');
return`animation-${stamp}.gif`;
}
async function runExport(){
if(exporting||!items.length)return;
clearError();
clearResult();
const job={
controller:new AbortController(),
revision:planRevision,
items:items.map((item)=>({...item})),
settings:currentSettings(),
name:outputFilename(),
};
activeExport=job;
exporting=true;
const owns=()=>activeExport===job&&planRevision===job.revision;
el.exportBtn.disabled=true;
el.cancelBtn.hidden=false;
el.progress.hidden=false;
setProgress({phase:'palette',done:0,total:1});
try{
const{blob,frames}=await encodeGif({
items:job.items,
settings:job.settings,
onProgress(progress){if(owns())setProgress(progress);},
signal:job.controller.signal,
});
if(!owns()||job.controller.signal.aborted)return;
lastResultUrl=URL.createObjectURL(blob);
el.resultImage.src=lastResultUrl;
el.download.href=lastResultUrl;
el.download.download=job.name;
el.resultInfo.textContent=[
'GIF',
phrase('size.plain',{width:job.settings.width,height:job.settings.height}),
phrase(frames===1?'n.frame.one':'n.frame.many',{n:frames}),
formatBytes(blob.size),
].reduce((a,b)=>phrase('join.dot',{a,b}));
el.result.hidden=false;
el.progress.hidden=true;
el.result.scrollIntoView({behavior:'smooth',block:'nearest'});
}catch(error){
if(!owns()||job.controller.signal.aborted)return;
el.progress.hidden=true;
if(error?.name!=='AbortError'){
showError(phrase(errorKeys.has(error?.message)?error.message:'export.failed',error?.values));
console.error(error);
}
}finally{
if(activeExport===job){
activeExport=null;
exporting=false;
el.cancelBtn.hidden=true;
el.exportBtn.disabled=items.length===0;
}
}
}
el.exportBtn.addEventListener('click',runExport);
el.cancelBtn.addEventListener('click',retireExport);
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
document.getElementById("boot-warning")?.remove();
