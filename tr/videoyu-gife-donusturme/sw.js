/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/tr/videoyu-gife-donusturme/:';
const CACHE_NAME=CACHE_PREFIX+'53b60d6d4e';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=93274d519f',
'manifest.json',
'src/shared/phrases.js?v=9cc033f2b0',
'src/shared/trust.js?v=9cc033f2b0',
'src/shared/file-picker.js?v=9cc033f2b0',
'src/shared/mp4-reader.js?v=9cc033f2b0',
'src/shared/message-box.js?v=9cc033f2b0',
'src/shared/media.js?v=9cc033f2b0',
'src/shared/format.js?v=9cc033f2b0',
'src/shared/webcodecs.js?v=9cc033f2b0',
'src/shared/errors.js?v=9cc033f2b0',
'src/shared/frame-canvas.js?v=9cc033f2b0',
'src/shared/example-photo.js?v=9cc033f2b0',
'src/shared/example-video.js?v=9cc033f2b0',
'src/shared/video-support.js?v=9cc033f2b0',
'src/shared/mp4-muxer.js?v=9cc033f2b0',
'src/shared/codec-support.js?v=9cc033f2b0',
'src/shared/mp4-boxes.js?v=9cc033f2b0',
'src/encode.js?v=9cc033f2b0',
'src/example.js?v=9cc033f2b0',
'src/frames.js?v=9cc033f2b0',
'src/gif.js?v=9cc033f2b0',
'src/main.js?v=9cc033f2b0',
'src/plan.js?v=9cc033f2b0',
'src/quantize.js?v=9cc033f2b0',
'src/range.js?v=9cc033f2b0',
'src/support.js?v=9cc033f2b0',
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
