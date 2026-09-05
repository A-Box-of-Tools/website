/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/ko/이미지-크기-조절/:';
const CACHE_NAME=CACHE_PREFIX+'0200206854';
const ASSETS=[
'./',
'index.html',
'styles.css?v=a730c7cd79',
'manifest.json',
'src/shared/phrases.js?v=cff3c8840c',
'src/shared/trust.js?v=cff3c8840c',
'src/shared/file-picker.js?v=cff3c8840c',
'src/shared/zip.js?v=cff3c8840c',
'src/shared/crc32.js?v=cff3c8840c',
'src/shared/message-box.js?v=cff3c8840c',
'src/shared/download.js?v=cff3c8840c',
'src/shared/media.js?v=cff3c8840c',
'src/shared/format.js?v=cff3c8840c',
'src/shared/cropper.js?v=cff3c8840c',
'src/codecs.js?v=cff3c8840c',
'src/files.js?v=cff3c8840c',
'src/geometry.js?v=cff3c8840c',
'src/main.js?v=cff3c8840c',
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
