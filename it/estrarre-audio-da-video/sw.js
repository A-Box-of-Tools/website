/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/it/estrarre-audio-da-video/:';
const CACHE_NAME=CACHE_PREFIX+'8dae4253d9';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=f6aadbd855',
'manifest.json',
'src/shared/phrases.js?v=33844639a4',
'src/shared/trust.js?v=33844639a4',
'src/shared/file-picker.js?v=33844639a4',
'src/shared/audio-decode.js?v=33844639a4',
'src/shared/samplerate.js?v=33844639a4',
'src/shared/wav.js?v=33844639a4',
'src/shared/message-box.js?v=33844639a4',
'src/shared/format.js?v=33844639a4',
'src/shared/example-photo.js?v=33844639a4',
'src/shared/example-audio.js?v=33844639a4',
'src/shared/example-video.js?v=33844639a4',
'src/shared/example-video-sound.js?v=33844639a4',
'src/shared/video-support.js?v=33844639a4',
'src/shared/codec-support.js?v=33844639a4',
'src/shared/mp4-muxer.js?v=33844639a4',
'src/shared/mp4-boxes.js?v=33844639a4',
'src/shared/mp4-writer.js?v=33844639a4',
'src/shared/aac.js?v=33844639a4',
'src/example.js?v=33844639a4',
'src/main.js?v=33844639a4',
'src/mono.js?v=33844639a4',
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
