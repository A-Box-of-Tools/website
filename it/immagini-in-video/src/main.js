/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js';
import{loadImages,decodeFull,releaseItem,sortItems,moveItem}from'./images.js';
import{drawFrame,resolveOutputSize}from'./compose.js';
import{encodeToMp4,countFrames}from'./encoder.js';
import{recordToWebm}from'./recorder.js';
import{hasWebCodecs,hasMediaRecorder}from'./support.js';
import{wireUrlImport}from'./shared/url-import.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
list:$('image-list'),
listToolbar:$('list-toolbar'),
reorderHint:$('reorder-hint'),
urlInput:$('url-input'),
fetchUrls:$('fetch-urls'),
urlStatus:$('url-status'),
countLabel:$('count-label'),
clearAll:$('clear-all'),
bulk:$('bulk-duration'),
bulkAmount:$('bulk-amount'),
durationUnit:$('duration-unit'),
bulkNote:$('bulk-note'),
applyBulk:$('apply-bulk'),
resolution:$('resolution'),
resolutionCustom:$('resolution-custom'),
customWidth:$('custom-width'),
customHeight:$('custom-height'),
resolutionNote:$('resolution-note'),
fps:$('fps'),
fpsCustom:$('fps-custom'),
fpsNote:$('fps-note'),
fit:$('fit'),
background:$('background'),
backgroundField:$('background-field'),
quality:$('quality'),
format:$('format'),
formatNote:$('format-note'),
preview:$('preview'),
previewEmpty:$('preview-empty'),
sumImages:$('sum-images'),
sumDuration:$('sum-duration'),
sumSize:$('sum-size'),
sumFrames:$('sum-frames'),
exportBtn:$('export'),
cancelBtn:$('cancel'),
progressWrap:$('progress-wrap'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
error:$('error'),
result:$('result'),
resultVideo:$('result-video'),
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
let durationUnit='frames';
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
const typed=Number(el.bulkAmount.value);
const{items:loaded,skipped}=await loadImages(files,{
frames:durationUnit==='frames'&&typed>0?Math.round(typed):1,
seconds:durationUnit==='seconds'&&typed>0?typed:3,
});
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
wireUrlImport({
input:el.urlInput,
button:el.fetchUrls,
status:el.urlStatus,
onError:showError,
onClear:clearError,
async onFiles(downloaded){
const before=items.length;
await addFiles(downloaded.map((d)=>d.file));
for(let i=before;i<items.length;i++){
const origin=downloaded.find((d)=>d.file===items[i].file);
if(origin){
items[i].sourceUrl=origin.url.href;
items[i].sourceHost=origin.url.hostname;
}
}
render();
},
});
function effectiveDuration(item,fps){
return durationUnit==='frames'
?Math.max(1,Math.round(item.frames))/fps
:Math.max(0.05,item.seconds);
}
function resolvedItems(fps){
return items.map((item)=>({...item,duration:effectiveDuration(item,fps)}));
}
let view='large';
let dragIndex=null;
let dropAt=null;
function clearDropMarkers(){
for(const node of el.list.querySelectorAll('.insert-before, .insert-after')){
node.classList.remove('insert-before','insert-after');
}
}
function isGridView(){
return view==='large'||view==='small';
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
meta.className='image-meta';
const name=document.createElement('p');
name.className='image-name';
name.textContent=item.name;
name.title=`${item.name} — ${item.width}×${item.height}`;
meta.append(name);
const dims=document.createElement('p');
dims.className='image-dims';
dims.textContent=`${item.width} × ${item.height} · ${formatBytes(item.file.size)}`;
if(item.sourceUrl){
const source=document.createElement('span');
source.className='image-source';
source.textContent=` · from ${item.sourceHost}`;
source.title=item.sourceUrl;
dims.append(source);
}
meta.append(dims);
const controls=document.createElement('div');
controls.className='image-controls';
const inFrames=durationUnit==='frames';
const amount=document.createElement('input');
amount.type='number';
amount.min=inFrames?'1':'0.1';
amount.max=inFrames?'3600':'60';
amount.step=inFrames?'1':'0.1';
amount.value=String(inFrames?item.frames:item.seconds);
amount.setAttribute('aria-label',inFrames
?`Frames to show ${item.name}`
:`Seconds to show ${item.name}`);
amount.addEventListener('change',()=>{
const value=Number(amount.value);
if(inFrames){
item.frames=Number.isFinite(value)?Math.min(3600,Math.max(1,Math.round(value))):1;
amount.value=String(item.frames);
}else{
item.seconds=Number.isFinite(value)?Math.min(60,Math.max(0.1,value)):3;
amount.value=String(item.seconds);
}
updateSummary();
});
controls.append(amount);
const unit=document.createElement('span');
unit.className='unit';
unit.textContent=inFrames?'fr':'sec';
controls.append(unit);
const left=document.createElement('button');
left.type='button';
left.className='move-btn';
left.textContent='‹';
left.title='Move earlier';
left.setAttribute('aria-label',`Move ${item.name} earlier`);
left.disabled=index===0;
left.addEventListener('click',()=>{moveItem(items,index,index-1);render();});
controls.append(left);
const right=document.createElement('button');
right.type='button';
right.className='move-btn';
right.textContent='›';
right.title='Move later';
right.setAttribute('aria-label',`Move ${item.name} later`);
right.disabled=index===items.length-1;
right.addEventListener('click',()=>{moveItem(items,index,index+1);render();});
controls.append(right);
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
const after=isGridView()
?event.clientX>rect.left+rect.width/2
:event.clientY>rect.top+rect.height/2;
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
el.list.className=`image-list view-${view}`;
const any=items.length>0;
el.listToolbar.hidden=!any;
el.reorderHint.hidden=items.length<2;
el.bulk.hidden=!any;
el.countLabel.textContent=`${items.length} image${items.length === 1 ? '' : 's'}`;
el.exportBtn.disabled=!any||exporting;
syncCustomControls();
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
const typed=Number(el.bulkAmount.value);
if(durationUnit==='frames'){
const frames=Number.isFinite(typed)?Math.min(3600,Math.max(1,Math.round(typed))):1;
el.bulkAmount.value=String(frames);
for(const item of items)item.frames=frames;
}else{
const seconds=Number.isFinite(typed)?Math.min(60,Math.max(0.1,typed)):3;
el.bulkAmount.value=String(seconds);
for(const item of items)item.seconds=seconds;
}
render();
});
function syncDurationUnit(){
durationUnit=el.durationUnit.value;
const inFrames=durationUnit==='frames';
el.bulkAmount.min=inFrames?'1':'0.1';
el.bulkAmount.max=inFrames?'3600':'60';
el.bulkAmount.step=inFrames?'1':'0.1';
const typed=Number(el.bulkAmount.value);
el.bulkAmount.value=inFrames
?String(Number.isFinite(typed)?Math.max(1,Math.round(typed)):1)
:String(Number.isFinite(typed)?Math.max(0.1,typed):3);
}
el.durationUnit.addEventListener('change',()=>{
syncDurationUnit();
render();
});
const FPS_MIN=1;
const FPS_MAX=120;
function currentFps(){
const raw=el.fps.value==='custom'?Number(el.fpsCustom.value):Number(el.fps.value);
if(!Number.isFinite(raw)||raw<=0)return 30;
return Math.min(FPS_MAX,Math.max(FPS_MIN,Math.round(raw)));
}
function currentSettings(){
const{width,height}=resolveOutputSize(el.resolution.value,items,{
width:Number(el.customWidth.value),
height:Number(el.customHeight.value),
});
return{
width,
height,
fps:currentFps(),
fit:el.fit.value,
background:el.background.value,
quality:el.quality.value,
format:el.format.value,
};
}
let previewTimer=0;
function schedulePreview(){
clearTimeout(previewTimer);
previewTimer=setTimeout(updatePreview,150);
}
function syncCustomControls(){
el.fpsCustom.hidden=el.fps.value!=='custom';
el.resolutionCustom.hidden=el.resolution.value!=='custom';
if(el.fps.value==='custom'){
const typed=Number(el.fpsCustom.value);
const used=currentFps();
el.fpsNote.textContent=Number.isFinite(typed)&&typed===used
?`${used} frames per second.`
:`Using ${used} fps (allowed range ${FPS_MIN}-${FPS_MAX}).`;
}else{
el.fpsNote.textContent='';
}
if(el.resolution.value==='auto'){
const{width,height}=currentSettings();
el.resolutionNote.textContent=items.length
?`Matched to ${width} x ${height}. No image is scaled down.`
:'Matches the highest resolution among your images.';
}else if(el.resolution.value==='custom'){
const{width,height}=currentSettings();
el.resolutionNote.textContent=`Output ${width} x ${height} (rounded to even numbers).`;
}else{
el.resolutionNote.textContent='';
}
}
function formatDuration(seconds){
const whole=Math.round(seconds);
const mins=Math.floor(whole/60);
const secs=whole%60;
return mins?`${mins}m ${String(secs).padStart(2, '0')}s`:`${seconds.toFixed(1)}s`;
}
function updateSummary(){
if(!items.length){
el.sumImages.textContent='—';
el.sumDuration.textContent='—';
el.sumSize.textContent='—';
el.sumFrames.textContent='—';
return;
}
const settings=currentSettings();
const resolved=resolvedItems(settings.fps);
const totalSeconds=resolved.reduce((sum,item)=>sum+item.duration,0);
el.sumImages.textContent=String(items.length);
el.sumDuration.textContent=formatDuration(totalSeconds);
el.sumSize.textContent=`${settings.width} × ${settings.height}`;
el.sumFrames.textContent=countFrames(resolved,settings.fps).toLocaleString();
el.bulkNote.textContent=durationUnit==='frames'
?`at ${settings.fps} fps that is ${formatDuration(totalSeconds)} total`
:'';
}
async function updatePreview(){
const token=++previewToken;
if(!items.length){
el.preview.classList.add('empty');
el.previewEmpty.hidden=false;
return;
}
const settings=currentSettings();
const width=640;
const height=Math.max(2,Math.round(width*settings.height/settings.width));
el.preview.width=width;
el.preview.height=height;
const ctx=el.preview.getContext('2d',{alpha:false});
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
drawFrame(ctx,bitmap,{fit:settings.fit,background:settings.background});
el.preview.classList.remove('empty');
el.previewEmpty.hidden=true;
}finally{
bitmap.close();
}
}
el.format.addEventListener('change',updateFormatNote);
const settingsInputs=[
el.resolution,el.customWidth,el.customHeight,
el.fps,el.fpsCustom,
el.fit,el.background,el.quality,
];
for(const input of settingsInputs){
for(const type of['change','input']){
input.addEventListener(type,()=>{
el.backgroundField.style.visibility=el.fit.value==='contain'?'visible':'hidden';
syncCustomControls();
updateSummary();
schedulePreview();
});
}
}
function updateFormatNote(){
const usingWebm=el.format.value==='webm'||!hasWebCodecs();
if(!hasWebCodecs()&&!hasMediaRecorder()){
el.formatNote.textContent='This browser cannot encode video. Try a recent Chrome, Edge, or Safari.';
return;
}
el.formatNote.textContent=usingWebm
?'Records in real time — keep this tab visible until it finishes.'
:'Encodes faster than real time. Works in the background.';
}
function initFormatNote(){
el.backgroundField.style.visibility=el.fit.value==='contain'?'visible':'hidden';
if(!hasWebCodecs()){
if(hasMediaRecorder()){
el.format.value='webm';
el.format.querySelector('option[value="auto"]').disabled=true;
}else{
el.exportBtn.disabled=true;
}
}
updateFormatNote();
}
function showError(message){
el.error.textContent=message;
el.error.hidden=false;
}
function clearError(){
el.error.hidden=true;
el.error.textContent='';
}
function setProgress({phase,done,total,realtime}){
const fraction=total>0?Math.min(1,done/total):0;
el.progressBar.style.width=`${(fraction * 100).toFixed(1)}%`;
if(phase==='preparing'){
el.progressLabel.textContent='Preparing…';
}else if(phase==='finishing'){
el.progressLabel.textContent='Finishing up…';
}else if(realtime){
el.progressLabel.textContent=
`Recording in real time — ${formatDuration(done)} of ${formatDuration(total)} (${Math.round(fraction * 100)}%)`;
}else{
el.progressLabel.textContent=
`Encoding frame ${done.toLocaleString()} of ${total.toLocaleString()} (${Math.round(fraction * 100)}%)`;
}
}
function outputFilename(extension){
const now=new Date();
const stamp=[
now.getFullYear(),
String(now.getMonth()+1).padStart(2,'0'),
String(now.getDate()).padStart(2,'0'),
].join('-');
return`slideshow-${stamp}.${extension}`;
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
setProgress({phase:'preparing',done:0,total:1});
const settings=currentSettings();
const useMp4=settings.format!=='webm'&&hasWebCodecs();
try{
const run=useMp4?encodeToMp4:recordToWebm;
const{blob,extension,codec,warning}=await run({
items:resolvedItems(settings.fps),
settings,
onProgress:setProgress,
signal:abortController.signal,
});
if(warning)showError(warning);
if(lastResultUrl)URL.revokeObjectURL(lastResultUrl);
lastResultUrl=URL.createObjectURL(blob);
el.resultVideo.src=lastResultUrl;
el.download.href=lastResultUrl;
el.download.download=outputFilename(extension);
el.resultInfo.textContent=
`${extension.toUpperCase()} · ${settings.width}×${settings.height} · ${settings.fps} fps · ${formatBytes(blob.size)} · ${codec}`;
el.result.hidden=false;
el.progressWrap.hidden=true;
el.result.scrollIntoView({behavior:'smooth',block:'nearest'});
}catch(error){
el.progressWrap.hidden=true;
if(error?.name!=='AbortError'){
showError(error?.message||'Something went wrong while creating the video.');
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
const platformNote=platform.size
?phrase(platform.size===1?'net.platform.one':'net.platform.many',
{hosts:platform.size})
:'';
el.networkCount.textContent=clean
?phrase('net.clean',{total,platform:platformNote})
:phrase('net.dirty',{hosts:[...external].join(', '),platform:platformNote});
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
initFormatNote();
syncDurationUnit();
syncCustomControls();
render();
monitorNetwork();
registerServiceWorker();
document.getElementById("boot-warning")?.remove();
