/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker}from'./shared/file-picker.js';
import{LANGUAGES,languageById,formatText,detectLanguage}from'./format.js';
import{CONVERSIONS,conversionById}from'./convert.js';
import{SAMPLES}from'./samples.js';
const $=(id)=>document.getElementById(id);
const el={
tabs:Array.from(document.querySelectorAll('.tab')),
panels:{
format:$('options-format'),
convert:$('options-convert'),
},
dropzone:$('dropzone'),
fileInput:$('file-input'),
input:$('input'),
inputCount:$('input-count'),
detected:$('detected'),
language:$('language'),
languageNote:$('language-note'),
indent:$('indent'),
style:$('style'),
styleNote:$('style-note'),
sortKeys:$('sort-keys'),
conversion:$('conversion'),
conversionNote:$('conversion-note'),
rootField:$('root-field'),
rootName:$('root-name'),
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
let mode='format';
let result=null;
let downloadUrl=null;
for(const conversion of CONVERSIONS){
el.conversion.append(new Option(conversion.name,conversion.id));
}
function setMode(next){
mode=next;
for(const tab of el.tabs){
const on=tab.dataset.mode===next;
tab.setAttribute('aria-selected',String(on));
tab.tabIndex=on?0:-1;
}
for(const[name,panel]of Object.entries(el.panels))panel.hidden=name!==next;
el.detected.hidden=next!=='format';
run();
}
for(const tab of el.tabs){
tab.addEventListener('click',()=>setMode(tab.dataset.mode));
tab.addEventListener('keydown',(event)=>{
const step=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;
if(!step)return;
event.preventDefault();
const index=el.tabs.indexOf(tab);
const next=el.tabs[(index+step+el.tabs.length)%el.tabs.length];
next.focus();
setMode(next.dataset.mode);
});
}
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){loadFiles(files);},
});
async function loadFiles(files){
picker.busy('Reading the file...');
try{
el.input.value=await files[0].text();
run();
}catch(error){
showError(`That file could not be read: ${error?.message ?? error}`);
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
for(const control of[el.language,el.indent,el.style,el.sortKeys,el.conversion,
el.rootName]){
control.addEventListener('change',run);
}
el.clear.addEventListener('click',()=>{
el.input.value='';
updateCounts();
run();
el.input.focus();
});
el.sample.addEventListener('click',()=>{
const sample=SAMPLES[mode];
el.input.value=sample.a;
if(sample.language&&mode==='format')el.language.value=sample.language;
if(sample.conversion&&mode==='convert')el.conversion.value=sample.conversion;
updateCounts();
run();
});
function updateCounts(){
el.inputCount.textContent=describe(el.input.value);
}
function describe(text){
if(text==='')return'empty';
const lines=text.split('\n').length;
return`${lines.toLocaleString()} line${lines === 1 ? '' : 's'}, `
+`${text.length.toLocaleString()} character${text.length === 1 ? '' : 's'}, `
+humanBytes(byteLength(text));
}
const byteLength=(text)=>new TextEncoder().encode(text).length;
function run(){
clearError();
clearResult();
updateOptionVisibility();
const text=el.input.value;
if(text.trim()===''){
el.resultNote.textContent='Nothing yet.';
return;
}
try{
if(mode==='format')runFormat(text);
else runConvert(text);
}catch(error){
showError(error?.message??String(error));
if(error?.name!=='ParseError')console.error(error);
}
}
function updateOptionVisibility(){
const language=chosenLanguage();
el.sortKeys.closest('.field').hidden=!(language&&languageById(language).sorts);
el.style.disabled=!!language&&!languageById(language).minifies;
el.styleNote.textContent=el.style.disabled
?'YAML has no squeezed form worth writing: the short one is flow style, which is unreadable.'
:'';
el.rootField.hidden=el.conversion.value!=='json-xml';
el.conversionNote.textContent=conversionById(el.conversion.value).note;
}
function chosenLanguage(){
if(el.language.value!=='auto')return el.language.value;
return detectLanguage(el.input.value);
}
function runFormat(text){
const language=chosenLanguage();
if(!language){
el.detected.textContent='';
showError('This does not look like JSON, XML, HTML, CSS or YAML. '
+'Pick the language from the menu if it is one of them.');
return;
}
el.detected.textContent=el.language.value==='auto'
?`Read as ${languageById(language).name}.`:'';
const minify=el.style.value==='minify'&&languageById(language).minifies;
const out=formatText(text,{
language,
minify,
indent:indentString(),
sortKeys:el.sortKeys.checked&&languageById(language).sorts,
});
const before=byteLength(text);
const after=byteLength(out);
const change=minify&&before>0
?` - ${humanBytes(before)} down to ${humanBytes(after)}, `
+`${Math.round((1 - after / before) * 100)}% off`
:'';
show(out,`${languageById(language).name}, ${minify ? 'squeezed flat' : 'laid out'}`
+`${change || ` - ${out.split('\n').length - 1} lines, ${humanBytes(after)}`}`,
`formatted.${language}`);
}
function runConvert(text){
const conversion=conversionById(el.conversion.value);
const out=conversion.run(text,{
indent:indentString(),
spaces:el.indent.value==='tab'?2:Number(el.indent.value),
sortKeys:el.sortKeys.checked,
root:el.rootName.value.trim(),
});
show(out,`${conversion.name} - ${out.split('\n').length - 1} lines, ${humanBytes(byteLength(out))}`,
`converted.${conversion.output}`);
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
el.resultNote.textContent='Nothing came out.';
}
function clearError(){
el.error.hidden=true;
el.error.textContent='';
}
const indentString=()=>(el.indent.value==='tab'?'\t':' '.repeat(Number(el.indent.value)));
function humanBytes(bytes){
if(bytes<1024)return`${bytes} B`;
if(bytes<1024*1024)return`${(bytes / 1024).toFixed(1)} KB`;
return`${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
+`host${platform.size === 1 ? '' : 's'}; not one of them was given a character of it.`;
el.networkCount.textContent=clean
?`your text has gone nowhere. ${total} files loaded.${platformNote}`
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
for(const language of LANGUAGES){
if(!el.language.querySelector(`option[value="${language.id}"]`)){
console.warn(`the language menu is missing ${language.id}`);
}
}
updateCounts();
setMode('format');
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
