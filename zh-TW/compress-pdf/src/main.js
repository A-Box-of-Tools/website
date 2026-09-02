/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{messageBox}from'./shared/message-box.js';
import{
compressDocument,describeSettings,PRESETS,
}from'./compress.js';
import{takeInventory,verdict}from'./inventory.js';
import{EncryptedPdfError,NotAPdfError,PdfDocument}from'./shared/pdf-reader.js';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js';
import{
bytes as humanBytes,change,count,dimensions,dpi,outName,share,
}from'./format.js';
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
inventoryCard:$('inventory-card'),
verdict:$('verdict'),
breakdownBar:$('breakdown-bar'),
breakdownList:$('breakdown-list'),
inventoryNotes:$('inventory-notes'),
settingsCard:$('settings-card'),
presets:$('presets'),
dpiValue:$('dpi-value'),
qualityValue:$('quality-value'),
qualityOut:$('quality-out'),
stripMeta:$('strip-meta'),
settingsSummary:$('settings-summary'),
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
perImage:$('per-image'),
imageList:$('image-list'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showLoadError}=messageBox(el.loadError);
const{show:note}=messageBox(el.loadNote);
let loaded=null;
let downloadUrl='';
let running=null;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
load(files[0]);
},
});
async function load(file){
if(!file||running)return;
reset();
picker.busy(readingLabel(1));
try{
if(!looksLikePdf(file)){
throw new NotAPdfError('read.notpdf');
}
const raw=new Uint8Array(await file.arrayBuffer());
const doc=await PdfDocument.open(raw);
const inventory=takeInventory(doc);
loaded={file,bytes:raw,inventory};
el.fileName.textContent=file.name;
el.fileFacts.textContent=`${say(humanBytes(raw.length))} · `
+`${say(count(inventory.pages, 'pages'))}`;
el.fileRow.hidden=false;
renderInventory(inventory);
renderSettings();
if(doc.repaired){
note(phrase('note.repaired'));
}else if(doc.incremental){
note(phrase('note.incremental'));
}
}catch(error){
showLoadError(messageFor(error));
}finally{
picker.done();
}
}
const say=(said)=>(said&&said.key?phrase(said.key,said.values):said??'');
function looksLikePdf(file){
return file.type==='application/pdf'||/\.pdf$/i.test(file.name);
}
function messageFor(error){
if(error instanceof EncryptedPdfError||error instanceof NotAPdfError){
return phrase(error.message);
}
if(error?.name==='AbortError')return phrase('run.cancelled');
return phrase('read.failed',
{detail:phrase(error?.message??String(error),error?.values)});
}
function reset(){
loaded=null;
el.fileRow.hidden=true;
el.result.hidden=true;
el.progress.hidden=true;
el.loadError.hidden=true;
el.loadNote.hidden=true;
el.runError.hidden=true;
emptyInventory();
releaseDownload();
}
function emptyInventory(){
el.verdict.textContent='';
el.verdict.className='verdict';
el.breakdownBar.replaceChildren();
el.breakdownBar.hidden=true;
el.breakdownList.replaceChildren();
el.inventoryNotes.textContent='';
}
el.clearFile.addEventListener('click',()=>{
reset();
el.dropzone.focus();
});
function renderInventory(inventory){
const said=verdict(inventory);
el.verdict.textContent=say(said.text);
el.verdict.className=`verdict ${said.tone}`;
el.breakdownBar.replaceChildren();
el.breakdownBar.hidden=false;
el.breakdownList.replaceChildren();
for(const group of inventory.groups){
const slice=document.createElement('span');
slice.className=`slice slice-${group.id}`;
slice.style.flexGrow=String(group.bytes);
slice.title=`${phrase(group.label)}: ${say(humanBytes(group.bytes))}`;
el.breakdownBar.append(slice);
const row=document.createElement('li');
const key=document.createElement('span');
key.className=`key key-${group.id}`;
const label=document.createElement('span');
label.className='key-label';
label.textContent=phrase(group.label);
const size=document.createElement('span');
size.className='key-size';
size.textContent=`${say(humanBytes(group.bytes))} · ${share(group.bytes, inventory.total)}`;
row.append(key,label,size);
el.breakdownList.append(row);
}
el.inventoryNotes.textContent=notesFor(inventory);
}
function notesFor(inventory){
const parts=[phrase('inv.size',{
size:say(humanBytes(inventory.total)),
pages:say(count(inventory.pages,'pages')),
})];
const images=inventory.groups.find((group)=>group.id==='images');
if(images)parts.push(phrase('inv.images',{images:say(count(images.count,'images'))}));
const orphans=inventory.groups.find((group)=>group.id==='orphans');
if(orphans){
parts.push(phrase('inv.orphans',{size:say(humanBytes(orphans.bytes))}));
}
const fonts=inventory.groups.find((group)=>group.id==='fonts');
if(fonts&&fonts.bytes>inventory.total*0.15){
parts.push(phrase('inv.fonts'));
}
return parts.join(' ');
}
el.presets.addEventListener('change',()=>{
const chosen=PRESETS[presetName()];
if(!chosen)return;
el.dpiValue.value=String(chosen.dpi);
el.qualityValue.value=String(Math.round(chosen.quality*100));
renderSettings();
});
for(const input of[el.dpiValue,el.qualityValue]){
input.addEventListener('input',()=>{
for(const radio of el.presets.querySelectorAll('input'))radio.checked=false;
renderSettings();
});
}
el.stripMeta.addEventListener('change',renderSettings);
function presetName(){
return el.presets.querySelector('input:checked')?.value??'';
}
function settings(){
return{
dpi:Math.max(0,Math.min(1200,Number(el.dpiValue.value)||0)),
quality:Math.max(0.3,Math.min(0.95,(Number(el.qualityValue.value)||68)/100)),
stripMeta:el.stripMeta.checked,
};
}
function renderSettings(){
const chosen=settings();
el.qualityOut.textContent=String(Math.round(chosen.quality*100));
el.settingsSummary.textContent=say(describeSettings(chosen));
}
el.run.addEventListener('click',run);
el.cancel.addEventListener('click',()=>running?.abort());
async function run(){
if(!loaded||running)return;
running=new AbortController();
el.run.disabled=true;
el.cancel.hidden=false;
el.result.hidden=true;
el.runError.hidden=true;
el.progress.hidden=false;
setProgress(0,1,phrase('stage.reading'));
releaseDownload();
let cancelled=false;
try{
const result=await compressDocument(loaded.bytes,settings(),{
signal:running.signal,
onStage:(stage)=>setProgress(null,null,phrase(stage)),
onProgress:(done,total)=>setProgress(done,total,null),
});
showResult(result);
}catch(error){
if(error?.name==='AbortError'){
cancelled=true;
el.progressLabel.textContent=phrase('run.cancelledfull');
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
let stageText='';
function setProgress(done,total,stage){
if(stage!==null&&stage!==undefined)stageText=stage;
if(done!==null&&done!==undefined&&total){
const percent=Math.round((done/Math.max(1,total))*100);
el.progressBar.style.width=`${percent}%`;
}
el.progressLabel.textContent=`${stageText}...`;
}
function showResult(result){
const saved=result.before-result.after;
el.resultSize.textContent=saved>0
?`${say(humanBytes(result.before))} → ${say(humanBytes(result.after))}`
:phrase('result.nosmaller',{size:say(humanBytes(result.after))});
el.resultSub.textContent=saved>0
?phrase('result.saved',{
change:say(change(result.before,result.after)),
size:say(humanBytes(saved)),
})
:phrase('result.alreadysmall');
el.checkLine.textContent=phrase(result.check.ok?'check.passed':'check.failed',{
found:say(result.check.text),
});
el.checkLine.className=`check-line ${result.check.ok ? 'good' : 'bad'}`;
renderFacts(result);
renderImages(result.images);
downloadUrl=URL.createObjectURL(result.blob);
el.download.href=downloadUrl;
el.download.download=outName(loaded.file.name);
el.download.hidden=!result.check.ok;
el.result.hidden=false;
}
function renderFacts(result){
const touched=result.images.filter((image)=>image.action!=='kept');
const shrunk=touched.filter((image)=>image.action==='downsampled');
const facts=[];
if(result.images.length===0){
facts.push(phrase('facts.noimages'));
}else{
facts.push(phrase(shrunk.length?'facts.reencoded.shrunk':'facts.reencoded',{
touched:touched.length,
total:result.images.length,
shrunk:shrunk.length,
}));
}
const kept=result.images.filter((image)=>image.action==='kept'&&image.note);
if(kept.length){
const reasons=new Map();
for(const image of kept)reasons.set(image.note,(reasons.get(image.note)??0)+1);
for(const[reason,howMany]of reasons){
facts.push(phrase('facts.kept',{
images:say(count(howMany,'images')),
reason:phrase(reason),
}));
}
}
if(result.metadataRemoved){
facts.push(phrase('facts.metadata',{
entries:say(count(result.metadataRemoved,'entries')),
}));
}
if(result.incremental){
facts.push(phrase('facts.incremental'));
}
if(result.repaired){
facts.push(phrase('facts.repaired'));
}
el.resultFacts.replaceChildren(...facts.map((text)=>{
const row=document.createElement('li');
row.textContent=text;
return row;
}));
}
function renderImages(images){
el.perImage.hidden=images.length===0;
if(!images.length)return;
el.imageList.replaceChildren(...images.map((image)=>{
const row=document.createElement('li');
const left=document.createElement('span');
left.className='image-what';
const size=dimensions(image.width,image.height);
left.textContent=image.action==='kept'
?phrase('row.kept',{why:phrase(image.note)})
:phrase(`row.${image.action}${image.dpiAfter ? '.dpi' : ''}`,{
size,
dpi:dpi(image.dpiAfter),
});
const right=document.createElement('span');
right.className='image-size';
right.textContent=image.after<image.before
?`${say(humanBytes(image.before))} → ${say(humanBytes(image.after))}`
:say(humanBytes(image.before));
const was=document.createElement('span');
was.className='image-was';
was.textContent=image.dpiBefore?phrase('row.was',{dpi:dpi(image.dpiBefore)}):'';
row.append(left,was,right);
return row;
}));
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
renderSettings();
document.getElementById('boot-warning')?.remove();
