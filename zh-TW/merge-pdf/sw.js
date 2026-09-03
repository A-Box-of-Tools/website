/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/zh-TW/merge-pdf/:';
const CACHE_NAME=CACHE_PREFIX+'b3df274172';
const ASSETS=[
'./',
'index.html',
'styles.css?v=3dd4819677',
'manifest.json',
'src/shared/phrases.js',
'src/shared/trust.js',
'src/shared/file-picker.js',
'src/shared/zip.js',
'src/shared/crc32.js',
'src/shared/pdf-objects.js',
'src/shared/pdf-filters.js',
'src/shared/pdf-reader.js',
'src/shared/pdf-writer.js',
'src/shared/message-box.js',
'src/shared/format.js',
'src/assemble.js',
'src/dests.js',
'src/format.js',
'src/main.js',
'src/outline.js',
'src/pages.js',
'src/plan.js',
'src/produce.js',
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
