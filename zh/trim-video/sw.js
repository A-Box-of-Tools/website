/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/zh/trim-video/:';
const CACHE_NAME=CACHE_PREFIX+'b1ab8f388b';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=2e5ff5fd1a',
'manifest.json',
'src/shared/phrases.js?v=c9b2d0b22a',
'src/shared/trust.js?v=c9b2d0b22a',
'src/shared/file-picker.js?v=c9b2d0b22a',
'src/shared/codec-support.js?v=c9b2d0b22a',
'src/shared/mp4-reader.js?v=c9b2d0b22a',
'src/shared/mp4-writer.js?v=c9b2d0b22a',
'src/shared/video-support.js?v=c9b2d0b22a',
'src/shared/message-box.js?v=c9b2d0b22a',
'src/shared/media.js?v=c9b2d0b22a',
'src/shared/format.js?v=c9b2d0b22a',
'src/shared/errors.js?v=c9b2d0b22a',
'src/shared/webcodecs.js?v=c9b2d0b22a',
'src/shared/mp4-boxes.js?v=c9b2d0b22a',
'src/shared/segments.js?v=c9b2d0b22a',
'src/shared/timeline.js?v=c9b2d0b22a',
'src/shared/aac.js?v=c9b2d0b22a',
'src/shared/example-photo.js?v=c9b2d0b22a',
'src/shared/example-audio.js?v=c9b2d0b22a',
'src/shared/example-video.js?v=c9b2d0b22a',
'src/shared/example-video-sound.js?v=c9b2d0b22a',
'src/shared/mp4-muxer.js?v=c9b2d0b22a',
'src/shared/wav.js?v=c9b2d0b22a',
'src/audio.js?v=c9b2d0b22a',
'src/clips.js?v=c9b2d0b22a',
'src/copy.js?v=c9b2d0b22a',
'src/draw.js?v=c9b2d0b22a',
'src/example.js?v=c9b2d0b22a',
'src/main.js?v=c9b2d0b22a',
'src/ranges.js?v=c9b2d0b22a',
'src/record.js?v=c9b2d0b22a',
'src/segments.js?v=c9b2d0b22a',
'src/timeline.js?v=c9b2d0b22a',
'src/transcode.js?v=c9b2d0b22a',
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
