/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase,fill}from'./shared/phrases.js?v=56834407ad';
import{sizeText}from'./shared/format.js?v=56834407ad';
import{downloadLink}from'./shared/download.js?v=56834407ad';
import{messageBox}from'./shared/message-box.js?v=56834407ad';
import{editorFeedback}from'./shared/editor-feedback.js?v=56834407ad';
import{wireFilePicker}from'./shared/file-picker.js?v=56834407ad';
import{textImport}from'./shared/text-import.js?v=56834407ad';
import{parseXml,printXml}from'./shared/parse-xml.js?v=56834407ad';
import{CONVERSIONS,conversionById}from'./convert.js?v=56834407ad';
import{SAMPLES}from'./samples.js?v=56834407ad';
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
indent:$('indent'),
style:$('style'),
conversion:$('conversion'),
conversionNote:$('conversion-note'),
rootField:$('root-field'),
rootName:$('root-name'),
sample:$('sample'),
clear:$('clear'),
error:$('error'),
goError:$('go-error'),
output:$('output'),
resultNote:$('result-note'),
copy:$('copy'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showError,clear:clearError}=messageBox(el.error,{
onShow:()=>{feedback.clear();el.resultNote.textContent=phrase('out.empty');},
});
const download=downloadLink(el.download);
const feedback=editorFeedback({input:el.input,go:el.goError,phrase,
context:()=>mode==='format'?'format:xml':`convert:${el.conversion.value}`});
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
const imports=textImport({
busy:()=>picker.busy(phrase('read.reading')),
done:picker.done,
});
async function loadFiles(files){
clearTimeout(timer);
clearResult();
await imports.read([files[0]],{
apply(texts){
el.input.value=texts[0];
updateCounts();
run();
},
failed(error){
showError(phrase('read.failed',{reason:say(error)}));
},
});
}
let timer=null;
function schedule(){
clearTimeout(timer);
clearResult();
const size=el.input.value.length;
timer=setTimeout(run,size>200000?500:120);
}
el.input.addEventListener('input',()=>{
imports.invalidate();
updateCounts();
schedule();
});
for(const control of[el.indent,el.style,el.conversion,el.rootName]){
control.addEventListener('change',run);
}
el.clear.addEventListener('click',()=>{
imports.invalidate();
el.input.value='';
updateCounts();
run();
el.input.focus();
});
el.sample.addEventListener('click',()=>{
imports.invalidate();
const sample=SAMPLES[mode];
el.input.value=sample.a;
if(sample.conversion&&mode==='convert')el.conversion.value=sample.conversion;
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
clearTimeout(timer);
clearError();
clearResult();
updateOptionVisibility();
const text=el.input.value;
if(text.trim()===''){
picker.waiting();
el.resultNote.textContent=phrase('out.nothing');
return;
}
picker.arrived();
try{
if(mode==='format')runFormat(text);
else runConvert(text);
}catch(error){
showError(say(error));
feedback.error(error);
if(error?.name!=='ParseError')console.error(error);
}
}
function updateOptionVisibility(){
el.rootField.hidden=!(mode==='convert'&&el.conversion.value==='json-xml');
el.conversionNote.textContent=phrase(conversionById(el.conversion.value).note);
}
function runFormat(text){
const minify=el.style.value==='minify';
const out=endWithNewline(printXml(parseXml(text),{indent:indentString(),minify}));
const before=byteLength(text);
const after=byteLength(out);
const what=phrase(minify?'note.squeezed':'note.laid');
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
show(out,note,'formatted.xml');
}
function runConvert(text){
const conversion=conversionById(el.conversion.value);
const out=conversion.run(text,{
indent:indentString(),
root:el.rootName.value.trim(),
});
show(out,phrase('note.converted',{
name:phrase(conversion.name),
lines:out.split('\n').length-1,
size:humanBytes(byteLength(out)),
}),`converted.${conversion.output}`);
}
const endWithNewline=(text)=>(text.endsWith('\n')?text:`${text}\n`);
function show(text,note,name){
el.output.textContent=text;
el.resultNote.textContent=note;
result={text,name};
el.copy.disabled=text==='';
download.offer(text,name);
}
el.copy.addEventListener('click',async()=>{
if(!result)return;
const copied=result;
try{
await navigator.clipboard.writeText(copied.text);
if(result!==copied)return;
el.copy.textContent=phrase('copy.copied');
}catch{
if(result!==copied)return;
const range=document.createRange();
range.selectNodeContents(el.output);
const selection=window.getSelection();
selection.removeAllRanges();
selection.addRange(range);
el.copy.textContent=phrase('copy.selected');
}
setTimeout(()=>{if(result===copied)el.copy.textContent=phrase('copy.copy');},2500);
});
function clearResult(){
feedback.clear();
el.copy.textContent=phrase('copy.copy');
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
setMode('format');
document.getElementById('boot-warning')?.remove();
