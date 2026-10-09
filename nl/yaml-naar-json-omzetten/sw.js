/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/nl/yaml-naar-json-omzetten/:';
const CACHE_NAME=CACHE_PREFIX+'e1160e714b';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=b2660c8e91',
'manifest.json',
'src/shared/phrases.js?v=dc4ff421c1',
'src/shared/trust.js?v=dc4ff421c1',
'src/shared/file-picker.js?v=dc4ff421c1',
'src/shared/parse-errors.js?v=dc4ff421c1',
'src/shared/parse-json.js?v=dc4ff421c1',
'src/shared/parse-yaml.js?v=dc4ff421c1',
'src/shared/message-box.js?v=dc4ff421c1',
'src/shared/download.js?v=dc4ff421c1',
'src/shared/format.js?v=dc4ff421c1',
'src/convert.js?v=dc4ff421c1',
'src/main.js?v=dc4ff421c1',
'src/samples.js?v=dc4ff421c1',
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
