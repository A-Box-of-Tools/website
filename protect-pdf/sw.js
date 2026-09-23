/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/protect-pdf/:';
const CACHE_NAME=CACHE_PREFIX+'23193b216b';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=abf2afec76',
'manifest.json',
'src/shared/phrases.js?v=fff2899e83',
'src/shared/trust.js?v=fff2899e83',
'src/shared/file-picker.js?v=fff2899e83',
'src/shared/pdf-objects.js?v=fff2899e83',
'src/shared/pdf-filters.js?v=fff2899e83',
'src/shared/pdf-reader.js?v=fff2899e83',
'src/shared/pdf-writer.js?v=fff2899e83',
'src/shared/pdf-crypt.js?v=fff2899e83',
'src/shared/aes.js?v=fff2899e83',
'src/shared/rc4.js?v=fff2899e83',
'src/shared/pdf-permissions.js?v=fff2899e83',
'src/shared/md5.js?v=fff2899e83',
'src/shared/hash-blocks.js?v=fff2899e83',
'src/shared/message-box.js?v=fff2899e83',
'src/shared/format.js?v=fff2899e83',
'src/shared/example-pdf.js?v=fff2899e83',
'src/shared/pdf-page-writer.js?v=fff2899e83',
'src/shared/example-statement.js?v=fff2899e83',
'src/example.js?v=fff2899e83',
'src/format.js?v=fff2899e83',
'src/main.js?v=fff2899e83',
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
