/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/de/in-mp4-umwandeln/:';
const CACHE_NAME=CACHE_PREFIX+'9e86079234';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=ac1df9da2d',
'manifest.json',
'src/shared/phrases.js?v=dbc6801bc3',
'src/shared/trust.js?v=dbc6801bc3',
'src/shared/file-picker.js?v=dbc6801bc3',
'src/shared/mp4-reader.js?v=dbc6801bc3',
'src/shared/mkv-reader.js?v=dbc6801bc3',
'src/shared/mp4-writer.js?v=dbc6801bc3',
'src/shared/mp4-boxes.js?v=dbc6801bc3',
'src/shared/aac.js?v=dbc6801bc3',
'src/shared/copy-tracks.js?v=dbc6801bc3',
'src/shared/reencode-video.js?v=dbc6801bc3',
'src/shared/reencode-sound.js?v=dbc6801bc3',
'src/shared/video-support.js?v=dbc6801bc3',
'src/shared/codec-support.js?v=dbc6801bc3',
'src/shared/webcodecs.js?v=dbc6801bc3',
'src/shared/frame-canvas.js?v=dbc6801bc3',
'src/shared/message-box.js?v=dbc6801bc3',
'src/shared/format.js?v=dbc6801bc3',
'src/shared/errors.js?v=dbc6801bc3',
'src/shared/example-photo.js?v=dbc6801bc3',
'src/shared/example-video.js?v=dbc6801bc3',
'src/shared/example-audio.js?v=dbc6801bc3',
'src/shared/mp4-muxer.js?v=dbc6801bc3',
'src/shared/wav.js?v=dbc6801bc3',
'src/shared/mkv-writer.js?v=dbc6801bc3',
'src/convert.js?v=dbc6801bc3',
'src/example.js?v=dbc6801bc3',
'src/format.js?v=dbc6801bc3',
'src/main.js?v=dbc6801bc3',
'src/plan.js?v=dbc6801bc3',
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
