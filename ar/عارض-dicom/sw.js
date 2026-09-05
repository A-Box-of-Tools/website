/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/ar/عارض-dicom/:';
const CACHE_NAME=CACHE_PREFIX+'607fe8da37';
const ASSETS=[
'./',
'index.html',
'styles.css?v=65635bfead',
'manifest.json',
'src/shared/phrases.js?v=df43bc672f',
'src/shared/trust.js?v=df43bc672f',
'src/shared/file-picker.js?v=df43bc672f',
'src/shared/message-box.js?v=df43bc672f',
'src/dicom.js?v=df43bc672f',
'src/dictionary.js?v=df43bc672f',
'src/format.js?v=df43bc672f',
'src/identity.js?v=df43bc672f',
'src/jpeg-lossless.js?v=df43bc672f',
'src/main.js?v=df43bc672f',
'src/pixels.js?v=df43bc672f',
'src/reader.js?v=df43bc672f',
'src/refusal.js?v=df43bc672f',
'src/report.js?v=df43bc672f',
'src/rle.js?v=df43bc672f',
'src/series.js?v=df43bc672f',
'src/uids.js?v=df43bc672f',
'src/values.js?v=df43bc672f',
'src/window.js?v=df43bc672f',
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
