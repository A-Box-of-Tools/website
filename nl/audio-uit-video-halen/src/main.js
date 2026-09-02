/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{sizeText}from'./shared/format.js';
import{messageBox}from'./shared/message-box.js';
import{wireFilePicker}from'./shared/file-picker.js';
import{decodeAudio,UnreadableFile}from'./shared/audio-decode.js';
import{writeWav}from'./shared/wav.js';
import{mixToMono}from'./mono.js';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
source:$('source'),
srcName:$('src-name'),
srcSize:$('src-size'),
srcLength:$('src-length'),
srcChannels:$('src-channels'),
srcRate:$('src-rate'),
rateNote:$('rate-note'),
takeCard:$('take-card'),
channels:$('channels'),
channelsNote:$('channels-note'),
status:$('status'),
error:$('error'),
result:$('result'),
resultAudio:$('result-audio'),
resultInfo:$('result-info'),
download:$('download'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showError,clear:clearError}=messageBox(el.error);
const humanBytes=(n)=>sizeText(n,phrase,{under:'size.bytes',kb:1,mb:1});
let sound=null;
let sourceName='';
let downloadUrl=null;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){load(files[0]);},
});
async function load(file){
clearError();
clearResult();
picker.busy(phrase('step.reading'));
el.status.textContent=phrase('step.reading');
el.status.hidden=false;
try{
sound=await decodeAudio(file);
sourceName=file.name;
describeSource(file);
el.takeCard.removeAttribute('inert');
write();
}catch(error){
sound=null;
el.source.hidden=true;
el.takeCard.setAttribute('inert','');
showError(say(error));
if(!(error instanceof UnreadableFile))console.error(error);
}finally{
picker.done();
el.status.hidden=true;
}
}
function describeSource(file){
el.srcName.textContent=file.name;
el.srcSize.textContent=humanBytes(file.size);
el.srcLength.textContent=clock(sound.duration);
el.srcChannels.textContent=phrase(channelWord(sound.channels.length));
el.srcRate.textContent=phrase('rate.khz',{n:(sound.sampleRate/1000).toFixed(1)});
el.rateNote.hidden=!sound.guessedRate;
el.source.hidden=false;
}
const channelWord=(n)=>(n===1?'channels.mono':n===2?'channels.stereo':'channels.many');
el.channels.addEventListener('change',()=>{if(sound)write();});
function write(){
clearError();
try{
const channels=el.channels.value==='mono'?[mixToMono(sound.channels)]:sound.channels;
const blob=writeWav(channels,sound.sampleRate,{bits:16});
if(downloadUrl)URL.revokeObjectURL(downloadUrl);
downloadUrl=URL.createObjectURL(blob);
el.resultAudio.src=downloadUrl;
el.download.href=downloadUrl;
el.download.download=wavName(sourceName);
el.resultInfo.textContent=phrase('out.info',{
size:humanBytes(blob.size),
length:clock(sound.duration),
channels:phrase(channelWord(channels.length)),
rate:(sound.sampleRate/1000).toFixed(1),
});
el.result.hidden=false;
}catch(error){
showError(say(error));
console.error(error);
}
}
function wavName(name){
const stem=name.replace(/\.[^.]+$/,'')||'audio';
return`${stem}.wav`;
}
function clearResult(){
el.result.hidden=true;
el.resultAudio.removeAttribute('src');
if(downloadUrl)URL.revokeObjectURL(downloadUrl);
downloadUrl=null;
}
function say(error){
if(error instanceof UnreadableFile)return phrase(error.message);
return error?.message?phrase(error.message):String(error);
}
function clock(seconds){
const whole=Math.max(0,Math.round(seconds));
const s=String(whole%60).padStart(2,'0');
const m=Math.floor(whole/60)%60;
const h=Math.floor(whole/3600);
return h?`${h}:${String(m).padStart(2, '0')}:${s}`:`${m}:${s}`;
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
document.getElementById('boot-warning')?.remove();
