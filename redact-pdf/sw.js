/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/redact-pdf/:';
const CACHE_NAME=CACHE_PREFIX+'6862fa1b4e';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=ef1dd540ed',
'manifest.json',
'src/shared/phrases.js?v=3b15f0586b',
'src/shared/trust.js?v=3b15f0586b',
'src/shared/file-picker.js?v=3b15f0586b',
'src/shared/pdf-objects.js?v=3b15f0586b',
'src/shared/pdf-filters.js?v=3b15f0586b',
'src/shared/pdf-reader.js?v=3b15f0586b',
'src/shared/pdf-writer.js?v=3b15f0586b',
'src/shared/pdf-content.js?v=3b15f0586b',
'src/shared/pdf-base14.js?v=3b15f0586b',
'src/shared/pdf-fonts.js?v=3b15f0586b',
'src/shared/pdf-strings.js?v=3b15f0586b',
'src/shared/pdf-text.js?v=3b15f0586b',
'src/shared/message-box.js?v=3b15f0586b',
'src/shared/example-pdf.js?v=3b15f0586b',
'src/shared/pdf-page-writer.js?v=3b15f0586b',
'src/shared/example-statement.js?v=3b15f0586b',
'src/edit.js?v=3b15f0586b',
'src/example.js?v=3b15f0586b',
'src/format.js?v=3b15f0586b',
'src/main.js?v=3b15f0586b',
'src/matches.js?v=3b15f0586b',
'src/redact.js?v=3b15f0586b',
'src/strings.js?v=3b15f0586b',
'src/verify.js?v=3b15f0586b',
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
