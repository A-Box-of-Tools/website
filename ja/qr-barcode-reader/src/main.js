/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import*as camera from'./camera.js?v=150e8391ae';
import{scan}from'./scan.js?v=150e8391ae';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=150e8391ae';
import{phrase}from'./shared/phrases.js?v=150e8391ae';
import{acceptsImageFile}from'./shared/image-input.js?v=150e8391ae';
import{makeExample}from'./example.js?v=150e8391ae';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
startCamera:$('start-camera'),
stopCamera:$('stop-camera'),
pickError:$('pick-error'),
cameraCard:$('camera-card'),
video:$('video'),
cameraPickRow:$('camera-pick-row'),
cameraPick:$('camera-pick'),
torchRow:$('torch-row'),
torch:$('torch'),
cameraStatus:$('camera-status'),
resultsCard:$('results-card'),
results:$('results'),
clearResults:$('clear-results'),
resultStatus:$('result-status'),
resultTemplate:$('result-template'),
preview:$('preview'),
previewCaption:$('preview-caption'),
previewList:$('preview-list'),
previewTemplate:$('preview-template'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const WORKING_SIDE=1800;
const decodeCanvas=document.createElement('canvas');
let fileGeneration=0;
function pixelsOf(source,width,height,maxSide){
const scale=Math.min(1,maxSide/Math.max(width,height));
const target={
width:Math.max(1,Math.round(width*scale)),
height:Math.max(1,Math.round(height*scale)),
};
decodeCanvas.width=target.width;
decodeCanvas.height=target.height;
const context=decodeCanvas.getContext('2d',{willReadFrequently:true});
context.fillStyle='#ffffff';
context.fillRect(0,0,target.width,target.height);
context.drawImage(source,0,0,target.width,target.height);
return context.getImageData(0,0,target.width,target.height);
}
async function pictureFrom(file){
if(typeof createImageBitmap==='function'){
try{
return await createImageBitmap(file);
}catch{
}
}
const url=URL.createObjectURL(file);
try{
return await new Promise((resolve,reject)=>{
const image=new Image();
image.onload=()=>resolve(image);
image.onerror=()=>reject(new Error('not a picture this browser can open'));
image.src=url;
});
}finally{
setTimeout(()=>URL.revokeObjectURL(url),0);
}
}
const PREVIEW_SIDE=260;
function thumbnailOf(picture,width,height){
const scale=Math.min(1,PREVIEW_SIDE/Math.max(width,height));
const canvas=document.createElement('canvas');
canvas.width=Math.max(1,Math.round(width*scale));
canvas.height=Math.max(1,Math.round(height*scale));
canvas.setAttribute('aria-hidden','true');
const context=canvas.getContext('2d');
context.fillStyle='#ffffff';
context.fillRect(0,0,canvas.width,canvas.height);
context.drawImage(picture,0,0,canvas.width,canvas.height);
return canvas;
}
async function readFile(file){
const picture=await pictureFrom(file);
try{
const width=picture.width??picture.naturalWidth;
const height=picture.height??picture.naturalHeight;
const thumbnail=thumbnailOf(picture,width,height);
let found=scan(pixelsOf(picture,width,height,WORKING_SIDE));
if(!found&&Math.max(width,height)>WORKING_SIDE){
found=scan(pixelsOf(picture,width,height,Math.max(width,height)));
}
return{found,thumbnail};
}finally{
picture.close?.();
}
}
const shown=[];
const MOST_KEPT=20;
const SYMBOLOGY_NAMES={
ean13:'EAN-13',
ean8:'EAN-8',
upca:'UPC-A',
upce:'UPC-E',
itf14:'ITF-14',
itf:'Interleaved 2 of 5',
code128:'Code 128',
code39:'Code 39',
};
const symbologyName=(id)=>SYMBOLOGY_NAMES[id]??phrase(`symbology.${id}`);
function drawGrid(canvas,size,modules){
const scale=Math.max(1,Math.floor(240/size));
const quiet=2;
const side=(size+quiet*2)*scale;
canvas.width=side;
canvas.height=side;
const context=canvas.getContext('2d');
context.fillStyle='#ffffff';
context.fillRect(0,0,side,side);
context.fillStyle='#000000';
for(let row=0;row<size;row+=1){
for(let column=0;column<size;column+=1){
if(!modules[row*size+column])continue;
context.fillRect((column+quiet)*scale,(row+quiet)*scale,scale,scale);
}
}
}
function fillFacts(node,found){
const set=(name,value)=>{
const cell=node.querySelector(`[data-fact="${name}"]`);
if(!cell)return;
const holder=cell.closest('div');
if(value===null||value===undefined||value===''){
if(holder?.hasAttribute('data-optional'))holder.hidden=true;
return;
}
cell.textContent=String(value);
};
for(const holder of node.querySelectorAll('[data-only]')){
holder.hidden=holder.dataset.only!==found.kind;
}
set('symbol',symbologyName(found.symbology));
set('characters',[...found.text].length);
set('how',phrase(`how.${found.how}`)+(found.dense?phrase('how.dense'):''));
if(found.kind==='qr'){
set('version',`${found.version} (${phrase('value.modules', { n: found.dimension })})`);
set('level',found.level);
set('mask',found.mask);
set('repaired',found.corrections);
const modes=[...new Set(found.segments.map((segment)=>segment.mode))];
set('mode',modes.map((mode)=>phrase(`mode.${mode}`)).join(', '));
set('eci',found.eci===null?'':found.eci);
set('part',found.structuredAppend
?`${found.structuredAppend.index} / ${found.structuredAppend.total}`:'');
}else{
set('lines',found.lines);
}
}
function render(found){
const node=el.resultTemplate.content.firstElementChild.cloneNode(true);
const payload=found.payload;
node.querySelector('.result-kind').textContent=phrase(payload.kindKey);
node.querySelector('.result-symbology').textContent=symbologyName(found.symbology);
node.querySelector('.result-text').textContent=found.text;
node.dataset.kind=payload.kind;
const rows=node.querySelector('.result-rows');
for(const entry of payload.rows){
const holder=document.createElement('div');
const label=document.createElement('dt');
const value=document.createElement('dd');
label.textContent=phrase(entry.key);
value.textContent=entry.phrase?phrase(entry.phrase):entry.value;
if(entry.emphasis)value.className='emphasis';
if(entry.secret)value.classList.add('secret');
holder.append(label,value);
rows.append(holder);
}
rows.hidden=!payload.rows.length;
const warnings=node.querySelector('.result-warnings');
for(const warning of payload.warnings){
const item=document.createElement('li');
item.textContent=phrase(warning.key,warning.values);
warnings.append(item);
}
warnings.hidden=!payload.warnings.length;
const open=node.querySelector('.open');
if(payload.link){
open.href=payload.link.href;
open.hidden=false;
}
const copy=node.querySelector('.copy');
const original=copy.textContent;
copy.addEventListener('click',async()=>{
try{
await navigator.clipboard.writeText(found.text);
copy.textContent=phrase('value.copied');
setTimeout(()=>{copy.textContent=original;},1600);
}catch{
getSelection()?.selectAllChildren(node.querySelector('.result-text'));
}
});
fillFacts(node,found);
if(found.kind==='qr'&&found.modules){
const figure=node.querySelector('.grid-figure');
drawGrid(figure.querySelector('.grid'),found.dimension,found.modules);
figure.hidden=false;
}
return node;
}
function report(found){
if(shown.some((seen)=>seen===`${found.symbology}:${found.text}`))return false;
shown.unshift(`${found.symbology}:${found.text}`);
shown.length=Math.min(shown.length,MOST_KEPT);
el.resultStatus.textContent='';
el.results.prepend(render(found));
while(el.results.children.length>MOST_KEPT)el.results.lastElementChild.remove();
return true;
}
function fail(key){
el.pickError.hidden=false;
el.pickError.textContent=phrase(key);
}
function clearPreview(){
el.previewList.replaceChildren();
el.preview.hidden=true;
}
function showPicture(file,thumbnail,found){
const node=el.previewTemplate.content.firstElementChild.cloneNode(true);
if(thumbnail)node.querySelector('.preview-shot').append(thumbnail);
const name=node.querySelector('.preview-name');
name.textContent=file.name;
name.title=file.name;
const state=node.querySelector('.preview-state');
if(found){
state.textContent=symbologyName(found.symbology);
}else{
state.textContent=phrase(thumbnail?'preview.nothing':'preview.broken');
node.classList.add(thumbnail?'nothing':'broken');
}
el.previewList.append(node);
const count=el.previewList.children.length;
el.previewCaption.textContent=phrase(count===1?'preview.one':'preview.many',{n:count});
el.preview.hidden=false;
}
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){void readFiles(files);},
example:makeExample,
});
async function readFiles(files){
const mine=++fileGeneration;
el.pickError.hidden=true;
el.resultStatus.textContent='';
picker.busy(readingLabel(files.length));
clearPreview();
let any=false;
let broken=false;
try{
for(const file of files){
try{
const{found,thumbnail}=await readFile(file);
if(mine!==fileGeneration)return;
if(found){
any=true;
report(found);
}
showPicture(file,thumbnail,found);
}catch{
if(mine!==fileGeneration)return;
broken=true;
showPicture(file,null,null);
}
}
if(broken)fail('status.broken');
else if(!any)fail('status.nothing');
}finally{
if(mine===fileGeneration)picker.done();
}
}
function clearResults(){
fileGeneration+=1;
stopCamera();
picker.done();
shown.length=0;
el.results.replaceChildren();
clearPreview();
el.pickError.hidden=true;
el.resultStatus.textContent=phrase('status.cleared');
}
el.clearResults.addEventListener('click',clearResults);
window.addEventListener('paste',(event)=>{
const files=[...(event.clipboardData?.files??[])]
.filter((file)=>acceptsImageFile(file,['jpg','jpeg','png','webp','gif','bmp','avif','svg']));
if(files.length){
event.preventDefault();
void readFiles(files);
}
});
const cameraSession=camera.session();
let stream=null;
let looking=false;
let lastLook=0;
let cameraFrame=0;
let cameraStatusTimer=null;
const EVERY_MS=120;
function look(){
if(!looking)return;
cameraFrame=requestAnimationFrame(look);
const now=performance.now();
if(now-lastLook<EVERY_MS)return;
lastLook=now;
const frame=camera.frameInto(el.video,decodeCanvas);
if(!frame)return;
const found=scan(frame,{thorough:false});
if(found&&report(found)){
el.cameraCard.classList.add('hit');
setTimeout(()=>el.cameraCard.classList.remove('hit'),700);
}
}
async function startCamera(deviceId){
stopCamera();
el.pickError.hidden=true;
el.startCamera.hidden=true;
el.stopCamera.hidden=false;
let active;
try{
active=await cameraSession.open({deviceId});
}catch(error){
fail(camera.reasonFor(error));
stopCamera();
return;
}
if(!active)return;
stream=active;
el.video.srcObject=active;
el.cameraCard.hidden=false;
el.cameraStatus.textContent=phrase('status.on');
await el.video.play().catch(()=>{});
if(!cameraSession.isCurrent(active))return;
const devices=await camera.cameras();
if(!cameraSession.isCurrent(active))return;
if(devices.length>1&&!el.cameraPick.options.length){
for(const device of devices)el.cameraPick.append(new Option(device.label,device.deviceId));
el.cameraPickRow.hidden=false;
}
if(devices.length>1){
const selected=active.getVideoTracks()[0]?.getSettings?.().deviceId;
if(selected)el.cameraPick.value=selected;
}
el.torchRow.hidden=!camera.torchable(active);
el.torch.checked=false;
looking=true;
lastLook=0;
cameraFrame=requestAnimationFrame(look);
cameraStatusTimer=setTimeout(()=>{
if(looking&&cameraSession.isCurrent(active)){
el.cameraStatus.textContent=phrase('status.looking');
}
},2500);
}
function stopCamera(){
cameraSession.stop();
looking=false;
cancelAnimationFrame(cameraFrame);
cameraFrame=0;
clearTimeout(cameraStatusTimer);
cameraStatusTimer=null;
stream=null;
el.video.srcObject=null;
el.cameraCard.hidden=true;
el.startCamera.hidden=false;
el.stopCamera.hidden=true;
}
el.startCamera.addEventListener('click',()=>{void startCamera();});
el.stopCamera.addEventListener('click',stopCamera);
el.cameraPick.addEventListener('change',()=>{void startCamera(el.cameraPick.value);});
el.torch.addEventListener('change',()=>{
void camera.setTorch(stream,el.torch.checked);
});
document.addEventListener('visibilitychange',()=>{
if(document.hidden)stopCamera();
});
window.addEventListener('pagehide',stopCamera);
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
window.addEventListener('error',(event)=>{
el.pickError.hidden=false;
el.pickError.textContent=phrase('error.broke',{detail:event.message});
});
window.addEventListener('unhandledrejection',(event)=>{
el.pickError.hidden=false;
el.pickError.textContent=phrase('error.broke',{detail:event.reason?.message??event.reason});
});
document.getElementById('boot-warning')?.remove();
