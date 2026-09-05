/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/hi/redact-pdf/:';
const CACHE_NAME=CACHE_PREFIX+'0d5d0c1bc1';
const ASSETS=[
'./',
'index.html',
'styles.css?v=926540b9a0',
'manifest.json',
'src/shared/phrases.js?v=48fbbf8377',
'src/shared/trust.js?v=48fbbf8377',
'src/shared/file-picker.js?v=48fbbf8377',
'src/shared/pdf-objects.js?v=48fbbf8377',
'src/shared/pdf-filters.js?v=48fbbf8377',
'src/shared/pdf-reader.js?v=48fbbf8377',
'src/shared/pdf-writer.js?v=48fbbf8377',
'src/shared/message-box.js?v=48fbbf8377',
'src/base14.js?v=48fbbf8377',
'src/content.js?v=48fbbf8377',
'src/edit.js?v=48fbbf8377',
'src/fonts.js?v=48fbbf8377',
'src/format.js?v=48fbbf8377',
'src/main.js?v=48fbbf8377',
'src/matches.js?v=48fbbf8377',
'src/redact.js?v=48fbbf8377',
'src/strings.js?v=48fbbf8377',
'src/text.js?v=48fbbf8377',
'src/verify.js?v=48fbbf8377',
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
