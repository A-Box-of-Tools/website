/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/es/imagenes-a-pdf/:';
const CACHE_NAME=CACHE_PREFIX+'3a454a7511';
const ASSETS=[
'./',
'index.html',
'styles.css?v=4e72356d3b',
'manifest.json',
'src/shared/phrases.js?v=3e8b71192e',
'src/shared/trust.js?v=3e8b71192e',
'src/shared/file-picker.js?v=3e8b71192e',
'src/shared/pdf-page-writer.js?v=3e8b71192e',
'src/shared/message-box.js?v=3e8b71192e',
'src/shared/format.js?v=3e8b71192e',
'src/document.js?v=3e8b71192e',
'src/encode.js?v=3e8b71192e',
'src/images.js?v=3e8b71192e',
'src/jpeg.js?v=3e8b71192e',
'src/layout.js?v=3e8b71192e',
'src/main.js?v=3e8b71192e',
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
