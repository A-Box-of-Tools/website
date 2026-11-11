/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/id/business-profile-preview/:';
const CACHE_NAME=CACHE_PREFIX+'45b81ff153';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=60820faa6d',
'manifest.json',
'src/shared/phrases.js?v=3f9e9a36a1',
'src/shared/trust.js?v=3f9e9a36a1',
'src/shared/download.js?v=3f9e9a36a1',
'src/main.js?v=3f9e9a36a1',
'src/parse-listing.js?v=3f9e9a36a1',
'src/photo.js?v=3f9e9a36a1',
'src/profile.js?v=3f9e9a36a1',
'src/raster.js?v=3f9e9a36a1',
'src/render.js?v=3f9e9a36a1',
'src/samples.js?v=3f9e9a36a1',
'src/saved.js?v=3f9e9a36a1',
'src/surfaces.js?v=3f9e9a36a1',
'src/view.js?v=3f9e9a36a1',
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
