/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/pt/imagens-para-pdf/:';
const CACHE_NAME=CACHE_PREFIX+'155404f0e7';
const ASSETS=[
'./',
'index.html',
'styles.css?v=2868631a12',
'manifest.json',
'src/shared/phrases.js',
'src/shared/trust.js',
'src/shared/file-picker.js',
'src/shared/pdf-page-writer.js',
'src/shared/message-box.js',
'src/shared/format.js',
'src/document.js',
'src/encode.js',
'src/images.js',
'src/jpeg.js',
'src/layout.js',
'src/main.js',
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
