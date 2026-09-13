/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/zh/crop-video/:';
const CACHE_NAME=CACHE_PREFIX+'45f7f9b550';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=da43f3e0d6',
'manifest.json',
'src/shared/phrases.js?v=f058e885be',
'src/shared/trust.js?v=f058e885be',
'src/shared/file-picker.js?v=f058e885be',
'src/shared/codec-support.js?v=f058e885be',
'src/shared/mp4-reader.js?v=f058e885be',
'src/shared/video-support.js?v=f058e885be',
'src/shared/message-box.js?v=f058e885be',
'src/shared/media.js?v=f058e885be',
'src/shared/format.js?v=f058e885be',
'src/shared/webcodecs.js?v=f058e885be',
'src/shared/errors.js?v=f058e885be',
'src/shared/mp4-boxes.js?v=f058e885be',
'src/shared/cropper.js?v=f058e885be',
'src/shared/example-photo.js?v=f058e885be',
'src/shared/example-video.js?v=f058e885be',
'src/shared/mp4-muxer.js?v=f058e885be',
'src/draw.js?v=f058e885be',
'src/example.js?v=f058e885be',
'src/main.js?v=f058e885be',
'src/mp4.js?v=f058e885be',
'src/record.js?v=f058e885be',
'src/transcode.js?v=f058e885be',
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
