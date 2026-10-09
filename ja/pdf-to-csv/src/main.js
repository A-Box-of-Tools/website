/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=28df76ce48';
import{messageBox}from'./shared/message-box.js?v=28df76ce48';
import{downloadLink}from'./shared/download.js?v=28df76ce48';
import{sizeText}from'./shared/format.js?v=28df76ce48';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=28df76ce48';
import{EncryptedPdfError,NotAPdfError}from'./shared/pdf-reader.js?v=28df76ce48';
import{buildTable}from'./rows.js?v=28df76ce48';
import{checkBalance}from'./check.js?v=28df76ce48';
import{columnLetter,csvValue,formulaCells,toCsv}from'./csv.js?v=28df76ce48';
import{readTables,TableReadError}from'./read.js?v=28df76ce48';
import{previewWindow}from'./preview.js?v=28df76ce48';
import{
formatAmount,hasAmbiguousDates,parseAmount,
parseDate,
}from'./values.js?v=28df76ce48';
import{makeExample}from'./example.js?v=28df76ce48';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
fileRow:$('file-row'),
fileName:$('file-name'),
fileFacts:$('file-facts'),
clearFile:$('clear-file'),
cancelLoad:$('cancel-load'),
loadProgress:$('load-progress'),
loadError:$('load-error'),
lockedHelp:$('locked-help'),
scannedHelp:$('scanned-help'),
tableCard:$('table-card'),
summary:$('summary'),
checkLine:$('check-line'),
tableField:$('table-field'),
tablePick:$('table-pick'),
orderField:$('order-field'),
dateOrder:$('date-order'),
orderNote:$('order-note'),
previews:$('previews'),
resultCard:$('result-card'),
download:$('download'),
exportMode:$('export-mode'),
exportNote:$('export-note'),
resultFacts:$('result-facts'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showLoadError,clear:clearLoadError}=messageBox(el.loadError);
const offerCsv=downloadLink(el.download,'text/csv;charset=utf-8');
const PREVIEW_ROWS=25;
const ALL='all';
let current=null;
let loading=null;
const previewRows=new Map();
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
load(files[0]);
},
example:makeExample,
});
el.clearFile.addEventListener('click',()=>{
stopLoading();
reset();
picker.waiting();
});
el.cancelLoad.addEventListener('click',()=>{
stopLoading();
reset();
el.loadProgress.hidden=false;
el.loadProgress.textContent=phrase('load.cancelled');
picker.waiting();
el.fileInput.focus();
});
el.exportMode.addEventListener('change',()=>{if(current)render();});
function stopLoading(){
loading?.abort();
loading=null;
el.cancelLoad.hidden=true;
picker.done();
}
el.dateOrder.addEventListener('change',()=>{
if(!current)return;
current.order=el.dateOrder.value==='mdy'?'mdy':'dmy';
render();
});
el.tablePick.addEventListener('change',()=>{
if(!current)return;
current.pick=el.tablePick.value;
render();
});
function reset(){
current=null;
previewRows.clear();
el.loadProgress.hidden=true;
el.loadProgress.textContent='';
clearLoadError();
offerCsv.clear();
el.lockedHelp.hidden=true;
el.scannedHelp.hidden=true;
el.fileRow.hidden=true;
el.tableCard.hidden=true;
el.resultCard.hidden=true;
el.tableField.hidden=true;
el.orderField.hidden=true;
el.previews.replaceChildren();
}
async function load(file){
if(!file)return;
stopLoading();
reset();
const owner=new AbortController();
loading=owner;
el.fileRow.hidden=false;
el.fileName.textContent=file.name;
el.fileFacts.textContent='';
el.cancelLoad.hidden=false;
el.loadProgress.hidden=false;
el.loadProgress.textContent=readingLabel(1);
picker.busy(readingLabel(1));
try{
const data=await readTables(file,{
signal:owner.signal,
onProgress(done,total){
if(loading!==owner)return;
el.loadProgress.textContent=phrase('load.progress',{done,total});
},
});
if(loading!==owner)return;
current={file:data.file,pages:data.pages,tables:data.tables,
mark:data.mark,order:data.found??'dmy',pick:ALL};
el.fileFacts.textContent=fileFactsText(data.pages,data.bytes);
if(hasAmbiguousDates(data.cells)){
el.dateOrder.value=current.order;
el.orderNote.textContent=phrase(data.found?'order.found':'order.guessed');
el.orderField.hidden=false;
}
render();
}catch(error){
if(loading===owner&&!owner.signal.aborted)fail(error);
}finally{
if(loading===owner){
loading=null;
picker.done();
el.cancelLoad.hidden=true;
el.loadProgress.hidden=true;
}
}
}
function refuse(message){
picker.done();
picker.waiting();
el.tableCard.hidden=true;
el.resultCard.hidden=true;
el.tableField.hidden=true;
el.orderField.hidden=true;
offerCsv.clear();
showLoadError(message);
}
function fail(error){
if(error instanceof TableReadError){
if(error.pages){
el.fileFacts.textContent=fileFactsText(error.pages,error.bytes);
}
refuse(phrase(error.reason));
el.scannedHelp.hidden=error.reason!=='scan.notext';
return;
}
if(error instanceof EncryptedPdfError){
refuse(phrase('load.encrypted'));
el.lockedHelp.hidden=false;
return;
}
if(error instanceof NotAPdfError){
const detail=error.message?.startsWith('read.')?phrase(error.message):'';
refuse(detail||phrase('load.notpdf'));
return;
}
refuse(phrase('load.broken',{detail:error?.message??''}));
}
function render(){
const{tables,order,mark,pages}=current;
const built=tables
.map((table)=>buildTable(table,{order,mark}))
.filter((table)=>table.rows.length)
.map((table,index)=>({...table,n:index+1}));
if(!built.length){
refuse(phrase('scan.notables'));
return;
}
clearLoadError();
el.tableCard.hidden=false;
el.resultCard.hidden=false;
offerPicks(built);
const shown=current.pick===ALL
?built
:built.filter((table)=>String(table.n)===current.pick);
const rows=built.reduce((sum,table)=>sum+table.rows.length,0);
el.summary.textContent=built.length===1
?phrase('sum.one',{rows:countOf('rows',rows),pages:countOf('pages',pages)})
:phrase('sum.many',{
tables:countOf('tables',built.length),
rows:countOf('rows',rows),
pages:countOf('pages',pages),
});
const outputs=shown.map((table)=>{
const proof=checkBalance(table.rows,table.moneyColumns,mark);
return{table,proof,grid:normalise(table,proof,order,mark)};
});
sayCheck(outputs,shown.length>1);
drawPreviews(outputs);
const grid=outputs.flatMap(({grid:g},index)=>(index?[[],...g]:g));
const spreadsheetSafe=el.exportMode.value!=='raw';
const affected=formulaCells(grid);
const csv=toCsv(grid,{spreadsheetSafe});
el.exportNote.textContent=phrase(spreadsheetSafe?'export.safe':'export.raw',
{n:affected});
offerCsv.offer(csv,phrase('result.name',{name:baseName(current.file.name)}));
facts(outputs,csv);
}
function offerPicks(built){
el.tableField.hidden=built.length<2;
if(built.length<2){
current.pick=ALL;
return;
}
const options=[
[ALL,phrase('pick.all',{tables:countOf('tables',built.length)})],
...built.map((table)=>[String(table.n),labelOf(table)]),
];
el.tablePick.replaceChildren(...options.map(([value,text])=>{
const option=document.createElement('option');
option.value=value;
option.textContent=text;
return option;
}));
if(!options.some(([value])=>value===current.pick))current.pick=ALL;
el.tablePick.value=current.pick;
}
function labelOf(table){
return phrase('table.label',{
n:table.n,
page:table.page,
rows:countOf('rows',table.rows.length),
columns:countOf('columns',table.headers.length),
});
}
function normalise(table,proof,order,mark){
const money=new Set(proof?[proof.balance,...proof.amounts]:table.moneyColumns);
const headers=table.headers.map((given,at)=>given||columnLetter(at));
const rows=table.rows.map((row)=>row.cells.map((cell,at)=>{
if(at===table.dateColumn)return parseDate(cell,order)??cell;
if(!money.has(at)||!cell)return cell;
const value=parseAmount(cell,mark);
return value===null?cell:{value:formatAmount(value),numeric:true};
}));
return[headers,...rows];
}
function sayCheck(outputs,several){
el.checkLine.classList.remove('held','broke');
el.checkLine.textContent='';
const checked=outputs.filter(({proof})=>proof);
if(!checked.length)return;
const broken=checked.find(({proof})=>proof.broken.length);
const partial=checked.find(({proof})=>proof.unchecked.length);
const{table,proof}=broken??partial??checked[0];
let verdict;
if(broken){
const where=proof.broken.length===1
?phrase('check.row',{n:proof.broken[0]})
:phrase('check.rows',{list:proof.broken.join(', ')});
verdict=phrase('check.broke',{held:proof.held,links:proof.links,where});
el.checkLine.classList.add('broke');
}else{
verdict=phrase('check.held',{links:proof.links});
if(!proof.unchecked.length)el.checkLine.classList.add('held');
}
if(proof.unchecked.length){
const where=proof.unchecked.length===1
?phrase('check.row',{n:proof.unchecked[0]})
:phrase('check.rows',{list:proof.unchecked.join(', ')});
verdict=phrase('check.summary',{verdict,note:phrase('check.unchecked',{where})});
}
el.checkLine.textContent=several?phrase('check.intable',{n:table.n,verdict}):verdict;
}
function drawPreviews(outputs){
const spreadsheetSafe=el.exportMode.value!=='raw';
el.previews.replaceChildren(...outputs.map(({table,proof,grid:[headers,...rows]})=>{
const block=document.createElement('div');
block.className='preview-block';
const wrap=document.createElement('div');
wrap.className='preview-wrap';
block.append(wrap);
const element=document.createElement('table');
element.className='preview';
const caption=document.createElement('caption');
caption.className='preview-caption';
caption.textContent=labelOf(table);
const head=document.createElement('thead');
const headRow=document.createElement('tr');
headRow.replaceChildren(...[phrase('preview.row'),...headers.map((cell)=>
csvValue(cell,{spreadsheetSafe}))].map((name)=>{
const cell=document.createElement('th');
cell.scope='col';
cell.textContent=name;
return cell;
}));
head.append(headRow);
const body=document.createElement('tbody');
element.append(caption,head,body);
wrap.append(element);
const nav=document.createElement('div');
nav.className='preview-nav';
nav.setAttribute('role','group');
nav.setAttribute('aria-label',phrase('preview.controls',{n:table.n}));
block.append(nav);
const range=document.createElement('p');
range.className='preview-range';
range.setAttribute('role','status');
range.setAttribute('aria-live','polite');
nav.append(range);
const button=(key)=>{
const control=document.createElement('button');
control.type='button';
control.className='ghost';
control.textContent=phrase(key);
nav.append(control);
return control;
};
const previous=button('preview.previous');
const next=button('preview.next');
const label=document.createElement('label');
label.textContent=phrase('preview.jump');
label.htmlFor=`preview-jump-${table.n}`;
const jump=document.createElement('input');
jump.type='number';
jump.id=label.htmlFor;
jump.min='1';
jump.max=String(rows.length);
jump.step='1';
jump.required=true;
nav.append(label,jump);
const go=button('preview.go');
let first=0;
let last=0;
const warnings=new Set([...(proof?.broken??[]),...(proof?.unchecked??[])]);
function paint(row,focus=false){
const window=previewWindow(rows.length,row,PREVIEW_ROWS);
first=window.start;
last=window.end;
previewRows.set(table.n,first+1);
body.replaceChildren(...rows.slice(first,last).map((values,offset)=>{
const n=first+offset+1;
const line=document.createElement('tr');
line.id=`preview-${table.n}-row-${n}`;
line.tabIndex=-1;
line.classList.toggle('review-row',warnings.has(n));
const number=document.createElement('th');
number.scope='row';
number.textContent=warnings.has(n)?phrase('preview.review',{n}):String(n);
line.replaceChildren(number,...values.map((value)=>{
const cell=document.createElement('td');
cell.textContent=csvValue(value,{spreadsheetSafe});
return cell;
}));
return line;
}));
range.textContent=phrase('preview.range',{first:first+1,last,total:rows.length});
previous.disabled=first===0;
next.disabled=last===rows.length;
jump.value=String(Math.max(first+1,Math.min(last,Math.floor(row))));
if(focus){
const line=body.querySelector(`#preview-${table.n}-row-${jump.value}`);
line?.focus({preventScroll:true});
line?.scrollIntoView({block:'nearest',inline:'nearest'});
}
}
previous.addEventListener('click',()=>paint(Math.max(1,first-PREVIEW_ROWS+1)));
next.addEventListener('click',()=>paint(last+1));
const goToRow=()=>{if(jump.reportValidity())paint(Number(jump.value),true);};
go.addEventListener('click',goToRow);
jump.addEventListener('keydown',(event)=>{
if(event.key==='Enter'){event.preventDefault();goToRow();}
});
const flagged=proof?.broken[0]??proof?.unchecked[0];
if(flagged){
const review=button(proof.broken.length?'preview.mismatch':'preview.unchecked');
review.addEventListener('click',()=>paint(flagged,true));
}
for(const control of[previous,next,label,jump,go])control.hidden=rows.length<=PREVIEW_ROWS;
paint(previewRows.get(table.n)??1);
return block;
}));
}
function facts(outputs,csv){
const rows=outputs.reduce((sum,{table})=>sum+table.rows.length,0);
const lines=[outputs.length===1
?phrase('fact.shape',{
rows:countOf('rows',rows),
columns:countOf('columns',outputs[0].table.headers.length),
})
:phrase('fact.tables',{
rows:countOf('rows',rows),
tables:countOf('tables',outputs.length),
})];
if(outputs.some(({table})=>table.dateColumn>=0))lines.push(phrase('fact.dates'));
if(outputs.some(({table,proof})=>proof||table.moneyColumns.length)){
lines.push(phrase('fact.amounts'));
}
lines.push(`${phrase('fact.encoding')} · ${size(new Blob([csv]).size)}`);
el.resultFacts.replaceChildren(...lines.map((text)=>{
const item=document.createElement('li');
item.textContent=text;
return item;
}));
}
const COUNTS={
pages:['count.pages.one','count.pages.many'],
rows:['count.rows.one','count.rows.many'],
columns:['count.columns.one','count.columns.many'],
tables:['count.tables.one','count.tables.many'],
};
function countOf(thing,n){
const[one,many]=COUNTS[thing];
return phrase(n===1?one:many,{n});
}
const size=(n)=>sizeText(n,phrase,{under:'size.bytes'});
const fileFactsText=(pages,bytes)=>`${countOf('pages', pages)} · ${size(bytes)}`;
function baseName(name){
return name.replace(/\.[^.]+$/,'')||'tables';
}
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
window.addEventListener('error',(event)=>{
showLoadError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showLoadError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
document.getElementById('boot-warning')?.remove();
