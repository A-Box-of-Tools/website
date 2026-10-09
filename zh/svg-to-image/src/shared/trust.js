/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./phrases.js?v=2f4f8e7572';
export const PLATFORM_HOSTS=/(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;
export function sortHosts(entries,{origin,expected=[]}){
const platform=new Set();
const external=new Set();
let total=0;
for(const entry of entries){
if(entry.name.startsWith('blob:')||entry.name.startsWith('data:'))continue;
total+=1;
const url=new URL(entry.name,origin);
if(url.origin===origin)continue;
if(expected.includes(url.hostname))continue;
if(PLATFORM_HOSTS.test(url.hostname))platform.add(url.hostname);
else external.add(url.hostname);
}
return{platform,external,total};
}
export function describe({platform,external,total},t=phrase){
const note=platform.size
?t(platform.size===1?'net.platform.one':'net.platform.many',{hosts:platform.size})
:'';
const clean=external.size===0;
const text=clean
?t('net.clean',{total,platform:note})
:t('net.dirty',{hosts:[...external].join(', '),platform:note});
return{clean,text};
}
function monitorNetwork(){
const count=document.getElementById('network-count');
const dot=document.getElementById('network-dot');
if(!count||!dot)return;
const page={
origin:location.origin,
expected:(count.dataset.expected??'').split(' ').filter(Boolean),
};
const platform=new Set();
const external=new Set();
const inspect=(entries)=>{
const seen=sortHosts(entries,page);
for(const host of seen.platform)platform.add(host);
for(const host of seen.external)external.add(host);
const{total}=sortHosts(performance.getEntriesByType('resource'),page);
const{clean,text}=describe({platform,external,total});
count.textContent=text;
count.className=clean?'good':'warn';
dot.className=`live-dot ${clean ? 'good' : 'warn'}`;
};
inspect(performance.getEntriesByType('resource'));
try{
new PerformanceObserver((list)=>inspect(list.getEntries()))
.observe({type:'resource',buffered:true});
}catch{
}
}
export async function prepareOffline(container,url,version,{
timeout=45_000,createChannel=()=>new MessageChannel(),
}={}){
if(!/^[0-9a-f]{10}$/.test(version||''))throw new Error('offline.build-missing');
let registration;
try{
registration=await container.register(url,{updateViaCache:'none'});
}catch(error){
registration=await container.getRegistration?.(url);
if(registration?.active?.scriptURL!==url)throw error;
}
const worker=await new Promise((resolve,reject)=>{
const until=Date.now()+timeout;
const inspect=()=>{
const active=registration.active;
if(active?.state==='activated'&&active.scriptURL===url
&&container.controller?.scriptURL===url){
resolve(active);
}else if(Date.now()>=until){
reject(new Error('offline.worker-mismatch'));
}else{
setTimeout(inspect,100);
}
};
inspect();
});
await new Promise((resolve,reject)=>{
const channel=createChannel();
const finish=(error)=>{
clearTimeout(timer);
channel.port1.close();
channel.port2.close();
if(error)reject(error);
else resolve();
};
const timer=setTimeout(()=>finish(new Error('offline.cache-unconfirmed')),timeout);
channel.port1.onmessage=({data})=>{
finish(data?.ready===true&&data.version===version?null
:new Error('offline.cache-incomplete'));
};
try{
worker.postMessage({type:'abox-offline-ready',version},[channel.port2]);
}catch(error){finish(error);}
});
}
async function registerServiceWorker(){
const status=document.getElementById('offline-status');
const dot=document.getElementById('offline-dot');
if(!status||!dot)return;
const fail=(message,detail)=>{
status.textContent=message;
status.className='';
dot.className='live-dot';
if(detail){
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
const version=document.documentElement.dataset.offlineVersion;
const url=new URL(`sw.js?v=${version}`,location.href).href;
await prepareOffline(navigator.serviceWorker,url,version);
status.textContent=phrase('offline.ready');
status.className='good';
dot.className='live-dot good';
}catch(error){
fail(phrase('offline.failed'),error.message);
}
}
if(typeof document!=='undefined'){
monitorNetwork();
registerServiceWorker();
}
