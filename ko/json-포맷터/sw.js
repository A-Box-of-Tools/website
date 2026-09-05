/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/ko/json-포맷터/:';
const CACHE_NAME=CACHE_PREFIX+'d5443af086';
const ASSETS=[
'./',
'index.html',
'styles.css?v=c8ec849bd7',
'manifest.json',
'src/shared/phrases.js?v=c08a72bca6',
'src/shared/trust.js?v=c08a72bca6',
'src/shared/file-picker.js?v=c08a72bca6',
'src/shared/parse-errors.js?v=c08a72bca6',
'src/shared/parse-json.js?v=c08a72bca6',
'src/shared/parse-yaml.js?v=c08a72bca6',
'src/shared/parse-xml.js?v=c08a72bca6',
'src/shared/message-box.js?v=c08a72bca6',
'src/shared/download.js?v=c08a72bca6',
'src/shared/format.js?v=c08a72bca6',
'src/convert.js?v=c08a72bca6',
'src/css.js?v=c08a72bca6',
'src/format.js?v=c08a72bca6',
'src/main.js?v=c08a72bca6',
'src/samples.js?v=c08a72bca6',
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
