/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker}from'./shared/file-picker.js';
import{LANGUAGES,languageById,formatText,detectLanguage}from'./format.js';
import{CONVERSIONS,conversionById}from'./convert.js';
import{CODECS,codecById,CodecError}from'./encode.js';
import{compareText,alignRows,diffWords,formatUnified}from'./diff.js';
import{SAMPLES}from'./samples.js';
const $=(id)=>document.getElementById(id);
const el={
tabs:Array.from(document.querySelectorAll('.tab')),
panels:{
format:$('options-format'),
convert:$('options-convert'),
encode:$('options-encode'),
diff:$('options-diff'),
},
dropzone:$('dropzone'),
fileInput:$('file-input'),
input:$('input'),
inputB:$('input-b'),
paneB:$('pane-b'),
inputLabel:$('input-label'),
inputCount:$('input-count'),
inputBCount:$('input-b-count'),
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
codec:$('codec'),
codecNote:$('codec-note'),
view:$('view'),
onlyChanges:$('only-changes'),
ignoreWhitespace:$('ignore-whitespace'),
ignoreCase:$('ignore-case'),
ignoreBlank:$('ignore-blank'),
sample:$('sample'),
swap:$('swap'),
clear:$('clear'),
error:$('error'),
output:$('output'),
diffView:$('diff-view'),
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
const MAX_ROWS=4000;
for(const conversion of CONVERSIONS){
el.conversion.append(new Option(conversion.name,conversion.id));
}
for(const codec of CODECS){
el.codec.append(new Option(codec.name,codec.id));
}
function setMode(next){
mode=next;
for(const tab of el.tabs){
const on=tab.dataset.mode===next;
tab.setAttribute('aria-selected',String(on));
tab.tabIndex=on?0:-1;
}
for(const[name,panel]of Object.entries(el.panels))panel.hidden=name!==next;
const comparing=next==='diff';
el.paneB.hidden=!comparing;
el.swap.hidden=!comparing;
el.output.hidden=comparing;
el.diffView.hidden=!comparing;
el.inputLabel.textContent=comparing?'The original':'Your text';
el.fileInput.multiple=comparing;
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
picker.busy(`Reading ${files.length === 1 ? 'the file' : `${files.length} files`}...`);
try{
const texts=await Promise.all(files.slice(0,2).map((file)=>file.text()));
if(mode==='diff'&&texts.length>1){
el.input.value=texts[0];
el.inputB.value=texts[1];
}else if(mode==='diff'&&el.input.value.trim()&&!el.inputB.value.trim()){
el.inputB.value=texts[0];
}else{
el.input.value=texts[0];
}
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
const size=el.input.value.length+el.inputB.value.length;
timer=setTimeout(run,size>200000?500:120);
}
for(const box of[el.input,el.inputB]){
box.addEventListener('input',()=>{updateCounts();schedule();});
}
for(const control of[el.language,el.indent,el.style,el.sortKeys,el.conversion,
el.rootName,el.codec,el.view,el.onlyChanges,el.ignoreWhitespace,el.ignoreCase,
el.ignoreBlank]){
control.addEventListener('change',run);
}
for(const radio of document.querySelectorAll('input[name="direction"]')){
radio.addEventListener('change',run);
}
el.swap.addEventListener('click',()=>{
const held=el.input.value;
el.input.value=el.inputB.value;
el.inputB.value=held;
updateCounts();
run();
});
el.clear.addEventListener('click',()=>{
el.input.value='';
el.inputB.value='';
updateCounts();
run();
el.input.focus();
});
el.sample.addEventListener('click',()=>{
const sample=SAMPLES[mode];
el.input.value=sample.a;
if(sample.b!==undefined)el.inputB.value=sample.b;
if(sample.language&&mode==='format')el.language.value=sample.language;
if(sample.conversion&&mode==='convert')el.conversion.value=sample.conversion;
updateCounts();
run();
});
function updateCounts(){
el.inputCount.textContent=describe(el.input.value);
el.inputBCount.textContent=describe(el.inputB.value);
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
if(mode!=='diff'&&text.trim()===''){
el.resultNote.textContent='Nothing yet.';
return;
}
try{
if(mode==='format')runFormat(text);
else if(mode==='convert')runConvert(text);
else if(mode==='encode')runEncode(text);
else runDiff(text,el.inputB.value);
}catch(error){
showError(error?.message??String(error));
if(error?.name!=='ParseError'&&error?.name!=='CodecError')console.error(error);
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
el.codecNote.textContent=codecById(el.codec.value).note;
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
function runEncode(text){
const codec=codecById(el.codec.value);
const decoding=pickedDirection()==='decode';
let out;
try{
out=decoding?codec.decode(text):codec.encode(text);
}catch(error){
if(error?.name==='TypeError'){
throw new CodecError('Those bytes are not UTF-8 text, so there is nothing to show. '
+'They may be a file rather than a string.');
}
throw error;
}
show(out,`${codec.name}, ${decoding ? 'decoded' : 'encoded'} - `
+`${humanBytes(byteLength(text))} in, ${humanBytes(byteLength(out))} out`,
decoding?'decoded.txt':'encoded.txt');
}
function runDiff(aText,bText){
if(aText===''&&bText===''){
el.resultNote.textContent='Paste something into both boxes.';
el.diffView.replaceChildren();
return;
}
const options={
ignoreWhitespace:el.ignoreWhitespace.checked,
ignoreCase:el.ignoreCase.checked,
ignoreBlankLines:el.ignoreBlank.checked,
};
const{ops,stats}=compareText(aText,bText,options);
const rows=alignRows(ops);
el.diffView.replaceChildren(drawDiff(rows));
el.diffView.classList.toggle('split',el.view.value==='split');
const patch=formatUnified(ops,{aLabel:'original',bLabel:'changed'});
result={text:patch,name:'changes.patch'};
el.copy.disabled=patch==='';
offerDownload(patch,'changes.patch');
if(stats.identical){
el.resultNote.textContent='These two are identical, byte for byte.';
return;
}
const sameText=stats.added===0&&stats.removed===0
?'The same, once the differences you asked to ignore are ignored.'
:`${stats.added.toLocaleString()} added, ${stats.removed.toLocaleString()} removed`;
el.resultNote.textContent=`${sameText} - `
+`${Math.round(stats.similarity * 100)}% of the lines are shared.`
+(stats.trailingDiffers?' One of them ends with a newline and the other does not.':'');
}
function drawDiff(rows){
const table=document.createElement('div');
table.className='diff-table';
const kept=el.onlyChanges.checked?collapse(rows,3):rows.map((row)=>({row}));
let drawn=0;
for(const entry of kept){
if(entry.skipped){
const gap=document.createElement('div');
gap.className='diff-skip';
gap.textContent=`${entry.skipped.toLocaleString()} unchanged line`
+`${entry.skipped === 1 ? '' : 's'}`;
table.append(gap);
continue;
}
if(drawn>=MAX_ROWS){
const gap=document.createElement('div');
gap.className='diff-skip';
gap.textContent='The rest is not drawn - use Download to get the whole patch.';
table.append(gap);
break;
}
table.append(el.view.value==='split'?splitRow(entry.row):unifiedRow(entry.row));
drawn+=1;
}
return table;
}
function collapse(rows,context){
const keep=new Array(rows.length).fill(false);
rows.forEach((row,index)=>{
if(row.type==='equal')return;
for(let i=Math.max(0,index-context);i<=Math.min(rows.length-1,index+context);i+=1){
keep[i]=true;
}
});
const out=[];
let skipped=0;
rows.forEach((row,index)=>{
if(keep[index]){
if(skipped){out.push({skipped});skipped=0;}
out.push({row});
return;
}
skipped+=1;
});
if(skipped)out.push({skipped});
return out;
}
function splitRow(row){
const line=document.createElement('div');
line.className=`diff-row ${row.type}`;
const words=row.type==='change'?diffWords(row.a.text,row.b.text):null;
line.append(
lineNumber(row.a?.a),
side(row.a?row.a.text:null,words?.a,'left',row.type==='change'||row.type==='delete'),
lineNumber(row.b?.b),
side(row.b?row.b.text:null,words?.b,'right',row.type==='change'||row.type==='insert'),
);
return line;
}
function unifiedRow(row){
if(row.type==='change'){
const wrap=document.createDocumentFragment();
wrap.append(unifiedRow({type:'delete',a:row.a,b:null}));
wrap.append(unifiedRow({type:'insert',a:null,b:row.b}));
return wrap;
}
const line=document.createElement('div');
line.className=`diff-row ${row.type}`;
const sign=row.type==='insert'?'+':row.type==='delete'?'-':' ';
const text=(row.a??row.b).text;
line.append(lineNumber(row.a?.a),lineNumber(row.b?.b));
const cell=document.createElement('span');
cell.className=`side ${row.type === 'insert' ? 'right marked'
    : row.type === 'delete' ? 'left marked' : 'left'}`
;
cell.textContent=`${sign}${text}`;
line.append(cell);
return line;
}
function lineNumber(value){
const cell=document.createElement('span');
cell.className='ln';
cell.textContent=value===undefined||value===null?'':String(value+1);
return cell;
}
function side(text,words,where,marked){
const cell=document.createElement('span');
cell.className=`side ${where}${marked ? ' marked' : ''}`;
if(text===null){cell.classList.add('empty');return cell;}
if(!words){cell.textContent=text;return cell;}
for(const part of words){
if(part.same){cell.append(part.text);continue;}
const mark=document.createElement('mark');
mark.textContent=part.text;
cell.append(mark);
}
return cell;
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
range.selectNodeContents(mode==='diff'?el.diffView:el.output);
const selection=window.getSelection();
selection.removeAllRanges();
selection.addRange(range);
el.copy.textContent='Selected - press Ctrl+C';
}
setTimeout(()=>{el.copy.textContent='Copy';},2500);
});
function clearResult(){
el.output.textContent='';
el.diffView.replaceChildren();
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
const pickedDirection=()=>document.querySelector('input[name="direction"]:checked').value;
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
if(window.matchMedia('(max-width: 620px)').matches)el.view.value='unified';
updateCounts();
setMode('format');
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
