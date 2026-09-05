/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/hi/gif-maker/:';
const CACHE_NAME=CACHE_PREFIX+'11f7c39105';
const ASSETS=[
'./',
'index.html',
'styles.css?v=6fe2389ef7',
'manifest.json',
'src/shared/phrases.js?v=935edb04f5',
'src/shared/trust.js?v=935edb04f5',
'src/shared/file-picker.js?v=935edb04f5',
'src/shared/message-box.js?v=935edb04f5',
'src/shared/format.js?v=935edb04f5',
'src/shared/errors.js?v=935edb04f5',
'src/shared/image-list.js?v=935edb04f5',
'src/bytes.js?v=935edb04f5',
'src/compose.js?v=935edb04f5',
'src/encode.js?v=935edb04f5',
'src/gif.js?v=935edb04f5',
'src/images.js?v=935edb04f5',
'src/lzw.js?v=935edb04f5',
'src/main.js?v=935edb04f5',
'src/quantize.js?v=935edb04f5',
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
