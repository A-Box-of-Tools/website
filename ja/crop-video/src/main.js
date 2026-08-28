/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker}from'./shared/file-picker.js';
import{demux,UnsupportedFile}from'./demux.js';
import{cropExact,grabFrame,decoderConfig,averageFps}from'./transcode.js';
import{cropByRecording}from'./record.js';
import{Cropper}from'./cropper.js';
import{hasWebCodecs,hasMediaRecorder,canDecode}from'./support.js';
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
pathNote:$('path-note'),
cropCard:$('crop-card'),
stage:$('stage'),
preview:$('preview'),
still:$('still'),
stageBusy:$('stage-busy'),
stageNote:$('stage-note'),
transport:$('transport'),
stepBack:$('step-back'),
play:$('play'),
stepOn:$('step-on'),
scrub:$('scrub'),
atTime:$('at-time'),
atLength:$('at-length'),
aspectRow:document.querySelector('.aspect-row'),
swapAspect:$('swap-aspect'),
cropX:$('crop-x'),
cropY:$('crop-y'),
cropW:$('crop-w'),
cropH:$('crop-h'),
cropMax:$('crop-max'),
cropCentre:$('crop-centre'),
cropReset:$('crop-reset'),
exportCard:$('export-card'),
format:$('format'),
formatNote:$('format-note'),
quality:$('quality'),
keepAudio:$('keep-audio'),
audioNote:$('audio-note'),
sumSize:$('sum-size'),
sumKept:$('sum-kept'),
sumLength:$('sum-length'),
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
networkCount:$('network-count'),
networkDot:$('network-dot'),
offlineStatus:$('offline-status'),
offlineDot:$('offline-dot'),
};
let file=null;
let objectUrl=null;
let media=null;
let fallbackReason=null;
let source={width:0,height:0};
let duration=0;
let fps=30;
let canCropExactly=false;
let canRecord=false;
let playable=false;
let playing=false;
let position=0;
let wantedTime=-1;
let shownTime=-1;
let decoding=false;
let loadId=0;
let exporting=false;
let abortController=null;
let lastResultUrl=null;
const cropper=new Cropper(el.stage,{
onChange:onCropChanged,
label:phrase('crop.aria'),
});
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
const[file]=files;
if(file)loadFile(file);
},
});
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
async function loadFile(picked){
if(exporting)return;
clearError();
releaseFile();
loadId+=1;
file=picked;
picker.busy(phrase('step.reading'));
try{
objectUrl=URL.createObjectURL(picked);
const played=await openInPlayer(el.preview,objectUrl);
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
&&(played.width!==media.video.displayWidth||played.height!==media.video.displayHeight)){
decodable=false;
fallbackReason={key:'read.turned'};
}
canCropExactly=decodable;
canRecord=played.ok&&hasMediaRecorder();
if(!canCropExactly&&!canRecord){
showError(played.ok
?phrase('open.norecord')
:phrase('open.failed',{reason:why(fallbackReason,'read.notplayed')}));
resetView();
return;
}
source=canCropExactly
?{width:media.video.displayWidth,height:media.video.displayHeight}
:{width:played.width,height:played.height};
duration=played.duration||(media?media.duration:0);
fps=media?averageFps(media.video):30;
playable=played.ok;
showPreview();
setUpTransport();
goTo(0);
describeSource(played);
cropper.setSource(source.width,source.height);
setAspect('free',el.aspectRow.querySelector('[data-aspect="free"]'));
el.exportBtn.disabled=false;
updateFormatOptions();
updateSummary();
}catch(error){
console.error(error);
showError(error?.message
?phrase(error.message,fill(error.values)):phrase('open.notopened'));
resetView();
}finally{
picker.done();
}
}
function showPreview(){
el.stage.style.aspectRatio=`${source.width} / ${source.height}`;
el.stage.style.maxWidth=`calc(62vh * ${source.width / source.height})`;
el.preview.hidden=!playable;
el.still.hidden=playable;
el.stageNote.hidden=playable;
if(!playable){
el.stageNote.textContent=phrase('preview.still');
}
}
function describeSource(played){
el.source.hidden=false;
el.srcName.textContent=file.name;
el.srcSize.textContent=formatBytes(file.size);
el.srcFrame.textContent=phrase('size.plain',
{width:source.width,height:source.height});
el.srcLength.textContent=duration?formatDuration(duration):phrase('len.unknown');
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
el.pathNote.hidden=canCropExactly;
if(!canCropExactly){
el.pathNote.textContent=phrase('path.record',{
reason:why(fallbackReason,'read.layout'),
});
}
}
function releaseFile(){
playing=false;
playable=false;
position=0;
wantedTime=-1;
shownTime=-1;
if(objectUrl){
el.preview.removeAttribute('src');
el.preview.load();
URL.revokeObjectURL(objectUrl);
objectUrl=null;
}
media=null;
file=null;
}
function resetView(){
el.source.hidden=true;
el.pathNote.hidden=true;
el.transport.hidden=true;
releaseFile();
}
const playTitle=el.play.title;
function setUpTransport(){
el.transport.hidden=false;
el.scrub.min='0';
el.scrub.max=String(Math.max(1,Math.round(duration*1000)));
el.scrub.step=String(Math.max(1,Math.round(1000/(fps||30))));
el.scrub.value='0';
el.scrub.disabled=!duration;
el.play.disabled=!playable;
el.play.title=playable?playTitle:phrase('play.cannot');
el.atLength.textContent=duration?`/ ${clockTime(duration)}`:'';
}
function goTo(seconds){
position=Math.max(0,Math.min(seconds,duration||seconds));
el.scrub.value=String(Math.round(position*1000));
el.atTime.textContent=clockTime(position);
if(playable)el.preview.currentTime=position;
else drawStill(position);
}
function step(frames){
pause();
goTo(position+frames/(fps||30));
}
function play(){
if(!playable||playing)return;
playing=true;
el.play.textContent='⏸';
el.play.setAttribute('aria-label',phrase('play.pause'));
el.preview.play().catch(()=>pause());
follow();
}
function pause(){
if(!playing)return;
playing=false;
el.play.textContent='▶';
el.play.setAttribute('aria-label',phrase('play.play'));
el.preview.pause();
goTo(el.preview.currentTime);
}
function follow(){
if(!playing)return;
position=el.preview.currentTime;
el.scrub.value=String(Math.round(position*1000));
el.atTime.textContent=clockTime(position);
requestAnimationFrame(follow);
}
async function drawStill(seconds){
wantedTime=seconds;
if(decoding)return;
const mine=loadId;
decoding=true;
try{
while(wantedTime!==shownTime&&media&&loadId===mine){
const target=wantedTime;
const slow=setTimeout(()=>{el.stageBusy.hidden=false;},120);
try{
const canvas=await grabFrame({file,media,atSeconds:target});
if(wantedTime!==target||loadId!==mine)continue;
el.still.width=canvas.width;
el.still.height=canvas.height;
el.still.getContext('2d').drawImage(canvas,0,0);
el.still.hidden=false;
shownTime=target;
}finally{
clearTimeout(slow);
el.stageBusy.hidden=true;
}
}
}catch(error){
if(loadId!==mine)return;
el.still.hidden=true;
el.stageNote.textContent=phrase('preview.none',
{why:phrase(error.message,fill(error.values))});
}finally{
decoding=false;
}
}
el.play.addEventListener('click',()=>(playing?pause():play()));
el.stepBack.addEventListener('click',()=>step(-1));
el.stepOn.addEventListener('click',()=>step(1));
el.scrub.addEventListener('input',()=>{
pause();
goTo(Number(el.scrub.value)/1000);
});
el.preview.addEventListener('pause',()=>pause());
el.preview.addEventListener('ended',()=>pause());
let aspect=null;
function onCropChanged(rect){
el.cropX.value=String(rect.x);
el.cropY.value=String(rect.y);
el.cropW.value=String(rect.width);
el.cropH.value=String(rect.height);
el.cropX.max=String(Math.max(0,source.width-rect.width));
el.cropY.max=String(Math.max(0,source.height-rect.height));
el.cropW.max=String(source.width);
el.cropH.max=String(source.height);
updateSummary();
}
function setAspect(value,button){
for(const other of el.aspectRow.querySelectorAll('[data-aspect]')){
other.classList.toggle('active',other===button);
}
if(value==='free')aspect=null;
else if(value==='source')aspect=source.width/source.height;
else{
const[w,h]=value.split(':').map(Number);
aspect=w/h;
}
cropper.setAspect(aspect);
}
el.aspectRow.addEventListener('click',(event)=>{
const button=event.target.closest('[data-aspect]');
if(button)setAspect(button.dataset.aspect,button);
});
el.swapAspect.addEventListener('click',()=>{
if(!aspect)return;
aspect=1/aspect;
cropper.setAspect(aspect);
});
el.cropMax.addEventListener('click',()=>cropper.maximize());
el.cropCentre.addEventListener('click',()=>cropper.centre());
el.cropReset.addEventListener('click',()=>{
setAspect('free',el.aspectRow.querySelector('[data-aspect="free"]'));
cropper.reset();
});
for(const input of[el.cropX,el.cropY,el.cropW,el.cropH]){
input.addEventListener('change',()=>{
if(aspect&&(input===el.cropW||input===el.cropH)){
setAspect('free',el.aspectRow.querySelector('[data-aspect="free"]'));
}
cropper.setRect({
x:Number(el.cropX.value)||0,
y:Number(el.cropY.value)||0,
width:Number(el.cropW.value)||16,
height:Number(el.cropH.value)||16,
});
});
}
function usingExact(){
return el.format.value==='mp4'&&canCropExactly;
}
function updateFormatOptions(){
const mp4=el.format.querySelector('option[value="mp4"]');
const webm=el.format.querySelector('option[value="webm"]');
mp4.disabled=!canCropExactly;
webm.disabled=!canRecord;
el.format.value=canCropExactly?'mp4':'webm';
updateFormatNote();
}
function updateFormatNote(){
el.formatNote.textContent=phrase(usingExact()?'note.exact':'note.record');
el.audioNote.textContent=phrase(usingExact()?'note.audio.exact'
:'note.audio.record');
updateSummary();
}
el.format.addEventListener('change',updateFormatNote);
el.quality.addEventListener('change',updateSummary);
el.keepAudio.addEventListener('change',updateSummary);
function updateSummary(){
const rect=cropper.rect;
if(!source.width)return;
el.sumSize.textContent=phrase('size.from',{
width:rect.width,
height:rect.height,
fromWidth:source.width,
fromHeight:source.height,
});
const kept=(rect.width*rect.height)/(source.width*source.height);
el.sumKept.textContent=kept>=0.999
?phrase('kept.whole')
:phrase('kept.part',{percent:Math.round(kept*100)});
el.sumLength.textContent=duration?formatDuration(duration):phrase('len.unknown');
el.sumPath.textContent=phrase(usingExact()?'out.exact'
:(el.format.value==='webm'?'out.record.webm':'out.record.mp4'));
}
function fill(values={}){
return Object.fromEntries(Object.entries(values)
.map(([name,value])=>[name,value?.key?phrase(value.key,value.values):value]));
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
el.progressLabel.textContent=phrase('step.preparing');
}else if(phase==='finishing'){
el.progressLabel.textContent=phrase('step.finishing');
}else if(realtime){
el.progressLabel.textContent=phrase('step.realtime',{
done:formatDuration(done),
total:formatDuration(total),
percent:Math.round(fraction*100),
});
}else{
el.progressLabel.textContent=phrase('step.frame',{
done:done.toLocaleString(),
total:total.toLocaleString(),
percent:Math.round(fraction*100),
});
}
}
function outputFilename(extension){
const base=(file?.name??'video').replace(/\.[^.]+$/,'');
return`${base}-cropped.${extension}`;
}
function formatBytes(bytes){
if(bytes<1024*1024)return phrase('size.kb',{n:(bytes/1024).toFixed(0)});
if(bytes<1024*1024*1024){
return phrase('size.mb',{n:(bytes/1024/1024).toFixed(1)});
}
return phrase('size.gb',{n:(bytes/1024/1024/1024).toFixed(2)});
}
function clockTime(seconds){
const whole=Math.max(0,seconds);
const minutes=Math.floor(whole/60);
const rest=whole-minutes*60;
return`${minutes}:${rest.toFixed(3).padStart(6, '0')}`;
}
function formatDuration(seconds){
const whole=Math.max(0,Math.round(seconds));
const minutes=Math.floor(whole/60);
return minutes
?phrase('time.minutes',{minutes,seconds:String(whole%60).padStart(2,'0')})
:phrase('time.seconds',{n:seconds<10?seconds.toFixed(1):whole});
}
async function runExport(){
if(exporting||!file)return;
const crop=cropper.rect;
if(crop.width<16||crop.height<16){
showError(phrase('crop.toosmall'));
return;
}
clearError();
exporting=true;
abortController=new AbortController();
el.exportBtn.disabled=true;
el.cancelBtn.hidden=false;
el.progress.hidden=false;
el.result.hidden=true;
cropper.setEnabled(false);
pause();
setTransportEnabled(false);
setProgress({phase:'preparing',done:0,total:1});
const quality=el.quality.value;
const keepAudio=el.keepAudio.checked;
try{
const result=usingExact()
?await cropExact({
file,media,crop,quality,keepAudio,
onProgress:setProgress,signal:abortController.signal,
})
:await cropByRecording({
src:objectUrl,crop,quality,keepAudio,fps,
onProgress:setProgress,signal:abortController.signal,
});
if(result.warnings?.length){
showError(result.warnings.map((key)=>phrase(key))
.reduce((a,b)=>phrase('join.sentences',{a,b})));
}
if(lastResultUrl)URL.revokeObjectURL(lastResultUrl);
lastResultUrl=URL.createObjectURL(result.blob);
el.resultVideo.src=lastResultUrl;
el.download.href=lastResultUrl;
el.download.download=outputFilename(result.extension);
el.resultInfo.textContent=[
result.extension.toUpperCase(),
phrase('size.plain',{width:crop.width,height:crop.height}),
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
?phrase(error.message,fill(error.values)):phrase('export.failed'));
console.error(error);
}
}finally{
exporting=false;
abortController=null;
el.cancelBtn.hidden=true;
el.exportBtn.disabled=false;
cropper.setEnabled(true);
setTransportEnabled(true);
}
}
function setTransportEnabled(enabled){
for(const control of[el.play,el.stepBack,el.stepOn,el.scrub]){
control.disabled=!enabled;
}
if(enabled){
el.play.disabled=!playable;
el.scrub.disabled=!duration;
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
const platformNote=platform.size
?phrase(platform.size===1?'net.platform.one':'net.platform.many',
{hosts:platform.size})
:'';
el.networkCount.textContent=clean
?phrase('net.clean',{total,platform:platformNote})
:phrase('net.dirty',{hosts:[...external].join(', '),platform:platformNote});
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
if(!hasWebCodecs()&&!hasMediaRecorder()){
showError(phrase('nocodec.page'));
}
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
