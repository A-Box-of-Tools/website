/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/de/gif-analysieren/:';
const CACHE_NAME=CACHE_PREFIX+'fa01daa825';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=7247bb6285',
'manifest.json',
'src/shared/phrases.js?v=ea81adbdb0',
'src/shared/trust.js?v=ea81adbdb0',
'src/shared/file-picker.js?v=ea81adbdb0',
'src/shared/message-box.js?v=ea81adbdb0',
'src/shared/example-gif.js?v=ea81adbdb0',
'src/shared/example-photo.js?v=ea81adbdb0',
'src/budget.js?v=ea81adbdb0',
'src/example.js?v=ea81adbdb0',
'src/findings.js?v=ea81adbdb0',
'src/format.js?v=ea81adbdb0',
'src/frames.js?v=ea81adbdb0',
'src/gif.js?v=ea81adbdb0',
'src/lzw.js?v=ea81adbdb0',
'src/main.js?v=ea81adbdb0',
'src/reader.js?v=ea81adbdb0',
'src/report.js?v=ea81adbdb0',
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
