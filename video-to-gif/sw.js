/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/video-to-gif/:';
const CACHE_NAME=CACHE_PREFIX+'ff93e6aaa4';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=93274d519f',
'manifest.json',
'src/shared/phrases.js?v=1375624944',
'src/shared/trust.js?v=1375624944',
'src/shared/file-picker.js?v=1375624944',
'src/shared/mp4-reader.js?v=1375624944',
'src/shared/message-box.js?v=1375624944',
'src/shared/media.js?v=1375624944',
'src/shared/format.js?v=1375624944',
'src/shared/webcodecs.js?v=1375624944',
'src/shared/errors.js?v=1375624944',
'src/shared/frame-canvas.js?v=1375624944',
'src/shared/example-photo.js?v=1375624944',
'src/shared/example-video.js?v=1375624944',
'src/shared/video-support.js?v=1375624944',
'src/shared/mp4-muxer.js?v=1375624944',
'src/shared/codec-support.js?v=1375624944',
'src/shared/mp4-boxes.js?v=1375624944',
'src/encode.js?v=1375624944',
'src/example.js?v=1375624944',
'src/frames.js?v=1375624944',
'src/gif.js?v=1375624944',
'src/main.js?v=1375624944',
'src/plan.js?v=1375624944',
'src/quantize.js?v=1375624944',
'src/range.js?v=1375624944',
'src/support.js?v=1375624944',
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
