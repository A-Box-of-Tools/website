/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/ja/qr-barcode-reader/:';
const CACHE_NAME=CACHE_PREFIX+'4cfd24ca74';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=b355959f73',
'manifest.json',
'src/shared/phrases.js?v=f402d491e6',
'src/shared/trust.js?v=f402d491e6',
'src/shared/file-picker.js?v=f402d491e6',
'src/shared/qr-tables.js?v=f402d491e6',
'src/shared/gf256.js?v=f402d491e6',
'src/shared/qr-encode.js?v=f402d491e6',
'src/shared/qr.js?v=f402d491e6',
'src/binarize.js?v=f402d491e6',
'src/camera.js?v=f402d491e6',
'src/detect.js?v=f402d491e6',
'src/example.js?v=f402d491e6',
'src/linear.js?v=f402d491e6',
'src/main.js?v=f402d491e6',
'src/payload.js?v=f402d491e6',
'src/qr-decode.js?v=f402d491e6',
'src/reed-solomon.js?v=f402d491e6',
'src/scan.js?v=f402d491e6',
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
