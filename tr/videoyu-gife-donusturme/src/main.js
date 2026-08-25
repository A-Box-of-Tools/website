/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker}from'./shared/file-picker.js';
import{demux,UnsupportedFile}from'./demux.js';
import{framesByDecoding,framesByPlaying,decoderConfig}from'./frames.js';
import{encodeGif,ColorHistogram,MAX_COLORS}from'./encode.js';
import{RangeBar,formatTime,parseTime}from'./range.js';
import{frameTimes,frameDelays,outputSize,workingBytes,estimateBytes,MAX_FPS}from'./plan.js';
import{hasWebCodecs,canDecode}from'./support.js';
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
srcPath:$('src-path'),
pathNote:$('path-note'),
sectionCard:$('section-card'),
stage:$('stage'),
preview:$('preview'),
stageNote:$('stage-note'),
rangebar:$('rangebar'),
scaleEnd:$('scale-end'),
startTime:$('start-time'),
endTime:$('end-time'),
markIn:$('mark-in'),
markOut:$('mark-out'),
playSection:$('play-section'),
wholeClip:$('whole-clip'),
exportCard:$('export-card'),
width:$('width'),
customWidthField:$('custom-width-field'),
customWidth:$('custom-width'),
widthNote:$('width-note'),
fps:$('fps'),
dither:$('dither'),
loop:$('loop'),
sumSection:$('sum-section'),
sumSize:$('sum-size'),
sumFrames:$('sum-frames'),
sumBytes:$('sum-bytes'),
memoryNote:$('memory-note'),
exportBtn:$('export'),
cancelBtn:$('cancel'),
progressWrap:$('progress-wrap'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
error:$('error'),
result:$('result'),
resultImage:$('result-image'),
resultInfo:$('result-info'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
networkCount:$('network-count'),
networkDot:$('network-dot'),
offlineStatus:$('offline-status'),
offlineDot:$('offline-dot'),
};
const DEFAULT_SECTION=6;
const MEMORY_LIMIT=1_200<<20;
const PALETTE_SAMPLE=4_000_000;
let file=null;
let objectUrl=null;
let media=null;
let fallbackReason=null;
let source={width:0,height:0};
let duration=0;
let section={start:0,end:0};
let canRead=false;
let canPlay=false;
let exporting=false;
let abortController=null;
let lastResultUrl=null;
let loopingSection=false;
const bar=new RangeBar(el.rangebar,{
onSeek(seconds){
if(exporting)return;
loopingSection=false;
el.preview.currentTime=seconds;
},
onAdjust(next){
setSection(next.start,next.end);
},
});
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
if(exporting)return;
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
decodable=await canDecode(decoderConfig(media.video));
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
canRead=decodable;
canPlay=played.ok;
if(!canRead&&!canPlay){
showError('This browser cannot open this file: '
+`${fallbackReason ?? 'the format is not one it plays.'}`);
resetView();
return;
}
source=canRead
?{width:media.video.displayWidth,height:media.video.displayHeight}
:{width:played.width,height:played.height};
duration=played.duration||(media?media.duration:0);
showPreview(played.ok);
describeSource();
bar.setSource(duration);
el.scaleEnd.textContent=formatTime(duration);
setSection(0,Math.min(duration,DEFAULT_SECTION||duration));
chooseDefaultWidth();
el.sectionCard.hidden=false;
el.exportCard.hidden=false;
el.exportBtn.disabled=false;
updateSummary();
}catch(error){
console.error(error);
showError(error?.message||'That file could not be opened.');
resetView();
}finally{
picker.done();
}
}
function showPreview(playable){
el.stage.style.aspectRatio=`${source.width} / ${source.height}`;
el.stage.style.maxWidth=`calc(52vh * ${source.width / source.height})`;
el.preview.hidden=!playable;
el.stageNote.hidden=playable;
if(!playable){
el.stageNote.textContent='This browser will not play this file, so there is no preview. '
+'The frames are still read and converted - mark the section by its times below.';
}
}
function describeSource(){
el.source.hidden=false;
el.srcName.textContent=file.name;
el.srcSize.textContent=formatBytes(file.size);
el.srcFrame.textContent=`${source.width} x ${source.height}`;
el.srcLength.textContent=duration?formatTime(duration):'unknown';
if(media){
const turned=media.video.rotation?`, turned ${media.video.rotation} degrees`:'';
el.srcCodec.textContent=`${media.video.codec} (${media.video.entryType})${turned}`;
}else{
el.srcCodec.textContent="read by the browser's own player";
}
el.srcPath.textContent=canRead?'WebCodecs, frame by frame':'the player, one seek per frame';
el.pathNote.hidden=canRead;
if(!canRead){
el.pathNote.textContent='The frames for this one are collected by seeking the player to '
+`each instant, because ${fallbackReason ?? 'its layout is not one the reader here understands.'} `
+'That is slower, and the browser decides which frame each seek lands on, so a fast '
+'section can come out a frame out here and there.';
}
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
duration=0;
}
function resetView(){
el.source.hidden=true;
el.sectionCard.hidden=true;
el.exportCard.hidden=true;
el.pathNote.hidden=true;
releaseFile();
}
function setSection(start,end){
section={
start:Math.max(0,Math.min(start,duration)),
end:Math.max(0,Math.min(end,duration)),
};
if(section.end<section.start)section={start:section.end,end:section.start};
bar.setSelection(section.start,section.end);
el.startTime.value=formatTime(section.start);
el.endTime.value=formatTime(section.end);
updateSummary();
}
el.preview.addEventListener('timeupdate',()=>{
bar.setPlayhead(el.preview.currentTime);
if(loopingSection&&el.preview.currentTime>=section.end){
el.preview.pause();
el.preview.currentTime=section.start;
loopingSection=false;
}
});
el.preview.addEventListener('seeked',()=>bar.setPlayhead(el.preview.currentTime));
for(const[input,which]of[[el.startTime,'start'],[el.endTime,'end']]){
input.addEventListener('change',()=>{
const value=parseTime(input.value);
if(value===null){
input.value=formatTime(section[which]);
return;
}
setSection(
which==='start'?value:section.start,
which==='end'?value:section.end,
);
});
}
el.markIn.addEventListener('click',()=>setSection(el.preview.currentTime,section.end));
el.markOut.addEventListener('click',()=>setSection(section.start,el.preview.currentTime));
el.wholeClip.addEventListener('click',()=>setSection(0,duration));
el.playSection.addEventListener('click',()=>{
if(exporting||el.preview.hidden)return;
el.preview.currentTime=section.start;
loopingSection=true;
el.preview.play().catch(()=>{loopingSection=false;});
});
window.addEventListener('keydown',(event)=>{
if(exporting||el.sectionCard.hidden)return;
if(event.metaKey||event.ctrlKey||event.altKey)return;
const tag=document.activeElement?.tagName;
if(tag==='INPUT'||tag==='SELECT'||tag==='TEXTAREA')return;
if(event.key==='i'||event.key==='I'){
setSection(el.preview.currentTime,section.end);
}else if(event.key==='o'||event.key==='O'){
setSection(section.start,el.preview.currentTime);
}else{
return;
}
event.preventDefault();
});
function chooseDefaultWidth(){
const presets=[...el.width.options]
.map((option)=>Number(option.value))
.filter((value)=>Number.isFinite(value)&&value>0)
.sort((a,b)=>a-b);
const preferred=Number([...el.width.options].find((option)=>option.defaultSelected)?.value);
const aim=Math.min(preferred||presets[presets.length-1],source.width);
const fits=presets.filter((value)=>value<=aim);
el.width.value=fits.length?String(fits[fits.length-1]):'source';
el.customWidthField.hidden=true;
}
function chosenWidth(){
if(el.width.value==='source')return source.width||480;
if(el.width.value==='custom'){
return Math.max(16,Math.min(1920,Number(el.customWidth.value)||480));
}
return Number(el.width.value);
}
function plan(){
const size=outputSize(source.width,source.height,chosenWidth());
const fps=Math.min(MAX_FPS,Number(el.fps.value)||12);
const times=frameTimes({start:section.start,end:section.end,fps});
return{size,fps,times};
}
el.width.addEventListener('change',()=>{
el.customWidthField.hidden=el.width.value!=='custom';
if(el.width.value==='custom'&&source.width){
el.customWidth.value=String(Math.min(1920,source.width));
}
updateSummary();
});
for(const input of[el.customWidth,el.fps,el.dither,el.loop]){
input.addEventListener('change',updateSummary);
}
function updateSummary(){
if(!source.width)return;
const{size,times}=plan();
const span=Math.max(0,section.end-section.start);
el.sumSection.textContent=`${formatTime(section.start)} to ${formatTime(section.end)}`
+` (${span.toFixed(2)}s)`;
el.sumSize.textContent=`${size.width} x ${size.height}`
+` (from ${source.width} x ${source.height})`;
el.sumFrames.textContent=`${times.length.toLocaleString()}`;
const{low,high}=estimateBytes({frames:times.length,...size});
el.sumBytes.textContent=`${formatBytes(low)} to ${formatBytes(high)}`;
el.widthNote.hidden=size.width<=source.width;
el.widthNote.textContent=`That is wider than the video itself (${source.width} px), `
+'which cannot add detail that was never there - only bytes.';
const memory=workingBytes({frames:times.length,...size});
el.memoryNote.hidden=memory<(300<<20);
el.memoryNote.textContent=`Every frame is held in memory while the palette is chosen, `
+`which for these settings is about ${formatBytes(memory)}. `
+(memory>MEMORY_LIMIT
?'That is more than this tool will attempt - shorten the section, or drop the width or the frame rate.'
:'A shorter section, a smaller width or a lower frame rate all bring it down.');
el.exportBtn.disabled=exporting||memory>MEMORY_LIMIT||span<=0;
}
function showError(message){
el.error.textContent=message;
el.error.hidden=false;
}
function clearError(){
el.error.hidden=true;
el.error.textContent='';
}
function setProgress({phase,done,total}){
const share=phase==='reading'?0.65:0.35;
const base=phase==='reading'?0:0.65;
const fraction=total>0?base+share*Math.min(1,done/total):base;
el.progressBar.style.width=`${(fraction * 100).toFixed(1)}%`;
el.progressLabel.textContent=phase==='reading'
?`Reading frame ${done.toLocaleString()} of ${total.toLocaleString()}`
:`Writing frame ${done.toLocaleString()} of ${total.toLocaleString()}`;
}
function outputFilename(){
const base=(file?.name??'video').replace(/\.[^.]+$/,'');
return`${base}.gif`;
}
function formatBytes(bytes){
if(bytes<1024*1024)return`${(bytes / 1024).toFixed(0)} KB`;
if(bytes<1024*1024*1024)return`${(bytes / 1024 / 1024).toFixed(1)} MB`;
return`${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
async function runExport(){
if(exporting||!file)return;
const{size,fps,times}=plan();
if(!times.length){
showError('That section is too short to take a frame from.');
return;
}
if(workingBytes({frames:times.length,...size})>MEMORY_LIMIT){
showError('That would need more memory than this tool will ask a browser for. '
+'Shorten the section, or drop the width or the frame rate.');
return;
}
clearError();
exporting=true;
loopingSection=false;
abortController=new AbortController();
el.exportBtn.disabled=true;
el.cancelBtn.hidden=false;
el.progressWrap.hidden=false;
el.result.hidden=true;
bar.setEnabled(false);
el.preview.pause();
setProgress({phase:'reading',done:0,total:times.length});
const histogram=new ColorHistogram();
const step=Math.max(1,Math.ceil((times.length*size.width*size.height)/PALETTE_SAMPLE));
try{
const frames=canRead
?await framesByDecoding({
file,media,times,...size,histogram,step,
onProgress:setProgress,signal:abortController.signal,
})
:await framesByPlaying({
video:el.preview,times,...size,histogram,step,
onProgress:setProgress,signal:abortController.signal,
});
const delays=frameDelays(times,section.end);
const result=await encodeGif({
frames,
histogram,
delays,
...size,
colors:MAX_COLORS,
dither:el.dither.value==='on',
loop:el.loop.checked,
onProgress:setProgress,
signal:abortController.signal,
});
if(lastResultUrl)URL.revokeObjectURL(lastResultUrl);
lastResultUrl=URL.createObjectURL(result.blob);
el.resultImage.src=lastResultUrl;
el.download.href=lastResultUrl;
el.download.download=outputFilename();
el.resultInfo.textContent=[
`${size.width} x ${size.height}`,
`${result.written} frame${result.written === 1 ? '' : 's'}`
+(result.dropped?` (${result.dropped} identical, dropped)`:''),
`${fps} fps`,
`${result.colors} colours`,
formatBytes(result.blob.size),
].join(' · ');
el.result.hidden=false;
el.progressWrap.hidden=true;
el.result.scrollIntoView({behavior:'smooth',block:'nearest'});
}catch(error){
el.progressWrap.hidden=true;
if(error?.name!=='AbortError'){
showError(error?.message||'Something went wrong while making the GIF.');
console.error(error);
}
}finally{
exporting=false;
abortController=null;
el.cancelBtn.hidden=true;
bar.setEnabled(true);
updateSummary();
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
?`your video has gone nowhere. ${total} files loaded.${platformNote}`
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
