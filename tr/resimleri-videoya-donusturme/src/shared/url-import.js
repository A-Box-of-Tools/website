/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const TIMEOUT_MS=20000;
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
throw new Error(`Not a valid web address: ${raw.trim().slice(0, 60)}`);
}
if(url.protocol!=='https:'&&url.protocol!=='http:'){
throw new Error(`Only http and https addresses are supported (got ${url.protocol}).`);
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
img.onerror=()=>reject(new Error(
`Could not load ${url.hostname}. The server may not allow other sites to `
+'use its images (no CORS header), or the address may be wrong.',
));
timer=setTimeout(()=>reject(new Error(`${url.hostname} did not respond within 20 seconds.`)),TIMEOUT_MS);
img.src=url.href;
});
}finally{
clearTimeout(timer);
}
if(!img.naturalWidth||!img.naturalHeight){
throw new Error(`${url.hostname} returned something that is not a usable image.`);
}
const canvas=document.createElement('canvas');
canvas.width=img.naturalWidth;
canvas.height=img.naturalHeight;
canvas.getContext('2d',{alpha:false}).drawImage(img,0,0);
const blob=await new Promise((resolve,reject)=>{
canvas.toBlob(
(result)=>(result?resolve(result):reject(new Error('Could not copy the image locally.'))),
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
failures.push({url:urls[i],reason:error.message});
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
status.textContent='Paste at least one address first.';
return;
}
const valid=[];
const rejected=[];
for(const line of lines){
try{
parseImageUrl(line);
valid.push(line);
}catch(error){
rejected.push(error.message);
}
}
if(!valid.length){
onError(rejected.join(' '));
status.textContent='Nothing to download.';
return;
}
busy=true;
button.disabled=true;
onClear?.();
try{
const{downloaded,failures}=await fetchImages(valid,({done,total})=>{
status.textContent=`Downloading ${Math.min(done + 1, total)} of ${total}...`;
});
status.textContent=downloaded.length
?`Downloaded ${downloaded.length} of ${valid.length}.`
:'Nothing could be downloaded.';
if(downloaded.length){
await onFiles(downloaded);
input.value='';
}
const problems=[...rejected,...failures.map((f)=>`${f.url}: ${f.reason}`)];
if(problems.length)onError(problems.join('\n'));
}catch(error){
onError(error.message);
status.textContent='Download failed.';
}finally{
busy=false;
button.disabled=false;
}
});
}
