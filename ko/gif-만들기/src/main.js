/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js';
import{
loadImages,releaseItem,sortItems,moveItem,decodeFull,
clampDelay,DEFAULT_DELAY,MIN_DELAY,MAX_DELAY,
}from'./images.js';
import{drawFrame,resolveOutputSize,MAX_SIDE}from'./compose.js';
import{encodeGif,loopValue}from'./encode.js';
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
progressWrap:$('progress-wrap'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
error:$('error'),
result:$('result'),
resultImage:$('result-image'),
resultInfo:$('result-info'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
networkCount:$('network-count'),
networkDot:$('network-dot'),
offlineStatus:$('offline-status'),
offlineDot:$('offline-dot'),
};
let items=[];
let exporting=false;
let abortController=null;
let lastResultUrl=null;
let previewToken=0;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
addFiles(files);
},
});
async function addFiles(files){
if(!files?.length)return;
picker.busy(readingLabel(files.length));
try{
const{items:loaded,skipped}=await loadImages(files,defaultDelay());
items=items.concat(loaded);
if(skipped.length){
showError(`Skipped ${skipped.length} file(s) that could not be read as images: ${skipped.slice(0, 3).join(', ')}${skipped.length > 3 ? '…' : ''}`);
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
return clampDelay(unit==='fps'?1/typed:typed);
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
function buildItemNode(item,index){
const li=document.createElement('li');
li.className='frame-item';
li.dataset.index=String(index);
const handle=document.createElement('button');
handle.type='button';
handle.className='drag-handle';
handle.draggable=true;
handle.textContent='⋮⋮';
handle.title=`Drag to reorder ${item.name}`;
handle.setAttribute('aria-label',`Drag to reorder ${item.name}`);
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
remove.title=`Remove ${item.name}`;
remove.setAttribute('aria-label',`Remove ${item.name}`);
remove.addEventListener('click',()=>{
releaseItem(item);
items.splice(index,1);
render();
});
thumbWrap.append(remove);
const meta=document.createElement('div');
meta.className='frame-meta';
const name=document.createElement('p');
name.className='frame-name';
name.textContent=item.name;
name.title=`${item.name} — ${item.width}×${item.height}`;
meta.append(name);
const controls=document.createElement('div');
controls.className='frame-controls';
const amount=document.createElement('input');
amount.type='number';
amount.min=String(MIN_DELAY);
amount.max=String(MAX_DELAY);
amount.step='0.05';
amount.value=String(item.delay);
amount.setAttribute('aria-label',`Seconds to hold ${item.name}`);
amount.addEventListener('change',()=>{
item.delay=clampDelay(amount.value);
amount.value=String(item.delay);
updateSummary();
});
controls.append(amount);
const unit=document.createElement('span');
unit.className='unit';
unit.textContent='sec';
controls.append(unit);
const earlier=document.createElement('button');
earlier.type='button';
earlier.className='move-btn';
earlier.textContent='‹';
earlier.title='Move earlier';
earlier.setAttribute('aria-label',`Move ${item.name} earlier`);
earlier.disabled=index===0;
earlier.addEventListener('click',()=>{moveItem(items,index,index-1);render();});
controls.append(earlier);
const later=document.createElement('button');
later.type='button';
later.className='move-btn';
later.textContent='›';
later.title='Move later';
later.setAttribute('aria-label',`Move ${item.name} later`);
later.disabled=index===items.length-1;
later.addEventListener('click',()=>{moveItem(items,index,index+1);render();});
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
render();
}
function render(){
el.list.replaceChildren(...items.map(buildItemNode));
el.list.className=`frame-list view-${view}`;
const any=items.length>0;
el.listToolbar.hidden=!any;
el.reorderHint.hidden=items.length<2;
el.bulk.hidden=!any;
el.countLabel.textContent=`${items.length} frame${items.length === 1 ? '' : 's'}`;
el.exportBtn.disabled=!any||exporting;
syncSettingControls();
updateSummary();
updatePreview();
}
for(const button of document.querySelectorAll('[data-sort]')){
button.addEventListener('click',()=>{
sortItems(items,button.dataset.sort);
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
render();
});
el.applyBulk.addEventListener('click',()=>{
const delay=defaultDelay();
for(const item of items)item.delay=delay;
render();
});
el.bulkUnit.addEventListener('change',()=>{
const seconds=defaultDelayFrom(el.bulkUnit.value==='fps'?'seconds':'fps');
const toFps=el.bulkUnit.value==='fps';
el.bulkAmount.min=toFps?'1':String(MIN_DELAY);
el.bulkAmount.max=toFps?String(Math.round(1/MIN_DELAY)):String(MAX_DELAY);
el.bulkAmount.step=toFps?'1':'0.05';
el.bulkAmount.value=toFps
?String(Math.min(50,Math.max(1,Math.round(1/seconds))))
:String(seconds);
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
el.sizeNote.textContent=`Output ${settings.width} × ${settings.height}, up to ${MAX_SIDE} px a side.`;
}else if(items.length){
el.sizeNote.textContent=`Each frame is ${settings.width} × ${settings.height}.`;
}else{
el.sizeNote.textContent='The shape comes from your images.';
}
el.paletteNote.textContent=settings.sharedPalette
?'Steadier colour between frames, and a smaller file. Takes a second pass.'
:'Sharpest colour. Can shift between frames of the same scene.';
el.transparentNote.textContent=settings.transparent
?'A GIF pixel is either fully transparent or not at all, so soft edges get a hard one.'
:'';
el.previewFrame.classList.toggle('checkered',settings.transparent);
}
function formatDuration(seconds){
const whole=Math.round(seconds);
const mins=Math.floor(whole/60);
const secs=whole%60;
return mins?`${mins}m ${String(secs).padStart(2, '0')}s`:`${seconds.toFixed(2)}s`;
}
function updateSummary(){
if(!items.length){
el.sumFrames.textContent='—';
el.sumDuration.textContent='—';
el.sumSize.textContent='—';
el.sumLoop.textContent='—';
el.bulkNote.textContent='';
return;
}
const settings=currentSettings();
const total=items.reduce((sum,item)=>sum+item.delay,0);
el.sumFrames.textContent=String(items.length);
el.sumDuration.textContent=formatDuration(total);
el.sumSize.textContent=`${settings.width} × ${settings.height}`;
el.sumLoop.textContent=settings.loopMode==='forever'
?'Forever'
:(settings.loopMode==='once'?'Once':`${settings.loop} times`);
const each=total/items.length;
el.bulkNote.textContent=
`${formatDuration(total)} in all, about ${(1 / each).toFixed(1)} frames a second`;
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
syncSettingControls();
updateSummary();
schedulePreview();
});
}
}
function showError(message){
el.error.textContent=message;
el.error.hidden=false;
}
function clearError(){
el.error.hidden=true;
el.error.textContent='';
}
function setProgress({phase,done,total}){
const fraction=total>0?Math.min(1,done/total):0;
el.progressBar.style.width=`${(fraction * 100).toFixed(1)}%`;
const what=phase==='palette'?'Choosing colours':'Writing frame';
el.progressLabel.textContent=
`${what} — ${done.toLocaleString()} of ${total.toLocaleString()} (${Math.round(fraction * 100)}%)`;
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
function formatBytes(bytes){
if(bytes<1024*1024)return`${(bytes / 1024).toFixed(0)} KB`;
return`${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
async function runExport(){
if(exporting||!items.length)return;
clearError();
exporting=true;
abortController=new AbortController();
el.exportBtn.disabled=true;
el.cancelBtn.hidden=false;
el.progressWrap.hidden=false;
el.result.hidden=true;
setProgress({phase:'palette',done:0,total:1});
const settings=currentSettings();
try{
const{blob,frames}=await encodeGif({
items,
settings,
onProgress:setProgress,
signal:abortController.signal,
});
if(lastResultUrl)URL.revokeObjectURL(lastResultUrl);
lastResultUrl=URL.createObjectURL(blob);
el.resultImage.src=lastResultUrl;
el.download.href=lastResultUrl;
el.download.download=outputFilename();
el.resultInfo.textContent=
`GIF · ${settings.width}×${settings.height} · ${frames} frames · ${formatBytes(blob.size)}`;
el.result.hidden=false;
el.progressWrap.hidden=true;
el.result.scrollIntoView({behavior:'smooth',block:'nearest'});
}catch(error){
el.progressWrap.hidden=true;
if(error?.name!=='AbortError'){
showError(error?.message||'Something went wrong while making the GIF.');
console.error(error);
}
}finally{
exporting=false;
abortController=null;
el.cancelBtn.hidden=true;
el.exportBtn.disabled=items.length===0;
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
const PLATFORM_HOSTS=/(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;
function monitorNetwork(){
const platform=new Set();
const external=new Set();
const inspect=(entries)=>{
for(const entry of entries){
if(entry.name.startsWith('blob:')||entry.name.startsWith('data:'))continue;
const url=new URL(entry.name,location.href);
if(url.origin===location.origin)continue;
if(PLATFORM_HOSTS.test(url.hostname))platform.add(url.hostname);
else external.add(url.hostname);
}
const total=performance.getEntriesByType('resource')
.filter((e)=>!e.name.startsWith('blob:')&&!e.name.startsWith('data:')).length;
const clean=external.size===0;
const platformNote=platform.size===0
?''
:` The page's own ad, measurement and donate-button scripts loaded from ${platform.size} host${platform.size === 1 ? '' : 's'}; not one of them was given a file.`;
el.networkCount.textContent=clean
?`your images have gone nowhere. ${total} files loaded.${platformNote}`
:`something contacted ${[...external].join(', ')}, which this tool never does.${platformNote}`;
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
showError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
render();
monitorNetwork();
registerServiceWorker();
document.getElementById("boot-warning")?.remove();
