/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ltr,phrase}from'./shared/phrases.js?v=98f28f8290';
import{messageBox}from'./shared/message-box.js?v=98f28f8290';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=98f28f8290';
import{sizeText}from'./shared/format.js?v=98f28f8290';
import{EncryptedPdfError,NotAPdfError,PdfDocument}from'./shared/pdf-reader.js?v=98f28f8290';
import{writeDocument}from'./shared/pdf-writer.js?v=98f28f8290';
import{
protect,standardSecurity,UnsupportedEncryptionError,WrongPasswordError,
}from'./shared/pdf-crypt.js?v=98f28f8290';
import{permissionsIn,refusedIn}from'./shared/pdf-permissions.js?v=98f28f8290';
import{outName,pages,refusedList}from'./format.js?v=98f28f8290';
import{makeExample}from'./example.js?v=98f28f8290';
import{passwordIssue}from'./password-validation.js?v=98f28f8290';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
fileRow:$('file-row'),
fileName:$('file-name'),
fileFacts:$('file-facts'),
clearFile:$('clear-file'),
loadError:$('load-error'),
unlockHint:$('unlock-hint'),
loadNote:$('load-note'),
password:$('password'),
reveal:$('reveal'),
passwordAgain:$('password-again'),
passwordStatus:$('password-status'),
restrictPrint:$('restrict-print'),
restrictCopy:$('restrict-copy'),
restrictChange:$('restrict-change'),
ownerPassword:$('owner-password'),
revealOwner:$('reveal-owner'),
schemes:document.querySelectorAll('input[name="scheme"]'),
runCard:$('run-card'),
run:$('run'),
cancel:$('cancel'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
runError:$('run-error'),
result:$('result'),
resultSize:$('result-size'),
resultSub:$('result-sub'),
download:$('download'),
checkLine:$('check-line'),
resultFacts:$('result-facts'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const BIT=(n)=>1<<(n-1);
const PRINT=BIT(3)|BIT(12);
const COPY=BIT(5);
const CHANGE=BIT(4)|BIT(6)|BIT(9)|BIT(11);
const SHORT=8;
const{show:showLoadError}=messageBox(el.loadError);
const{show:note}=messageBox(el.loadNote);
let loaded=null;
let downloadUrl='';
let running=null;
let loadGeneration=0;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
load(files[0]);
},
example:makeExample,
});
async function load(file){
if(!file||running)return;
reset();
const generation=loadGeneration;
picker.busy(readingLabel(1));
try{
if(!looksLikePdf(file))throw new NotAPdfError('read.notpdf');
const bytes=new Uint8Array(await file.arrayBuffer());
if(generation!==loadGeneration)return;
el.fileName.textContent=file.name;
el.fileFacts.textContent=size(bytes.length);
el.fileRow.hidden=false;
const{unlock,report}=standardSecurity('');
const doc=await PdfDocument.open(bytes,{unlock});
if(generation!==loadGeneration)return;
loaded={file,bytes,doc,restricted:report.encrypted};
if(report.encrypted)note(phrase('note.restricted'));
else if(doc.repaired)note(phrase('note.repaired'));
else if(doc.incremental)note(phrase('note.incremental'));
refresh();
}catch(error){
if(generation!==loadGeneration)return;
if(error instanceof WrongPasswordError){
el.unlockHint.hidden=false;
}else{
showLoadError(messageFor(error));
}
picker.waiting();
}finally{
if(generation===loadGeneration)picker.done();
}
}
for(const input of[el.password,el.passwordAgain,el.ownerPassword]){
input.addEventListener('input',settingsChanged);
}
for(const box of[el.restrictPrint,el.restrictCopy,el.restrictChange]){
box.addEventListener('change',settingsChanged);
}
for(const input of el.schemes)input.addEventListener('change',settingsChanged);
function settingsChanged(){
if(running)return;
el.result.hidden=true;
releaseDownload();
refresh();
}
function selectedRevision(){
return Number([...el.schemes].find((input)=>input.checked)?.value??6);
}
function passwordProblem(){
for(const[kind,value]of[['open',el.password.value],['owner',el.ownerPassword.value]]){
const issue=passwordIssue(value,selectedRevision());
if(issue)return{kind,key:`status.${kind}.${issue.key}`,values:issue.values};
}
return null;
}
function settings(){
const userPassword=el.password.value;
if(userPassword!==el.passwordAgain.value||passwordProblem())return null;
let permissions=-1;
if(el.restrictPrint.checked)permissions&=~PRINT;
if(el.restrictCopy.checked)permissions&=~COPY;
if(el.restrictChange.checked)permissions&=~CHANGE;
if(!userPassword&&permissions===-1)return null;
return{
userPassword,
ownerPassword:el.ownerPassword.value,
permissions,
revision:selectedRevision(),
};
}
function refresh(){
if(running)return;
const typed=el.password.value;
const again=el.passwordAgain.value;
const restricting=el.restrictPrint.checked||el.restrictCopy.checked
||el.restrictChange.checked;
let key;
let values={};
if(!typed&&!again){
key=restricting?'status.restrictonly':'status.nothing';
if(!restricting&&!loaded)key='status.blank';
}else if(typed!==again){
key='status.mismatch';
}else{
const n=Array.from(typed).length;
key=n<SHORT?'status.short':'status.ok';
values={n};
}
const problem=typed===again?passwordProblem():null;
if(problem){key=problem.key;values=problem.values;}
el.passwordStatus.textContent=phrase(key,values);
el.passwordStatus.classList.toggle('bad',Boolean(problem)||key==='status.mismatch');
const openInvalid=key==='status.mismatch'||problem?.kind==='open';
el.password.setAttribute('aria-invalid',String(openInvalid));
el.passwordAgain.setAttribute('aria-invalid',String(openInvalid));
el.ownerPassword.setAttribute('aria-invalid',String(problem?.kind==='owner'));
gate(Boolean(loaded)&&settings()!==null);
}
function gate(ready){
const line=el.runCard.querySelector('.card-waiting');
if(ready){
el.runCard.removeAttribute('inert');
line?.remove();
return;
}
el.runCard.setAttribute('inert','');
if(!line){
const waiting=document.createElement('p');
waiting.className='card-waiting';
waiting.textContent=phrase('waiting.settings');
el.runCard.querySelector('h2').after(waiting);
}
}
function wireReveal(button,input){
button.addEventListener('click',()=>{
const showing=input.type==='text';
input.type=showing?'password':'text';
button.setAttribute('aria-pressed',String(!showing));
button.textContent=phrase(showing?'password.show':'password.hide');
input.focus();
});
}
wireReveal(el.reveal,el.password);
wireReveal(el.revealOwner,el.ownerPassword);
el.run.addEventListener('click',run);
el.cancel.addEventListener('click',()=>running?.abort());
el.clearFile.addEventListener('click',()=>{
reset();
el.dropzone.focus();
});
async function run(){
const chosen=loaded&&settings();
if(!chosen||running)return;
const input=loaded;
const controller=new AbortController();
running=controller;
lockSettings(true);
el.run.disabled=true;
el.cancel.hidden=false;
el.result.hidden=true;
el.runError.hidden=true;
el.progress.hidden=false;
setProgress(0,1,phrase('stage.keys'));
releaseDownload();
let cancelled=false;
try{
const id=crypto.getRandomValues(new Uint8Array(16));
const security=await protect({...chosen,id});
if(running!==controller)return;
controller.signal.throwIfAborted();
const signed=hasSignature(input.doc);
const expected=input.doc.countPages();
setProgress(0,1,phrase('stage.writing'));
const blob=await writeDocument(input.doc,{
security,
signal:controller.signal,
onProgress:(done,total)=>{
if(running===controller)setProgress(done,total,null);
},
});
if(running!==controller)return;
controller.signal.throwIfAborted();
setProgress(1,1,phrase('stage.checking'));
const check=await verify(blob,chosen,expected);
if(running!==controller)return;
controller.signal.throwIfAborted();
showResult({blob,check,chosen,security,signed},input);
}catch(error){
if(running!==controller)return;
if(error?.name==='AbortError'){
cancelled=true;
el.progressLabel.textContent=phrase('run.cancelled');
}else{
el.runError.textContent=messageFor(error);
el.runError.hidden=false;
}
}finally{
if(running===controller){
running=null;
lockSettings(false);
el.run.disabled=false;
el.cancel.hidden=true;
el.progress.hidden=!cancelled;
if(cancelled)el.progressBar.style.width='0%';
refresh();
}
}
}
async function verify(blob,chosen,expected){
const bytes=new Uint8Array(await blob.arrayBuffer());
try{
await PdfDocument.open(bytes);
return{ok:false,text:{key:'check.open',values:{}}};
}catch(error){
if(!(error instanceof EncryptedPdfError)){
return{ok:false,text:{key:'check.reopen',values:{detail:messageFor(error)}}};
}
}
const{unlock,report}=standardSecurity(chosen.userPassword);
let again;
try{
again=await PdfDocument.open(bytes,{unlock});
}catch(error){
return{ok:false,text:{key:'check.stillshut',values:{detail:messageFor(error)}}};
}
const found=again.countPages();
if(found!==expected){
return{ok:false,text:{key:'check.pages',values:{pages:found,expected}}};
}
const refused=refusedIn(report.restrictions).map((entry)=>entry.bit);
const asked=refusedIn(permissionsIn(chosen.permissions,report.revision))
.map((entry)=>entry.bit);
if(refused.join()!==asked.join()){
return{ok:false,text:{key:'check.permissions',values:{}}};
}
return{
ok:true,
text:{
key:chosen.userPassword?'check.ok.locked':'check.ok.restricted',
values:{pages:say(pages(found))},
},
};
}
function showResult({blob,check,chosen,security,signed},input){
el.resultSize.textContent=phrase(
chosen.userPassword?'result.locked':'result.restricted',
{size:size(blob.size)},
);
el.resultSub.textContent=phrase('result.sub');
el.checkLine.textContent=phrase(check.ok?'check.passed':'check.failed',
{found:say(check.text)});
el.checkLine.className=`check-line ${check.ok ? 'good' : 'bad'}`;
renderFacts({chosen,security,signed},input);
downloadUrl=URL.createObjectURL(blob);
el.download.href=downloadUrl;
el.download.download=outName(input.file.name);
el.download.hidden=!check.ok;
el.result.hidden=false;
}
function renderFacts({chosen,security,signed},input){
const{doc,restricted}=input;
const facts=[];
facts.push(phrase(security.revision===6?'facts.scheme.aes256':'facts.scheme.aes128'));
facts.push(phrase(chosen.userPassword?'facts.userpassword':'facts.nouserpassword'));
const refused=[];
if((chosen.permissions&PRINT)!==PRINT)refused.push(phrase('perm.print'));
if((chosen.permissions&COPY)!==COPY)refused.push(phrase('perm.copy'));
if((chosen.permissions&CHANGE)!==CHANGE)refused.push(phrase('perm.change'));
const list=refusedList(refused);
facts.push(list
?phrase('facts.restrictions',{list:say(list)})
:phrase('facts.norestrictions'));
if(list){
if(chosen.ownerPassword)facts.push(phrase('facts.owner.own'));
else if(chosen.userPassword)facts.push(phrase('facts.owner.same'));
else facts.push(phrase('facts.owner.random'));
}
if(restricted)facts.push(phrase('facts.replaced'));
if(signed)facts.push(phrase('facts.signature'));
if(doc.incremental)facts.push(phrase('facts.incremental'));
if(doc.repaired)facts.push(phrase('facts.repaired'));
el.resultFacts.replaceChildren(...facts.map((text)=>{
const row=document.createElement('li');
row.textContent=text;
return row;
}));
}
function hasSignature(doc){
const form=doc.get(doc.catalog,'AcroForm');
if(form instanceof Map&&doc.get(form,'SigFlags'))return true;
for(const value of doc.objects.values()){
const dict=value instanceof Map?value:null;
if(dict&&dict.get('FT')?.value==='Sig')return true;
}
return false;
}
const size=(n)=>ltr(sizeText(n,phrase,{under:'size.bytes',kb:'auto'}));
const say=(said)=>(said&&said.key?phrase(said.key,said.values):said??'');
function looksLikePdf(file){
return file.type==='application/pdf'||/\.pdf$/i.test(file.name);
}
function messageFor(error){
if(error instanceof NotAPdfError||error instanceof WrongPasswordError
||error instanceof UnsupportedEncryptionError){
return phrase(error.message,error.values);
}
if(error?.name==='AbortError')return phrase('run.cancelled');
if(String(error?.message??'').startsWith('crypt.')){
return phrase(error.message,error.values);
}
return phrase('read.failed',
{detail:phrase(error?.message??String(error),error?.values)});
}
let stageText='';
function setProgress(done,total,stage){
if(stage!==null&&stage!==undefined)stageText=stage;
if(done!==null&&done!==undefined&&total){
el.progressBar.style.width=`${Math.round((done / Math.max(1, total)) * 100)}%`;
}
el.progressLabel.textContent=`${stageText}...`;
}
function lockSettings(locked){
for(const control of $('settings-card').querySelectorAll('input, button')){
control.disabled=locked;
}
}
function reset(){
loadGeneration+=1;
running?.abort();
running=null;
lockSettings(false);
el.run.disabled=false;
el.cancel.hidden=true;
picker.done();
picker.waiting();
loaded=null;
el.fileRow.hidden=true;
el.result.hidden=true;
el.progress.hidden=true;
el.loadError.hidden=true;
el.unlockHint.hidden=true;
el.loadNote.hidden=true;
el.runError.hidden=true;
releaseDownload();
refresh();
}
function releaseDownload(){
if(downloadUrl)URL.revokeObjectURL(downloadUrl);
downloadUrl='';
el.download.removeAttribute('href');
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
el.reveal.textContent=phrase('password.show');
el.revealOwner.textContent=phrase('password.show');
refresh();
document.getElementById('boot-warning')?.remove();
