/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/id/pdf-to-csv/:';
const CACHE_NAME=CACHE_PREFIX+'5a8772471d';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=fe5671d51d',
'manifest.json',
'src/shared/phrases.js?v=d4c7e8c12a',
'src/shared/trust.js?v=d4c7e8c12a',
'src/shared/file-picker.js?v=d4c7e8c12a',
'src/shared/pdf-objects.js?v=d4c7e8c12a',
'src/shared/pdf-filters.js?v=d4c7e8c12a',
'src/shared/pdf-reader.js?v=d4c7e8c12a',
'src/shared/pdf-content.js?v=d4c7e8c12a',
'src/shared/pdf-base14.js?v=d4c7e8c12a',
'src/shared/pdf-fonts.js?v=d4c7e8c12a',
'src/shared/pdf-strings.js?v=d4c7e8c12a',
'src/shared/pdf-text.js?v=d4c7e8c12a',
'src/shared/message-box.js?v=d4c7e8c12a',
'src/shared/download.js?v=d4c7e8c12a',
'src/shared/format.js?v=d4c7e8c12a',
'src/shared/example-pdf.js?v=d4c7e8c12a',
'src/shared/pdf-page-writer.js?v=d4c7e8c12a',
'src/shared/example-statement.js?v=d4c7e8c12a',
'src/check.js?v=d4c7e8c12a',
'src/csv.js?v=d4c7e8c12a',
'src/example.js?v=d4c7e8c12a',
'src/layout.js?v=d4c7e8c12a',
'src/main.js?v=d4c7e8c12a',
'src/rows.js?v=d4c7e8c12a',
'src/tables.js?v=d4c7e8c12a',
'src/values.js?v=d4c7e8c12a',
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
