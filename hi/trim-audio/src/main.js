/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker}from'./shared/file-picker.js';
import{decodeAudio,UnreadableFile}from'./shared/audio-decode.js';
import{
formatDuration,openSegment,readTimestamps,segmentRanges,totalCaptured,
writeTimestamps,
}from'./segments.js';
import{Timeline,formatTime,parseTime}from'./timeline.js';
import{
invertRanges,isUntouched,planSections,sectionFrames,totalSeconds,trim,
}from'./trim.js';
import{writeWav,wavSize}from'./shared/wav.js';
import{drawWaveform,summarise}from'./waveform.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
source:$('source'),
srcName:$('src-name'),
srcSize:$('src-size'),
srcLength:$('src-length'),
srcFormat:$('src-format'),
srcRate:$('src-rate'),
pathNote:$('path-note'),
sectionCard:$('section-card'),
editing:$('editing'),
timeline:$('timeline'),
tlNow:$('tl-now'),
tlTotal:$('tl-total'),
preview:$('preview'),
play:$('play'),
back5:$('back-5'),
forward5:$('forward-5'),
markIn:$('mark-in'),
markOut:$('mark-out'),
undo:$('undo'),
speedRow:document.querySelector('.speed-row'),
segmentTable:$('segment-table'),
segmentRows:$('segment-rows'),
segmentsEmpty:$('segments-empty'),
segmentCount:$('segment-count'),
totalKept:$('total-kept'),
addSegment:$('add-segment'),
resetSegments:$('reset-segments'),
importMarks:$('import-marks'),
marksInput:$('marks-input'),
marksFormat:$('marks-format'),
exportMarks:$('export-marks'),
exportCard:$('export-card'),
depth:$('depth'),
fade:$('fade'),
fadeNote:$('fade-note'),
sumParts:$('sum-parts'),
sumLength:$('sum-length'),
sumStart:$('sum-start'),
sumJoins:$('sum-joins'),
sumSound:$('sum-sound'),
sumSize:$('sum-size'),
cutNote:$('cut-note'),
exportBtn:$('export'),
cancelBtn:$('cancel'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
error:$('error'),
result:$('result'),
outWave:$('out-wave'),
resultAudio:$('result-audio'),
resultInfo:$('result-info'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
let file=null;
let source=null;
let summary=null;
let segments=[];
let selectedSegment=null;
let nextId=1;
let mode='keep';
let exporting=false;
let abortController=null;
let previewUrl=null;
let resultUrl=null;
let lastOut=null;
let playAt=0;
let watchUntil=null;
const timeline=new Timeline(el.timeline,{
t:phrase,
onSeek:(at)=>seekTo(at),
onSelect:(id)=>{selectedSegment=id;renderSegments();},
onAdjust:(id,times)=>adjustSegment(id,times),
});
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
const[picked]=files;
if(picked)loadFile(picked);
},
});
async function loadFile(picked){
if(exporting)return;
clearError();
clearResult();
picker.busy(phrase('read.reading'));
try{
const decoded=await decodeAudio(picked);
file=picked;
source=decoded;
summary=summarise(decoded.channels);
segments=[];
selectedSegment=null;
nextId=1;
playAt=0;
watchUntil=null;
showSource();
timeline.setSource({duration:decoded.duration,summary});
timeline.setEnabled(true);
renderSegments();
}catch(error){
if(error instanceof UnreadableFile)showError(phrase(error.message));
else{
showError(phrase('read.failed',{why:phrase(error?.message??String(error))}));
console.error(error);
}
}finally{
picker.done();
}
}
function showSource(){
el.srcName.textContent=file.name;
el.srcSize.textContent=formatBytes(file.size);
el.srcLength.textContent=formatDuration(source.duration);
el.srcFormat.textContent=phrase('src.format',{
channels:channelWord(source.channels.length),
khz:(source.sampleRate/1000).toFixed(1),
});
el.srcRate.textContent=phrase(source.guessedRate?'src.rate.assumed':'src.rate.file',
{rate:source.sampleRate});
el.source.hidden=false;
el.editing.hidden=false;
el.editing.textContent=file.name;
el.tlTotal.textContent=formatTime(source.duration);
el.tlNow.textContent=formatTime(0);
el.pathNote.hidden=!source.guessedRate;
if(source.guessedRate){
el.pathNote.textContent=phrase('src.guessednote');
}
if(previewUrl)URL.revokeObjectURL(previewUrl);
previewUrl=URL.createObjectURL(file);
el.preview.src=previewUrl;
el.preview.playbackRate=activeSpeed();
}
function seekTo(seconds){
if(!source)return;
const at=Math.max(0,Math.min(seconds,source.duration));
watchUntil=null;
playAt=at;
el.preview.currentTime=at;
timeline.setPlayhead(at);
el.tlNow.textContent=formatTime(at);
}
function currentTime(){
return source?el.preview.currentTime:0;
}
let ticking=0;
function tick(){
if(!source||el.preview.paused){ticking=0;return;}
const at=el.preview.currentTime;
playAt=at;
timeline.setPlayhead(at);
el.tlNow.textContent=formatTime(at);
if(watchUntil!==null&&at>=watchUntil){
el.preview.pause();
watchUntil=null;
}
ticking=requestAnimationFrame(tick);
}
el.preview.addEventListener('play',()=>{
el.play.textContent='❚❚';
if(!ticking)ticking=requestAnimationFrame(tick);
});
el.preview.addEventListener('pause',()=>{
el.play.textContent='▶';
playAt=el.preview.currentTime;
timeline.setPlayhead(playAt);
el.tlNow.textContent=formatTime(playAt);
});
el.preview.addEventListener('seeked',()=>{
if(el.preview.paused){
playAt=el.preview.currentTime;
timeline.setPlayhead(playAt);
el.tlNow.textContent=formatTime(playAt);
}
});
function togglePlay(){
if(!source)return;
watchUntil=null;
if(el.preview.paused)el.preview.play().catch(()=>{});
else el.preview.pause();
}
el.play.addEventListener('click',togglePlay);
el.back5.addEventListener('click',()=>seekTo(currentTime()-5));
el.forward5.addEventListener('click',()=>seekTo(currentTime()+5));
const activeSpeed=()=>Number(el.speedRow.querySelector('.speed.active')?.dataset.speed??1);
el.speedRow.addEventListener('click',(event)=>{
const button=event.target.closest('.speed');
if(!button)return;
for(const other of el.speedRow.querySelectorAll('.speed')){
other.classList.toggle('active',other===button);
}
el.preview.playbackRate=Number(button.dataset.speed);
});
function markIn(){
if(!source)return;
const at=timeline.snap(currentTime());
const open=openSegment(segments);
if(open)open.start=at;
else segments.push({id:nextId++,start:at,end:null});
selectedSegment=segments[segments.length-1].id;
clearError();
renderSegments();
}
function markOut(){
if(!source)return;
const last=segments[segments.length-1];
if(!last){
showError(phrase('mark.noopen'));
return;
}
const at=timeline.snap(currentTime());
if(at<=last.start){
showError(phrase('mark.beforestart',
{at:formatTime(at),start:formatTime(last.start)}));
return;
}
last.end=at;
selectedSegment=last.id;
clearError();
renderSegments();
}
function undoSegment(){
if(!segments.length)return;
segments.pop();
selectedSegment=segments.length?segments[segments.length-1].id:null;
renderSegments();
}
el.markIn.addEventListener('click',markIn);
el.markOut.addEventListener('click',markOut);
el.undo.addEventListener('click',undoSegment);
el.addSegment.addEventListener('click',()=>{
if(!source)return;
const start=timeline.snap(currentTime());
const end=Math.min(source.duration,start+Math.min(5,source.duration-start));
if(end-start<0.05){
showError(phrase('mark.noroom'));
return;
}
segments.push({id:nextId++,start,end});
selectedSegment=segments[segments.length-1].id;
renderSegments();
});
el.resetSegments.addEventListener('click',()=>{
if(!segments.length)return;
if(!window.confirm(phrase(segments.length===1?'mark.clearone':'mark.clearall',
{n:segments.length,name:file.name})))return;
segments=[];
selectedSegment=null;
renderSegments();
});
function adjustSegment(id,{start,end}){
const segment=segments.find((one)=>one.id===id);
if(!segment)return;
segment.start=start;
segment.end=end;
renderSegments();
}
function renderSegments(){
const finished=segmentRanges(segments);
el.segmentTable.hidden=segments.length===0;
el.segmentsEmpty.hidden=segments.length>0;
el.segmentRows.innerHTML='';
el.segmentCount.textContent=segments.length===0
?phrase('parts.none')
:phrase('parts.count',{finished:finished.length,total:segments.length});
el.totalKept.textContent=formatTime(
mode==='keep'&&finished.length?totalCaptured(segments):totalSeconds(ranges()));
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
const seconds=parseTime(input.value);
if(seconds===null){
input.value=segment[which]===null?'':formatTime(segment[which]);
return;
}
const at=Math.max(0,Math.min(seconds,source.duration));
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
cell.append(
iconButton('▶',phrase('btn.play'),()=>playSegment(segment),segment.end===null),
iconButton('↑',phrase('btn.up'),()=>moveSegment(index,-1),index===0),
iconButton('↓',phrase('btn.down'),()=>moveSegment(index,1),
index===segments.length-1),
iconButton('✕',phrase('btn.remove'),()=>removeSegment(index),false,'danger'),
);
return cell;
}
function iconButton(label,title,onClick,disabled=false,extra=''){
const button=document.createElement('button');
button.type='button';
button.className=`ghost segment-button ${extra}`.trim();
button.textContent=label;
button.title=title;
button.setAttribute('aria-label',title);
button.disabled=disabled;
button.addEventListener('click',(event)=>{
event.stopPropagation();
onClick();
});
return button;
}
function playSegment(segment){
if(!source||segment.end===null)return;
el.preview.currentTime=segment.start;
watchUntil=segment.end;
selectedSegment=segment.id;
el.preview.play().catch(()=>{});
renderSegments();
}
function moveSegment(index,by){
const to=index+by;
if(to<0||to>=segments.length)return;
const[moved]=segments.splice(index,1);
segments.splice(to,0,moved);
renderSegments();
}
function removeSegment(index){
const[gone]=segments.splice(index,1);
if(selectedSegment===gone.id){
selectedSegment=segments.length
?segments[Math.min(index,segments.length-1)].id
:null;
}
renderSegments();
}
el.exportMarks.addEventListener('click',()=>{
if(!source)return;
if(!segmentRanges(segments).length){
showError(phrase('marks.nothing'));
return;
}
const text=writeTimestamps(segments,{
format:el.marksFormat.value,
name:file.name,
});
const blob=new Blob([text],{type:'text/plain'});
const url=URL.createObjectURL(blob);
const link=document.createElement('a');
link.href=url;
link.download=`${file.name.replace(/\.[^.]+$/, '')}-marks.txt`;
link.click();
setTimeout(()=>URL.revokeObjectURL(url),1000);
});
el.importMarks.addEventListener('click',()=>el.marksInput.click());
el.marksInput.addEventListener('change',async()=>{
const[marks]=el.marksInput.files??[];
el.marksInput.value='';
if(!marks||!source)return;
try{
const parsed=readTimestamps(await marks.text());
const kept=parsed.segments.filter((segment)=>segment.start<source.duration);
if(!kept.length){
showError(phrase('marks.allpast',{name:marks.name}));
return;
}
segments=kept.map((segment)=>({
id:nextId++,
start:segment.start,
end:Math.min(segment.end,source.duration),
}));
selectedSegment=segments[segments.length-1].id;
el.marksFormat.value=parsed.format;
const dropped=parsed.segments.length-kept.length;
clearError();
if(dropped||parsed.skipped){
const says=[];
if(dropped){
says.push(phrase(dropped===1?'marks.dropped.one':'marks.dropped.many',
{n:dropped,name:marks.name}));
}
if(parsed.skipped){
says.push(phrase(parsed.skipped===1?'marks.skipped.one':'marks.skipped.many',
{n:parsed.skipped}));
}
says.push(phrase('marks.loaded',{n:kept.length}));
showError(says.reduce((a,b)=>phrase('join.sentences',{a,b})));
}
renderSegments();
}catch(error){
showError(phrase('marks.failed',
{name:marks.name,why:phrase(error.message)}));
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
seekTo(currentTime()-(event.shiftKey?timeline.fineStep:5));
}else if(event.key==='ArrowRight'){
event.preventDefault();
seekTo(currentTime()+(event.shiftKey?timeline.fineStep:5));
}
});
function ranges(){
if(!source)return[];
const marked=segmentRanges(segments);
if(mode==='cut')return invertRanges(marked,source.duration);
return marked.length?marked:[{start:0,end:source.duration}];
}
function sections(){
if(!source)return[];
return planSections(ranges(),{
sampleRate:source.sampleRate,
totalFrames:source.frames,
fadeSeconds:Number(el.fade.value),
});
}
document.querySelectorAll('input[name="mode"]').forEach((radio)=>{
radio.addEventListener('change',()=>{
mode=radio.value;
renderSegments();
});
});
el.depth.addEventListener('change',updateSummary);
el.fade.addEventListener('change',updateSummary);
function updateSummary(){
if(!source)return;
const planned=sections();
const bits=Number(el.depth.value);
const fadeSeconds=Number(el.fade.value);
if(!planned.length){
el.exportBtn.disabled=true;
el.sumParts.textContent=phrase(mode==='cut'?'sum.nothing.cut':'sum.nothing');
el.sumLength.textContent=phrase('sum.zero');
el.sumStart.textContent='—';
el.sumJoins.textContent='—';
el.sumSound.textContent='—';
el.sumSize.textContent='—';
el.cutNote.hidden=true;
el.fadeNote.textContent=fadeNote(fadeSeconds,0);
return;
}
el.exportBtn.disabled=false;
const frames=sectionFrames(planned);
const count=planned.length;
const parts=phrase(count===1?'n.part.one':'n.part.many',{n:count});
el.sumParts.textContent=mode==='cut'
?phrase('sum.parts.cut',{parts})
:parts;
el.sumLength.textContent=formatDuration(frames/source.sampleRate);
el.sumStart.textContent=phrase('sum.start',
{sample:planned[0].from.toLocaleString()});
const joins=count-1;
const faded=planned.reduce(
(total,section)=>total+(section.fadeIn?1:0)+(section.fadeOut?1:0),0);
if(joins===0){
el.sumJoins.textContent=phrase(faded?'sum.onepart.faded':'sum.onepart');
}else{
const said=phrase(joins===1?'n.join.one':'n.join.many',{n:joins});
el.sumJoins.textContent=faded
?phrase('sum.joins.faded',{
joins:said,
edges:phrase(faded===1?'n.edge.one':'n.edge.many',{n:faded}),
})
:phrase('sum.joins.nofades',{joins:said});
}
el.sumSound.textContent=phrase('sum.sound',{
channels:channelWord(source.channels.length),
khz:(source.sampleRate/1000).toFixed(1),
depth:phrase(bits===32?'depth.float':'depth.16'),
});
el.sumSize.textContent=formatBytes(wavSize(frames,source.channels.length,bits));
el.fadeNote.textContent=fadeNote(fadeSeconds,faded);
const untouched=isUntouched(planned,source.frames);
el.cutNote.hidden=!untouched;
if(untouched){
el.cutNote.textContent=phrase('sum.untouched');
}
}
function fadeNote(fadeSeconds,edges){
if(!fadeSeconds)return phrase('fade.none');
const values={
ms:Math.round(fadeSeconds*1000),
samples:Math.round(fadeSeconds*(source?.sampleRate??48000)).toLocaleString(),
};
if(!edges)return phrase('fade.some',values);
return phrase(edges===1?'fade.some.oneedge':'fade.some.edges',
{...values,n:edges});
}
async function runExport(){
if(!source||exporting)return;
clearError();
clearResult();
const planned=sections();
if(!planned.length){
showError(phrase('export.nothing'));
return;
}
exporting=true;
abortController=new AbortController();
el.exportBtn.disabled=true;
el.cancelBtn.hidden=false;
el.progress.hidden=false;
progress(0,phrase('step.starting'));
const bits=Number(el.depth.value);
try{
const started=performance.now();
const cut=await trim(source,planned,{
signal:abortController.signal,
t:phrase,
onProgress:(done,label)=>progress(done,label),
});
progress(1,phrase('step.writing'));
const blob=writeWav(cut.channels,source.sampleRate,{bits});
const seconds=cut.frames/source.sampleRate;
resultUrl=URL.createObjectURL(blob);
el.resultAudio.src=resultUrl;
el.download.href=resultUrl;
el.download.download=outputName(file.name);
el.result.hidden=false;
lastOut=summarise(cut.channels);
drawWaveform(el.outWave,lastOut);
el.resultInfo.textContent=[
phrase('result.wav',{depth:phrase(bits===32?'depth.float':'depth.16')}),
formatDuration(seconds),
formatBytes(blob.size),
phrase(planned.length===1?'n.part.one':'n.part.many',{n:planned.length}),
phrase('result.took',{seconds:((performance.now()-started)/1000).toFixed(1)}),
].reduce((a,b)=>phrase('join.dot',{a,b}));
el.progress.hidden=true;
el.result.scrollIntoView({behavior:'smooth',block:'nearest'});
}catch(error){
el.progress.hidden=true;
if(error?.name!=='AbortError'){
showError(error?.message?phrase(error.message):phrase('export.failed'));
console.error(error);
}
}finally{
exporting=false;
abortController=null;
el.cancelBtn.hidden=true;
el.exportBtn.disabled=false;
}
}
function outputName(name){
const base=name.replace(/\.[^.]+$/,'')||'audio';
return`${base}-${mode === 'cut' ? 'cut' : 'trimmed'}.wav`;
}
function progress(done,label){
el.progressBar.style.width=`${Math.round(Math.min(1, Math.max(0, done)) * 100)}%`;
if(label)el.progressLabel.textContent=label;
}
el.exportBtn.addEventListener('click',runExport);
el.cancelBtn.addEventListener('click',()=>abortController?.abort());
window.addEventListener('beforeunload',(event)=>{
if(!exporting)return;
event.preventDefault();
event.returnValue='';
});
window.addEventListener('resize',()=>{
timeline.redraw();
if(lastOut)drawWaveform(el.outWave,lastOut);
});
function showError(message){
el.error.textContent=message;
el.error.hidden=false;
}
function clearError(){
el.error.hidden=true;
el.error.textContent='';
}
function clearResult(){
el.result.hidden=true;
el.resultAudio.removeAttribute('src');
if(resultUrl)URL.revokeObjectURL(resultUrl);
resultUrl=null;
lastOut=null;
}
const channelWord=(count)=>(count<=2
?phrase(count===1?'channels.mono':'channels.stereo')
:phrase('channels.many',{n:count}));
function formatBytes(bytes){
if(bytes<1024)return phrase('size.b',{n:bytes});
if(bytes<1024*1024)return phrase('size.kb',{n:(bytes/1024).toFixed(1)});
if(bytes<1024*1024*1024){
return phrase('size.mb',{n:(bytes/(1024*1024)).toFixed(1)});
}
return phrase('size.gb',{n:(bytes/(1024*1024*1024)).toFixed(2)});
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
timeline.setEnabled(false);
document.getElementById('boot-warning')?.remove();
