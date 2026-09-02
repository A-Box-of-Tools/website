/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase,fill}from'./shared/phrases.js';
import{sizeText}from'./shared/format.js';
import{downloadLink}from'./shared/download.js';
import{messageBox}from'./shared/message-box.js';
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
};
const{show:showError,clear:clearError}=messageBox(el.error,{
onShow:()=>{el.resultNote.textContent=phrase('out.empty');},
});
const download=downloadLink(el.download);
const humanBytes=(n)=>sizeText(n,phrase,{under:'size.bytes',kb:1,mb:2});
let mode='format';
let result=null;
for(const conversion of CONVERSIONS){
el.conversion.append(new Option(phrase(conversion.name),conversion.id));
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
picker.busy(phrase('read.reading'));
try{
el.input.value=await files[0].text();
run();
}catch(error){
showError(phrase('read.failed',{reason:say(error)}));
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
el.resultNote.textContent=phrase('out.nothing');
return;
}
try{
if(mode==='format')runFormat(text);
else runConvert(text);
}catch(error){
showError(say(error));
if(error?.name!=='ParseError')console.error(error);
}
}
function updateOptionVisibility(){
const language=chosenLanguage();
el.sortKeys.closest('.field').hidden=!(language&&languageById(language).sorts);
el.style.disabled=!!language&&!languageById(language).minifies;
el.styleNote.textContent=el.style.disabled?phrase('style.noyaml'):'';
el.rootField.hidden=el.conversion.value!=='json-xml';
el.conversionNote.textContent=phrase(conversionById(el.conversion.value).note);
}
function chosenLanguage(){
if(el.language.value!=='auto')return el.language.value;
return detectLanguage(el.input.value);
}
function runFormat(text){
const language=chosenLanguage();
if(!language){
el.detected.textContent='';
showError(phrase('detect.unknown'));
return;
}
el.detected.textContent=el.language.value==='auto'
?phrase('detect.read',{name:languageById(language).name})
:'';
const minify=el.style.value==='minify'&&languageById(language).minifies;
const out=formatText(text,{
language,
minify,
indent:indentString(),
sortKeys:el.sortKeys.checked&&languageById(language).sorts,
});
const before=byteLength(text);
const after=byteLength(out);
const what=phrase(minify?'note.squeezed':'note.laid',
{name:languageById(language).name});
const note=minify&&before>0
?phrase('note.smaller',{
what,
before:humanBytes(before),
after:humanBytes(after),
percent:Math.round((1-after/before)*100),
})
:phrase('note.lines',{
what,
lines:out.split('\n').length-1,
size:humanBytes(after),
});
show(out,note,`formatted.${language}`);
}
function runConvert(text){
const conversion=conversionById(el.conversion.value);
const out=conversion.run(text,{
indent:indentString(),
spaces:el.indent.value==='tab'?2:Number(el.indent.value),
sortKeys:el.sortKeys.checked,
root:el.rootName.value.trim(),
});
show(out,phrase('note.converted',{
name:phrase(conversion.name),
lines:out.split('\n').length-1,
size:humanBytes(byteLength(out)),
}),`converted.${conversion.output}`);
}
function show(text,note,name){
el.output.textContent=text;
el.resultNote.textContent=note;
result={text,name};
el.copy.disabled=text==='';
download.offer(text,name);
}
el.copy.addEventListener('click',async()=>{
if(!result)return;
try{
await navigator.clipboard.writeText(result.text);
el.copy.textContent=phrase('copy.copied');
}catch{
const range=document.createRange();
range.selectNodeContents(el.output);
const selection=window.getSelection();
selection.removeAllRanges();
selection.addRange(range);
el.copy.textContent=phrase('copy.selected');
}
setTimeout(()=>{el.copy.textContent=phrase('copy.copy');},2500);
});
function clearResult(){
el.output.textContent='';
el.copy.disabled=true;
download.clear();
result=null;
}
function say(error){
if(error?.name==='ParseError'){
return phrase('parse.at',{
reason:phrase(error.reason,fill(error.values)),
line:error.line,
column:error.column,
});
}
return error?.message?phrase(error.message,fill(error.values)):String(error);
}
const indentString=()=>(el.indent.value==='tab'?'\t':' '.repeat(Number(el.indent.value)));
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
for(const language of LANGUAGES){
if(!el.language.querySelector(`option[value="${language.id}"]`)){
console.warn(`the language menu is missing ${language.id}`);
}
}
updateCounts();
setMode('format');
document.getElementById('boot-warning')?.remove();
