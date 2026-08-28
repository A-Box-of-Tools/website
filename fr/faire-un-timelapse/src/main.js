/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker}from'./shared/file-picker.js';
import{demux,UnsupportedFile}from'./demux.js';
import{timelapseByDecoding,previewFrame,decoderConfig,averageFps}from'./decode.js';
import{timelapseByPlaying}from'./playback.js';
import{TimelapseWriter}from'./encode.js';
import{hasEncoder,hasWebCodecs,canDecode,pickH264Codec}from'./support.js';
import{
MIN_FRAMES,
clampSpeed,speedForLength,lengthForSpeed,sampleInterval,frameTimes,repeatsFrames,
outputSize,chooseBitrate,estimateBytes,decodeRuns,decodeCost,
}from'./plan.js';
function why(fallback,absent){
return phrase(fallback?.key??absent,fallback?.values);
}
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
previewWrap:$('preview-wrap'),
preview:$('preview'),
still:$('still'),
previewNote:$('preview-note'),
source:$('source'),
srcName:$('src-name'),
srcSize:$('src-size'),
srcFrame:$('src-frame'),
srcLength:$('src-length'),
srcFps:$('src-fps'),
srcCodec:$('src-codec'),
pathNote:$('path-note'),
speedCard:$('speed-card'),
speedRow:document.querySelector('.speed-row'),
speed:$('speed'),
length:$('length'),
intervalNote:$('interval-note'),
fps:$('fps'),
size:$('size'),
sizeNote:$('size-note'),
quality:$('quality'),
exportCard:$('export-card'),
sumFrames:$('sum-frames'),
sumInterval:$('sum-interval'),
sumLength:$('sum-length'),
sumSize:$('sum-size'),
sumRead:$('sum-read'),
sumBytes:$('sum-bytes'),
planNote:$('plan-note'),
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
let sourceFps=0;
let canReadDirectly=false;
let canPlay=false;
let working=false;
let abortController=null;
let lastResultUrl=null;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
const[picked]=files;
if(picked)loadFile(picked);
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
const PROBE_TIMEOUT=10_000;
function firstFrameLands(video,atSeconds){
return new Promise((resolve)=>{
let settled=false;
const done=(ok)=>{
if(settled)return;
settled=true;
clearTimeout(timer);
video.removeEventListener('error',onError);
video.removeEventListener('seeked',onSeeked);
resolve(ok);
};
const decoded=()=>video.readyState>=2&&!video.error;
const onError=()=>done(false);
const onSeeked=()=>{
if(typeof video.requestVideoFrameCallback==='function'){
video.requestVideoFrameCallback(()=>done(true));
}
setTimeout(()=>done(decoded()),500);
};
const timer=setTimeout(()=>done(false),PROBE_TIMEOUT);
video.addEventListener('error',onError,{once:true});
video.addEventListener('seeked',onSeeked,{once:true});
if(Math.abs(video.currentTime-atSeconds)<1e-4)onSeeked();
else video.currentTime=atSeconds;
});
}
async function loadFile(picked){
if(working)return;
clearError();
releaseFile();
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
let readable=false;
if(media&&hasWebCodecs()){
readable=await canDecode(decoderConfig(media.video));
if(!readable){
fallbackReason={key:'read.nodecoder',values:{codec:media.video.codec}};
}
}else if(media&&!hasWebCodecs()){
fallbackReason={key:'read.nowebcodecs'};
}
canReadDirectly=readable;
let opensButCannotDecode=false;
if(canReadDirectly){
canPlay=played.ok;
}else if(played.ok){
picker.busy(phrase('step.checking'));
canPlay=await firstFrameLands(el.preview,
Math.min(1,(played.duration||2)/2));
opensButCannotDecode=!canPlay;
}else{
canPlay=false;
}
if(!canReadDirectly&&!canPlay){
showError(opensButCannotDecode
?phrase('open.nodecode')
:phrase('open.failed',{reason:why(fallbackReason,'read.notplayed')}));
resetView();
return;
}
if(!hasEncoder()){
showError(phrase('nocodec.file'));
resetView();
return;
}
source=canReadDirectly
?{width:media.video.displayWidth,height:media.video.displayHeight}
:{width:played.width,height:played.height};
duration=played.duration||(media?media.duration:0);
sourceFps=canReadDirectly?averageFps(media.video):0;
if(!(duration>0)){
showError(phrase('open.nolength'));
resetView();
return;
}
await showPreview(canPlay);
describeSource();
fitSizeOptions();
el.exportBtn.disabled=false;
setSpeed(defaultSpeed(),null);
}catch(error){
console.error(error);
showError(error?.message
?phrase(error.message,fill(error.values)):phrase('open.notopened'));
resetView();
}finally{
picker.done();
}
}
async function showPreview(playable){
el.previewWrap.hidden=false;
if(playable){
el.preview.hidden=false;
el.still.hidden=true;
el.previewNote.hidden=true;
return;
}
el.preview.hidden=true;
el.previewNote.hidden=false;
el.previewNote.textContent=phrase('preview.still');
try{
const canvas=await previewFrame({file,media,atSeconds:0});
el.still.width=canvas.width;
el.still.height=canvas.height;
el.still.getContext('2d').drawImage(canvas,0,0);
el.still.hidden=false;
}catch(error){
el.still.hidden=true;
el.previewNote.textContent=phrase('preview.none',
{why:phrase(error.message,fill(error.values))});
}
}
function describeSource(){
el.source.hidden=false;
el.srcName.textContent=file.name;
el.srcSize.textContent=formatBytes(file.size);
el.srcFrame.textContent=phrase('size.plain',
{width:source.width,height:source.height});
el.srcLength.textContent=formatDuration(duration);
el.srcFps.textContent=sourceFps
?phrase('src.fps',{n:sourceFps.toFixed(sourceFps<10?1:0)})
:phrase('src.fps.player');
if(media){
el.srcCodec.textContent=media.video.rotation
?phrase('src.codec.turned',{
codec:media.video.codec,
entry:media.video.entryType,
degrees:media.video.rotation,
})
:phrase('src.codec',{codec:media.video.codec,entry:media.video.entryType});
}else{
el.srcCodec.textContent=phrase('src.byplayer');
}
el.pathNote.hidden=canReadDirectly;
if(!canReadDirectly){
el.pathNote.textContent=phrase('path.seek',{
reason:why(fallbackReason,'read.layout'),
});
}
}
function defaultSpeed(){
const presets=[...el.speedRow.querySelectorAll('[data-speed]')]
.map((button)=>Number(button.dataset.speed));
const wanted=duration/15;
let best=presets[0];
for(const preset of presets){
if(Math.abs(preset-wanted)<Math.abs(best-wanted))best=preset;
}
return clampSpeed(Math.min(best,duration/(MIN_FRAMES/outputFps())));
}
function releaseFile(){
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
el.previewWrap.hidden=true;
el.previewNote.hidden=true;
el.pathNote.hidden=true;
releaseFile();
}
function outputFps(){
return Number(el.fps.value)||30;
}
function currentSpeed(){
return clampSpeed(Number(el.speed.value));
}
function fitSizeOptions(){
const shorter=Math.min(source.width,source.height);
for(const option of el.size.options){
const edge=Number(option.value);
option.disabled=edge>0&&edge>=shorter;
}
if(el.size.selectedOptions[0]?.disabled)el.size.value='0';
}
function setSpeed(speed,from){
const value=clampSpeed(speed);
if(from!==el.speed)el.speed.value=round(value,1);
if(from!==el.length)el.length.value=round(lengthForSpeed({duration,speed:value}),1);
for(const button of el.speedRow.querySelectorAll('[data-speed]')){
button.classList.toggle('active',Math.abs(Number(button.dataset.speed)-value)<0.05);
}
updateSummary();
}
function round(value,places){
const factor=10**places;
return String(Math.round(value*factor)/factor);
}
el.speedRow.addEventListener('click',(event)=>{
const button=event.target.closest('[data-speed]');
if(button)setSpeed(Number(button.dataset.speed),null);
});
el.speed.addEventListener('input',()=>setSpeed(Number(el.speed.value),el.speed));
el.speed.addEventListener('change',()=>setSpeed(Number(el.speed.value),null));
el.length.addEventListener('input',()=>{
setSpeed(speedForLength({duration,seconds:Number(el.length.value)}),el.length);
});
el.length.addEventListener('change',()=>{
setSpeed(speedForLength({duration,seconds:Number(el.length.value)}),null);
});
el.fps.addEventListener('change',()=>setSpeed(currentSpeed(),null));
el.size.addEventListener('change',updateSummary);
el.quality.addEventListener('change',updateSummary);
function currentPlan(){
const speed=currentSpeed();
const fps=outputFps();
const times=frameTimes({duration,speed,fps});
const frame=outputSize({
width:source.width,height:source.height,shortEdge:Number(el.size.value),
});
const bitrate=chooseBitrate({
width:frame.width,height:frame.height,fps,quality:el.quality.value,
});
return{
speed,fps,times,frame,bitrate,
interval:sampleInterval({speed,fps}),
bytes:estimateBytes({frames:times.length,fps,bitrate}),
};
}
function updateSummary(){
if(!source.width||!duration)return;
const plan=currentPlan();
const enough=plan.times.length>=MIN_FRAMES;
el.intervalNote.textContent=phrase('plan.interval',
{every:formatInterval(plan.interval),fps:plan.fps});
el.sumFrames.textContent=phrase(plan.times.length===1?'n.frame.one':'n.frame.many',
{n:plan.times.length.toLocaleString()});
el.sumInterval.textContent=formatInterval(plan.interval);
el.sumLength.textContent=formatDuration(plan.times.length/plan.fps);
el.sumSize.textContent=plan.frame.width===source.width
?phrase('size.unchanged',{width:plan.frame.width,height:plan.frame.height})
:phrase('size.from',{
width:plan.frame.width,
height:plan.frame.height,
fromWidth:source.width,
fromHeight:source.height,
});
el.sumBytes.textContent=phrase('plan.about',{size:formatBytes(plan.bytes)});
if(canReadDirectly){
const runs=decodeRuns({
samples:media.video.samples,timescale:media.video.timescale,times:plan.times,
});
const cost=decodeCost(runs,media.video.samples.length);
el.sumRead.textContent=phrase('plan.read',{
read:cost.read.toLocaleString(),total:cost.total.toLocaleString(),
});
}else{
el.sumRead.textContent=phrase(plan.times.length===1?'plan.seeks.one':'plan.seeks.many',
{n:plan.times.length.toLocaleString()});
}
const notes=[];
if(!enough){
notes.push(phrase(plan.times.length===1?'plan.toofew.one':'plan.toofew.many',
{n:plan.times.length}));
}
if(repeatsFrames({speed:plan.speed,fps:plan.fps,sourceFps})){
notes.push(phrase('plan.repeats'));
}
el.planNote.hidden=notes.length===0;
el.planNote.textContent=notes.length
?notes.reduce((a,b)=>phrase('join.sentences',{a,b}))
:'';
el.exportBtn.disabled=working||!enough;
}
function showError(message){
el.error.textContent=message;
el.error.hidden=false;
}
function clearError(){
el.error.hidden=true;
el.error.textContent='';
}
function fill(values={}){
return Object.fromEntries(Object.entries(values)
.map(([name,value])=>[name,value?.key?phrase(value.key,value.values):value]));
}
const said=(key,values={})=>Object.assign(new Error(key),{values});
function setProgress({phase,done,total}){
const fraction=total>0?Math.min(1,done/total):0;
el.progressBar.style.width=`${(fraction * 100).toFixed(1)}%`;
if(phase==='preparing'){
el.progressLabel.textContent=phrase('step.preparing');
}else if(phase==='finishing'){
el.progressLabel.textContent=phrase('step.finishing');
}else{
el.progressLabel.textContent=phrase('step.frame',{
done:done.toLocaleString(),
total:total.toLocaleString(),
percent:Math.round(fraction*100),
});
}
}
function outputFilename(){
const base=(file?.name??'video').replace(/\.[^.]+$/,'');
return`${base}-timelapse.mp4`;
}
function formatBytes(bytes){
if(bytes<1024*1024)return phrase('size.kb',{n:(bytes/1024).toFixed(0)});
if(bytes<1024*1024*1024){
return phrase('size.mb',{n:(bytes/1024/1024).toFixed(1)});
}
return phrase('size.gb',{n:(bytes/1024/1024/1024).toFixed(2)});
}
function formatDuration(seconds){
const whole=Math.max(0,Math.round(seconds));
const hours=Math.floor(whole/3600);
const minutes=Math.floor((whole%3600)/60);
if(hours){
return phrase('time.hours',{hours,minutes:String(minutes).padStart(2,'0')});
}
if(minutes){
return phrase('time.minutes',
{minutes,seconds:String(whole%60).padStart(2,'0')});
}
return phrase('time.seconds',{n:seconds<10?seconds.toFixed(1):whole});
}
function formatInterval(seconds){
if(seconds<1)return phrase('unit.ms',{n:Math.round(seconds*1000)});
if(seconds<60){
return phrase('unit.s',
{n:seconds<10?seconds.toFixed(2):seconds.toFixed(1)});
}
return phrase('unit.min',{n:(seconds/60).toFixed(1)});
}
async function runExport(){
if(working||!file)return;
const plan=currentPlan();
if(plan.times.length<MIN_FRAMES)return;
clearError();
working=true;
abortController=new AbortController();
el.exportBtn.disabled=true;
el.cancelBtn.hidden=false;
el.progress.hidden=false;
el.result.hidden=true;
el.preview.pause();
setProgress({phase:'preparing',done:0,total:1});
let writer=null;
try{
const codec=await pickH264Codec({
width:plan.frame.width,
height:plan.frame.height,
framerate:plan.fps,
bitrate:plan.bitrate,
});
if(!codec){
throw said('encode.noh264',
{width:plan.frame.width,height:plan.frame.height});
}
writer=new TimelapseWriter({
width:plan.frame.width,
height:plan.frame.height,
fps:plan.fps,
bitrate:plan.bitrate,
codec,
});
writer.open();
const result=canReadDirectly
?await timelapseByDecoding({
file,media,times:plan.times,
width:plan.frame.width,height:plan.frame.height,
writer,onProgress:setProgress,signal:abortController.signal,
})
:await timelapseByPlaying({
video:el.preview,times:plan.times,
width:plan.frame.width,height:plan.frame.height,
writer,onProgress:setProgress,signal:abortController.signal,
});
if(lastResultUrl)URL.revokeObjectURL(lastResultUrl);
lastResultUrl=URL.createObjectURL(result.blob);
el.resultVideo.src=lastResultUrl;
el.download.href=lastResultUrl;
el.download.download=outputFilename();
el.resultInfo.textContent=[
phrase('size.plain',{width:plan.frame.width,height:plan.frame.height}),
phrase(result.frames===1?'n.frame.one':'n.frame.many',
{n:result.frames.toLocaleString()}),
formatDuration(result.frames/plan.fps),
formatBytes(result.blob.size),
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
writer?.close();
working=false;
abortController=null;
el.cancelBtn.hidden=true;
updateSummary();
}
}
el.exportBtn.addEventListener('click',runExport);
el.cancelBtn.addEventListener('click',()=>abortController?.abort());
window.addEventListener('beforeunload',(event)=>{
if(!working)return;
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
if(!hasEncoder()){
showError(phrase('nocodec.page'));
}
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
