/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=51082c7ef8';
import{messageBox}from'./shared/message-box.js?v=51082c7ef8';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=51082c7ef8';
import{ALGORITHMS,ORDER,Stopped}from'./hash.js?v=51082c7ef8';
import{hashSelection}from'./hash-selection.js?v=51082c7ef8';
import{algorithmsIn,readExpected,rowVerdicts,verdict,manifestVerdict}from'./expected.js?v=51082c7ef8';
import{exact,fileSize,percent,rate,remaining,smooth}from'./format.js?v=51082c7ef8';
import{makeExample}from'./example.js?v=51082c7ef8';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
loadError:$('load-error'),
runCard:$('run-card'),
progress:$('progress'),
progressTrack:$('progress-track'),
progressBar:$('progress-bar'),
progressText:$('progress-text'),
stop:$('stop'),
stopped:$('stopped'),
restart:$('restart'),
results:$('results'),
fileName:$('file-name'),
fileFacts:$('file-facts'),
digests:$('digests'),
copyAll:$('copy-all'),
downloadChecksums:$('download-checksums'),
copyStatus:$('copy-status'),
batch:$('batch'),
batchList:$('batch-list'),
batchSummary:$('batch-summary'),
saveBatch:$('save-batch'),
expected:$('expected'),
expectedRead:$('expected-read'),
verdict:$('verdict'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showError}=messageBox(el.loadError);
const boxes=new Map(
[...document.querySelectorAll('[data-algorithm]')]
.filter((node)=>node.tagName==='INPUT')
.map((node)=>[node.dataset.algorithm,node]),
);
const rows=new Map(
[...el.digests.querySelectorAll('.digest')].map((node)=>[node.dataset.algorithm,node]),
);
let chosen=null;
let selection=[];
let selected=null;
let copyVersion=0;
let activeRead=null;
let queued=null;
let digests={};
let expected={entries:[],strays:[],wrapped:false};
let running=null;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){openFiles(files);queueMicrotask(()=>{if(running)picker.busy(readingLabel(selection.length));});},
example:makeExample,
});
function openFiles(files){
hideError();
selection=files.map((file,index)=>({file,index,digests:{},error:null,state:'pending'}));
selectFile(selection[0]);
start(ticked());
}
function selectFile(record){
selected=record;
chosen=record?.file??null;
digests=record?.digests??{};
copyVersion+=1;
el.copyStatus.textContent='';
el.fileName.textContent=chosen?.name??'';
el.fileFacts.textContent=chosen?`${fileSize(chosen.size)} - ${exact(chosen.size)}`:'';
render();
}
function ticked(){
return ORDER.filter((id)=>boxes.get(id)?.checked);
}
function outstanding(){
return ticked().filter(id=>selection.some(record=>!(id in record.digests)));
}
function start(ids){
running?.abort();
queued=null;
running=null;
if(!selection.length||!ids.length){
el.progress.hidden=true;
el.stopped.hidden=true;
picker.done();
return;
}
const records=selection;
const asked=[...ids];
const controller=new AbortController();
running=controller;
const owns=()=>running===controller&&selection===records&&!controller.signal.aborted;
el.stopped.hidden=true;
picker.busy(readingLabel(records.length));
el.progress.hidden=false;
const launch=async()=>{
if(!owns())return;
activeRead=controller;
let currentFile=null;
let last=null;
let speed=null;
let failure=null;
try{
await hashSelection(records,asked,{
signal:controller.signal,
onProgress(record,done,total){
if(!owns())return;
const now=performance.now();
if(currentFile!==record){
currentFile=record;last={at:0,when:now};speed=null;
record.error=null;record.state='reading';renderBatch();
}
if(done>last.at&&now>last.when){
speed=smooth(speed,rate(done-last.at,(now-last.when)/1000));
last={at:done,when:now};
}
showProgress(done,total,speed,record);
},
onResult(record,found){
if(!owns())return;
Object.assign(record.digests,found);record.state='ready';record.error=null;
render();
},
onError(record,error){
if(!owns())return;
record.state='unreadable';record.error=error.message;
render();
},
});
}catch(error){
if(owns()&&!(error instanceof Stopped)){
failure=error;
if(currentFile)currentFile.state='pending';
}
}finally{
activeRead=null;
if(running===controller){
running=null;el.progress.hidden=true;picker.done();render();
el.stopped.hidden=!outstanding().length;
if(failure)showError(phrase('error.broke',{detail:failure.message}));
}
const next=queued;
queued=null;
if(next&&running===next.controller&&!next.controller.signal.aborted)void next.launch();
}
};
if(activeRead){
queued={controller,launch};
el.progressText.textContent=phrase('progress.waiting');
el.progressBar.style.width='0%';
el.progressTrack.setAttribute('aria-valuenow','0');
}else void launch();
renderBatch();
}
el.stop.addEventListener('click',()=>{
running?.abort();
running=null;
queued=null;
for(const record of selection){
if(ticked().some(id=>!(id in record.digests)))record.state='stopped';
}
el.progress.hidden=true;picker.done();render();
el.stopped.hidden=!outstanding().length;
});
el.restart.addEventListener('click',()=>start(outstanding()));
function showProgress(done,total,speed,record){
const fraction=total?done/total:1;
el.progressBar.style.width=`${Math.min(100, fraction * 100)}%`;
el.progressTrack.setAttribute('aria-valuenow',String(Math.round(fraction*100)));
const parts=[percent(fraction)];
if(speed){
parts.push(`${speed.toFixed(0)} MB/s`);
const left=remaining((total-done)/1048576/speed);
if(left&&done<total)parts.push(phrase('progress.remaining',{time:left}));
}
el.progressText.textContent=phrase('progress.file',{n:record.index+1,count:selection.length,name:record.file.name})+' — '+parts.join('  -  ');
}
for(const[id,box]of boxes){
box.addEventListener('change',()=>{
render();
if(box.checked&&outstanding().length)start(outstanding());
});
}
let typing=null;
el.expected.addEventListener('input',()=>{
clearTimeout(typing);
typing=setTimeout(readPaste,250);
});
function readPaste(){
expected=readExpected(el.expected.value);
let asked=false;
for(const id of algorithmsIn(expected.entries)){
const box=boxes.get(id);
if(box&&!box.checked){
box.checked=true;
asked=true;
}
}
render();
if(asked||outstanding().length)start(outstanding());
}
function render(){
el.loadError.hidden=!selected?.error;
if(selected?.error)showError(phrase('read.failed',{name:chosen.name,reason:phrase(selected.error)}));
const answer=verdict(expected.entries,digests,chosen?.name);
const comparisons=rowVerdicts(expected,digests,chosen?.name);
for(const id of ORDER){
const row=rows.get(id);
const has=id in digests;
row.hidden=!(boxes.get(id)?.checked&&has);
if(!has)continue;
row.querySelector('[data-slot="value"]').textContent=digests[id];
const matched=comparisons[id]==='match';
const differs=comparisons[id]==='mismatch';
row.querySelector('[data-slot="match"]').hidden=!matched;
row.querySelector('[data-slot="differs"]').hidden=!differs;
row.classList.toggle('is-match',matched);
row.classList.toggle('is-differs',differs);
}
el.results.hidden=!ORDER.some((id)=>id in digests);
renderRead();
renderVerdict(answer);
renderBatch();
}
function batchState(record){
if(!ticked().length)return'choose';
if(record.state==='reading'||record.state==='stopped'||record.error)return record.error?'unreadable':record.state;
if(ticked().some(id=>!(id in record.digests)))return'pending';
const answer=manifestVerdict(expected,record.digests,record.file.name);
return answer.state==='none'?'ready':answer.state==='match'&&answer.renamed?'renamed':answer.state;
}
function renderBatch(){
el.batch.hidden=selection.length<2;
if(el.batch.hidden)return;
const focus=document.activeElement?.dataset.inspectFile;
el.batchList.replaceChildren();
let matched=0;
for(const record of selection){
const state=batchState(record);
if(state==='match'||state==='renamed')matched+=1;
const row=document.createElement('li');
row.dataset.state=state;row.dataset.fileIndex=record.index;
const name=document.createElement('span');name.className='batch-name';
name.textContent=(record.index+1)+'. '+record.file.name;
const status=document.createElement('span');status.className='batch-state';
status.textContent=phrase(`batch.${state}`);
const button=document.createElement('button');button.type='button';button.className='ghost';
button.textContent=phrase('batch.inspect');
button.dataset.inspectFile=record.index;
button.setAttribute('aria-label',phrase('batch.inspect-name',{name:record.file.name,n:record.index+1}));
button.setAttribute('aria-pressed',String(record===selected));
button.addEventListener('click',()=>selectFile(record));
row.append(name,status,button);
if(record.error){
const error=document.createElement('span');error.className='batch-error';
error.textContent=phrase('read.failed',{name:record.file.name,reason:phrase(record.error)});
row.append(error);
}
el.batchList.append(row);
if(focus===String(record.index))button.focus({preventScroll:true});
}
el.batchSummary.textContent=expected.entries.length
?phrase('batch.summary',{matched,count:selection.length})
:phrase('batch.selected',{done:selection.filter(record=>ticked().length&&ticked().every(id=>id in record.digests)).length,count:selection.length});
el.saveBatch.disabled=!selection.some(record=>ticked().some(id=>id in record.digests));
}
function renderRead(){
const{entries,strays,wrapped}=expected;
const which=entries.length>1&&!wrapped?'many'
:entries.length>=1?'one'
:strays.length?'stray'
:el.expected.value.trim()?'nothing':null;
el.expectedRead.hidden=which===null;
for(const line of el.expectedRead.querySelectorAll('[data-read]')){
line.hidden=line.dataset.read!==which;
}
if(which==='one')fill(el.expectedRead,'algorithm',label(entries[0].algorithm));
if(which==='many')fill(el.expectedRead,'count',String(entries.length));
if(which==='stray')fill(el.expectedRead,'length',String(strays[0].hex.length));
}
function renderVerdict(answer){
const which=answer.state==='none'?null
:!chosen?'nofile'
:answer.state==='match'?(answer.renamed?'renamed':'match')
:answer.state;
el.verdict.hidden=which===null;
for(const line of el.verdict.querySelectorAll('[data-outcome]')){
line.hidden=line.dataset.outcome!==which;
}
if(which==='match'||which==='renamed'){
fill(el.verdict,'algorithm',label(answer.entry.algorithm));
fill(el.verdict,'name',answer.entry.name??'');
}
if(which==='mismatch')fill(el.verdict,'algorithm',label(answer.entry.algorithm));
if(which==='waiting')fill(el.verdict,'algorithm',label(answer.missing[0]));
}
function fill(root,slot,text){
for(const node of root.querySelectorAll(`[data-slot="${slot}"]`))node.textContent=text;
}
function label(id){
return rows.get(id)?.querySelector('.digest-name')?.textContent??id;
}
function checksumsFor(record){
const name=record.file.name;
const values=record.digests;
return ticked().filter(id=>id in values)
.map(id=>`${ALGORITHMS[id].tag} (${name}) = ${values[id]}`).join('\n');
}
function asText(){return selected?checksumsFor(selected):'';}
for(const[id,row]of rows){
row.querySelector('[data-slot="copy"]').addEventListener('click',async(event)=>{
event.preventDefault();
await copy(digests[id],phrase('copy.one'),()=>boxes.get(id).checked?digests[id]:'');
});
}
el.copyAll.addEventListener('click',()=>copy(asText(),phrase('copy.all'),asText));
async function copy(text,said,current){
if(!text)return;
const record=selected;
const owner=++copyVersion;
const owns=()=>selected===record&&copyVersion===owner&&current()===text;
el.copyStatus.textContent='';
try{
await navigator.clipboard.writeText(text);
if(owns())el.copyStatus.textContent=said;
}catch{
if(!owns())return;
el.copyStatus.textContent=phrase('copy.failed',{
download:el.downloadChecksums.textContent.trim(),
});
}
}
function saveChecksums(text,name){
if(!text)return;
const blob=new Blob([`${text}\n`],{type:'text/plain'});
const url=URL.createObjectURL(blob);
const link=document.createElement('a');link.href=url;link.download=name;link.click();
setTimeout(()=>URL.revokeObjectURL(url),10_000);
}
el.downloadChecksums.addEventListener('click',()=>saveChecksums(asText(),`${chosen.name}.checksums.txt`));
el.saveBatch.addEventListener('click',()=>{
const text=selection.map(checksumsFor).filter(Boolean).join('\n');
saveChecksums(text,'checksums.txt');
});
function hideError(){
el.loadError.hidden=true;
el.copyStatus.textContent='';
}
el.privacyToggle?.addEventListener('click',()=>{
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
document.getElementById('boot-warning')?.remove();
