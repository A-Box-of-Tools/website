/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js';
import{demux,UnsupportedFile}from'./demux.js';
import{joinByCopy,estimateJoinCopy}from'./copy.js';
import{
joinExact,grabFrame,decoderConfig,averageFps,chooseJoinBitrate,
}from'./transcode.js';
import{trimByRecording,estimateRecording}from'./record.js';
import{joinability,outputFrame}from'./clips.js';
import{fittedBox}from'./draw.js';
import{Timeline,formatTime,parseTime}from'./timeline.js';
import{
openSegment,readTimestamps,segmentRanges,totalCaptured,writeTimestamps,
}from'./segments.js';
import{keyframeTimes,keyframeBefore,invertRanges,totalSeconds}from'./ranges.js';
import{hasWebCodecs,hasMediaRecorder,canDecode}from'./support.js';
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
method:$('method'),
methodNote:$('method-note'),
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
progressWrap:$('progress-wrap'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
error:$('error'),
result:$('result'),
resultVideo:$('result-video'),
resultInfo:$('result-info'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
networkCount:$('network-count'),
networkDot:$('network-dot'),
offlineStatus:$('offline-status'),
offlineDot:$('offline-dot'),
};
let clips=[];
let selected=-1;
let selectedSegment=null;
let mode='keep';
let exporting=false;
let abortController=null;
let lastResultUrl=null;
let nextId=1;
let playAt=0;
let watchUntil=null;
const timeline=new Timeline(el.timeline,{
onSeek:seekTo,
onSelect:(id)=>{selectedSegment=id;renderSegments();},
onAdjust:adjustSegment,
});
const clip=()=>(selected>=0?clips[selected]:null);
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){addFiles(files);},
});
async function addFiles(files){
if(exporting||!files.length)return;
clearError();
picker.busy(readingLabel(files.length));
try{
for(const file of files){
const added=await addClip(file);
if(added&&selected<0)selectClip(clips.length-1);
}
}finally{
picker.done();
}
if(!clips.length)return;
describeSelection();
renderClips();
el.sectionCard.hidden=false;
el.exportCard.hidden=false;
updateMethodOptions();
}
function openInPlayer(video,url){
return new Promise((resolve)=>{
const done=(result)=>{
clearTimeout(timer);
video.removeEventListener('loadedmetadata',ok);
video.removeEventListener('error',bad);
resolve(result);
};
const ok=()=>done({
ok:video.videoWidth>0&&video.videoHeight>0,
width:video.videoWidth,
height:video.videoHeight,
duration:Number.isFinite(video.duration)?video.duration:0,
});
const bad=()=>done({ok:false,width:0,height:0,duration:0});
const timer=setTimeout(bad,15000);
video.addEventListener('loadedmetadata',ok,{once:true});
video.addEventListener('error',bad,{once:true});
video.src=url;
video.load();
});
}
async function addClip(file){
const objectUrl=URL.createObjectURL(file);
const probe=document.createElement('video');
probe.preload='metadata';
probe.muted=true;
probe.playsInline=true;
try{
const played=await openInPlayer(probe,objectUrl);
let media=null;
let fallbackReason=null;
try{
media=await demux(file);
}catch(error){
fallbackReason=error instanceof UnsupportedFile
?error.reason
:(error.message||'the file could not be read as an MP4.');
}
const canExact=Boolean(media)&&hasWebCodecs()
&&await canDecode(decoderConfig(media.video));
const canRecord=played.ok&&hasMediaRecorder();
if(!media&&!canRecord){
showError(played.ok
?`${file.name} cannot be recorded by this browser, so it cannot be cut.`
:`${file.name} could not be opened: ${fallbackReason ?? 'the format is not one this browser plays.'}`);
URL.revokeObjectURL(objectUrl);
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
makeThumbnail(entry,probe).then((url)=>{
if(!url)return;
entry.thumbnail=url;
renderClips();
});
return true;
}catch(error){
console.error(error);
showError(`${file.name} could not be opened: ${error?.message ?? error}`);
URL.revokeObjectURL(objectUrl);
return false;
}
}
async function makeThumbnail(entry,probe){
const at=Math.min(1,entry.duration/2)||0;
if(entry.media&&entry.canExact){
try{
const canvas=await grabFrame({
file:entry.file,media:entry.media,atSeconds:at,maxWidth:240,
});
return canvas.toDataURL('image/jpeg',0.7);
}catch{
}
}
if(!entry.playable)return null;
try{
await new Promise((resolve)=>{
const done=()=>{clearTimeout(timer);resolve();};
const timer=setTimeout(done,4000);
probe.addEventListener('seeked',done,{once:true});
probe.currentTime=at;
});
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
title.className='clip-name';
title.textContent=entry.name;
title.title='Mark this video';
title.addEventListener('click',()=>selectClip(index));
const marked=segmentRanges(entry.segments).length;
const facts=document.createElement('p');
facts.className='clip-facts';
facts.textContent=[
`${entry.source.width} x ${entry.source.height}`,
formatDuration(entry.duration),
marked?`${marked} segment${marked === 1 ? '' : 's'}`:'not marked',
entry.media?(entry.media.audio?'with sound':'no sound'):'recorded to cut',
].join(' · ');
body.append(title,facts);
const actions=document.createElement('div');
actions.className='clip-actions';
actions.append(
iconButton('↑','Move up',()=>moveClip(index,-1),index===0),
iconButton('↓','Move down',()=>moveClip(index,1),index===clips.length-1),
iconButton('✕','Remove',()=>removeClip(index),false,'danger'),
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
const to=index+by;
if(to<0||to>=clips.length)return;
const[moved]=clips.splice(index,1);
clips.splice(to,0,moved);
if(selected===index)selected=to;
else if(selected===to)selected=index;
describeSelection();
renderClips();
updateSummary();
}
function removeClip(index){
const[gone]=clips.splice(index,1);
URL.revokeObjectURL(gone.objectUrl);
if(!clips.length){
selected=-1;
el.sectionCard.hidden=true;
el.exportCard.hidden=true;
el.preview.removeAttribute('src');
el.preview.load();
renderClips();
return;
}
selectClip(Math.min(index,clips.length-1));
updateMethodOptions();
}
function describeSelection(){
const entry=clip();
el.editing.hidden=clips.length<2||!entry;
if(entry)el.editing.textContent=`${entry.name} — ${selected + 1} of ${clips.length}`;
}
function selectClip(index){
if(index<0||index>=clips.length)return;
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
el.stageNote.textContent='This browser will not play this video, so the frames below are '
+'decoded one at a time to show you where the marks are. The cut itself is unaffected.';
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
el.pathNote.textContent=`${entry.name} is cut by playing it and recording the result, `
+`because ${entry.fallbackReason ?? 'its layout is not one the reader here understands.'} `
+'That takes as long as the result is long, everything is re-encoded rather than copied, '
+'and it can only keep one segment.';
}
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
if(!entry?.media||entry.playable)return;
stillWanted=atSeconds;
if(stillBusy)return;
stillBusy=true;
try{
while(stillWanted!==null){
const at=stillWanted;
stillWanted=null;
const canvas=await grabFrame({file:entry.file,media:entry.media,atSeconds:at});
el.still.width=canvas.width;
el.still.height=canvas.height;
el.still.getContext('2d').drawImage(canvas,0,0);
el.still.hidden=false;
}
}catch(error){
el.stageNote.textContent='This browser will not play this video and no frame could be '
+`decoded from it either (${error.message}). The marks below still work on its length.`;
}finally{
stillBusy=false;
}
}
function seekTo(seconds){
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
el.preview.addEventListener('play',()=>{el.play.textContent='Pause';});
el.preview.addEventListener('pause',()=>{el.play.textContent='Play';});
function togglePlay(){
if(!clip()?.playable)return;
watchUntil=null;
if(el.preview.paused)el.preview.play().catch(()=>{});
else el.preview.pause();
}
el.play.addEventListener('click',togglePlay);
el.back5.addEventListener('click',()=>seekTo(currentTime()-5));
el.forward5.addEventListener('click',()=>seekTo(currentTime()+5));
el.speedRow.addEventListener('click',(event)=>{
const button=event.target.closest('.speed');
if(!button)return;
for(const other of el.speedRow.querySelectorAll('.speed')){
other.classList.toggle('active',other===button);
}
el.preview.playbackRate=Number(button.dataset.speed);
});
function markIn(){
const entry=clip();
if(!entry)return;
const at=timeline.snap(currentTime());
const open=openSegment(entry.segments);
if(open)open.start=at;
else entry.segments.push({id:entry.nextSegmentId++,start:at,end:null});
selectedSegment=entry.segments[entry.segments.length-1].id;
clearError();
renderSegments();
}
function markOut(){
const entry=clip();
if(!entry)return;
const last=entry.segments[entry.segments.length-1];
if(!last){
showError('Nothing is open yet. Press I where the part should start, then O where it ends.');
return;
}
const at=timeline.snap(currentTime());
if(at<=last.start){
showError(`That would end the segment at ${formatTime(at)}, which is before it starts `
+`at ${formatTime(last.start)}. Move the playhead past the start first.`);
return;
}
last.end=at;
selectedSegment=last.id;
clearError();
renderSegments();
}
function undoSegment(){
const entry=clip();
if(!entry?.segments.length)return;
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
const entry=clip();
if(!entry)return;
const start=timeline.snap(currentTime());
const end=Math.min(entry.duration,start+Math.min(5,entry.duration-start));
if(end-start<0.05){
showError('There is not enough video left here to add a segment. Move the playhead back.');
return;
}
entry.segments.push({id:entry.nextSegmentId++,start,end});
selectedSegment=entry.segments[entry.segments.length-1].id;
renderSegments();
});
el.resetSegments.addEventListener('click',()=>{
const entry=clip();
if(!entry?.segments.length)return;
if(!window.confirm(`Clear all ${entry.segments.length} segments of ${entry.name}?`))return;
entry.segments=[];
selectedSegment=null;
renderSegments();
});
function adjustSegment(id,{start,end}){
const entry=clip();
const segment=entry?.segments.find((one)=>one.id===id);
if(!segment)return;
segment.start=start;
segment.end=end;
renderSegments();
}
function renderSegments(){
const entry=clip();
const segments=entry?.segments??[];
const finished=segmentRanges(segments);
el.segmentTable.hidden=segments.length===0;
el.segmentsEmpty.hidden=segments.length>0;
el.segmentRows.innerHTML='';
el.segmentCount.textContent=segments.length===0
?'none yet — the whole video'
:`${finished.length} of ${segments.length}`;
el.totalKept.textContent=formatTime(
mode==='keep'&&finished.length
?totalCaptured(segments)
:totalSeconds(rangesOf(entry??{segments:[],duration:0})));
segments.forEach((segment,index)=>{
const row=document.createElement('tr');
row.className=`segment${segment.id === selectedSegment ? ' selected' : ''}`;
if(segment.end===null)row.classList.add('open');
row.addEventListener('click',()=>{
selectedSegment=segment.id;
renderSegments();
});
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
timeline.setSegments(segments,selectedSegment);
timeline.setPending(openSegment(segments)?.start??null);
renderClips();
updateSummary();
}
function timeCell(segment,which){
const cell=document.createElement('td');
const input=document.createElement('input');
input.type='text';
input.className='segment-time';
input.inputMode='decimal';
input.spellcheck=false;
input.autocomplete='off';
input.setAttribute('aria-label',which==='start'?'Start time':'End time');
input.value=segment[which]===null?'':formatTime(segment[which]);
input.placeholder=which==='end'?'press O':'';
const commit=()=>{
const entry=clip();
const seconds=parseTime(input.value);
if(seconds===null){
input.value=segment[which]===null?'':formatTime(segment[which]);
return;
}
const at=Math.max(0,Math.min(seconds,entry.duration));
if(which==='start'&&segment.end!==null&&at>=segment.end){
input.value=formatTime(segment.start);
return;
}
if(which==='end'&&at<=segment.start){
input.value=segment.end===null?'':formatTime(segment.end);
return;
}
segment[which]=at;
renderSegments();
};
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
iconButton('▶','Play this segment',()=>playSegment(segment),segment.end===null),
iconButton('↑','Move up',()=>moveSegment(index,-1),index===0),
iconButton('↓','Move down',()=>moveSegment(index,1),index===entry.segments.length-1),
iconButton('✕','Remove',()=>removeSegment(index),false,'danger'),
);
return cell;
}
function playSegment(segment){
const entry=clip();
if(!entry?.playable||segment.end===null)return;
el.preview.currentTime=segment.start;
watchUntil=segment.end;
selectedSegment=segment.id;
el.preview.play().catch(()=>{});
renderSegments();
}
function moveSegment(index,by){
const entry=clip();
const to=index+by;
if(!entry||to<0||to>=entry.segments.length)return;
const[moved]=entry.segments.splice(index,1);
entry.segments.splice(to,0,moved);
renderSegments();
}
function removeSegment(index){
const entry=clip();
if(!entry)return;
const[gone]=entry.segments.splice(index,1);
if(selectedSegment===gone.id){
selectedSegment=entry.segments.length
?entry.segments[Math.min(index,entry.segments.length-1)].id
:null;
}
renderSegments();
}
el.exportMarks.addEventListener('click',()=>{
const entry=clip();
if(!entry)return;
const ranges=segmentRanges(entry.segments);
if(!ranges.length){
showError('There is nothing marked to save yet.');
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
el.importMarks.addEventListener('click',()=>el.marksInput.click());
el.marksInput.addEventListener('change',async()=>{
const[file]=el.marksInput.files??[];
el.marksInput.value='';
const entry=clip();
if(!file||!entry)return;
try{
const parsed=readTimestamps(await file.text());
const kept=parsed.segments.filter((segment)=>segment.start<entry.duration);
if(!kept.length){
showError(`Every segment in ${file.name} starts after this video ends. `
+'It was probably marked against a different one.');
return;
}
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
says.push(`${dropped} segment${dropped === 1 ? '' : 's'} in ${file.name} `
+`${dropped === 1 ? 'starts' : 'start'} past the end of this video, so `
+`${dropped === 1 ? 'it was' : 'they were'} left out.`);
}
if(parsed.skipped){
says.push(`${parsed.skipped} line${parsed.skipped === 1 ? '' : 's'} could not be `
+'read as a segment.');
}
says.push(`${kept.length} loaded.`);
showError(says.join(' '));
}
renderSegments();
}catch(error){
showError(`${file.name} could not be read: ${error.message}`);
}
});
function typing(target){
return target instanceof HTMLInputElement
||target instanceof HTMLTextAreaElement
||target instanceof HTMLSelectElement
||target?.isContentEditable;
}
window.addEventListener('keydown',(event)=>{
if(el.sectionCard.hidden||exporting)return;
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
source:entry.source,
ranges:rangesOf(entry),
}))
.filter((entry)=>entry.ranges.length);
}
document.querySelectorAll('input[name="mode"]').forEach((radio)=>{
radio.addEventListener('change',()=>{
mode=radio.value;
renderSegments();
updateMethodOptions();
});
});
function updateMethodOptions(){
const chosen=exportClips();
const keepAudio=el.keepAudio.checked;
const join=chosen.length
?joinability(chosen,{keepAudio})
:{copy:false,reason:null,sound:'none'};
const everyDemuxed=chosen.length>0&&chosen.every((entry)=>entry.media);
const canCopy=everyDemuxed&&join.copy;
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
if(!available.includes(el.method.value))el.method.value=available[0]??'copy';
el.joinNote.hidden=clips.length<2||canCopy||!join.reason;
if(!el.joinNote.hidden){
el.joinNote.textContent=`These videos cannot be joined without re-encoding: ${join.reason} `
+'One track carries one description of what is in it, so videos that disagree have to be '
+'written out again to share one.';
}
updateMethodNote();
}
function updateMethodNote(){
const method=el.method.value;
const chosen=exportClips();
const sections=chosen.reduce((total,entry)=>total+entry.ranges.length,0);
const many=chosen.length>1;
if(method==='copy'){
el.methodNote.textContent=sections>1
?'Every marked part is moved into the new file exactly as it is, one after another. '
+'Nothing is decoded and nothing is encoded, so no part of this costs quality.'
:'The frames are moved into the new file exactly as they are, so nothing is decoded '
+'and nothing is encoded. Quick, and it cannot cost quality. Each part starts at the '
+'nearest keyframe before your mark.';
}else if(method==='exact'){
el.methodNote.textContent=many
?'Every video is decoded and written out again into one stream, so videos that disagree '
+'about size or codec can still be joined. The sound is copied where they agree about '
+'it and re-encoded where they do not.'
:'Every part starts on the frame you marked, by decoding from the keyframe in front of '
+'it and encoding the picture again. The sound is still copied rather than re-encoded.';
}else{
el.methodNote.textContent='Plays the marked part through and records it, so it takes as '
+'long as that part is long and everything is re-encoded. Keep this tab in front while '
+'it runs.';
}
el.qualityField.hidden=method==='copy';
el.frameField.hidden=!(method==='exact'&&many);
const anySound=chosen.some((entry)=>entry.media?.audio?.samples.length)
||clips.some((entry)=>!entry.media);
const sound=joinability(chosen,{keepAudio:el.keepAudio.checked}).sound;
if(!anySound){
el.audioNote.textContent='There is no audio track here, so there is nothing to keep.';
}else if(method==='record'){
el.audioNote.textContent='Captured from playback and re-encoded, because that is all '
+'a recording can do.';
}else if(sound==='encode'&&method==='exact'){
el.audioNote.textContent='These videos describe their sound differently, so it is decoded '
+'and encoded once for the whole result. That is the only case in this tool where the '
+'sound is not carried across untouched.';
}else{
el.audioNote.textContent='Copied from the file sample by sample, without ever being '
+'decoded, so it loses nothing.';
}
el.keepAudio.disabled=!anySound;
updateSummary();
}
el.method.addEventListener('change',updateMethodNote);
el.frame.addEventListener('change',updateSummary);
el.quality.addEventListener('change',updateSummary);
el.keepAudio.addEventListener('change',()=>updateMethodOptions());
function updateSummary(){
const chosen=exportClips();
if(!chosen.length){
el.exportBtn.disabled=true;
el.sumLength.textContent='0s';
el.sumClips.textContent=mode==='cut'
?'nothing — the marks cover the whole video'
:'nothing marked';
return;
}
const method=el.method.value;
const keepAudio=el.keepAudio.checked&&!el.keepAudio.disabled;
const kept=chosen.reduce((total,entry)=>total+totalSeconds(entry.ranges),0);
const sections=chosen.reduce((total,entry)=>total+entry.ranges.length,0);
const parts=`${sections} part${sections === 1 ? '' : 's'}`;
el.sumClips.textContent=chosen.length===1
?(mode==='cut'?`${parts}, once the marked ones are gone`:parts)
:`${parts} from ${chosen.length} videos`;
el.sumLength.textContent=formatDuration(kept);
const first=chosen[0];
if(method==='copy'&&first.media){
const behind=keyframeBefore(first.media.video,first.ranges[0].start);
const preRoll=Math.max(0,first.ranges[0].start-behind);
el.sumStart.textContent=preRoll<0.001
?'exactly where you marked (it is on a keyframe)'
:'exactly where you marked, through an edit mark';
el.cutNote.hidden=preRoll<0.001;
if(preRoll>=0.001){
el.cutNote.textContent='The nearest keyframe before your first mark is '
+`${preRoll.toFixed(2)}s earlier, and the frames in between have to stay in the `
+'file - nothing after them can be decoded without them. They are marked not to '
+'be played, which every mainstream player honours. A player that ignores edit '
+`marks will show those ${preRoll.toFixed(2)}s at the front. Choose "Cut exactly `
+'here" if that matters more than keeping the original bytes.';
}
}else{
el.sumStart.textContent='exactly where you marked';
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
el.sumSize.textContent=bytes?`about ${formatBytes(bytes)}`:'—';
if(method==='copy'){
el.sumPicture.textContent='copied, frame for frame';
}else if(method==='exact'){
const bars=chosen.filter((entry)=>!fittedBox({
displayWidth:entry.source.width,displayHeight:entry.source.height,frame,
}).fits).length;
el.sumPicture.textContent=`re-encoded to H.264, ${frame.width} x ${frame.height}`
+(bars?` (${bars} fitted with bars)`:'');
}else{
el.sumPicture.textContent='recorded as it plays';
}
const sound=joinability(chosen,{keepAudio:true}).sound;
if(sound==='none')el.sumSound.textContent='none in this video';
else if(!keepAudio)el.sumSound.textContent='left out';
else if(method==='record')el.sumSound.textContent='re-encoded from playback';
else if(sound==='encode'&&method==='exact')el.sumSound.textContent='decoded and re-encoded once';
else el.sumSound.textContent='copied, sample for sample';
el.exportBtn.disabled=exporting;
el.exportBtn.textContent=sections>1?`Cut and join ${sections} parts`:'Cut video';
}
function showError(message){
el.error.textContent=message;
el.error.hidden=false;
}
function clearError(){
el.error.hidden=true;
el.error.textContent='';
}
function setProgress({phase,done,total,realtime}){
const fraction=total>0?Math.min(1,done/total):0;
el.progressBar.style.width=`${(fraction * 100).toFixed(1)}%`;
if(phase==='preparing'){
el.progressLabel.textContent='Preparing...';
}else if(phase==='finishing'){
el.progressLabel.textContent='Writing the file...';
}else if(phase==='sound'){
el.progressLabel.textContent=`Encoding the sound - ${done + 1} of ${total}`;
}else if(phase==='copying'){
el.progressLabel.textContent=`Copying sample ${done.toLocaleString()} `
+`of ${total.toLocaleString()} (${Math.round(fraction * 100)}%)`;
}else if(realtime){
el.progressLabel.textContent='Recording in real time - '
+`${formatDuration(done)} of ${formatDuration(total)} (${Math.round(fraction * 100)}%)`;
}else{
el.progressLabel.textContent=`Frame ${done.toLocaleString()} `
+`of ${total.toLocaleString()} (${Math.round(fraction * 100)}%)`;
}
}
function outputFilename(extension){
const base=(clips[0]?.name??'video').replace(/\.[^.]+$/,'');
return`${base}-cut.${extension}`;
}
function formatBytes(bytes){
if(bytes<1024*1024)return`${(bytes / 1024).toFixed(0)} KB`;
if(bytes<1024*1024*1024)return`${(bytes / 1024 / 1024).toFixed(1)} MB`;
return`${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
function formatDuration(seconds){
const whole=Math.max(0,Math.round(seconds));
const minutes=Math.floor(whole/60);
return minutes
?`${minutes}m ${String(whole % 60).padStart(2, '0')}s`
:`${seconds < 10 ? seconds.toFixed(1) : whole}s`;
}
async function runExport(){
if(exporting)return;
const chosen=exportClips();
if(!chosen.length){
showError(mode==='cut'
?'The marks cover the whole video, so cutting them out would leave nothing.'
:'There is nothing marked to keep. Press I and O while it plays.');
return;
}
clearError();
exporting=true;
abortController=new AbortController();
el.exportBtn.disabled=true;
el.cancelBtn.hidden=false;
el.progressWrap.hidden=false;
el.result.hidden=true;
timeline.setEnabled(false);
el.preview.pause();
setProgress({phase:'preparing',done:0,total:1});
const method=el.method.value;
const quality=el.quality.value;
const keepAudio=el.keepAudio.checked&&!el.keepAudio.disabled;
const onProgress=setProgress;
const signal=abortController.signal;
try{
let result;
if(method==='copy'){
result=await joinByCopy({clips:chosen,keepAudio,onProgress,signal});
}else if(method==='exact'){
const frame=chosen.length>1
?outputFrame(chosen,el.frame.value)
:outputFrame(chosen.slice(0,1),'first');
const sound=joinability(chosen,{keepAudio}).sound;
result=await joinExact({
clips:chosen,
frame,
quality,
audioMode:keepAudio?sound:'none',
onProgress,
signal,
});
}else{
result=await trimByRecording({
src:clips[0].objectUrl,
range:chosen[0].ranges[0],
size:clips[0].source,
quality,
keepAudio,
fps:clips[0].fps,
onProgress,
signal,
});
}
if(result.warning)showError(result.warning);
if(lastResultUrl)URL.revokeObjectURL(lastResultUrl);
lastResultUrl=URL.createObjectURL(result.blob);
const sections=chosen.reduce((total,entry)=>total+entry.ranges.length,0);
el.resultVideo.src=lastResultUrl;
el.download.href=lastResultUrl;
el.download.download=outputFilename(result.extension);
el.resultInfo.textContent=[
result.extension.toUpperCase(),
sections>1?`${sections} parts`:null,
formatDuration(chosen.reduce((total,entry)=>total+totalSeconds(entry.ranges),0)),
formatBytes(result.blob.size),
method==='copy'?'not re-encoded':result.codec,
].filter(Boolean).join(' · ');
el.result.hidden=false;
el.progressWrap.hidden=true;
el.result.scrollIntoView({behavior:'smooth',block:'nearest'});
}catch(error){
el.progressWrap.hidden=true;
if(error?.name!=='AbortError'){
showError(error?.message||'Something went wrong.');
console.error(error);
}
}finally{
exporting=false;
abortController=null;
el.cancelBtn.hidden=true;
el.exportBtn.disabled=false;
timeline.setEnabled(true);
renderSegments();
}
}
el.exportBtn.addEventListener('click',runExport);
el.cancelBtn.addEventListener('click',()=>abortController?.abort());
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
const PLATFORM_HOSTS=/(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;
function monitorNetwork(){
const platform=new Set();
const external=new Set();
const inspect=(entries)=>{
for(const entry of entries){
if(entry.name.startsWith('blob:')||entry.name.startsWith('data:'))continue;
const url=new URL(entry.name,location.href);
if(url.origin===location.origin)continue;
if(PLATFORM_HOSTS.test(url.hostname))platform.add(url.hostname);
else external.add(url.hostname);
}
const total=performance.getEntriesByType('resource')
.filter((entry)=>!entry.name.startsWith('blob:')&&!entry.name.startsWith('data:')).length;
const clean=external.size===0;
const platformNote=platform.size===0
?''
:` The page's own ad, measurement and donate-button scripts loaded from ${platform.size} `
+`host${platform.size === 1 ? '' : 's'}; not one of them was given a file.`;
el.networkCount.textContent=clean
?`your videos have gone nowhere. ${total} files loaded.${platformNote}`
:`something contacted ${[...external].join(', ')}, which this tool never does.${platformNote}`;
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
showError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
