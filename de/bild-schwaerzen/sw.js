/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/de/bild-schwaerzen/:';
const CACHE_NAME=CACHE_PREFIX+'7c1e20e86d';
const ASSETS=[
'./',
'index.html',
'styles.css?v=3278deebe7',
'manifest.json',
'src/shared/phrases.js?v=c44e3bded9',
'src/shared/trust.js?v=c44e3bded9',
'src/shared/file-picker.js?v=c44e3bded9',
'src/shared/message-box.js?v=c44e3bded9',
'src/files.js?v=c44e3bded9',
'src/main.js?v=c44e3bded9',
'src/preview.js?v=c44e3bded9',
'src/redact.js?v=c44e3bded9',
'src/regions.js?v=c44e3bded9',
'src/stage.js?v=c44e3bded9',
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
