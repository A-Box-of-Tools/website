/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/pt/extrair-audio-de-video/:';
const CACHE_VERSION='ec0eedffdb';
const CACHE_NAME=CACHE_PREFIX+CACHE_VERSION;
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=f6aadbd855',
'manifest.json',
'src/shared/phrases.js?v=45ed4394f0',
'src/shared/trust.js?v=45ed4394f0',
'src/shared/file-picker.js?v=45ed4394f0',
'src/shared/audio-decode.js?v=45ed4394f0',
'src/shared/samplerate.js?v=45ed4394f0',
'src/shared/wav.js?v=45ed4394f0',
'src/shared/wav-async.js?v=45ed4394f0',
'src/shared/cooperative-work.js?v=45ed4394f0',
'src/shared/errors.js?v=45ed4394f0',
'src/shared/message-box.js?v=45ed4394f0',
'src/shared/format.js?v=45ed4394f0',
'src/shared/example-photo.js?v=45ed4394f0',
'src/shared/example-audio.js?v=45ed4394f0',
'src/shared/example-video.js?v=45ed4394f0',
'src/shared/example-video-sound.js?v=45ed4394f0',
'src/shared/video-support.js?v=45ed4394f0',
'src/shared/codec-support.js?v=45ed4394f0',
'src/shared/mp4-muxer.js?v=45ed4394f0',
'src/shared/mp4-boxes.js?v=45ed4394f0',
'src/shared/mp4-writer.js?v=45ed4394f0',
'src/shared/aac.js?v=45ed4394f0',
'src/example.js?v=45ed4394f0',
'src/main.js?v=45ed4394f0',
'src/mono.js?v=45ed4394f0',
'analytics.js',
];
function pageVersion(text){
return/\bdata-offline-version=["']([0-9a-f]{10})["']/.exec(text)?.[1];
}
async function completeCache(cache){
const saved=await Promise.all(ASSETS.map((asset)=>cache.match(asset)));
if(saved.some((response)=>!response?.ok))return false;
const pages=await Promise.all([saved[0].clone().text(),saved[1].clone().text()]);
return pages.every((text)=>pageVersion(text)===CACHE_VERSION);
}
self.addEventListener('install',(event)=>{
event.waitUntil((async()=>{
const cache=await caches.open(CACHE_NAME);
await cache.addAll(ASSETS.map((asset)=>(
new Request(new URL(asset,self.location.href),{cache:'reload'})
)));
if(!await completeCache(cache)){
throw new Error('The offline page and worker belong to different builds.');
}
await self.skipWaiting();
})());
});
self.addEventListener('message',(event)=>{
if(event.data?.type!=='abox-offline-ready'||!event.ports?.[0])return;
event.waitUntil((async()=>{
let ready=false;
try{
ready=event.data.version===CACHE_VERSION
&&await completeCache(await caches.open(CACHE_NAME));
}catch{}
event.ports[0].postMessage({version:CACHE_VERSION,ready});
})());
});
self.addEventListener('activate',(event)=>{
const ours=(name)=>name.startsWith(CACHE_PREFIX);
const orphaned=(name)=>!name.startsWith('abox:');
event.waitUntil(
caches.keys()
.then((names)=>Promise.all(
names.filter((name)=>name!==CACHE_NAME&&(ours(name)||orphaned(name)))
.map((name)=>caches.delete(name)),
))
.then(()=>self.clients.claim()),
);
});
self.addEventListener('fetch',(event)=>{
const{request}=event;
if(request.method!=='GET')return;
const url=new URL(request.url);
if(url.origin!==self.location.origin)return;
const immutable=request.mode!=='navigate'
&&/^[0-9a-f]{10}$/.test(url.searchParams.get('v')||'');
const cached=(key)=>caches.match(key,{cacheName:CACHE_NAME})
.catch(()=>undefined);
event.respondWith((async()=>{
if(immutable){
const hit=await cached(request);
if(hit)return hit;
}
try{
const response=await fetch(request,{
cache:immutable?'default':'no-cache',
});
if(response.ok&&response.type==='basic'){
const copy=response.clone();
event.waitUntil((async()=>{
if(request.mode==='navigate'){
const version=pageVersion(await copy.clone().text());
const shell=url.pathname===new URL('./',self.location.href).pathname
||url.pathname===new URL('index.html',self.location.href).pathname;
if((shell||version)&&version!==CACHE_VERSION)return;
}
await(await caches.open(CACHE_NAME)).put(request,copy);
})().catch(()=>{}));
}
return response;
}catch(error){
const hit=await cached(request);
if(hit)return hit;
if(request.mode==='navigate'){
const shell=await cached('index.html');
if(shell)return shell;
}
throw error;
}
})());
});
