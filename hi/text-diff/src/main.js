/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=260ec49996';
import{downloadLink}from'./shared/download.js?v=260ec49996';
import{messageBox}from'./shared/message-box.js?v=260ec49996';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=260ec49996';
import{compareText,alignRows,diffWords,formatUnified}from'./diff.js?v=260ec49996';
import{SAMPLES}from'./samples.js?v=260ec49996';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
input:$('input'),
inputB:$('input-b'),
inputCount:$('input-count'),
inputBCount:$('input-b-count'),
view:$('view'),
onlyChanges:$('only-changes'),
ignoreWhitespace:$('ignore-whitespace'),
ignoreCase:$('ignore-case'),
ignoreBlank:$('ignore-blank'),
sample:$('sample'),
swap:$('swap'),
clear:$('clear'),
error:$('error'),
diffView:$('diff-view'),
resultNote:$('result-note'),
copy:$('copy'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showError,clear:clearError}=messageBox(el.error,{
onShow:()=>{el.resultNote.textContent=phrase('result.failed');},
});
const download=downloadLink(el.download);
let result=null;
const copyLabel=el.copy.textContent;
const MAX_ROWS=4000;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){loadFiles(files);},
});
async function loadFiles(files){
const restoring=el.fileInput?.dataset.langRestore==='1';
picker.busy(readingLabel(files.length));
try{
const texts=await Promise.all(files.slice(0,2).map((file)=>file.text()));
if(texts.length>1){
el.input.value=texts[0];
el.inputB.value=texts[1];
}else if(!restoring&&el.input.value.trim()&&!el.inputB.value.trim()){
el.inputB.value=texts[0];
}else{
el.input.value=texts[0];
}
updateCounts();
run();
}catch(error){
showError(phrase('read.failed',{detail:error?.message??error}));
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
for(const control of[el.view,el.onlyChanges,el.ignoreWhitespace,el.ignoreCase,
el.ignoreBlank]){
control.addEventListener('change',run);
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
el.input.value=SAMPLES.diff.a;
el.inputB.value=SAMPLES.diff.b;
updateCounts();
run();
});
function updateCounts(){
el.inputCount.textContent=describe(el.input.value);
el.inputBCount.textContent=describe(el.inputB.value);
}
function describe(text){
if(text==='')return phrase('count.empty');
const lines=text.split('\n').length;
const characters=text.length;
return phrase('count.summary',{
lines:phrase(lines===1?'count.lines.one':'count.lines.many',
{count:lines.toLocaleString()}),
characters:phrase(characters===1?'count.characters.one':'count.characters.many',
{count:characters.toLocaleString()}),
size:humanBytes(byteLength(text)),
});
}
const byteLength=(text)=>new TextEncoder().encode(text).length;
function run(){
clearError();
clearResult();
try{
runDiff(el.input.value,el.inputB.value);
}catch(error){
showError(error?.message??String(error));
console.error(error);
}
}
function runDiff(aText,bText){
if(aText===''&&bText===''){
el.resultNote.textContent=phrase('result.waiting');
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
download.offer(patch,'changes.patch');
if(stats.identical){
el.resultNote.textContent=phrase('result.identical');
return;
}
const changes=stats.added===0&&stats.removed===0
?phrase('result.ignored')
:phrase('result.counts',{
added:stats.added.toLocaleString(),
removed:stats.removed.toLocaleString(),
});
el.resultNote.textContent=phrase('result.summary',{
changes,
percent:Math.round(stats.similarity*100),
note:stats.trailingDiffers?phrase('result.newline'):'',
}).trim();
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
gap.textContent=phrase(entry.skipped===1?'skip.one':'skip.many',
{count:entry.skipped.toLocaleString()});
table.append(gap);
continue;
}
if(drawn>=MAX_ROWS){
const gap=document.createElement('div');
gap.className='diff-skip';
gap.textContent=phrase('skip.rest');
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
el.copy.addEventListener('click',async()=>{
if(!result)return;
try{
await navigator.clipboard.writeText(result.text);
el.copy.textContent=phrase('copy.done');
}catch{
const range=document.createRange();
range.selectNodeContents(el.diffView);
const selection=window.getSelection();
selection.removeAllRanges();
selection.addRange(range);
el.copy.textContent=phrase('copy.select');
}
setTimeout(()=>{el.copy.textContent=copyLabel;},2500);
});
function clearResult(){
el.diffView.replaceChildren();
el.copy.disabled=true;
download.clear();
result=null;
}
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
window.addEventListener('error',(event)=>{
showError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
if(window.matchMedia('(max-width: 620px)').matches)el.view.value='unified';
updateCounts();
run();
document.getElementById('boot-warning')?.remove();
