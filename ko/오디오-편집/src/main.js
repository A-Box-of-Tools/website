/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{wireFilePicker}from'./shared/file-picker.js';
import{decodeAudio,UnreadableFile}from'./shared/audio-decode.js';
import{render,lengthAfter}from'./edit.js';
import{peak,dbToGain,gainToDb,normalizeGain}from'./effects.js';
import{writeWav,wavSize}from'./shared/wav.js';
import{drawWaveform}from'./waveform.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
source:$('source'),
srcName:$('src-name'),
srcSize:$('src-size'),
srcLength:$('src-length'),
srcFormat:$('src-format'),
srcPeak:$('src-peak'),
srcRate:$('src-rate'),
srcWaveWrap:$('src-wave-wrap'),
srcWave:$('src-wave'),
preview:$('preview'),
pathNote:$('path-note'),
editCard:$('edit-card'),
reverse:$('reverse'),
speed:$('speed'),
speedValue:$('speed-value'),
speedNote:$('speed-note'),
volume:$('volume'),
volumeValue:$('volume-value'),
volumeNote:$('volume-note'),
sumLength:$('sum-length'),
sumSpeed:$('sum-speed'),
sumPeak:$('sum-peak'),
sumSize:$('sum-size'),
clipNote:$('clip-note'),
exportCard:$('export-card'),
depth:$('depth'),
exportBtn:$('export'),
cancelBtn:$('cancel'),
progress:$('progress'),
progressBar:$('progress-bar'),
progressLabel:$('progress-label'),
error:$('error'),
result:$('result'),
outWave:$('out-wave'),
resultAudio:$('result-audio'),
resultInfo:$('result-info'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
let file=null;
let source=null;
let sourcePeak=0;
let previewUrl=null;
let resultUrl=null;
let lastEdited=null;
let exporting=false;
let abortController=null;
let speed=1;
const SPEED_LIMITS={min:0.25,max:4};
const NORMALIZE_TARGET=-1;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
const[picked]=files;
if(picked)loadFile(picked);
},
});
async function loadFile(picked){
if(exporting)return;
clearError();
clearResult();
picker.busy(phrase('step.reading'));
try{
const decoded=await decodeAudio(picked);
file=picked;
source=decoded;
sourcePeak=peak(decoded.channels);
showSource();
updateSummary();
}catch(error){
if(error instanceof UnreadableFile)showError(phrase(error.message));
else{
showError(phrase('read.failed',{why:phrase(error?.message??String(error))}));
console.error(error);
}
}finally{
picker.done();
}
}
function showSource(){
el.srcName.textContent=file.name;
el.srcSize.textContent=formatBytes(file.size);
el.srcLength.textContent=formatDuration(source.duration);
el.srcFormat.textContent=phrase('src.format',{
channels:channelWord(source.channels.length),
khz:(source.sampleRate/1000).toFixed(1),
});
el.srcPeak.textContent=formatPeak(sourcePeak);
el.srcRate.textContent=phrase(
source.guessedRate?'src.rate.assumed':'src.rate.file',
{rate:source.sampleRate},
);
el.source.hidden=false;
el.pathNote.hidden=!source.guessedRate;
if(source.guessedRate){
el.pathNote.textContent=phrase('src.guessednote');
}
if(previewUrl)URL.revokeObjectURL(previewUrl);
previewUrl=URL.createObjectURL(file);
el.preview.src=previewUrl;
el.srcWaveWrap.hidden=false;
drawWaveform(el.srcWave,source.channels);
}
function settings(){
return{
reverse:el.reverse.checked,
speed,
keepPitch:pickedValue('pitch')==='keep',
volume:{
mode:pickedValue('level'),
db:pickedValue('level')==='normalize'?NORMALIZE_TARGET:Number(el.volume.value),
},
};
}
const pickedValue=(name)=>document.querySelector(`input[name="${name}"]:checked`).value;
function setSpeed(wanted){
speed=clamp(Math.round(wanted*100)/100,SPEED_LIMITS.min,SPEED_LIMITS.max);
el.speed.value=String(Math.log2(speed));
el.speedValue.value=formatSpeed(speed);
updateSummary();
}
function setVolume(db){
el.volume.value=String(clamp(db,-24,24));
el.volumeValue.value=formatDb(Number(el.volume.value));
updateSummary();
}
el.speed.addEventListener('input',()=>setSpeed(2**Number(el.speed.value)));
el.speedValue.addEventListener('change',()=>{
const typed=Number(el.speedValue.value.replace(/[^0-9.]/g,''));
setSpeed(Number.isFinite(typed)&&typed>0?typed:speed);
});
el.volume.addEventListener('input',()=>{
el.volumeValue.value=formatDb(Number(el.volume.value));
updateSummary();
});
el.volumeValue.addEventListener('change',()=>{
const cleaned=el.volumeValue.value.replace(/[^0-9.+-]/g,'');
const typed=Number(cleaned);
setVolume(cleaned&&Number.isFinite(typed)?typed:Number(el.volume.value));
});
for(const button of document.querySelectorAll('.presets button')){
button.addEventListener('click',()=>setSpeed(Number(button.dataset.speed)));
}
for(const input of document.querySelectorAll('input[name="pitch"], input[name="level"]')){
input.addEventListener('change',updateSummary);
}
el.reverse.addEventListener('change',updateSummary);
el.depth.addEventListener('change',updateSummary);
function updateSummary(){
if(!source)return;
const chosen=settings();
const frames=lengthAfter(source.frames,chosen.speed,chosen.keepPitch);
const bits=Number(el.depth.value);
el.sumLength.textContent=formatDuration(frames/source.sampleRate);
el.sumSpeed.textContent=chosen.speed===1
?'unchanged'
:`${formatSpeed(chosen.speed)}, ${chosen.keepPitch ? 'same pitch' : `pitch ${chosen.speed > 1 ? 'up' : 'down'}`}`;
const gain=chosen.volume.mode==='normalize'
?normalizeGain(sourcePeak,NORMALIZE_TARGET)
:dbToGain(chosen.volume.db);
const after=sourcePeak*gain;
el.sumPeak.textContent=formatPeak(after);
el.sumSize.textContent=formatBytes(wavSize(frames,source.channels.length,bits));
el.speedNote.textContent=speedNote(chosen);
el.volumeNote.textContent=volumeNote(chosen,gain,after);
const clips=after>1.0001;
el.clipNote.hidden=!clips;
if(clips){
el.clipNote.textContent=phrase('join.sentences',{
a:phrase('clip.over',{db:gainToDb(after).toFixed(1)}),
b:phrase(bits===32?'clip.float':'clip.int'),
});
}
}
function speedNote(chosen){
if(chosen.speed===1)return phrase('speed.none');
const faster=chosen.speed>1;
if(chosen.keepPitch){
return phrase(faster?'speed.pitch.faster':'speed.pitch.slower',
{speed:formatSpeed(chosen.speed)});
}
return phrase(faster?'speed.moves.faster':'speed.moves.slower',{
speed:formatSpeed(chosen.speed),
semitones:Math.abs(12*Math.log2(chosen.speed)).toFixed(1),
});
}
function volumeNote(chosen,gain,after){
if(chosen.volume.mode==='normalize'){
const change=gainToDb(gain);
if(Math.abs(change)<0.05)return phrase('volume.already');
return phrase(change>0?'volume.raised':'volume.lowered',
{db:Math.abs(change).toFixed(1)});
}
if(chosen.volume.db===0)return phrase('volume.unchanged');
return phrase(chosen.volume.db>0?'volume.up':'volume.down',{
db:Math.abs(chosen.volume.db).toFixed(1),
gain:gain.toFixed(3),
peak:formatPeak(after),
});
}
async function runExport(){
if(!source||exporting)return;
clearError();
clearResult();
exporting=true;
abortController=new AbortController();
el.exportBtn.disabled=true;
el.cancelBtn.hidden=false;
el.progress.hidden=false;
progress(0,'step.starting');
const chosen=settings();
const bits=Number(el.depth.value);
try{
const started=performance.now();
const edited=await render(source,chosen,{
signal:abortController.signal,
onProgress:(done,label)=>progress(done,label),
});
const blob=writeWav(edited.channels,source.sampleRate,{bits});
const seconds=edited.channels[0].length/source.sampleRate;
resultUrl=URL.createObjectURL(blob);
el.resultAudio.src=resultUrl;
el.download.href=resultUrl;
el.download.download=outputName(file.name,chosen);
el.result.hidden=false;
lastEdited=edited.channels;
drawWaveform(el.outWave,lastEdited);
el.resultInfo.textContent=[
phrase(bits===32?'out.wav.float':'out.wav.int'),
formatDuration(seconds),
formatBytes(blob.size),
phrase('out.peak',{peak:formatPeak(edited.peak)}),
edited.clipped
?phrase(edited.clipped===1?'out.clipped.one':'out.clipped.many',
{n:edited.clipped.toLocaleString()})
:null,
phrase('out.took',{n:((performance.now()-started)/1000).toFixed(1)}),
].filter(Boolean).reduce((a,b)=>phrase('join.dot',{a,b}));
el.progress.hidden=true;
el.result.scrollIntoView({behavior:'smooth',block:'nearest'});
}catch(error){
el.progress.hidden=true;
if(error?.name!=='AbortError'){
showError(error?.message?phrase(error.message):phrase('edit.failed'));
console.error(error);
}
}finally{
exporting=false;
abortController=null;
el.cancelBtn.hidden=true;
el.exportBtn.disabled=false;
}
}
function outputName(name,chosen){
const base=name.replace(/\.[^.]+$/,'')||'audio';
const parts=[];
if(chosen.reverse)parts.push('reversed');
if(chosen.speed!==1)parts.push(`${formatSpeed(chosen.speed).replace('.', '-')}`);
if(chosen.volume.mode==='normalize')parts.push('normalised');
else if(chosen.volume.db)parts.push(`${chosen.volume.db > 0 ? 'up' : 'down'}${Math.abs(chosen.volume.db)}db`);
if(!parts.length)parts.push('edited');
return`${base}-${parts.join('-')}.wav`;
}
function progress(done,label){
el.progressBar.style.width=`${Math.round(done * 100)}%`;
if(label)el.progressLabel.textContent=phrase(label);
}
el.exportBtn.addEventListener('click',runExport);
el.cancelBtn.addEventListener('click',()=>abortController?.abort());
window.addEventListener('beforeunload',(event)=>{
if(!exporting)return;
event.preventDefault();
event.returnValue='';
});
window.addEventListener('resize',()=>{
if(source)drawWaveform(el.srcWave,source.channels);
if(lastEdited)drawWaveform(el.outWave,lastEdited);
});
function showError(message){
el.error.textContent=message;
el.error.hidden=false;
}
function clearError(){
el.error.hidden=true;
el.error.textContent='';
}
function clearResult(){
el.result.hidden=true;
el.resultAudio.removeAttribute('src');
if(resultUrl)URL.revokeObjectURL(resultUrl);
resultUrl=null;
lastEdited=null;
}
const clamp=(value,low,high)=>Math.min(high,Math.max(low,value));
const channelWord=(count)=>phrase(
count===1?'channels.mono':count===2?'channels.stereo':'channels.many',
{n:count},
);
function formatSpeed(value){
const shown=value>=10?value.toFixed(1):value.toFixed(2);
return phrase('speed.times',{n:shown.replace(/\.?0+$/,'')});
}
const formatDb=(db)=>`${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;
function formatPeak(value){
if(!(value>0))return phrase('peak.silence');
return phrase('peak.dbfs',{n:gainToDb(value).toFixed(1)});
}
const EMPTY='\u2013';
function formatDuration(seconds){
if(!Number.isFinite(seconds))return EMPTY;
const whole=Math.floor(seconds);
const hours=Math.floor(whole/3600);
const minutes=Math.floor((whole%3600)/60);
const rest=seconds-hours*3600-minutes*60;
const shown=rest.toFixed(1).padStart(4,'0');
return hours
?`${hours}:${String(minutes).padStart(2, '0')}:${shown}`
:`${minutes}:${shown}`;
}
function formatBytes(bytes){
if(bytes<1024)return phrase('size.b',{n:bytes});
if(bytes<1024*1024)return phrase('size.kb',{n:(bytes/1024).toFixed(1)});
if(bytes<1024*1024*1024){
return phrase('size.mb',{n:(bytes/(1024*1024)).toFixed(1)});
}
return phrase('size.gb',{n:(bytes/(1024*1024*1024)).toFixed(2)});
}
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
window.addEventListener('error',(event)=>{
showError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
setSpeed(1);
setVolume(0);
document.getElementById('boot-warning')?.remove();
