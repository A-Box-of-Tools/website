/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{messageBox}from'./shared/message-box.js';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js';
import{SCALES,outputSize,planRun,scaleThatFits}from'./plan.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
toolbar:$('list-toolbar'),
countLabel:$('count-label'),
sortName:$('sort-name'),
clearAll:$('clear-all'),
list:$('frame-list'),
mode:$('mode'),
modeNote:$('mode-note'),
align:$('align'),
alignNote:$('align-note'),
scale:$('scale'),
scaleNote:$('scale-note'),
kappaField:$('kappa-field'),
kappa:$('kappa'),
kappaValue:$('kappa-value'),
radiusField:$('radius-field'),
radius:$('radius'),
radiusValue:$('radius-value'),
gain:$('gain'),
gainValue:$('gain-value'),
gainNote:$('gain-note'),
format:$('format'),
qualityRow:$('quality-row'),
quality:$('quality'),
qualityValue:$('quality-value'),
plan:$('plan'),
planOutput:$('plan-output'),
planMemory:$('plan-memory'),
planDecodes:$('plan-decodes'),
planRead:$('plan-read'),
planWarning:$('plan-warning'),
run:$('run'),
cancel:$('cancel'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
error:$('error'),
result:$('result'),
resultImage:$('result-image'),
resultInfo:$('result-info'),
resultMoves:$('result-moves'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showError}=messageBox(el.error);
let frames=[];
let busy=false;
let inspecting=0;
let resultUrl=null;
let startedAt=0;
let worker=null;
let local=null;
function ensureWorker(){
if(worker||local)return;
try{
worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});
worker.addEventListener('message',(event)=>handle(event.data));
worker.addEventListener('error',()=>{
worker=null;
showError(phrase('error.unknown'));
finishRun();
});
}catch{
local=import('./pipeline.js');
}
}
async function send(message){
ensureWorker();
if(worker){
worker.postMessage(message);
return;
}
const pipeline=await local;
const hooks={
cancelled:()=>cancelled,
onProgress:(update)=>handle({type:'progress',update}),
};
try{
if(message.type==='inspect'){
handle({type:'inspected',id:message.id,found:await pipeline.inspect(message.files,hooks)});
}else if(message.type==='run'){
handle({type:'done',result:await pipeline.runStack(message.request,hooks)});
}
}catch(error){
handle(error instanceof pipeline.Cancelled
?{type:'cancelled'}
:{type:'error',message:String(error?.message??'error.unknown')});
}
}
let cancelled=false;
function stopWork(){
cancelled=true;
if(worker)worker.postMessage({type:'cancel'});
}
let unsupported=false;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(chosen){
if(unsupported){
showUnsupported();
return;
}
addFiles(chosen);
},
});
let batch=0;
const pending=new Map();
function addFiles(chosen){
if(busy){
showError(phrase('error.busy'));
return;
}
const id=(batch+=1);
inspecting+=1;
picker.busy(readingLabel(chosen.length));
const added=chosen.map((file)=>({file,info:null,thumb:null,ok:true}));
frames=frames.concat(added);
render();
cancelled=false;
pending.set(id,added);
send({type:'inspect',id,files:chosen});
}
function batchDone(id){
const added=pending.get(id);
pending.delete(id);
inspecting-=1;
if(inspecting<=0){
inspecting=0;
picker.done();
}
return added;
}
function batchFailed(id){
const added=batchDone(id);
if(!added)return;
frames=frames.filter((slot)=>!added.includes(slot));
render();
}
function inspected(id,found){
const added=batchDone(id);
if(!added)return;
found.forEach((result,index)=>{
const slot=added[index];
if(!slot)return;
slot.ok=result.ok&&Boolean(result.frame.width);
slot.info=result.frame;
slot.thumb=result.thumb?URL.createObjectURL(result.thumb):null;
});
const failed=added.filter((slot)=>!slot.ok);
if(failed.length){
showError(phrase('error.unreadable',{name:failed[0].info?.name??failed[0].file.name}));
}
frames=frames.filter((slot)=>slot.ok||slot.info===null);
render();
}
function removeAt(index){
const[gone]=frames.splice(index,1);
if(gone?.thumb)URL.revokeObjectURL(gone.thumb);
render();
}
function makeReference(index){
const[chosen]=frames.splice(index,1);
frames.unshift(chosen);
render();
}
function clearAll(){
for(const slot of frames)if(slot.thumb)URL.revokeObjectURL(slot.thumb);
frames=[];
render();
}
const bytes=(n)=>{
if(!Number.isFinite(n))return'';
if(n>=1024*1024*1024)return`${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
if(n>=1024*1024)return`${Math.round(n / 1024 / 1024)} MB`;
if(n>=1024)return`${Math.round(n / 1024)} KB`;
return`${n} B`;
};
function render(){
renderList();
renderSettings();
renderPlan();
el.run.disabled=busy||ready().length<2;
}
const ready=()=>frames.filter((slot)=>slot.ok&&slot.info?.width);
function renderList(){
el.toolbar.hidden=frames.length===0;
el.countLabel.textContent=frames.length===0
?phrase('count.none')
:phrase(frames.length===1?'count.one':'count.many',{count:frames.length});
el.list.replaceChildren(...frames.map((slot,index)=>row(slot,index)));
}
function row(slot,index){
const item=document.createElement('li');
item.className='frame-row';
const thumb=document.createElement('img');
thumb.className='frame-thumb';
thumb.alt='';
if(slot.thumb)thumb.src=slot.thumb;
item.append(thumb);
const body=document.createElement('div');
body.className='frame-body';
const name=document.createElement('p');
name.className='frame-name';
name.textContent=slot.info?.name??slot.file.name;
body.append(name);
const detail=document.createElement('p');
detail.className='frame-detail';
detail.textContent=describe(slot);
body.append(detail);
if(slot.info?.kind==='raw'&&slot.info.bytesRead){
const read=document.createElement('p');
read.className='frame-read';
read.textContent=phrase('frame.read',{
read:bytes(slot.info.bytesRead),total:bytes(slot.info.sourceBytes),
});
body.append(read);
}
item.append(body);
const actions=document.createElement('div');
actions.className='frame-actions';
if(index===0){
const badge=document.createElement('span');
badge.className='frame-badge';
badge.textContent=phrase('frame.reference');
actions.append(badge);
}else{
const promote=document.createElement('button');
promote.type='button';
promote.className='ghost';
promote.textContent=phrase('frame.make-reference');
promote.addEventListener('click',()=>makeReference(index));
actions.append(promote);
}
const remove=document.createElement('button');
remove.type='button';
remove.className='ghost danger';
remove.textContent=phrase('frame.remove');
remove.addEventListener('click',()=>removeAt(index));
actions.append(remove);
item.append(actions);
return item;
}
function describe(slot){
const info=slot.info;
if(!info)return phrase('progress.survey',{name:slot.file.name});
if(info.kind==='raw-unreadable')return phrase('frame.raw-unreadable');
if(info.kind==='raw'){
return info.camera
?phrase('frame.raw-camera',{camera:info.camera,width:info.width,height:info.height})
:phrase('frame.raw',{width:info.width,height:info.height});
}
return phrase('frame.size',{width:info.width,height:info.height});
}
function renderSettings(){
const mode=el.mode.value;
const count=Math.max(ready().length,1);
el.modeNote.textContent=phrase(`mode.${mode}`,{
count,
factor:Math.sqrt(count).toFixed(1),
});
el.alignNote.textContent=phrase(`align.${el.align.value}`);
el.scaleNote.textContent=phrase('scale.note');
el.kappaField.hidden=mode!=='sigma';
el.radiusField.hidden=mode!=='focus';
el.kappaValue.textContent=`${Number(el.kappa.value).toFixed(1)}σ`;
el.radiusValue.textContent=`${el.radius.value} px`;
el.gainValue.textContent=`${Number(el.gain.value).toFixed(2)}×`;
el.qualityValue.textContent=String(Math.round(Number(el.quality.value)*100));
el.qualityRow.hidden=el.format.value!=='jpeg';
el.gainNote.textContent=mode==='sum'&&ready().length>1
?phrase('gain.sum-note',{count,suggested:(1/count).toFixed(2)})
:phrase('gain.note');
}
function renderPlan(){
const usable=ready();
if(usable.length<2){
el.plan.hidden=true;
el.planWarning.hidden=true;
return;
}
const mode=el.mode.value;
const scale=SCALES[el.scale.value]??1;
const sizes=usable.map((slot)=>slot.info);
const output=outputSize(sizes,scale);
if(!output){
el.plan.hidden=true;
return;
}
const plan=planRun({
width:output.width,height:output.height,frames:usable.length,mode,
});
el.plan.hidden=false;
el.planOutput.textContent=phrase('plan.output',{
width:output.width,height:output.height,
});
el.planMemory.textContent=phrase('plan.memory',{
mb:Math.round(plan.peak/1024/1024),
});
let decodes='plan.decodes.simple';
if(plan.banded)decodes='plan.decodes.banded';
else if(plan.passes>1)decodes='plan.decodes.passes';
el.planDecodes.textContent=phrase(decodes,{
count:plan.decodes,passes:plan.passes,bands:plan.bands,
});
const read=usable.reduce((sum,slot)=>sum+(slot.info.bytesRead??0),0);
const total=usable.reduce((sum,slot)=>sum+(slot.info.sourceBytes??0),0);
el.planRead.textContent=phrase('plan.read',{read:bytes(read),total:bytes(total)});
if(plan.banded){
const natural=outputSize(sizes,1);
const better=scaleThatFits({...natural,frames:usable.length,mode});
const suggestion=better&&better!==el.scale.value
?el.scale.querySelector(`option[value="${better}"]`)?.textContent?.split('—')[0]?.trim()
:null;
el.planWarning.textContent=suggestion
?phrase('plan.banded',{bands:plan.bands,suggested:suggestion})
:phrase('plan.banded-anyway',{bands:plan.bands});
el.planWarning.hidden=false;
}else{
el.planWarning.hidden=true;
}
}
function start(){
const usable=ready();
if(usable.length<2){
showError(phrase('error.one.frame'));
return;
}
busy=true;
cancelled=false;
startedAt=performance.now();
el.error.hidden=true;
el.result.hidden=true;
el.cancel.hidden=false;
el.progress.hidden=false;
el.progressBar.style.width='0%';
el.progressLabel.textContent='';
render();
send({
type:'run',
request:{
files:usable.map((slot)=>slot.file),
mode:el.mode.value,
align:el.align.value,
scale:SCALES[el.scale.value]??1,
kappa:Number(el.kappa.value),
gain:Number(el.gain.value),
radius:Number(el.radius.value),
format:el.format.value,
quality:Number(el.quality.value),
},
});
}
function handle(message){
if(!message)return;
switch(message.type){
case'inspected':
inspected(message.id,message.found);
break;
case'progress':
progress(message.update);
break;
case'done':
finished(message.result);
break;
case'cancelled':
if(message.id)batchFailed(message.id);
else finishRun();
break;
case'error':
showError(resolve(message.message));
if(message.id&&pending.has(message.id))batchFailed(message.id);
else finishRun();
break;
default:
break;
}
}
function resolve(message){
if(/^[a-z]+\.[a-z.-]+$/.test(message)){
const found=phrase(`error.${message.replace(/^error\./, '')}`);
if(!found.startsWith('error.'))return found;
}
if(/quota|memory|allocat/i.test(message))return phrase('error.memory');
return message||phrase('error.unknown');
}
function progress(update){
if(!update||!busy)return;
if(update.stage==='planned')return;
const total=update.total||1;
const done=update.done??0;
el.progressBar.style.width=`${Math.min(100, Math.round((done / total) * 100))}%`;
if(update.stage==='stack'){
el.progressLabel.textContent=update.bands>1
?phrase('progress.stack-banded',{
band:update.band,bands:update.bands,done,total,
})
:phrase('progress.stack',{done,total});
return;
}
el.progressLabel.textContent=phrase(`progress.${update.stage}`,{name:update.name??''});
}
function finished(result){
finishRun();
if(resultUrl)URL.revokeObjectURL(resultUrl);
resultUrl=URL.createObjectURL(result.blob);
el.resultImage.src=resultUrl;
el.download.href=resultUrl;
el.download.download=`stacked.${result.blob.type === 'image/jpeg' ? 'jpg' : 'png'}`;
el.resultInfo.textContent=phrase('result.info',{
width:result.width,
height:result.height,
size:bytes(result.blob.size),
count:result.frames.length,
seconds:((performance.now()-startedAt)/1000).toFixed(1),
});
el.resultMoves.textContent=movesNote(result.moves)
+(result.cropped?` ${phrase('result.cropped')}`:'');
el.result.hidden=false;
}
function movesNote(moves){
if(el.align.value==='none')return phrase('result.moves-none');
const measurable=moves.slice(1);
const weak=measurable.filter((move)=>!(move.confidence>4)).length;
const clamped=measurable.filter((move)=>move.clamped).length;
if(weak){
return phrase('result.moves-some',{count:weak,total:moves.length});
}
if(clamped)return phrase('result.moves-clamped',{count:clamped});
return phrase('result.moves');
}
function finishRun(){
busy=false;
el.cancel.hidden=true;
el.progress.hidden=true;
render();
}
el.run.addEventListener('click',start);
el.cancel.addEventListener('click',stopWork);
el.clearAll.addEventListener('click',clearAll);
el.sortName.addEventListener('click',()=>{
frames.sort((a,b)=>(a.info?.name??a.file.name)
.localeCompare(b.info?.name??b.file.name,undefined,{numeric:true}));
render();
});
for(const control of[el.mode,el.align,el.scale,el.format]){
control.addEventListener('change',render);
}
for(const control of[el.kappa,el.radius,el.gain,el.quality]){
control.addEventListener('input',renderSettings);
}
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
function showUnsupported(){
showError('This browser has no OffscreenCanvas, which this tool does all of its '
+'drawing on. Chrome, Edge, Firefox 105 or Safari 16.4 and newer have it.');
}
if(typeof OffscreenCanvas!=='function'){
unsupported=true;
showUnsupported();
el.run.disabled=true;
}
render();
document.getElementById('boot-warning')?.remove();
