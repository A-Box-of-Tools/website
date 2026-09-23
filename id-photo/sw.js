/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/id-photo/:';
const CACHE_NAME=CACHE_PREFIX+'a2b68eca47';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=9da09d446c',
'manifest.json',
'src/shared/phrases.js?v=a400f69c75',
'src/shared/trust.js?v=a400f69c75',
'src/shared/file-picker.js?v=a400f69c75',
'src/shared/message-box.js?v=a400f69c75',
'src/background.js?v=a400f69c75',
'src/combo.js?v=a400f69c75',
'src/cropper.js?v=a400f69c75',
'src/detect.js?v=a400f69c75',
'src/encode.js?v=a400f69c75',
'src/example.js?v=a400f69c75',
'src/files.js?v=a400f69c75',
'src/geometry.js?v=a400f69c75',
'src/jpeg.js?v=a400f69c75',
'src/main.js?v=a400f69c75',
'src/marks.js?v=a400f69c75',
'src/requirements.js?v=a400f69c75',
'src/sheet.js?v=a400f69c75',
'src/sources.js?v=a400f69c75',
'src/specs.js?v=a400f69c75',
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
