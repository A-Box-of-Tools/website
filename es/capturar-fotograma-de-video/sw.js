/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/es/capturar-fotograma-de-video/:';
const CACHE_NAME=CACHE_PREFIX+'b6746547fb';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=22e0521810',
'manifest.json',
'src/shared/phrases.js?v=fafbfb9d3b',
'src/shared/trust.js?v=fafbfb9d3b',
'src/shared/file-picker.js?v=fafbfb9d3b',
'src/shared/zip.js?v=fafbfb9d3b',
'src/shared/crc32.js?v=fafbfb9d3b',
'src/shared/mp4-reader.js?v=fafbfb9d3b',
'src/shared/message-box.js?v=fafbfb9d3b',
'src/shared/download.js?v=fafbfb9d3b',
'src/shared/media.js?v=fafbfb9d3b',
'src/shared/format.js?v=fafbfb9d3b',
'src/shared/webcodecs.js?v=fafbfb9d3b',
'src/shared/errors.js?v=fafbfb9d3b',
'src/shared/example-photo.js?v=fafbfb9d3b',
'src/shared/example-video.js?v=fafbfb9d3b',
'src/shared/video-support.js?v=fafbfb9d3b',
'src/shared/mp4-muxer.js?v=fafbfb9d3b',
'src/shared/codec-support.js?v=fafbfb9d3b',
'src/shared/mp4-boxes.js?v=fafbfb9d3b',
'src/draw.js?v=fafbfb9d3b',
'src/example.js?v=fafbfb9d3b',
'src/frames.js?v=fafbfb9d3b',
'src/main.js?v=fafbfb9d3b',
'src/still.js?v=fafbfb9d3b',
'src/support.js?v=fafbfb9d3b',
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
