/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js';
import{PIXEL_DATA,parseDataset,parseFile,walk}from'./dicom.js';
import{describe,formatTag}from'./dictionary.js';
import{charset,display,text}from'./values.js';
import{sopClass}from'./uids.js';
import{decodeFrame,frameFragment,imageInfo}from'./pixels.js';
import{CT_PRESETS,fileWindows,fullRange,measured,render}from'./window.js';
import{describeInstance,organise,sliceSpacing}from'./series.js';
import{identifiers}from'./identity.js';
import{report}from'./report.js';
import{count,fileSize,exact,millimetres,quantity,windowLabel}from'./format.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
loadError:$('load-error'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
networkCount:$('network-count'),
networkDot:$('network-dot'),
offlineStatus:$('offline-status'),
offlineDot:$('offline-dot'),
working:$('working'),
viewerCard:$('viewer-card'),
fileName:$('file-name'),
saveFrame:$('save-frame'),
copyHeader:$('copy-header'),
downloadHeader:$('download-header'),
copyStatus:$('copy-status'),
seriesRow:$('series-row'),
seriesPick:$('series-pick'),
seriesNote:$('series-note'),
viewport:$('viewport'),
canvas:$('canvas'),
overlayTL:$('overlay-tl'),
overlayTR:$('overlay-tr'),
overlayBL:$('overlay-bl'),
overlayBR:$('overlay-br'),
marks:$('marks'),
viewportFail:$('viewport-fail'),
scrubRow:$('scrub-row'),
play:$('play'),
scrub:$('scrub'),
scrubLabel:$('scrub-label'),
zoom:$('zoom'),
zoomLabel:$('zoom-label'),
resetView:$('reset-view'),
preset:$('preset'),
center:$('center'),
width:$('width'),
invert:$('invert'),
showDetails:$('show-details'),
modeHint:$('mode-hint'),
factsCard:$('facts-card'),
factSop:$('fact-sop'),
factModality:$('fact-modality'),
factSize:$('fact-size'),
factStored:$('fact-stored'),
factSyntax:$('fact-syntax'),
factSpacing:$('fact-spacing'),
factRange:$('fact-range'),
factFile:$('fact-file'),
notes:$('notes'),
identityCard:$('identity-card'),
identity:$('identity'),
identityExtra:$('identity-extra'),
tagsCard:$('tags-card'),
tagSearch:$('tag-search'),
tagsLede:$('tags-lede'),
tagRows:$('tag-rows'),
showMore:$('show-more'),
};
const NOTHING='—';
const FIRST_PAGE=250;
const CACHE_FRAMES=8;
let stack=null;
let open=null;
let shown=null;
const view={
mode:'window',
center:0,
width:1,
invert:false,
zoom:1,
fit:1,
panX:0,
panY:0,
};
const cache=new Map();
let windowedSeries=null;
let rows=[];
let visible=FIRST_PAGE;
let playing=0;
let token=0;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){openFiles(files);},
});
async function openFiles(files){
hideError();
stopPlaying();
picker.busy(readingLabel(files.length));
el.working.hidden=false;
const instances=[];
const refused=[];
try{
for(let at=0;at<files.length;at+=1){
el.working.textContent=files.length===1
?phrase('working.one',{name:files[at].name})
:phrase('working.many',{at:at+1,total:files.length});
await pause();
try{
instances.push(await scan(files[at]));
}catch(error){
refused.push(`${files[at].name}: ${phrase(error.message, error.values)}`);
}
}
}finally{
picker.done();
el.working.hidden=true;
}
if(instances.length===0){
showError(phrase('error.none',{why:refused[0]??''}));
return;
}
if(refused.length){
const listed=refused.slice(0,3).join('; ')+(refused.length>3?'; …':'');
showError(phrase(refused.length===1?'error.skipped.one':'error.skipped',{
count:count(refused.length),files:listed,
}));
}
cache.clear();
windowedSeries=null;
stack={series:organise(instances),index:0};
renderSeriesPicker();
await chooseSeries(0);
el.viewerCard.scrollIntoView({behavior:'smooth',block:'start'});
}
const HEAD_BYTES=262144;
async function scan(file){
if(file.size>HEAD_BYTES){
const head=new Uint8Array(await file.slice(0,HEAD_BYTES).arrayBuffer());
const quick=await tryParse(head,file.name,true);
if(quick?.dataset.byTag.has('00280010')){
return{file,name:file.name,...describeInstance(quick.dataset,quick.decoder,file.name)};
}
}
const parsed=await parse(new Uint8Array(await file.arrayBuffer()),file.name,file.size);
return{file,name:file.name,...describeInstance(parsed.dataset,parsed.decoder,file.name)};
}
async function tryParse(bytes,name,quiet){
try{
return await parse(bytes,name,bytes.length);
}catch(error){
if(quiet)return null;
throw error;
}
}
async function parse(bytes,name,size){
const head=parseFile(bytes);
let body=bytes;
let start=head.datasetStart;
const warnings=head.warnings.slice();
if(head.syntax.deflated){
body=await inflate(bytes.subarray(head.datasetStart));
start=0;
}
const dataset=parseDataset(body,{start,syntax:head.syntax});
warnings.push(...dataset.warnings);
const decoder=charset(text(dataset,'00080005',new TextDecoder('windows-1252')));
const image=dataset.byTag.has(PIXEL_DATA)?imageInfo(dataset,decoder):null;
return{
name,
size,
bytes:body,
meta:head.meta,
dataset,
decoder,
syntax:head.syntax,
image,
pixel:dataset.byTag.get(PIXEL_DATA)??null,
sopClass:sopClass(text(dataset,'00080016',decoder))
??sopClass(text(head.meta,'00020002',decoder)),
warnings,
origin:`${location.origin}${location.pathname}`,
};
}
async function inflate(bytes){
const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
return new Uint8Array(await new Response(stream).arrayBuffer());
}
const pause=()=>new Promise((resolve)=>{setTimeout(resolve,0);});
function renderSeriesPicker(){
el.seriesPick.replaceChildren();
for(let at=0;at<stack.series.length;at+=1){
const series=stack.series[at];
const option=document.createElement('option');
option.value=String(at);
option.textContent=seriesLabel(series);
el.seriesPick.append(option);
}
el.seriesRow.hidden=stack.series.length<2;
}
function seriesLabel(series){
const parts=[];
if(series.number!==null)parts.push(phrase('series.number',{number:series.number}));
if(series.modality)parts.push(series.modality);
if(series.description)parts.push(series.description);
if(parts.length===0)parts.push(series.instances[0].name);
const held=series.instances.length;
return`${parts.join(' · ')} (${
    phrase(held === 1 ? 'series.files.one' : 'series.files', { count: count(held) })})`
;
}
el.seriesPick.addEventListener('change',()=>chooseSeries(Number(el.seriesPick.value)));
async function chooseSeries(index){
stack.index=index;
const series=stack.series[index];
const positions=[];
for(let at=0;at<series.instances.length;at+=1){
const frames=series.instances[at].frames??1;
for(let frame=0;frame<frames;frame+=1)positions.push({instance:at,frame,frames});
}
stack.positions=positions;
el.scrub.max=String(positions.length-1);
el.scrub.value='0';
const spacing=sliceSpacing(series.instances);
const notes=[];
if(series.instances.length>1){
notes.push(phrase(series.orderedBy==='position'?'stack.position':'stack.number'));
if(spacing){
notes.push(phrase('stack.spacing',{gap:millimetres(spacing.spacing)}));
if(spacing.irregular)notes.push(phrase('stack.gap'));
}
}
el.seriesNote.textContent=notes.join(' ');
view.panX=0;
view.panY=0;
await showPosition(0,true);
}
async function showPosition(at,fresh){
const series=stack.series[stack.index];
let position=stack.positions[at];
const instance=series.instances[position.instance];
const mine=++token;
const file=await load(instance);
if(mine!==token)return;
const changedFile=!open||open.name!==file.name;
open=file;
el.viewerCard.hidden=false;
if(changedFile){
renderFacts(file);
renderIdentity(file);
renderTags(file);
el.fileName.textContent=file.name;
}
if(file.image&&file.image.frames!==position.frames){
at=refit(at,file.image.frames);
position=stack.positions[at];
}
await draw(file,position.frame,fresh);
updateScrubLabel(at);
}
function refit(at,frames){
const{instance}=stack.positions[at];
const total=Math.max(1,frames);
let from=at;
while(from>0&&stack.positions[from-1].instance===instance)from-=1;
let to=at;
while(to+1<stack.positions.length&&stack.positions[to+1].instance===instance)to+=1;
const replacement=[];
for(let frame=0;frame<total;frame+=1)replacement.push({instance,frame,frames:total});
const wanted=Math.min(stack.positions[at].frame,total-1);
stack.positions.splice(from,to-from+1,...replacement);
el.scrub.max=String(stack.positions.length-1);
return from+wanted;
}
async function load(instance){
const found=cache.get(instance.name);
if(found)return found;
const parsed=await parse(
new Uint8Array(await instance.file.arrayBuffer()),instance.name,instance.file.size,
);
cache.set(instance.name,parsed);
while(cache.size>2){
const oldest=cache.keys().next().value;
if(oldest===instance.name)break;
cache.delete(oldest);
}
return parsed;
}
const frames=new Map();
async function draw(file,index,fresh){
el.viewportFail.hidden=true;
el.canvas.hidden=false;
if(!file.image||!file.pixel){
return fail(phrase('pixels.absent'));
}
if(file.syntax.pixels==='no'){
return fail(phrase('pixels.none',{codec:file.syntax.name}));
}
let frame;
try{
frame=await frameOf(file,index);
}catch(error){
return fail(phrase('pixels.failed',{
reason:phrase(error.message,error.values),
}));
}
shown=frame;
const series=stack.series[stack.index];
if(fresh||windowedSeries!==series.key){
setWindowChoices(file,frame);
fitToViewport(frame,file.image);
windowedSeries=series.key;
}
paint();
return undefined;
}
function fail(message){
shown=null;
el.canvas.hidden=true;
el.viewportFail.hidden=false;
el.viewportFail.textContent=message;
el.marks.replaceChildren();
el.overlayBL.textContent='';
el.overlayBR.textContent='';
return undefined;
}
async function frameOf(file,index){
const key=`${file.name}#${index}`;
const found=frames.get(key);
if(found)return found;
const frame=file.syntax.pixels==='jpeg'
?await browserJpeg(file,index)
:decodeFrame(file.bytes,file.pixel,file.image,file.syntax,index);
frames.set(key,frame);
while(frames.size>CACHE_FRAMES)frames.delete(frames.keys().next().value);
return frame;
}
async function browserJpeg(file,index){
const data=frameFragment(file.bytes,file.pixel,file.image.frames,index);
const bitmap=await createImageBitmap(new Blob([data],{type:'image/jpeg'}));
const canvas=document.createElement('canvas');
canvas.width=bitmap.width;
canvas.height=bitmap.height;
const context=canvas.getContext('2d',{willReadFrequently:true});
context.drawImage(bitmap,0,0);
bitmap.close();
const rgba=context.getImageData(0,0,canvas.width,canvas.height).data;
const pixels=canvas.width*canvas.height;
const mono=file.image.samplesPerPixel===1;
const values=new Int32Array(pixels*(mono?1:3));
let min=255;
let max=0;
for(let at=0;at<pixels;at+=1){
if(mono){
const value=rgba[at*4];
values[at]=value;
if(value<min)min=value;
if(value>max)max=value;
}else{
values[at*3]=rgba[at*4];
values[at*3+1]=rgba[at*4+1];
values[at*3+2]=rgba[at*4+2];
}
}
return{
width:canvas.width,
height:canvas.height,
samples:mono?1:3,
values,
min:mono?min:0,
max:mono?max:255,
eightBit:true,
};
}
function setWindowChoices(file,frame){
const info=file.image;
const choices=fileWindows(info);
choices.push(fullRange(frame,info));
if(info.modality==='CT')choices.push(...CT_PRESETS);
el.preset.replaceChildren();
for(const choice of choices){
const option=document.createElement('option');
option.value=`${choice.center}/${choice.width}`;
option.textContent=`${windowName(choice)} — ${windowLabel(choice.center, choice.width)}`;
el.preset.append(option);
}
const custom=document.createElement('option');
custom.value='custom';
custom.textContent=phrase('window.custom');
el.preset.append(custom);
view.center=choices[0].center;
view.width=choices[0].width;
el.preset.value=`${view.center}/${view.width}`;
el.preset.disabled=frame.samples===3;
el.center.disabled=frame.samples===3;
el.width.disabled=frame.samples===3;
el.invert.disabled=frame.samples===3;
syncWindowFields();
}
function windowName(choice){
if(choice.name)return choice.name;
if(choice.id.startsWith('file-')){
const at=Number(choice.id.slice(5));
return at===0?phrase('window.file'):phrase('window.file.n',{n:at+1});
}
return phrase(`window.${choice.id}`);
}
function syncWindowFields(){
el.center.value=String(Math.round(view.center));
el.width.value=String(Math.round(view.width));
}
el.preset.addEventListener('change',()=>{
if(el.preset.value==='custom')return;
const[center,width]=el.preset.value.split('/').map(Number);
view.center=center;
view.width=width;
syncWindowFields();
paint();
});
for(const field of[el.center,el.width]){
field.addEventListener('input',()=>{
const center=Number(el.center.value);
const width=Number(el.width.value);
if(!Number.isFinite(center)||!Number.isFinite(width))return;
view.center=center;
view.width=Math.max(1,width);
el.preset.value='custom';
paint();
});
}
el.invert.addEventListener('change',()=>{
view.invert=el.invert.checked;
paint();
});
function fitToViewport(frame,info){
const box=el.viewport.getBoundingClientRect();
const aspect=pixelAspect(info);
const scale=Math.min(
(box.width-8)/frame.width,
(box.height-8)/(frame.height*aspect),
);
view.fit=Number.isFinite(scale)&&scale>0?scale:1;
view.zoom=view.fit;
view.panX=0;
view.panY=0;
el.zoom.value=String(Math.round(view.zoom*100));
}
function pixelAspect(info){
if(!info?.spacing)return 1;
const{row,column}=info.spacing;
if(!(row>0)||!(column>0))return 1;
return row/column;
}
function paint(){
if(!shown||!open?.image)return;
const image=render(shown,open.image,view);
el.canvas.width=image.width;
el.canvas.height=image.height;
el.canvas.getContext('2d').putImageData(
new ImageData(image.data,image.width,image.height),0,0,
);
place();
renderOverlays();
renderRange();
}
function place(){
if(!shown)return;
const aspect=pixelAspect(open.image);
const width=shown.width*view.zoom;
const height=shown.height*view.zoom*aspect;
const box=el.viewport.getBoundingClientRect();
el.canvas.style.width=`${width}px`;
el.canvas.style.height=`${height}px`;
el.canvas.style.left=`${(box.width - width) / 2 + view.panX}px`;
el.canvas.style.top=`${(box.height - height) / 2 + view.panY}px`;
el.canvas.style.imageRendering=view.zoom>1?'pixelated':'auto';
el.marks.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
el.marks.style.width=`${box.width}px`;
el.marks.style.height=`${box.height}px`;
el.zoomLabel.textContent=`${Math.round(view.zoom * 100)}%`;
el.zoom.value=String(Math.round(view.zoom*100));
}
function renderOverlays(){
const info=open.image;
const series=stack.series[stack.index];
el.overlayTR.textContent=[
series.modality,
series.description,
info?`${info.columns} × ${info.rows}`:'',
].filter(Boolean).join('\n');
el.overlayBL.textContent=shown&&shown.samples===1
?windowLabel(view.center,view.width)
:'';
el.overlayTL.hidden=!el.showDetails.checked;
if(el.showDetails.checked){
el.overlayTL.textContent=[
text(open.dataset,'00100010',open.decoder),
text(open.dataset,'00100020',open.decoder),
text(open.dataset,'00080020',open.decoder),
text(open.dataset,'00081030',open.decoder),
].filter(Boolean).join('\n');
}
}
el.showDetails.addEventListener('change',renderOverlays);
let drag=null;
el.viewport.addEventListener('pointerdown',(event)=>{
if(!shown)return;
el.viewport.setPointerCapture(event.pointerId);
drag={
x:event.clientX,
y:event.clientY,
center:view.center,
width:view.width,
panX:view.panX,
panY:view.panY,
from:toImage(event),
};
if(view.mode==='measure')el.marks.replaceChildren();
});
el.viewport.addEventListener('pointermove',(event)=>{
if(!shown)return;
if(!drag){
probe(event);
return;
}
const dx=event.clientX-drag.x;
const dy=event.clientY-drag.y;
if(view.mode==='window'){
const step=Math.max(1,(shown.max-shown.min)*open.image.slope)/200;
view.width=Math.max(1,drag.width+dx*step);
view.center=drag.center-dy*step;
el.preset.value='custom';
syncWindowFields();
paint();
}else if(view.mode==='pan'){
view.panX=drag.panX+dx;
view.panY=drag.panY+dy;
place();
}else{
measure(drag.from,toImage(event));
}
});
for(const type of['pointerup','pointercancel']){
el.viewport.addEventListener(type,()=>{drag=null;});
}
el.viewport.addEventListener('wheel',(event)=>{
if(!shown)return;
event.preventDefault();
const before=toImage(event);
const factor=event.deltaY<0?1.15:1/1.15;
view.zoom=Math.min(8,Math.max(0.05,view.zoom*factor));
place();
const after=toImage(event);
const aspect=pixelAspect(open.image);
view.panX+=(after.x-before.x)*view.zoom;
view.panY+=(after.y-before.y)*view.zoom*aspect;
place();
},{passive:false});
function toImage(event){
const box=el.canvas.getBoundingClientRect();
const aspect=pixelAspect(open?.image);
return{
x:(event.clientX-box.left)/view.zoom,
y:(event.clientY-box.top)/(view.zoom*aspect),
};
}
function probe(event){
if(!shown||shown.samples!==1){el.overlayBR.textContent='';return;}
const{x,y}=toImage(event);
const column=Math.floor(x);
const row=Math.floor(y);
if(column<0||row<0||column>=shown.width||row>=shown.height){
el.overlayBR.textContent='';
return;
}
const stored=shown.values[row*shown.width+column];
const{value,unit}=measured(stored,open.image);
el.overlayBR.textContent=phrase('probe.value',{
value:quantity(value,unit),column,row,
});
}
function measure(from,to){
const box=el.canvas.getBoundingClientRect();
const frame=el.viewport.getBoundingClientRect();
const aspect=pixelAspect(open.image);
const point=(image)=>({
x:box.left-frame.left+image.x*view.zoom,
y:box.top-frame.top+image.y*view.zoom*aspect,
});
const a=point(from);
const b=point(to);
const line=document.createElementNS('http://www.w3.org/2000/svg','line');
line.setAttribute('x1',a.x);
line.setAttribute('y1',a.y);
line.setAttribute('x2',b.x);
line.setAttribute('y2',b.y);
line.setAttribute('class','measure-line');
el.marks.replaceChildren(line);
const spacing=open.image.spacing;
if(spacing){
const dx=(to.x-from.x)*spacing.column;
const dy=(to.y-from.y)*spacing.row;
el.overlayBR.textContent=millimetres(Math.hypot(dx,dy));
}else{
const length=Math.hypot(to.x-from.x,to.y-from.y);
el.overlayBR.textContent=phrase('measure.pixels',{length:length.toFixed(1)});
}
}
for(const radio of document.querySelectorAll('input[name="mode"]')){
radio.addEventListener('change',()=>{
view.mode=radio.value;
el.viewport.dataset.mode=radio.value;
el.modeHint.textContent=phrase(`mode.${radio.value}`);
if(radio.value!=='measure')el.marks.replaceChildren();
});
}
el.zoom.addEventListener('input',()=>{
view.zoom=Number(el.zoom.value)/100;
place();
});
el.resetView.addEventListener('click',()=>{
if(!shown)return;
fitToViewport(shown,open.image);
place();
});
window.addEventListener('resize',()=>{if(shown)place();});
el.scrub.addEventListener('input',()=>{
stopPlaying();
showPosition(Number(el.scrub.value),false);
});
el.viewport.addEventListener('keydown',(event)=>{
if(!stack||stack.positions.length<2)return;
const step=event.key==='ArrowDown'||event.key==='PageDown'?1
:event.key==='ArrowUp'||event.key==='PageUp'?-1:0;
if(!step)return;
event.preventDefault();
const next=Math.min(stack.positions.length-1,Math.max(0,Number(el.scrub.value)+step));
el.scrub.value=String(next);
showPosition(next,false);
});
function updateScrubLabel(at){
const positions=stack.positions;
el.scrubRow.hidden=positions.length<2;
el.scrub.value=String(at);
const position=positions[at];
const series=stack.series[stack.index];
const instance=series.instances[position.instance];
const parts=[];
if(series.instances.length>1){
parts.push(phrase('at.position',{at:at+1,total:positions.length}));
}
if(position.frames>1){
parts.push(phrase('at.frame',{at:position.frame+1,total:position.frames}));
}else if(instance.instanceNumber!==null){
parts.push(phrase('at.instance',{number:instance.instanceNumber}));
}
if(instance.sliceLocation!==null)parts.push(millimetres(instance.sliceLocation));
if(parts.length===0){
parts.push(phrase('at.position',{at:at+1,total:positions.length}));
}
el.scrubLabel.textContent=parts.join(' · ');
}
el.play.addEventListener('click',()=>{
if(playing){stopPlaying();return;}
playing=window.setInterval(async()=>{
const next=(Number(el.scrub.value)+1)%stack.positions.length;
el.scrub.value=String(next);
await showPosition(next,false);
},100);
el.play.textContent='❚❚';
});
function stopPlaying(){
if(!playing)return;
window.clearInterval(playing);
playing=0;
el.play.textContent='▶';
}
function renderFacts(file){
const info=file.image;
el.factSop.textContent=file.sopClass??NOTHING;
el.factModality.textContent=text(file.dataset,'00080060',file.decoder)||NOTHING;
el.factSize.textContent=info
?`${info.columns} × ${info.rows}${info.frames > 1
      ? `, ${phrase('facts.frames', { count: count(info.frames) })}` : ''}`
:phrase('facts.nopixels');
el.factStored.textContent=info
?phrase(info.samplesPerPixel===1?'facts.stored.one':'facts.stored',{
bits:info.bitsStored,
sign:phrase(info.signed?'facts.signed':'facts.unsigned'),
samples:info.samplesPerPixel,
photometric:info.photometric,
})
:NOTHING;
el.factSyntax.textContent=file.syntax.name;
el.factSyntax.title=file.syntax.uid;
el.factSpacing.textContent=info?.spacing
?`${info.spacing.column} × ${info.spacing.row} mm`
:phrase('facts.nospacing');
el.factFile.textContent=fileSize(file.size);
el.factFile.title=exact(file.size);
el.factRange.textContent=NOTHING;
const notes=file.warnings.map((note)=>phrase(note.key,note.values));
if(file.syntax.pixels==='jpeg')notes.push(phrase('pixels.jpeg'));
el.notes.replaceChildren();
for(const note of notes){
const item=document.createElement('li');
item.textContent=note;
el.notes.append(item);
}
el.notes.hidden=notes.length===0;
el.factsCard.hidden=false;
}
function renderRange(){
if(!shown||!open?.image)return;
const low=measured(shown.min,open.image);
const high=measured(shown.max,open.image);
el.factRange.textContent=shown.samples===3
?phrase('facts.colour')
:phrase('facts.range',{
low:quantity(low.value,low.unit),high:quantity(high.value,high.unit),
});
}
function renderIdentity(file){
const show=(element)=>display(element,file.decoder);
const fromMeta=identifiers(walk(file.meta),show);
const fromBody=identifiers(walk(file.dataset),show);
const found=fromMeta.found.concat(fromBody.found);
el.identity.replaceChildren();
if(found.length===0){
const item=document.createElement('li');
item.className='identity-clean';
item.textContent=phrase('identity.clean');
el.identity.append(item);
}
for(const entry of found){
const item=document.createElement('li');
item.className=`identity-row ${entry.level}`;
const name=document.createElement('span');
name.className='identity-name';
name.textContent=entry.name??formatTag(entry.tag);
name.title=formatTag(entry.tag);
const value=document.createElement('span');
value.className='identity-value';
value.textContent=entry.value;
item.append(name,value);
el.identity.append(item);
}
const extra=[];
const uids=fromMeta.uidCount+fromBody.uidCount;
const priv=fromMeta.privateCount+fromBody.privateCount;
if(uids)extra.push(phrase('identity.uids',{count:uids}));
if(priv)extra.push(phrase('identity.private',{count:priv}));
el.identityExtra.textContent=extra.join(' ');
el.identityCard.hidden=false;
}
function renderTags(file){
rows=[];
for(const{element,depth}of walk(file.meta))rows.push({element,depth,meta:true});
for(const{element,depth}of walk(file.dataset))rows.push({element,depth,meta:false});
visible=FIRST_PAGE;
el.tagSearch.value='';
drawTags();
el.tagsCard.hidden=false;
}
function matching(){
const query=el.tagSearch.value.trim().toLowerCase();
if(!query)return rows;
const digits=query.replace(/[\s(),.-]/g,'');
const asTag=/^[0-9a-f]{3,8}$/.test(digits)?digits:null;
return rows.filter(({element})=>{
const known=describe(element.tag);
const{shown:value}=display(element,open.decoder);
return(asTag!==null&&element.tag.includes(asTag))
||(known.name??'').toLowerCase().includes(query)
||value.toLowerCase().includes(query);
});
}
function drawTags(){
const list=matching();
const page=list.slice(0,visible);
el.tagRows.replaceChildren();
for(const{element,depth,meta}of page)el.tagRows.append(tagRow(element,depth,meta));
el.tagsLede.textContent=lede(list,page,el.tagSearch.value.trim());
el.showMore.hidden=page.length>=list.length;
el.showMore.textContent=phrase('tags.more',{count:count(list.length-page.length)});
}
function lede(list,page,query){
if(list.length===0)return phrase('tags.none',{query});
if(page.length<list.length){
return phrase('tags.count',{
shown:count(page.length),
total:count(list.length),
hidden:count(list.length-page.length),
});
}
if(!query)return phrase('tags.all',{total:count(list.length)});
return phrase(list.length===1?'tags.found.one':'tags.found',{
total:count(list.length),query,
});
}
function tagRow(element,depth,meta){
const known=describe(element.tag);
const{shown:value,raw,sequence}=display(element,open.decoder);
const row=document.createElement('tr');
if(meta)row.className='meta-row';
if(sequence)row.classList.add('sequence-row');
const tag=document.createElement('td');
tag.className='tag-number';
tag.style.paddingInlineStart=`${0.4 + depth * 0.9}rem`;
tag.textContent=formatTag(element.tag);
const vr=document.createElement('td');
vr.className='tag-vr';
vr.textContent=element.vr==='na'?'':element.vr;
if(element.guessedVR&&element.vr!=='na'){
vr.classList.add('guessed');
vr.title=phrase('tags.guessed');
}
const name=document.createElement('td');
name.className='tag-name';
name.textContent=known.name
??phrase(known.private?'tags.private':'tags.unknown');
if(!known.name)name.classList.add('tag-unknown');
const cell=document.createElement('td');
cell.className='tag-value';
cell.textContent=value;
if(raw){
const original=document.createElement('span');
original.className='tag-raw';
original.textContent=raw;
cell.append(original);
}
row.append(tag,vr,name,cell);
return row;
}
el.tagSearch.addEventListener('input',()=>{visible=FIRST_PAGE;drawTags();});
el.showMore.addEventListener('click',()=>{visible+=FIRST_PAGE*4;drawTags();});
el.saveFrame.addEventListener('click',()=>{
if(!shown)return;
el.canvas.toBlob((blob)=>{
if(!blob)return;
const name=`${open.name.replace(/\.dcm$/i, '')}-frame.png`;
save(blob,name);
el.copyStatus.textContent=phrase('saved',{name});
},'image/png');
});
el.downloadHeader.addEventListener('click',()=>{
if(!open)return;
save(new Blob([report(open,open.decoder,phrase)],{type:'text/plain'}),
`${open.name.replace(/\.dcm$/i, '')}-header.txt`);
});
el.copyHeader.addEventListener('click',async()=>{
if(!open)return;
try{
await navigator.clipboard.writeText(report(open,open.decoder,phrase));
el.copyStatus.textContent=phrase('copied');
}catch{
el.copyStatus.textContent=phrase('copy.failed');
}
});
function save(blob,name){
const url=URL.createObjectURL(blob);
const link=document.createElement('a');
link.href=url;
link.download=name;
link.click();
setTimeout(()=>URL.revokeObjectURL(url),10_000);
}
function showError(message){
el.loadError.textContent=message;
el.loadError.hidden=false;
}
function hideError(){
el.loadError.hidden=true;
}
el.modeHint.textContent=phrase('mode.window');
el.viewport.dataset.mode='window';
el.viewport.tabIndex=0;
el.privacyToggle.addEventListener('click',()=>{
const opening=el.privacyPanel.hidden;
el.privacyPanel.hidden=!opening;
el.privacyToggle.setAttribute('aria-expanded',String(opening));
});
const PLATFORM_HOSTS=/(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;
function monitorNetwork(){
const platform=new Set();
const unexplained=new Set();
const inspect=(entries)=>{
for(const entry of entries){
if(entry.name.startsWith('blob:')||entry.name.startsWith('data:'))continue;
const url=new URL(entry.name,window.location.href);
if(url.origin===window.location.origin)continue;
if(PLATFORM_HOSTS.test(url.hostname))platform.add(url.hostname);
else unexplained.add(url.hostname);
}
const total=performance.getEntriesByType('resource')
.filter((entry)=>!entry.name.startsWith('blob:')&&!entry.name.startsWith('data:'))
.length;
const clean=unexplained.size===0;
const note_=platform.size
?phrase(platform.size===1?'net.platform.one':'net.platform.many',
{hosts:platform.size})
:'';
el.networkCount.textContent=clean
?phrase('net.clean',{total,platform:note_})
:phrase('net.dirty',{hosts:[...unexplained].join(', '),platform:note_});
el.networkCount.className=clean?'good':'warn';
el.networkDot.className=`live-dot ${clean ? 'good' : 'warn'}`;
};
inspect(performance.getEntriesByType('resource'));
try{
new PerformanceObserver((list)=>inspect(list.getEntries()))
.observe({type:'resource',buffered:true});
}catch{
}
}
async function registerServiceWorker(){
const failed=(message,detail)=>{
el.offlineStatus.textContent=message;
el.offlineDot.className='live-dot';
if(detail)el.offlineStatus.title=detail;
};
if(!('serviceWorker'in navigator)){
failed(phrase('offline.none'));
return;
}
if(!window.isSecureContext){
failed(phrase('offline.insecure'));
return;
}
try{
await navigator.serviceWorker.register('sw.js');
await navigator.serviceWorker.ready;
el.offlineStatus.textContent=phrase('offline.ready');
el.offlineStatus.className='good';
el.offlineDot.className='live-dot good';
}catch(error){
failed(phrase('offline.failed'),error.message);
}
}
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
