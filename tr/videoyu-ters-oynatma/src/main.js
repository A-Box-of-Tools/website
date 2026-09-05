/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=710dc5c362';
import{decoderConfig,averageFps}from'./shared/webcodecs.js?v=710dc5c362';
import{sizeText,durationText}from'./shared/format.js?v=710dc5c362';
import{openInPlayer}from'./shared/media.js?v=710dc5c362';
import{messageBox}from'./shared/message-box.js?v=710dc5c362';
import{wireFilePicker}from'./shared/file-picker.js?v=710dc5c362';
import{demux,UnsupportedFile}from'./shared/mp4-reader.js?v=710dc5c362';
import{reverseExact}from'./reverse.js?v=710dc5c362';
import{measureFps,reverseByPlayback}from'./playback.js?v=710dc5c362';
import{gopRanges}from'./timeline.js?v=710dc5c362';
import{hasWebCodecs,hasEncoder,canDecode}from'./shared/video-support.js?v=710dc5c362';
function why(fallback,absent){
return phrase(fallback?.key??absent,fallback?.values);
}
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
source:$('source'),
srcName:$('src-name'),
srcSize:$('src-size'),
srcFrame:$('src-frame'),
srcLength:$('src-length'),
srcCodec:$('src-codec'),
srcAudio:$('src-audio'),
previewWrap:$('preview-wrap'),
preview:$('preview'),
stageNote:$('stage-note'),
pathNote:$('path-note'),
exportCard:$('export-card'),
quality:$('quality'),
keepAudio:$('keep-audio'),
audioNote:$('audio-note'),
sumSize:$('sum-size'),
sumLength:$('sum-length'),
sumFrames:$('sum-frames'),
sumPath:$('sum-path'),
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
let file=null;
let objectUrl=null;
let media=null;
let fallbackReason=null;
let source={width:0,height:0};
let duration=0;
let frames=0;
let fps=30;
let fpsMeasured=false;
let canReverseExactly=false;
let canPlay=false;
let loading=false;
let exporting=false;
let abortController=null;
let lastResultUrl=null;
const worker=document.createElement('video');
worker.muted=true;
worker.playsInline=true;
worker.preload='auto';
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
releaseFile();
loading=true;
file=picked;
el.exportBtn.disabled=true;
picker.busy(phrase('step.reading'));
try{
objectUrl=URL.createObjectURL(picked);
const played=await openInPlayer(el.preview,objectUrl);
if(played.ok)await openInPlayer(worker,objectUrl);
try{
media=await demux(picked);
fallbackReason=null;
}catch(error){
media=null;
fallbackReason=error instanceof UnsupportedFile
?{key:error.reason,values:error.values}
:{key:error.message||'read.unreadable'};
}
let decodable=false;
if(media&&hasWebCodecs()){
decodable=await canDecode(decoderConfig(media.video));
if(!decodable){
fallbackReason={key:'read.nodecoder',values:{codec:media.video.codec}};
}
}else if(media&&!hasWebCodecs()){
fallbackReason={key:'read.nowebcodecs'};
}
if(decodable&&played.ok
&&(played.width!==media.video.displayWidth
||played.height!==media.video.displayHeight)){
decodable=false;
fallbackReason={key:'read.turned'};
}
canReverseExactly=decodable;
canPlay=played.ok;
if(!canReverseExactly&&!canPlay){
showError(phrase('open.failed',{reason:why(fallbackReason,'read.notplayed')}));
resetView();
return;
}
if(!hasEncoder()){
showError(phrase('nocodec.file'));
resetView();
return;
}
source=canReverseExactly
?{width:media.video.displayWidth,height:media.video.displayHeight}
:{width:played.width,height:played.height};
duration=played.duration||(media?media.duration:0);
if(canReverseExactly){
fps=averageFps(media.video);
fpsMeasured=true;
frames=media.video.samples.length;
}else{
picker.busy(phrase('step.measuring'));
const measured=await measureFps(worker);
fps=measured.fps;
fpsMeasured=measured.measured;
frames=Math.max(1,Math.floor(duration*fps));
}
showPreview(played.ok);
describeSource(played);
el.exportBtn.disabled=false;
updateAudioNote();
updateSummary();
}catch(error){
console.error(error);
showError(error?.message
?phrase(error.message,error.values):phrase('open.notopened'));
resetView();
}finally{
loading=false;
picker.done();
}
}
function showPreview(playable){
el.previewWrap.hidden=!playable;
el.stageNote.hidden=playable;
if(!playable){
el.stageNote.textContent=phrase('preview.none');
}
}
function describeSource(played){
el.source.hidden=false;
el.srcName.textContent=file.name;
el.srcSize.textContent=formatBytes(file.size);
el.srcFrame.textContent=phrase('size.plain',
{width:source.width,height:source.height});
el.srcLength.textContent=duration?formatDuration(duration):phrase('src.unknown');
if(media){
el.srcCodec.textContent=media.video.rotation
?phrase('src.codec.turned',{
codec:media.video.codec,
entry:media.video.entryType,
degrees:media.video.rotation,
})
:phrase('src.codec',{codec:media.video.codec,entry:media.video.entryType});
el.srcAudio.textContent=media.audio
?phrase(media.audio.channels===1?'src.audio.one':'src.audio.many',{
entry:media.audio.entryType,
n:media.audio.channels,
rate:Math.round(media.audio.sampleRate),
})
:phrase('src.audio.none');
}else{
el.srcCodec.textContent=phrase(played.ok?'src.byplayer':'src.unknown');
el.srcAudio.textContent=phrase('src.audio.whatever');
}
el.pathNote.hidden=canReverseExactly;
if(!canReverseExactly){
el.pathNote.textContent=phrase('path.record',{
reason:why(fallbackReason,'read.layout'),
rate:phrase(fpsMeasured?'path.fps.measured':'path.fps.assumed',{fps}),
});
}
}
function releaseFile(){
if(objectUrl){
el.preview.removeAttribute('src');
el.preview.load();
worker.removeAttribute('src');
worker.load();
URL.revokeObjectURL(objectUrl);
objectUrl=null;
}
media=null;
file=null;
}
function resetView(){
el.exportBtn.disabled=true;
el.source.hidden=true;
el.previewWrap.hidden=true;
el.stageNote.hidden=true;
el.pathNote.hidden=true;
releaseFile();
}
function updateAudioNote(){
const off=!el.keepAudio.checked;
if(off){
el.audioNote.textContent=phrase('sound.off');
return;
}
el.audioNote.textContent=phrase(canReverseExactly&&media?.audio
?'sound.exact':'sound.player');
}
function outputFrame(){
return{
width:Math.max(2,Math.floor(source.width/2)*2),
height:Math.max(2,Math.floor(source.height/2)*2),
};
}
function updateSummary(){
if(!source.width)return;
const frame=outputFrame();
el.sumSize.textContent=frame.width===source.width&&frame.height===source.height
?phrase('size.plain',{width:frame.width,height:frame.height})
:phrase('size.evened',{
width:frame.width,
height:frame.height,
fromWidth:source.width,
fromHeight:source.height,
});
el.sumLength.textContent=duration?formatDuration(duration):phrase('src.unknown');
el.sumFrames.textContent=canReverseExactly
?phrase('frames.groups',{
n:frames.toLocaleString(),
groups:gopRanges(media.video.samples).length.toLocaleString(),
})
:phrase('frames.about',{n:frames.toLocaleString(),fps});
el.sumPath.textContent=phrase(canReverseExactly?'path.exact':'path.player');
}
el.quality.addEventListener('change',updateSummary);
el.keepAudio.addEventListener('change',updateAudioNote);
function setProgress({phase,done,total}){
const fraction=total>0?Math.min(1,done/total):0;
if(phase==='preparing'){
el.progressLabel.textContent=phrase('step.preparing');
}else if(phase==='sound-reading'){
el.progressLabel.textContent=phrase('step.soundreading');
}else if(phase==='sound-writing'){
el.progressLabel.textContent=phrase('step.soundwriting');
}else if(phase==='finishing'){
el.progressLabel.textContent=phrase('step.finishing');
}else{
el.progressBar.style.width=`${(fraction * 100).toFixed(1)}%`;
el.progressLabel.textContent=phrase('step.frame',{
done:done.toLocaleString(),
total:total.toLocaleString(),
percent:Math.round(fraction*100),
});
return;
}
if(phase==='preparing')el.progressBar.style.width='0%';
}
function outputFilename(extension){
const base=(file?.name??'video').replace(/\.[^.]+$/,'');
return`${base}-reversed.${extension}`;
}
async function runExport(){
if(exporting||loading||!file)return;
clearError();
exporting=true;
abortController=new AbortController();
el.exportBtn.disabled=true;
el.cancelBtn.hidden=false;
el.progress.hidden=false;
el.result.hidden=true;
el.preview.pause();
setProgress({phase:'preparing',done:0,total:1});
const quality=el.quality.value;
const keepAudio=el.keepAudio.checked;
try{
const result=canReverseExactly
?await reverseExact({
file,media,quality,keepAudio,
onProgress:setProgress,signal:abortController.signal,
})
:await reverseByPlayback({
file,video:worker,duration,fps,quality,keepAudio,
onProgress:setProgress,signal:abortController.signal,
});
if(result.warning)showError(phrase(result.warning));
if(lastResultUrl)URL.revokeObjectURL(lastResultUrl);
lastResultUrl=URL.createObjectURL(result.blob);
el.resultVideo.src=lastResultUrl;
el.download.href=lastResultUrl;
el.download.download=outputFilename(result.extension);
const frame=outputFrame();
el.resultInfo.textContent=[
result.extension.toUpperCase(),
phrase('size.plain',{width:frame.width,height:frame.height}),
phrase(result.frames===1?'n.frame.one':'n.frame.many',
{n:result.frames.toLocaleString()}),
formatBytes(result.blob.size),
result.codec,
].reduce((a,b)=>phrase('join.dot',{a,b}));
el.result.hidden=false;
el.progress.hidden=true;
el.result.scrollIntoView({behavior:'smooth',block:'nearest'});
}catch(error){
el.progress.hidden=true;
if(error?.name!=='AbortError'){
showError(error?.message
?phrase(error.message,error.values):phrase('export.failed'));
console.error(error);
}
}finally{
exporting=false;
abortController=null;
el.cancelBtn.hidden=true;
el.exportBtn.disabled=false;
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
window.addEventListener('error',(event)=>{
showError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
if(!hasEncoder()){
showError(phrase('nocodec.page'));
}
document.getElementById('boot-warning')?.remove();
