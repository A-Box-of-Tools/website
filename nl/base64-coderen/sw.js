/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/nl/base64-coderen/:';
const CACHE_NAME=CACHE_PREFIX+'63686b6052';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=a0647a7400',
'manifest.json',
'src/shared/phrases.js?v=f36e01e121',
'src/shared/trust.js?v=f36e01e121',
'src/shared/file-picker.js?v=f36e01e121',
'src/shared/message-box.js?v=f36e01e121',
'src/shared/download.js?v=f36e01e121',
'src/shared/format.js?v=f36e01e121',
'src/encode.js?v=f36e01e121',
'src/main.js?v=f36e01e121',
'src/samples.js?v=f36e01e121',
'analytics.js',
];
self.addEventListener('install',(event)=>{
event.waitUntil(
caches.open(CACHE_NAME)
.then((cache)=>cache.addAll(ASSETS))
.then(()=>self.skipWaiting()),
);
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
if(new URL(request.url).origin!==self.location.origin)return;
event.respondWith(
caches.match(request).then((cached)=>{
if(cached)return cached;
return fetch(request).then((response)=>{
if(response.ok&&response.type==='basic'){
const copy=response.clone();
caches.open(CACHE_NAME)
.then((cache)=>cache.put(request,copy))
.catch(()=>{});
}
return response;
}).catch(()=>(
request.mode==='navigate'
?caches.match('index.html')
:Promise.reject(new Error('offline and not cached'))
));
}),
);
});
