/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/tr/videoyu-ters-oynatma/:';
const CACHE_NAME=CACHE_PREFIX+'e6590eb6de';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=7eaa669895',
'manifest.json',
'src/shared/phrases.js?v=66e991985e',
'src/shared/trust.js?v=66e991985e',
'src/shared/file-picker.js?v=66e991985e',
'src/shared/codec-support.js?v=66e991985e',
'src/shared/mp4-reader.js?v=66e991985e',
'src/shared/mp4-writer.js?v=66e991985e',
'src/shared/video-support.js?v=66e991985e',
'src/shared/message-box.js?v=66e991985e',
'src/shared/media.js?v=66e991985e',
'src/shared/format.js?v=66e991985e',
'src/shared/webcodecs.js?v=66e991985e',
'src/shared/errors.js?v=66e991985e',
'src/shared/mp4-boxes.js?v=66e991985e',
'src/shared/aac.js?v=66e991985e',
'src/shared/example-photo.js?v=66e991985e',
'src/shared/example-audio.js?v=66e991985e',
'src/shared/example-video.js?v=66e991985e',
'src/shared/example-video-sound.js?v=66e991985e',
'src/shared/mp4-muxer.js?v=66e991985e',
'src/shared/wav.js?v=66e991985e',
'src/audio.js?v=66e991985e',
'src/draw.js?v=66e991985e',
'src/example.js?v=66e991985e',
'src/main.js?v=66e991985e',
'src/playback.js?v=66e991985e',
'src/reverse.js?v=66e991985e',
'src/timeline.js?v=66e991985e',
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
