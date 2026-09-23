/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/webp-to-jpg/:';
const CACHE_NAME=CACHE_PREFIX+'9f134928a2';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=2fa74bd14f',
'manifest.json',
'src/shared/phrases.js?v=52f3890924',
'src/shared/trust.js?v=52f3890924',
'src/shared/file-picker.js?v=52f3890924',
'src/shared/image-convert.js?v=52f3890924',
'src/shared/zip.js?v=52f3890924',
'src/shared/crc32.js?v=52f3890924',
'src/shared/message-box.js?v=52f3890924',
'src/shared/download.js?v=52f3890924',
'src/shared/format.js?v=52f3890924',
'src/shared/example-photo.js?v=52f3890924',
'src/shared/example-mark.js?v=52f3890924',
'src/example.js?v=52f3890924',
'src/main.js?v=52f3890924',
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
