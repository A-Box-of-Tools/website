/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/fr/couper-une-video/:';
const CACHE_NAME=CACHE_PREFIX+'f5b023c4c8';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=2e5ff5fd1a',
'manifest.json',
'src/shared/phrases.js?v=2edd1cacc6',
'src/shared/trust.js?v=2edd1cacc6',
'src/shared/file-picker.js?v=2edd1cacc6',
'src/shared/codec-support.js?v=2edd1cacc6',
'src/shared/mp4-reader.js?v=2edd1cacc6',
'src/shared/mp4-writer.js?v=2edd1cacc6',
'src/shared/video-support.js?v=2edd1cacc6',
'src/shared/message-box.js?v=2edd1cacc6',
'src/shared/media.js?v=2edd1cacc6',
'src/shared/format.js?v=2edd1cacc6',
'src/shared/errors.js?v=2edd1cacc6',
'src/shared/webcodecs.js?v=2edd1cacc6',
'src/shared/mp4-boxes.js?v=2edd1cacc6',
'src/shared/segments.js?v=2edd1cacc6',
'src/shared/timeline.js?v=2edd1cacc6',
'src/shared/aac.js?v=2edd1cacc6',
'src/shared/example-photo.js?v=2edd1cacc6',
'src/shared/example-audio.js?v=2edd1cacc6',
'src/shared/example-video.js?v=2edd1cacc6',
'src/shared/example-video-sound.js?v=2edd1cacc6',
'src/shared/mp4-muxer.js?v=2edd1cacc6',
'src/shared/wav.js?v=2edd1cacc6',
'src/audio.js?v=2edd1cacc6',
'src/clips.js?v=2edd1cacc6',
'src/copy.js?v=2edd1cacc6',
'src/draw.js?v=2edd1cacc6',
'src/example.js?v=2edd1cacc6',
'src/main.js?v=2edd1cacc6',
'src/ranges.js?v=2edd1cacc6',
'src/record.js?v=2edd1cacc6',
'src/segments.js?v=2edd1cacc6',
'src/timeline.js?v=2edd1cacc6',
'src/transcode.js?v=2edd1cacc6',
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
