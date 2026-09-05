/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=48fbbf8377';
import{messageBox}from'./shared/message-box.js?v=48fbbf8377';
import{bytes as humanBytes,outName,tally}from'./format.js?v=48fbbf8377';
import{
contextOf,FINDERS,findPattern,findTerm,glyphsIn,mergeRanges,wordsOf,
}from'./matches.js?v=48fbbf8377';
import{EncryptedPdfError,NotAPdfError,PdfDocument}from'./shared/pdf-reader.js?v=48fbbf8377';
import{redact}from'./redact.js?v=48fbbf8377';
import{pagesOf,readPage}from'./text.js?v=48fbbf8377';
import{harvestAll,verify}from'./verify.js?v=48fbbf8377';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=48fbbf8377';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
loadError:$('load-error'),
loadNote:$('load-note'),
docFacts:$('doc-facts'),
docName:$('doc-name'),
docSub:$('doc-sub'),
docWarnings:$('doc-warnings'),
findCard:$('find-card'),
terms:$('terms'),
find:$('find'),
matchCase:$('match-case'),
wholeWord:$('whole-word'),
finders:$('finders'),
matchBar:$('match-bar'),
matchCount:$('match-count'),
tickAll:$('tick-all'),
tickNone:$('tick-none'),
clearFound:$('clear-found'),
matchList:$('match-list'),
matchMore:$('match-more'),
pageCard:$('page-card'),
prevPage:$('prev-page'),
nextPage:$('next-page'),
pageOf:$('page-of'),
pagePicked:$('page-picked'),
clearPage:$('clear-page'),
pageNote:$('page-note'),
pageText:$('page-text'),
runCard:$('run-card'),
optBoxes:$('opt-boxes'),
optElsewhere:$('opt-elsewhere'),
optAttachments:$('opt-attachments'),
runSummary:$('run-summary'),
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
checkTerms:$('check-terms'),
resultFacts:$('result-facts'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:note}=messageBox(el.loadNote);
const MAX_ROWS=400;
let source=null;
let pages=[];
const picked=new Map();
let found=[];
let showing=0;
let running=null;
let downloadUrl='';
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
open(files[0]);
},
});
async function open(file){
if(running)return;
picker.busy(readingLabel(1));
el.loadError.hidden=true;
el.loadNote.hidden=true;
reset();
try{
if(!looksLikePdf(file))throw new NotAPdfError(phrase('load.notpdf'));
const raw=new Uint8Array(await file.arrayBuffer());
const doc=await PdfDocument.open(raw);
const list=pagesOf(doc);
if(!list.length)throw new NotAPdfError(phrase('load.nopages'));
pages=[];
for(let index=0;index<list.length;index+=1){
picker.busy(phrase('page.of',{number:index+1,total:list.length}));
pages.push(await readPage(doc,list[index],index+1));
if(index%8===7)await breathe();
}
source={
file,
raw,
doc,
read:pages,
words:pages.reduce((sum,page)=>sum+wordsOf(page).length,0),
};
if(doc.repaired)note(phrase('load.repaired'));
}catch(error){
pages=[];
source=null;
fail(messageFor(error));
}
picker.done();
render();
}
function looksLikePdf(file){
return file.type==='application/pdf'||/\.pdf$/i.test(file.name);
}
function messageFor(error){
if(error instanceof EncryptedPdfError)return phrase('load.encrypted');
if(error instanceof NotAPdfError)return phrase(error.message);
return phrase('load.broken',
{detail:phrase(error?.message??String(error),error?.values)});
}
function reset(){
source=null;
pages=[];
picked.clear();
found=[];
showing=0;
releaseDownload();
el.result.hidden=true;
el.runError.hidden=true;
}
function fail(text){
el.loadError.textContent=text;
el.loadError.hidden=false;
}
function breathe(){
return new Promise((resolve)=>{setTimeout(resolve,0);});
}
function renderDocument(){
const ready=pages.length>0&&source!==null;
el.docFacts.hidden=!ready;
if(!ready)return;
el.docName.textContent=source.file.name;
el.docSub.textContent=phrase('doc.sub',{
pages:plural(pages.length,'page'),
words:plural(source.words,'word'),
size:humanBytes(source.file.size),
});
const warnings=[];
const blank=pages.filter((page)=>!page.text.trim()).length;
const unreadable=pages.reduce((sum,page)=>sum+page.unreadable,0);
const scanned=pages.some((page)=>page.glyphs.some((glyph)=>glyph.invisible));
if(blank)warnings.push(phrase('doc.notext',{count:blank}));
if(unreadable)warnings.push(phrase('doc.unreadable',{count:tally(unreadable)}));
if(scanned)warnings.push(phrase('doc.scan'));
el.docWarnings.replaceChildren(...warnings.map((text)=>{
const item=document.createElement('li');
item.textContent=text;
return item;
}));
}
function renderFinders(){
el.finders.replaceChildren(...FINDERS.map((finder)=>{
const label=document.createElement('label');
label.className='chip';
const box=document.createElement('input');
box.type='checkbox';
box.dataset.finder=finder.id;
const text=document.createElement('span');
text.textContent=phrase(`finder.${finder.id}`);
label.append(box,text);
return label;
}));
}
function search(){
const terms=el.terms.value.split('\n').map((line)=>line.trim()).filter(Boolean);
const chosen=[...el.finders.querySelectorAll('input:checked')]
.map((box)=>box.dataset.finder);
if(!terms.length&&!chosen.length){
note(phrase('find.terms'));
return;
}
el.loadNote.hidden=true;
const how={matchCase:el.matchCase.checked,wholeWord:el.wholeWord.checked};
const hits=[];
pages.forEach((page,index)=>{
for(const term of terms){
for(const range of findTerm(page.text,term,how)){
hits.push({page:index,...range,kind:'term'});
}
}
for(const id of chosen){
for(const range of findPattern(page.text,id)){
hits.push({page:index,...range,kind:id});
}
}
});
found=hits.map((hit)=>({
...hit,
text:pages[hit.page].text.slice(hit.from,hit.to),
key:`${hit.from}:${hit.to}`,
}));
for(const hit of found){
if(hit.kind==='term')pick(hit.page,hit);
}
showing=MAX_ROWS;
render();
}
function renderMatches(){
const any=found.length>0;
el.matchBar.hidden=!any;
el.matchList.hidden=!any;
el.matchMore.hidden=found.length<=showing;
if(!any){
el.matchList.replaceChildren();
return;
}
const onPages=new Set(found.map((hit)=>hit.page)).size;
el.matchCount.textContent=phrase('find.some',{
count:plural(found.length,'match','matches'),
pages:plural(onPages,'page'),
});
el.matchMore.textContent=phrase('find.more',{shown:tally(showing)});
el.matchList.replaceChildren(...found.slice(0,showing).map((hit)=>matchRow(hit)));
}
function matchRow(hit){
const page=pages[hit.page];
const item=document.createElement('li');
item.className='match-row';
const label=document.createElement('label');
label.className='match-label';
const box=document.createElement('input');
box.type='checkbox';
box.checked=isPicked(hit.page,hit);
box.addEventListener('change',()=>{
if(box.checked)pick(hit.page,hit);
else unpick(hit.page,hit);
renderPage();
renderRun();
});
const number=document.createElement('span');
number.className='match-page';
number.textContent=phrase('page.short',{n:page.number});
const line=document.createElement('span');
line.className='match-line';
const{before,after}=contextOf(page,hit.from,hit.to);
const mark=document.createElement('mark');
mark.textContent=hit.text;
line.append(clip(before,true),mark,clip(after,false));
label.append(box,number,line);
item.append(label);
return item;
}
function clip(text,fromEnd){
const limit=46;
if(text.length<=limit)return text;
return fromEnd?`…${text.slice(-limit)}`:`${text.slice(0, limit)}…`;
}
function pick(index,range){
if(!picked.has(index))picked.set(index,new Map());
picked.get(index).set(`${range.from}:${range.to}`,{
from:range.from,to:range.to,text:range.text,
});
}
function unpick(index,range){
picked.get(index)?.delete(`${range.from}:${range.to}`);
}
function isPicked(index,range){
return picked.get(index)?.has(`${range.from}:${range.to}`)??false;
}
function markedOn(index){
const page=pages[index];
const marked=new Uint8Array(page.text.length);
for(const range of picked.get(index)?.values()??[]){
for(let at=range.from;at<range.to&&at<marked.length;at+=1)marked[at]=1;
}
return marked;
}
function pickedCount(){
let total=0;
for(const ranges of picked.values())total+=ranges.size;
return total;
}
let current=0;
function renderPage(){
if(!pages.length)return;
current=Math.min(Math.max(current,0),pages.length-1);
const page=pages[current];
el.pageOf.textContent=phrase('page.of',{
number:page.number,total:pages.length,
});
el.prevPage.disabled=current===0;
el.nextPage.disabled=current===pages.length-1;
const here=picked.get(current)?.size??0;
el.pagePicked.textContent=here?phrase('page.picked',{count:here}):'';
el.clearPage.disabled=here===0;
const notes=[];
if(!page.text.trim())notes.push(phrase('page.notext'));
if(page.unreadable)notes.push(phrase('page.unreadable',{count:page.unreadable}));
if(page.glyphs.some((glyph)=>glyph.invisible))notes.push(phrase('page.scan'));
el.pageNote.textContent=notes.join(' ');
el.pageNote.hidden=!notes.length;
const marked=markedOn(current);
const words=wordsOf(page);
const lines=document.createDocumentFragment();
let at=0;
let index=0;
for(const line of page.lines){
const row=document.createElement('p');
row.className='text-line';
at=line.from;
while(index<words.length&&words[index].from<line.to){
const word=words[index];
if(word.from>at)row.append(page.text.slice(at,word.from));
row.append(wordSpan(word,marked));
at=word.to;
index+=1;
}
if(at<line.to)row.append(page.text.slice(at,line.to));
if(!row.childNodes.length)row.append(' ');
lines.append(row);
}
el.pageText.replaceChildren(lines);
}
function wordSpan(word,marked){
const span=document.createElement('span');
span.className='word';
span.dataset.from=String(word.from);
span.dataset.to=String(word.to);
let run='';
let state=marked[word.from]===1;
let any=state;
const flush=()=>{
if(!run)return;
if(state){
const gone=document.createElement('s');
gone.textContent=run;
span.append(gone);
}else{
span.append(run);
}
run='';
};
for(let at=word.from;at<word.to;at+=1){
const now=marked[at]===1;
if(now!==state){
flush();
state=now;
}
any=any||now;
run+=pages[current].text[at];
}
flush();
if(any)span.classList.add('picked');
return span;
}
el.pageText.addEventListener('click',(event)=>{
const span=event.target.closest?.('.word');
if(!span||!pages.length)return;
const from=Number(span.dataset.from);
const to=Number(span.dataset.to);
const marked=markedOn(current);
let whole=true;
for(let at=from;at<to;at+=1)if(!marked[at])whole=false;
if(whole){
for(const[key,range]of picked.get(current)??[]){
if(range.from<to&&range.to>from)picked.get(current).delete(key);
}
}else{
pick(current,{from,to,text:pages[current].text.slice(from,to)});
}
render();
});
function renderRun(){
const count=pickedCount();
const onPages=[...picked.values()].filter((ranges)=>ranges.size).length;
el.runSummary.textContent=count
?phrase('run.summary',{
words:plural(count,'piece','pieces'),pages:plural(onPages,'page'),
})
:phrase('run.nothing');
el.run.disabled=!count||Boolean(running);
}
async function go(){
if(running||!source)return;
const controller=new AbortController();
running=controller;
el.runError.hidden=true;
el.result.hidden=true;
el.cancel.hidden=false;
el.progress.hidden=false;
releaseDownload();
step(0.1,phrase('run.editing'));
renderRun();
try{
const{doc,read:fresh}=await documentToEdit();
const chosen=new Map();
const texts=new Set();
picked.forEach((ranges,index)=>{
const page=fresh[index];
if(!page)return;
const glyphs=new Set();
for(const range of mergeRanges([...ranges.values()])){
for(const glyph of glyphsIn(page,range.from,range.to))glyphs.add(glyph);
const text=page.text.slice(range.from,range.to).trim();
if(text)texts.add(text);
}
if(glyphs.size)chosen.set(index,glyphs);
});
const before=await harvestAll(doc,fresh);
step(0.45,phrase('run.writing'));
const result=await redact(doc,fresh,chosen,{
boxes:el.optBoxes.checked,
elsewhere:el.optElsewhere.checked,
attachments:el.optAttachments.checked,
texts:[...texts],
},{signal:controller.signal});
step(0.8,phrase('run.checking'));
const check=await verify(result.bytes,{
text:before,
pages:fresh.length,
terms:[...texts].map((text)=>({text,removed:countPicked(fresh,text)})),
});
step(1,'');
show(result,check,texts.size);
}catch(error){
if(error?.name==='AbortError')showRunError(phrase('run.cancelled'));
else showRunError(phrase('run.failed',{detail:error?.message??error}));
}
running=null;
el.cancel.hidden=true;
el.progress.hidden=true;
renderRun();
}
async function documentToEdit(){
if(!source.spent&&source.doc&&source.read){
source.spent=true;
return{doc:source.doc,read:source.read};
}
const doc=await PdfDocument.open(source.raw);
const list=pagesOf(doc);
const read=[];
for(let index=0;index<list.length;index+=1){
read.push(await readPage(doc,list[index],index+1));
if(index%8===7)await breathe();
}
return{doc,read};
}
function countPicked(read,text){
let count=0;
picked.forEach((ranges,index)=>{
const page=read[index];
if(!page)return;
for(const range of ranges.values()){
if(page.text.slice(range.from,range.to).trim()===text)count+=1;
}
});
return count;
}
function step(fraction,label){
el.progressBar.style.width=`${Math.round(fraction * 100)}%`;
el.progressLabel.textContent=label;
}
function showRunError(text){
el.runError.textContent=text;
el.runError.hidden=false;
}
function show(result,check,terms){
if(!check.ok){
showRunError(phrase(check.problem));
return;
}
const changed=result.report.pages.length;
const boxes=result.report.pages.reduce((sum,page)=>sum+page.boxes,0);
el.resultSize.textContent=phrase('result.headline',{
words:plural(pickedCount(),'piece','pieces'),
});
el.resultSub.textContent=phrase('result.sub',{
size:humanBytes(result.bytes.length),
pages:plural(changed,'page'),
boxes:plural(boxes,'box','boxes'),
});
const clean=check.terms.every((term)=>term.now===0);
el.checkLine.textContent=phrase(clean?'check.good':'check.partial');
el.checkLine.className='check-line good';
el.checkTerms.hidden=terms===0;
el.checkTerms.replaceChildren(...check.terms.map((term)=>{
const item=document.createElement('li');
item.textContent=phrase('term.change',{
text:term.text,was:term.was,now:term.now,
});
return item;
}));
el.resultFacts.replaceChildren(...facts(result.report,boxes).map((text)=>{
const item=document.createElement('li');
item.textContent=text;
return item;
}));
downloadUrl=URL.createObjectURL(new Blob([result.bytes],{type:'application/pdf'}));
el.download.href=downloadUrl;
el.download.download=outName(source.file.name);
el.result.hidden=false;
}
function facts(report,boxes){
const lines=[];
lines.push(boxes
?phrase('fact.boxes',{count:plural(boxes,'box','boxes')})
:phrase('fact.noboxes'));
if(report.strings.changed){
lines.push(phrase('fact.elsewhere',{
where:report.strings.where
.map((key)=>phrase(key))
.reduce((a,b)=>phrase('join.comma',{a,b})),
}));
}
lines.push(phrase('fact.metadata'));
if(report.attachments||report.actions){
lines.push(phrase('fact.carried',{
attachments:plural(report.attachments,'attachment'),
actions:plural(report.actions,'action'),
}));
}
if(report.shared)lines.push(phrase('fact.shared'));
if(report.overImage){
lines.push(phrase('fact.overimage',{count:tally(report.overImage)}));
}
lines.push(phrase('fact.untouched'));
return lines;
}
function releaseDownload(){
if(downloadUrl)URL.revokeObjectURL(downloadUrl);
downloadUrl='';
el.download.removeAttribute('href');
}
el.find.addEventListener('click',search);
el.terms.addEventListener('keydown',(event)=>{
if(event.key==='Enter'&&(event.metaKey||event.ctrlKey))search();
});
el.tickAll.addEventListener('click',()=>{
for(const hit of found)pick(hit.page,hit);
render();
});
el.tickNone.addEventListener('click',()=>{
for(const hit of found)unpick(hit.page,hit);
render();
});
el.clearFound.addEventListener('click',()=>{
found=[];
render();
});
el.prevPage.addEventListener('click',()=>{current-=1;render();});
el.nextPage.addEventListener('click',()=>{current+=1;render();});
el.clearPage.addEventListener('click',()=>{
picked.delete(current);
render();
});
el.run.addEventListener('click',go);
el.cancel.addEventListener('click',()=>running?.abort());
function render(){
renderDocument();
renderMatches();
if(pages.length)renderPage();
renderRun();
}
function plural(count,one,many=`${one}s`){
return phrase(count===1?`count.${one}`:`count.${many}`,{count:tally(count)});
}
el.privacyToggle.addEventListener('click',()=>{
const opening=el.privacyPanel.hidden;
el.privacyPanel.hidden=!opening;
el.privacyToggle.setAttribute('aria-expanded',String(opening));
});
window.addEventListener('error',(event)=>{
fail(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
fail(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
renderFinders();
render();
document.getElementById('boot-warning')?.remove();
