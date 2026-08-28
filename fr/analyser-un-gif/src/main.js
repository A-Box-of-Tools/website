/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js';
import{DISPOSALS,NotAGif,frameData,parseGif}from'./gif.js';
import{lzwDecode}from'./lzw.js';
import{Compositor,duration,isFullCanvas,paintFrame}from'./frames.js';
import{budget,distinctColors,paletteWaste}from'./budget.js';
import{findings}from'./findings.js';
import{report}from'./report.js';
import{clock,count,delay,exact,fileSize,hex,percent,plural,rate}from'./format.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
loadError:$('load-error'),
working:$('working'),
summaryCard:$('summary-card'),
fileName:$('file-name'),
copyReport:$('copy-report'),
downloadReport:$('download-report'),
copyStatus:$('copy-status'),
preview:$('preview'),
factVersion:$('fact-version'),
factCanvas:$('fact-canvas'),
factSize:$('fact-size'),
factFrames:$('fact-frames'),
factWritten:$('fact-written'),
factPlays:$('fact-plays'),
factLoops:$('fact-loops'),
factColors:$('fact-colors'),
findingsCard:$('findings-card'),
findings:$('findings'),
budgetCard:$('budget-card'),
budgetBar:$('budget-bar'),
budgetRows:$('budget-rows'),
budgetTotal:$('budget-total'),
framesCard:$('frames-card'),
framesLede:$('frames-lede'),
frames:$('frames'),
frameView:$('frame-view'),
showMore:$('show-more'),
colorsCard:$('colors-card'),
colorsLede:$('colors-lede'),
globalPaletteWrap:$('global-palette-wrap'),
globalPaletteNote:$('global-palette-note'),
globalPalette:$('global-palette'),
localPalettesWrap:$('local-palettes-wrap'),
localPalettesSummary:$('local-palettes-summary'),
localPalettes:$('local-palettes'),
extrasCard:$('extras-card'),
extras:$('extras'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
networkCount:$('network-count'),
networkDot:$('network-dot'),
offlineStatus:$('offline-status'),
offlineDot:$('offline-dot'),
};
const PIXEL_BUDGET=300_000_000;
const FIRST_PAGE=60;
const THUMB=120;
let current=null;
let previewUrl=null;
let shown=0;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){openFile(files[0]);},
});
async function openFile(file){
hideError();
picker.busy(readingLabel(1));
el.working.hidden=false;
el.working.textContent=phrase('read.reading',{name:file.name});
try{
const bytes=new Uint8Array(await file.arrayBuffer());
await new Promise((resolve)=>{setTimeout(resolve,0);});
show(file,bytes);
}catch(error){
const why=phrase(error.message,fill(error.values));
if(error instanceof NotAGif){
showError(phrase('read.notagif',{name:file.name,why}));
}else{
showError(phrase('read.failed',{name:file.name,why}));
}
}finally{
picker.done();
el.working.hidden=true;
}
}
function show(file,bytes){
const gif=parseGif(bytes);
const{drawn,identical}=decodeAll(gif,bytes);
const used=drawn.map((frame)=>(frame?frame.used:null));
const waste=paletteWaste(gif,used);
const colors=distinctColors(gif,used).size;
const view={
name:file.name,
budget:budget(gif),
findings:findings(gif,{decoded:drawn,waste,colors,identical}),
colors,
waste,
};
current={name:file.name,gif,view,drawn};
if(previewUrl)URL.revokeObjectURL(previewUrl);
previewUrl=URL.createObjectURL(file);
el.preview.src=previewUrl;
renderSummary(gif,view);
renderFindings(view.findings);
renderBudget(gif,view.budget);
renderFrames(gif,drawn);
renderColors(gif,view,used);
renderExtras(gif);
el.summaryCard.hidden=false;
el.budgetCard.hidden=false;
el.findingsCard.hidden=view.findings.length===0;
el.framesCard.hidden=gif.frames.length===0;
el.colorsCard.hidden=!gif.globalPalette&&!gif.frames.some((frame)=>frame.palette);
el.extrasCard.hidden=gif.extensions.length===0;
el.summaryCard.scrollIntoView({behavior:'smooth',block:'start'});
}
function decodeAll(gif,bytes){
const drawn=[];
if(gif.width===0||gif.height===0){
return{drawn:gif.frames.map(()=>null),identical:0};
}
const canvas=new Compositor(gif.width,gif.height);
let spent=0;
let identical=0;
let previous=null;
for(const frame of gif.frames){
const pixels=frame.width*frame.height;
if(pixels===0||spent+pixels>PIXEL_BUDGET){
drawn.push(null);
previous=null;
continue;
}
spent+=pixels;
const palette=frame.palette??gif.globalPalette;
const stream=lzwDecode(frameData(bytes,frame),frame.minCodeSize,pixels);
const painted=paintFrame(frame,stream.indices,palette);
const composited=canvas.draw(frame,painted.pixels);
if(previous&&same(previous,composited))identical+=1;
previous=composited;
drawn.push({
stored:thumbnail(painted.pixels,frame.width,frame.height,
phrase('shot.stored',{n:frame.index+1})),
composited:thumbnail(composited,gif.width,gif.height,
phrase('shot.composited',{n:frame.index+1})),
used:painted.used,
missing:painted.missing,
clears:stream.clears,
codes:stream.codes,
pixels:stream.pixels,
truncated:stream.truncated,
corrupt:stream.corrupt,
ratio:frame.payloadBytes>0?pixels/frame.payloadBytes:0,
});
}
return{drawn,identical};
}
function same(a,b){
for(let at=0;at<a.length;at+=1)if(a[at]!==b[at])return false;
return true;
}
function thumbnail(pixels,width,height,label){
const scale=THUMB/Math.max(width,height);
const shown={width:Math.max(1,Math.round(width*scale)),
height:Math.max(1,Math.round(height*scale))};
const store=scale>=1?{width,height}:shown;
const canvas=document.createElement('canvas');
canvas.width=store.width;
canvas.height=store.height;
canvas.className='frame-canvas';
canvas.style.width=`${shown.width}px`;
canvas.style.height=`${shown.height}px`;
canvas.setAttribute('role','img');
canvas.setAttribute('aria-label',label);
const context=canvas.getContext('2d');
const image=new ImageData(pixels,width,height);
if(scale>=1){
context.putImageData(image,0,0);
return canvas;
}
const scratch=document.createElement('canvas');
scratch.width=width;
scratch.height=height;
scratch.getContext('2d').putImageData(image,0,0);
context.drawImage(scratch,0,0,store.width,store.height);
return canvas;
}
function renderSummary(gif,view){
const timing=duration(gif.frames);
const fps=rate(gif.frames.length,timing.real);
el.fileName.textContent=view.name;
el.factVersion.textContent=`GIF${gif.version}`;
el.factCanvas.textContent=`${gif.width} × ${gif.height}`;
el.factSize.textContent=fileSize(gif.size);
el.factSize.title=exact(gif.size,phrase);
el.factFrames.textContent=count(gif.frames.length);
el.factWritten.textContent=gif.frames.length?clock(timing.nominal,phrase):'—';
if(timing.clamped>0){
el.factPlays.textContent=played(timing.real,fps);
el.factPlays.className='warn';
el.factPlays.title=phrase('clamped.note',{n:count(timing.clamped)});
}else{
el.factPlays.textContent=gif.frames.length?played(timing.real,fps):'—';
el.factPlays.className='';
el.factPlays.title='';
}
el.factLoops.textContent=gif.loop===null
?phrase('loops.none')
:gif.loop===0?phrase('loops.forever'):phrase('loops.times',{n:count(gif.loop)});
el.factColors.textContent=plural(view.colors,'n.colour',phrase);
}
function played(real,fps){
const time=clock(real,phrase);
return fps?phrase('plays.rate',{time,fps:fps.toFixed(1)}):time;
}
const LEVEL_MARK={bad:'✖',warn:'⚠',note:'•'};
const LEVEL_NAME={bad:'level.bad',warn:'level.warn',note:'level.note'};
function renderFindings(list){
el.findings.replaceChildren();
for(const finding of list){
const item=document.createElement('li');
item.className=`finding ${finding.level}`;
const mark=document.createElement('span');
mark.className='finding-mark';
mark.textContent=LEVEL_MARK[finding.level];
mark.title=phrase(LEVEL_NAME[finding.level]);
const body=document.createElement('div');
const values=fill(finding.values);
const title=phrase(finding.title,values);
const said=phrase(finding.body,values);
body.innerHTML=`<strong>${title}</strong> ${said}`;
item.append(mark,body);
el.findings.append(item);
}
}
function fill(values={}){
return Object.fromEntries(Object.entries(values)
.map(([name,value])=>[name,value?.key?phrase(value.key,value.values):value]));
}
function renderBudget(gif,plan){
el.budgetBar.replaceChildren();
el.budgetRows.replaceChildren();
el.budgetTotal.textContent=exact(gif.size,phrase);
for(const row of plan.rows){
if(row.bytes===0&&row.key!=='pixels')continue;
const slice=document.createElement('span');
slice.className=`slice slice-${row.key}`;
slice.style.width=`${row.share * 100}%`;
slice.title=`${phrase(row.label)}: ${fileSize(row.bytes)}`;
el.budgetBar.append(slice);
const line=document.createElement('tr');
const head=document.createElement('th');
head.scope='row';
const swatch=document.createElement('span');
swatch.className=`key key-${row.key}`;
const label=document.createElement('span');
label.textContent=phrase(row.label);
const note=document.createElement('span');
note.className='budget-note';
note.textContent=phrase(row.note,row.values);
head.append(swatch,label,note);
const size=document.createElement('td');
size.className='num';
size.textContent=count(row.bytes);
const portion=document.createElement('td');
portion.className='num';
portion.textContent=percent(row.share);
line.append(head,size,portion);
el.budgetRows.append(line);
}
}
function renderFrames(gif,drawn){
el.frames.replaceChildren();
shown=0;
const undrawn=drawn.filter((frame)=>frame===null).length;
const full=gif.frames.filter((frame)=>isFullCanvas(gif,frame)).length;
const frames=plural(gif.frames.length,'n.frame',phrase);
el.framesLede.textContent=undrawn>0
?phrase('frames.partial',{frames,drawn:count(gif.frames.length-undrawn)})
:phrase(full===0?'frames.none':full===gif.frames.length?'frames.all'
:'frames.some',{frames,n:count(full)});
more(gif,drawn);
}
function more(gif,drawn){
const end=Math.min(gif.frames.length,shown+FIRST_PAGE);
for(let index=shown;index<end;index+=1){
el.frames.append(frameCard(gif,gif.frames[index],drawn[index]));
}
shown=end;
const left=gif.frames.length-shown;
el.showMore.hidden=left<=0;
el.showMore.textContent=phrase('frames.more',{frames:plural(left,'n.frame',phrase)});
}
function frameCard(gif,frame,drawn){
const item=document.createElement('li');
item.className='frame';
const figure=document.createElement('div');
figure.className='frame-shot';
if(drawn){
figure.append(el.frameView.value==='stored'?drawn.stored:drawn.composited);
}else{
const blank=document.createElement('p');
blank.className='frame-blank';
blank.textContent=phrase('frame.notdrawn');
figure.append(blank);
}
const heading=document.createElement('p');
heading.className='frame-head';
heading.textContent=phrase('frame.number',{n:frame.index+1});
const rows=[
[phrase('frame.delay'),frame.delay<2
?phrase('frame.clamped',{delay:delay(frame.delay,phrase)})
:delay(frame.delay,phrase)],
[phrase('frame.rectangle'),phrase('frame.rect',{
width:frame.width,height:frame.height,left:frame.left,top:frame.top,
})],
[phrase('frame.disposal'),
phrase(DISPOSALS[frame.disposal]??'disposal.reserved',{n:frame.disposal})],
[phrase('frame.palette'),frame.palette
?phrase('palette.own',{n:count(frame.palette.count)})
:phrase(gif.globalPalette?'palette.global':'palette.none')],
[phrase('frame.transparent'),frame.transparentIndex>=0
?phrase('frame.transparent.index',{n:frame.transparentIndex})
:phrase('frame.transparent.no')],
[phrase('frame.size'),phrase('frame.sizevalue',{
size:fileSize(frame.bytes),share:percent(frame.bytes/gif.size),
})],
];
if(frame.interlaced)rows.push([phrase('frame.interlaced'),phrase('frame.yes')]);
if(drawn&&drawn.ratio>0){
rows.push([phrase('frame.compressed'),
phrase('frame.ratio',{ratio:drawn.ratio.toFixed(1)})]);
}
if(drawn&&(drawn.corrupt||drawn.truncated)){
rows.push([phrase('frame.trouble'),drawn.corrupt
?phrase(drawn.corrupt.key,drawn.corrupt.values)
:phrase('frame.endsearly')]);
}
const list=document.createElement('dl');
list.className='frame-facts';
for(const[label,value]of rows){
const pair=document.createElement('div');
const term=document.createElement('dt');
term.textContent=label;
const detail=document.createElement('dd');
detail.textContent=value;
pair.append(term,detail);
list.append(pair);
}
item.append(figure,heading,list);
return item;
}
el.frameView.addEventListener('change',()=>{
if(!current)return;
const{gif,drawn}=current;
el.frames.replaceChildren();
const upTo=shown;
shown=0;
while(shown<upTo)more(gif,drawn);
});
el.showMore.addEventListener('click',()=>{
if(current)more(current.gif,current.drawn);
});
function renderColors(gif,view,used){
const locals=gif.frames.filter((frame)=>frame.palette);
const waste=view.waste;
el.colorsLede.textContent=phrase('colours.lede',{
declared:plural(waste.declared,'n.colour',phrase),
referenced:count(waste.referenced),
different:count(view.colors),
});
el.globalPaletteWrap.hidden=!gif.globalPalette;
if(gif.globalPalette){
const union=new Uint8Array(256);
for(const[index,frame]of gif.frames.entries()){
if(frame.palette||!used[index])continue;
for(let at=0;at<256;at+=1)if(used[index][at])union[at]=1;
}
const sharing=gif.frames.filter((frame)=>!frame.palette).length;
el.globalPaletteNote.textContent=phrase('palette.globalnote',{
entries:plural(gif.globalPalette.count,'n.entry',phrase),
size:fileSize(gif.globalPalette.bytes),
frames:plural(sharing,'n.frame',phrase),
});
el.globalPalette.replaceChildren(...swatches(gif.globalPalette,union));
}
el.localPalettesWrap.hidden=locals.length===0;
if(locals.length>0){
el.localPalettesSummary.textContent=phrase('palette.locals',{
tables:plural(locals.length,'n.localtable',phrase),
size:fileSize(locals.reduce((sum,frame)=>sum+frame.palette.bytes,0)),
});
el.localPalettes.replaceChildren();
for(const frame of locals.slice(0,24)){
const heading=document.createElement('h4');
heading.textContent=phrase('palette.frameheading',{
n:frame.index+1,colours:plural(frame.palette.count,'n.colour',phrase),
});
const list=document.createElement('ul');
list.className='palette';
list.append(...swatches(frame.palette,used[frame.index]));
el.localPalettes.append(heading,list);
}
if(locals.length>24){
const note=document.createElement('p');
note.className='palette-note';
note.textContent=phrase('palette.capped',{n:count(locals.length)});
el.localPalettes.append(note);
}
}
}
function swatches(palette,used){
const out=[];
for(let index=0;index<palette.count;index+=1){
const item=document.createElement('li');
const code=hex(palette.colors,index);
item.className=used&&!used[index]?'swatch unused':'swatch';
item.style.background=code;
item.title=used&&!used[index]
?`${index}: ${code} — never used`
:`${index}: ${code}`;
out.push(item);
}
return out;
}
function renderExtras(gif){
el.extras.replaceChildren();
for(const extension of gif.extensions){
const item=document.createElement('li');
const head=document.createElement('p');
head.className='extra-head';
head.textContent=`${extension.name} — ${fileSize(extension.bytes)}`;
item.append(head);
const what=document.createElement('p');
what.className='extra-note';
what.textContent=describe(extension);
item.append(what);
if(extension.text){
const body=document.createElement('pre');
body.className='extra-text';
const text=extension.text.trim();
body.textContent=text.length>4000?`${text.slice(0, 4000)}…`:text;
item.append(body);
}
el.extras.append(item);
}
}
function describe(extension){
if(extension.kind==='comment')return phrase('block.comment');
if(extension.loop!==undefined){
return extension.loop===0
?phrase('block.loop.forever')
:phrase('block.loop.times',{times:plural(extension.loop,'n.time',phrase)});
}
if(extension.name.startsWith('XMP'))return phrase('block.xmp');
if(extension.name.startsWith('ICCRGBG1'))return phrase('block.icc');
if(extension.kind==='plain-text')return phrase('block.plaintext');
return phrase('block.application');
}
el.downloadReport.addEventListener('click',()=>{
if(!current)return;
const text=report(current.gif,current.view,phrase);
const blob=new Blob([text],{type:'text/plain'});
const url=URL.createObjectURL(blob);
const link=document.createElement('a');
link.href=url;
link.download=`${current.name.replace(/\.gif$/i, '')}-analysis.txt`;
link.click();
setTimeout(()=>URL.revokeObjectURL(url),10_000);
});
el.copyReport.addEventListener('click',async()=>{
if(!current)return;
const text=report(current.gif,current.view,phrase);
try{
await navigator.clipboard.writeText(text);
el.copyStatus.textContent=phrase('copy.done');
}catch{
el.copyStatus.textContent=phrase('copy.refused');
}
});
function showError(message){
el.loadError.textContent=message;
el.loadError.hidden=false;
}
function hideError(){
el.loadError.hidden=true;
el.copyStatus.textContent='';
}
el.privacyToggle?.addEventListener('click',()=>{
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
const platformNote=platform.size
?phrase(platform.size===1?'net.platform.one':'net.platform.many',
{hosts:platform.size})
:'';
el.networkCount.textContent=clean
?phrase('net.clean',{total,platform:platformNote})
:phrase('net.dirty',{hosts:[...external].join(', '),platform:platformNote});
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
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
