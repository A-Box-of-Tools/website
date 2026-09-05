/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/es/invertir-video/:';
const CACHE_NAME=CACHE_PREFIX+'a05e85985e';
const ASSETS=[
'./',
'index.html',
'styles.css?v=9235736e27',
'manifest.json',
'src/shared/phrases.js?v=710dc5c362',
'src/shared/trust.js?v=710dc5c362',
'src/shared/file-picker.js?v=710dc5c362',
'src/shared/codec-support.js?v=710dc5c362',
'src/shared/mp4-reader.js?v=710dc5c362',
'src/shared/mp4-writer.js?v=710dc5c362',
'src/shared/video-support.js?v=710dc5c362',
'src/shared/message-box.js?v=710dc5c362',
'src/shared/media.js?v=710dc5c362',
'src/shared/format.js?v=710dc5c362',
'src/shared/webcodecs.js?v=710dc5c362',
'src/shared/errors.js?v=710dc5c362',
'src/shared/mp4-boxes.js?v=710dc5c362',
'src/shared/aac.js?v=710dc5c362',
'src/audio.js?v=710dc5c362',
'src/draw.js?v=710dc5c362',
'src/main.js?v=710dc5c362',
'src/playback.js?v=710dc5c362',
'src/reverse.js?v=710dc5c362',
'src/timeline.js?v=710dc5c362',
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
