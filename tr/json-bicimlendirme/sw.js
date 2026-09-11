/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/tr/json-bicimlendirme/:';
const CACHE_NAME=CACHE_PREFIX+'d5474fedad';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=b2660c8e91',
'manifest.json',
'src/shared/phrases.js?v=77ae3be0df',
'src/shared/trust.js?v=77ae3be0df',
'src/shared/file-picker.js?v=77ae3be0df',
'src/shared/parse-errors.js?v=77ae3be0df',
'src/shared/parse-json.js?v=77ae3be0df',
'src/shared/parse-yaml.js?v=77ae3be0df',
'src/shared/parse-xml.js?v=77ae3be0df',
'src/shared/message-box.js?v=77ae3be0df',
'src/shared/download.js?v=77ae3be0df',
'src/shared/format.js?v=77ae3be0df',
'src/convert.js?v=77ae3be0df',
'src/css.js?v=77ae3be0df',
'src/format.js?v=77ae3be0df',
'src/main.js?v=77ae3be0df',
'src/samples.js?v=77ae3be0df',
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
