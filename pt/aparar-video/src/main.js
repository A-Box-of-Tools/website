/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase,ltr}from'./shared/phrases.js?v=2b7e781b2a';
import{sizeText,durationText}from'./shared/format.js?v=2b7e781b2a';
import{openInPlayer}from'./shared/media.js?v=2b7e781b2a';
import{messageBox}from'./shared/message-box.js?v=2b7e781b2a';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=2b7e781b2a';
import{textImport}from'./shared/text-import.js?v=2b7e781b2a';
import{demux,UnsupportedFile,UnsupportedTimeline}from'./shared/mp4-reader.js?v=2b7e781b2a';
import{joinByCopy,estimateJoinCopy,copyRefusal}from'./copy.js?v=2b7e781b2a';
import{decoderConfig,averageFps}from'./shared/webcodecs.js?v=2b7e781b2a';
import{joinExact,grabFrame,chooseJoinBitrate}from'./transcode.js?v=2b7e781b2a';
import{trimByRecording,estimateRecording}from'./record.js?v=2b7e781b2a';
import{joinability,outputFrame}from'./clips.js?v=2b7e781b2a';
import{fittedBox}from'./draw.js?v=2b7e781b2a';
import{Timeline,formatTime,parseTime}from'./timeline.js?v=2b7e781b2a';
import{
openSegment,readTimestamps,segmentRanges,totalCaptured,writeTimestamps,
}from'./segments.js?v=2b7e781b2a';
import{keyframeTimes,keyframeBefore,invertRanges,totalSeconds}from'./ranges.js?v=2b7e781b2a';
import{hasWebCodecs,hasMediaRecorder,canDecode}from'./shared/video-support.js?v=2b7e781b2a';
import{makeExample}from'./example.js?v=2b7e781b2a';
function why(fallback,absent){
return phrase(fallback?.key??absent,fallback?.values);
}
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
clipList:$('clip-list'),
joinNote:$('join-note'),
pathNote:$('path-note'),
sectionCard:$('section-card'),
editing:$('editing'),
stage:$('stage'),
preview:$('preview'),
still:$('still'),
stageNote:$('stage-note'),
timeline:$('timeline'),
tlNow:$('tl-now'),
tlTotal:$('tl-total'),
play:$('play'),
back5:$('back-5'),
forward5:$('forward-5'),
markIn:$('mark-in'),
markOut:$('mark-out'),
undo:$('undo'),
speedRow:document.querySelector('.speed-row'),
segmentCount:$('segment-count'),
totalKept:$('total-kept'),
segmentTable:$('segment-table'),
segmentRows:$('segment-rows'),
segmentsEmpty:$('segments-empty'),
addSegment:$('add-segment'),
resetSegments:$('reset-segments'),
importMarks:$('import-marks'),
marksInput:$('marks-input'),
marksFormat:$('marks-format'),
exportMarks:$('export-marks'),
exportCard:$('export-card'),
settings:$('export-settings'),
method:$('method'),
methodNote:$('method-note'),
copyNote:$('copy-note'),
frameField:$('frame-field'),
frame:$('frame'),
qualityField:$('quality-field'),
quality:$('quality'),
keepAudio:$('keep-audio'),
audioNote:$('audio-note'),
sumClips:$('sum-clips'),
sumLength:$('sum-length'),
sumStart:$('sum-start'),
sumSize:$('sum-size'),
sumPicture:$('sum-picture'),
sumSound:$('sum-sound'),
cutNote:$('cut-note'),
exportBtn:$('export'),
cancelBtn:$('cancel'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
error:$('error'),
result:$('result'),
resultVideo:$('result-video'),
resultInfo:$('result-info'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showError,clear:clearError}=messageBox(el.error);
const formatBytes=(n)=>sizeText(n,phrase,{kb:0,mb:1,gb:'size.gb'});
const formatDuration=(seconds)=>durationText(seconds,phrase);
const errorKeys=new Set([...document.querySelectorAll('#phrases [data-phrase]')]
.map((element)=>element.dataset.phrase));
function errorReason(error,values=error?.values){
return phrase(errorKeys.has(error?.message)?error.message:'error.generic',values);
}
let clips=[];
let selected=-1;
let selectedSegment=null;
let mode='keep';
let exporting=false;
let activeExport=null;
let planRevision=0;
let lastResultUrl=null;
let nextId=1;
let batch=0;
let loading=false;
let playAt=0;
let watchUntil=null;
const timeline=new Timeline(el.timeline,{
bandTitle:(n,from,to)=>phrase('tl.band',{n,from,to}),
onSeek:seekTo,
onSelect:(id)=>{selectedSegment=id;renderSegments();},
onAdjust:adjustSegment,
});
const clip=()=>(selected>=0?clips[selected]:null);
const canEdit=()=>!exporting&&!loading;
const marksReader=textImport({
busy:()=>el.importMarks.setAttribute('aria-busy','true'),
done:()=>el.importMarks.removeAttribute('aria-busy'),
});
function clearResult(){
el.resultVideo.pause();
el.resultVideo.removeAttribute('src');
el.resultVideo.load();
if(lastResultUrl)URL.revokeObjectURL(lastResultUrl);
lastResultUrl=null;
el.download.removeAttribute('href');
el.download.removeAttribute('download');
el.resultInfo.textContent='';
el.result.hidden=true;
}
function changedPlan(){
planRevision++;
marksReader.invalidate();
clearResult();
}
function lockPlan(){
el.sectionCard.inert=exporting||loading||!clips.length;
el.settings.inert=exporting||loading||!clips.length;
timeline.setEnabled(canEdit()&&Boolean(clips.length));
if(!canEdit()){
for(const control of el.clipList.querySelectorAll('button'))control.disabled=true;
}
}
el.fileInput.dataset.languageReplace='1';
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){addFiles(files);},
example:makeExample,
});
async function addFiles(files){
if(!files.length)return;
const generation=++batch;
loading=true;
discardSelection();
clearError();
picker.busy(readingLabel(files.length));
try{
for(const file of files){
const added=await addClip(file,generation);
if(generation!==batch)return;
if(added&&selected<0)selectClip(clips.length-1);
}
}finally{
if(generation===batch){
loading=false;
picker.done();
lockPlan();
renderSegments();
}
}
if(generation!==batch||!clips.length)return;
describeSelection();
renderClips();
updateMethodOptions();
}
function discardSelection(){
activeExport?.controller.abort();
activeExport=null;
exporting=false;
changedPlan();
el.preview.pause();
el.preview.removeAttribute('src');
el.preview.load();
updateTransport();
for(const entry of clips)URL.revokeObjectURL(entry.objectUrl);
clips=[];
selected=-1;
selectedSegment=null;
playAt=0;
watchUntil=null;
clearTimeout(stillTimer);
stillWanted=null;
el.progress.hidden=true;
el.cancelBtn.hidden=true;
el.preview.hidden=true;
el.still.hidden=true;
for(const note of[el.editing,el.stageNote,el.pathNote,el.joinNote]){
note.hidden=true;
note.textContent='';
}
lockPlan();
el.exportCard.inert=false;
setTransportEnabled(false);
timeline.setSource({duration:0});
timeline.setPlayhead(0);
timeline.setEnabled(false);
el.tlNow.textContent=formatTime(0);
el.tlTotal.textContent=formatTime(0);
renderSegments();
}
function releaseProbe(probe){
probe.pause();
probe.removeAttribute('src');
probe.load();
}
async function addClip(file,generation){
const objectUrl=URL.createObjectURL(file);
const probe=document.createElement('video');
probe.preload='metadata';
probe.muted=true;
probe.playsInline=true;
let retained=false;
let thumbnailStarted=false;
try{
const played=await openInPlayer(probe,objectUrl);
if(generation!==batch)return false;
let media=null;
let fallbackReason=null;
try{
media=await demux(file);
}catch(error){
if(error instanceof UnsupportedTimeline)throw error;
fallbackReason=error instanceof UnsupportedFile
?{key:error.reason,values:error.values}
:{key:error.message||'read.unreadable'};
}
if(generation!==batch)return false;
const canExact=Boolean(media)&&hasWebCodecs()
&&await canDecode(decoderConfig(media.video));
if(generation!==batch)return false;
const canRecord=played.ok&&hasMediaRecorder();
if(!media&&!canRecord){
showError(played.ok
?phrase('open.norecord',{name:file.name})
:phrase('open.failed',{name:file.name,reason:why(fallbackReason,'read.notplayed')}));
return false;
}
const source=media
?{width:media.video.displayWidth,height:media.video.displayHeight}
:{width:played.width,height:played.height};
const entry={
id:nextId++,
file,
name:file.name,
objectUrl,
media,
fallbackReason,
playable:played.ok,
source,
duration:media?Math.max(media.duration,played.duration):played.duration,
fps:media?averageFps(media.video):30,
canExact,
canRecord,
thumbnail:null,
segments:[],
nextSegmentId:1,
};
clips.push(entry);
retained=true;
thumbnailStarted=true;
makeThumbnail(entry,probe,generation).then((url)=>{
if(!url||generation!==batch||!clips.includes(entry))return;
entry.thumbnail=url;
renderClips();
}).finally(()=>releaseProbe(probe));
return true;
}catch(error){
if(generation!==batch)return false;
console.error(error);
showError(phrase('open.failed',{
name:file.name,
reason:error?.message?phrase(error.message):String(error),
}));
return false;
}finally{
if(!retained)URL.revokeObjectURL(objectUrl);
if(!thumbnailStarted)releaseProbe(probe);
}
}
async function makeThumbnail(entry,probe,generation){
const at=Math.min(1,entry.duration/2)||0;
if(entry.media&&entry.canExact){
try{
const canvas=await grabFrame({
file:entry.file,media:entry.media,atSeconds:at,maxWidth:240,
});
if(generation!==batch)return null;
return canvas.toDataURL('image/jpeg',0.7);
}catch{
}
}
if(generation!==batch||!entry.playable)return null;
try{
await new Promise((resolve)=>{
const done=()=>{clearTimeout(timer);resolve();};
const timer=setTimeout(done,4000);
probe.addEventListener('seeked',done,{once:true});
probe.currentTime=at;
});
if(generation!==batch)return null;
const scale=Math.min(1,240/Math.max(1,probe.videoWidth));
const canvas=document.createElement('canvas');
canvas.width=Math.max(2,Math.round(probe.videoWidth*scale));
canvas.height=Math.max(2,Math.round(probe.videoHeight*scale));
canvas.getContext('2d').drawImage(probe,0,0,canvas.width,canvas.height);
return canvas.toDataURL('image/jpeg',0.7);
}catch{
return null;
}
}
function renderClips(){
el.clipList.hidden=clips.length<2;
el.clipList.innerHTML='';
if(clips.length<2)return;
clips.forEach((entry,index)=>{
const row=document.createElement('li');
row.className=`clip${index === selected ? ' selected' : ''}`;
const shot=document.createElement('div');
shot.className='clip-shot';
if(entry.thumbnail){
const image=document.createElement('img');
image.src=entry.thumbnail;
image.alt='';
shot.append(image);
}else{
shot.textContent=String(index+1);
shot.classList.add('clip-shot-empty');
}
const body=document.createElement('div');
body.className='clip-body';
const title=document.createElement('button');
title.type='button';
title.disabled=exporting||loading;
title.className='clip-name';
title.textContent=entry.name;
title.title=phrase('clip.mark');
title.addEventListener('click',()=>selectClip(index));
const marked=segmentRanges(entry.segments).length;
const facts=document.createElement('p');
facts.className='clip-facts';
facts.textContent=[
ltr(`${entry.source.width} x ${entry.source.height}`),
formatDuration(entry.duration),
marked
?phrase(marked===1?'clip.segments.one':'clip.segments.many',{n:marked})
:phrase('clip.notmarked'),
phrase(entry.media
?(entry.media.audio?'clip.sound':'clip.nosound')
:'clip.recorded'),
].join(' · ');
body.append(title,facts);
const actions=document.createElement('div');
actions.className='clip-actions';
actions.append(
iconButton('↑',phrase('seg.up'),()=>moveClip(index,-1),index===0),
iconButton('↓',phrase('seg.down'),()=>moveClip(index,1),index===clips.length-1),
iconButton('✕',phrase('seg.remove'),()=>removeClip(index),false,'danger'),
);
row.append(shot,body,actions);
el.clipList.append(row);
});
}
function iconButton(label,title,onClick,disabled=false,extra=''){
const element=document.createElement('button');
element.type='button';
element.className=`clip-button ghost${extra ? ` ${extra}` : ''}`;
element.textContent=label;
element.title=title;
element.setAttribute('aria-label',title);
element.disabled=disabled||exporting;
element.addEventListener('click',onClick);
return element;
}
function moveClip(index,by){
if(!canEdit())return;
const to=index+by;
if(to<0||to>=clips.length)return;
changedPlan();
const[moved]=clips.splice(index,1);
clips.splice(to,0,moved);
if(selected===index)selected=to;
else if(selected===to)selected=index;
describeSelection();
renderClips();
updateMethodOptions();
}
function removeClip(index){
if(!canEdit()||!clips[index])return;
changedPlan();
const[gone]=clips.splice(index,1);
URL.revokeObjectURL(gone.objectUrl);
if(!clips.length){
discardSelection();
renderClips();
updateMethodOptions();
return;
}
selectClip(Math.min(index,clips.length-1));
updateMethodOptions();
}
function describeSelection(){
const entry=clip();
el.editing.hidden=clips.length<2||!entry;
if(entry){
el.editing.textContent=phrase('clip.editing',
{name:entry.name,index:selected+1,total:clips.length});
}
}
function selectClip(index){
if(exporting||index<0||index>=clips.length)return;
if(selected!==index)marksReader.invalidate();
el.preview.pause();
watchUntil=null;
selected=index;
const entry=clips[index];
selectedSegment=entry.segments.length?entry.segments[entry.segments.length-1].id:null;
describeSelection();
if(entry.playable){
if(el.preview.src!==entry.objectUrl)el.preview.src=entry.objectUrl;
el.preview.hidden=false;
el.still.hidden=true;
el.stageNote.hidden=true;
setTransportEnabled(true);
}else{
el.preview.removeAttribute('src');
el.preview.hidden=true;
el.stageNote.hidden=false;
setTransportEnabled(false);
el.stageNote.textContent=phrase('stage.noplay');
drawStill(entry,0);
}
el.stage.style.aspectRatio=`${entry.source.width} / ${entry.source.height}`;
el.stage.style.maxWidth=`calc(52vh * ${entry.source.width / entry.source.height})`;
timeline.setSource({
duration:entry.duration,
keyframes:entry.media?keyframeTimes(entry.media.video):null,
frameTimes:entry.media?frameTimesOf(entry.media.video):null,
});
playAt=0;
timeline.setPlayhead(0);
el.tlTotal.textContent=formatTime(entry.duration);
el.tlNow.textContent=formatTime(0);
el.pathNote.hidden=Boolean(entry.media);
if(!entry.media){
el.pathNote.textContent=phrase('path.record',{
name:entry.name,
reason:why(entry.fallbackReason,'read.layout'),
});
}
updateTransport();
renderSegments();
renderClips();
}
function frameTimesOf(video){
const times=video.samples.map((sample)=>sample.pts/video.timescale);
times.sort((a,b)=>a-b);
return times;
}
function setTransportEnabled(enabled){
for(const control of[el.play,el.back5,el.forward5])control.disabled=!enabled;
for(const control of el.speedRow.querySelectorAll('.speed'))control.disabled=!enabled;
}
let stillBusy=false;
let stillWanted=null;
let stillTimer=null;
async function drawStill(entry,atSeconds){
if(!entry?.media||entry.playable||entry!==clip())return;
stillWanted={entry,atSeconds,generation:batch};
if(stillBusy)return;
stillBusy=true;
try{
while(stillWanted!==null){
const request=stillWanted;
stillWanted=null;
try{
const canvas=await grabFrame({
file:request.entry.file,media:request.entry.media,atSeconds:request.atSeconds,
});
if(request.generation!==batch||request.entry!==clip())continue;
el.still.width=canvas.width;
el.still.height=canvas.height;
el.still.getContext('2d').drawImage(canvas,0,0);
el.still.hidden=false;
}catch(error){
if(request.generation!==batch||request.entry!==clip())continue;
el.stageNote.textContent=phrase('stage.noframe',
{detail:phrase(error.message,error.values)});
}
}
}finally{
stillBusy=false;
}
}
function seekTo(seconds){
if(!canEdit())return;
const entry=clip();
if(!entry)return;
const at=Math.max(0,Math.min(seconds,entry.duration));
watchUntil=null;
playAt=at;
if(entry.playable)el.preview.currentTime=at;
else scheduleStill(entry,at);
timeline.setPlayhead(at);
el.tlNow.textContent=formatTime(at);
}
function scheduleStill(entry,at){
clearTimeout(stillTimer);
stillTimer=setTimeout(()=>drawStill(entry,at),180);
}
function currentTime(){
const entry=clip();
return entry?.playable?el.preview.currentTime:playAt;
}
el.preview.addEventListener('timeupdate',()=>{
const at=el.preview.currentTime;
playAt=at;
timeline.setPlayhead(at);
el.tlNow.textContent=formatTime(at);
if(watchUntil!==null&&at>=watchUntil){
el.preview.pause();
watchUntil=null;
}
});
function updateTransport(){
const playing=!el.preview.paused&&!el.preview.ended;
el.play.textContent=playing?'❚❚':'▶';
el.play.setAttribute('aria-label',phrase(playing?'transport.pause':'transport.play'));
}
for(const event of['play','pause','ended','emptied']){
el.preview.addEventListener(event,updateTransport);
}
function togglePlay(){
if(!canEdit()||!clip()?.playable)return;
watchUntil=null;
if(el.preview.paused)el.preview.play().catch(()=>{});
else el.preview.pause();
}
el.play.addEventListener('click',togglePlay);
el.back5.addEventListener('click',()=>seekTo(currentTime()-5));
el.forward5.addEventListener('click',()=>seekTo(currentTime()+5));
el.speedRow.addEventListener('click',(event)=>{
if(!canEdit())return;
const button=event.target.closest('.speed');
if(!button)return;
for(const other of el.speedRow.querySelectorAll('.speed')){
other.classList.toggle('active',other===button);
}
el.preview.playbackRate=Number(button.dataset.speed);
});
function markIn(){
if(!canEdit())return;
const entry=clip();
if(!entry)return;
const at=timeline.snap(currentTime());
const open=openSegment(entry.segments);
changedPlan();
if(open)open.start=at;
else entry.segments.push({id:entry.nextSegmentId++,start:at,end:null});
selectedSegment=entry.segments[entry.segments.length-1].id;
clearError();
renderSegments();
}
function markOut(){
if(!canEdit())return;
const entry=clip();
if(!entry)return;
const last=entry.segments[entry.segments.length-1];
if(!last){
showError(phrase('mark.noopen'));
return;
}
const at=timeline.snap(currentTime());
if(at<=last.start){
showError(phrase('mark.before',
{at:formatTime(at),start:formatTime(last.start)}));
return;
}
if(last.end!==at)changedPlan();
last.end=at;
selectedSegment=last.id;
clearError();
renderSegments();
}
function undoSegment(){
if(!canEdit())return;
const entry=clip();
if(!entry?.segments.length)return;
changedPlan();
entry.segments.pop();
selectedSegment=entry.segments.length
?entry.segments[entry.segments.length-1].id
:null;
renderSegments();
}
el.markIn.addEventListener('click',markIn);
el.markOut.addEventListener('click',markOut);
el.undo.addEventListener('click',undoSegment);
el.addSegment.addEventListener('click',()=>{
if(!canEdit())return;
const entry=clip();
if(!entry)return;
const start=timeline.snap(currentTime());
const end=Math.min(entry.duration,start+Math.min(5,entry.duration-start));
if(end-start<0.05){
showError(phrase('mark.nospace'));
return;
}
changedPlan();
entry.segments.push({id:entry.nextSegmentId++,start,end});
selectedSegment=entry.segments[entry.segments.length-1].id;
renderSegments();
});
el.resetSegments.addEventListener('click',()=>{
if(!canEdit())return;
const entry=clip();
if(!entry?.segments.length)return;
if(!window.confirm(phrase('mark.clearall',
{n:entry.segments.length,name:entry.name})))return;
changedPlan();
entry.segments=[];
selectedSegment=null;
renderSegments();
});
function adjustSegment(id,{start,end}){
if(!canEdit())return;
const entry=clip();
const segment=entry?.segments.find((one)=>one.id===id);
if(!segment)return;
if(segment.start!==start||segment.end!==end)changedPlan();
segment.start=start;
segment.end=end;
renderSegments();
}
function renderSegments(){
const entry=clip();
const segments=entry?.segments??[];
el.segmentTable.hidden=segments.length===0;
el.segmentsEmpty.hidden=segments.length>0;
el.segmentRows.innerHTML='';
segments.forEach((segment,index)=>{
const row=document.createElement('tr');
row.dataset.segmentId=String(segment.id);
row.className=`segment${segment.id === selectedSegment ? ' selected' : ''}`;
if(segment.end===null)row.classList.add('open');
row.addEventListener('click',(event)=>{
if(!event.target.closest('button'))selectSegment(segment.id);
});
row.addEventListener('focusin',()=>selectSegment(segment.id));
const number=document.createElement('td');
number.className='col-index';
number.textContent=String(index+1);
row.append(
number,
timeCell(segment,'start'),
timeCell(segment,'end'),
lengthCell(segment),
actionsCell(segment,index),
);
el.segmentRows.append(row);
});
updateSegmentSummary();
}
function selectSegment(id){
selectedSegment=id;
for(const row of el.segmentRows.children){
row.classList.toggle('selected',row.dataset.segmentId===String(id));
}
timeline.setSegments(clip()?.segments??[],selectedSegment);
}
function updateSegmentSummary(){
const entry=clip();
const segments=entry?.segments??[];
const finished=segmentRanges(segments);
el.segmentCount.textContent=segments.length===0
?phrase('segments.none')
:phrase('segments.some',{done:finished.length,total:segments.length});
el.totalKept.textContent=formatTime(
mode==='keep'&&finished.length
?totalCaptured(segments)
:totalSeconds(rangesOf(entry??{segments:[],duration:0})));
timeline.setSegments(segments,selectedSegment);
timeline.setPending(openSegment(segments)?.start??null);
renderClips();
updateMethodOptions();
}
function timeCell(segment,which){
const cell=document.createElement('td');
const input=document.createElement('input');
input.type='text';
input.className='segment-time';
input.inputMode='decimal';
input.spellcheck=false;
input.autocomplete='off';
input.setAttribute('aria-label',phrase(which==='start'?'time.start':'time.end'));
input.value=segment[which]===null?'':formatTime(segment[which]);
input.placeholder=which==='end'?phrase('time.open'):'';
const restore=()=>{
const start=input.selectionStart;
const end=input.selectionEnd;
const direction=input.selectionDirection;
const length=input.value.length;
input.value=segment[which]===null?'':formatTime(segment[which]);
if(document.activeElement===input){
input.setSelectionRange(start===length?input.value.length:start,
end===length?input.value.length:end,direction);
}
};
const commit=()=>{
const entry=clip();
if(!entry?.segments.includes(segment))return;
if(!canEdit()){restore();return;}
const seconds=parseTime(input.value);
if(seconds===null){
restore();
return;
}
const at=Math.max(0,Math.min(seconds,entry.duration));
if((which==='start'&&segment.end!==null&&at>=segment.end)
||(which==='end'&&at<=segment.start)){
restore();
return;
}
if(segment[which]!==at)changedPlan();
segment[which]=at;
restore();
const row=cell.parentElement;
row.classList.toggle('open',segment.end===null);
row.querySelector('.segment-length').textContent=segment.end===null
?'—':formatTime(segment.end-segment.start);
row.querySelector('.segment-buttons button').disabled=exporting||segment.end===null;
updateSegmentSummary();
};
input.addEventListener('input',()=>{
if(!canEdit()){restore();return;}
marksReader.invalidate();
});
input.addEventListener('change',commit);
input.addEventListener('blur',commit);
cell.append(input);
return cell;
}
function lengthCell(segment){
const cell=document.createElement('td');
cell.className='segment-length';
cell.textContent=segment.end===null?'—':formatTime(segment.end-segment.start);
return cell;
}
function actionsCell(segment,index){
const cell=document.createElement('td');
cell.className='segment-buttons';
const entry=clip();
cell.append(
iconButton('▶',phrase('seg.play'),()=>playSegment(segment),segment.end===null),
iconButton('↑',phrase('seg.up'),()=>moveSegment(index,-1),index===0),
iconButton('↓',phrase('seg.down'),()=>moveSegment(index,1),
index===entry.segments.length-1),
iconButton('✕',phrase('seg.remove'),()=>removeSegment(index),false,'danger'),
);
return cell;
}
function playSegment(segment){
const entry=clip();
if(!canEdit()||!entry?.playable||segment.end===null)return;
el.preview.currentTime=segment.start;
watchUntil=segment.end;
selectSegment(segment.id);
el.preview.play().catch(()=>{});
}
function moveSegment(index,by){
if(!canEdit())return;
const entry=clip();
const to=index+by;
if(!entry||to<0||to>=entry.segments.length)return;
const focused=document.activeElement;
const buttons=focused.closest('.segment-buttons');
const action=buttons?[...buttons.children].indexOf(focused):-1;
changedPlan();
const[moved]=entry.segments.splice(index,1);
entry.segments.splice(to,0,moved);
renderSegments();
if(action>=0){
const row=el.segmentRows.children[to];
const actions=row.querySelector('.segment-buttons').children;
const next=actions[action].disabled?actions[by<0?2:1]:actions[action];
next.focus();
}
}
function removeSegment(index){
if(!canEdit())return;
const entry=clip();
if(!entry)return;
const hadFocus=el.segmentRows.children[index]?.contains(document.activeElement);
if(!entry.segments[index])return;
changedPlan();
const[gone]=entry.segments.splice(index,1);
if(selectedSegment===gone.id){
selectedSegment=entry.segments.length
?entry.segments[Math.min(index,entry.segments.length-1)].id
:null;
}
renderSegments();
if(hadFocus){
const row=el.segmentRows.children[Math.min(index,entry.segments.length-1)];
(row?.querySelector('.segment-buttons .danger')??el.addSegment).focus();
}
}
el.exportMarks.addEventListener('click',()=>{
if(!canEdit())return;
const entry=clip();
if(!entry)return;
const ranges=segmentRanges(entry.segments);
if(!ranges.length){
showError(phrase('marks.nothing'));
return;
}
const text=writeTimestamps(entry.segments,{
format:el.marksFormat.value,
name:entry.name,
});
const blob=new Blob([text],{type:'text/plain'});
const url=URL.createObjectURL(blob);
const link=document.createElement('a');
link.href=url;
link.download=`${entry.name.replace(/\.[^.]+$/, '')}-marks.txt`;
link.click();
setTimeout(()=>URL.revokeObjectURL(url),1000);
});
el.importMarks.addEventListener('click',()=>{
if(canEdit())el.marksInput.click();
});
el.marksInput.addEventListener('change',()=>{
const[file]=el.marksInput.files??[];
el.marksInput.value='';
const entry=clip();
if(!file||!entry||!canEdit())return;
const generation=batch;
marksReader.read([file],{
apply:([text])=>{
if(generation!==batch||entry!==clip()||!canEdit())return;
const parsed=readTimestamps(text);
const kept=parsed.segments.filter((segment)=>segment.start<entry.duration);
if(!kept.length){
showError(phrase('marks.pastend',{name:file.name}));
return;
}
changedPlan();
entry.segments=kept.map((segment)=>({
id:entry.nextSegmentId++,
start:segment.start,
end:Math.min(segment.end,entry.duration),
}));
selectedSegment=entry.segments[entry.segments.length-1].id;
el.marksFormat.value=parsed.format;
const dropped=parsed.segments.length-kept.length;
clearError();
if(dropped||parsed.skipped){
const says=[];
if(dropped){
says.push(phrase(dropped===1?'marks.dropped.one':'marks.dropped.many',
{n:dropped,name:file.name}));
}
if(parsed.skipped){
says.push(phrase(
parsed.skipped===1?'marks.skipped.one':'marks.skipped.many',
{n:parsed.skipped}));
}
says.push(phrase('marks.loaded',{n:kept.length}));
showError(sentences(says));
}
renderSegments();
},
failed:(error)=>{
if(generation!==batch||entry!==clip()||!canEdit())return;
showError(phrase('marks.failed',
{name:file.name,reason:errorReason(error)}));
},
});
});
function typing(target){
return target instanceof HTMLInputElement
||target instanceof HTMLTextAreaElement
||target instanceof HTMLSelectElement
||target?.isContentEditable;
}
window.addEventListener('keydown',(event)=>{
if(el.sectionCard.hidden||exporting||loading)return;
if(typing(event.target)||event.metaKey||event.ctrlKey||event.altKey)return;
const key=event.key.toLowerCase();
if(key==='i'){
event.preventDefault();
markIn();
}else if(key==='o'){
event.preventDefault();
markOut();
}else if(key==='u'){
event.preventDefault();
undoSegment();
}else if(event.key===' '&&!(event.target instanceof HTMLButtonElement)){
event.preventDefault();
togglePlay();
}else if(event.key==='ArrowLeft'){
event.preventDefault();
seekTo(currentTime()-(event.shiftKey?timeline.frameStep:5));
}else if(event.key==='ArrowRight'){
event.preventDefault();
seekTo(currentTime()+(event.shiftKey?timeline.frameStep:5));
}
});
function rangesOf(entry){
const marked=segmentRanges(entry.segments);
if(mode==='cut')return invertRanges(marked,entry.duration);
return marked.length?marked:[{start:0,end:entry.duration}];
}
function exportClips(){
return clips
.map((entry)=>({
file:entry.file,
media:entry.media,
name:entry.name,
source:{...entry.source},
ranges:rangesOf(entry),
}))
.filter((entry)=>entry.ranges.length);
}
document.querySelectorAll('input[name="mode"]').forEach((radio)=>{
radio.addEventListener('change',()=>{
if(!canEdit()){
for(const choice of document.querySelectorAll('input[name=mode]')){
choice.checked=choice.value===mode;
}
return;
}
if(mode!==radio.value)changedPlan();
mode=radio.value;
renderSegments();
});
});
function exactMethodLabel(){
return el.method.querySelector('option[value="exact"]').textContent.trim();
}
function updateMethodOptions(){
const chosen=exportClips();
const keepAudio=el.keepAudio.checked;
const join=chosen.length
?joinability(chosen,{keepAudio,t:phrase})
:{copy:false,reason:null,sound:'none'};
const everyDemuxed=chosen.length>0&&chosen.every((entry)=>entry.media);
const copyReason=everyDemuxed?copyRefusal(chosen):null;
const canCopy=everyDemuxed&&join.copy&&!copyReason;
el.copyNote.hidden=!copyReason;
el.copyNote.textContent=copyReason?phrase(copyReason,{method:exactMethodLabel()}):'';
const canExact=clips.length>0&&clips.every((entry)=>entry.canExact)&&chosen.length>0;
const canRecord=clips.length===1&&clips[0].canRecord&&chosen.length===1
&&chosen[0].ranges.length===1;
el.method.querySelector('option[value="copy"]').disabled=!canCopy;
el.method.querySelector('option[value="exact"]').disabled=!canExact;
el.method.querySelector('option[value="record"]').disabled=!canRecord;
const available=[
canCopy?'copy':null,
canExact?'exact':null,
canRecord?'record':null,
].filter(Boolean);
if(!available.includes(el.method.value)&&!(el.method.value==='copy'&&copyReason)){
el.method.value=available[0]??'copy';
}
el.joinNote.hidden=clips.length<2||canCopy||!join.reason;
if(!el.joinNote.hidden){
el.joinNote.textContent=phrase('join.note',{reason:join.reason});
}
updateMethodNote();
}
function updateMethodNote(){
const method=el.method.value;
const chosen=exportClips();
const sections=chosen.reduce((total,entry)=>total+entry.ranges.length,0);
const many=chosen.length>1;
if(method==='copy'){
el.methodNote.textContent=phrase(sections>1?'method.copy.many':'method.copy.one');
}else if(method==='exact'){
el.methodNote.textContent=phrase(many?'method.exact.many':'method.exact.one');
}else{
el.methodNote.textContent=phrase('method.record');
}
el.qualityField.hidden=method==='copy';
el.frameField.hidden=!(method==='exact'&&many);
const anySound=chosen.some((entry)=>entry.media?.audio?.samples.length)
||clips.some((entry)=>!entry.media);
const sound=joinability(chosen,{keepAudio:el.keepAudio.checked,t:phrase}).sound;
if(!anySound){
el.audioNote.textContent=phrase('audio.none');
}else if(method==='record'){
el.audioNote.textContent=phrase('audio.record');
}else if(sound==='encode'&&method==='exact'){
el.audioNote.textContent=phrase('audio.encode');
}else{
el.audioNote.textContent=phrase('audio.copy');
}
el.keepAudio.disabled=!anySound;
updateSummary();
}
function restoreWritingChoices(){
if(!activeExport)return;
el.method.value=activeExport.method;
el.frame.value=activeExport.frameChoice;
el.quality.value=activeExport.quality;
el.keepAudio.checked=activeExport.audioChecked;
}
for(const[control,update]of[
[el.method,updateMethodNote],[el.frame,updateSummary],
[el.quality,updateSummary],[el.keepAudio,updateMethodOptions],
]){
control.addEventListener('change',()=>{
if(!canEdit()){restoreWritingChoices();return;}
changedPlan();
update();
});
}
function updateSummary(){
const chosen=exportClips();
if(!chosen.length){
el.exportBtn.disabled=true;
el.sumLength.textContent=formatDuration(0);
el.sumClips.textContent=phrase(
mode==='cut'?'sum.nothing.cut':'sum.nothing.keep');
for(const field of[el.sumStart,el.sumSize,el.sumPicture,el.sumSound]){
field.textContent='—';
}
el.cutNote.hidden=true;
el.cutNote.textContent='';
return;
}
const method=el.method.value;
const keepAudio=el.keepAudio.checked&&!el.keepAudio.disabled;
const kept=chosen.reduce((total,entry)=>total+totalSeconds(entry.ranges),0);
const sections=chosen.reduce((total,entry)=>total+entry.ranges.length,0);
const parts=phrase(sections===1?'sum.parts.one':'sum.parts.many',
{n:sections});
el.sumClips.textContent=chosen.length===1
?(mode==='cut'?phrase('sum.parts.cut',{parts}):parts)
:phrase('sum.parts.videos',{parts,n:chosen.length});
el.sumLength.textContent=formatDuration(kept);
const first=chosen[0];
if(method==='copy'&&first.media){
const behind=keyframeBefore(first.media.video,first.ranges[0].start);
const preRoll=Math.max(0,first.ranges[0].start-behind);
el.sumStart.textContent=phrase(preRoll<0.001
?'sum.start.keyframe'
:'sum.start.editmark');
el.cutNote.hidden=preRoll<0.001;
if(preRoll>=0.001){
el.cutNote.textContent=phrase('cut.note',{seconds:preRoll.toFixed(2)});
}
}else{
el.sumStart.textContent=phrase('sum.start.exact');
el.cutNote.hidden=true;
}
const frame=method==='exact'&&chosen.length>1
?outputFrame(chosen,el.frame.value)
:outputFrame(chosen.slice(0,1),'first');
let bytes=0;
if(method==='copy'){
bytes=estimateJoinCopy(chosen,keepAudio).bytes;
}else if(method==='exact'){
const fps=Math.max(...chosen.map((entry)=>averageFps(entry.media.video)));
const bitrate=chooseJoinBitrate({clips:chosen,frame,fps,quality:el.quality.value});
bytes=(bitrate/8)*kept+(keepAudio?20_000*kept:0);
}else{
bytes=estimateRecording({
size:first.source,fps:clips[0].fps,quality:el.quality.value,seconds:kept,
});
}
el.sumSize.textContent=bytes
?phrase('sum.size',{size:formatBytes(bytes)})
:'—';
if(method==='copy'){
el.sumPicture.textContent=phrase('sum.picture.copy');
}else if(method==='exact'){
const bars=chosen.filter((entry)=>!fittedBox({
displayWidth:entry.source.width,displayHeight:entry.source.height,frame,
}).fits).length;
el.sumPicture.textContent=phrase(
bars?'sum.picture.exact.bars':'sum.picture.exact',
{size:ltr(`${frame.width} x ${frame.height}`),n:bars});
}else{
el.sumPicture.textContent=phrase('sum.picture.record');
}
const sound=joinability(chosen,{keepAudio:true,t:phrase}).sound;
if(sound==='none')el.sumSound.textContent=phrase('sum.sound.none');
else if(!keepAudio)el.sumSound.textContent=phrase('sum.sound.left');
else if(method==='record')el.sumSound.textContent=phrase('sum.sound.record');
else if(sound==='encode'&&method==='exact'){
el.sumSound.textContent=phrase('sum.sound.encode');
}else el.sumSound.textContent=phrase('sum.sound.copy');
el.exportBtn.disabled=exporting||loading||Boolean(el.method.selectedOptions[0]?.disabled);
el.exportBtn.textContent=sections>1
?phrase('export.many',{n:sections})
:phrase('export.one');
}
const sentences=(said)=>said.reduce((a,b)=>phrase('join.sentences',{a,b}));
function setProgress({phase,done,total,realtime}){
const fraction=total>0?Math.min(1,done/total):0;
el.progressBar.style.width=`${(fraction * 100).toFixed(1)}%`;
const percent=Math.round(fraction*100);
if(phase==='preparing'){
el.progressLabel.textContent=phrase('progress.preparing');
}else if(phase==='finishing'){
el.progressLabel.textContent=phrase('progress.finishing');
}else if(phase==='sound'){
el.progressLabel.textContent=phrase('progress.sound',
{done:done+1,total});
}else if(phase==='copying'){
el.progressLabel.textContent=phrase('progress.copying',{
done:done.toLocaleString(),total:total.toLocaleString(),percent,
});
}else if(realtime){
el.progressLabel.textContent=phrase('progress.realtime',{
done:formatDuration(done),total:formatDuration(total),percent,
});
}else{
el.progressLabel.textContent=phrase('progress.frame',{
done:done.toLocaleString(),total:total.toLocaleString(),percent,
});
}
}
function outputFilename(name,extension){
const base=name.replace(/\.[^.]+$/,'');
return`${base}-cut.${extension}`;
}
async function runExport(){
if(exporting||loading||el.method.selectedOptions[0]?.disabled)return;
const chosen=exportClips();
if(!chosen.length){
showError(phrase(
mode==='cut'?'export.nothing.cut':'export.nothing.keep'));
return;
}
clearError();
marksReader.invalidate();
clearResult();
const method=el.method.value;
const quality=el.quality.value;
const keepAudio=el.keepAudio.checked&&!el.keepAudio.disabled;
const job={
generation:batch,revision:planRevision,controller:new AbortController(),
method,quality,keepAudio,frameChoice:el.frame.value,
audioChecked:el.keepAudio.checked,sourceName:clips[0].name,
frame:chosen.length>1
?outputFrame(chosen,el.frame.value)
:outputFrame(chosen.slice(0,1),'first'),
sound:joinability(chosen,{keepAudio,t:phrase}).sound,
recording:{src:clips[0].objectUrl,size:{...clips[0].source},fps:clips[0].fps},
};
activeExport=job;
exporting=true;
lockPlan();
const ownsPage=()=>activeExport===job&&job.generation===batch
&&job.revision===planRevision;
const canPublish=()=>ownsPage()&&!job.controller.signal.aborted;
el.exportBtn.disabled=true;
el.cancelBtn.hidden=false;
el.progress.hidden=false;
el.preview.pause();
setProgress({phase:'preparing',done:0,total:1});
const onProgress=(progress)=>{if(canPublish())setProgress(progress);};
const signal=job.controller.signal;
try{
let result;
if(method==='copy'){
result=await joinByCopy({clips:chosen,keepAudio,onProgress,signal});
}else if(method==='exact'){
result=await joinExact({
clips:chosen,
frame:job.frame,
quality,
audioMode:keepAudio?job.sound:'none',
onProgress,
signal,
});
}else{
result=await trimByRecording({
src:job.recording.src,
range:chosen[0].ranges[0],
size:job.recording.size,
quality,
keepAudio,
fps:job.recording.fps,
onProgress,
signal,
});
}
if(!canPublish())return;
if(result.warning?.length){
showError(sentences(result.warning.map((key)=>phrase(key))));
}
if(lastResultUrl)URL.revokeObjectURL(lastResultUrl);
lastResultUrl=URL.createObjectURL(result.blob);
const sections=chosen.reduce((total,entry)=>total+entry.ranges.length,0);
el.resultVideo.src=lastResultUrl;
el.download.href=lastResultUrl;
el.download.download=outputFilename(job.sourceName,result.extension);
el.resultInfo.textContent=[
result.extension.toUpperCase(),
sections>1?phrase('result.parts',{n:sections}):null,
formatDuration(chosen.reduce((total,entry)=>total+totalSeconds(entry.ranges),0)),
formatBytes(result.blob.size),
method==='copy'?phrase('result.notreencoded'):result.codec,
].filter(Boolean).join(' · ');
el.result.hidden=false;
el.progress.hidden=true;
el.result.scrollIntoView({behavior:'smooth',block:'nearest'});
}catch(error){
if(!ownsPage())return;
el.progress.hidden=true;
if(error?.name!=='AbortError'){
showError(errorReason(error,error?.message==='copy.internalpreroll'
?{...error.values,method:exactMethodLabel()}:error?.values));
console.error(error);
}
}finally{
if(activeExport===job){
exporting=false;
activeExport=null;
el.cancelBtn.hidden=true;
el.progress.hidden=true;
lockPlan();
renderSegments();
}
}
}
el.exportBtn.addEventListener('click',runExport);
el.cancelBtn.addEventListener('click',()=>activeExport?.controller.abort());
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
window.addEventListener('error',(event)=>{
showError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
document.getElementById('boot-warning')?.remove();
