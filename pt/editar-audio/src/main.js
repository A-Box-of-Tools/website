/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker}from'./shared/file-picker.js';
import{decodeAudio,UnreadableFile}from'./decode.js';
import{render,lengthAfter}from'./edit.js';
import{peak,dbToGain,gainToDb,normalizeGain}from'./effects.js';
import{writeWav,wavSize}from'./wav.js';
import{drawWaveform}from'./waveform.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
source:$('source'),
srcName:$('src-name'),
srcSize:$('src-size'),
srcLength:$('src-length'),
srcFormat:$('src-format'),
srcPeak:$('src-peak'),
srcRate:$('src-rate'),
srcWaveWrap:$('src-wave-wrap'),
srcWave:$('src-wave'),
preview:$('preview'),
pathNote:$('path-note'),
editCard:$('edit-card'),
reverse:$('reverse'),
speed:$('speed'),
speedValue:$('speed-value'),
speedNote:$('speed-note'),
volume:$('volume'),
volumeValue:$('volume-value'),
volumeNote:$('volume-note'),
sumLength:$('sum-length'),
sumSpeed:$('sum-speed'),
sumPeak:$('sum-peak'),
sumSize:$('sum-size'),
clipNote:$('clip-note'),
exportCard:$('export-card'),
depth:$('depth'),
exportBtn:$('export'),
cancelBtn:$('cancel'),
progressWrap:$('progress-wrap'),
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
networkCount:$('network-count'),
networkDot:$('network-dot'),
offlineStatus:$('offline-status'),
offlineDot:$('offline-dot'),
};
let file=null;
let source=null;
let sourcePeak=0;
let previewUrl=null;
let resultUrl=null;
let lastEdited=null;
let exporting=false;
let abortController=null;
let speed=1;
const SPEED_LIMITS={min:0.25,max:4};
const NORMALIZE_TARGET=-1;
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
picker.busy('Reading the sound...');
try{
const decoded=await decodeAudio(picked);
file=picked;
source=decoded;
sourcePeak=peak(decoded.channels);
showSource();
el.editCard.hidden=false;
el.exportCard.hidden=false;
updateSummary();
}catch(error){
if(error instanceof UnreadableFile)showError(error.message);
else{
showError(`That file could not be read: ${error?.message ?? error}`);
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
el.srcFormat.textContent=`${channelWord(source.channels.length)}, `
+`${(source.sampleRate / 1000).toFixed(1)} kHz`;
el.srcPeak.textContent=formatPeak(sourcePeak);
el.srcRate.textContent=source.guessedRate
?`${source.sampleRate} Hz (assumed)`
:`${source.sampleRate} Hz (from the file)`;
el.source.hidden=false;
el.pathNote.hidden=!source.guessedRate;
if(source.guessedRate){
el.pathNote.textContent='This format does not say what rate it was recorded '
+'at in a header this tool reads, so it was decoded at 48 kHz. If the '
+'recording was made at some other rate, the browser resampled it on the '
+'way in - which is the one thing here that is not exact.';
}
if(previewUrl)URL.revokeObjectURL(previewUrl);
previewUrl=URL.createObjectURL(file);
el.preview.src=previewUrl;
el.srcWaveWrap.hidden=false;
drawWaveform(el.srcWave,source.channels);
}
function settings(){
return{
reverse:el.reverse.checked,
speed,
keepPitch:pickedValue('pitch')==='keep',
volume:{
mode:pickedValue('level'),
db:pickedValue('level')==='normalize'?NORMALIZE_TARGET:Number(el.volume.value),
},
};
}
const pickedValue=(name)=>document.querySelector(`input[name="${name}"]:checked`).value;
function setSpeed(wanted){
speed=clamp(Math.round(wanted*100)/100,SPEED_LIMITS.min,SPEED_LIMITS.max);
el.speed.value=String(Math.log2(speed));
el.speedValue.value=formatSpeed(speed);
updateSummary();
}
function setVolume(db){
el.volume.value=String(clamp(db,-24,24));
el.volumeValue.value=formatDb(Number(el.volume.value));
updateSummary();
}
el.speed.addEventListener('input',()=>setSpeed(2**Number(el.speed.value)));
el.speedValue.addEventListener('change',()=>{
const typed=Number(el.speedValue.value.replace(/[^0-9.]/g,''));
setSpeed(Number.isFinite(typed)&&typed>0?typed:speed);
});
el.volume.addEventListener('input',()=>{
el.volumeValue.value=formatDb(Number(el.volume.value));
updateSummary();
});
el.volumeValue.addEventListener('change',()=>{
const cleaned=el.volumeValue.value.replace(/[^0-9.+-]/g,'');
const typed=Number(cleaned);
setVolume(cleaned&&Number.isFinite(typed)?typed:Number(el.volume.value));
});
for(const button of document.querySelectorAll('.presets button')){
button.addEventListener('click',()=>setSpeed(Number(button.dataset.speed)));
}
for(const input of document.querySelectorAll('input[name="pitch"], input[name="level"]')){
input.addEventListener('change',updateSummary);
}
el.reverse.addEventListener('change',updateSummary);
el.depth.addEventListener('change',updateSummary);
function updateSummary(){
if(!source)return;
const chosen=settings();
const frames=lengthAfter(source.frames,chosen.speed,chosen.keepPitch);
const bits=Number(el.depth.value);
el.sumLength.textContent=formatDuration(frames/source.sampleRate);
el.sumSpeed.textContent=chosen.speed===1
?'unchanged'
:`${formatSpeed(chosen.speed)}, ${chosen.keepPitch ? 'same pitch' : `pitch ${chosen.speed > 1 ? 'up' : 'down'}`}`;
const gain=chosen.volume.mode==='normalize'
?normalizeGain(sourcePeak,NORMALIZE_TARGET)
:dbToGain(chosen.volume.db);
const after=sourcePeak*gain;
el.sumPeak.textContent=formatPeak(after);
el.sumSize.textContent=formatBytes(wavSize(frames,source.channels.length,bits));
el.speedNote.textContent=speedNote(chosen);
el.volumeNote.textContent=volumeNote(chosen,gain,after);
const clips=after>1.0001;
el.clipNote.hidden=!clips;
if(clips){
el.clipNote.textContent=`At this setting the loudest moment lands `
+`${gainToDb(after).toFixed(1)} dB above full scale. `
+(bits===32
?'A 32-bit float WAV will hold those samples, so nothing is lost in the '
+'file itself - but anything playing it has to bring the level back '
+'down, and most things will flatten it at the ceiling instead. Turn '
+'it down, or choose "as loud as it will go".'
:'A 16-bit WAV cannot hold that, so those samples would be flattened at '
+'the ceiling, which is what distortion sounds like. Turn it down, '
+'choose "as loud as it will go", or write 32-bit float, which keeps '
+'them.');
}
}
function speedNote(chosen){
if(chosen.speed===1)return'Left alone at 1x.';
const direction=chosen.speed>1?'faster':'slower';
return chosen.keepPitch
?`${formatSpeed(chosen.speed)} ${direction}, with the pitch held where it is. `
+'The recording is cut into overlapping windows and laid back down closer '
+'together or further apart, which is done here rather than sent anywhere.'
:`${formatSpeed(chosen.speed)} ${direction}, and everything moves with it: `
+`${Math.abs(12 * Math.log2(chosen.speed)).toFixed(1)} semitones `
+`${chosen.speed > 1 ? 'up' : 'down'}, the way playing a tape at the wrong `
+'speed does.';
}
function volumeNote(chosen,gain,after){
if(chosen.volume.mode==='normalize'){
const change=gainToDb(gain);
if(Math.abs(change)<0.05)return'Already exactly where this setting would put it.';
return`${change > 0 ? 'Raised' : 'Lowered'} by ${Math.abs(change).toFixed(1)} dB, `
+`which puts the loudest moment in the recording just under full scale.`;
}
if(chosen.volume.db===0)return'Left exactly as it is.';
return`${chosen.volume.db > 0 ? 'Up' : 'Down'} `
+`${Math.abs(chosen.volume.db).toFixed(1)} dB, which multiplies every sample `
+`by ${gain.toFixed(3)} and takes the loudest moment to ${formatPeak(after)}.`;
}
async function runExport(){
if(!source||exporting)return;
clearError();
clearResult();
exporting=true;
abortController=new AbortController();
el.exportBtn.disabled=true;
el.cancelBtn.hidden=false;
el.progressWrap.hidden=false;
progress(0,'Starting...');
const chosen=settings();
const bits=Number(el.depth.value);
try{
const started=performance.now();
const edited=await render(source,chosen,{
signal:abortController.signal,
onProgress:(done,label)=>progress(done,label),
});
const blob=writeWav(edited.channels,source.sampleRate,{bits});
const seconds=edited.channels[0].length/source.sampleRate;
resultUrl=URL.createObjectURL(blob);
el.resultAudio.src=resultUrl;
el.download.href=resultUrl;
el.download.download=outputName(file.name,chosen);
el.result.hidden=false;
lastEdited=edited.channels;
drawWaveform(el.outWave,lastEdited);
el.resultInfo.textContent=[
`WAV, ${bits === 32 ? '32-bit float' : '16-bit'}`,
formatDuration(seconds),
formatBytes(blob.size),
`peak ${formatPeak(edited.peak)}`,
edited.clipped?`${edited.clipped.toLocaleString()} samples over full scale`:null,
`${((performance.now() - started) / 1000).toFixed(1)}s`,
].filter(Boolean).join(' · ');
el.progressWrap.hidden=true;
el.result.scrollIntoView({behavior:'smooth',block:'nearest'});
}catch(error){
el.progressWrap.hidden=true;
if(error?.name!=='AbortError'){
showError(error?.message||'Something went wrong while editing the audio.');
console.error(error);
}
}finally{
exporting=false;
abortController=null;
el.cancelBtn.hidden=true;
el.exportBtn.disabled=false;
}
}
function outputName(name,chosen){
const base=name.replace(/\.[^.]+$/,'')||'audio';
const parts=[];
if(chosen.reverse)parts.push('reversed');
if(chosen.speed!==1)parts.push(`${formatSpeed(chosen.speed).replace('.', '-')}`);
if(chosen.volume.mode==='normalize')parts.push('normalised');
else if(chosen.volume.db)parts.push(`${chosen.volume.db > 0 ? 'up' : 'down'}${Math.abs(chosen.volume.db)}db`);
if(!parts.length)parts.push('edited');
return`${base}-${parts.join('-')}.wav`;
}
function progress(done,label){
el.progressBar.style.width=`${Math.round(done * 100)}%`;
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
if(source)drawWaveform(el.srcWave,source.channels);
if(lastEdited)drawWaveform(el.outWave,lastEdited);
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
lastEdited=null;
}
const clamp=(value,low,high)=>Math.min(high,Math.max(low,value));
const channelWord=(count)=>(
count===1?'mono':count===2?'stereo':`${count} channels`);
function formatSpeed(value){
const shown=value>=10?value.toFixed(1):value.toFixed(2);
return`${shown.replace(/\.?0+$/, '')}x`;
}
const formatDb=(db)=>`${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;
function formatPeak(value){
if(!(value>0))return'silence';
return`${gainToDb(value).toFixed(1)} dBFS`;
}
function formatDuration(seconds){
if(!Number.isFinite(seconds))return'-';
const whole=Math.floor(seconds);
const hours=Math.floor(whole/3600);
const minutes=Math.floor((whole%3600)/60);
const rest=seconds-hours*3600-minutes*60;
const shown=rest.toFixed(1).padStart(4,'0');
return hours?`${hours}:${String(minutes).padStart(2, '0')}:${shown}`:`${minutes}:${shown}`;
}
function formatBytes(bytes){
if(bytes<1024)return`${bytes} B`;
if(bytes<1024*1024)return`${(bytes / 1024).toFixed(1)} KB`;
if(bytes<1024*1024*1024)return`${(bytes / (1024 * 1024)).toFixed(1)} MB`;
return`${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
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
?`your audio has gone nowhere. ${total} files loaded.${platformNote}`
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
setSpeed(1);
setVolume(0);
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
