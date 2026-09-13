/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/de/pdf-zusammenfuegen/:';
const CACHE_NAME=CACHE_PREFIX+'79d9c11980';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=fee5fcf434',
'manifest.json',
'src/shared/phrases.js?v=7117203ba2',
'src/shared/trust.js?v=7117203ba2',
'src/shared/file-picker.js?v=7117203ba2',
'src/shared/zip.js?v=7117203ba2',
'src/shared/crc32.js?v=7117203ba2',
'src/shared/pdf-objects.js?v=7117203ba2',
'src/shared/pdf-filters.js?v=7117203ba2',
'src/shared/pdf-reader.js?v=7117203ba2',
'src/shared/pdf-writer.js?v=7117203ba2',
'src/shared/pdf-pages.js?v=7117203ba2',
'src/shared/message-box.js?v=7117203ba2',
'src/shared/format.js?v=7117203ba2',
'src/shared/example-pdf.js?v=7117203ba2',
'src/shared/pdf-page-writer.js?v=7117203ba2',
'src/shared/example-statement.js?v=7117203ba2',
'src/assemble.js?v=7117203ba2',
'src/dests.js?v=7117203ba2',
'src/example.js?v=7117203ba2',
'src/format.js?v=7117203ba2',
'src/main.js?v=7117203ba2',
'src/outline.js?v=7117203ba2',
'src/plan.js?v=7117203ba2',
'src/produce.js?v=7117203ba2',
'src/reorder.js?v=7117203ba2',
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
