/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{readSource}from'./assemble.js';
import{bytes as humanBytes,count,shortName}from'./format.js';
import{sizeLabel}from'./pages.js';
import{describeRanges,parseRanges}from'./plan.js';
import{produce}from'./produce.js';
import{EncryptedPdfError,NotAPdfError,PdfDocument}from'./reader.js';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
loadError:$('load-error'),
loadNote:$('load-note'),
sourceList:$('source-list'),
pagesCard:$('pages-card'),
countLabel:$('count-label'),
reverse:$('reverse'),
rotateAll:$('rotate-all'),
restore:$('restore'),
clearAll:$('clear-all'),
range:$('range'),
rangeKeep:$('range-keep'),
rangeDrop:$('range-drop'),
rangeTurn:$('range-turn'),
rangeError:$('range-error'),
pageList:$('page-list'),
outputCard:$('output-card'),
splitModes:$('split-modes'),
splitSize:$('split-size'),
splitAt:$('split-at'),
byFilePreset:$('by-file-preset'),
keepBookmarks:$('keep-bookmarks'),
outputSummary:$('output-summary'),
runCard:$('run-card'),
run:$('run'),
cancel:$('cancel'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
runError:$('run-error'),
result:$('result'),
resultSize:$('result-size'),
resultSub:$('result-sub'),
download:$('download'),
checkLine:$('check-line'),
resultFacts:$('result-facts'),
fileList:$('file-list'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
networkCount:$('network-count'),
networkDot:$('network-dot'),
offlineStatus:$('offline-status'),
offlineDot:$('offline-dot'),
};
let sources=[];
let entries=[];
let running=null;
let urls=[];
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
addFiles(files);
},
});
async function addFiles(files){
if(running)return;
picker.busy(readingLabel(files.length));
el.loadError.hidden=true;
const refused=[];
const notes=[];
for(const file of files){
try{
if(!looksLikePdf(file)){
refused.push(`${file.name}: not a PDF, so there are no pages in it to move.`);
continue;
}
const raw=new Uint8Array(await file.arrayBuffer());
const doc=await PdfDocument.open(raw);
const source=readSource(doc,file.name);
if(!source.pages.length){
refused.push(`${file.name}: opened, but no pages could be found in it.`);
continue;
}
sources.push({source,name:file.name,size:file.size});
for(let index=0;index<source.pages.length;index+=1){
entries.push({source,index,rotate:0});
}
if(doc.repaired){
notes.push(`${file.name} had a cross-reference table that did not match its `
+'contents, so it was read by scanning for objects instead. That is a repair, '
+'and it worked, but check the result before you send it anywhere.');
}
}catch(error){
refused.push(`${file.name}: ${messageFor(error)}`);
}
}
picker.done();
if(refused.length)showLoadError(refused.join('\n'));
if(notes.length)note(notes.join(' '));
else el.loadNote.hidden=true;
render();
}
function looksLikePdf(file){
return file.type==='application/pdf'||/\.pdf$/i.test(file.name);
}
function messageFor(error){
if(error instanceof EncryptedPdfError){
return'this PDF is encrypted. Taking a password off a document is a different job '
+'from moving its pages around, and this tool will not do it behind your back.';
}
if(error instanceof NotAPdfError)return phrase(error.message);
if(error?.name==='AbortError')return'cancelled.';
return`could not be read (${error?.message ?? error}).`;
}
function showLoadError(text){
el.loadError.textContent=text;
el.loadError.hidden=false;
}
function note(text){
el.loadNote.textContent=text;
el.loadNote.hidden=false;
}
function renderSources(){
el.sourceList.hidden=sources.length===0;
el.sourceList.replaceChildren(...sources.map((item)=>{
const row=document.createElement('li');
row.className='source-row';
const main=document.createElement('div');
main.className='source-main';
const name=document.createElement('strong');
name.className='source-name';
name.textContent=item.name;
name.title=item.name;
const facts=document.createElement('span');
facts.className='source-facts';
const used=entries.filter((entry)=>entry.source===item.source).length;
const total=item.source.pages.length;
facts.textContent=`${humanBytes(item.size)} · ${count(total, 'page')}`
+(used===total?'':` · ${used} of them still in the running order`);
main.append(name,facts);
const remove=document.createElement('button');
remove.type='button';
remove.className='ghost danger';
remove.textContent='Remove';
remove.setAttribute('aria-label',`Remove ${item.name} and all of its pages`);
remove.addEventListener('click',()=>{
if(running)return;
sources=sources.filter((other)=>other!==item);
entries=entries.filter((entry)=>entry.source!==item.source);
render();
});
row.append(main,remove);
return row;
}));
}
let dragIndex=null;
let dropAt=null;
function clearDropMarkers(){
for(const node of el.pageList.querySelectorAll('.insert-before, .insert-after')){
node.classList.remove('insert-before','insert-after');
}
}
function buildPageNode(entry,index){
const page=entry.source.pages[entry.index];
const li=document.createElement('li');
li.className='page-item';
li.dataset.index=String(index);
const handle=document.createElement('button');
handle.type='button';
handle.className='drag-handle';
handle.draggable=true;
handle.textContent='⋮⋮';
handle.title=`Drag to move page ${index + 1}`;
handle.setAttribute('aria-label',`Drag to move page ${index + 1}`);
const shapeWrap=document.createElement('div');
shapeWrap.className='shape-wrap';
shapeWrap.draggable=true;
const turned=entry.rotate%180!==0;
const width=turned?page.height:page.width;
const height=turned?page.width:page.height;
const shape=document.createElement('div');
shape.className='page-shape';
shape.style.aspectRatio=`${Math.max(1, width)} / ${Math.max(1, height)}`;
const number=document.createElement('span');
number.className='page-number';
number.textContent=String(index+1);
shape.append(number);
if(entry.rotate%360!==0){
const turn=document.createElement('span');
turn.className='turn-badge';
turn.textContent=`${((entry.rotate % 360) + 360) % 360}°`;
turn.title='Turned by this tool';
shape.append(turn);
}
shapeWrap.append(shape);
const remove=document.createElement('button');
remove.type='button';
remove.className='remove-btn';
remove.textContent='×';
remove.title=`Remove page ${index + 1}`;
remove.setAttribute('aria-label',`Remove page ${index + 1}`);
remove.addEventListener('click',()=>{
if(running)return;
entries.splice(index,1);
render();
});
shapeWrap.append(remove);
const meta=document.createElement('div');
meta.className='page-meta';
if(sources.length>1){
const from=document.createElement('p');
from.className='page-from';
from.textContent=shortName(entry.source.label);
from.title=`${entry.source.label}, page ${entry.index + 1}`;
meta.append(from);
}
const dims=document.createElement('p');
dims.className='page-dims';
dims.textContent=sizeLabel(width,height);
meta.append(dims);
const controls=document.createElement('div');
controls.className='page-controls';
controls.append(
tileButton('↺',`Turn page ${index + 1} anticlockwise`,false,()=>{
turn(entry,-90);
}),
tileButton('↻',`Turn page ${index + 1} clockwise`,false,()=>{
turn(entry,90);
}),
tileButton('‹',`Move page ${index + 1} earlier`,index===0,()=>{
move(index,index-1);
}),
tileButton('›',`Move page ${index + 1} later`,index===entries.length-1,()=>{
move(index,index+1);
}),
);
meta.append(controls);
li.append(handle,shapeWrap,meta);
wireDrag(li,[handle,shapeWrap],index);
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
function turn(entry,degrees){
if(running)return;
entry.rotate=(((entry.rotate+degrees)%360)+360)%360;
render();
}
function move(from,to){
if(running||to<0||to>=entries.length)return;
const[item]=entries.splice(from,1);
entries.splice(to,0,item);
render();
}
function wireDrag(li,handles,index){
const startDrag=(event)=>{
if(running){event.preventDefault();return;}
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
for(const source of handles){
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
move(from,target);
}
el.pageList.addEventListener('dragover',(event)=>{
if(dragIndex!==null)event.preventDefault();
});
el.pageList.addEventListener('drop',(event)=>{
if(dragIndex===null)return;
event.preventDefault();
applyDrop();
});
el.reverse.addEventListener('click',()=>{
if(running)return;
entries.reverse();
render();
});
el.rotateAll.addEventListener('click',()=>{
if(running)return;
for(const entry of entries)entry.rotate=(entry.rotate+90)%360;
render();
});
el.restore.addEventListener('click',()=>{
if(running)return;
entries=[];
for(const item of sources){
for(let index=0;index<item.source.pages.length;index+=1){
entries.push({source:item.source,index,rotate:0});
}
}
el.range.value='';
render();
});
el.clearAll.addEventListener('click',()=>{
if(running)return;
sources=[];
entries=[];
el.range.value='';
el.loadError.hidden=true;
el.loadNote.hidden=true;
render();
el.dropzone.focus();
});
el.rangeKeep.addEventListener('click',()=>applyRange('keep'));
el.rangeDrop.addEventListener('click',()=>applyRange('drop'));
el.rangeTurn.addEventListener('click',()=>applyRange('turn'));
function applyRange(what){
if(running)return;
const{pages,error}=parseRanges(el.range.value,entries.length);
el.rangeError.hidden=!error;
el.rangeError.textContent=error;
if(error)return;
if(!pages.length){
el.rangeError.textContent='Name some pages first - 1-3, 8, 12- and so on.';
el.rangeError.hidden=false;
return;
}
const chosen=new Set(pages.map((page)=>page-1));
if(what==='keep')entries=entries.filter((_,index)=>chosen.has(index));
if(what==='drop')entries=entries.filter((_,index)=>!chosen.has(index));
if(what==='turn'){
for(const index of chosen){
const entry=entries[index];
if(entry)entry.rotate=(entry.rotate+90)%360;
}
}
if(what!=='turn')el.range.value='';
render();
}
el.splitModes.addEventListener('change',renderPlan);
for(const input of[el.splitSize,el.splitAt]){
input.addEventListener('input',()=>{
const owner=input.closest('.preset')?.querySelector('input[type="radio"]');
if(owner)owner.checked=true;
renderPlan();
});
}
el.keepBookmarks.addEventListener('change',renderPlan);
function splitMode(){
return el.splitModes.querySelector('input:checked')?.value??'single';
}
function currentSplit(){
const mode=splitMode();
const at=mode==='at'
?parseRanges(el.splitAt.value,entries.length).pages
:[];
return{mode,size:Number(el.splitSize.value)||1,at};
}
function renderPlan(){
const split=currentSplit();
const files=countOutputs(split);
const from=new Set(entries.map((entry)=>entry.source)).size;
const parts=[
`${count(entries.length, 'page')} from ${count(from, 'file')}`,
files===1
?'as one PDF'
:`as ${count(files, 'PDF')}, handed over in one ZIP so it is one save rather `
+`than ${files}`,
];
if(split.mode==='at'&&!split.at.length&&el.splitAt.value.trim()){
parts.push('- but nothing in that box names a page in range, so it would come out '
+'as one file');
}
el.outputSummary.textContent=`${parts.join(' ')}.`;
el.run.textContent=files===1?'Build the document':`Build ${files} documents`;
}
function countOutputs(split){
if(!entries.length)return 0;
if(split.mode==='each')return entries.length;
if(split.mode==='every')return Math.ceil(entries.length/Math.max(1,split.size));
if(split.mode==='at'){
return new Set(split.at.filter((n)=>n>1&&n<=entries.length)).size+1;
}
if(split.mode==='file')return new Set(entries.map((entry)=>entry.source)).size;
return 1;
}
function render(){
renderSources();
const has=entries.length>0;
el.countLabel.textContent=has
?`${count(entries.length, 'page')} in the running order`
:'No pages left. Add a file, or press "Back to how they came".';
el.byFilePreset.hidden=new Set(entries.map((entry)=>entry.source)).size<2;
if(el.byFilePreset.hidden&&splitMode()==='file'){
el.splitModes.querySelector('input[value="single"]').checked=true;
}
el.pageList.replaceChildren(...entries.map(buildPageNode));
renderPlan();
}
el.run.addEventListener('click',run);
el.cancel.addEventListener('click',()=>running?.abort());
async function run(){
if(!entries.length||running)return;
running=new AbortController();
el.run.disabled=true;
el.cancel.hidden=false;
el.result.hidden=true;
el.runError.hidden=true;
el.progress.hidden=false;
setProgress(0,1,'Copying pages');
releaseDownloads();
let cancelled=false;
try{
const result=await produce(entries,{
split:currentSplit(),
stem:sources[0]?.name??'document',
suffix:sources.length>1?'merged':'edited',
bookmarks:el.keepBookmarks.checked,
},{
signal:running.signal,
onProgress:(done,total,what)=>setProgress(done,total,
what?`Writing ${what}`:'Checking what was written'),
});
showResult(result);
}catch(error){
if(error?.name==='AbortError'){
cancelled=true;
el.progressLabel.textContent='Cancelled. Nothing was changed; the pages above '
+'are still exactly as you left them.';
}else{
el.runError.textContent=`That did not work: ${error?.message ?? error}`;
el.runError.hidden=false;
}
}finally{
running=null;
el.run.disabled=false;
el.cancel.hidden=true;
el.progress.hidden=!cancelled;
if(cancelled)el.progressBar.style.width='0%';
}
}
let stageText='';
function setProgress(done,total,stage){
if(stage)stageText=stage;
if(Number.isFinite(done)&&total){
el.progressBar.style.width=`${Math.round((done / Math.max(1, total)) * 100)}%`;
}
el.progressLabel.textContent=`${stageText}...`;
}
function showResult(result){
const total=result.files.reduce((sum,file)=>sum+file.size,0);
const pages=result.files.reduce((sum,file)=>sum+file.pages,0);
el.resultSize.textContent=result.files.length===1
?`One document, ${humanBytes(total)}`
:`${count(result.files.length, 'document')}, ${humanBytes(total)} altogether`;
el.resultSub.textContent=`${count(pages, 'page')} from `
+`${count(sources.length, 'file')}.`;
el.checkLine.textContent=result.ok
?'Checked: every file was opened again by this page and its pages counted.'
:`This run did not check out - ${result.problem}. Keep your originals.`;
el.checkLine.className=`check-line ${result.ok ? 'good' : 'bad'}`;
renderFacts(result);
renderFiles(result);
const handed=result.archive??{name:result.files[0].name,blob:blobFor(result.files[0])};
el.download.href=keepUrl(handed.blob);
el.download.download=handed.name;
el.download.textContent=result.archive
?`Download all ${result.files.length} as a ZIP`
:'Download';
el.download.hidden=!result.ok;
el.result.hidden=false;
}
function renderFacts(result){
const facts=[...result.notes];
const fields=result.files.reduce((sum,file)=>sum+file.fields,0);
const links=result.files.reduce((sum,file)=>sum+file.links,0);
if(links){
facts.push(`${count(links, 'link')} came across, with the ones that point inside `
+'the document rewritten to follow their page to where it now is.');
}
if(fields){
facts.push(`${count(fields, 'form field')} came across, filled in as they were.`);
}
facts.push('Not carried across, because it describes an order that no longer exists: '
+'the tagged-reading-order tree, page labels ("iii, iv, 1, 2"), embedded '
+'attachments, and any document-level JavaScript. Nor is any producer line, '
+'creation date, or name for the tool that made it.');
el.resultFacts.replaceChildren(...facts.map((text)=>{
const row=document.createElement('li');
row.textContent=text;
return row;
}));
}
function renderFiles(result){
el.fileList.hidden=result.files.length<2;
if(result.files.length<2){
el.fileList.replaceChildren();
return;
}
el.fileList.replaceChildren(...result.files.map((file)=>{
const row=document.createElement('li');
const name=document.createElement('span');
name.className='out-name';
name.textContent=file.name;
const facts=document.createElement('span');
facts.className='out-facts';
facts.textContent=`${count(file.pages, 'page')} · ${humanBytes(file.size)}`;
const link=document.createElement('a');
link.className='ghost';
link.textContent='Download';
link.download=file.name;
link.href=keepUrl(blobFor(file));
link.hidden=!file.check.ok;
const problem=document.createElement('span');
problem.className='out-problem';
problem.textContent=file.check.ok?'':file.check.text;
row.append(name,facts,problem,link);
return row;
}));
}
function blobFor(file){
return new Blob([file.data],{type:'application/pdf'});
}
function keepUrl(blob){
const url=URL.createObjectURL(blob);
urls.push(url);
return url;
}
function releaseDownloads(){
for(const url of urls)URL.revokeObjectURL(url);
urls=[];
el.download.removeAttribute('href');
el.fileList.replaceChildren();
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
const inspect=(found)=>{
for(const entry of found){
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
render();
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
