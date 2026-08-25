/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{base64DataUri,svgDataUri}from'./encode.js';
import{sniff,extensionType}from'./sniff.js';
import{metadata}from'./metadata.js';
import{
SHAPES,render as renderShape,bundle,bundleName,fileName,identifiers,
}from'./shapes.js';
import{
bytes as humanBytes,count,overhead,verdict,metadataNote,dimensions,
}from'./files.js';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
fileList:$('file-list'),
listToolbar:$('list-toolbar'),
countLabel:$('count-label'),
clearAll:$('clear-all'),
loadError:$('load-error'),
shapes:$('shapes'),
svgBase64:$('svg-base64'),
emptyNote:$('empty-note'),
results:$('results'),
resultsSummary:$('results-summary'),
copyAll:$('copy-all'),
downloadAll:$('download-all'),
resultList:$('result-list'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
networkCount:$('network-count'),
networkDot:$('network-dot'),
offlineStatus:$('offline-status'),
offlineDot:$('offline-dot'),
};
let items=[];
let nextId=1;
let busy=false;
const utf8=new TextDecoder('utf-8');
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
addFiles(files);
},
});
async function addFiles(files){
if(!files?.length||busy)return;
busy=true;
picker.busy(readingLabel(files.length));
const failures=[];
const added=[];
try{
for(const file of files){
const data=new Uint8Array(await file.arrayBuffer());
const kind=sniff(data);
if(!kind){
failures.push(`${file.name}: this is not an image format this tool recognises. The type in a data URI has to be right, so it will not guess one.`);
continue;
}
const declared=extensionType(file.name);
const item={
id:nextId,
file,
data,
thumbUrl:URL.createObjectURL(file),
mime:kind.mime,
label:kind.label,
note:kind.note??'',
mismatch:declared&&declared!==kind.mime
?`The name says ${file.name.replace(/^.*\./, '.')}, but the bytes are ${kind.label}. The URI says ${kind.mime}, which is the one that will work.`
:'',
meta:metadata(data,kind.mime),
svg:kind.mime==='image/svg+xml',
text:kind.mime==='image/svg+xml'?utf8.decode(data):'',
width:0,
height:0,
renders:true,
cache:null,
};
nextId+=1;
items.push(item);
added.push(item);
}
}finally{
busy=false;
picker.done();
}
if(failures.length)showLoadError(failures.join('\n'));
else clearLoadError();
draw();
for(const item of added)measure(item).then(draw);
}
function measure(item){
return new Promise((resolve)=>{
const image=new Image();
image.onload=()=>{
item.width=image.naturalWidth;
item.height=image.naturalHeight;
item.renders=true;
resolve();
};
image.onerror=()=>{
item.renders=false;
resolve();
};
image.src=uriFor(item);
});
}
function removeItem(id){
const item=items.find((one)=>one.id===id);
if(item)URL.revokeObjectURL(item.thumbUrl);
items=items.filter((one)=>one.id!==id);
clearLoadError();
draw();
}
el.clearAll.addEventListener('click',()=>{
for(const item of items)URL.revokeObjectURL(item.thumbUrl);
items=[];
clearLoadError();
draw();
});
const modeKey=(item)=>(item.svg&&!el.svgBase64.checked?'svg':'base64');
function uriFor(item){
const key=modeKey(item);
if(item.cache?.key===key)return item.cache.uri;
const uri=key==='svg'
?svgDataUri(item.text)
:base64DataUri(item.data,item.mime);
item.cache={key,uri};
return uri;
}
function results(){
const idents=identifiers(items.map((item)=>item.file.name));
return items.map((item,at)=>({
item,
name:item.file.name,
ident:idents[at],
uri:uriFor(item),
width:item.width,
height:item.height,
svg:item.svg,
}));
}
const currentShape=()=>
el.shapes.querySelector('input[name="shape"]:checked')?.value??SHAPES[0].id;
el.shapes.addEventListener('change',draw);
el.svgBase64.addEventListener('change',()=>{
draw();
});
const SNIPPET=1200;
function draw(){
const shape=currentShape();
const rows=results();
el.countLabel.textContent=`${items.length} ${items.length === 1 ? 'image' : 'images'}`;
el.listToolbar.hidden=items.length===0;
el.emptyNote.hidden=items.length>0;
el.results.hidden=items.length===0;
drawFileList();
if(!items.length)return;
const total=rows.reduce((sum,row)=>sum+renderShape(shape,row).length,0);
el.resultsSummary.textContent=
`${items.length} ${items.length === 1 ? 'picture' : 'pictures'}, ${humanBytes(total)} of text in total. None of it has been anywhere.`;
el.resultList.replaceChildren(...rows.map((row)=>resultRow(shape,row)));
}
function drawFileList(){
el.fileList.replaceChildren(...items.map((item)=>{
const row=document.createElement('li');
row.className='file-row';
const main=document.createElement('div');
main.className='file-main-wrap';
const thumb=document.createElement('img');
thumb.className='file-thumb';
thumb.src=item.thumbUrl;
thumb.alt='';
main.appendChild(thumb);
const text=document.createElement('div');
text.className='file-main';
const name=document.createElement('p');
name.className='file-name';
name.textContent=item.file.name;
text.appendChild(name);
const sub=document.createElement('p');
sub.className='file-sub';
sub.textContent=[
item.label,
humanBytes(item.file.size),
item.width&&item.height&&item.renders?dimensions(item.width,item.height):null,
].filter(Boolean).join(' · ');
text.appendChild(sub);
main.appendChild(text);
row.appendChild(main);
const remove=document.createElement('button');
remove.type='button';
remove.className='row-remove';
remove.title=`Take ${item.file.name} off the list`;
remove.setAttribute('aria-label',`Take ${item.file.name} off the list`);
remove.textContent='×';
remove.disabled=busy;
remove.addEventListener('click',()=>removeItem(item.id));
row.appendChild(remove);
return row;
}));
}
function resultRow(shape,row){
const{item}=row;
const code=renderShape(shape,row);
const li=document.createElement('li');
li.className='result';
const head=document.createElement('div');
head.className='result-head';
const preview=document.createElement('img');
preview.className='result-preview';
preview.src=row.uri;
preview.alt='';
head.appendChild(preview);
const meta=document.createElement('div');
meta.className='result-meta';
const name=document.createElement('p');
name.className='result-name';
name.textContent=item.file.name;
meta.appendChild(name);
const facts=[
item.mime,
item.width&&item.height&&item.renders?dimensions(item.width,item.height):null,
`${humanBytes(item.file.size)} in`,
`${count(code.length)} characters out`,
overhead(item.file.size,row.uri.length),
].filter(Boolean);
const sub=document.createElement('p');
sub.className='result-sub';
sub.textContent=facts.join(' · ');
meta.appendChild(sub);
const call=verdict(row.uri.length);
const judgement=document.createElement('p');
judgement.className=`result-verdict ${call.level}`;
judgement.textContent=call.text;
meta.appendChild(judgement);
for(const warning of[
item.mismatch,
item.note,
item.renders?'':'This browser would not draw the result. The URI is well formed; the format is one it cannot decode.',
item.meta?metadataNote(item.meta,item.file.size):'',
]){
if(!warning)continue;
const line=document.createElement('p');
line.className='result-warn';
line.textContent=warning;
meta.appendChild(line);
}
head.appendChild(meta);
const actions=document.createElement('div');
actions.className='result-actions';
actions.appendChild(copyButton(code,'primary'));
const download=document.createElement('button');
download.type='button';
download.className='ghost';
download.textContent='Download';
download.addEventListener('click',()=>saveText(code,fileName(shape,row)));
actions.appendChild(download);
head.appendChild(actions);
li.appendChild(head);
const pre=document.createElement('pre');
pre.className='result-code';
const holder=document.createElement('code');
holder.textContent=code.length>SNIPPET?`${code.slice(0, SNIPPET)}…`:code;
pre.appendChild(holder);
li.appendChild(pre);
if(code.length>SNIPPET){
const more=document.createElement('button');
more.type='button';
more.className='ghost show-all';
more.textContent=`Show all ${count(code.length)} characters`;
more.addEventListener('click',()=>{
holder.textContent=code;
more.remove();
});
li.appendChild(more);
}
return li;
}
function copyButton(text,className){
const button=document.createElement('button');
button.type='button';
button.className=className;
button.textContent='Copy';
button.addEventListener('click',async()=>{
try{
await navigator.clipboard.writeText(text);
flash(button,'Copied');
}catch{
flash(button,'Copy refused - use Download');
}
});
return button;
}
function flash(button,message){
const was=button.textContent;
button.textContent=message;
button.disabled=true;
setTimeout(()=>{
button.textContent=was;
button.disabled=false;
},1600);
}
el.copyAll.addEventListener('click',async()=>{
if(!items.length)return;
const text=bundle(currentShape(),results());
try{
await navigator.clipboard.writeText(text);
flash(el.copyAll,'Copied');
}catch{
flash(el.copyAll,'Copy refused - use Download');
}
});
el.downloadAll.addEventListener('click',()=>{
if(!items.length)return;
const shape=currentShape();
saveText(bundle(shape,results()),bundleName(shape));
});
function saveText(text,name){
const blob=new Blob([text],{type:'text/plain;charset=utf-8'});
const url=URL.createObjectURL(blob);
const link=document.createElement('a');
link.href=url;
link.download=name;
link.click();
setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function showLoadError(message){
el.loadError.textContent=message;
el.loadError.hidden=false;
}
function clearLoadError(){
el.loadError.textContent='';
el.loadError.hidden=true;
}
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
const PLATFORM_HOSTS=/(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;
function monitorNetwork(){
const platform=new Set();
const unexplained=new Set();
const inspect=(entries)=>{
for(const entry of entries){
if(entry.name.startsWith('blob:')||entry.name.startsWith('data:'))continue;
const url=new URL(entry.name,location.href);
if(url.origin===location.origin)continue;
if(PLATFORM_HOSTS.test(url.hostname))platform.add(url.hostname);
else unexplained.add(url.hostname);
}
const total=performance.getEntriesByType('resource')
.filter((e)=>!e.name.startsWith('blob:')&&!e.name.startsWith('data:')).length;
const clean=unexplained.size===0;
const platformNote=platform.size===0
?''
:` The page's own ad, measurement and donate-button scripts loaded from ${platform.size} host${platform.size === 1 ? '' : 's'}; not one of them was given an image or a byte of one.`;
el.networkCount.textContent=clean
?`your images have gone nowhere. ${total} files loaded, all of them this page's own.${platformNote}`
:`something contacted ${[...unexplained].join(', ')}, which this tool never does. Treat that as worth investigating.${platformNote}`;
el.networkCount.className=clean?'good':'warn';
el.networkDot.className=`live-dot ${clean ? 'good' : 'warn'}`;
};
inspect(performance.getEntriesByType('resource'));
try{
new PerformanceObserver((list)=>inspect(list.getEntries())).observe({type:'resource',buffered:true});
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
showLoadError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showLoadError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
draw();
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
