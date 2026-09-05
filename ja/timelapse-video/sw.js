/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/ja/timelapse-video/:';
const CACHE_NAME=CACHE_PREFIX+'73de4bd9c1';
const ASSETS=[
'./',
'index.html',
'styles.css?v=fc706778c4',
'manifest.json',
'src/shared/phrases.js?v=afd42a1152',
'src/shared/trust.js?v=afd42a1152',
'src/shared/file-picker.js?v=afd42a1152',
'src/shared/codec-support.js?v=afd42a1152',
'src/shared/mp4-reader.js?v=afd42a1152',
'src/shared/mp4-muxer.js?v=afd42a1152',
'src/shared/video-support.js?v=afd42a1152',
'src/shared/message-box.js?v=afd42a1152',
'src/shared/media.js?v=afd42a1152',
'src/shared/format.js?v=afd42a1152',
'src/shared/webcodecs.js?v=afd42a1152',
'src/shared/errors.js?v=afd42a1152',
'src/shared/mp4-boxes.js?v=afd42a1152',
'src/shared/frame-canvas.js?v=afd42a1152',
'src/decode.js?v=afd42a1152',
'src/encode.js?v=afd42a1152',
'src/main.js?v=afd42a1152',
'src/plan.js?v=afd42a1152',
'src/playback.js?v=afd42a1152',
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
