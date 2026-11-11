/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/id/tumpuk-gambar/:';
const CACHE_NAME=CACHE_PREFIX+'cebc581adc';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=202692ce04',
'manifest.json',
'src/shared/phrases.js?v=a2fc99e04f',
'src/shared/trust.js?v=a2fc99e04f',
'src/shared/file-picker.js?v=a2fc99e04f',
'src/shared/message-box.js?v=a2fc99e04f',
'src/shared/example-photo.js?v=a2fc99e04f',
'src/align.js?v=a2fc99e04f',
'src/example.js?v=a2fc99e04f',
'src/fft.js?v=a2fc99e04f',
'src/main.js?v=a2fc99e04f',
'src/orient.js?v=a2fc99e04f',
'src/pipeline.js?v=a2fc99e04f',
'src/plan.js?v=a2fc99e04f',
'src/raw.js?v=a2fc99e04f',
'src/similarity.js?v=a2fc99e04f',
'src/stack.js?v=a2fc99e04f',
'src/worker.js?v=a2fc99e04f',
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
