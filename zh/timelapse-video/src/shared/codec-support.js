/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const PATIENCE=2000;
const CODECS=new Set(['VideoEncoder','VideoDecoder','AudioEncoder','AudioDecoder']);
function needsMediaInitialization(){
const platform=globalThis.navigator;
const ua=platform?.userAgent??'';
return/^Linux\b/i.test(platform?.platform??'')
&&platform?.vendor==='Apple Computer, Inc.'
&&/\bAppleWebKit\//.test(ua)
&&!/\b(?:Chromium|Chrome|CriOS|Edg|EdgA|EdgiOS|OPR|Firefox|FxiOS)\//.test(ua);
}
function initializeMedia(){
try{
const video=globalThis.document?.createElement?.('video');
if(typeof video?.canPlayType!=='function')return false;
video.canPlayType('video/mp4; codecs="avc1.640034"');
return true;
}catch{
return false;
}
}
export function firstSupported(codec,configs,ms=PATIENCE){
if(!CODECS.has(codec)||!Array.isArray(configs))return Promise.resolve(null);
if(!configs.length)return Promise.resolve(-1);
if(typeof Worker!=='function'||!Number.isFinite(ms)||ms<=0)return Promise.resolve(null);
const deadline=performance.now()+ms;
if(codec==='VideoEncoder'&&needsMediaInitialization()&&!initializeMedia())return Promise.resolve(null);
const remaining=deadline-performance.now();
if(remaining<=0)return Promise.resolve(null);
return new Promise((resolve)=>{
let worker;
let settled=false;
const finish=(answer)=>{
if(settled)return;
settled=true;
clearTimeout(timer);
if(worker){
worker.onmessage=null;
worker.onerror=null;
worker.onmessageerror=null;
worker.terminate();
}
resolve(answer);
};
const timer=setTimeout(()=>finish(null),remaining);
try{
worker=new Worker(new URL('./codec-support-worker.js?v=1b298d789d',import.meta.url),{type:'module'});
worker.onmessage=({data})=>{
const index=data?.index;
const valid=Number.isInteger(index)&&index>=-1&&index<configs.length;
finish(performance.now()<deadline&&valid?index:null);
};
worker.onerror=(event)=>{event.preventDefault();finish(null);};
worker.onmessageerror=()=>finish(null);
worker.postMessage({codec,configs});
}catch{
finish(null);
}
});
}
export async function askSupported(codec,config,ms=PATIENCE){
if(typeof codec?.isConfigSupported!=='function')return false;
let timer;
const silence=Symbol('no answer');
try{
const answer=await Promise.race([
codec.isConfigSupported(config),
new Promise((resolve)=>{timer=setTimeout(()=>resolve(silence),ms);}),
]);
if(answer===silence)return null;
return Boolean(answer&&answer.supported);
}catch{
return false;
}finally{
clearTimeout(timer);
}
}
