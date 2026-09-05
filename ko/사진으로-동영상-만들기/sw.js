/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/ko/사진으로-동영상-만들기/:';
const CACHE_NAME=CACHE_PREFIX+'9f45c6e1f1';
const ASSETS=[
'./',
'index.html',
'styles.css?v=0690fc0fc9',
'manifest.json',
'src/shared/phrases.js?v=df6ebe855b',
'src/shared/trust.js?v=df6ebe855b',
'src/shared/file-picker.js?v=df6ebe855b',
'src/shared/codec-support.js?v=df6ebe855b',
'src/shared/mp4-muxer.js?v=df6ebe855b',
'src/shared/message-box.js?v=df6ebe855b',
'src/shared/format.js?v=df6ebe855b',
'src/shared/webcodecs.js?v=df6ebe855b',
'src/shared/errors.js?v=df6ebe855b',
'src/shared/mp4-boxes.js?v=df6ebe855b',
'src/shared/image-list.js?v=df6ebe855b',
'src/shared/url-import.js?v=df6ebe855b',
'src/compose.js?v=df6ebe855b',
'src/encoder.js?v=df6ebe855b',
'src/images.js?v=df6ebe855b',
'src/main.js?v=df6ebe855b',
'src/recorder.js?v=df6ebe855b',
'src/support.js?v=df6ebe855b',
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
