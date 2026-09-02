/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import*as camera from'./camera.js';
import{scan}from'./scan.js';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js';
import{phrase}from'./shared/phrases.js';
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
resultTemplate:$('result-template'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const WORKING_SIDE=1800;
const decodeCanvas=document.createElement('canvas');
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
async function readFile(file){
const picture=await pictureFrom(file);
const width=picture.width??picture.naturalWidth;
const height=picture.height??picture.naturalHeight;
let found=scan(pixelsOf(picture,width,height,WORKING_SIDE));
if(!found&&Math.max(width,height)>WORKING_SIDE){
found=scan(pixelsOf(picture,width,height,Math.max(width,height)));
}
picture.close?.();
return found;
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
el.results.prepend(render(found));
while(el.results.children.length>MOST_KEPT)el.results.lastElementChild.remove();
return true;
}
function fail(key){
el.pickError.hidden=false;
el.pickError.textContent=phrase(key);
}
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){void readFiles(files);},
});
async function readFiles(files){
el.pickError.hidden=true;
picker.busy(readingLabel(files.length));
let any=false;
let broken=false;
for(const file of files){
try{
const found=await readFile(file);
if(found)any=report(found)||any;
}catch{
broken=true;
}
}
picker.done();
if(broken)fail('status.broken');
else if(!any)fail('status.nothing');
}
window.addEventListener('paste',(event)=>{
const files=[...(event.clipboardData?.files??[])]
.filter((file)=>file.type.startsWith('image/'));
if(files.length){
event.preventDefault();
void readFiles(files);
}
});
let stream=null;
let looking=false;
let lastLook=0;
const EVERY_MS=120;
function look(){
if(!looking)return;
requestAnimationFrame(look);
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
el.pickError.hidden=true;
try{
if(stream)camera.close(stream);
stream=await camera.open({deviceId});
}catch(error){
stream=null;
fail(camera.reasonFor(error));
stopCamera();
return;
}
el.video.srcObject=stream;
el.cameraCard.hidden=false;
el.startCamera.hidden=true;
el.stopCamera.hidden=false;
el.cameraStatus.textContent=phrase('status.on');
await el.video.play().catch(()=>{});
const devices=await camera.cameras();
if(devices.length>1&&!el.cameraPick.options.length){
for(const device of devices)el.cameraPick.append(new Option(device.label,device.deviceId));
el.cameraPickRow.hidden=false;
}
if(devices.length>1){
const active=stream.getVideoTracks()[0]?.getSettings?.().deviceId;
if(active)el.cameraPick.value=active;
}
el.torchRow.hidden=!camera.torchable(stream);
el.torch.checked=false;
looking=true;
lastLook=0;
requestAnimationFrame(look);
setTimeout(()=>{
if(looking)el.cameraStatus.textContent=phrase('status.looking');
},2500);
}
function stopCamera(){
looking=false;
if(stream)camera.close(stream);
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
if(document.hidden&&stream)stopCamera();
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
