/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/ko/문서-스캔/:';
const CACHE_NAME=CACHE_PREFIX+'26803ac5c8';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=a5181d1d5d',
'manifest.json',
'src/shared/phrases.js?v=ad2e466ee1',
'src/shared/trust.js?v=ad2e466ee1',
'src/shared/file-picker.js?v=ad2e466ee1',
'src/shared/zip.js?v=ad2e466ee1',
'src/shared/crc32.js?v=ad2e466ee1',
'src/shared/pdf-page-writer.js?v=ad2e466ee1',
'src/shared/message-box.js?v=ad2e466ee1',
'src/shared/example-document.js?v=ad2e466ee1',
'src/shared/example-statement.js?v=ad2e466ee1',
'src/shared/example-photo.js?v=ad2e466ee1',
'src/clean.js?v=ad2e466ee1',
'src/detect.js?v=ad2e466ee1',
'src/document.js?v=ad2e466ee1',
'src/encode.js?v=ad2e466ee1',
'src/example.js?v=ad2e466ee1',
'src/geometry.js?v=ad2e466ee1',
'src/main.js?v=ad2e466ee1',
'src/pages.js?v=ad2e466ee1',
'src/stage.js?v=ad2e466ee1',
'src/warp.js?v=ad2e466ee1',
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
