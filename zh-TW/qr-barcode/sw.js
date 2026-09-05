/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/zh-TW/qr-barcode/:';
const CACHE_NAME=CACHE_PREFIX+'82294f97df';
const ASSETS=[
'./',
'index.html',
'styles.css?v=19918df642',
'manifest.json',
'src/shared/phrases.js?v=b5506e299a',
'src/shared/trust.js?v=b5506e299a',
'src/shared/qr-tables.js?v=b5506e299a',
'src/shared/download.js?v=b5506e299a',
'src/barcode.js?v=b5506e299a',
'src/code128.js?v=b5506e299a',
'src/gf256.js?v=b5506e299a',
'src/main.js?v=b5506e299a',
'src/payload.js?v=b5506e299a',
'src/qr-encode.js?v=b5506e299a',
'src/qr.js?v=b5506e299a',
'src/render.js?v=b5506e299a',
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
