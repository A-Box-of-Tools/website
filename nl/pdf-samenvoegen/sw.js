/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/nl/pdf-samenvoegen/:';
const CACHE_NAME=CACHE_PREFIX+'dfd2c2f667';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=fee5fcf434',
'manifest.json',
'src/shared/phrases.js?v=39978eb31e',
'src/shared/trust.js?v=39978eb31e',
'src/shared/file-picker.js?v=39978eb31e',
'src/shared/zip.js?v=39978eb31e',
'src/shared/crc32.js?v=39978eb31e',
'src/shared/pdf-objects.js?v=39978eb31e',
'src/shared/pdf-filters.js?v=39978eb31e',
'src/shared/pdf-reader.js?v=39978eb31e',
'src/shared/pdf-writer.js?v=39978eb31e',
'src/shared/message-box.js?v=39978eb31e',
'src/shared/format.js?v=39978eb31e',
'src/shared/example-pdf.js?v=39978eb31e',
'src/shared/pdf-page-writer.js?v=39978eb31e',
'src/shared/example-statement.js?v=39978eb31e',
'src/assemble.js?v=39978eb31e',
'src/dests.js?v=39978eb31e',
'src/example.js?v=39978eb31e',
'src/format.js?v=39978eb31e',
'src/main.js?v=39978eb31e',
'src/outline.js?v=39978eb31e',
'src/pages.js?v=39978eb31e',
'src/plan.js?v=39978eb31e',
'src/produce.js?v=39978eb31e',
'src/reorder.js?v=39978eb31e',
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
