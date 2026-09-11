/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/pt/criar-gif/:';
const CACHE_NAME=CACHE_PREFIX+'2ae8113daa';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=eb738654e9',
'manifest.json',
'src/shared/phrases.js?v=a4518e3bf8',
'src/shared/trust.js?v=a4518e3bf8',
'src/shared/file-picker.js?v=a4518e3bf8',
'src/shared/message-box.js?v=a4518e3bf8',
'src/shared/format.js?v=a4518e3bf8',
'src/shared/errors.js?v=a4518e3bf8',
'src/shared/image-list.js?v=a4518e3bf8',
'src/shared/example-photo.js?v=a4518e3bf8',
'src/bytes.js?v=a4518e3bf8',
'src/compose.js?v=a4518e3bf8',
'src/encode.js?v=a4518e3bf8',
'src/example.js?v=a4518e3bf8',
'src/gif.js?v=a4518e3bf8',
'src/images.js?v=a4518e3bf8',
'src/lzw.js?v=a4518e3bf8',
'src/main.js?v=a4518e3bf8',
'src/quantize.js?v=a4518e3bf8',
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
