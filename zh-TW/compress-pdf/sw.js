/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/zh-TW/compress-pdf/:';
const CACHE_NAME=CACHE_PREFIX+'d1de24259d';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=1891e7b6f0',
'manifest.json',
'src/shared/phrases.js?v=1986656815',
'src/shared/trust.js?v=1986656815',
'src/shared/file-picker.js?v=1986656815',
'src/shared/pdf-objects.js?v=1986656815',
'src/shared/pdf-filters.js?v=1986656815',
'src/shared/pdf-reader.js?v=1986656815',
'src/shared/pdf-writer.js?v=1986656815',
'src/shared/message-box.js?v=1986656815',
'src/shared/example-pdf.js?v=1986656815',
'src/shared/example-photo.js?v=1986656815',
'src/shared/pdf-page-writer.js?v=1986656815',
'src/shared/example-statement.js?v=1986656815',
'src/compress.js?v=1986656815',
'src/example.js?v=1986656815',
'src/format.js?v=1986656815',
'src/images.js?v=1986656815',
'src/inventory.js?v=1986656815',
'src/main.js?v=1986656815',
'src/placements.js?v=1986656815',
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
