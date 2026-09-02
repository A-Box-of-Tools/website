/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase,fill}from'./shared/phrases.js';
import{sizeText}from'./shared/format.js';
import{downloadLink}from'./shared/download.js';
import{messageBox}from'./shared/message-box.js';
import{wireFilePicker}from'./shared/file-picker.js';
import{CONVERSIONS,conversionById}from'./convert.js';
import{SAMPLES}from'./samples.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
input:$('input'),
inputLabel:$('input-label'),
inputCount:$('input-count'),
conversion:$('conversion'),
conversionNote:$('conversion-note'),
indent:$('indent'),
sortKeys:$('sort-keys'),
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
let result=null;
for(const conversion of CONVERSIONS){
el.conversion.append(new Option(phrase(conversion.name),conversion.id));
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
const name=files[0].name.toLowerCase();
if(name.endsWith('.json'))el.conversion.value='json-yaml';
else if(name.endsWith('.yaml')||name.endsWith('.yml'))el.conversion.value='yaml-json';
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
for(const control of[el.conversion,el.indent,el.sortKeys]){
control.addEventListener('change',run);
}
el.clear.addEventListener('click',()=>{
el.input.value='';
updateCounts();
run();
el.input.focus();
});
el.sample.addEventListener('click',()=>{
el.input.value=SAMPLES[el.conversion.value].a;
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
const conversion=conversionById(el.conversion.value);
const out=conversion.run(text,{
indent:indentString(),
spaces:el.indent.value==='tab'?2:Number(el.indent.value),
sortKeys:el.sortKeys.checked,
});
show(out,phrase('note.converted',{
name:phrase(conversion.name),
lines:out.split('\n').length-1,
size:humanBytes(byteLength(out)),
}),`converted.${conversion.output}`);
}catch(error){
showError(say(error));
if(error?.name!=='ParseError')console.error(error);
}
}
function updateOptionVisibility(){
const toJson=conversionById(el.conversion.value).output==='json';
el.sortKeys.closest('.field').hidden=!toJson;
el.indent.querySelector('option[value="tab"]').hidden=!toJson;
if(!toJson&&el.indent.value==='tab')el.indent.value='2';
el.conversionNote.textContent=phrase(conversionById(el.conversion.value).note);
el.inputLabel.textContent=phrase(toJson?'label.yaml':'label.json');
el.input.placeholder=phrase(toJson?'placeholder.yaml':'placeholder.json');
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
updateCounts();
run();
document.getElementById('boot-warning')?.remove();
