/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=b168080f3b';
import{saveBlob}from'./shared/download.js?v=b168080f3b';
import{messageBox}from'./shared/message-box.js?v=b168080f3b';
import{encodableTypes,FORMATS,JPEG,PNG,WEBP}from'./codecs.js?v=b168080f3b';
import{heifBrand,isAvif,readExif}from'./boxes.js?v=b168080f3b';
import{describeExif}from'./exif.js?v=b168080f3b';
import{engine,warmEngine}from'./heif.js?v=b168080f3b';
import{
bytes as humanBytes,change,dimensions,metadataText,resultTotals,uniqueNames,
}from'./files.js?v=b168080f3b';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=b168080f3b';
import{makeZip}from'./shared/zip.js?v=b168080f3b';
import{makeExample}from'./example.js?v=b168080f3b';
import{captureBatch,convertOne}from'./convert.js?v=b168080f3b';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
fileList:$('file-list'),
listToolbar:$('list-toolbar'),
countLabel:$('count-label'),
clearAll:$('clear-all'),
loadError:$('load-error'),
formatSelect:$('format-select'),
qualityRow:$('quality-row'),
quality:$('quality'),
qualityValue:$('quality-value'),
formatNote:$('format-note'),
keepExif:$('keep-exif'),
convertAll:$('convert-all'),
cancel:$('cancel'),
engineStatus:$('engine-status'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
results:$('results'),
resultList:$('result-list'),
downloadZip:$('download-zip'),
resultsSummary:$('results-summary'),
resultsSettings:$('results-settings'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showLoadError,clear:clearLoadError}=messageBox(el.loadError);
const HEAD_BYTES=256*1024;
let items=[];
let nextId=1;
let busy=false;
let stopping=false;
let results=[];
let resultUrls=[];
let writable=new Set([JPEG,PNG]);
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
addFiles(files);
},
example:makeExample,
});
async function addFiles(files){
if(!files?.length||busy)return;
picker.busy(readingLabel(files.length));
const failures=[];
try{
for(const file of files){
const head=new Uint8Array(await file.slice(0,HEAD_BYTES).arrayBuffer());
const avif=isAvif(head);
const brand=avif?'avif':heifBrand(head);
if(!brand){
failures.push(phrase('load.refused',
{name:file.name,why:refusal(head,file)}));
continue;
}
items.push({
id:nextId,
file,
brand,avif,
exif:describeExif(avif?null:readExif(head)),
});
nextId+=1;
}
}finally{
picker.done();
}
if(failures.length)showLoadError(failures.join('\n'));
else clearLoadError();
if(items.some(item=>!item.avif)){
warmEngine();
watchEngine();
}
clearResults();
render();
}
function refusal(head,file){
if(head[0]===0xff&&head[1]===0xd8)return phrase('refuse.jpeg');
if(head[0]===0x89&&head[1]===0x50)return phrase('refuse.png');
return phrase('refuse.other',{name:file.name});
}
function removeItem(id){
const at=items.findIndex((i)=>i.id===id);
if(at<0)return;
items.splice(at,1);
clearResults();
render();
}
el.clearAll.addEventListener('click',()=>{
items=[];
clearResults();
clearLoadError();
render();
});
function render(){
const any=items.length>0;
el.listToolbar.hidden=!any;
el.clearAll.disabled=busy;
el.formatSelect.disabled=busy;
el.quality.disabled=busy;
el.countLabel.textContent=any
?phrase(items.length===1?'list.count.one':'list.count.many',
{n:items.length,size:humanBytes(totalBytes(),phrase)})
:'';
el.convertAll.disabled=!any||busy;
el.keepExif.disabled=busy||(any&&items.every(item=>item.avif));
renderList();
renderFormatNote();
}
const totalBytes=()=>items.reduce((n,i)=>n+i.file.size,0);
function renderList(){
el.fileList.replaceChildren();
for(const item of items){
const li=document.createElement('li');
li.className='file-row';
const main=document.createElement('div');
main.className='file-main-wrap';
const text=document.createElement('div');
text.className='file-main';
const name=document.createElement('p');
name.className='file-name';
name.textContent=item.file.name;
text.appendChild(name);
const sub=document.createElement('p');
sub.className='file-sub';
sub.textContent=phrase(item.avif?'row.avif':'row.sub',
{brand:item.brand,size:humanBytes(item.file.size,phrase)});
text.appendChild(sub);
const note=document.createElement('p');
note.className=item.exif.gps?'file-note file-note-gps':'file-note';
note.textContent=item.avif?phrase('file.avif'):metadataText(item.exif,phrase);
text.appendChild(note);
main.appendChild(text);
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
function renderFormatNote(){
const mime=el.formatSelect.value;
const lossy=FORMATS[mime]?.lossy;
el.qualityRow.hidden=!lossy;
const format={[JPEG]:'format.jpeg',[PNG]:'format.png',[WEBP]:'format.webp'}[mime];
let details=!el.keepExif.checked
?phrase('exif.dropped')
:mime===JPEG
?phrase('exif.kept')
:phrase('exif.cannot',{format:FORMATS[mime]?.label??phrase('format.file')});
if(items.some(item=>item.avif)){
details=items.every(item=>item.avif)?phrase('file.avif')
:phrase('join.sentences',{a:details,b:phrase('file.avif')});
}
el.formatNote.textContent=format
?phrase('join.sentences',{a:phrase(format),b:details})
:details;
}
for(const control of[el.formatSelect,el.keepExif]){
control.addEventListener('change',()=>{
if(busy)return;
clearResults();
renderFormatNote();
});
}
el.quality.addEventListener('input',()=>{
if(busy)return;
el.qualityValue.textContent=el.quality.value;
clearResults();
});
el.convertAll.addEventListener('click',async()=>{
if(!items.length||busy)return;
const{settings,batch}=captureBatch(items,{
mime:el.formatSelect.value,quality:Number(el.quality.value)/100,
keepExif:el.keepExif.checked,
});
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
if(batch.some(item=>!item.avif)){
showProgress(0,batch.length,'',phrase('step.waiting'));
await engine();
}
for(const[index,item]of batch.entries()){
if(stopping){stopped=true;break;}
showProgress(index,batch.length,item.file.name,phrase('step.reading'));
try{
for(const result of await convertOne(item,settings,(key,values)=>{
if(stopping)throw new DOMException('Cancelled','AbortError');
showProgress(index,batch.length,item.file.name,phrase(key,values));
})){
collected.push(result);
}
}catch(error){
if(error?.name==='AbortError'){stopped=true;break;}
failures.push(phrase('load.refused',{
name:item.file.name,why:phrase(error.message,error.values),
}));
}
await new Promise((resolve)=>setTimeout(resolve,0));
}
}catch(error){
failures.push(phrase(error.message,error.values));
}finally{
busy=false;
stopping=false;
el.cancel.hidden=true;
el.progress.hidden=!stopped;
render();
}
if(stopped){
el.progressLabel.textContent=collected.length
?phrase('progress.stopped',{done:resultTotals(collected).files,total:batch.length})
:phrase('progress.stopped.none');
}
if(failures.length)showLoadError(failures.join('\n'));
results=collected;
showResults(settings);
});
el.cancel.addEventListener('click',()=>{stopping=true;});
function showProgress(index,total,name,note){
el.progressBar.style.width=`${Math.round((index / total) * 100)}%`;
el.progressLabel.textContent=name
?phrase('progress.line',{index:index+1,total,name,note})
:note;
}
function clearResults(){
for(const url of resultUrls)URL.revokeObjectURL(url);
resultUrls=[];
results=[];
el.resultList.replaceChildren();
el.results.hidden=true;
el.resultsSummary.textContent='';
el.resultsSettings.textContent='';
el.downloadZip.hidden=true;
}
function showResults(settings){
if(!results.length)return;
const names=uniqueNames(results.map((r)=>r.outName));
results.forEach((result,at)=>{result.outName=names[at];});
el.results.hidden=false;
el.resultsSettings.textContent=phrase('results.settings',{
format:FORMATS[settings.mime].label,quality:Math.round(settings.quality*100),
metadata:phrase(settings.hasHeic&&settings.keepExif&&settings.mime===JPEG
?'results.metadata.requested':'results.metadata.omitted'),
});
for(const result of results)el.resultList.appendChild(resultRow(result));
const{files:before,beforeBytes,afterBytes}=resultTotals(results);
const label=FORMATS[settings.mime].label;
el.resultsSummary.textContent=phrase('results.summary',{
files:phrase(before===1?'n.heic.one':'n.heic.many',{n:before}),
pictures:phrase(results.length===1?'n.picture.one':'n.picture.many',
{n:results.length,format:label}),
before:humanBytes(beforeBytes,phrase),
after:humanBytes(afterBytes,phrase),
change:change(beforeBytes,afterBytes,phrase),
});
el.downloadZip.hidden=results.length<2;
el.downloadZip.onclick=async()=>{
el.downloadZip.disabled=true;
try{
const files=await Promise.all(results.map(async(r)=>({
name:r.outName,
data:new Uint8Array(await r.blob.arrayBuffer()),
})));
saveBlob(makeZip(files),'converted-photos.zip');
}finally{
el.downloadZip.disabled=false;
}
};
}
function resultRow(result){
const li=document.createElement('li');
li.className='result-row';
const url=URL.createObjectURL(result.blob);
resultUrls.push(url);
const thumb=document.createElement('img');
thumb.className='result-thumb';
thumb.src=url;
thumb.alt=phrase('result.alt',{name:result.outName});
thumb.loading='lazy';
li.appendChild(thumb);
const text=document.createElement('div');
text.className='result-text';
const name=document.createElement('p');
name.className='result-name';
name.textContent=result.outName;
text.appendChild(name);
const headline=document.createElement('p');
headline.className='result-headline';
headline.textContent=result.parts>1
?humanBytes(result.after,phrase)
:phrase('result.headline',{
before:humanBytes(result.before,phrase),
after:humanBytes(result.after,phrase),
change:change(result.before,result.after,phrase),
});
text.appendChild(headline);
const detail=document.createElement('p');
detail.className='result-detail';
detail.textContent=describe(result);
text.appendChild(detail);
li.appendChild(text);
const actions=document.createElement('div');
actions.className='result-actions';
const link=document.createElement('a');
link.className='primary as-button';
link.href=url;
link.download=result.outName;
link.textContent=phrase('result.download');
actions.appendChild(link);
li.appendChild(actions);
return li;
}
function describe(result){
const parts=[phrase('out.format',{
format:FORMATS[result.mime]?.label??result.mime,
size:dimensions(result.width,result.height),
})];
if(FORMATS[result.mime]?.lossy){
parts.push(phrase('out.quality',{n:Math.round(result.quality*100)}));
}
if(result.part){
parts.push(phrase('out.part',{n:result.part,total:result.parts}));
}
parts.push({
kept:phrase(result.exif.gps?'out.exif.keptgps':'out.exif.kept'),
none:phrase('out.exif.none'),
'too large':phrase('out.exif.toolarge'),
}[result.metadata]);
return phrase('out.line',{list:parts.reduce((a,b)=>phrase('join.dot',{a,b}))});
}
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
function sayEngine(text,state=''){
el.engineStatus.textContent=text;
el.engineStatus.className=`engine-status ${state}`.trim();
}
let watching=false;
function watchEngine(){
if(watching)return;
watching=true;
sayEngine(phrase('engine.loading'));
engine().then(()=>{
sayEngine(phrase('engine.ready'),'good');
}).catch((error)=>{
sayEngine(phrase('engine.failed',
{why:phrase(error.message,error.values)}),'warn');
});
}
async function checkEncoders(){
writable=await encodableTypes();
if(writable.has(WEBP))return;
for(const option of el.formatSelect.options){
if(option.value===WEBP){
option.disabled=true;
option.textContent=phrase('webp.unsupported');
}
}
if(el.formatSelect.value===WEBP)el.formatSelect.value=JPEG;
renderFormatNote();
}
window.addEventListener('error',(event)=>{
showLoadError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showLoadError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
el.qualityValue.textContent=el.quality.value;
sayEngine(phrase('engine.first'));
render();
checkEncoders();
document.getElementById('boot-warning')?.remove();
