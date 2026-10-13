/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=10a3170f04';
import{downloadLink}from'./shared/download.js?v=10a3170f04';
import{messageBox}from'./shared/message-box.js?v=10a3170f04';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=10a3170f04';
import{textImport}from'./shared/text-import.js?v=10a3170f04';
import{compareText,alignRows,changeBlocks,diffWords,formatUnified,splitLines}from'./diff.js?v=10a3170f04';
import{SAMPLES}from'./samples.js?v=10a3170f04';
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
endingNote:$('ending-note'),
changeNav:$('change-nav'),
changePosition:$('change-position'),
changeLimit:$('change-limit'),
previousChange:$('previous-change'),
nextChange:$('next-change'),
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
let navigation=null;
const copyLabel=el.copy.textContent;
const MAX_ROWS=4000;
const sourceTexts=new WeakMap();
function setText(box,text){
box.value=text;
sourceTexts.set(box,{text,shown:box.value});
}
function sourceText(box){
const source=sourceTexts.get(box);
return source&&source.shown===box.value?source.text:box.value;
}
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){loadFiles(files);},
});
const imports=textImport({
busy:(count)=>picker.busy(readingLabel(count)),
done:picker.done,
});
async function loadFiles(files){
clearTimeout(timer);
clearResult();
const restoring=el.fileInput?.dataset.langRestore==='1';
const fillSecond=files.length===1&&!restoring
&&el.input.value.trim()&&!el.inputB.value.trim();
await imports.read(files.slice(0,2),{
apply(texts){
if(texts.length>1){
setText(el.input,texts[0]);
setText(el.inputB,texts[1]);
}else if(fillSecond){
setText(el.inputB,texts[0]);
}else{
setText(el.input,texts[0]);
}
updateCounts();
run();
},
failed(error){
showError(phrase('read.failed',{detail:error?.message??error}));
},
});
}
let timer=null;
function schedule(){
clearTimeout(timer);
clearResult();
const size=el.input.value.length+el.inputB.value.length;
timer=setTimeout(run,size>200000?500:120);
}
for(const box of[el.input,el.inputB]){
box.addEventListener('abox:language-text',(event)=>{
event.detail.value=sourceText(box);
});
box.addEventListener('input',(event)=>{
imports.invalidate();
if(typeof event.detail?.languageText==='string')setText(box,event.detail.languageText);
else sourceTexts.delete(box);
updateCounts();
schedule();
});
}
for(const control of[el.view,el.onlyChanges,el.ignoreWhitespace,el.ignoreCase,
el.ignoreBlank]){
control.addEventListener('change',run);
}
el.swap.addEventListener('click',()=>{
imports.invalidate();
const held=sourceText(el.input);
setText(el.input,sourceText(el.inputB));
setText(el.inputB,held);
updateCounts();
run();
});
el.clear.addEventListener('click',()=>{
imports.invalidate();
setText(el.input,'');
setText(el.inputB,'');
updateCounts();
run();
el.input.focus();
});
el.sample.addEventListener('click',()=>{
imports.invalidate();
setText(el.input,SAMPLES.diff.a);
setText(el.inputB,SAMPLES.diff.b);
updateCounts();
run();
});
function updateCounts(){
el.inputCount.textContent=describe(sourceText(el.input));
el.inputBCount.textContent=describe(sourceText(el.inputB));
}
function describe(text){
if(text==='')return phrase('count.empty');
const lines=splitLines(text).lines.length;
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
clearTimeout(timer);
clearError();
clearResult();
try{
runDiff(sourceText(el.input),sourceText(el.inputB));
}catch(error){
showError(error?.message??String(error));
console.error(error);
}
}
function runDiff(aText,bText){
if(aText===''&&bText===''){
picker.waiting();
el.resultNote.textContent=phrase('result.waiting');
el.diffView.replaceChildren();
return;
}
picker.arrived();
const options={
ignoreWhitespace:el.ignoreWhitespace.checked,
ignoreCase:el.ignoreCase.checked,
ignoreBlankLines:el.ignoreBlank.checked,
};
const{ops,stats}=compareText(aText,bText,options);
const rows=alignRows(ops);
const drawn=drawDiff(rows);
el.diffView.replaceChildren(drawn.table);
setNavigation(drawn);
el.endingNote.textContent=stats.endingChanges===0?''
:phrase(stats.endingChanges===1?'result.endings.one':'result.endings.many',
{count:stats.endingChanges.toLocaleString()});
el.diffView.classList.toggle('split',el.view.value==='split');
const patch=formatUnified(aText,bText,{aLabel:'original',bLabel:'changed'});
result={text:patch,name:'changes.patch'};
el.copy.disabled=patch==='';
download.offer(patch,'changes.patch');
if(stats.identical){
el.resultNote.textContent=phrase('result.identical');
return;
}
const ignored=options.ignoreWhitespace||options.ignoreCase||options.ignoreBlankLines;
const changes=stats.added===0&&stats.removed===0&&ignored&&!stats.trailingDiffers&&stats.endingChanges===0
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
const kept=el.onlyChanges.checked?collapse(rows,3):rows.map((row,index)=>({row,index}));
const blocks=changeBlocks(rows);
const targets=[];
let block=0;
let lastBlock=-1;
let truncated=false;
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
truncated=true;
break;
}
while(block<blocks.length&&entry.index>=blocks[block].end)block+=1;
const node=el.view.value==='split'?splitRow(entry.row):unifiedRow(entry.row);
if(entry.row.type!=='equal'&&block!==lastBlock){
const target=[...node.querySelectorAll('.side')]
.find((cell)=>!cell.classList.contains('empty'));
target.tabIndex=-1;
target.classList.add('change-target');
targets.push(target);
lastBlock=block;
}
table.append(node);
drawn+=1;
}
return{table,targets,total:blocks.length,truncated};
}
function setNavigation(drawn){
navigation=drawn.total?{...drawn,current:-1}:null;
el.changeNav.hidden=!navigation;
el.changeNav.inert=!navigation;
updateNavigation();
}
function clearNavigation(){
navigation=null;
el.changeNav.hidden=true;
el.changeNav.inert=true;
updateNavigation();
}
function updateNavigation(){
const shown=navigation?.targets.length??0;
el.previousChange.disabled=!navigation||navigation.current<=0;
el.nextChange.disabled=!navigation||navigation.current>=shown-1;
el.changePosition.textContent=!navigation?'':navigation.current<0
?phrase(shown===1?'nav.shown.one':'nav.shown.many',{count:shown.toLocaleString()})
:phrase('nav.position',{current:(navigation.current+1).toLocaleString(),count:shown.toLocaleString()});
el.changeLimit.textContent=navigation?.truncated?phrase('nav.truncated',{
shown:shown.toLocaleString(),total:navigation.total.toLocaleString(),
}):'';
}
function moveChange(step){
if(!navigation)return;
const next=navigation.current+step;
if(next<0||next>=navigation.targets.length)return;
navigation.current=next;
updateNavigation();
const target=navigation.targets[next];
target.focus({preventScroll:true});
target.scrollIntoView({block:'nearest',inline:'nearest'});
}
el.previousChange.addEventListener('click',()=>moveChange(-1));
el.nextChange.addEventListener('click',()=>moveChange(1));
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
out.push({row,index});
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
const endingChange=row.type==='ending'
||(row.type==='change'&&row.a.ending!==row.b.ending);
line.append(
lineNumber(row.a?.a),
side(row.a?row.a.text:null,words?.a,'left',row.type!=='equal'&&row.type!=='insert',
endingChange?(row.type==='ending'?row.a.aEnding:row.a.ending):null),
lineNumber(row.b?.b),
side(row.b?row.b.text:null,words?.b,'right',row.type!=='equal'&&row.type!=='delete',
endingChange?(row.type==='ending'?row.b.bEnding:row.b.ending):null),
);
return line;
}
function unifiedRow(row){
if(row.type==='change'||row.type==='ending'){
const wrap=document.createDocumentFragment();
const endingChange=row.type==='ending'||row.a.ending!==row.b.ending;
wrap.append(unifiedRow({type:'delete',a:row.a,b:null,
ending:endingChange?(row.type==='ending'?row.a.aEnding:row.a.ending):null}));
wrap.append(unifiedRow({type:'insert',a:null,b:row.b,
ending:endingChange?(row.type==='ending'?row.b.bEnding:row.b.ending):null}));
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
if(row.ending!=null)cell.append(endingBadge(row.ending));
line.append(cell);
return line;
}
function lineNumber(value){
const cell=document.createElement('span');
cell.className='ln';
cell.textContent=value===undefined||value===null?'':String(value+1);
return cell;
}
function side(text,words,where,marked,ending=null){
const cell=document.createElement('span');
cell.className=`side ${where}${marked ? ' marked' : ''}`;
if(text===null){cell.classList.add('empty');return cell;}
if(!words)cell.textContent=text;
for(const part of words??[]){
if(part.same){cell.append(part.text);continue;}
const mark=document.createElement('mark');
mark.textContent=part.text;
cell.append(mark);
}
if(ending!=null)cell.append(endingBadge(ending));
return cell;
}
function endingBadge(ending){
const badge=document.createElement('span');
badge.className='line-ending';
const key=ending==='\r\n'?'ending.crlf':ending==='\r'?'ending.cr'
:ending==='\n'?'ending.lf':'ending.none';
badge.textContent=phrase(key);
return badge;
}
el.copy.addEventListener('click',async()=>{
if(!result)return;
const copied=result;
const text=copied.text;
try{
await navigator.clipboard.writeText(text);
if(result!==copied)return;
el.copy.textContent=phrase('copy.done');
}catch{
if(result!==copied)return;
const patch=document.createElement('pre');
patch.className='diff-patch';
patch.textContent=text;
clearNavigation();
el.diffView.replaceChildren(patch);
const range=document.createRange();
range.selectNodeContents(patch);
const selection=window.getSelection();
selection.removeAllRanges();
selection.addRange(range);
el.copy.textContent=phrase('copy.select');
}
setTimeout(()=>{if(result===copied)el.copy.textContent=copyLabel;},2500);
});
function clearResult(){
el.copy.textContent=copyLabel;
el.diffView.replaceChildren();
el.endingNote.textContent='';
clearNavigation();
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
