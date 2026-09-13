/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/zh/rotate-video/:';
const CACHE_NAME=CACHE_PREFIX+'7d08e278c1';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=b7ee8f10f8',
'manifest.json',
'src/shared/phrases.js?v=fee04efe77',
'src/shared/trust.js?v=fee04efe77',
'src/shared/file-picker.js?v=fee04efe77',
'src/shared/mp4-reader.js?v=fee04efe77',
'src/shared/mkv-reader.js?v=fee04efe77',
'src/shared/mp4-writer.js?v=fee04efe77',
'src/shared/mp4-boxes.js?v=fee04efe77',
'src/shared/aac.js?v=fee04efe77',
'src/shared/copy-tracks.js?v=fee04efe77',
'src/shared/reencode-video.js?v=fee04efe77',
'src/shared/reencode-sound.js?v=fee04efe77',
'src/shared/video-support.js?v=fee04efe77',
'src/shared/codec-support.js?v=fee04efe77',
'src/shared/webcodecs.js?v=fee04efe77',
'src/shared/frame-canvas.js?v=fee04efe77',
'src/shared/message-box.js?v=fee04efe77',
'src/shared/format.js?v=fee04efe77',
'src/shared/errors.js?v=fee04efe77',
'src/shared/example-photo.js?v=fee04efe77',
'src/shared/example-video.js?v=fee04efe77',
'src/shared/example-audio.js?v=fee04efe77',
'src/shared/example-video-sound.js?v=fee04efe77',
'src/shared/mp4-muxer.js?v=fee04efe77',
'src/shared/wav.js?v=fee04efe77',
'src/example.js?v=fee04efe77',
'src/format.js?v=fee04efe77',
'src/main.js?v=fee04efe77',
'src/plan.js?v=fee04efe77',
'src/preview.js?v=fee04efe77',
'src/rotate.js?v=fee04efe77',
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
