/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CACHE_PREFIX='abox:/split-gif/:';
const CACHE_NAME=CACHE_PREFIX+'317c4abf8c';
const ASSETS=[
'./',
'index.html',
'index.md',
'styles.css?v=442b570bcf',
'manifest.json',
'src/shared/phrases.js?v=897e41de58',
'src/shared/trust.js?v=897e41de58',
'src/shared/file-picker.js?v=897e41de58',
'src/shared/gif-decode.js?v=897e41de58',
'src/shared/gif-compose.js?v=897e41de58',
'src/shared/zip.js?v=897e41de58',
'src/shared/crc32.js?v=897e41de58',
'src/shared/message-box.js?v=897e41de58',
'src/shared/format.js?v=897e41de58',
'src/shared/example-gif.js?v=897e41de58',
'src/shared/example-photo.js?v=897e41de58',
'src/example.js?v=897e41de58',
'src/frames.js?v=897e41de58',
'src/main.js?v=897e41de58',
'src/sheet.js?v=897e41de58',
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
