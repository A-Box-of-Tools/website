/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/es/editar-audio/:';
const CACHE_NAME=CACHE_PREFIX+'e95d7506ae';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=f6aadbd855',
'manifest.json',
'src/shared/phrases.js?v=ef00d58da2',
'src/shared/trust.js?v=ef00d58da2',
'src/shared/file-picker.js?v=ef00d58da2',
'src/shared/audio-decode.js?v=ef00d58da2',
'src/shared/samplerate.js?v=ef00d58da2',
'src/shared/wav.js?v=ef00d58da2',
'src/shared/message-box.js?v=ef00d58da2',
'src/shared/format.js?v=ef00d58da2',
'src/shared/example-audio.js?v=ef00d58da2',
'src/edit.js?v=ef00d58da2',
'src/effects.js?v=ef00d58da2',
'src/example.js?v=ef00d58da2',
'src/main.js?v=ef00d58da2',
'src/speed.js?v=ef00d58da2',
'src/stretch.js?v=ef00d58da2',
'src/waveform.js?v=ef00d58da2',
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
