/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./phrases.js?v=48fbbf8377';
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
async function registerServiceWorker(){
const status=document.getElementById('offline-status');
const dot=document.getElementById('offline-dot');
if(!status||!dot)return;
const fail=(message,detail)=>{
status.textContent=message;
dot.className='live-dot';
if(detail){
status.title=detail;
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
await navigator.serviceWorker.register('sw.js');
await navigator.serviceWorker.ready;
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
