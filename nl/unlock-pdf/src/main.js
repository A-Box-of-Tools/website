/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ltr,phrase}from'./shared/phrases.js?v=879b53dba1';
import{messageBox}from'./shared/message-box.js?v=879b53dba1';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=879b53dba1';
import{sizeText}from'./shared/format.js?v=879b53dba1';
import{NotAPdfError,PdfDocument}from'./shared/pdf-reader.js?v=879b53dba1';
import{stripMetadata,writeDocument}from'./shared/pdf-writer.js?v=879b53dba1';
import{standardSecurity,WrongPasswordError}from'./crypt.js?v=879b53dba1';
import{refusedIn}from'./permissions.js?v=879b53dba1';
import{outName,pages,scheme,strength}from'./format.js?v=879b53dba1';
import{makeExample}from'./example.js?v=879b53dba1';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
fileRow:$('file-row'),
fileName:$('file-name'),
fileFacts:$('file-facts'),
clearFile:$('clear-file'),
loadError:$('load-error'),
loadNote:$('load-note'),
verdict:$('verdict'),
schemeList:$('scheme'),
schemeWhat:$('scheme-what'),
schemeStrength:$('scheme-strength'),
schemeOpen:$('scheme-open'),
schemePages:$('scheme-pages'),
restrictions:$('restrictions'),
restrictionsLede:$('restrictions-lede'),
restrictionList:$('restriction-list'),
passwordRow:$('password-row'),
password:$('password'),
reveal:$('reveal'),
tryPassword:$('try-password'),
passwordError:$('password-error'),
runCard:$('run-card'),
stripMeta:$('strip-meta'),
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
const NOTHING_YET=el.verdict.textContent;
const{show:showLoadError}=messageBox(el.loadError);
const{show:showPasswordError}=messageBox(el.passwordError);
const{show:note}=messageBox(el.loadNote);
let loaded=null;
let waitingOn=null;
let downloadUrl='';
let running=null;
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
picker.busy(readingLabel(1));
try{
if(!looksLikePdf(file))throw new NotAPdfError('read.notpdf');
const bytes=new Uint8Array(await file.arrayBuffer());
waitingOn={file,bytes};
el.fileName.textContent=file.name;
el.fileFacts.textContent=size(bytes.length);
el.fileRow.hidden=false;
await attempt('');
}catch(error){
showLoadError(messageFor(error));
picker.waiting();
}finally{
picker.done();
}
}
async function attempt(password){
if(!waitingOn)return false;
const{unlock,report}=standardSecurity(password);
try{
const doc=await PdfDocument.open(waitingOn.bytes,{unlock});
loaded={...waitingOn,doc,report};
el.passwordRow.hidden=true;
el.passwordError.hidden=true;
el.password.value='';
describe();
if(doc.repaired)note(phrase('note.repaired'));
else if(doc.incremental)note(phrase('note.incremental'));
return true;
}catch(error){
if(error instanceof WrongPasswordError){
askForPassword(password!=='');
return false;
}
throw error;
}
}
function askForPassword(afterATry){
el.verdict.textContent=phrase('verdict.locked');
el.schemeList.hidden=true;
el.restrictions.hidden=true;
el.passwordRow.hidden=false;
if(afterATry)showPasswordError(phrase('crypt.wrongpassword'));
else el.passwordError.hidden=true;
waitFor('waiting.password');
el.password.focus();
}
function describe(){
const{report,doc}=loaded;
if(!report.encrypted){
el.verdict.textContent=phrase('verdict.none');
el.schemeList.hidden=true;
el.restrictions.hidden=true;
waitFor('waiting.nothing');
return;
}
el.verdict.textContent=phrase(
report.opened==='blank'?'verdict.restricted':'verdict.open');
picker.arrived();
el.schemeWhat.textContent=say(scheme(report));
el.schemeStrength.textContent=phrase(strength(report));
el.schemeOpen.textContent=[
phrase(`open.${report.opened}`),
report.keyConfirmed?phrase('open.keyconfirmed'):'',
].filter(Boolean).join(' ');
el.schemePages.textContent=ltr(phrase('scheme.sizepages',{
size:plainSize(loaded.bytes.length),
pages:say(pages(doc.countPages())),
}));
el.schemeList.hidden=false;
renderRestrictions(refusedIn(report.restrictions));
el.restrictions.hidden=false;
}
function renderRestrictions(refused){
el.restrictionsLede.textContent=phrase(
refused.length?'restrictions.some':'restrictions.none');
el.restrictionList.replaceChildren(...refused.map((entry)=>{
const row=document.createElement('li');
row.textContent=phrase(entry.id);
return row;
}));
}
function waitFor(key){
picker.waiting();
const line=el.runCard.querySelector('.card-waiting');
if(line)line.textContent=phrase(key);
}
el.tryPassword.addEventListener('click',submitPassword);
el.password.addEventListener('keydown',(event)=>{
if(event.key==='Enter')submitPassword();
});
async function submitPassword(){
if(!waitingOn||running)return;
const typed=el.password.value;
if(!typed)return;
el.tryPassword.disabled=true;
try{
await attempt(typed);
}catch(error){
showPasswordError(messageFor(error));
}finally{
el.tryPassword.disabled=false;
}
}
el.reveal.addEventListener('click',()=>{
const showing=el.password.type==='text';
el.password.type=showing?'password':'text';
el.reveal.setAttribute('aria-pressed',String(!showing));
el.reveal.textContent=phrase(showing?'password.show':'password.hide');
el.password.focus();
});
el.run.addEventListener('click',run);
el.cancel.addEventListener('click',()=>running?.abort());
el.clearFile.addEventListener('click',()=>{
reset();
picker.waiting();
});
async function run(){
if(!loaded||running)return;
running=new AbortController();
el.run.disabled=true;
el.cancel.hidden=false;
el.result.hidden=true;
el.runError.hidden=true;
el.progress.hidden=false;
setProgress(0,1,phrase('stage.writing'));
releaseDownload();
let cancelled=false;
try{
const metadata=el.stripMeta.checked?stripMetadata(loaded.doc):0;
const signed=hasSignature(loaded.doc);
const blob=await writeDocument(loaded.doc,{
signal:running.signal,
onProgress:(done,total)=>setProgress(done,total,null),
});
setProgress(1,1,phrase('stage.checking'));
const check=await verify(blob,loaded.doc.countPages());
showResult({blob,check,metadata,signed});
}catch(error){
if(error?.name==='AbortError'){
cancelled=true;
el.progressLabel.textContent=phrase('run.cancelled');
}else{
el.runError.textContent=messageFor(error);
el.runError.hidden=false;
}
}finally{
running=null;
el.run.disabled=false;
el.cancel.hidden=true;
el.progress.hidden=!cancelled;
if(cancelled)el.progressBar.style.width='0%';
}
}
async function verify(blob,expected){
try{
const again=await PdfDocument.open(new Uint8Array(await blob.arrayBuffer()));
const found=again.countPages();
if(found!==expected){
return{ok:false,text:{key:'check.pages',values:{pages:found,expected}}};
}
return{
ok:true,
text:{
key:found===1?'check.ok.one':'check.ok.many',
values:{pages:found},
},
};
}catch(error){
const key=error?.message==='read.encrypted'?'check.stilllocked':'check.reopen';
return{ok:false,text:{key,values:{detail:messageFor(error)}}};
}
}
function showResult({blob,check,metadata,signed}){
el.resultSize.textContent=phrase('result.ready',{size:size(blob.size)});
el.resultSub.textContent=phrase('result.sub');
el.checkLine.textContent=phrase(check.ok?'check.passed':'check.failed',
{found:say(check.text)});
el.checkLine.className=`check-line ${check.ok ? 'good' : 'bad'}`;
renderFacts({metadata,signed});
downloadUrl=URL.createObjectURL(blob);
el.download.href=downloadUrl;
el.download.download=outName(loaded.file.name);
el.download.hidden=!check.ok;
el.result.hidden=false;
}
function renderFacts({metadata,signed}){
const{report,doc}=loaded;
const lifted=refusedIn(report.restrictions).length;
const facts=[];
facts.push(phrase('facts.decrypted'));
if(lifted){
facts.push(lifted===1
?phrase('facts.lifted.one')
:phrase('facts.lifted',{n:lifted}));
}
if(metadata)facts.push(phrase('facts.metadata'));
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
const plainSize=(n)=>sizeText(n,phrase,{under:'size.bytes',kb:'auto'});
const size=(n)=>ltr(plainSize(n));
const say=(said)=>(said&&said.key?phrase(said.key,said.values):said??'');
function looksLikePdf(file){
return file.type==='application/pdf'||/\.pdf$/i.test(file.name);
}
function messageFor(error){
if(error instanceof NotAPdfError||error instanceof WrongPasswordError){
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
function reset(){
loaded=null;
waitingOn=null;
el.fileRow.hidden=true;
el.result.hidden=true;
el.progress.hidden=true;
el.loadError.hidden=true;
el.loadNote.hidden=true;
el.runError.hidden=true;
el.passwordRow.hidden=true;
el.passwordError.hidden=true;
el.password.value='';
el.password.type='password';
el.reveal.setAttribute('aria-pressed','false');
el.reveal.textContent=phrase('password.show');
el.verdict.textContent=NOTHING_YET;
el.schemeList.hidden=true;
el.restrictions.hidden=true;
releaseDownload();
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
document.getElementById('boot-warning')?.remove();
