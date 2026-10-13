/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/it/heic-in-jpg/:';
const CACHE_NAME=CACHE_PREFIX+'7d3d55a6a1';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=298f6eeffa',
'manifest.json',
'src/shared/phrases.js?v=8efc58ba61',
'src/shared/trust.js?v=8efc58ba61',
'src/shared/file-picker.js?v=8efc58ba61',
'src/shared/zip.js?v=8efc58ba61',
'src/shared/crc32.js?v=8efc58ba61',
'src/shared/message-box.js?v=8efc58ba61',
'src/shared/download.js?v=8efc58ba61',
'src/shared/format.js?v=8efc58ba61',
'src/shared/errors.js?v=8efc58ba61',
'src/boxes.js?v=8efc58ba61',
'src/codecs.js?v=8efc58ba61',
'src/example.js?v=8efc58ba61',
'src/exif.js?v=8efc58ba61',
'src/files.js?v=8efc58ba61',
'src/heif.js?v=8efc58ba61',
'src/main.js?v=8efc58ba61',
'vendor/LICENSE',
'vendor/libheif.js',
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
