/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/hi/compress-pdf/:';
const CACHE_NAME=CACHE_PREFIX+'d2a05c2678';
const ASSETS=[
'./',
'index.html',
'styles.css?v=6af8deaf07',
'manifest.json',
'src/shared/phrases.js?v=3f63a0468a',
'src/shared/trust.js?v=3f63a0468a',
'src/shared/file-picker.js?v=3f63a0468a',
'src/shared/pdf-objects.js?v=3f63a0468a',
'src/shared/pdf-filters.js?v=3f63a0468a',
'src/shared/pdf-reader.js?v=3f63a0468a',
'src/shared/pdf-writer.js?v=3f63a0468a',
'src/shared/message-box.js?v=3f63a0468a',
'src/compress.js?v=3f63a0468a',
'src/format.js?v=3f63a0468a',
'src/images.js?v=3f63a0468a',
'src/inventory.js?v=3f63a0468a',
'src/main.js?v=3f63a0468a',
'src/placements.js?v=3f63a0468a',
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
