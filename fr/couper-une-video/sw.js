/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/fr/couper-une-video/:';
const CACHE_NAME=CACHE_PREFIX+'2bcbd0900e';
const ASSETS=[
'./',
'index.html',
'styles.css?v=d552d5cc7f',
'manifest.json',
'src/shared/phrases.js',
'src/shared/trust.js',
'src/shared/file-picker.js',
'src/shared/codec-support.js',
'src/shared/mp4-reader.js',
'src/shared/mp4-writer.js',
'src/shared/video-support.js',
'src/shared/message-box.js',
'src/shared/media.js',
'src/shared/format.js',
'src/shared/errors.js',
'src/shared/webcodecs.js',
'src/shared/mp4-boxes.js',
'src/shared/segments.js',
'src/shared/timeline.js',
'src/shared/aac.js',
'src/audio.js',
'src/clips.js',
'src/copy.js',
'src/draw.js',
'src/main.js',
'src/ranges.js',
'src/record.js',
'src/segments.js',
'src/timeline.js',
'src/transcode.js',
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
caches.open(CACHE_NAME).then((cache)=>cache.put(request,copy));
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
