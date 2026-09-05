/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/zh-TW/yaml-to-json/:';
const CACHE_NAME=CACHE_PREFIX+'7ab14aa2e5';
const ASSETS=[
'./',
'index.html',
'styles.css?v=c8ec849bd7',
'manifest.json',
'src/shared/phrases.js?v=f87a3bb150',
'src/shared/trust.js?v=f87a3bb150',
'src/shared/file-picker.js?v=f87a3bb150',
'src/shared/parse-errors.js?v=f87a3bb150',
'src/shared/parse-json.js?v=f87a3bb150',
'src/shared/parse-yaml.js?v=f87a3bb150',
'src/shared/message-box.js?v=f87a3bb150',
'src/shared/download.js?v=f87a3bb150',
'src/shared/format.js?v=f87a3bb150',
'src/convert.js?v=f87a3bb150',
'src/main.js?v=f87a3bb150',
'src/samples.js?v=f87a3bb150',
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
