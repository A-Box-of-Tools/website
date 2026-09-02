/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker}from'./shared/file-picker.js';
import{demux,UnsupportedFile}from'./shared/mp4-reader.js';
import{FrameReader,decodeSeries,frameNear,seriesFrames}from'./frames.js';
import{drawUpright,frameCanvas}from'./draw.js';
import{FORMATS,clockTime,encodeStill,stillName}from'./still.js';
import{makeZip}from'./shared/zip.js';
import{hasWebCodecs,canDecode,encodableTypes}from'./support.js';
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
progress:$('progress'),
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
decodable=await canDecode({
codec:media.video.codec,
codedWidth:media.video.codedWidth,
codedHeight:media.video.codedHeight,
...(media.video.description?{description:media.video.description}:{}),
});
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
exact=decodable;
playable=played.ok;
if(!exact&&!playable){
showError(phrase('open.failed',{reason:why(fallbackReason,'read.notplayed')}));
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
await goTo(0);
}catch(error){
console.error(error);
showError(error?.message
?phrase(error.message,fill(error.values)):phrase('open.notopened'));
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
el.srcFrame.textContent=phrase('size.plain',
{width:source.width,height:source.height});
el.srcLength.textContent=duration?formatDuration(duration):phrase('len.unknown');
if(exact){
el.srcCodec.textContent=media.video.rotation
?phrase('src.codec.turned',{
codec:media.video.codec,
entry:media.video.entryType,
degrees:media.video.rotation,
})
:phrase('src.codec',{codec:media.video.codec,entry:media.video.entryType});
el.srcFrames.textContent=phrase(reader.count===1?'n.frame.one':'n.frame.many',
{n:reader.count.toLocaleString()});
}else{
el.srcCodec.textContent=phrase('src.byplayer');
el.srcFrames.textContent=phrase('src.uncounted');
}
el.pathNote.hidden=exact&&playable;
if(!exact){
el.pathNote.textContent=phrase('path.player',{
reason:why(fallbackReason,'read.layout'),
});
}else if(!playable){
el.pathNote.textContent=phrase('path.nopreview');
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
el.play.title=phrase(playable?'play.title':'play.cannot');
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
?phrase('at.frame',{
n:(frameIndex+1).toLocaleString(),
total:reader.count.toLocaleString(),
})
:phrase('at.notread');
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
if(error?.name!=='AbortError'){
showError(error?.message
?phrase(error.message,fill(error.values)):phrase('decode.nodecode'));
}
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
el.play.setAttribute('aria-label',phrase('play.pause'));
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
el.play.setAttribute('aria-label',phrase('play.play'));
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
?phrase('note.png',{width:source.width||'?',height:source.height||'?'})
:phrase('note.lossy');
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
?phrase(every===1?'series.every.one':'series.every.many',
{n:every%1?every.toFixed(1):every})
:phrase('series.any');
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
el.shotsCount.textContent=phrase(
shots.length===1?'n.still.one':'n.still.many',
{n:shots.length},
);
el.shots.replaceChildren(...shots.map((shot)=>{
const item=document.createElement('li');
item.className='shot';
const image=document.createElement('img');
image.src=shot.url;
image.alt=phrase('shot.alt',{time:clockTime(shot.time)});
image.loading='lazy';
const body=document.createElement('div');
body.className='shot-body';
const when=document.createElement('span');
when.className='shot-time';
when.textContent=clockTime(shot.time);
const meta=document.createElement('span');
meta.className='shot-meta';
meta.textContent=[
FORMATS[shot.type]?.label??'PNG',
phrase('size.plain',{width:shot.width,height:shot.height}),
formatBytes(shot.blob.size),
].reduce((a,b)=>phrase('join.dot',{a,b}));
body.append(when,meta);
const actions=document.createElement('div');
actions.className='shot-actions';
const save=document.createElement('a');
save.className='as-button';
save.href=shot.url;
save.download=shot.name;
save.textContent=phrase('shot.save');
const remove=document.createElement('button');
remove.type='button';
remove.className='ghost danger';
remove.textContent=phrase('shot.remove');
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
el.progress.hidden=false;
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
setProgress({done:++done,total:shots.length,step:'step.packing'});
}
const base=(file?.name??'video').replace(/\.[^.]+$/,'');
saveBlob(makeZip(files),`${base}-stills.zip`);
}catch(error){
showError(error?.message?phrase(error.message,fill(error.values))
:phrase('zip.failed'));
}finally{
setWorking(false);
el.progress.hidden=true;
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
el.grab.title=phrase('grab.last',{name:shot.name});
}catch(error){
showError(error?.message?phrase(error.message,fill(error.values))
:phrase('save.failed'));
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
showError(phrase('series.nointerval'));
return;
}
clearError();
setWorking(true);
abortController=new AbortController();
el.cancel.hidden=false;
el.progress.hidden=false;
const options=encodeOptions();
const{signal}=abortController;
try{
if(exact){
const indexes=seriesFrames(reader.order,{every});
if(!indexes.length)throw new Error('series.noframes');
setProgress({done:0,total:indexes.length,step:'step.grabbing'});
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
showError(error?.message?phrase(error.message,fill(error.values))
:phrase('series.failed'));
console.error(error);
}
}finally{
abortController=null;
el.cancel.hidden=true;
el.progress.hidden=true;
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
function setProgress({done,total,step}){
const fraction=total>0?Math.min(1,done/total):0;
el.progressBar.style.width=`${(fraction * 100).toFixed(1)}%`;
el.progressLabel.textContent=phrase(step,{
done:done.toLocaleString(),
total:total.toLocaleString(),
percent:Math.round(fraction*100),
});
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
function formatBytes(bytes){
if(bytes<1024*1024)return phrase('size.kb',{n:(bytes/1024).toFixed(0)});
if(bytes<1024*1024*1024){
return phrase('size.mb',{n:(bytes/1024/1024).toFixed(1)});
}
return phrase('size.gb',{n:(bytes/1024/1024/1024).toFixed(2)});
}
function formatDuration(seconds){
const whole=Math.max(0,Math.round(seconds));
const minutes=Math.floor(whole/60);
return minutes
?phrase('time.minutes',{minutes,seconds:String(whole%60).padStart(2,'0')})
:phrase('time.seconds',{n:seconds<10?seconds.toFixed(1):whole});
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
document.getElementById('boot-warning')?.remove();
