/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/fr/extraire-une-image-d-une-video/:';
const CACHE_NAME=CACHE_PREFIX+'262f20fe88';
const ASSETS=[
'./',
'index.html',
'styles.css?v=78bfeefbc8',
'manifest.json',
'src/shared/phrases.js?v=05da797a51',
'src/shared/trust.js?v=05da797a51',
'src/shared/file-picker.js?v=05da797a51',
'src/shared/zip.js?v=05da797a51',
'src/shared/crc32.js?v=05da797a51',
'src/shared/mp4-reader.js?v=05da797a51',
'src/shared/message-box.js?v=05da797a51',
'src/shared/download.js?v=05da797a51',
'src/shared/media.js?v=05da797a51',
'src/shared/format.js?v=05da797a51',
'src/shared/webcodecs.js?v=05da797a51',
'src/shared/errors.js?v=05da797a51',
'src/draw.js?v=05da797a51',
'src/frames.js?v=05da797a51',
'src/main.js?v=05da797a51',
'src/still.js?v=05da797a51',
'src/support.js?v=05da797a51',
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
