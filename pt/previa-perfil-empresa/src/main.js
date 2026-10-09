/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{saveBlob}from'./shared/download.js?v=44ff688333';
import{phrase}from'./shared/phrases.js?v=44ff688333';
import{textImport}from'./shared/text-import.js?v=44ff688333';
import{readPhoto}from'./photo.js?v=44ff688333';
import{parseListing}from'./parse-listing.js?v=44ff688333';
import{DAY_KEYS,FORM_DAYS,empty,normalise}from'./profile.js?v=44ff688333';
import{FONT}from'./render.js?v=44ff688333';
import{toPng,svgBlob}from'./raster.js?v=44ff688333';
import{EXAMPLE,coverPhoto}from'./samples.js?v=44ff688333';
import{fromJson,toJson}from'./saved.js?v=44ff688333';
import{SURFACES}from'./surfaces.js?v=44ff688333';
import{describe}from'./view.js?v=44ff688333';
import{localDateValue,previewDate}from'./preview-time.js?v=44ff688333';
const el=(id)=>document.getElementById(id);
const ui={
paste:el('paste'),readPaste:el('read-paste'),openJson:el('open-json'),
jsonFile:el('json-file'),importNote:el('import-note'),importError:el('import-error'),
name:el('name'),nameNote:el('name-note'),category:el('category'),
rating:el('rating'),reviews:el('reviews'),price:el('price'),
description:el('description'),descriptionNote:el('description-note'),
attributes:el('attributes'),
pickPhoto:el('pick-photo'),dropPhoto:el('drop-photo'),photoFile:el('photo-file'),
photoNote:el('photo-note'),sample:el('sample'),clear:el('clear'),
address:el('address'),serviceArea:el('service-area'),
phone:el('phone'),website:el('website'),
status:el('status'),clock:el('clock'),week:el('week'),weekNote:el('week-note'),
previewFixed:el('preview-fixed'),previewAt:el('preview-at'),
previewTimeError:el('preview-time-error'),
copyMonday:el('copy-monday'),weekdaysOnly:el('weekdays-only'),
privacyToggle:el('privacy-toggle'),privacyPanel:el('privacy-panel'),
stage:el('stage'),stageNote:el('stage-note'),scale:el('scale'),
savePng:el('save-png'),saveSvg:el('save-svg'),saveJson:el('save-json'),
saveNote:el('save-note'),saveError:el('save-error'),
};
const gauge=document.createElement('canvas').getContext('2d');
function measure(value,size,weight=400){
gauge.font=`${weight} ${size}px ${FONT}`;
return gauge.measureText(String(value)).width;
}
const labels=Object.fromEntries(
[...document.querySelectorAll('#phrases [data-phrase]')]
.map((node)=>[node.dataset.phrase,phrase(node.dataset.phrase)]));
const longDays=DAY_KEYS.map((day)=>labels[`day.long.${day}`]);
function buildWeek(){
const closedWord=phrase('status.closed');
for(const day of FORM_DAYS){
const row=document.createElement('div');
row.className='week-row';
row.dataset.day=String(day);
const name=document.createElement('span');
name.className='week-day';
name.textContent=longDays[day];
const shutLabel=document.createElement('label');
shutLabel.className='check week-shut';
const shut=document.createElement('input');
shut.type='checkbox';
shut.className='day-shut';
shut.setAttribute('aria-label',phrase('week.shut',{day:longDays[day]}));
const shutText=document.createElement('span');
shutText.textContent=closedWord;
shutLabel.append(shut,shutText);
const from=document.createElement('input');
from.type='time';
from.className='day-open';
from.defaultValue='09:00';
from.setAttribute('aria-label',phrase('week.open',{day:longDays[day]}));
const dash=document.createElement('span');
dash.className='week-dash';
dash.textContent='–';
dash.setAttribute('aria-hidden','true');
const to=document.createElement('input');
to.type='time';
to.className='day-close';
to.defaultValue='17:00';
to.setAttribute('aria-label',phrase('week.close',{day:longDays[day]}));
row.append(name,shutLabel,from,dash,to);
ui.week.append(row);
}
}
function weekRows(){
const rows=new Array(7);
for(const row of ui.week.querySelectorAll('.week-row'))rows[Number(row.dataset.day)]=row;
return rows;
}
function read(){
return normalise({
name:ui.name.value,
category:ui.category.value,
price:ui.price.value,
rating:ui.rating.value,
reviews:ui.reviews.value,
address:ui.address.value,
serviceArea:ui.serviceArea.checked,
phone:ui.phone.value,
website:ui.website.value,
description:ui.description.value,
attributes:ui.attributes.value,
status:ui.status.value,
clock:ui.clock.value,
hours:weekRows().map((row)=>({
closed:row.querySelector('.day-shut').checked,
open:row.querySelector('.day-open').value,
close:row.querySelector('.day-close').value,
})),
photo,
});
}
function write(profile){
ui.name.value=profile.name;
ui.category.value=profile.category;
ui.price.value=profile.price;
ui.rating.value=profile.rating;
ui.reviews.value=profile.reviews;
ui.address.value=profile.address;
ui.serviceArea.checked=profile.serviceArea;
ui.phone.value=profile.phone;
ui.website.value=profile.website;
ui.description.value=profile.description;
ui.attributes.value=profile.attributes;
ui.status.value=profile.status;
ui.clock.value=profile.clock;
weekRows().forEach((row,day)=>{
const entry=profile.hours[day];
row.querySelector('.day-shut').checked=entry.closed;
row.querySelector('.day-open').value=entry.open;
row.querySelector('.day-close').value=entry.close;
});
if(profile.photo)setPhoto(profile.photo);
}
let photo=null;
let photoRead=null;
function retirePhoto(){
photoRead?.abort();
photoRead=null;
}
function setPhoto(dataUri,note=''){
photo=dataUri;
ui.dropPhoto.hidden=!dataUri;
say(ui.photoNote,note);
}
function stem(value=read().name){
const name=value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
return name||'business-profile';
}
let drawn=null;
let pending=0;
let pngWrite=null;
function syncDownloads(){
ui.savePng.disabled=!drawn||!!pngWrite;
ui.saveSvg.disabled=!drawn;
}
function retirePng(){
pngWrite?.abort();
pngWrite=null;
syncDownloads();
say(ui.saveNote,'');
say(ui.saveError,'');
}
function chosen(){
const pressed=document.querySelector('.chip[aria-pressed="true"]');
return pressed?.dataset.surface??'panel';
}
function schedule(){
if(pending)return;
pending=requestAnimationFrame(()=>{pending=0;draw();});
}
function draw(){
if(pending){cancelAnimationFrame(pending);pending=0;}
const date=ui.previewFixed.checked?previewDate(ui.previewAt.value):new Date();
const invalid=!date;
ui.previewAt.setAttribute('aria-invalid',String(invalid));
say(ui.previewTimeError,invalid?phrase('preview.invalid'):'');
if(invalid){
drawn=null;
ui.stage.replaceChildren();
ui.stageNote.textContent='';
ui.weekNote.textContent='';
syncDownloads();
return;
}
const profile=read();
const view=describe(profile,labels,date);
const surface=chosen();
drawn=SURFACES[surface](view,measure);
ui.stage.innerHTML=drawn.svg;
const picture=ui.stage.firstElementChild;
if(picture){
picture.setAttribute('aria-label',phrase('stage.alt',{
name:view.name,
status:[view.status.lead,view.status.tail].filter(Boolean).join(', '),
reviews:view.reviewsText,
}));
}
ui.stageNote.textContent=phrase(`stage.${surface}`,{
width:drawn.width,height:drawn.height,
});
ui.nameNote.textContent=profile.name
?phrase('name.length',{count:profile.name.length}):'';
ui.descriptionNote.textContent=profile.description
?phrase('description.length',{count:profile.description.length}):'';
ui.weekNote.textContent=phrase(ui.previewFixed.checked?'week.chosen':'week.reads',{
date:new Intl.DateTimeFormat(document.documentElement.lang,{
dateStyle:'medium',timeStyle:'short',
}).format(date),
status:[view.status.lead,view.status.tail].filter(Boolean).join(' · '),
});
syncDownloads();
}
function followClock(){
setTimeout(()=>{
if(!ui.previewFixed.checked)draw();
followClock();
},60000-Date.now()%60000);
}
function say(node,message,bad=false){
node.textContent=message;
node.hidden=!message;
node.classList.toggle('bad',bad);
}
function clearImport(){
say(ui.importNote,'');
say(ui.importError,'');
}
function fieldList(found){
const words=found.map((field)=>phrase(`field.${field}`));
if(words.length<=1)return words[0]??'';
return phrase('field.list',{
first:words.slice(0,-1).join(', '),
last:words[words.length-1],
});
}
function readPaste(){
replaceProfile();
clearImport();
const text=ui.paste.value.trim();
if(!text){say(ui.importError,phrase('paste.empty'));return;}
const furniture=['website','directions','call','save','share']
.map((id)=>labels[`label.${id}`]);
const{profile,found}=parseListing(text,longDays,furniture);
if(!found.length){say(ui.importError,phrase('paste.nothing'));return;}
write({...profile,clock:read().clock});
say(ui.importNote,phrase('paste.read',{fields:fieldList(found)}));
draw();
}
const savedRead=textImport({
busy(){ui.openJson.setAttribute('aria-busy','true');},
done(){ui.openJson.removeAttribute('aria-busy');},
});
function readSaved(file){
clearImport();
retirePhoto();
retirePng();
return savedRead.read([file],{
apply([text]){
const{profile,shape}=fromJson(text);
setPhoto(null);
write(profile);
say(ui.importNote,phrase(shape==='google'?'load.google':'load.own'));
draw();
},
failed(error){
const detail=['load.notjson','load.unknown'].includes(error?.message)
?phrase(error.message):phrase('load.failed');
say(ui.importError,detail);
},
});
}
function retireImports(){
savedRead.invalidate();
}
function replaceProfile(){
retireImports();
retirePhoto();
retirePng();
}
function fillExample(){
replaceProfile();
clearImport();
const words=['name','category','address','phone','website','description',
'attributes'];
const profile={...EXAMPLE};
for(const field of words)profile[field]=phrase(EXAMPLE[field]);
setPhoto(coverPhoto());
write(normalise({...profile,clock:read().clock,photo}));
draw();
say(ui.photoNote,phrase('sample.done'));
}
function clearAll(){
replaceProfile();
ui.previewFixed.checked=false;
ui.previewAt.disabled=true;
ui.previewAt.value='';
clearImport();
setPhoto(null);
write(empty());
draw();
say(ui.photoNote,phrase('clear.done'));
}
async function savePng(){
if(pngWrite)return;
draw();
if(!drawn)return;
say(ui.saveError,'');
say(ui.saveNote,'');
const owner=new AbortController();
pngWrite=owner;
syncDownloads();
const picture={...drawn};
const scale=Number(ui.scale.value)||1;
const name=`${stem()}-${chosen()}.png`;
const width=Math.round(picture.width*scale);
const height=Math.round(picture.height*scale);
try{
const blob=await toPng(picture,scale,owner.signal);
if(pngWrite!==owner)return;
saveBlob(blob,name);
say(ui.saveNote,phrase('save.done',{name,width,height}));
}catch(error){
if(pngWrite!==owner||error?.name==='AbortError')return;
const detail=['save.nosvg','save.nopng'].includes(error?.message)
?phrase(error.message):phrase('save.nopng');
say(ui.saveError,phrase('save.failed',{detail}));
}finally{
if(pngWrite===owner){pngWrite=null;syncDownloads();}
}
}
function wire(){
for(const node of[
ui.name,ui.category,ui.rating,ui.reviews,ui.price,ui.description,
ui.attributes,ui.address,ui.serviceArea,ui.phone,ui.website,
ui.status,ui.clock,
]){
node.addEventListener('input',()=>{retireImports();schedule();});
}
ui.week.addEventListener('input',()=>{retireImports();schedule();});
ui.previewFixed.addEventListener('change',()=>{
ui.previewAt.disabled=!ui.previewFixed.checked;
if(ui.previewFixed.checked&&!ui.previewAt.value){
ui.previewAt.value=localDateValue(new Date());
}
draw();
});
ui.previewAt.addEventListener('input',schedule);
document.addEventListener('visibilitychange',()=>{
if(!document.hidden&&!ui.previewFixed.checked)draw();
});
for(const button of document.querySelectorAll('.chip[data-surface]')){
button.addEventListener('click',()=>{
for(const other of document.querySelectorAll('.chip[data-surface]')){
other.setAttribute('aria-pressed',String(other===button));
}
draw();
});
}
ui.copyMonday.addEventListener('click',()=>{
retireImports();
const monday=weekRows()[1];
const from=monday.querySelector('.day-open').value;
const to=monday.querySelector('.day-close').value;
const shut=monday.querySelector('.day-shut').checked;
for(const row of weekRows()){
row.querySelector('.day-open').value=from;
row.querySelector('.day-close').value=to;
row.querySelector('.day-shut').checked=shut;
}
draw();
ui.weekNote.textContent=`${phrase('week.copied')} ${ui.weekNote.textContent}`;
});
ui.weekdaysOnly.addEventListener('click',()=>{
retireImports();
weekRows().forEach((row,day)=>{
row.querySelector('.day-shut').checked=day===0||day===6;
});
draw();
ui.weekNote.textContent=`${phrase('week.weekdays')} ${ui.weekNote.textContent}`;
});
ui.pickPhoto.addEventListener('click',()=>ui.photoFile.click());
ui.photoFile.addEventListener('change',async()=>{
const file=ui.photoFile.files?.[0];
ui.photoFile.value='';
if(!file)return;
retireImports();
retirePhoto();
const owner=new AbortController();
photoRead=owner;
try{
const picture=await readPhoto(file,undefined,owner.signal);
if(photoRead!==owner)return;
setPhoto(picture.uri,phrase('photo.added',{
width:picture.width,height:picture.height,
}));
draw();
}catch(error){
if(photoRead!==owner||error?.name==='AbortError')return;
const key=['photo.toobig','photo.unreadable','photo.tiny'].includes(error?.message)
?error.message:'photo.unreadable';
say(ui.photoNote,phrase(key),true);
}finally{
if(photoRead===owner)photoRead=null;
}
});
ui.dropPhoto.addEventListener('click',()=>{
retireImports();
retirePhoto();
setPhoto(null,phrase('photo.gone'));
draw();
});
ui.sample.addEventListener('click',fillExample);
ui.clear.addEventListener('click',clearAll);
ui.readPaste.addEventListener('click',readPaste);
ui.openJson.addEventListener('click',()=>ui.jsonFile.click());
ui.jsonFile.addEventListener('change',()=>{
const file=ui.jsonFile.files?.[0];
ui.jsonFile.value='';
if(file)readSaved(file);
});
ui.privacyToggle.addEventListener('click',()=>{
const open=ui.privacyPanel.hidden;
ui.privacyPanel.hidden=!open;
ui.privacyToggle.setAttribute('aria-expanded',String(open));
});
ui.savePng.addEventListener('click',savePng);
ui.saveSvg.addEventListener('click',()=>{
draw();
if(!drawn)return;
saveBlob(svgBlob(drawn.svg),`${stem()}-${chosen()}.svg`);
say(ui.saveNote,phrase('save.svgdone'));
});
ui.saveJson.addEventListener('click',()=>{
saveBlob(new Blob([toJson(read())],{type:'application/json'}),`${stem()}.json`);
say(ui.saveNote,phrase('save.jsondone'));
});
}
window.addEventListener('error',(event)=>{
say(ui.saveError,phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
say(ui.saveError,phrase('error.broke',{
detail:event.reason?.message??event.reason,
}));
});
buildWeek();
wire();
draw();
followClock();
document.getElementById('boot-warning')?.remove();
