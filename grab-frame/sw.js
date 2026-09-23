/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/grab-frame/:';
const CACHE_NAME=CACHE_PREFIX+'4497f86a24';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=22e0521810',
'manifest.json',
'src/shared/phrases.js?v=daa2b51fcb',
'src/shared/trust.js?v=daa2b51fcb',
'src/shared/file-picker.js?v=daa2b51fcb',
'src/shared/zip.js?v=daa2b51fcb',
'src/shared/crc32.js?v=daa2b51fcb',
'src/shared/mp4-reader.js?v=daa2b51fcb',
'src/shared/message-box.js?v=daa2b51fcb',
'src/shared/download.js?v=daa2b51fcb',
'src/shared/media.js?v=daa2b51fcb',
'src/shared/format.js?v=daa2b51fcb',
'src/shared/webcodecs.js?v=daa2b51fcb',
'src/shared/errors.js?v=daa2b51fcb',
'src/shared/example-photo.js?v=daa2b51fcb',
'src/shared/example-video.js?v=daa2b51fcb',
'src/shared/video-support.js?v=daa2b51fcb',
'src/shared/mp4-muxer.js?v=daa2b51fcb',
'src/shared/codec-support.js?v=daa2b51fcb',
'src/shared/mp4-boxes.js?v=daa2b51fcb',
'src/draw.js?v=daa2b51fcb',
'src/example.js?v=daa2b51fcb',
'src/frames.js?v=daa2b51fcb',
'src/main.js?v=daa2b51fcb',
'src/still.js?v=daa2b51fcb',
'src/support.js?v=daa2b51fcb',
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
