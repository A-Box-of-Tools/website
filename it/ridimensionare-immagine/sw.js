/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/it/ridimensionare-immagine/:';
const CACHE_NAME=CACHE_PREFIX+'e00179c237';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=e5a8087968',
'manifest.json',
'src/shared/phrases.js?v=ab0603b847',
'src/shared/trust.js?v=ab0603b847',
'src/shared/file-picker.js?v=ab0603b847',
'src/shared/zip.js?v=ab0603b847',
'src/shared/crc32.js?v=ab0603b847',
'src/shared/message-box.js?v=ab0603b847',
'src/shared/download.js?v=ab0603b847',
'src/shared/media.js?v=ab0603b847',
'src/shared/format.js?v=ab0603b847',
'src/shared/cropper.js?v=ab0603b847',
'src/shared/example-photo.js?v=ab0603b847',
'src/codecs.js?v=ab0603b847',
'src/example.js?v=ab0603b847',
'src/files.js?v=ab0603b847',
'src/geometry.js?v=ab0603b847',
'src/main.js?v=ab0603b847',
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
