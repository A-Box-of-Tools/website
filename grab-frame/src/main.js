/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker}from'./shared/file-picker.js';
import{demux,UnsupportedFile}from'./demux.js';
import{FrameReader,decodeSeries,frameNear,seriesFrames}from'./frames.js';
import{drawUpright,frameCanvas}from'./draw.js';
import{FORMATS,clockTime,encodeStill,stillName}from'./still.js';
import{makeZip}from'./shared/zip.js';
import{hasWebCodecs,canDecode,encodableTypes}from'./support.js';
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
srcFrames:$('src-frames'),
pathNote:$('path-note'),
findCard:$('find-card'),
stage:$('stage'),
preview:$('preview'),
still:$('still'),
stageBusy:$('stage-busy'),
stepBack:$('step-back'),
play:$('play'),
stepOn:$('step-on'),
scrub:$('scrub'),
atTime:$('at-time'),
atFrame:$('at-frame'),
grabCard:$('grab-card'),
format:$('format'),
formatNote:$('format-note'),
qualityField:$('quality-field'),
quality:$('quality'),
qualityValue:$('quality-value'),
every:$('every'),
grab:$('grab'),
grabSeries:$('grab-series'),
cancel:$('cancel'),
progressWrap:$('progress-wrap'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
error:$('error'),
shotsCard:$('shots-card'),
shotsCount:$('shots-count'),
shots:$('shots'),
downloadAll:$('download-all'),
clear:$('clear'),
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
let reader=null;
let exact=false;
let playable=false;
let fallbackReason=null;
let source={width:0,height:0};
let duration=0;
let position=0;
let frameIndex=0;
let playing=false;
let working=false;
let abortController=null;
let wantedFrame=-1;
let shownFrame=-1;
let drawing=false;
let shots=[];
let nextShotId=1;
let formats=new Set(['image/png']);
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
async function loadFile(picked){
if(working)return;
clearError();
releaseFile();
file=picked;
picker.busy('Reading the file...');
try{
objectUrl=URL.createObjectURL(picked);
const played=await openInPlayer(el.preview,objectUrl);
try{
media=await demux(picked);
fallbackReason=null;
}catch(error){
media=null;
fallbackReason=error instanceof UnsupportedFile
?error.reason
:(error.message||'the file could not be read as an MP4.');
}
let decodable=false;
if(media&&hasWebCodecs()){
decodable=await canDecode({
codec:media.video.codec,
codedWidth:media.video.codedWidth,
codedHeight:media.video.codedHeight,
...(media.video.description?{description:media.video.description}:{}),
});
if(!decodable){
fallbackReason=`this browser will not decode ${media.video.codec} directly.`;
}
}else if(media&&!hasWebCodecs()){
fallbackReason='this browser has no WebCodecs, so frames cannot be decoded one by one.';
}
if(decodable&&played.ok
&&(played.width!==media.video.displayWidth||played.height!==media.video.displayHeight)){
decodable=false;
fallbackReason='this file is stored turned in a way the reader and the player disagree on.';
}
exact=decodable;
playable=played.ok;
if(!exact&&!playable){
showError(`This browser cannot open this file: ${fallbackReason ?? 'the format is not one it plays.'}`);
resetView();
return;
}
source=exact
?{width:media.video.displayWidth,height:media.video.displayHeight}
:{width:played.width,height:played.height};
duration=played.duration||(media?media.duration:0);
if(exact){
reader=new FrameReader(picked,media.video);
if(!duration)duration=reader.timeOf(reader.count-1);
}
layOutStage();
describeSource();
updateFormatNote();
setUpTransport();
el.findCard.hidden=false;
el.grabCard.hidden=false;
await goTo(0);
}catch(error){
console.error(error);
showError(error?.message||'That file could not be opened.');
resetView();
}finally{
picker.done();
}
}
function layOutStage(){
el.stage.style.aspectRatio=`${source.width} / ${source.height}`;
el.stage.style.maxWidth=`calc(62vh * ${source.width / source.height})`;
el.preview.hidden=exact;
el.still.hidden=!exact;
}
function describeSource(){
el.source.hidden=false;
el.srcName.textContent=file.name;
el.srcSize.textContent=formatBytes(file.size);
el.srcFrame.textContent=`${source.width} x ${source.height}`;
el.srcLength.textContent=duration?formatDuration(duration):'unknown';
if(exact){
const turned=media.video.rotation?`, turned ${media.video.rotation} degrees`:'';
el.srcCodec.textContent=`${media.video.codec} (${media.video.entryType})${turned}`;
el.srcFrames.textContent=`${reader.count.toLocaleString()} frames`;
}else{
el.srcCodec.textContent="read by the browser's own player";
el.srcFrames.textContent='not counted on this path';
}
el.pathNote.hidden=exact&&playable;
if(!exact){
el.pathNote.textContent='This file is read by the browser\'s own player rather than '
+`frame by frame, because ${fallbackReason ?? 'its layout is not one the reader here understands.'} `
+'The picture is still saved at the video\'s full size, but the frame you land on is the '
+'one the player chooses, and stepping moves by roughly a frame rather than exactly one.';
}else if(!playable){
el.pathNote.textContent='This browser will not play this file, so there is nothing to press '
+'play on - but it will decode it, which is what the stills are made from. Use the slider '
+'and the arrow keys to move through it.';
}
}
function releaseFile(){
if(objectUrl){
el.preview.removeAttribute('src');
el.preview.load();
URL.revokeObjectURL(objectUrl);
objectUrl=null;
}
reader?.release();
reader=null;
media=null;
file=null;
playing=false;
wantedFrame=-1;
shownFrame=-1;
}
function resetView(){
el.source.hidden=true;
el.findCard.hidden=true;
el.grabCard.hidden=true;
el.pathNote.hidden=true;
releaseFile();
}
function setUpTransport(){
if(exact){
el.scrub.min='0';
el.scrub.max=String(Math.max(0,reader.count-1));
el.scrub.step='1';
}else{
el.scrub.min='0';
el.scrub.max=String(Math.max(1,Math.round(duration*1000)));
el.scrub.step='1';
}
el.play.disabled=!playable;
el.play.title=playable?'Play or pause (space)':'This browser will not play this file';
}
async function goTo(seconds){
const clamped=Math.max(0,Math.min(seconds,duration||seconds));
if(exact){
await goToFrame(frameNear(reader.order,clamped));
}else{
position=clamped;
el.scrub.value=String(Math.round(clamped*1000));
updateReadout();
await seekPlayer(clamped);
}
}
async function goToFrame(index){
if(!exact)return;
frameIndex=Math.max(0,Math.min(index,reader.count-1));
position=reader.timeOf(frameIndex);
el.scrub.value=String(frameIndex);
updateReadout();
await showFrame(frameIndex);
showStill();
}
function showStill(){
if(!exact)return;
el.still.hidden=false;
el.preview.hidden=true;
}
function updateReadout(){
el.atTime.textContent=clockTime(position);
el.atFrame.textContent=exact
?`frame ${(frameIndex + 1).toLocaleString()} of ${reader.count.toLocaleString()}`
:'frame times are not read on this path';
}
async function showFrame(index){
wantedFrame=index;
if(drawing)return;
drawing=true;
try{
while(wantedFrame!==shownFrame){
const target=wantedFrame;
const slow=setTimeout(()=>{el.stageBusy.hidden=false;},120);
try{
const bitmap=await reader.frameAt(target);
if(wantedFrame!==target)continue;
paintStage(bitmap);
shownFrame=target;
}finally{
clearTimeout(slow);
el.stageBusy.hidden=true;
}
}
}catch(error){
if(error?.name!=='AbortError')showError(error?.message||'That frame could not be decoded.');
}finally{
drawing=false;
}
}
function paintStage(bitmap){
const width=Math.max(2,Math.min(source.width,Math.round(el.stage.clientWidth||960)));
const scale=width/source.width;
el.still.width=width;
el.still.height=Math.max(2,Math.round(source.height*scale));
drawUpright(el.still.getContext('2d',{alpha:false}),bitmap,{
rotation:media.video.rotation,
displayWidth:source.width,
displayHeight:source.height,
scale,
});
}
function seekPlayer(seconds){
if(!playable)return Promise.resolve();
return new Promise((resolve)=>{
if(Math.abs(el.preview.currentTime-seconds)<0.001&&el.preview.readyState>=2){
resolve();
return;
}
const done=()=>{
clearTimeout(timer);
el.preview.removeEventListener('seeked',done);
resolve();
};
const timer=setTimeout(done,4000);
el.preview.addEventListener('seeked',done,{once:true});
el.preview.currentTime=seconds;
});
}
function step(by){
if(playing)pause();
if(exact){
goToFrame(frameIndex+by);
}else{
goTo(position+by/30);
}
}
function play(){
if(!playable||playing)return;
playing=true;
el.play.textContent='⏸';
el.play.setAttribute('aria-label','Pause');
el.preview.hidden=false;
el.still.hidden=true;
el.preview.currentTime=position;
el.preview.play().catch(()=>pause());
follow();
}
function pause(){
if(!playing)return;
playing=false;
el.play.textContent='▶';
el.play.setAttribute('aria-label','Play');
el.preview.pause();
goTo(el.preview.currentTime);
}
function follow(){
if(!playing)return;
position=el.preview.currentTime;
if(exact){
frameIndex=frameNear(reader.order,position);
el.scrub.value=String(frameIndex);
}else{
el.scrub.value=String(Math.round(position*1000));
}
updateReadout();
requestAnimationFrame(follow);
}
el.play.addEventListener('click',()=>(playing?pause():play()));
el.preview.addEventListener('pause',()=>pause());
el.preview.addEventListener('ended',()=>pause());
el.stepBack.addEventListener('click',()=>step(-1));
el.stepOn.addEventListener('click',()=>step(1));
el.scrub.addEventListener('input',()=>{
if(playing)pause();
const value=Number(el.scrub.value);
if(exact)goToFrame(value);
else goTo(value/1000);
});
document.addEventListener('keydown',(event)=>{
if(el.findCard.hidden||event.ctrlKey||event.metaKey||event.altKey)return;
const tag=event.target?.tagName;
if(tag==='INPUT'||tag==='SELECT'||tag==='TEXTAREA')return;
if(event.key==='ArrowLeft')step(event.shiftKey?-10:-1);
else if(event.key==='ArrowRight')step(event.shiftKey?10:1);
else if(event.key===' '&&tag!=='BUTTON'&&tag!=='A'){
if(!playable)return;
if(playing)pause();
else play();
}else return;
event.preventDefault();
});
function currentType(){
const type=el.format.value;
return formats.has(type)?type:'image/png';
}
function updateFormatNote(){
const type=currentType();
el.qualityField.hidden=type==='image/png';
el.formatNote.textContent=type==='image/png'
?`Lossless: the still holds exactly the pixels the frame decoded to, at ${source.width || '?'} x ${source.height || '?'}.`
:'Compressed again on top of the video\'s own compression. Fine for a preview, '
+'not for anything that will be edited further.';
}
el.format.addEventListener('change',updateFormatNote);
el.quality.addEventListener('input',()=>{
el.qualityValue.textContent=el.quality.value;
});
el.every.addEventListener('change',updateSeriesButton);
el.every.addEventListener('input',updateSeriesButton);
function updateSeriesButton(){
const every=Number(el.every.value);
el.grabSeries.textContent=every>0
?`Grab one every ${every % 1 ? every.toFixed(1) : every} seconds`
:'Grab a series';
}
function addShot({blob,time,width,height,type}){
const shot={
id:nextShotId++,
blob,
time,
width,
height,
type,
name:stillName(file?.name,time,type),
url:URL.createObjectURL(blob),
};
shots.push(shot);
renderShots();
return shot;
}
function renderShots(){
el.shotsCard.hidden=shots.length===0;
el.shotsCount.textContent=shots.length===1
?'1 still, held in this page only'
:`${shots.length} stills, held in this page only`;
el.shots.replaceChildren(...shots.map((shot)=>{
const item=document.createElement('li');
item.className='shot';
const image=document.createElement('img');
image.src=shot.url;
image.alt=`The frame at ${clockTime(shot.time)}`;
image.loading='lazy';
const body=document.createElement('div');
body.className='shot-body';
const when=document.createElement('span');
when.className='shot-time';
when.textContent=clockTime(shot.time);
const meta=document.createElement('span');
meta.className='shot-meta';
meta.textContent=`${FORMATS[shot.type]?.label ?? 'PNG'} · ${shot.width} x ${shot.height} · ${formatBytes(shot.blob.size)}`;
body.append(when,meta);
const actions=document.createElement('div');
actions.className='shot-actions';
const save=document.createElement('a');
save.className='as-button';
save.href=shot.url;
save.download=shot.name;
save.textContent='Save';
const remove=document.createElement('button');
remove.type='button';
remove.className='ghost danger';
remove.textContent='Remove';
remove.addEventListener('click',()=>removeShot(shot.id));
actions.append(save,remove);
item.append(image,body,actions);
return item;
}));
}
function removeShot(id){
const shot=shots.find((other)=>other.id===id);
if(shot)URL.revokeObjectURL(shot.url);
shots=shots.filter((other)=>other.id!==id);
renderShots();
}
function clearShots(){
for(const shot of shots)URL.revokeObjectURL(shot.url);
shots=[];
renderShots();
}
el.clear.addEventListener('click',clearShots);
el.downloadAll.addEventListener('click',async()=>{
if(!shots.length||working)return;
setWorking(true);
el.progressWrap.hidden=false;
setProgress({done:0,total:shots.length,label:'Packing...'});
try{
const used=new Set();
const files=[];
let done=0;
for(const shot of shots){
let name=shot.name;
for(let n=2;used.has(name);n++){
name=shot.name.replace(/(\.[^.]+)$/,`-${n}$1`);
}
used.add(name);
files.push({name,data:new Uint8Array(await shot.blob.arrayBuffer())});
setProgress({done:++done,total:shots.length,label:'Packing...'});
}
const base=(file?.name??'video').replace(/\.[^.]+$/,'');
saveBlob(makeZip(files),`${base}-stills.zip`);
}catch(error){
showError(error?.message||'That archive could not be built.');
}finally{
setWorking(false);
el.progressWrap.hidden=true;
}
});
function saveBlob(blob,name){
const url=URL.createObjectURL(blob);
const link=document.createElement('a');
link.href=url;
link.download=name;
link.click();
setTimeout(()=>URL.revokeObjectURL(url),60_000);
}
async function currentCanvas(){
if(exact){
const bitmap=await reader.frameAt(frameIndex);
return frameCanvas(bitmap,{
rotation:media.video.rotation,
displayWidth:source.width,
displayHeight:source.height,
});
}
await seekPlayer(position);
return frameCanvas(el.preview,{
rotation:0,
displayWidth:source.width,
displayHeight:source.height,
});
}
function encodeOptions(){
return{type:currentType(),quality:Number(el.quality.value)/100};
}
el.grab.addEventListener('click',async()=>{
if(working||!file)return;
if(playing)pause();
clearError();
setWorking(true);
try{
const canvas=await currentCanvas();
const options=encodeOptions();
const blob=await encodeStill(canvas,options);
const shot=addShot({
blob,
time:position,
width:canvas.width,
height:canvas.height,
type:options.type,
});
el.shotsCard.scrollIntoView({behavior:'smooth',block:'nearest'});
el.grab.title=`Last saved: ${shot.name}`;
}catch(error){
showError(error?.message||'That frame could not be saved.');
console.error(error);
}finally{
setWorking(false);
}
});
el.grabSeries.addEventListener('click',async()=>{
if(working||!file)return;
if(playing)pause();
const every=Number(el.every.value);
if(!(every>0)){
showError('Set an interval of more than zero seconds.');
return;
}
clearError();
setWorking(true);
abortController=new AbortController();
el.cancel.hidden=false;
el.progressWrap.hidden=false;
const options=encodeOptions();
const{signal}=abortController;
try{
if(exact){
const indexes=seriesFrames(reader.order,{every});
if(!indexes.length)throw new Error('That interval picks out no frames.');
setProgress({done:0,total:indexes.length,label:'Grabbing'});
await decodeSeries({
file,
video:media.video,
indexes,
signal,
onProgress:({done,total})=>setProgress({done,total,label:'Grabbing'}),
async onFrame(index,canvas){
const blob=await encodeStill(canvas,options);
addShot({
blob,
time:reader.timeOf(index),
width:canvas.width,
height:canvas.height,
type:options.type,
});
},
});
}else{
const times=[];
for(let at=0;at<=duration&&times.length<500;at+=every)times.push(at);
setProgress({done:0,total:times.length,label:'Grabbing'});
for(const[n,at]of times.entries()){
if(signal.aborted)break;
await goTo(at);
const canvas=await currentCanvas();
const blob=await encodeStill(canvas,options);
addShot({
blob,
time:el.preview.currentTime||at,
width:canvas.width,
height:canvas.height,
type:options.type,
});
setProgress({done:n+1,total:times.length,label:'Grabbing'});
}
}
el.shotsCard.scrollIntoView({behavior:'smooth',block:'nearest'});
}catch(error){
if(error?.name!=='AbortError'){
showError(error?.message||'Something went wrong while grabbing the series.');
console.error(error);
}
}finally{
abortController=null;
el.cancel.hidden=true;
el.progressWrap.hidden=true;
setWorking(false);
}
});
el.cancel.addEventListener('click',()=>abortController?.abort());
function setWorking(state){
working=state;
el.grab.disabled=state;
el.grabSeries.disabled=state;
el.downloadAll.disabled=state;
}
function setProgress({done,total,label}){
const fraction=total>0?Math.min(1,done/total):0;
el.progressBar.style.width=`${(fraction * 100).toFixed(1)}%`;
el.progressLabel.textContent=`${label} ${done.toLocaleString()} of ${total.toLocaleString()}`
+` (${Math.round(fraction * 100)}%)`;
}
function showError(message){
el.error.textContent=message;
el.error.hidden=false;
}
function clearError(){
el.error.hidden=true;
el.error.textContent='';
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
async function offerFormats(){
formats=await encodableTypes();
for(const option of el.format.options){
option.disabled=!formats.has(option.value);
}
if(!formats.has(el.format.value))el.format.value='image/png';
updateFormatNote();
}
updateSeriesButton();
updateFormatNote();
offerFormats();
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
