/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/tr/resimleri-videoya-donusturme/:';
const CACHE_NAME=CACHE_PREFIX+'96b33b5ed5';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=3f5b35d80d',
'manifest.json',
'src/shared/phrases.js?v=d057103c7b',
'src/shared/trust.js?v=d057103c7b',
'src/shared/file-picker.js?v=d057103c7b',
'src/shared/codec-support.js?v=d057103c7b',
'src/shared/mp4-muxer.js?v=d057103c7b',
'src/shared/message-box.js?v=d057103c7b',
'src/shared/format.js?v=d057103c7b',
'src/shared/webcodecs.js?v=d057103c7b',
'src/shared/errors.js?v=d057103c7b',
'src/shared/mp4-boxes.js?v=d057103c7b',
'src/shared/image-list.js?v=d057103c7b',
'src/shared/example-photo.js?v=d057103c7b',
'src/shared/url-import.js?v=d057103c7b',
'src/compose.js?v=d057103c7b',
'src/encoder.js?v=d057103c7b',
'src/example.js?v=d057103c7b',
'src/images.js?v=d057103c7b',
'src/main.js?v=d057103c7b',
'src/recorder.js?v=d057103c7b',
'src/support.js?v=d057103c7b',
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
