/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ltr,phrase}from'./shared/phrases.js?v=04690abd49';
import{messageBox}from'./shared/message-box.js?v=04690abd49';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=04690abd49';
import{sizeText,durationText}from'./shared/format.js?v=04690abd49';
import{demux,UnsupportedFile}from'./shared/mp4-reader.js?v=04690abd49';
import{hasWebCodecs,hasEncoder,canDecode}from'./shared/video-support.js?v=04690abd49';
import{averageFps,decoderConfig}from'./shared/webcodecs.js?v=04690abd49';
import{compress}from'./encode.js?v=04690abd49';
import{fixedBytes,fractionOf,MB,plan,PRESETS,retune}from'./plan.js?v=04690abd49';
import{bitrateText,frameText,outName}from'./format.js?v=04690abd49';
import{makeExample}from'./example.js?v=04690abd49';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
fileRow:$('file-row'),
fileName:$('file-name'),
fileFacts:$('file-facts'),
clearFile:$('clear-file'),
loadError:$('load-error'),
loadNote:$('load-note'),
targetMb:$('target-mb'),
presets:document.querySelectorAll('.chip[data-mb], .chip[data-fraction]'),
rungs:document.querySelectorAll('.chip[data-edge]'),
dropAudio:$('drop-audio'),
estimate:$('estimate'),
runCard:$('run-card'),
run:$('run'),
cancel:$('cancel'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
runError:$('run-error'),
result:$('result'),
resultSize:$('result-size'),
resultSub:$('result-sub'),
download:$('download'),
player:$('player'),
checkLine:$('check-line'),
resultFacts:$('result-facts'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showLoadError}=messageBox(el.loadError);
const{show:note}=messageBox(el.loadNote);
let loaded=null;
let longEdge=null;
let downloadUrl='';
let playUrl='';
let running=null;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
load(files[0]);
},
example:makeExample,
});
async function load(file){
if(!file||running)return;
reset();
picker.busy(readingLabel(1));
try{
if(!hasWebCodecs()||!hasEncoder())throw new Error('support.nowebcodecs');
const media=await demux(file);
if(!(await canDecode(decoderConfig(media.video)))){
const refused=new Error('support.nodecode');
refused.values={codec:media.video.codec};
throw refused;
}
const{video,audio}=media;
const source={
seconds:media.duration,
fps:averageFps(video),
displayWidth:video.displayWidth,
displayHeight:video.displayHeight,
videoBytes:video.samples.reduce((sum,s)=>sum+s.size,0),
audioBytes:audio?audio.samples.reduce((sum,s)=>sum+s.size,0):0,
samples:video.samples.length+(audio?.samples.length??0),
bytes:file.size,
};
loaded={file,media,source};
el.fileName.textContent=file.name;
el.fileFacts.textContent=phrase('file.facts',{
size:size(file.size),
length:durationText(media.duration,phrase),
frame:say(frameText({width:video.displayWidth,height:video.displayHeight})),
rate:say(bitrateText(source.bytes*8/Math.max(0.1,media.duration))),
});
el.fileRow.hidden=false;
if(!audio?.samples.length){
note(phrase('note.silent'));
el.dropAudio.checked=false;
el.dropAudio.disabled=true;
}else{
el.dropAudio.disabled=false;
}
if(!el.targetMb.value){
const quarter=fractionOf(file.size,0.25);
const preset=PRESETS.find((bytes)=>bytes>=quarter)??PRESETS[PRESETS.length-1];
setTarget(Math.min(preset,fractionOf(file.size,0.5)));
}
refresh();
}catch(error){
showLoadError(messageFor(error));
picker.waiting();
}finally{
picker.done();
}
}
el.targetMb.addEventListener('input',refresh);
el.dropAudio.addEventListener('change',refresh);
for(const chip of el.presets){
chip.addEventListener('click',()=>{
if(chip.dataset.mb)setTarget(Number(chip.dataset.mb)*MB);
else if(loaded)setTarget(fractionOf(loaded.file.size,Number(chip.dataset.fraction)));
refresh();
});
}
for(const chip of el.rungs){
chip.addEventListener('click',()=>{
longEdge=chip.dataset.edge==='auto'?null:Number(chip.dataset.edge);
for(const other of el.rungs)other.setAttribute('aria-pressed',String(other===chip));
refresh();
});
}
function setTarget(bytes){
const mb=bytes/MB;
el.targetMb.value=mb>=10?String(Math.round(mb)):mb.toFixed(1).replace(/\.0$/,'');
}
function targetBytes(){
const mb=Number(el.targetMb.value);
return Number.isFinite(mb)&&mb>0?Math.round(mb*MB):null;
}
function choice(){
return{targetBytes:targetBytes(),keepAudio:!el.dropAudio.checked,longEdge};
}
function refresh(){
for(const chip of el.presets){
const bytes=chip.dataset.mb
?Number(chip.dataset.mb)*MB
:loaded?fractionOf(loaded.file.size,Number(chip.dataset.fraction)):-1;
chip.setAttribute('aria-pressed',String(bytes===targetBytes()));
}
if(!loaded){
el.estimate.textContent=phrase('estimate.nofile');
gate(false);
return;
}
const target=targetBytes();
if(target===null){
el.estimate.textContent=phrase('estimate.notarget');
gate(false);
return;
}
if(target>=loaded.file.size){
el.estimate.textContent=phrase('estimate.already',{
size:size(loaded.file.size),target:size(target),
});
gate(false);
return;
}
const planned=plan(loaded.source,choice());
if(!planned.ok){
el.estimate.textContent=phrase(
planned.reason==='nofit'?'estimate.nofit':'estimate.toosmall',
{least:size(planned.least)},
);
gate(false);
return;
}
el.estimate.textContent=phrase('estimate.plan',{
frame:say(frameText(planned.frame)),
rate:say(bitrateText(planned.bitrate)),
estimate:size(planned.estimate),
target:size(target),
});
gate(true);
}
function gate(ready){
const line=el.runCard.querySelector('.card-waiting');
if(ready){
el.runCard.removeAttribute('inert');
line?.remove();
return;
}
el.runCard.setAttribute('inert','');
if(!line){
const waiting=document.createElement('p');
waiting.className='card-waiting';
waiting.textContent=phrase('waiting.target');
el.runCard.querySelector('h2').after(waiting);
}
}
el.run.addEventListener('click',run);
el.cancel.addEventListener('click',()=>running?.abort());
el.clearFile.addEventListener('click',()=>{
reset();
picker.waiting();
});
async function run(){
const chosen=loaded&&choice();
const planned=chosen&&chosen.targetBytes&&plan(loaded.source,chosen);
if(!planned?.ok||running)return;
running=new AbortController();
el.run.disabled=true;
el.cancel.hidden=false;
el.result.hidden=true;
el.runError.hidden=true;
el.progress.hidden=false;
releaseDownload();
let cancelled=false;
const started=performance.now();
try{
const{file,media,source}=loaded;
const fixed=fixedBytes(source,chosen.keepAudio);
let bitrate=planned.bitrate;
let pass=1;
let out;
for(;;){
out=await compress({
file,
media,
frame:planned.frame,
bitrate,
fps:source.fps,
keepAudio:chosen.keepAudio,
signal:running.signal,
onProgress:(progress)=>setProgress({...progress,pass}),
});
if(out.blob.size<=chosen.targetBytes||pass===2)break;
bitrate=retune(bitrate,out.blob.size,chosen.targetBytes,fixed);
pass=2;
}
setProgress({phase:'checking',done:1,total:1,pass});
const check=await verify(out.blob,media.duration,chosen.targetBytes);
showResult({
out,check,chosen,planned,bitrate,pass,
seconds:(performance.now()-started)/1000,
});
}catch(error){
if(error?.name==='AbortError'||error?.message==='aborted'){
cancelled=true;
el.progressLabel.textContent=phrase('run.cancelled');
}else{
el.runError.textContent=messageFor(error);
el.runError.hidden=false;
}
}finally{
running=null;
el.run.disabled=false;
el.cancel.hidden=true;
el.progress.hidden=!cancelled;
if(cancelled)el.progressBar.style.width='0%';
}
}
async function verify(blob,expectedSeconds,targetBytes){
let again;
try{
again=await demux(new File([blob],'check.mp4',{type:'video/mp4'}));
}catch(error){
return{ok:false,text:{key:'check.reopen',values:{detail:messageFor(error)}}};
}
const drift=Math.abs(again.duration-expectedSeconds);
if(drift>Math.max(0.25,expectedSeconds*0.02)){
return{
ok:false,
text:{
key:'check.length',
values:{got:durationText(again.duration,phrase),want:durationText(expectedSeconds,phrase)},
},
};
}
const under=blob.size<=targetBytes;
return{
ok:true,
under,
text:{
key:under?'check.ok':'check.over',
values:{length:durationText(again.duration,phrase),size:size(blob.size),target:size(targetBytes)},
},
};
}
function showResult({out,check,chosen,planned,bitrate,pass,seconds}){
const{file,source}=loaded;
const saved=1-out.blob.size/file.size;
el.resultSize.textContent=phrase('result.ready',{
size:size(out.blob.size),percent:Math.round(saved*100),from:size(file.size),
});
el.resultSub.textContent=phrase('result.sub');
el.checkLine.textContent=phrase(check.ok?'check.passed':'check.failed',
{found:say(check.text)});
el.checkLine.className=`check-line ${check.ok && check.under !== false ? 'good' : check.ok ? 'warn' : 'bad'}`;
const facts=[
phrase('facts.picture',{
frame:say(frameText(planned.frame)),
from:say(frameText({width:source.displayWidth,height:source.displayHeight})),
rate:say(bitrateText(bitrate)),
fps:Math.round(source.fps),
}),
phrase(chosen.keepAudio&&source.audioBytes?'facts.sound.kept':'facts.sound.none'),
phrase(pass===2?'facts.passes.two':'facts.passes.one'),
phrase('facts.time',{seconds:durationText(seconds,phrase),frames:out.frames}),
phrase('facts.reencoded'),
];
el.resultFacts.replaceChildren(...facts.map((text)=>{
const row=document.createElement('li');
row.textContent=text;
return row;
}));
downloadUrl=URL.createObjectURL(out.blob);
el.download.href=downloadUrl;
el.download.download=outName(file.name);
el.download.hidden=!check.ok;
playUrl=downloadUrl;
el.player.src=playUrl;
el.player.hidden=!check.ok;
el.result.hidden=false;
}
let stageText='';
function setProgress({phase,done,total,pass}){
const fraction=total>0?Math.min(1,done/total):0;
el.progressBar.style.width=`${(fraction * 100).toFixed(1)}%`;
const percent=Math.round(fraction*100);
if(phase==='preparing'){
stageText=phrase(pass===2?'progress.again':'progress.preparing');
}else if(phase==='encoding'){
stageText=phrase('progress.frame',{
done:done.toLocaleString(),total:total.toLocaleString(),percent,
});
}else if(phase==='finishing'){
stageText=phrase('progress.finishing');
}else if(phase==='checking'){
stageText=phrase('progress.checking');
}
el.progressLabel.textContent=stageText;
}
const size=(n)=>ltr(sizeText(n,phrase,{kb:0,mb:1,gb:'size.gb'}));
const say=(said)=>(said&&said.key?phrase(said.key,said.values):said??'');
function messageFor(error){
if(error instanceof UnsupportedFile)return phrase(error.message,error.values);
if(error?.name==='AbortError')return phrase('run.cancelled');
const key=String(error?.message??'');
if(/^(support|stall|encode|decode|read)\./.test(key))return phrase(key,error.values);
return phrase('run.failed',{detail:key||String(error)});
}
function reset(){
loaded=null;
el.fileRow.hidden=true;
el.result.hidden=true;
el.progress.hidden=true;
el.loadError.hidden=true;
el.loadNote.hidden=true;
el.runError.hidden=true;
el.dropAudio.disabled=false;
releaseDownload();
refresh();
}
function releaseDownload(){
if(downloadUrl)URL.revokeObjectURL(downloadUrl);
downloadUrl='';
playUrl='';
el.download.removeAttribute('href');
el.player.removeAttribute('src');
el.player.hidden=true;
}
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
window.addEventListener('error',(event)=>{
showLoadError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showLoadError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
refresh();
document.getElementById('boot-warning')?.remove();
