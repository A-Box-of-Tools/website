/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/ar/تحويل-صورة-إلى-svg/:';
const CACHE_NAME=CACHE_PREFIX+'af99aca5a2';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=6c43533c04',
'manifest.json',
'src/shared/phrases.js?v=d4ae513c3e',
'src/shared/trust.js?v=d4ae513c3e',
'src/shared/file-picker.js?v=d4ae513c3e',
'src/shared/download.js?v=d4ae513c3e',
'src/shared/example-mark.js?v=d4ae513c3e',
'src/shared/example-photo.js?v=d4ae513c3e',
'src/contour.js?v=d4ae513c3e',
'src/example.js?v=d4ae513c3e',
'src/fit.js?v=d4ae513c3e',
'src/main.js?v=d4ae513c3e',
'src/mask.js?v=d4ae513c3e',
'src/regions.js?v=d4ae513c3e',
'src/subject.js?v=d4ae513c3e',
'src/trace.js?v=d4ae513c3e',
'src/view.js?v=d4ae513c3e',
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
