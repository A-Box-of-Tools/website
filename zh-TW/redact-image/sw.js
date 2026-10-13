/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/zh-TW/redact-image/:';
const CACHE_NAME=CACHE_PREFIX+'23bb1e6382';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=0c30ec9fc3',
'manifest.json',
'src/shared/phrases.js?v=e473d2dd09',
'src/shared/trust.js?v=e473d2dd09',
'src/shared/file-picker.js?v=e473d2dd09',
'src/shared/message-box.js?v=e473d2dd09',
'src/shared/example-document.js?v=e473d2dd09',
'src/shared/example-statement.js?v=e473d2dd09',
'src/shared/example-photo.js?v=e473d2dd09',
'src/example.js?v=e473d2dd09',
'src/files.js?v=e473d2dd09',
'src/main.js?v=e473d2dd09',
'src/preview.js?v=e473d2dd09',
'src/redact.js?v=e473d2dd09',
'src/regions.js?v=e473d2dd09',
'src/stage.js?v=e473d2dd09',
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
