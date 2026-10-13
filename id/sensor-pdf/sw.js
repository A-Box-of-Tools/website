/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/id/sensor-pdf/:';
const CACHE_NAME=CACHE_PREFIX+'aadaa03fd7';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=ef1dd540ed',
'manifest.json',
'src/shared/phrases.js?v=c069f21c3a',
'src/shared/trust.js?v=c069f21c3a',
'src/shared/file-picker.js?v=c069f21c3a',
'src/shared/pdf-objects.js?v=c069f21c3a',
'src/shared/pdf-filters.js?v=c069f21c3a',
'src/shared/pdf-reader.js?v=c069f21c3a',
'src/shared/pdf-writer.js?v=c069f21c3a',
'src/shared/pdf-content.js?v=c069f21c3a',
'src/shared/pdf-base14.js?v=c069f21c3a',
'src/shared/pdf-fonts.js?v=c069f21c3a',
'src/shared/pdf-strings.js?v=c069f21c3a',
'src/shared/pdf-text.js?v=c069f21c3a',
'src/shared/message-box.js?v=c069f21c3a',
'src/shared/example-pdf.js?v=c069f21c3a',
'src/shared/pdf-page-writer.js?v=c069f21c3a',
'src/shared/example-statement.js?v=c069f21c3a',
'src/edit.js?v=c069f21c3a',
'src/example.js?v=c069f21c3a',
'src/format.js?v=c069f21c3a',
'src/main.js?v=c069f21c3a',
'src/matches.js?v=c069f21c3a',
'src/redact.js?v=c069f21c3a',
'src/strings.js?v=c069f21c3a',
'src/verify.js?v=c069f21c3a',
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
