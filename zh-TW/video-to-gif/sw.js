/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/zh-TW/video-to-gif/:';
const CACHE_NAME=CACHE_PREFIX+'3b61c2c9e4';
const ASSETS=[
'./',
'index.html',
'styles.css?v=c2170ec2f3',
'manifest.json',
'src/shared/phrases.js?v=e168e3fc1d',
'src/shared/trust.js?v=e168e3fc1d',
'src/shared/file-picker.js?v=e168e3fc1d',
'src/shared/mp4-reader.js?v=e168e3fc1d',
'src/shared/message-box.js?v=e168e3fc1d',
'src/shared/media.js?v=e168e3fc1d',
'src/shared/format.js?v=e168e3fc1d',
'src/shared/webcodecs.js?v=e168e3fc1d',
'src/shared/errors.js?v=e168e3fc1d',
'src/shared/frame-canvas.js?v=e168e3fc1d',
'src/encode.js?v=e168e3fc1d',
'src/frames.js?v=e168e3fc1d',
'src/gif.js?v=e168e3fc1d',
'src/main.js?v=e168e3fc1d',
'src/plan.js?v=e168e3fc1d',
'src/quantize.js?v=e168e3fc1d',
'src/range.js?v=e168e3fc1d',
'src/support.js?v=e168e3fc1d',
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
