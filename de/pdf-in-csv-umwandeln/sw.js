/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/de/pdf-in-csv-umwandeln/:';
const CACHE_NAME=CACHE_PREFIX+'e8756f89f8';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=fe5671d51d',
'manifest.json',
'src/shared/phrases.js?v=39a464ea0b',
'src/shared/trust.js?v=39a464ea0b',
'src/shared/file-picker.js?v=39a464ea0b',
'src/shared/pdf-objects.js?v=39a464ea0b',
'src/shared/pdf-filters.js?v=39a464ea0b',
'src/shared/pdf-reader.js?v=39a464ea0b',
'src/shared/pdf-content.js?v=39a464ea0b',
'src/shared/pdf-base14.js?v=39a464ea0b',
'src/shared/pdf-fonts.js?v=39a464ea0b',
'src/shared/pdf-strings.js?v=39a464ea0b',
'src/shared/pdf-text.js?v=39a464ea0b',
'src/shared/message-box.js?v=39a464ea0b',
'src/shared/download.js?v=39a464ea0b',
'src/shared/format.js?v=39a464ea0b',
'src/shared/example-pdf.js?v=39a464ea0b',
'src/shared/pdf-page-writer.js?v=39a464ea0b',
'src/shared/example-statement.js?v=39a464ea0b',
'src/check.js?v=39a464ea0b',
'src/csv.js?v=39a464ea0b',
'src/example.js?v=39a464ea0b',
'src/layout.js?v=39a464ea0b',
'src/main.js?v=39a464ea0b',
'src/rows.js?v=39a464ea0b',
'src/tables.js?v=39a464ea0b',
'src/values.js?v=39a464ea0b',
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
