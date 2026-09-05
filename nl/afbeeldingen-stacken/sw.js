/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/nl/afbeeldingen-stacken/:';
const CACHE_NAME=CACHE_PREFIX+'c19653483f';
const ASSETS=[
'./',
'index.html',
'styles.css?v=006c29eb58',
'manifest.json',
'src/shared/phrases.js?v=6592a180a2',
'src/shared/trust.js?v=6592a180a2',
'src/shared/file-picker.js?v=6592a180a2',
'src/shared/message-box.js?v=6592a180a2',
'src/align.js?v=6592a180a2',
'src/fft.js?v=6592a180a2',
'src/main.js?v=6592a180a2',
'src/pipeline.js?v=6592a180a2',
'src/plan.js?v=6592a180a2',
'src/raw.js?v=6592a180a2',
'src/stack.js?v=6592a180a2',
'src/worker.js?v=6592a180a2',
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
