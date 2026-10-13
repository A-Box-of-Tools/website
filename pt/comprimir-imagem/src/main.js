/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=944001be75';
import{acceptsImageFile}from'./shared/image-input.js?v=944001be75';
import{measureImage}from'./shared/media.js?v=944001be75';
import{saveBlob}from'./shared/download.js?v=944001be75';
import{messageBox}from'./shared/message-box.js?v=944001be75';
import{
encodableTypes,FORMATS,JPEG,PNG,WEBP,
}from'./codecs.js?v=944001be75';
import{captureSettings,compressOne}from'./process.js?v=944001be75';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=944001be75';
import{
bytes,targetBytes,dimensions,change,matchText,psnrText,
}from'./files.js?v=944001be75';
import{makeZip}from'./shared/zip.js?v=944001be75';
import{makeExample}from'./example.js?v=944001be75';
const $=(id)=>document.getElementById(id);
const say=(saying)=>(saying?phrase(saying.key,saying.values):'');
const humanBytes=(n)=>say(bytes(n));
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
fileList:$('file-list'),
listToolbar:$('list-toolbar'),
countLabel:$('count-label'),
clearAll:$('clear-all'),
loadError:$('load-error'),
targetValue:$('target-value'),
targetUnit:$('target-unit'),
presets:$('presets'),
targetSummary:$('target-summary'),
formatSelect:$('format-select'),
allowResize:$('allow-resize'),
formatNote:$('format-note'),
compressAll:$('compress-all'),
cancel:$('cancel'),
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
if(!isImage(file)){
failures.push(phrase('load.unreadable',{name:file.name}));
continue;
}
const item={
id:nextId,
file,
thumbUrl:URL.createObjectURL(file),
size:null,
};
nextId+=1;
item.size=await measureImage(item.thumbUrl);
if(!item.size){
URL.revokeObjectURL(item.thumbUrl);
failures.push(phrase('load.undecodable',{name:file.name}));
continue;
}
items.push(item);
}
}finally{
picker.done();
}
if(failures.length)showLoadError(failures.join('\n'));
else clearLoadError();
clearResults();
render();
}
function isImage(file){
return acceptsImageFile(file,['jpg','jpeg','png','webp','gif','bmp','avif']);
}
function removeItem(id){
const at=items.findIndex((i)=>i.id===id);
if(at<0)return;
URL.revokeObjectURL(items[at].thumbUrl);
items.splice(at,1);
clearResults();
render();
}
el.clearAll.addEventListener('click',()=>{
for(const item of items)URL.revokeObjectURL(item.thumbUrl);
items=[];
clearResults();
clearLoadError();
render();
});
function render(){
const any=items.length>0;
el.listToolbar.hidden=!any;
el.clearAll.disabled=busy;
for(const control of[el.targetValue,el.targetUnit,el.formatSelect,el.allowResize,
...el.presets.querySelectorAll('button')])control.disabled=busy;
el.countLabel.textContent=any
?phrase(items.length===1?'list.count.one':'list.count.many',
{count:items.length,size:humanBytes(totalBytes())})
:'';
renderList();
renderTargetSummary();
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
const target=targetBytes(el.targetValue.value,el.targetUnit.value);
if(target&&item.file.size<=target){
const note=document.createElement('p');
note.className='file-note';
note.textContent=phrase('row.under');
text.appendChild(note);
}
main.appendChild(text);
li.appendChild(main);
const remove=document.createElement('button');
remove.type='button';
remove.className='row-remove';
const takeOff=phrase('row.remove',{name:item.file.name});
remove.title=takeOff;
remove.setAttribute('aria-label',takeOff);
remove.textContent='×';
remove.disabled=busy;
remove.addEventListener('click',()=>removeItem(item.id));
li.appendChild(remove);
el.fileList.appendChild(li);
}
}
function renderTargetSummary(){
const target=targetBytes(el.targetValue.value,el.targetUnit.value);
el.compressAll.disabled=!target||!items.length||busy;
if(!target){
el.targetSummary.textContent=phrase('target.none');
el.targetSummary.className='field-summary warn';
return;
}
el.targetSummary.className='field-summary';
const over=items.filter((i)=>i.file.size>target).length;
const under=items.length-over;
const size=humanBytes(target);
if(!items.length){
el.targetSummary.textContent=phrase('target.empty',{size});
return;
}
if(items.length===1){
el.targetSummary.textContent=phrase(over?'target.single.over':'target.single.under',
{size});
return;
}
const overPart=phrase(over===1?'target.over.one':'target.over.many',
{over,total:items.length,size});
el.targetSummary.textContent=under===0
?phrase('target.summary',{over:overPart})
:phrase('target.summary.rest',{
over:overPart,
rest:phrase(under===1?'target.rest.one':'target.rest.many',{count:under}),
});
}
function renderFormatNote(){
const choice=el.formatSelect.value;
const resize=el.allowResize.checked;
const key={
auto:'format.auto',
keep:'format.keep',
[JPEG]:'format.jpeg',
[WEBP]:'format.webp',
[PNG]:'format.png',
}[choice];
el.formatNote.textContent=phrase('format.note',{
format:key?phrase(key):'',
sizing:phrase(resize?'format.resize.on':'format.resize.off'),
}).trim();
}
for(const control of[el.targetValue,el.targetUnit]){
control.addEventListener('input',()=>{
if(busy)return;
clearResults();
renderList();
renderTargetSummary();
});
}
for(const control of[el.formatSelect,el.allowResize]){
control.addEventListener('change',()=>{
if(busy)return;
clearResults();
renderFormatNote();
});
}
el.presets.addEventListener('click',(event)=>{
if(busy)return;
const button=event.target.closest('button[data-bytes]');
if(!button)return;
const amount=Number(button.dataset.bytes);
const unit=amount>=1024*1024?'MB':'KB';
el.targetValue.value=String(amount/(unit==='MB'?1024*1024:1024));
el.targetUnit.value=unit;
clearResults();
renderList();
renderTargetSummary();
});
el.compressAll.addEventListener('click',async()=>{
const target=targetBytes(el.targetValue.value,el.targetUnit.value);
if(!target||!items.length||busy)return;
const settings=captureSettings({
targetBytes:target,format:el.formatSelect.value,allowResize:el.allowResize.checked,
},writable);
const batch=items.slice();
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
for(const[index,item]of batch.entries()){
if(stopping){stopped=true;break;}
showProgress(index,batch.length,item.file.name,'step.reading');
try{
collected.push(await compressOne(item,settings,(step,values)=>{
if(stopping)throw new DOMException('Cancelled','AbortError');
showProgress(index,batch.length,item.file.name,step,values);
}));
}catch(error){
if(error?.name==='AbortError'){stopped=true;break;}
failures.push(`${item.file.name}: ${phrase(error.message, error.values)}`);
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
?phrase('progress.stopped',{done:collected.length,total:batch.length})
:phrase('progress.stopped.none');
}
if(failures.length)showLoadError(failures.join('\n'));
results=collected;
showResults(settings);
});
el.cancel.addEventListener('click',()=>{stopping=true;});
function showProgress(index,total,name,step,values){
const done=index/total;
el.progressBar.style.width=`${Math.round(done * 100)}%`;
el.progressLabel.textContent=phrase('progress.at',{
at:index+1,total,name,step:phrase(step,values),
});
}
function clearResults(){
for(const url of resultUrls)URL.revokeObjectURL(url);
resultUrls=[];
results=[];
el.resultList.replaceChildren();
el.results.hidden=true;
el.downloadZip.hidden=true;
el.resultsSummary.textContent='';
el.resultsSettings.textContent='';
}
function showResults(settings){
el.resultList.replaceChildren();
if(!results.length)return;
el.results.hidden=false;
el.resultsSettings.textContent=phrase('run.settings',{
target:humanBytes(settings.targetBytes),
format:settings.format==='auto'||settings.format==='keep'
?phrase(`run.format.${settings.format}`):FORMATS[settings.format].label,
resize:phrase(settings.allowResize?'run.resize.on':'run.resize.off'),
});
for(const result of results){
el.resultList.appendChild(resultRow(result));
}
const before=results.reduce((n,r)=>n+r.before,0);
const after=results.reduce((n,r)=>n+r.after,0);
const missed=results.filter((r)=>!r.fitted).length;
el.resultsSummary.textContent=missed
?phrase(missed===1?'results.missed.one':'results.missed.many',
{before:humanBytes(before),after:humanBytes(after),count:missed})
:phrase('results.all',{
before:humanBytes(before),after:humanBytes(after),change:say(change(before,after)),
});
el.downloadZip.hidden=results.length<2;
el.downloadZip.onclick=async()=>{
el.downloadZip.disabled=true;
try{
const files=await Promise.all(results.map(async(r)=>({
name:r.outName,
data:new Uint8Array(await r.blob.arrayBuffer()),
})));
saveBlob(makeZip(files),'compressed-images.zip');
}finally{
el.downloadZip.disabled=false;
}
};
}
function resultRow(result){
const li=document.createElement('li');
li.className='result-row';
if(!result.fitted)li.classList.add('result-missed');
if(result.untouched)li.classList.add('result-untouched');
const text=document.createElement('div');
text.className='result-text';
const name=document.createElement('p');
name.className='result-name';
name.textContent=result.outName;
text.appendChild(name);
const headline=document.createElement('p');
headline.className='result-headline';
headline.textContent=result.untouched
?phrase('row.headline.untouched',{size:humanBytes(result.before)})
:phrase('row.headline',{
before:humanBytes(result.before),
after:humanBytes(result.after),
change:say(change(result.before,result.after)),
});
text.appendChild(headline);
const detail=document.createElement('p');
detail.className='result-detail';
detail.textContent=describe(result);
text.appendChild(detail);
if(result.match){
const match=document.createElement('p');
match.className='result-match';
match.textContent=phrase('row.match',{
match:say(matchText(result.match.ssim)),
ssim:result.match.ssim.toFixed(3),
psnr:say(psnrText(result.match.psnr)),
});
text.appendChild(match);
}
if(!result.fitted){
const warn=document.createElement('p');
warn.className='result-warn';
warn.textContent=phrase('row.missed');
text.appendChild(warn);
}
li.appendChild(text);
const actions=document.createElement('div');
actions.className='result-actions';
const url=URL.createObjectURL(result.blob);
resultUrls.push(url);
const link=document.createElement('a');
link.className='primary as-button';
link.href=url;
link.download=result.outName;
link.textContent=phrase('row.download');
actions.appendChild(link);
if(!result.untouched){
const toggle=document.createElement('button');
toggle.type='button';
toggle.className='ghost';
toggle.setAttribute('aria-expanded','false');
toggle.textContent=phrase('row.compare');
actions.appendChild(toggle);
const panel=comparePanel(result,url);
panel.hidden=true;
li.appendChild(panel);
toggle.addEventListener('click',()=>{
panel.hidden=!panel.hidden;
toggle.setAttribute('aria-expanded',String(!panel.hidden));
toggle.textContent=phrase(panel.hidden?'row.compare':'row.hide');
});
}
li.appendChild(actions);
return li;
}
function describe(result){
if(result.untouched)return phrase('detail.untouched');
const label=FORMATS[result.mime]?.label??result.mime;
const lossy=FORMATS[result.mime]?.lossy;
return phrase(lossy?'detail.line.quality':'detail.line',{
format:phrase(result.changedFormat?'detail.format.changed':'detail.format',
{format:label}),
quality:lossy?result.quality.toFixed(2):'',
size:result.resized
?phrase('detail.resized',{
to:dimensions(result.width,result.height),
from:dimensions(result.size.width,result.size.height),
})
:phrase('detail.full',{size:dimensions(result.width,result.height)}),
encodes:phrase(result.encodes===1?'detail.encodes.one':'detail.encodes.many',
{count:result.encodes}),
});
}
function comparePanel(result,resultUrl){
const panel=document.createElement('div');
panel.className='compare';
for(const[label,src,note]of[
[phrase('compare.original'),result.item.thumbUrl,phrase('compare.note',{
size:humanBytes(result.before),
dimensions:dimensions(result.size.width,result.size.height),
})],
[phrase('compare.compressed'),resultUrl,phrase('compare.note',{
size:humanBytes(result.after),
dimensions:dimensions(result.width,result.height),
})],
]){
const figure=document.createElement('figure');
figure.className='compare-side';
const img=document.createElement('img');
img.src=src;
img.alt=phrase('compare.alt',{label,name:result.name});
img.loading='lazy';
figure.appendChild(img);
const caption=document.createElement('figcaption');
const strong=document.createElement('strong');
strong.textContent=label;
caption.appendChild(strong);
caption.appendChild(document.createTextNode(` ${note}`));
figure.appendChild(caption);
panel.appendChild(figure);
}
const hint=document.createElement('p');
hint.className='compare-hint';
hint.textContent=phrase('compare.hint');
panel.appendChild(hint);
return panel;
}
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
async function checkEncoders(){
writable=await encodableTypes();
if(writable.has(WEBP))return;
for(const option of el.formatSelect.options){
if(option.value===WEBP){
option.disabled=true;
option.textContent=phrase('format.webp.unavailable');
}
}
if(el.formatSelect.value===WEBP)el.formatSelect.value='auto';
renderFormatNote();
}
window.addEventListener('error',(event)=>{
showLoadError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showLoadError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
render();
checkEncoders();
document.getElementById('boot-warning')?.remove();
