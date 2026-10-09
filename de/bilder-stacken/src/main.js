/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=6f5ce41257';
import{messageBox}from'./shared/message-box.js?v=6f5ce41257';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=6f5ce41257';
import{SCALES,outputSize,planRun,scaleThatFits}from'./plan.js?v=6f5ce41257';
import{runContext}from'./run-context.js?v=6f5ce41257';
import{makeExample}from'./example.js?v=6f5ce41257';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
toolbar:$('list-toolbar'),
countLabel:$('count-label'),
sortName:$('sort-name'),
clearAll:$('clear-all'),
reorderHint:$('reorder-hint'),
list:$('frame-list'),
framesPanel:$('frames-panel'),
framesSummary:$('frames-summary'),
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
normalize:$('normalize'),
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
planNote:$('plan-note'),
run:$('run'),
cancel:$('cancel'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
error:$('error'),
result:$('result'),
resultStale:$('result-stale'),
resultFrame:$('result-frame'),
viewSource:$('view-source'),
viewSize:$('view-size'),
viewerStatus:$('viewer-status'),
alignmentList:$('alignment-list'),
resultImage:$('result-image'),
referenceImage:$('reference-image'),
comparisonStage:$('comparison-stage'),
divider:$('comparison-divider'),
comparisonHandle:$('comparison-handle'),
referenceLabel:$('reference-label'),
resultLabel:$('result-label'),
resultInfo:$('result-info'),
resultSettings:$('result-settings'),
resultMoves:$('result-moves'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showError}=messageBox(el.error);
const comparisonOption=el.viewSource.querySelector('option[value="compare"]');
let frames=[];
let reference=null;
let busy=false;
let inspecting=0;
let resultUrl=null;
let startedAt=0;
let activeRequest=null;
let activeSlots=[];
let completed=null;
let referenceUrl=null;
let comparing=false;
let comparisonId=0;
let collapsedOnPhone=false;
let localQueue=Promise.resolve();
let currentPlan=null;
let imagePan=null;
let worker=null;
let local=null;
function ensureWorker(){
if(worker||local)return;
try{
worker=new Worker(new URL('./worker.js?v=6f5ce41257',import.meta.url),{type:'module'});
worker.addEventListener('message',(event)=>handle(event.data));
worker.addEventListener('error',()=>{
worker?.terminate();
worker=null;
local=import('./pipeline.js?v=6f5ce41257');
for(const id of[...pending.keys()])batchFailed(id);
el.viewSource.value='result';
finishComparison();
finishRun();
renderViewer();
showError(phrase('error.unknown'));
});
}catch{
local=import('./pipeline.js?v=6f5ce41257');
}
}
async function send(message){
try{
ensureWorker();
if(worker){
worker.postMessage(message);
return;
}
localQueue=localQueue.then(async()=>{
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
}else if(message.type==='compare'){
handle({type:'compared',id:message.id,result:await pipeline.compareReference(message.request,hooks)});
}
}catch(error){
handle(error instanceof pipeline.Cancelled
?{type:'cancelled',id:message.id,kind:message.type}
:{type:'error',id:message.id,kind:message.type,message:String(error?.message??'error.unknown')});
}
}).catch((error)=>handle({type:'error',id:message.id,kind:message.type,message:String(error?.message??'error.unknown')}));
await localQueue;
}catch(error){
handle({type:'error',id:message.id,kind:message.type,message:String(error?.message??'error.unknown')});
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
example:makeExample,
});
let batch=0;
const pending=new Map();
function addFiles(chosen){
if(busy||comparing){
showError(phrase('error.busy'));
return;
}
discardResult();
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
if(!added)return null;
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
for(const slot of added){
slot.ok=false;
slot.info={name:slot.file.name};
}
render();
}
function inspected(id,found){
const added=batchDone(id);
if(!added)return;
found.forEach((result,index)=>{
const slot=added[index];
if(!slot||!frames.includes(slot))return;
slot.ok=result.ok&&Boolean(result.frame.width);
slot.info=result.frame;
slot.thumb=result.thumb?URL.createObjectURL(result.thumb):null;
});
const failed=added.filter((slot)=>!slot.ok);
if(failed.length){
showError(phrase('import.skipped',{count:failed.length}));
}
if(!reference||!ready().includes(reference))reference=ready()[0]??null;
if(!collapsedOnPhone&&frames.length>4&&matchMedia('(max-width: 544px)').matches){
el.framesPanel.open=false;
collapsedOnPhone=true;
}
render();
}
function removeAt(index){
if(busy||comparing)return;
discardResult();
const[gone]=frames.splice(index,1);
if(gone?.thumb)URL.revokeObjectURL(gone.thumb);
if(gone===reference)reference=ready()[0]??null;
render();
}
function makeReference(index){
if(busy||comparing||!ready().includes(frames[index]))return;
discardResult();
reference=frames[index]??null;
render();
}
function moveFrame(from,to){
if(busy||comparing||to<0||to>=frames.length||from===to)return;
const[moved]=frames.splice(from,1);
frames.splice(to,0,moved);
render();
el.list.children[to]?.querySelector('.drag-handle')?.focus();
}
function clearAll(){
if(busy||comparing)return;
discardResult();
for(const slot of frames)if(slot.thumb)URL.revokeObjectURL(slot.thumb);
frames=[];
reference=null;
collapsedOnPhone=false;
el.framesPanel.open=true;
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
const locked=busy||comparing;
for(const control of[el.fileInput,el.sortName,el.clearAll,el.mode,el.align,
el.scale,el.kappa,el.radius,el.gain,el.format,el.quality,
...el.list.querySelectorAll('button')])control.disabled=locked;
el.viewSource.disabled=comparing;
el.run.disabled=unsupported||locked||inspecting>0||ready().length<2||Boolean(currentPlan?.overBudget);
el.normalize.disabled=locked||inspecting>0||ready().length<2;
}
const ready=()=>frames.filter((slot)=>slot.ok&&slot.info?.width);
const referenceSlot=()=>(
reference&&ready().includes(reference)?reference:ready()[0]??null
);
function renderList(){
el.toolbar.hidden=frames.length===0;
el.reorderHint.hidden=frames.length<2;
el.countLabel.textContent=frames.length===0
?phrase('count.none')
:phrase(frames.length===1?'count.one':'count.many',{count:frames.length});
const chosen=referenceSlot();
el.framesPanel.hidden=frames.length===0;
el.framesSummary.textContent=chosen?.ok&&chosen.info?.width
?phrase('frames.summary',{frames:el.countLabel.textContent,name:chosen.file.name})
:el.countLabel.textContent;
el.list.replaceChildren(...frames.map((slot,index)=>row(slot,index,slot===chosen)));
}
function row(slot,index,isReference){
const item=document.createElement('li');
item.className='frame-row';
item.classList.toggle('is-invalid',!slot.ok);
if(isReference)item.classList.add('is-reference');
const label=slot.info?.name??slot.file.name;
item.append(dragHandle(label,index));
const thumb=document.createElement('img');
thumb.className='frame-thumb';
thumb.alt='';
if(slot.thumb)thumb.src=slot.thumb;
item.append(thumb);
const body=document.createElement('div');
body.className='frame-body';
const name=document.createElement('p');
name.className='frame-name';
name.textContent=label;
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
if(isReference){
const badge=document.createElement('span');
badge.className='frame-badge';
badge.textContent=phrase('frame.reference');
actions.append(badge);
}else if(slot.ok&&slot.info?.width){
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
wireDrag(item,index);
return item;
}
let dragIndex=null;
let dropAt=null;
function clearDropMarkers(){
for(const node of el.list.querySelectorAll('.insert-before, .insert-after')){
node.classList.remove('insert-before','insert-after');
}
}
function dragHandle(label,index){
const handle=document.createElement('button');
handle.type='button';
handle.className='drag-handle';
handle.draggable=true;
handle.textContent='⋮⋮';
const said=phrase('frame.move',{name:label});
handle.title=said;
handle.setAttribute('aria-label',said);
handle.addEventListener('keydown',(event)=>{
if(event.key!=='ArrowUp'&&event.key!=='ArrowDown')return;
event.preventDefault();
moveFrame(index,event.key==='ArrowUp'?index-1:index+1);
});
return handle;
}
function wireDrag(item,index){
const handle=item.querySelector('.drag-handle');
handle.addEventListener('dragstart',(event)=>{
dragIndex=index;
item.classList.add('dragging');
event.dataTransfer.effectAllowed='move';
event.dataTransfer.setData('text/plain',String(index));
event.dataTransfer.setDragImage(item,24,item.offsetHeight/2);
});
handle.addEventListener('dragend',()=>{
dragIndex=null;
dropAt=null;
item.classList.remove('dragging');
clearDropMarkers();
});
item.addEventListener('dragover',(event)=>{
if(dragIndex===null)return;
event.preventDefault();
event.dataTransfer.dropEffect='move';
const rect=item.getBoundingClientRect();
const after=event.clientY>rect.top+rect.height/2;
clearDropMarkers();
item.classList.add(after?'insert-after':'insert-before');
dropAt={index,after};
});
item.addEventListener('drop',(event)=>{
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
clearDropMarkers();
moveFrame(from,target);
}
function describe(slot){
const info=slot.info;
if(!info)return phrase('progress.survey',{name:slot.file.name});
if(!slot.ok)return phrase('frame.unreadable');
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
el.gainValue.textContent=`${Number(Number(el.gain.value).toPrecision(4))}×`;
el.normalize.hidden=mode!=='sum';
el.qualityValue.textContent=String(Math.round(Number(el.quality.value)*100));
el.qualityRow.hidden=el.format.value!=='jpeg';
el.gainNote.textContent=mode==='sum'&&ready().length>1
?phrase('gain.sum-note',{count,suggested:Number((1/count).toPrecision(4))})
:phrase('gain.note');
}
function renderPlan(){
currentPlan=null;
const usable=ready();
if(usable.length<2){
el.plan.hidden=true;
el.planNote.hidden=true;
el.planWarning.hidden=true;
return;
}
const mode=el.mode.value;
const scale=SCALES[el.scale.value]??1;
const sizes=usable.map((slot)=>slot.info);
const surveyDecodePixels=Math.max(...sizes.map((info)=>info.surveyDecodePixels??info.width*info.height));
const output=outputSize(sizes,scale);
if(!output){
el.plan.hidden=true;
return;
}
const plan=planRun({
width:output.width,height:output.height,frames:usable.length,mode,
radius:Number(el.radius.value),align:el.align.value,surveyDecodePixels,
});
currentPlan=plan;
el.plan.hidden=false;
el.planNote.hidden=false;
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
if(plan.overBudget){
el.planWarning.textContent=phrase('plan.too-large');
el.planWarning.hidden=false;
}else if(plan.banded){
const natural=outputSize(sizes,1);
const better=scaleThatFits({...natural,frames:usable.length,mode,radius:Number(el.radius.value),align:el.align.value,surveyDecodePixels});
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
if(busy||comparing||inspecting||unsupported)return;
if(currentPlan?.overBudget){
showError(phrase('plan.too-large'));
return;
}
if(!el.gain.checkValidity()){
el.gain.reportValidity();
return;
}
const usable=ready();
if(usable.length<2){
showError(phrase('error.one.frame'));
return;
}
const chosen=referenceSlot();
const first=usable.includes(chosen)?chosen:usable[0];
const ordered=[first,...usable.filter((slot)=>slot!==first)];
discardResult(false);
activeSlots=ordered;
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
activeRequest={
files:ordered.map((slot)=>slot.file),
mode:el.mode.value,
align:el.align.value,
scale:SCALES[el.scale.value]??1,
kappa:Number(el.kappa.value),
gain:Number(el.gain.value),
radius:Number(el.radius.value),
format:el.format.value,
quality:Number(el.quality.value),
};
send({type:'run',request:activeRequest});
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
case'compared':
compared(message.id,message.result);
break;
case'cancelled':
if(message.kind==='compare')finishComparison();
else if(pending.has(message.id))batchFailed(message.id);
else finishRun();
break;
case'error':
showError(resolve(message.message));
if(message.kind==='compare'){
el.viewSource.value='result';
finishComparison();
renderViewer();
}else if(pending.has(message.id))batchFailed(message.id);
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
completed={...result,request:activeRequest,slots:activeSlots};
finishRun();
if(resultUrl)URL.revokeObjectURL(resultUrl);
resultUrl=URL.createObjectURL(result.blob);
el.viewSize.value='fit';
renderViewOptions();
el.viewSource.value='compare';
el.divider.value='50';
el.comparisonStage.style.setProperty('--preview-ratio',String(result.width/result.height));
el.comparisonStage.style.setProperty('--preview-width',`${result.width}px`);
el.resultImage.width=result.width;
el.resultImage.height=result.height;
renderViewer();
el.download.href=resultUrl;
el.download.download=`stacked.${result.blob.type === 'image/jpeg' ? 'jpg' : 'png'}`;
el.resultInfo.textContent=phrase('result.info',{
width:result.width,
height:result.height,
size:bytes(result.blob.size),
count:result.frames.length,
seconds:((performance.now()-startedAt)/1000).toFixed(1),
});
const context=runContext(completed.request);
const settings=phrase('result.settings',{
method:phrase(context.method),
alignment:phrase(context.alignment),
resolution:phrase(context.resolution),
gain:context.gain,
encoding:phrase(context.encoding.key,context.encoding.values),
});
el.resultSettings.textContent=context.parameter
?phrase('result.settings.detail',{
settings,detail:phrase(context.parameter.key,context.parameter.values),
})
:settings;
el.resultMoves.textContent=movesNote(result.moves,completed.request.align)
+(result.cropped?` ${phrase('result.cropped')}`:'');
renderAlignment(result,completed.request.align);
el.resultStale.hidden=true;
el.result.hidden=false;
compare();
}
function movesNote(moves,alignment){
if(alignment==='none')return phrase('result.moves-none');
const measurable=moves.slice(1);
const weak=measurable.filter((move)=>move.measured===false).length;
const clamped=measurable.filter((move)=>move.clamped).length;
if(weak){
return phrase('result.moves-some',{count:weak,total:moves.length});
}
if(clamped)return phrase('result.moves-clamped',{count:clamped});
return phrase('result.moves');
}
function finishRun(){
activeRequest=null;
activeSlots=[];
busy=false;
el.cancel.hidden=true;
el.progress.hidden=true;
render();
}
function discardResult(notice=true){
finishImagePan();
const hadResult=Boolean(completed);
completed=null;
activeRequest=null;
activeSlots=[];
comparisonId+=1;
if(resultUrl)URL.revokeObjectURL(resultUrl);
if(referenceUrl)URL.revokeObjectURL(referenceUrl);
resultUrl=null;
referenceUrl=null;
el.result.hidden=true;
el.resultImage.removeAttribute('src');
el.referenceImage.removeAttribute('src');
el.download.removeAttribute('href');
el.alignmentList.replaceChildren();
if(!notice)el.resultStale.hidden=true;
else if(hadResult)el.resultStale.hidden=false;
}
function renderAlignment(result,alignment){
el.alignmentList.replaceChildren(...result.frames.map((frame,index)=>{
const move=result.moves[index];
const item=document.createElement('li');
const name=document.createElement('strong');
name.textContent=frame.name;
const detail=document.createElement('span');
const refinement=move.fallbackRefine||move.refine;
const status=index===0?'reference':alignment==='none'?'none'
:move.measured===false?'weak':move.clamped?'clamped'
:refinement==='partial'?'partial':move.homography?'perspective'
:alignment==='projective'?'perspective-fallback':'aligned';
detail.textContent=phrase(`alignment.${status}`);
if(index>0&&alignment!=='none'&&move.measured!==false&&!move.homography){
detail.textContent+=` — ${phrase('alignment.offset', {
        dx: move.dx.toFixed(2), dy: move.dy.toFixed(2),
        angle: move.angle.toFixed(3), scale: move.scale.toFixed(4),
      })}`
;
}
item.append(name,detail);
if(status==='weak'){
const slot=completed.slots[index];
const remove=document.createElement('button');
remove.type='button';
remove.className='ghost danger';
remove.textContent=phrase('alignment.remove');
remove.addEventListener('click',()=>{
const at=frames.indexOf(slot);
if(at>=0)removeAt(at);
});
item.append(remove);
}
return item;
}));
}
function renderViewOptions(){
const actual=el.viewSize.value==='actual';
if(actual){
if(el.viewSource.value==='compare')el.viewSource.value='result';
comparisonOption.remove();
}else if(comparisonOption.parentNode!==el.viewSource){
const source=el.viewSource.value;
el.viewSource.prepend(comparisonOption);
el.viewSource.value=source;
}
return actual;
}
function renderViewer(){
finishImagePan();
if(!completed)return;
const actual=renderViewOptions();
const source=el.viewSource.value;
const isReference=source==='reference'&&referenceUrl;
const split=!actual&&source==='compare'&&Boolean(referenceUrl);
const label=(value)=>el.viewSource.querySelector(`option[value="${value}"]`).textContent;
el.resultImage.src=isReference?referenceUrl:resultUrl;
el.resultImage.alt=label(isReference?'reference':'result');
if(referenceUrl)el.referenceImage.src=referenceUrl;
el.referenceImage.hidden=!split;
el.divider.hidden=!split;
el.comparisonHandle.hidden=!split;
el.comparisonStage.classList.toggle('is-comparing',split);
el.referenceLabel.textContent=label('reference');
el.resultLabel.textContent=label('result');
el.resultFrame.classList.toggle('actual-size',actual);
renderSplit();
el.viewerStatus.textContent=comparing?phrase('viewer.loading')
:split?phrase('viewer.compare')
:isReference?phrase('viewer.reference',{name:completed.request.files[0].name})
:actual?phrase('viewer.pan'):phrase('viewer.result');
if(actual&&isReference&&!comparing)el.viewerStatus.textContent+=` ${phrase('viewer.pan')}`;
}
function renderSplit(){
const percent=Number(el.divider.value);
el.comparisonStage.style.setProperty('--split',`${percent}%`);
el.divider.setAttribute('aria-valuetext',phrase('viewer.split',{
percent,remaining:100-percent,
}));
const split=el.comparisonStage.classList.contains('is-comparing');
el.referenceLabel.hidden=!split||percent===0;
el.resultLabel.hidden=!split||percent===100;
}
function moveDivider(event){
const image=el.comparisonStage.getBoundingClientRect();
if(!image.width)return;
el.divider.value=String(Math.round(Math.max(0,Math.min(100,
(event.clientX-image.left)/image.width*100,
))));
renderSplit();
}
function startImagePan(event){
if(!completed||el.viewSize.value!=='actual'||event.pointerType!=='mouse'
||!event.isPrimary||event.button!==0)return;
const bounds=el.resultFrame.getBoundingClientRect();
const left=bounds.left+el.resultFrame.clientLeft;
const top=bounds.top+el.resultFrame.clientTop;
if(event.clientX<left||event.clientX>=left+el.resultFrame.clientWidth
||event.clientY<top||event.clientY>=top+el.resultFrame.clientHeight)return;
event.preventDefault();
el.resultFrame.focus({preventScroll:true});
imagePan={
id:event.pointerId,x:event.clientX,y:event.clientY,
left:el.resultFrame.scrollLeft,top:el.resultFrame.scrollTop,
};
el.resultFrame.setPointerCapture(event.pointerId);
el.resultFrame.classList.add('is-panning');
}
function moveImagePan(event){
if(imagePan?.id!==event.pointerId)return;
if(!(event.buttons&1)){
finishImagePan();
return;
}
el.resultFrame.scrollLeft=imagePan.left+imagePan.x-event.clientX;
el.resultFrame.scrollTop=imagePan.top+imagePan.y-event.clientY;
}
function finishImagePan(){
if(!imagePan)return;
const{id}=imagePan;
imagePan=null;
el.resultFrame.classList.remove('is-panning');
if(el.resultFrame.hasPointerCapture(id))el.resultFrame.releasePointerCapture(id);
}
function compare(){
if(!completed||comparing)return;
if(!['compare','reference'].includes(el.viewSource.value)||referenceUrl){
renderViewer();
return;
}
comparing=true;
cancelled=false;
const id=++comparisonId;
render();
renderViewer();
send({type:'compare',id,request:{file:completed.request.files[0],...completed.comparison}});
}
function compared(id,result){
if(id!==comparisonId||!completed)return;
referenceUrl=URL.createObjectURL(result.blob);
finishComparison();
renderViewer();
}
function finishComparison(){
comparing=false;
render();
}
el.run.addEventListener('click',start);
el.cancel.addEventListener('click',stopWork);
el.clearAll.addEventListener('click',clearAll);
el.viewSource.addEventListener('change',compare);
el.viewSize.addEventListener('change',renderViewer);
el.divider.addEventListener('input',renderSplit);
el.resultFrame.addEventListener('pointerdown',startImagePan);
el.resultFrame.addEventListener('pointermove',moveImagePan);
for(const type of['pointerup','pointercancel','lostpointercapture']){
el.resultFrame.addEventListener(type,(event)=>{
if(imagePan?.id===event.pointerId)finishImagePan();
});
}
window.addEventListener('blur',finishImagePan);
el.resultFrame.addEventListener('dragstart',(event)=>{
if(el.viewSize.value==='actual')event.preventDefault();
});
el.resultFrame.addEventListener('keydown',(event)=>{
if(event.target!==el.resultFrame||!completed||el.viewSize.value!=='actual'
||event.altKey||event.ctrlKey||event.metaKey)return;
const direction={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
if(!direction)return;
event.preventDefault();
el.resultFrame.scrollLeft+=direction[0]*40;
el.resultFrame.scrollTop+=direction[1]*40;
});
for(const type of['touchstart','touchmove']){
el.divider.addEventListener(type,(event)=>event.preventDefault(),{passive:false});
}
el.divider.addEventListener('pointerdown',(event)=>{
if(!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;
event.preventDefault();
el.divider.focus({preventScroll:true});
el.divider.setPointerCapture(event.pointerId);
moveDivider(event);
});
el.divider.addEventListener('pointermove',(event)=>{
if(el.divider.hasPointerCapture(event.pointerId))moveDivider(event);
});
for(const type of['pointerup','pointercancel']){
el.divider.addEventListener(type,(event)=>{
if(el.divider.hasPointerCapture(event.pointerId))el.divider.releasePointerCapture(event.pointerId);
});
}
el.normalize.addEventListener('click',()=>{
if(busy||comparing||inspecting>0||ready().length<2)return;
el.gain.value=String(1/ready().length);
discardResult();
renderSettings();
});
el.list.addEventListener('dragover',(event)=>{
if(dragIndex!==null)event.preventDefault();
});
el.list.addEventListener('drop',(event)=>{
if(dragIndex===null)return;
event.preventDefault();
applyDrop();
});
el.sortName.addEventListener('click',()=>{
if(busy||comparing)return;
frames.sort((a,b)=>(a.info?.name??a.file.name)
.localeCompare(b.info?.name??b.file.name,undefined,{numeric:true}));
render();
});
for(const control of[el.mode,el.align,el.scale,el.format]){
control.addEventListener('change',()=>{
if(busy||comparing)return;
discardResult();
render();
});
}
for(const control of[el.kappa,el.radius,el.gain,el.quality]){
control.addEventListener('input',()=>{
if(busy||comparing)return;
discardResult();
if(control===el.radius)render();
else renderSettings();
});
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
showError(phrase('error.unsupported'));
}
if(typeof OffscreenCanvas!=='function'){
unsupported=true;
showUnsupported();
el.run.disabled=true;
}
render();
document.getElementById('boot-warning')?.remove();
