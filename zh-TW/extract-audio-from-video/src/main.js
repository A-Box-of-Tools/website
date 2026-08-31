/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker}from'./shared/file-picker.js';
import{decodeAudio,UnreadableFile}from'./decode.js';
import{writeWav}from'./wav.js';
import{mixToMono}from'./mono.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
source:$('source'),
srcName:$('src-name'),
srcSize:$('src-size'),
srcLength:$('src-length'),
srcChannels:$('src-channels'),
srcRate:$('src-rate'),
rateNote:$('rate-note'),
takeCard:$('take-card'),
channels:$('channels'),
channelsNote:$('channels-note'),
status:$('status'),
error:$('error'),
result:$('result'),
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
let sound=null;
let sourceName='';
let downloadUrl=null;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){load(files[0]);},
});
async function load(file){
clearError();
clearResult();
picker.busy(phrase('step.reading'));
el.status.textContent=phrase('step.reading');
el.status.hidden=false;
try{
sound=await decodeAudio(file);
sourceName=file.name;
describeSource(file);
el.takeCard.removeAttribute('inert');
write();
}catch(error){
sound=null;
el.source.hidden=true;
el.takeCard.setAttribute('inert','');
showError(say(error));
if(!(error instanceof UnreadableFile))console.error(error);
}finally{
picker.done();
el.status.hidden=true;
}
}
function describeSource(file){
el.srcName.textContent=file.name;
el.srcSize.textContent=humanBytes(file.size);
el.srcLength.textContent=clock(sound.duration);
el.srcChannels.textContent=phrase(channelWord(sound.channels.length));
el.srcRate.textContent=phrase('rate.khz',{n:(sound.sampleRate/1000).toFixed(1)});
el.rateNote.hidden=!sound.guessedRate;
el.source.hidden=false;
}
const channelWord=(n)=>(n===1?'channels.mono':n===2?'channels.stereo':'channels.many');
el.channels.addEventListener('change',()=>{if(sound)write();});
function write(){
clearError();
try{
const channels=el.channels.value==='mono'?[mixToMono(sound.channels)]:sound.channels;
const blob=writeWav(channels,sound.sampleRate,{bits:16});
if(downloadUrl)URL.revokeObjectURL(downloadUrl);
downloadUrl=URL.createObjectURL(blob);
el.resultAudio.src=downloadUrl;
el.download.href=downloadUrl;
el.download.download=wavName(sourceName);
el.resultInfo.textContent=phrase('out.info',{
size:humanBytes(blob.size),
length:clock(sound.duration),
channels:phrase(channelWord(channels.length)),
rate:(sound.sampleRate/1000).toFixed(1),
});
el.result.hidden=false;
}catch(error){
showError(say(error));
console.error(error);
}
}
function wavName(name){
const stem=name.replace(/\.[^.]+$/,'')||'audio';
return`${stem}.wav`;
}
function clearResult(){
el.result.hidden=true;
el.resultAudio.removeAttribute('src');
if(downloadUrl)URL.revokeObjectURL(downloadUrl);
downloadUrl=null;
}
function say(error){
if(error instanceof UnreadableFile)return phrase(error.message);
return error?.message?phrase(error.message):String(error);
}
function showError(message){
el.error.textContent=message;
el.error.hidden=false;
}
function clearError(){
el.error.hidden=true;
el.error.textContent='';
}
function humanBytes(bytes){
if(bytes<1024)return phrase('size.bytes',{n:bytes});
if(bytes<1024*1024)return phrase('size.kb',{n:(bytes/1024).toFixed(1)});
return phrase('size.mb',{n:(bytes/(1024*1024)).toFixed(1)});
}
function clock(seconds){
const whole=Math.max(0,Math.round(seconds));
const s=String(whole%60).padStart(2,'0');
const m=Math.floor(whole/60)%60;
const h=Math.floor(whole/3600);
return h?`${h}:${String(m).padStart(2, '0')}:${s}`:`${m}:${s}`;
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
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
