/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/de/groessenvergleich-erstellen/:';
const CACHE_NAME=CACHE_PREFIX+'672aba5531';
const ASSETS=[
'./',
'index.html',
'styles.css?v=f74eb55c2e',
'manifest.json',
'src/shared/phrases.js?v=c0afd74cac',
'src/shared/trust.js?v=c0afd74cac',
'src/shared/download.js?v=c0afd74cac',
'src/chart.js?v=c0afd74cac',
'src/figures.js?v=c0afd74cac',
'src/import-image.js?v=c0afd74cac',
'src/import-svg.js?v=c0afd74cac',
'src/main.js?v=c0afd74cac',
'src/objects.js?v=c0afd74cac',
'src/save.js?v=c0afd74cac',
'src/traced.js?v=c0afd74cac',
'src/units.js?v=c0afd74cac',
'vendor/LICENSE.md',
'vendor/boy-outline-nih-bioart-59.svg',
'vendor/girl-silhouette-black.svg',
'vendor/man-standing-silhouette.svg',
'vendor/objects/LICENSE-material-symbols-Apache-2.0.txt',
'vendor/objects/LICENSE-phosphor-MIT.txt',
'vendor/objects/LICENSE.md',
'vendor/objects/chair.svg',
'vendor/objects/chalkboard.svg',
'vendor/objects/couch.svg',
'vendor/objects/desk.svg',
'vendor/objects/door.svg',
'vendor/objects/fridge.svg',
'vendor/objects/garage-door.svg',
'vendor/objects/guitar.svg',
'vendor/objects/lockers.svg',
'vendor/objects/piano.svg',
'vendor/objects/projector-screen.svg',
'vendor/objects/table.svg',
'vendor/objects/vending-machine.svg',
'vendor/objects/wheelie-bin.svg',
'vendor/objects/window.svg',
'vendor/objects/wine-bottle.svg',
'vendor/woman-short-hair-and-jeans.svg',
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
