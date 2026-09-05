/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/ko/exif-정보-삭제/:';
const CACHE_NAME=CACHE_PREFIX+'4aadbcdcb1';
const ASSETS=[
'./',
'index.html',
'styles.css?v=3dc5b88140',
'manifest.json',
'src/shared/phrases.js?v=8f41c9007e',
'src/shared/trust.js?v=8f41c9007e',
'src/shared/file-picker.js?v=8f41c9007e',
'src/shared/zip.js?v=8f41c9007e',
'src/shared/crc32.js?v=8f41c9007e',
'src/shared/message-box.js?v=8f41c9007e',
'src/shared/download.js?v=8f41c9007e',
'src/shared/media.js?v=8f41c9007e',
'src/container.js?v=8f41c9007e',
'src/jpeg.js?v=8f41c9007e',
'src/main.js?v=8f41c9007e',
'src/png.js?v=8f41c9007e',
'src/report.js?v=8f41c9007e',
'src/tags.js?v=8f41c9007e',
'src/tiff.js?v=8f41c9007e',
'src/webp.js?v=8f41c9007e',
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
