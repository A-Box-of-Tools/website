/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/reverse-video/:';
const CACHE_NAME=CACHE_PREFIX+'c46f3e01e2';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=7eaa669895',
'manifest.json',
'src/shared/phrases.js?v=de1f255b15',
'src/shared/trust.js?v=de1f255b15',
'src/shared/file-picker.js?v=de1f255b15',
'src/shared/codec-support.js?v=de1f255b15',
'src/shared/mp4-reader.js?v=de1f255b15',
'src/shared/mp4-writer.js?v=de1f255b15',
'src/shared/video-support.js?v=de1f255b15',
'src/shared/message-box.js?v=de1f255b15',
'src/shared/media.js?v=de1f255b15',
'src/shared/format.js?v=de1f255b15',
'src/shared/webcodecs.js?v=de1f255b15',
'src/shared/errors.js?v=de1f255b15',
'src/shared/mp4-boxes.js?v=de1f255b15',
'src/shared/aac.js?v=de1f255b15',
'src/shared/example-photo.js?v=de1f255b15',
'src/shared/example-audio.js?v=de1f255b15',
'src/shared/example-video.js?v=de1f255b15',
'src/shared/example-video-sound.js?v=de1f255b15',
'src/shared/mp4-muxer.js?v=de1f255b15',
'src/shared/wav.js?v=de1f255b15',
'src/audio.js?v=de1f255b15',
'src/draw.js?v=de1f255b15',
'src/example.js?v=de1f255b15',
'src/main.js?v=de1f255b15',
'src/playback.js?v=de1f255b15',
'src/reverse.js?v=de1f255b15',
'src/timeline.js?v=de1f255b15',
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
