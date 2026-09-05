/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/nl/audio-bewerken/:';
const CACHE_NAME=CACHE_PREFIX+'4442818f7a';
const ASSETS=[
'./',
'index.html',
'styles.css?v=83afbff316',
'manifest.json',
'src/shared/phrases.js?v=06e52d0bdb',
'src/shared/trust.js?v=06e52d0bdb',
'src/shared/file-picker.js?v=06e52d0bdb',
'src/shared/audio-decode.js?v=06e52d0bdb',
'src/shared/samplerate.js?v=06e52d0bdb',
'src/shared/wav.js?v=06e52d0bdb',
'src/shared/message-box.js?v=06e52d0bdb',
'src/shared/format.js?v=06e52d0bdb',
'src/edit.js?v=06e52d0bdb',
'src/effects.js?v=06e52d0bdb',
'src/main.js?v=06e52d0bdb',
'src/speed.js?v=06e52d0bdb',
'src/stretch.js?v=06e52d0bdb',
'src/waveform.js?v=06e52d0bdb',
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
