/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/id/pas-foto-biometrik/:';
const CACHE_NAME=CACHE_PREFIX+'58054097dc';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=a8a499d4f3',
'manifest.json',
'src/shared/phrases.js?v=b1f87d6c0c',
'src/shared/trust.js?v=b1f87d6c0c',
'src/shared/file-picker.js?v=b1f87d6c0c',
'src/shared/message-box.js?v=b1f87d6c0c',
'src/background.js?v=b1f87d6c0c',
'src/cropper.js?v=b1f87d6c0c',
'src/detect.js?v=b1f87d6c0c',
'src/encode.js?v=b1f87d6c0c',
'src/example.js?v=b1f87d6c0c',
'src/files.js?v=b1f87d6c0c',
'src/geometry.js?v=b1f87d6c0c',
'src/jpeg.js?v=b1f87d6c0c',
'src/main.js?v=b1f87d6c0c',
'src/marks.js?v=b1f87d6c0c',
'src/sheet.js?v=b1f87d6c0c',
'src/specs.js?v=b1f87d6c0c',
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
