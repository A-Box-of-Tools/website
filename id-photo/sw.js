/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/id-photo/:';
const CACHE_NAME=CACHE_PREFIX+'2da4a4acc8';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=105f699db2',
'manifest.json',
'src/shared/phrases.js?v=f42854845d',
'src/shared/trust.js?v=f42854845d',
'src/shared/file-picker.js?v=f42854845d',
'src/shared/message-box.js?v=f42854845d',
'src/background.js?v=f42854845d',
'src/cropper.js?v=f42854845d',
'src/detect.js?v=f42854845d',
'src/encode.js?v=f42854845d',
'src/example.js?v=f42854845d',
'src/files.js?v=f42854845d',
'src/geometry.js?v=f42854845d',
'src/jpeg.js?v=f42854845d',
'src/main.js?v=f42854845d',
'src/marks.js?v=f42854845d',
'src/requirements.js?v=f42854845d',
'src/sheet.js?v=f42854845d',
'src/specs.js?v=f42854845d',
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
