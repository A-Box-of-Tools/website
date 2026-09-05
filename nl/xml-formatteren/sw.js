/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/nl/xml-formatteren/:';
const CACHE_NAME=CACHE_PREFIX+'66d0cc29f3';
const ASSETS=[
'./',
'index.html',
'styles.css?v=c8ec849bd7',
'manifest.json',
'src/shared/phrases.js?v=b3cdabb13c',
'src/shared/trust.js?v=b3cdabb13c',
'src/shared/file-picker.js?v=b3cdabb13c',
'src/shared/parse-errors.js?v=b3cdabb13c',
'src/shared/parse-json.js?v=b3cdabb13c',
'src/shared/parse-xml.js?v=b3cdabb13c',
'src/shared/message-box.js?v=b3cdabb13c',
'src/shared/download.js?v=b3cdabb13c',
'src/shared/format.js?v=b3cdabb13c',
'src/convert.js?v=b3cdabb13c',
'src/main.js?v=b3cdabb13c',
'src/samples.js?v=b3cdabb13c',
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
