/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase,fill}from'./shared/phrases.js?v=04048d2d77';
import{messageBox}from'./shared/message-box.js?v=04048d2d77';
import{sizeText}from'./shared/format.js?v=04048d2d77';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=04048d2d77';
import{makeZip}from'./shared/zip.js?v=04048d2d77';
import{saveBlob}from'./shared/download.js?v=04048d2d77';
import{
AVIF,FORMATS,JPEG,
canDecode,change,decode,encode,hasAlpha,outName,release,sniff,uniqueNames,
}from'./shared/image-convert.js?v=04048d2d77';
import{makeExample}from'./example.js?v=04048d2d77';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
fileList:$('file-list'),
listToolbar:$('list-toolbar'),
countLabel:$('count-label'),
clearAll:$('clear-all'),
loadError:$('load-error'),
supportError:$('support-error'),
quality:$('quality'),
qualityValue:$('quality-value'),
backgroundRow:$('background-row'),
background:$('background'),
backgroundNote:$('background-note'),
settingsNote:$('settings-note'),
run:$('run'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
runError:$('run-error'),
results:$('results'),
resultList:$('result-list'),
resultsSummary:$('results-summary'),
downloadZip:$('download-zip'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showLoadError,clear:clearLoadError}=messageBox(el.loadError);
const{show:showRunError,clear:clearRunError}=messageBox(el.runError);
const{show:showSupportError}=messageBox(el.supportError);
const bytes=(n)=>sizeText(n,phrase,{under:'size.bytes',kb:'auto'});
const FOUND={
'image/png':'found.png',
'image/jpeg':'found.jpeg',
'image/webp':'found.webp',
'image/gif':'found.gif',
'image/bmp':'found.bmp',
};
let items=[];
let nextId=1;
let busy=false;
let supported=true;
let results=[];
let resultUrls=[];
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
addFiles(files).catch((error)=>showLoadError(phrase('error.broke',{detail:error.message})));
},
example:makeExample,
});
async function addFiles(files){
if(!files?.length||busy)return;
picker.busy(readingLabel(files.length));
const failures=[];
let refused=0;
try{
for(const file of files){
const head=new Uint8Array(await file.slice(0,64).arrayBuffer());
const kind=sniff(head);
if(kind!==AVIF){
failures.push(kind
?phrase('read.notavif',{name:file.name,found:phrase(FOUND[kind]??kind)})
:phrase('read.unknown',{name:file.name}));
continue;
}
let decoded;
try{
decoded=await decode(file);
}catch(error){
refused+=1;
failures.push(phrase('read.failed',{
name:file.name,
why:phrase(error.message,fill(error.values)),
}));
continue;
}
const alpha=hasAlpha(decoded.bitmap,decoded.width,decoded.height);
release(decoded.bitmap);
items.push({
id:nextId,
file,
width:decoded.width,
height:decoded.height,
alpha,
thumbUrl:URL.createObjectURL(file),
});
nextId+=1;
}
}finally{
picker.done();
}
if(failures.length)showLoadError(failures.join('\n'));
else clearLoadError();
if(refused>0&&items.length===0)noDecoder();
clearResults();
render();
}
function removeItem(id){
const item=items.find((one)=>one.id===id);
if(!item||busy)return;
URL.revokeObjectURL(item.thumbUrl);
items=items.filter((one)=>one.id!==id);
clearResults();
render();
}
el.clearAll.addEventListener('click',()=>{
if(busy)return;
for(const item of items)URL.revokeObjectURL(item.thumbUrl);
items=[];
clearResults();
clearLoadError();
render();
});
const settings=()=>({
mime:JPEG,
quality:Number(el.quality.value)/100,
background:el.background.value,
});
const anyAlpha=()=>items.some((item)=>item.alpha);
function render(){
renderList();
renderSettings();
gate();
}
function renderList(){
el.fileList.replaceChildren();
el.listToolbar.hidden=items.length===0;
el.countLabel.textContent=items.length===1
?phrase('chosen.one')
:phrase('chosen.many',{count:items.length.toLocaleString()});
el.clearAll.disabled=busy;
for(const item of items)el.fileList.append(fileRow(item));
}
function fileRow(item){
const row=document.createElement('li');
row.className='file-row';
const wrap=document.createElement('div');
wrap.className='file-main-wrap';
const thumb=document.createElement('img');
thumb.className='file-thumb';
thumb.classList.toggle('see-through',item.alpha);
thumb.src=item.thumbUrl;
thumb.alt='';
const main=document.createElement('div');
main.className='file-main';
const name=document.createElement('p');
name.className='file-name';
name.textContent=item.file.name;
const sub=document.createElement('p');
sub.className='file-sub';
sub.textContent=phrase('file.facts',{
size:bytes(item.file.size),
dimensions:phrase('dimensions',{width:item.width,height:item.height}),
});
main.append(name,sub);
if(item.alpha){
const note=document.createElement('p');
note.className='file-out';
note.textContent=phrase('file.alpha');
main.append(note);
}
wrap.append(thumb,main);
const remove=document.createElement('button');
remove.type='button';
remove.className='row-remove';
remove.textContent='×';
const label=phrase('row.remove',{name:item.file.name});
remove.title=label;
remove.setAttribute('aria-label',label);
remove.disabled=busy;
remove.addEventListener('click',()=>removeItem(item.id));
row.append(wrap,remove);
return row;
}
function renderSettings(){
el.qualityValue.textContent=el.quality.value;
el.quality.disabled=busy;
el.background.disabled=busy;
const alpha=anyAlpha();
el.backgroundRow.hidden=!alpha;
el.backgroundNote.textContent=phrase(alpha?'background.some':'background.none');
const quality=el.quality.value;
const count=items.length.toLocaleString();
if(!items.length)el.settingsNote.textContent=phrase('settings.none');
else if(items.length===1)el.settingsNote.textContent=phrase('settings.one',{quality});
else el.settingsNote.textContent=phrase('settings.many',{count,quality});
el.run.textContent=items.length>1
?phrase('run.many',{count})
:phrase('run.one');
el.run.disabled=busy||items.length===0||!supported;
}
function gate(){
if(items.length)picker.arrived();
else picker.waiting();
}
el.run.addEventListener('click',()=>{
runAll().catch((error)=>{
showRunError(phrase('run.failed',{detail:error.message}));
busy=false;
el.progress.hidden=true;
render();
});
});
async function runAll(){
if(busy||!items.length||!supported)return;
busy=true;
clearRunError();
clearResults();
render();
const set=settings();
const names=uniqueNames(items.map((item)=>outName(item.file.name,FORMATS[set.mime].ext)));
el.progress.hidden=false;
const made=[];
for(const[index,item]of items.entries()){
setProgress(index/items.length,phrase('progress.each',{name:item.file.name}));
await new Promise((resolve)=>setTimeout(resolve,0));
const decoded=await decode(item.file);
try{
const blob=await encode(decoded.bitmap,{
width:decoded.width,
height:decoded.height,
mime:set.mime,
quality:set.quality,
background:set.background,
});
made.push({item,blob,name:names[index]});
}finally{
release(decoded.bitmap);
}
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
const total=results.reduce((sum,one)=>sum+one.blob.size,0);
if(results.length===1){
const[one]=results;
const delta=change(one.item.file.size,one.blob.size);
el.resultsSummary.textContent=phrase('written.one',{
name:one.name,
size:bytes(one.blob.size),
change:phrase(delta.key,fill(delta.values)),
});
}else{
el.resultsSummary.textContent=phrase('written.many',{
count:results.length.toLocaleString(),
size:bytes(total),
});
}
for(const one of results)el.resultList.append(resultRow(one));
el.downloadZip.hidden=results.length<2;
el.downloadZip.onclick=()=>zipAll();
}
function resultRow(one){
const li=document.createElement('li');
li.className='result-row';
const text=document.createElement('div');
text.className='result-text';
const name=document.createElement('p');
name.className='result-name';
name.textContent=one.name;
const headline=document.createElement('p');
headline.className='result-headline';
const delta=change(one.item.file.size,one.blob.size);
headline.textContent=phrase('result.headline',{
size:bytes(one.blob.size),
change:phrase(delta.key,fill(delta.values)),
});
const detail=document.createElement('p');
detail.className='result-detail';
detail.textContent=phrase('result.detail',{
name:one.item.file.name,
dimensions:phrase('dimensions',{width:one.item.width,height:one.item.height}),
was:bytes(one.item.file.size),
});
text.append(name,headline,detail);
if(one.item.alpha){
const note=document.createElement('p');
note.className='result-detail';
note.textContent=phrase('result.flattened',{colour:el.background.value});
text.append(note);
}
const actions=document.createElement('div');
actions.className='result-actions';
const download=document.createElement('a');
download.className='primary as-button';
download.textContent=phrase('result.download');
download.href=urlFor(one.blob);
download.download=one.name;
actions.append(download);
li.append(text,actions);
return li;
}
async function zipAll(){
const files=[];
for(const one of results){
files.push({name:one.name,data:new Uint8Array(await one.blob.arrayBuffer())});
}
saveBlob(makeZip(files),'converted-jpg.zip');
}
function urlFor(blob){
const url=URL.createObjectURL(blob);
resultUrls.push(url);
return url;
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
el.quality.addEventListener('input',()=>{
clearResults();
renderSettings();
});
el.background.addEventListener('input',()=>{
clearResults();
renderSettings();
});
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
function noDecoder(){
supported=false;
showSupportError(phrase('support.noavif'));
renderSettings();
}
async function checkSupport(){
if(await canDecode(AVIF))return;
noDecoder();
}
window.addEventListener('error',(event)=>{
showLoadError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showLoadError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
render();
checkSupport();
document.getElementById('boot-warning')?.remove();
