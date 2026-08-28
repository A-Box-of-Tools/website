/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{
decodeSvgText,intrinsicSize,looksLikeSvg,
}from'./svg.js';
import{
MODES,atDensity,checkLimits,describePlan,planSize,times,
}from'./sizing.js';
import{
FORMATS,JPEG,PNG,WEBP,draw,encodableTypes,loadAt,rasterize,
}from'./render.js';
import{
bytes as humanBytes,dimensions,outName,sourceKey,uniqueNames,
}from'./files.js';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js';
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
sizeMode:$('size-mode'),
sizeScale:$('size-scale'),
sizeWidth:$('size-width'),
sizeHeight:$('size-height'),
sizeLongest:$('size-longest'),
boxWidth:$('box-width'),
boxHeight:$('box-height'),
boxFit:$('box-fit'),
density:$('density'),
sizeSummary:$('size-summary'),
sizeWarning:$('size-warning'),
format:$('format'),
formatNote:$('format-note'),
qualityField:$('quality-field'),
quality:$('quality'),
qualityValue:$('quality-value'),
backgroundMode:$('background-mode'),
backgroundColour:$('background-colour'),
backgroundNote:$('background-note'),
preview:$('preview'),
previewCanvas:$('preview-canvas'),
previewNote:$('preview-note'),
previewEmpty:$('preview-empty'),
run:$('run'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
results:$('results'),
resultList:$('result-list'),
resultsSummary:$('results-summary'),
downloadZip:$('download-zip'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
networkCount:$('network-count'),
networkDot:$('network-dot'),
offlineStatus:$('offline-status'),
offlineDot:$('offline-dot'),
};
const FIELDS={
[MODES.scale]:$('scale-fields'),
[MODES.width]:$('width-fields'),
[MODES.height]:$('height-fields'),
[MODES.longest]:$('longest-fields'),
[MODES.box]:$('box-fields'),
};
let items=[];
let nextId=1;
let busy=false;
let activeId=null;
let results=[];
let resultUrls=[];
let writable=new Set([PNG,JPEG]);
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
if(!looksLikeSvg(file)){
failures.push(phrase('read.notsvg',{name:file.name}));
continue;
}
const text=decodeSvgText(await file.arrayBuffer());
const intrinsic=intrinsicSize(text);
if(!intrinsic){
failures.push(phrase('read.nosvg.named',{name:file.name}));
continue;
}
items.push({
id:nextId,
file,
text,
intrinsic,
thumbUrl:URL.createObjectURL(file),
});
nextId+=1;
}
}finally{
picker.done();
}
if(failures.length)showLoadError(failures.join('\n'));
else clearLoadError();
if(activeId===null&&items.length)activeId=items[0].id;
clearResults();
render();
drawPreview();
}
function removeItem(id){
const item=items.find((one)=>one.id===id);
if(!item||busy)return;
URL.revokeObjectURL(item.thumbUrl);
items=items.filter((one)=>one.id!==id);
if(activeId===id)activeId=items.length?items[0].id:null;
clearResults();
render();
drawPreview();
}
el.clearAll.addEventListener('click',()=>{
if(busy)return;
for(const item of items)URL.revokeObjectURL(item.thumbUrl);
items=[];
activeId=null;
clearResults();
clearLoadError();
render();
drawPreview();
});
const activeItem=()=>items.find((item)=>item.id===activeId)??null;
function setActive(id){
if(activeId===id)return;
activeId=id;
render();
drawPreview();
}
function settings(){
const mime=el.format.value;
const opaque=!FORMATS[mime].alpha;
const asked=el.backgroundMode.value==='colour';
return{
mode:el.sizeMode.value,
scale:Number(el.sizeScale.value),
width:el.sizeMode.value===MODES.box?Number(el.boxWidth.value):Number(el.sizeWidth.value),
height:el.sizeMode.value===MODES.box?Number(el.boxHeight.value):Number(el.sizeHeight.value),
longest:Number(el.sizeLongest.value),
fit:el.boxFit.value,
densities:densities(),
mime,
quality:FORMATS[mime].lossy?Number(el.quality.value)/100:undefined,
background:asked||opaque?el.backgroundColour.value:null,
};
}
const densities=()=>[1,2,3].slice(0,Number(el.density.value));
const planFor=(item)=>planSize(item.intrinsic,settings());
function render(){
renderFields();
renderList();
renderNotes();
el.run.disabled=busy||items.length===0||!everythingFits();
el.run.textContent=items.length>1
?phrase('run.many',{count:items.length.toLocaleString()})
:phrase('run.one');
}
function renderFields(){
for(const[mode,panel]of Object.entries(FIELDS))panel.hidden=mode!==el.sizeMode.value;
const mime=el.format.value;
el.qualityField.hidden=!FORMATS[mime].lossy;
el.qualityValue.textContent=el.quality.value;
el.backgroundColour.hidden=el.backgroundMode.value!=='colour'&&FORMATS[mime].alpha;
for(const control of[el.sizeMode,el.format,el.backgroundMode,el.density,el.boxFit,el.quality]){
control.disabled=busy;
}
}
function renderList(){
el.fileList.replaceChildren();
el.listToolbar.hidden=items.length===0;
el.countLabel.textContent=items.length===1
?phrase('chosen.one')
:phrase('chosen.many',{count:items.length.toLocaleString()});
el.clearAll.disabled=busy;
for(const item of items){
const row=document.createElement('li');
row.className='file-row';
if(item.id===activeId)row.classList.add('active');
const wrap=document.createElement('div');
wrap.className='file-main-wrap';
const thumb=document.createElement('img');
thumb.className='file-thumb';
thumb.src=item.thumbUrl;
thumb.alt='';
const main=document.createElement('div');
main.className='file-main';
const name=document.createElement('p');
name.className='file-name';
name.textContent=item.file.name;
const sub=document.createElement('p');
sub.className='file-sub';
sub.textContent=phrase('join.dot',{
a:phrase(sourceKey(item.intrinsic),{
size:dimensions(item.intrinsic.width,item.intrinsic.height),
}),
b:humanBytes(item.file.size,phrase),
});
const out=document.createElement('p');
out.className='file-out';
const plan=planFor(item);
const limit=checkLimits(atDensity(plan,densities().at(-1)));
out.textContent=limit.ok
?phrase('out.size',{size:dimensions(plan.width,plan.height)})
:phrase('out.toobig',{why:phrase(limit.key,fill(limit.values))});
out.classList.toggle('warn',!limit.ok);
main.append(name,sub,out);
wrap.append(thumb,main);
wrap.tabIndex=0;
wrap.setAttribute('role','button');
wrap.setAttribute('aria-pressed',String(item.id===activeId));
wrap.title=phrase('row.preview');
wrap.addEventListener('click',()=>setActive(item.id));
wrap.addEventListener('keydown',(event)=>{
if(event.key==='Enter'||event.key===' '){
event.preventDefault();
setActive(item.id);
}
});
const remove=document.createElement('button');
remove.type='button';
remove.className='row-remove';
remove.textContent='×';
const off=phrase('row.remove',{name:item.file.name});
remove.title=off;
remove.setAttribute('aria-label',off);
remove.disabled=busy;
remove.addEventListener('click',()=>removeItem(item.id));
row.append(wrap,remove);
el.fileList.append(row);
}
}
function fill(values={}){
return Object.fromEntries(Object.entries(values)
.map(([name,value])=>[name,value?.key?phrase(value.key,value.values):value]));
}
function renderNotes(){
const item=activeItem();
const set=settings();
el.sizeSummary.textContent=item
?describePlan(planFor(item),item.intrinsic,set.densities,phrase)
:phrase('plan.none');
const worst=worstLimit();
el.sizeWarning.hidden=!worst;
el.sizeWarning.textContent=worst?phrase(worst.key,fill(worst.values)):'';
el.sizeWarning.classList.toggle('warn',Boolean(worst&&!worst.ok));
el.formatNote.textContent=formatSentence(set.mime);
el.backgroundNote.textContent=backgroundSentence(set);
}
function worstLimit(){
const largest=densities().at(-1);
let worst=null;
for(const item of items){
const limit=checkLimits(atDensity(planFor(item),largest));
if(!limit.ok)return limit;
if(limit.warn&&!worst)worst=limit;
}
return worst;
}
const everythingFits=()=>items.every(
(item)=>checkLimits(atDensity(planFor(item),densities().at(-1))).ok);
function formatSentence(mime){
if(mime===PNG)return phrase('format.png');
if(mime===JPEG)return phrase('format.jpeg');
return phrase(writable.has(WEBP)?'format.webp':'format.webp.none');
}
function backgroundSentence({mime,background}){
if(!background)return phrase('bg.none');
return FORMATS[mime].alpha
?phrase('bg.behind')
:phrase('bg.needed',{format:FORMATS[mime].label});
}
const PREVIEW_MAX=420;
let previewToken=0;
async function drawPreview(){
const item=activeItem();
el.preview.hidden=!item;
el.previewEmpty.hidden=Boolean(item);
if(!item)return;
const token=(previewToken+=1);
const set=settings();
const full=planFor(item);
const shown=shrinkPlan(full,PREVIEW_MAX);
try{
const held=await loadAt(item.text,shown.draw.width,shown.draw.height,{stretch:shown.stretch});
try{
if(token!==previewToken)return;
const canvas=draw(held.image,shown,{background:set.background});
const ctx=el.previewCanvas.getContext('2d');
el.previewCanvas.width=canvas.width;
el.previewCanvas.height=canvas.height;
ctx.clearRect(0,0,canvas.width,canvas.height);
ctx.drawImage(canvas,0,0);
canvas.width=0;
canvas.height=0;
}finally{
held.release();
}
}catch(error){
if(token===previewToken){
showLoadError(phrase('file.failed',{
name:item.file.name,
why:phrase(error.message,fill(error.values)),
}));
}
return;
}
el.previewCanvas.classList.toggle('opaque',Boolean(set.background));
el.previewNote.textContent=previewSentence(full,shown,set);
}
function shrinkPlan(plan,maxSide){
const factor=Math.min(1,maxSide/Math.max(plan.width,plan.height));
if(factor===1)return plan;
const at=(n)=>Math.max(1,Math.round(n*factor));
return{
width:at(plan.width),
height:at(plan.height),
draw:{
x:Math.round(plan.draw.x*factor),
y:Math.round(plan.draw.y*factor),
width:at(plan.draw.width),
height:at(plan.draw.height),
},
padded:plan.padded,
stretch:plan.stretch,
};
}
function previewSentence(full,shown,set){
const scale=shown.width===full.width
?phrase('preview.actual')
:phrase('preview.scaled',{
times:times(shown.width/full.width),
size:dimensions(full.width,full.height),
});
return set.background
?scale
:phrase('join.sentences',{a:scale,b:phrase('preview.checkerboard')});
}
el.run.addEventListener('click',()=>{
runAll().catch((error)=>{
showLoadError(phrase('error.broke',{detail:error.message}));
busy=false;
el.progress.hidden=true;
render();
});
});
async function runAll(){
if(busy||!items.length||!everythingFits())return;
busy=true;
clearResults();
render();
const set=settings();
const{ext}=FORMATS[set.mime];
const jobs=items.flatMap((item)=>set.densities.map((density)=>({item,density})));
const names=uniqueNames(jobs.map((job)=>outName(job.item.file.name,ext,job.density)));
el.progress.hidden=false;
setProgress(0,jobs.length===1
?phrase('drawing.one')
:phrase('drawing.many',{count:jobs.length.toLocaleString()}));
const made=[];
for(const[index,job]of jobs.entries()){
setProgress(index/jobs.length,phrase('drawing.each',{name:names[index]}));
await new Promise((resolve)=>setTimeout(resolve,0));
const plan=atDensity(planSize(job.item.intrinsic,set),job.density);
const blob=await rasterize(job.item.text,plan,set);
made.push({...job,plan,blob,name:names[index]});
}
setProgress(1,phrase('progress.done'));
busy=false;
results=made;
renderResults();
render();
el.progress.hidden=true;
}
function setProgress(fraction,label){
el.progressBar.style.width=`${Math.round(fraction * 100)}%`;
el.progressLabel.textContent=label;
}
function renderResults(){
el.resultList.replaceChildren();
el.results.hidden=results.length===0;
if(!results.length)return;
const total=results.reduce((n,one)=>n+one.blob.size,0);
const sources=new Set(results.map((one)=>one.item.id)).size;
el.resultsSummary.textContent=results.length===1
?phrase('written.one',{
name:results[0].name,
size:dimensions(results[0].plan.width,results[0].plan.height),
bytes:humanBytes(total,phrase),
})
:phrase('written.many',{
count:results.length.toLocaleString(),
drawings:sources.toLocaleString(),
bytes:humanBytes(total,phrase),
});
for(const one of results)el.resultList.append(resultRow(one));
el.downloadZip.hidden=results.length<2;
el.downloadZip.onclick=()=>zipAll();
}
function resultRow(one){
const li=document.createElement('li');
li.className='result-row';
const textBlock=document.createElement('div');
textBlock.className='result-text';
const name=document.createElement('p');
name.className='result-name';
name.textContent=one.name;
const headline=document.createElement('p');
headline.className='result-headline';
headline.textContent=phrase('join.comma',{
a:dimensions(one.plan.width,one.plan.height),
b:humanBytes(one.blob.size,phrase),
});
const detail=document.createElement('p');
detail.className='result-detail';
detail.textContent=phrase(
one.density>1?'result.from.density':'result.from',
{
name:one.item.file.name,
size:dimensions(one.item.intrinsic.width,one.item.intrinsic.height),
times:times(one.plan.width/one.item.intrinsic.width),
density:one.density,
},
);
textBlock.append(name,headline,detail);
const actions=document.createElement('div');
actions.className='result-actions';
const download=document.createElement('a');
download.className='primary as-button';
download.textContent=phrase('result.download');
download.href=urlFor(one.blob);
download.download=one.name;
actions.append(download);
li.append(textBlock,actions);
return li;
}
async function zipAll(){
const files=[];
for(const one of results){
files.push({name:one.name,data:new Uint8Array(await one.blob.arrayBuffer())});
}
save(makeZip(files),'rasterized.zip');
}
function urlFor(blob){
const url=URL.createObjectURL(blob);
resultUrls.push(url);
return url;
}
function save(blob,name){
const url=URL.createObjectURL(blob);
const link=document.createElement('a');
link.href=url;
link.download=name;
link.click();
setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function clearResults(){
for(const url of resultUrls)URL.revokeObjectURL(url);
resultUrls=[];
results=[];
el.results.hidden=true;
el.resultList.replaceChildren();
el.resultsSummary.textContent='';
el.downloadZip.hidden=true;
el.downloadZip.onclick=null;
}
for(const control of[el.sizeMode,el.density,el.boxFit,el.format,el.backgroundMode]){
control.addEventListener('change',()=>{
clearResults();
render();
drawPreview();
});
}
for(const field of[el.sizeScale,el.sizeWidth,el.sizeHeight,el.sizeLongest,
el.boxWidth,el.boxHeight,el.backgroundColour,el.quality]){
field.addEventListener('input',()=>{
clearResults();
render();
drawPreview();
});
}
for(const[group,key]of[[$('scale-presets'),'scale'],[$('width-presets'),'width']]){
group.addEventListener('click',(event)=>{
const button=event.target.closest('button[data-'+key+']');
if(!button)return;
(key==='scale'?el.sizeScale:el.sizeWidth).value=button.dataset[key];
clearResults();
render();
drawPreview();
});
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
async function checkFormats(){
writable=await encodableTypes();
if(writable.has(WEBP))return;
const option=el.format.querySelector(`option[value="${WEBP}"]`);
if(option){
option.disabled=true;
option.textContent=phrase('format.webp.missing');
}
if(el.format.value===WEBP)el.format.value=PNG;
render();
}
window.addEventListener('error',(event)=>{
showLoadError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showLoadError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
render();
checkFormats();
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
