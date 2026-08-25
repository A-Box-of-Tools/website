/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{MIN_SIZE,clampRect}from'./regions.js';
import{applyRegions}from'./redact.js';
import{Preview}from'./preview.js';
import{Stage}from'./stage.js';
import{
chooseFormat,countSummary,describeRegion,outName,riskNote,sizeText,
stemOf,strengthNote,
}from'./files.js';
import{readingLabel,wireFilePicker}from'./shared/file-picker.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
loaded:$('loaded'),
loadedName:$('loaded-name'),
clearImage:$('clear-image'),
loadError:$('load-error'),
editEmpty:$('edit-empty'),
editControls:$('edit-controls'),
stage:$('stage'),
preview:$('preview'),
styleGroup:$('style-group'),
strength:$('strength'),
strengthNote:$('strength-note'),
addBox:$('add-box'),
undo:$('undo'),
clearBoxes:$('clear-boxes'),
boxSummary:$('box-summary'),
regionList:$('region-list'),
riskNote:$('risk-note'),
format:$('format'),
qualityRow:$('quality-row'),
quality:$('quality'),
qualityValue:$('quality-value'),
save:$('save'),
busy:$('busy'),
result:$('result'),
resultImage:$('result-image'),
resultFacts:$('result-facts'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
networkCount:$('network-count'),
networkDot:$('network-dot'),
offlineStatus:$('offline-status'),
offlineDot:$('offline-dot'),
};
let picture=null;
let regions=[];
let history=[];
let selectedId=null;
let style='fill';
let counter=0;
let busy=false;
let resultUrl=null;
let pending=0;
const preview=new Preview(el.preview);
const stage=new Stage(el.stage,{
onCreate:(rect)=>addRegion(rect),
onChange:(id,rect)=>moveRegion(id,rect),
onSelect:(id)=>select(id),
onDelete:(id)=>removeRegion(id),
onGestureStart:()=>snapshot(),
regionOf:(id)=>regions.find((region)=>region.id===id),
describe:(region,index)=>`Area ${index + 1}: ${describeRegion(region, el.strength.value)}. `
+'The arrow keys move it, Alt and the arrow keys resize it, and Delete removes it.',
});
async function decode(file){
if(typeof createImageBitmap==='function'){
try{
const bitmap=await createImageBitmap(file);
return{bitmap,width:bitmap.width,height:bitmap.height};
}catch{
}
}
const url=URL.createObjectURL(file);
try{
const image=await new Promise((resolve,reject)=>{
const element=new Image();
element.onload=()=>resolve(element);
element.onerror=()=>reject(new Error('this browser could not decode the picture.'));
element.src=url;
});
return{bitmap:image,width:image.naturalWidth,height:image.naturalHeight};
}finally{
URL.revokeObjectURL(url);
}
}
async function load(file){
clearLoadError();
wired.busy(readingLabel(1));
try{
const decoded=await decode(file);
dropPicture();
picture={file,...decoded};
el.stage.style.aspectRatio=`${decoded.width} / ${decoded.height}`;
preview.setSource(decoded.bitmap,decoded);
stage.setSource(decoded.width,decoded.height);
regions=[];
history=[];
selectedId=null;
counter=0;
el.loadedName.textContent=`${file.name} - ${decoded.width} x ${decoded.height}`;
el.loaded.hidden=false;
el.editEmpty.hidden=true;
el.editControls.hidden=false;
showFormatRow();
refresh();
}catch(error){
showLoadError(`That file could not be opened: ${error.message}`);
}finally{
wired.done();
}
}
function dropPicture(){
if(picture?.bitmap&&typeof picture.bitmap.close==='function')picture.bitmap.close();
picture=null;
if(resultUrl)URL.revokeObjectURL(resultUrl);
resultUrl=null;
el.result.hidden=true;
el.resultImage.removeAttribute('src');
}
const wired=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
if(files.length>0)load(files[0]);
},
});
el.clearImage.addEventListener('click',()=>{
dropPicture();
preview.clear();
regions=[];
history=[];
selectedId=null;
el.loaded.hidden=true;
el.editControls.hidden=true;
el.editEmpty.hidden=false;
el.fileInput.value='';
refresh();
});
const snapshot=()=>{
history.push(regions.map((region)=>({...region})));
if(history.length>100)history.shift();
};
function addRegion(rect,{focus=false}={}){
snapshot();
counter+=1;
const region={id:`r${counter}`,...clampRect(rect,picture),style};
regions.push(region);
selectedId=region.id;
refresh();
if(focus)stage.focus(region.id);
}
function moveRegion(id,rect){
const region=regions.find((item)=>item.id===id);
if(!region)return;
Object.assign(region,rect);
refresh();
}
function removeRegion(id){
regions=regions.filter((region)=>region.id!==id);
if(selectedId===id)selectedId=regions.at(-1)?.id??null;
refresh();
}
function select(id){
if(selectedId===id)return;
selectedId=id;
refresh();
}
function setStyle(next){
style=next;
const region=regions.find((item)=>item.id===selectedId);
if(region&&region.style!==next){
snapshot();
region.style=next;
}
refresh();
}
el.addBox.addEventListener('click',()=>{
if(!picture)return;
const width=Math.max(MIN_SIZE,Math.round(picture.width/4));
const height=Math.max(MIN_SIZE,Math.round(picture.height/6));
addRegion({
x:Math.round((picture.width-width)/2),
y:Math.round((picture.height-height)/2),
width,
height,
},{focus:true});
});
el.undo.addEventListener('click',()=>{
const previous=history.pop();
if(!previous)return;
regions=previous;
if(!regions.some((region)=>region.id===selectedId))selectedId=regions.at(-1)?.id??null;
refresh();
});
el.clearBoxes.addEventListener('click',()=>{
if(regions.length===0)return;
snapshot();
regions=[];
selectedId=null;
refresh();
});
el.styleGroup.addEventListener('change',(event)=>{
if(event.target.name==='style')setStyle(event.target.value);
});
el.strength.addEventListener('change',()=>refresh());
function refresh(){
stage.render(regions,selectedId);
renderList();
if(!pending){
pending=requestAnimationFrame(()=>{
pending=0;
preview.draw(regions,el.strength.value);
});
}
el.undo.disabled=history.length===0;
el.clearBoxes.disabled=regions.length===0;
el.save.disabled=!picture||busy;
el.strengthNote.textContent=strengthNote(el.strength.value);
}
function renderList(){
const strength=el.strength.value;
el.boxSummary.textContent=countSummary(regions);
const risk=riskNote(regions,strength);
el.riskNote.textContent=risk??'';
el.riskNote.hidden=risk===null;
el.regionList.replaceChildren(...regions.map((region,index)=>{
const row=document.createElement('li');
row.className=`region-row${region.id === selectedId ? ' selected' : ''}`;
const tag=document.createElement('span');
tag.className='region-tag';
tag.textContent=String(index+1);
const text=document.createElement('button');
text.type='button';
text.className='region-text';
text.textContent=describeRegion(region,strength);
text.addEventListener('click',()=>{
select(region.id);
stage.focus(region.id);
});
const choice=document.createElement('select');
choice.className='region-style';
choice.setAttribute('aria-label',`What area ${index + 1} does`);
for(const[value,label]of[
['fill','Black out'],['pixelate','Pixelate'],['blur','Blur'],
]){
const option=document.createElement('option');
option.value=value;
option.textContent=label;
option.selected=region.style===value;
choice.append(option);
}
choice.addEventListener('change',()=>{
snapshot();
region.style=choice.value;
refresh();
});
const remove=document.createElement('button');
remove.type='button';
remove.className='ghost danger region-remove';
remove.textContent='Remove';
remove.addEventListener('click',()=>{
snapshot();
removeRegion(region.id);
});
row.append(tag,text,choice,remove);
return row;
}));
}
function showFormatRow(){
el.qualityRow.hidden=!chooseFormat(el.format.value,picture?.file.type??'').lossy;
}
el.format.addEventListener('change',showFormatRow);
el.quality.addEventListener('input',()=>{
el.qualityValue.textContent=`${el.quality.value}%`;
});
el.save.addEventListener('click',()=>save());
async function save(){
if(!picture||busy)return;
busy=true;
el.save.disabled=true;
el.busy.hidden=false;
el.result.hidden=true;
await new Promise((resolve)=>setTimeout(resolve,0));
try{
const format=chooseFormat(el.format.value,picture.file.type);
const canvas=document.createElement('canvas');
canvas.width=picture.width;
canvas.height=picture.height;
const context=canvas.getContext('2d',{willReadFrequently:true});
if(format.mime==='image/jpeg'){
context.fillStyle='#ffffff';
context.fillRect(0,0,canvas.width,canvas.height);
}
context.drawImage(picture.bitmap,0,0);
const pixels=context.getImageData(0,0,canvas.width,canvas.height);
applyRegions(pixels,regions,el.strength.value);
context.putImageData(pixels,0,0);
const quality=format.lossy?Number(el.quality.value)/100:undefined;
const blob=await new Promise((resolve,reject)=>{
canvas.toBlob(
(made)=>(made?resolve(made):reject(new Error('the browser could not encode it.'))),
format.mime,
quality,
);
});
canvas.width=0;
canvas.height=0;
showResult(blob,format);
}catch(error){
showLoadError(`Something went wrong writing the file: ${error.message}`);
}finally{
busy=false;
el.busy.hidden=true;
el.save.disabled=false;
}
}
function showResult(blob,format){
if(resultUrl)URL.revokeObjectURL(resultUrl);
resultUrl=URL.createObjectURL(blob);
const name=outName(stemOf(picture.file.name),format);
el.resultImage.src=resultUrl;
el.resultImage.alt=`The redacted picture, ${picture.width} by ${picture.height} pixels`;
el.download.href=resultUrl;
el.download.download=name;
const facts=[
`${name} - ${sizeText(blob.size)}, ${picture.width} x ${picture.height}`,
countSummary(regions)||'No areas were marked, so this is the same picture re-encoded.',
'Written from the redacted pixels, so it carries no EXIF, no GPS, no embedded '
+'thumbnail and no layer with the original in it.',
];
el.resultFacts.replaceChildren(...facts.map((line)=>{
const item=document.createElement('li');
item.textContent=line;
return item;
}));
el.result.hidden=false;
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
:` The page's own ad, measurement and donate-button scripts loaded from ${platform.size} host${platform.size === 1 ? '' : 's'}; not one of them was given a picture or a byte of one.`;
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
window.addEventListener('error',(event)=>{
showLoadError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showLoadError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
refresh();
showFormatRow();
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
