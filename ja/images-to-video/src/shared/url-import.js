/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./phrases.js?v=200c3571cf';
const TIMEOUT_MS=20000;
function refusal(key,values={}){
return Object.assign(new Error(key),{values});
}
function errorText(error,fallback='url.failed'){
const key=error?.message;
if(/^[a-z0-9]+(?:[.-][a-z0-9]+)+$/.test(key)){
const translated=phrase(key,error.values);
if(translated!==key)return translated;
}
return phrase(fallback);
}
const JPEG_QUALITY=0.95;
function filenameFromUrl(url){
const last=url.pathname.split('/').filter(Boolean).pop()||'image';
const decoded=decodeURIComponent(last);
return/\.(jpe?g|png|webp|gif|avif|bmp)$/i.test(decoded)?decoded:`${decoded}.jpg`;
}
export function parseImageUrl(raw){
let url;
try{
url=new URL(raw.trim());
}catch{
throw refusal('url.invalid',{address:raw.trim().slice(0,60)});
}
if(url.protocol!=='https:'&&url.protocol!=='http:'){
throw refusal('url.protocol',{protocol:url.protocol});
}
return url;
}
export async function fetchImageAsFile(raw){
const url=parseImageUrl(raw);
const img=new Image();
img.crossOrigin='anonymous';
img.decoding='async';
img.referrerPolicy='no-referrer';
let timer;
try{
await new Promise((resolve,reject)=>{
img.onload=resolve;
img.onerror=()=>reject(refusal('url.load',{host:url.hostname}));
timer=setTimeout(()=>reject(refusal('url.timeout',{host:url.hostname})),TIMEOUT_MS);
img.src=url.href;
});
}finally{
clearTimeout(timer);
}
if(!img.naturalWidth||!img.naturalHeight){
throw refusal('url.notimage',{host:url.hostname});
}
const canvas=document.createElement('canvas');
canvas.width=img.naturalWidth;
canvas.height=img.naturalHeight;
canvas.getContext('2d',{alpha:false}).drawImage(img,0,0);
const blob=await new Promise((resolve,reject)=>{
canvas.toBlob(
(result)=>(result?resolve(result):reject(refusal('url.copy'))),
'image/jpeg',
JPEG_QUALITY,
);
});
return new File([blob],filenameFromUrl(url),{type:'image/jpeg'});
}
export async function fetchImages(urls,onProgress){
const downloaded=[];
const failures=[];
for(let i=0;i<urls.length;i++){
onProgress?.({done:i,total:urls.length,url:urls[i]});
try{
downloaded.push({file:await fetchImageAsFile(urls[i]),url:parseImageUrl(urls[i])});
}catch(error){
failures.push({url:urls[i],reason:error.message,values:error.values});
}
}
onProgress?.({done:urls.length,total:urls.length});
return{downloaded,failures};
}
export function wireUrlImport({input,button,status,onFiles,onError,onClear}){
let busy=false;
button.addEventListener('click',async()=>{
if(busy)return;
const lines=input.value.split('\n').map((s)=>s.trim()).filter(Boolean);
if(!lines.length){
status.textContent=phrase('url.empty');
return;
}
const valid=[];
const rejected=[];
for(const line of lines){
try{
parseImageUrl(line);
valid.push(line);
}catch(error){
rejected.push(errorText(error));
}
}
if(!valid.length){
onError(rejected.join(' '));
status.textContent=phrase('url.nothing');
return;
}
busy=true;
button.disabled=true;
onClear?.();
try{
const{downloaded,failures}=await fetchImages(valid,({done,total})=>{
status.textContent=phrase('url.progress',{done:Math.min(done+1,total),total});
});
status.textContent=downloaded.length
?phrase('url.done',{done:downloaded.length,total:valid.length})
:phrase('url.none');
const problems=[...rejected,...failures.map((f)=>phrase('url.problem',{url:f.url,reason:errorText({message:f.reason,values:f.values})}))];
if(downloaded.length){
try{
await onFiles(downloaded);
input.value='';
}catch(error){
status.textContent=phrase('url.import');
problems.push(errorText(error,'url.import'));
}
}
if(problems.length)onError(problems.join('\n'));
}catch(error){
onError(errorText(error));
status.textContent=phrase('url.failed');
}finally{
busy=false;
button.disabled=false;
}
});
}
