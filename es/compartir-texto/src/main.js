/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{renderMarkdown}from'./markdown.js';
import{CODE_PATTERN,formatSize,makeCode,normalize}from'./names.js';
const RENDEZVOUS='wss://rendezvous.a-box-of-tools.workers.dev';
const RTC={iceServers:[{urls:['stun:stun.cloudflare.com:3478','stun:stun.l.google.com:19302']}]};
const wsUrl=(code,role)=>`${RENDEZVOUS}/ws/${code}?role=${role}`;
const shareUrl=(code)=>`${location.origin}${location.pathname}#${code}`;
const MAX_FILE=200*1024*1024;
const CHUNK=64*1024;
const $=(id)=>document.getElementById(id);
const sizeUnits={
b:phrase('units.b'),
kb:phrase('units.kb'),
mb:phrase('units.mb'),
};
const fmtSize=(n)=>formatSize(n,sizeUnits);
let sock=null;
let keepalive=0;
let attempts=0;
let suggestion='';
let isPrivate=true;
const peers=new Map();
const channels=new Map();
const pending=new Map();
const attached=new Map();
const sendQueue=new Map();
const payload=()=>JSON.stringify({type:'text',body:$('text').value,md:$('markdown').checked});
const STORE='share-text-draft';
const STORE_ONEOFF='share-text-oneoff';
const STORE_MD='share-text-md';
function persist(){
try{
if($('oneoff').checked)localStorage.removeItem(STORE);
else localStorage.setItem(STORE,$('text').value);
}catch{}
}
function restore(){
try{
$('markdown').checked=localStorage.getItem(STORE_MD)==='1';
$('oneoff').checked=localStorage.getItem(STORE_ONEOFF)==='1';
if(!$('oneoff').checked){
const saved=localStorage.getItem(STORE);
if(saved!==null)$('text').value=saved;
}
}catch{}
updateEditor();
}
function updateEditor(){
const body=$('text').value;
const on=$('markdown').checked&&body.trim()!=='';
$('live').hidden=!on;
$('live').innerHTML=on?renderMarkdown(body):'';
}
function suggest(){
suggestion=makeCode();
$('code').value=suggestion;
}
function unlock(){
$('code').disabled=false;
$('suggest').disabled=false;
$('private').disabled=false;
$('publish').hidden=false;
$('stop').hidden=true;
$('linkrow').hidden=true;
$('requests').textContent='';
pending.clear();
}
function setStatus(text,warn=false){
$('status').textContent=text;
$('status').classList.toggle('warn',warn);
}
function refreshCount(){
const n=channels.size;
const w=pending.size;
if(n===0&&w===0){
setStatus(phrase('share.waiting'));
return;
}
const parts=[n===1?phrase('share.reader-count.one'):phrase('share.reader-count.many',{n})];
if(w>0)parts.push(w===1?phrase('share.knock-count.one'):phrase('share.knock-count.many',{n:w}));
setStatus(`${parts.join(', ')}. ${phrase('share.closing-note')}`);
}
const admitTokens=new Set();
function admitViewer(id,dc){
channels.set(id,dc);
const token=crypto.randomUUID();
admitTokens.add(token);
try{
dc.send(JSON.stringify({type:'token',token}));
dc.send(payload());
dc.send(filesMsg());
}catch{}
refreshCount();
}
function addRequest(id,dc,note){
const row=document.createElement('div');
row.className='request';
const text=document.createElement('span');
text.textContent=note===''?phrase('share.no-message'):`“${note}”`;
const admit=document.createElement('button');
admit.type='button';
admit.textContent=phrase('share.admit');
admit.onclick=()=>{
pending.delete(id);
row.remove();
admitViewer(id,dc);
};
const deny=document.createElement('button');
deny.type='button';
deny.className='ghost';
deny.textContent=phrase('share.deny');
deny.onclick=()=>{
pending.delete(id);
row.remove();
try{dc.send(JSON.stringify({type:'denied'}));}catch{}
setTimeout(()=>{peers.get(id)?.close();peers.delete(id);},250);
refreshCount();
};
row.append(text,admit,deny);
pending.set(id,{dc,row});
$('requests').append(row);
refreshCount();
}
function removeRequest(id){
const entry=pending.get(id);
if(entry){entry.row.remove();pending.delete(id);}
}
function dropViewer(id){
if(peers.has(id)){peers.get(id).close();peers.delete(id);}
channels.delete(id);
sendQueue.delete(id);
removeRequest(id);
refreshCount();
}
function broadcast(){
if($('publish').hidden===false)return;
for(const dc of channels.values()){try{dc.send(payload());}catch{}}
}
const filesMsg=()=>JSON.stringify({
type:'files',
list:[...attached].map(([id,f])=>({id,name:f.name,size:f.size})),
});
function broadcastFiles(){
if($('publish').hidden===false)return;
for(const dc of channels.values()){try{dc.send(filesMsg());}catch{}}
}
function renderAttachlist(){
const box=$('attachlist');
box.textContent='';
for(const[id,f]of attached){
const row=document.createElement('div');
row.className='filerow';
const name=document.createElement('span');
name.className='fname';
name.textContent=f.name;
const size=document.createElement('span');
size.className='fsize';
size.textContent=fmtSize(f.size);
const del=document.createElement('button');
del.type='button';
del.className='ghost';
del.textContent=phrase('share.remove-file');
del.onclick=()=>{attached.delete(id);renderAttachlist();broadcastFiles();};
row.append(name,size,del);
box.append(row);
}
}
async function sendFile(dc,id){
const f=attached.get(id);
if(!f){dc.send(JSON.stringify({type:'file-gone',id}));return;}
dc.send(JSON.stringify({type:'file-begin',id,name:f.name,size:f.size,mime:f.type}));
dc.bufferedAmountLowThreshold=1<<20;
for(let off=0;off<f.size;off+=CHUNK){
if(dc.readyState!=='open')return;
if(dc.bufferedAmount>(8<<20)){
await new Promise((resolve)=>{
dc.addEventListener('bufferedamountlow',resolve,{once:true});
dc.addEventListener('close',resolve,{once:true});
});
if(dc.readyState!=='open')return;
}
dc.send(await f.slice(off,off+CHUNK).arrayBuffer());
}
dc.send(JSON.stringify({type:'file-end',id}));
}
function hostSocket(code,onOpen){
sock=new WebSocket(wsUrl(code,'host'));
sock.onopen=()=>{
keepalive=setInterval(()=>{if(sock.readyState===1)sock.send('ping');},30000);
onOpen();
};
sock.onmessage=(e)=>{
if(e.data==='pong')return;
const m=JSON.parse(e.data);
if(m.type==='leave'){
dropViewer(m.id);
return;
}
if(m.type==='signal')hostSignal(m.from,m.data);
};
sock.onclose=(e)=>{
clearInterval(keepalive);
if(e.code===4409){
if($('code').value===suggestion&&attempts<3){attempts+=1;suggest();publish();return;}
unlock();
setStatus(phrase('share.name-taken',{name:$('code').value}));
return;
}
if(e.code===1000||$('publish').hidden===false)return;
setStatus(phrase('share.lost-rendezvous'),true);
setTimeout(()=>{
if($('publish').hidden)hostSocket(code,refreshCount);
},5000);
};
}
function publish(){
const code=normalize($('code').value);
if(code===''){
setStatus(phrase('share.name-first'));
return;
}
$('code').value=code;
$('code').disabled=true;
$('suggest').disabled=true;
isPrivate=$('private').checked;
$('private').disabled=true;
$('publish').hidden=true;
setStatus(phrase('share.setting-up'));
hostSocket(code,()=>{
attempts=0;
$('link').value=shareUrl(code);
$('linkrow').hidden=false;
$('stop').hidden=false;
refreshCount();
});
}
async function hostSignal(from,data){
let pc=peers.get(from);
if(!pc){
pc=new RTCPeerConnection(RTC);
peers.set(from,pc);
pc.onicecandidate=(e)=>{
if(e.candidate&&sock.readyState===1)sock.send(JSON.stringify({to:from,data:{candidate:e.candidate}}));
};
pc.ondatachannel=(e)=>{
const dc=e.channel;
dc.binaryType='arraybuffer';
dc.onopen=()=>{
if(isPrivate){dc.send(JSON.stringify({type:'private'}));refreshCount();}
else admitViewer(from,dc);
};
dc.onmessage=(ev)=>{
if(typeof ev.data!=='string')return;
let m;
try{m=JSON.parse(ev.data);}catch{return;}
if(m.type==='get'&&channels.has(from)){
const chain=sendQueue.get(from)??Promise.resolve();
sendQueue.set(from,chain.then(()=>sendFile(dc,String(m.id))).catch(()=>{}));
return;
}
if(m.type==='knock'&&isPrivate&&!channels.has(from)&&!pending.has(from)){
if(typeof m.token==='string'&&admitTokens.has(m.token)){
admitViewer(from,dc);
return;
}
addRequest(from,dc,String(m.note??'').slice(0,200));
}
};
dc.onclose=()=>dropViewer(from);
};
}
try{
if(data.sdp){
await pc.setRemoteDescription(data.sdp);
await pc.setLocalDescription(await pc.createAnswer());
sock.send(JSON.stringify({to:from,data:{sdp:pc.localDescription}}));
}else if(data.candidate){
await pc.addIceCandidate(data.candidate);
}
}catch{}
}
let debounce=0;
$('text').addEventListener('input',()=>{
updateEditor();
clearTimeout(debounce);
debounce=setTimeout(()=>{
persist();
broadcast();
},250);
});
$('markdown').addEventListener('change',()=>{
try{localStorage.setItem(STORE_MD,$('markdown').checked?'1':'0');}catch{}
updateEditor();
broadcast();
});
$('oneoff').addEventListener('change',()=>{
try{localStorage.setItem(STORE_ONEOFF,$('oneoff').checked?'1':'0');}catch{}
persist();
});
$('live').addEventListener('click',(e)=>{
if(e.target.closest('a'))return;
$('text').focus();
});
$('attach').addEventListener('click',()=>$('fileinput').click());
$('fileinput').addEventListener('change',()=>{
for(const f of $('fileinput').files){
if(f.size>MAX_FILE){
setStatus(phrase('share.file-too-big',{name:f.name}));
continue;
}
attached.set(crypto.randomUUID(),f);
}
$('fileinput').value='';
renderAttachlist();
broadcastFiles();
});
$('save').addEventListener('click',()=>{
const name=`${normalize($('code').value) || 'shared-text'}.txt`;
const url=URL.createObjectURL(new Blob([$('text').value],{type:'text/plain'}));
const a=document.createElement('a');
a.href=url;
a.download=name;
a.click();
setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('publish').addEventListener('click',publish);
$('stop').addEventListener('click',()=>{
sock?.close(1000);
clearInterval(keepalive);
for(const pc of peers.values())pc.close();
peers.clear();channels.clear();sendQueue.clear();
unlock();
setStatus(phrase('share.stopped'));
});
$('suggest').addEventListener('click',suggest);
$('copylink').addEventListener('click',()=>{
navigator.clipboard.writeText($('link').value);
$('copylink').textContent=phrase('copy.done');
setTimeout(()=>{$('copylink').textContent=phrase('copy.link');},1500);
});
function fail(text){
if($('received').hidden===false)return;
$('consent').hidden=true;
$('retryrow').hidden=false;
$('view-status').textContent=text;
}
let viewerLive=false;
function view(code){
$('share').hidden=true;
$('view').hidden=false;
let carried=false;
try{
const stamp=Number(sessionStorage.getItem(`share-text-carry:${code}`)??0);
carried=Date.now()-stamp<5*60*1000;
sessionStorage.removeItem(`share-text-carry:${code}`);
}catch{}
const ws=new WebSocket(wsUrl(code,'viewer'));
let pc=null;
let dcRef=null;
let got=false;
let connected=false;
let done=false;
let lastBody='';
let asMd=false;
let mdTouched=false;
let rx=null;
function renderView(){
$('received').textContent=lastBody;
const empty=lastBody==='';
$('panel').hidden=empty;
$('received').hidden=empty||asMd;
$('rendered').hidden=empty||!asMd;
$('rendered').innerHTML=!empty&&asMd?renderMarkdown(lastBody):'';
$('mode-fmt').classList.toggle('active',asMd);
$('mode-src').classList.toggle('active',!asMd);
}
$('mode-fmt').addEventListener('click',()=>{mdTouched=true;asMd=true;renderView();});
$('mode-src').addEventListener('click',()=>{mdTouched=true;asMd=false;renderView();});
function renderFilelist(list){
const box=$('filelist');
box.textContent='';
for(const f of list){
const row=document.createElement('div');
row.className='filerow';
const name=document.createElement('span');
name.className='fname';
name.textContent=String(f.name??'');
const size=document.createElement('span');
size.className='fsize';
size.textContent=fmtSize(Number(f.size)||0);
const btn=document.createElement('button');
btn.type='button';
btn.className='ghost';
btn.textContent=phrase('view.download');
btn.onclick=()=>{
if(rx!==null||dcRef===null)return;
rx={id:f.id,name:name.textContent,size:Number(f.size)||0,mime:'',parts:[],got:0,btn};
btn.disabled=true;
btn.textContent='0%';
dcRef.send(JSON.stringify({type:'get',id:f.id}));
};
row.append(name,size,btn);
box.append(row);
}
}
function fileBegin(msg){
if(rx===null||msg.id!==rx.id)return;
rx.mime=String(msg.mime??'');
rx.size=Number(msg.size)||rx.size;
}
function fileChunk(buf){
if(rx===null)return;
rx.parts.push(buf);
rx.got+=buf.byteLength;
if(rx.size>0)rx.btn.textContent=`${Math.min(99, Math.floor((rx.got / rx.size) * 100))}%`;
}
function fileEnd(){
if(rx===null)return;
const url=URL.createObjectURL(new Blob(rx.parts,{type:rx.mime}));
const a=document.createElement('a');
a.href=url;
a.download=rx.name===''?'shared-file':rx.name;
a.click();
setTimeout(()=>URL.revokeObjectURL(url),5000);
rx.btn.textContent=phrase('view.download');
rx.btn.disabled=false;
rx=null;
}
function fileGone(){
if(rx===null)return;
rx.btn.textContent=phrase('view.file-gone');
rx=null;
}
const sharerGone=()=>{
if(done)return;
done=true;
viewerLive=false;
$('knockrow').hidden=true;
$('filelist').textContent='';
rx=null;
if(got){
lastBody='';
$('received').textContent='';
$('rendered').textContent='';
$('panel').hidden=true;
$('view-status').hidden=false;
$('view-status').textContent=phrase('view.ended');
$('retryrow').hidden=false;
return;
}
fail(phrase('view.gone-early'));
};
$('send-knock').addEventListener('click',()=>{
const note=$('knock').value.trim().slice(0,200);
try{dcRef.send(JSON.stringify({type:'knock',note}));}catch{return;}
$('knock').disabled=true;
$('send-knock').disabled=true;
$('view-status').textContent=phrase('view.asked');
});
$('knock').addEventListener('keydown',(e)=>{
if(e.key==='Enter')$('send-knock').click();
});
async function dial(){
if(pc!==null||ws.readyState!==1)return;
$('consent').hidden=true;
$('view-status').textContent=phrase('view.connecting');
pc=new RTCPeerConnection(RTC);
pc.onicecandidate=(ev)=>{
if(ev.candidate&&ws.readyState===1)ws.send(JSON.stringify({data:{candidate:ev.candidate}}));
};
pc.onconnectionstatechange=()=>{
if(connected&&(pc.connectionState==='failed'||pc.connectionState==='closed'))sharerGone();
};
const dc=pc.createDataChannel('share');
dc.binaryType='arraybuffer';
dcRef=dc;
dc.onopen=()=>{connected=true;viewerLive=true;};
dc.onmessage=(ev)=>{
if(typeof ev.data!=='string'){fileChunk(ev.data);return;}
const msg=JSON.parse(ev.data);
if(msg.type==='files'){renderFilelist(msg.list??[]);return;}
if(msg.type==='file-begin'){fileBegin(msg);return;}
if(msg.type==='file-end'){fileEnd();return;}
if(msg.type==='file-gone'){fileGone();return;}
if(msg.type==='token'){
try{sessionStorage.setItem(`share-text-token:${code}`,String(msg.token));}catch{}
return;
}
if(msg.type==='private'){
let token=null;
try{token=carried?sessionStorage.getItem(`share-text-token:${code}`):null;}catch{}
if(token!==null){
dc.send(JSON.stringify({type:'knock',note:'',token}));
return;
}
$('view-status').textContent=phrase('view.private');
$('knockrow').hidden=false;
$('knock').focus();
return;
}
if(msg.type==='denied'){
done=true;
$('knockrow').hidden=true;
$('view-status').textContent=phrase('view.denied');
$('retryrow').hidden=false;
return;
}
if(msg.type!=='text'||done)return;
got=true;
lastBody=String(msg.body??'');
if(!mdTouched)asMd=msg.md===true;
renderView();
$('knockrow').hidden=true;
$('view-status').hidden=lastBody!=='';
if(lastBody==='')$('view-status').textContent=phrase('view.empty');
};
dc.onclose=sharerGone;
await pc.setLocalDescription(await pc.createOffer());
ws.send(JSON.stringify({data:{sdp:pc.localDescription}}));
setTimeout(()=>{
if(!got&&!connected&&!done)fail(phrase('view.no-connect'));
},20000);
}
$('connect').addEventListener('click',()=>{
dial().catch(()=>fail(phrase('view.error')));
});
ws.onopen=()=>setInterval(()=>{if(ws.readyState===1)ws.send('ping');},30000);
ws.onmessage=async(e)=>{
if(e.data==='pong')return;
const m=JSON.parse(e.data);
try{
if(m.type==='ready'){
if(carried){
await dial();
}else{
$('view-status').textContent=phrase('view.someone');
$('consent').hidden=false;
}
}else if(m.type==='signal'&&pc){
if(m.data.sdp)await pc.setRemoteDescription(m.data.sdp);
else if(m.data.candidate)await pc.addIceCandidate(m.data.candidate);
}
}catch{
fail(phrase('view.error'));
}
};
ws.onclose=(e)=>{
if(done)return;
if(e.code===4410){sharerGone();return;}
if(got)return;
if(e.code===4404)fail(phrase('view.nobody'));
else if(e.code===4429)fail(phrase('view.full'));
};
}
$('copytext').addEventListener('click',()=>{
navigator.clipboard.writeText($('received').textContent);
$('copytext').textContent=phrase('copy.done');
setTimeout(()=>{$('copytext').textContent=phrase('copy.text');},1500);
});
$('retry').addEventListener('click',()=>location.reload());
$('privacy-toggle').addEventListener('click',()=>{
const panel=$('privacy-panel');
const open=panel.hidden;
panel.hidden=!open;
$('privacy-toggle').setAttribute('aria-expanded',String(open));
});
const PLATFORM_HOSTS=/(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com|gstatic\.com|googleapis\.com|buymeacoffee\.com|cloudflareinsights\.com|google\.[a-z]{2,3}(\.[a-z]{2})?)$/;
const RENDEZVOUS_HOST=new URL(RENDEZVOUS.replace('wss:','https:')).hostname;
function monitorNetwork(){
const platform=new Set();
const external=new Set();
const inspect=(entries)=>{
for(const entry of entries){
if(entry.name.startsWith('blob:')||entry.name.startsWith('data:'))continue;
const url=new URL(entry.name,location.href);
if(url.origin===location.origin)continue;
if(url.hostname===RENDEZVOUS_HOST)continue;
if(PLATFORM_HOSTS.test(url.hostname))platform.add(url.hostname);
else external.add(url.hostname);
}
const total=performance.getEntriesByType('resource')
.filter((entry)=>!entry.name.startsWith('blob:')&&!entry.name.startsWith('data:')).length;
const clean=external.size===0;
const platformNote=platform.size
?phrase(platform.size===1?'net.platform.one':'net.platform.many',
{hosts:platform.size})
:'';
$('network-count').textContent=clean
?phrase('net.clean',{total,platform:platformNote})
:phrase('net.dirty',{hosts:[...external].join(', '),platform:platformNote});
$('network-count').className=clean?'good':'warn';
$('network-dot').className=`live-dot ${clean ? 'good' : 'warn'}`;
};
inspect(performance.getEntriesByType('resource'));
try{
new PerformanceObserver((list)=>inspect(list.getEntries()))
.observe({type:'resource',buffered:true});
}catch{
}
}
async function registerServiceWorker(){
const fail=(message,detail)=>{
$('offline-status').textContent=message;
$('offline-dot').className='live-dot';
if(detail){
$('offline-status').title=detail;
console.info('Offline caching unavailable:',detail);
}
};
if(!('serviceWorker'in navigator)){
fail(phrase('offline.none'));
return;
}
if(!window.isSecureContext){
fail(phrase('offline.insecure'));
return;
}
try{
await navigator.serviceWorker.register('sw.js');
await navigator.serviceWorker.ready;
$('offline-status').textContent=phrase('offline.ready');
$('offline-status').className='good';
$('offline-dot').className='live-dot good';
}catch(error){
fail(phrase('offline.failed'),error.message);
}
}
function bootError(detail){
const target=$('share').hidden?$('view-status'):$('status');
target.hidden=false;
target.classList.add('warn');
target.textContent=phrase('error.broke',{detail});
}
window.addEventListener('error',(event)=>bootError(event.message));
window.addEventListener('unhandledrejection',(event)=>bootError(event.reason?.message??event.reason));
const code=location.hash.replace(/^#/,'').toLowerCase();
if(CODE_PATTERN.test(code))view(code);
else{suggest();restore();}
addEventListener('hashchange',()=>location.reload());
const alternates=new Set(
[...document.querySelectorAll('link[rel="alternate"][hreflang]')]
.map((link)=>new URL(link.href).pathname),
);
addEventListener('click',(event)=>{
const anchor=event.target.closest('a[href]');
if(!anchor||anchor.origin!==location.origin||!alternates.has(anchor.pathname))return;
if($('share').hidden===false&&$('publish').hidden){
if(!window.confirm(phrase('share.leave-warning'))){
event.preventDefault();
return;
}
}
if(location.hash==='')return;
if(viewerLive){
try{sessionStorage.setItem(`share-text-carry:${code}`,String(Date.now()));}catch{}
}
anchor.href=anchor.pathname+location.hash;
},true);
monitorNetwork();
registerServiceWorker();
document.getElementById('boot-warning')?.remove();
