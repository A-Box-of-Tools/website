/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/timelapse-video/:';
const CACHE_NAME=CACHE_PREFIX+'6db1e2c485';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=7c9b219f6b',
'manifest.json',
'src/shared/phrases.js?v=4d581c9838',
'src/shared/trust.js?v=4d581c9838',
'src/shared/file-picker.js?v=4d581c9838',
'src/shared/codec-support.js?v=4d581c9838',
'src/shared/mp4-reader.js?v=4d581c9838',
'src/shared/mp4-muxer.js?v=4d581c9838',
'src/shared/video-support.js?v=4d581c9838',
'src/shared/message-box.js?v=4d581c9838',
'src/shared/media.js?v=4d581c9838',
'src/shared/format.js?v=4d581c9838',
'src/shared/webcodecs.js?v=4d581c9838',
'src/shared/errors.js?v=4d581c9838',
'src/shared/mp4-boxes.js?v=4d581c9838',
'src/shared/frame-canvas.js?v=4d581c9838',
'src/shared/example-photo.js?v=4d581c9838',
'src/shared/example-video.js?v=4d581c9838',
'src/decode.js?v=4d581c9838',
'src/encode.js?v=4d581c9838',
'src/example.js?v=4d581c9838',
'src/main.js?v=4d581c9838',
'src/plan.js?v=4d581c9838',
'src/playback.js?v=4d581c9838',
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
