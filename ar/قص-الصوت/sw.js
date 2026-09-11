/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/ar/قص-الصوت/:';
const CACHE_NAME=CACHE_PREFIX+'ecf2581e54';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=2bbb2ce563',
'manifest.json',
'src/shared/phrases.js?v=0caa7fed7b',
'src/shared/trust.js?v=0caa7fed7b',
'src/shared/file-picker.js?v=0caa7fed7b',
'src/shared/audio-decode.js?v=0caa7fed7b',
'src/shared/samplerate.js?v=0caa7fed7b',
'src/shared/wav.js?v=0caa7fed7b',
'src/shared/message-box.js?v=0caa7fed7b',
'src/shared/format.js?v=0caa7fed7b',
'src/shared/segments.js?v=0caa7fed7b',
'src/shared/timeline.js?v=0caa7fed7b',
'src/shared/example-audio.js?v=0caa7fed7b',
'src/example.js?v=0caa7fed7b',
'src/main.js?v=0caa7fed7b',
'src/segments.js?v=0caa7fed7b',
'src/timeline.js?v=0caa7fed7b',
'src/trim.js?v=0caa7fed7b',
'src/waveform.js?v=0caa7fed7b',
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
