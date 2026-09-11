/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/nl/afbeelding-naar-base64/:';
const CACHE_NAME=CACHE_PREFIX+'d095b75f45';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=507672548e',
'manifest.json',
'src/shared/phrases.js?v=58d20e4e48',
'src/shared/trust.js?v=58d20e4e48',
'src/shared/file-picker.js?v=58d20e4e48',
'src/shared/message-box.js?v=58d20e4e48',
'src/shared/format.js?v=58d20e4e48',
'src/shared/example-mark.js?v=58d20e4e48',
'src/shared/example-photo.js?v=58d20e4e48',
'src/encode.js?v=58d20e4e48',
'src/example.js?v=58d20e4e48',
'src/files.js?v=58d20e4e48',
'src/main.js?v=58d20e4e48',
'src/metadata.js?v=58d20e4e48',
'src/shapes.js?v=58d20e4e48',
'src/sniff.js?v=58d20e4e48',
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
