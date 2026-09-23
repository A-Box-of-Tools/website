/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/nl/exif-gegevens-verwijderen/:';
const CACHE_NAME=CACHE_PREFIX+'952336123e';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=4c9d037567',
'manifest.json',
'src/shared/phrases.js?v=8978bafeaa',
'src/shared/trust.js?v=8978bafeaa',
'src/shared/file-picker.js?v=8978bafeaa',
'src/shared/zip.js?v=8978bafeaa',
'src/shared/crc32.js?v=8978bafeaa',
'src/shared/message-box.js?v=8978bafeaa',
'src/shared/download.js?v=8978bafeaa',
'src/shared/media.js?v=8978bafeaa',
'src/shared/example-photo.js?v=8978bafeaa',
'src/shared/example-exif.js?v=8978bafeaa',
'src/container.js?v=8978bafeaa',
'src/example.js?v=8978bafeaa',
'src/jpeg.js?v=8978bafeaa',
'src/main.js?v=8978bafeaa',
'src/png.js?v=8978bafeaa',
'src/report.js?v=8978bafeaa',
'src/tags.js?v=8978bafeaa',
'src/tiff.js?v=8978bafeaa',
'src/webp.js?v=8978bafeaa',
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
