/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/es/calcular-checksum/:';
const CACHE_NAME=CACHE_PREFIX+'b30ac25a7a';
const ASSETS=[
'./',
'index.html',
'styles.css?v=4bd3b7173b',
'manifest.json',
'src/shared/phrases.js?v=37afe7ce81',
'src/shared/trust.js?v=37afe7ce81',
'src/shared/file-picker.js?v=37afe7ce81',
'src/shared/message-box.js?v=37afe7ce81',
'src/blocks.js?v=37afe7ce81',
'src/expected.js?v=37afe7ce81',
'src/format.js?v=37afe7ce81',
'src/hash.js?v=37afe7ce81',
'src/main.js?v=37afe7ce81',
'src/md5.js?v=37afe7ce81',
'src/sha1.js?v=37afe7ce81',
'src/sha256.js?v=37afe7ce81',
'src/sha512.js?v=37afe7ce81',
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
