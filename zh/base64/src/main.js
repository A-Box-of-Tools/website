/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker}from'./shared/file-picker.js';
import{CODECS,codecById,CodecError}from'./encode.js';
import{SAMPLES}from'./samples.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
input:$('input'),
inputCount:$('input-count'),
codec:$('codec'),
codecNote:$('codec-note'),
sample:$('sample'),
clear:$('clear'),
error:$('error'),
output:$('output'),
resultNote:$('result-note'),
copy:$('copy'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
networkCount:$('network-count'),
networkDot:$('network-dot'),
offlineStatus:$('offline-status'),
offlineDot:$('offline-dot'),
};
let result=null;
let downloadUrl=null;
for(const codec of CODECS){
el.codec.append(new Option(phrase(codec.name),codec.id));
}
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){loadFiles(files);},
});
async function loadFiles(files){
picker.busy(phrase('step.reading'));
try{
el.input.value=await files[0].text();
updateCounts();
run();
}catch(error){
showError(phrase('read.failed',{why:error?.message??error}));
}finally{
picker.done();
}
}
let timer=null;
function schedule(){
clearTimeout(timer);
const size=el.input.value.length;
timer=setTimeout(run,size>200000?500:120);
}
el.input.addEventListener('input',()=>{updateCounts();schedule();});
el.codec.addEventListener('change',run);
for(const radio of document.querySelectorAll('input[name="direction"]')){
radio.addEventListener('change',run);
}
el.clear.addEventListener('click',()=>{
el.input.value='';
updateCounts();
run();
el.input.focus();
});
el.sample.addEventListener('click',()=>{
el.input.value=phrase(SAMPLES.encode.a);
updateCounts();
run();
});
function updateCounts(){
el.inputCount.textContent=describe(el.input.value);
}
function describe(text){
if(text==='')return phrase('count.empty');
const lines=text.split('\n').length;
return[
phrase(lines===1?'n.line.one':'n.line.many',{n:lines.toLocaleString()}),
phrase(text.length===1?'n.character.one':'n.character.many',
{n:text.length.toLocaleString()}),
humanBytes(byteLength(text)),
].reduce((a,b)=>phrase('join.comma',{a,b}));
}
const byteLength=(text)=>new TextEncoder().encode(text).length;
function run(){
clearError();
clearResult();
el.codecNote.textContent=phrase(codecById(el.codec.value).note);
const text=el.input.value;
if(text.trim()===''){
el.resultNote.textContent=phrase('result.nothing');
return;
}
try{
runEncode(text);
}catch(error){
showError(phrase(error?.message??String(error),error?.values));
if(error?.name!=='CodecError')console.error(error);
}
}
function runEncode(text){
const codec=codecById(el.codec.value);
const decoding=pickedDirection()==='decode';
let out;
try{
out=decoding?codec.decode(text):codec.encode(text);
}catch(error){
if(error?.name==='TypeError'){
throw new CodecError('utf8.notext');
}
throw error;
}
show(out,phrase(decoding?'out.decoded':'out.encoded',{
name:phrase(codec.name),
in:humanBytes(byteLength(text)),
out:humanBytes(byteLength(out)),
}),decoding?'decoded.txt':'encoded.txt');
}
function show(text,note,name){
el.output.textContent=text;
el.resultNote.textContent=note;
result={text,name};
el.copy.disabled=text==='';
offerDownload(text,name);
}
function offerDownload(text,name){
if(downloadUrl)URL.revokeObjectURL(downloadUrl);
downloadUrl=null;
if(text===''){el.download.hidden=true;return;}
downloadUrl=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
el.download.href=downloadUrl;
el.download.download=name;
el.download.hidden=false;
}
el.copy.addEventListener('click',async()=>{
if(!result)return;
try{
await navigator.clipboard.writeText(result.text);
el.copy.textContent='Copied';
}catch{
const range=document.createRange();
range.selectNodeContents(el.output);
const selection=window.getSelection();
selection.removeAllRanges();
selection.addRange(range);
el.copy.textContent='Selected - press Ctrl+C';
}
setTimeout(()=>{el.copy.textContent='Copy';},2500);
});
function clearResult(){
el.output.textContent='';
el.copy.disabled=true;
el.download.hidden=true;
result=null;
if(downloadUrl)URL.revokeObjectURL(downloadUrl);
downloadUrl=null;
}
function showError(message){
el.error.textContent=message;
el.error.hidden=false;
el.resultNote.textContent=phrase('result.none');
}
function clearError(){
el.error.hidden=true;
el.error.textContent='';
}
const pickedDirection=()=>document.querySelector('input[name="direction"]:checked').value;
function humanBytes(bytes){
if(bytes<1024)return phrase('size.b',{n:bytes});
if(bytes<1024*1024)return phrase('size.kb',{n:(bytes/1024).toFixed(1)});
return phrase('size.mb',{n:(bytes/(1024*1024)).toFixed(2)});
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
updateCounts();
run();
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
