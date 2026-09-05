/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/ja/trim-video/:';
const CACHE_NAME=CACHE_PREFIX+'c4754c2eac';
const ASSETS=[
'./',
'index.html',
'styles.css?v=5faeafbf24',
'manifest.json',
'src/shared/phrases.js?v=6ce570d903',
'src/shared/trust.js?v=6ce570d903',
'src/shared/file-picker.js?v=6ce570d903',
'src/shared/codec-support.js?v=6ce570d903',
'src/shared/mp4-reader.js?v=6ce570d903',
'src/shared/mp4-writer.js?v=6ce570d903',
'src/shared/video-support.js?v=6ce570d903',
'src/shared/message-box.js?v=6ce570d903',
'src/shared/media.js?v=6ce570d903',
'src/shared/format.js?v=6ce570d903',
'src/shared/errors.js?v=6ce570d903',
'src/shared/webcodecs.js?v=6ce570d903',
'src/shared/mp4-boxes.js?v=6ce570d903',
'src/shared/segments.js?v=6ce570d903',
'src/shared/timeline.js?v=6ce570d903',
'src/shared/aac.js?v=6ce570d903',
'src/audio.js?v=6ce570d903',
'src/clips.js?v=6ce570d903',
'src/copy.js?v=6ce570d903',
'src/draw.js?v=6ce570d903',
'src/main.js?v=6ce570d903',
'src/ranges.js?v=6ce570d903',
'src/record.js?v=6ce570d903',
'src/segments.js?v=6ce570d903',
'src/timeline.js?v=6ce570d903',
'src/transcode.js?v=6ce570d903',
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
