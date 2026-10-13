/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=528f8580f1';
import{saveBlob}from'./shared/download.js?v=528f8580f1';
import{SHAPES,objectShape,shapeOf}from'./figures.js?v=528f8580f1';
import{FONT,chartSvg,isDark}from'./chart.js?v=528f8580f1';
import{format,formatBoth,parseHeight,toInput}from'./units.js?v=528f8580f1';
import{svgBlob,svgToPng}from'./save.js?v=528f8580f1';
import{orderedLoads}from'./shared/ordered-loads.js?v=528f8580f1';
import{chartMeasurements}from'./chart-measurements.js?v=528f8580f1';
import{readChartPicture}from'./chart-picture-read.js?v=528f8580f1';
const $=(id)=>document.getElementById(id);
const el={
rows:$('rows'),
rowHead:document.querySelector('.row-head'),
rowCount:$('row-count'),
addPerson:$('add-person'),
addObject:$('add-object'),
addSvg:$('add-svg'),
svgFile:$('svg-file'),
clear:$('clear'),
preset:$('preset'),
inputError:$('input-error'),
importStatus:$('import-status'),
unit:$('unit'),
order:$('order'),
showRuler:$('show-ruler'),
showNames:$('show-names'),
background:$('background'),
transparent:$('transparent'),
size:$('size'),
preview:$('preview'),
facts:$('facts'),
downloadSvg:$('download-svg'),
downloadPng:$('download-png'),
copyPng:$('copy-png'),
downloadNote:$('download-note'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const MOST=12;
const PALETTE=[
'#4a80d4','#e0794a','#3f9e72','#a668c8',
'#c9913a','#3f9fae','#cc6188','#7c8797',
];
const PEOPLE_ORDER=['man','woman','boy','girl'];
let rows=[];
let counter=0;
let current=null;
const gauge=document.createElement('canvas').getContext('2d');
function measure(text,fontPx,weight=400){
gauge.font=`${weight} ${fontPx}px ${FONT}`;
return gauge.measureText(String(text)).width;
}
function unit(){
return el.unit.value;
}
function figureFor(row){
const carried=row.shape==='upload'||row.shape==='object';
return carried&&row.art?row.art:shapeOf(row.shape);
}
function heightPlaceholder(){
return phrase(unit()==='ft'?'row.heightexampleft':'row.heightexample');
}
function addRow(shape,values={}){
if(rows.length>=MOST)return null;
counter+=1;
const start=shapeOf(shape).defaultCm;
const row={
key:counter,
shape,
name:values.name??'',
height:values.height??(start?toInput(start,unit()):''),
width:values.width??'',
colour:values.colour??PALETTE[(rows.length)%PALETTE.length],
art:values.art??null,
};
row.node=buildRow(row);
rows.push(row);
return row;
}
function buildRow(row){
const node=document.createElement('div');
node.className='row';
const shape=document.createElement('select');
shape.className='row-shape';
for(const option of SHAPES)shape.append(new Option(phrase(option.label),option.id));
if(row.art?.id==='upload')shape.append(new Option(phrase('shape.upload'),'upload'));
shape.value=row.shape;
shape.addEventListener('change',()=>{
const was=figureFor(row).defaultCm;
if(shape.value==='upload'&&!row.art){
shape.value=row.shape;
askForFile(row);
return;
}
retireImportsFor(row);
row.shape=shape.value;
const now=figureFor(row).defaultCm;
if(now&&was&&row.height.trim()===toInput(was,unit())){
row.height=toInput(now,unit());
height.value=row.height;
}
node.classList.toggle('is-object',row.shape==='object');
node.classList.toggle('is-upload',row.shape==='upload');
draw();
});
const name=document.createElement('input');
name.type='text';
name.className='row-name';
name.value=row.name;
name.placeholder=phrase('row.nameexample');
name.addEventListener('input',()=>{row.name=name.value;draw();});
const heightCell=document.createElement('div');
heightCell.className='row-cell';
const height=document.createElement('input');
height.type='text';
height.className='row-height';
height.value=row.height;
height.placeholder=heightPlaceholder();
height.inputMode='decimal';
const reads=document.createElement('span');
reads.className='row-reads';
reads.id=`height-reading-${row.key}`;
height.setAttribute('aria-describedby',reads.id);
heightCell.append(height,reads);
height.addEventListener('input',()=>{row.height=height.value;draw();});
const width=document.createElement('input');
width.type='text';
width.className='row-width';
width.value=row.width;
width.placeholder=phrase('row.widthexample');
width.inputMode='decimal';
width.addEventListener('input',()=>{row.width=width.value;draw();});
const widthCell=document.createElement('div');
widthCell.className='row-cell row-width-cell';
const widthReads=document.createElement('span');
widthReads.className='row-reads';
widthReads.id=`width-reading-${row.key}`;
width.setAttribute('aria-describedby',widthReads.id);
widthCell.append(width,widthReads);
const colour=document.createElement('input');
colour.type='color';
colour.className='row-colour';
colour.value=row.colour;
colour.addEventListener('input',()=>{row.colour=colour.value;draw();});
const grip=document.createElement('span');
grip.className='row-grip';
grip.setAttribute('aria-hidden','true');
grip.title=phrase('row.drag');
grip.textContent='⠿';
grip.addEventListener('pointerdown',(event)=>startDrag(event,row));
const tools=document.createElement('div');
tools.className='row-tools';
const up=iconButton('&#8593;',()=>move(row,-1));
const down=iconButton('&#8595;',()=>move(row,1));
const remove=iconButton('&#215;',()=>{
retireImportsFor(row);
rows=rows.filter((other)=>other!==row);
paintRows();
draw();
});
remove.classList.add('danger');
tools.append(up,down,remove);
node.append(grip,shape,name,heightCell,widthCell,colour,tools);
node.classList.toggle('is-object',row.shape==='object');
node.classList.toggle('is-upload',row.shape==='upload');
row.controls={
shape,name,height,width,colour,up,down,remove,reads,widthReads,
};
return node;
}
function reorder(row,to){
const at=rows.indexOf(row);
if(to<0||to>=rows.length||to===at)return false;
rows.splice(at,1);
rows.splice(to,0,row);
if(el.order.value!=='entered')el.order.value='entered';
return true;
}
function move(row,by){
if(!reorder(row,rows.indexOf(row)+by))return;
paintRows();
draw();
row.controls[by<0?'up':'down'].focus();
}
let dragged=null;
function slotAt(y){
for(let i=0;i<rows.length;i+=1){
const box=rows[i].node.getBoundingClientRect();
if(y<box.top+box.height/2)return i;
}
return rows.length-1;
}
function onDragMove(event){
if(!dragged)return;
event.preventDefault();
if(reorder(dragged,slotAt(event.clientY))){
paintRows();
draw();
}
}
function endDrag(){
if(!dragged)return;
dragged.node.classList.remove('is-dragging');
dragged=null;
document.body.classList.remove('is-reordering');
window.removeEventListener('pointermove',onDragMove);
window.removeEventListener('pointerup',endDrag);
window.removeEventListener('pointercancel',endDrag);
}
function startDrag(event,row){
if(event.button>0)return;
event.preventDefault();
dragged=row;
row.node.classList.add('is-dragging');
document.body.classList.add('is-reordering');
window.addEventListener('pointermove',onDragMove,{passive:false});
window.addEventListener('pointerup',endDrag);
window.addEventListener('pointercancel',endDrag);
}
function iconButton(html,onClick){
const button=document.createElement('button');
button.type='button';
button.className='icon';
button.innerHTML=html;
button.addEventListener('click',onClick);
return button;
}
function paintRows(){
el.rows.replaceChildren(el.rowHead,...rows.map((row)=>row.node));
rows.forEach((row,index)=>{
const n=index+1;
const{controls}=row;
controls.shape.setAttribute('aria-label',phrase('row.shape',{n}));
controls.name.setAttribute('aria-label',phrase('row.name',{n}));
controls.height.setAttribute('aria-label',phrase('row.height',{n}));
controls.width.setAttribute('aria-label',phrase('row.width',{n}));
controls.colour.setAttribute('aria-label',phrase('row.colour',{n}));
controls.up.setAttribute('aria-label',phrase('row.up',{n}));
controls.down.setAttribute('aria-label',phrase('row.down',{n}));
controls.remove.setAttribute('aria-label',phrase('row.remove',{n}));
controls.up.disabled=index===0;
controls.down.disabled=index===rows.length-1;
});
const full=rows.length>=MOST;
el.addPerson.disabled=full;
el.addObject.disabled=full;
el.addSvg.disabled=full;
el.preset.disabled=full;
el.rowCount.textContent=full?phrase('chart.full'):'';
}
function readRows(){
const ready=[];
for(const row of rows){
const shape=figureFor(row);
const measured=chartMeasurements(row.height,row.width,unit(),shape);
const{height,width}=measured;
const{reads,widthReads}=row.controls;
reads.textContent=height.error?phrase(height.error)
:phrase('row.reads',{height:formatBoth(height.cm,unit())});
reads.className=height.error?'row-reads bad':'row-reads';
row.controls.height.setAttribute('aria-invalid',String(!!height.error));
if(measured.usesWidth){
widthReads.textContent=width.error?phrase(width.error)
:width.auto?(height.error?phrase('width.automatic')
:phrase('width.automaticread',{width:formatBoth(height.cm*0.6,unit())}))
:phrase('width.reads',{width:formatBoth(width.cm,unit())});
widthReads.className=width.error?'row-reads bad':'row-reads';
}else widthReads.textContent='';
row.controls.width.setAttribute('aria-invalid',String(!!width.error));
if(!measured.valid)continue;
ready.push({
shape,
name:row.name.trim(),
label:format(height.cm,unit()),
cm:height.cm,
widthCm:width.cm,
colour:row.colour,
});
}
return ready;
}
function sorted(figures){
if(el.order.value==='tallest')return[...figures].sort((a,b)=>b.cm-a.cm);
if(el.order.value==='shortest')return[...figures].sort((a,b)=>a.cm-b.cm);
return figures;
}
function draw(){
const figures=sorted(readRows());
if(!figures.length){
current=null;
el.preview.replaceChildren();
el.facts.textContent=phrase(rows.length?'chart.invalid':'chart.empty');
setDownloads(false);
return;
}
const background=el.background.value;
const result=chartSvg(figures,{
plotHeight:Number(el.size.value)||900,
unit:unit(),
background:el.transparent.checked?'none':background,
ink:isDark(background)?'#ffffff':'#16191d',
showRuler:el.showRuler.checked,
showNames:el.showNames.checked,
},measure);
current=result;
el.preview.innerHTML=result.svg;
el.facts.textContent=phrase(figures.length===1?'facts.one':'facts.chart',{
count:figures.length,
width:result.width,
height:result.height,
top:format(result.topCm,unit()),
step:format(result.step,unit()),
});
setDownloads(true);
}
function setDownloads(ready){
el.downloadSvg.disabled=!ready;
el.downloadPng.disabled=!ready;
el.copyPng.disabled=!ready;
}
function note(text,bad=false){
el.downloadNote.textContent=text;
el.downloadNote.className=bad?'field-summary warn':'field-summary';
}
el.downloadSvg.addEventListener('click',()=>{
if(!current)return note(phrase('save.nothing'),true);
saveBlob(svgBlob(current.svg),'height-chart.svg');
return note(phrase('save.done'));
});
el.downloadPng.addEventListener('click',async()=>{
if(!current)return note(phrase('save.nothing'),true);
try{
saveBlob(await svgToPng(current.svg,current),'height-chart.png');
return note(phrase('save.done'));
}catch(error){
return note(phrase('save.failed',{detail:phrase(error.message)}),true);
}
});
el.copyPng.addEventListener('click',async()=>{
if(!current)return note(phrase('save.nothing'),true);
try{
const blob=await svgToPng(current.svg,current);
await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
return note(phrase('save.copied'));
}catch{
return note(phrase('save.noclipboard'),true);
}
});
el.addPerson.addEventListener('click',()=>{
const people=rows.filter((row)=>shapeOf(row.shape).paths).length;
addRow(PEOPLE_ORDER[people%PEOPLE_ORDER.length]);
paintRows();
draw();
});
el.addObject.addEventListener('click',()=>{
addRow('object');
paintRows();
draw();
});
let wantsFile=null;
function askForFile(row){
if(row)retireImportsFor(row);
wantsFile=row??null;
el.svgFile.value='';
el.svgFile.click();
}
el.addSvg.addEventListener('click',()=>askForFile(null));
const requests=new Set();
const requestLives=request=>!request.controller.signal.aborted&&(!request.row
||(rows.includes(request.row)&&request.row.art===request.art
&&request.row.shape===request.shape));
function retireImportsFor(row){
for(const request of requests)if(request.row===row)request.controller.abort();
if(wantsFile===row)wantsFile=null;
}
const imports=orderedLoads({
async read(request){
try{return{request,result:await readChartPicture(request.file,request.controller.signal)};}
finally{requests.delete(request);}
},
complete({items,errors}){
for(const{request,result}of items){
if(!requestLives(request))continue;
if(result.error){
el.inputError.textContent=phrase(result.error);
el.inputError.hidden=false;
continue;
}
result.shape.defaultCm=100;
const row=request.row;
if(row){
row.art=result.shape;
row.shape='upload';
if(!row.name.trim())row.name=result.name;
if(!row.height.trim())row.height=toInput(100,unit());
}else if(!addRow('upload',{
art:result.shape,name:result.name,height:toInput(100,unit()),
})){
el.inputError.textContent=phrase('chart.full');
el.inputError.hidden=false;
continue;
}
el.inputError.hidden=true;
paintRows();
draw();
note(result.shapes===undefined?phrase('image.added')
:phrase('svg.added',{shapes:result.shapes}));
}
for(const{value:request,error}of errors){
if(!requestLives(request))continue;
el.inputError.textContent=phrase('import.failed',{
name:request.file.name,detail:error?.message||String(error),
});
el.inputError.hidden=false;
}
},
status(pending){
el.importStatus.hidden=!pending;
el.importStatus.textContent=pending?phrase(pending===1?'import.readingone':'import.readingmany',{
count:pending.toLocaleString(document.documentElement.lang),
}):'';
if(pending)el.addSvg.setAttribute('aria-busy','true');
else el.addSvg.removeAttribute('aria-busy');
},
});
el.svgFile.addEventListener('change',()=>{
const file=el.svgFile.files?.[0],row=wantsFile;
wantsFile=null;
el.svgFile.value='';
if(!file||(row&&!rows.includes(row)))return;
const request={file,row,art:row?.art,shape:row?.shape,
controller:new AbortController()};
requests.add(request);
imports.add([request]);
});
el.clear.addEventListener('click',()=>{
for(const request of requests)request.controller.abort();
requests.clear();
imports.reset();
wantsFile=null;
el.svgFile.value='';
endDrag();
rows=[];
el.inputError.hidden=true;
el.inputError.textContent='';
note('');
paintRows();
draw();
});
el.preset.addEventListener('change',()=>{
const option=el.preset.selectedOptions[0];
const cm=Number(option?.dataset.cm);
if(cm){
addRow('object',{
name:option.textContent.split('—')[0].trim(),
height:toInput(cm,unit()),
width:toInput(Number(option.dataset.width),unit()),
art:option.dataset.art?objectShape(option.dataset.art):null,
});
paintRows();
draw();
}
el.preset.value='';
});
let previousUnit='cm';
el.unit.addEventListener('change',()=>{
const next=unit();
for(const row of rows){
for(const field of['height','width']){
const parsed=parseHeight(row[field],previousUnit);
if(parsed.error)continue;
row[field]=toInput(parsed.cm,next);
row.controls[field].value=row[field];
}
row.controls.height.placeholder=heightPlaceholder();
}
previousUnit=next;
draw();
});
for(const control of[el.order,el.showRuler,el.showNames,el.background,
el.transparent,el.size]){
control.addEventListener('input',draw);
control.addEventListener('change',draw);
}
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
window.addEventListener('error',(event)=>{
el.inputError.hidden=false;
el.inputError.textContent=phrase('error.broke',{detail:event.message});
});
window.addEventListener('unhandledrejection',(event)=>{
el.inputError.hidden=false;
el.inputError.textContent=phrase('error.broke',{
detail:event.reason?.message??event.reason,
});
});
addRow('man');
addRow('woman');
paintRows();
draw();
document.getElementById('boot-warning')?.remove();
