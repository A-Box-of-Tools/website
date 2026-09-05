/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/es/escanear-documentos/:';
const CACHE_NAME=CACHE_PREFIX+'928753e18f';
const ASSETS=[
'./',
'index.html',
'styles.css?v=8dd61f6cdb',
'manifest.json',
'src/shared/phrases.js?v=a0bba120a7',
'src/shared/trust.js?v=a0bba120a7',
'src/shared/file-picker.js?v=a0bba120a7',
'src/shared/zip.js?v=a0bba120a7',
'src/shared/crc32.js?v=a0bba120a7',
'src/shared/pdf-page-writer.js?v=a0bba120a7',
'src/shared/message-box.js?v=a0bba120a7',
'src/clean.js?v=a0bba120a7',
'src/detect.js?v=a0bba120a7',
'src/document.js?v=a0bba120a7',
'src/encode.js?v=a0bba120a7',
'src/geometry.js?v=a0bba120a7',
'src/main.js?v=a0bba120a7',
'src/pages.js?v=a0bba120a7',
'src/stage.js?v=a0bba120a7',
'src/warp.js?v=a0bba120a7',
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
