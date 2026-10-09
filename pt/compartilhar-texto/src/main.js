/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=276d0d224d';
import{wireHelpTooltip}from'./shared/help-tooltip.js?v=276d0d224d';
import{renderMarkdown}from'./markdown.js?v=276d0d224d';
import{CODE_PATTERN,formatSize,makeCode,normalize}from'./names.js?v=276d0d224d';
import{rtcConfig,makeShareUrl,isLocalLink,localDescription,allowedCandidate}from'./network.js?v=276d0d224d';
import{cleanFileList,beginFile,appendFileChunk,finishFile}from'./receive-file.js?v=276d0d224d';
import{watchDiscovery}from'./discovery.js?v=276d0d224d';
import{clipboardFeedback}from'./shared/clipboard-feedback.js?v=276d0d224d';
import{fileSender,FILE_CHANNEL}from'./send-file.js?v=276d0d224d';
const RENDEZVOUS='wss://rendezvous.abox.tools';
const RELAY_FLAG=(code)=>`share-text-relay:${code}`;
const RELAY_WAIT=5000;
const wsUrl=(code,role,advertise=false)=>`${RENDEZVOUS}/ws/${code}?role=${role}${advertise ? '&local=1&discover=1' : ''}`;
const shareUrl=(code)=>makeShareUrl(location.href,code,isLocal);
const MAX_FILE=200*1024*1024;
const MAX_FILES=256;
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
let isLocal=isLocalLink(location.href);
let isDiscoverable=false;
let discovery=null;
let discoveryState='connecting';
let foundShares=[];
const withdrawing=new Set();
let announcementTimer=0;
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
linkCopy.invalidate();
isDiscoverable=false;
$('publish').hidden=false;
setShareState();
renderDiscovery();
$('code').disabled=false;
$('suggest').disabled=false;
$('private').disabled=false;
$('local').disabled=false;
$('discoverable').disabled=!$('local').checked;
$('discovery-share-status').textContent='';
$('stop').hidden=true;
$('linkrow').hidden=true;
$('requests').textContent='';
pending.clear();
}
function setShareState(key=''){
$('share-state').hidden=!key;
$('share-state').textContent=key?phrase(key):'';
}
function setStatus(text,warn=false){
$('status').textContent=text;
$('status').classList.toggle('warn',warn);
}
function refreshCount(){
if(!$('publish').hidden)return;
const n=channels.size;
const w=pending.size;
if(n===0&&w===0){
setStatus(phrase(isLocal?'share.local-waiting':'share.waiting'));
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
try{dc.send(JSON.stringify({type:'asked'}));}catch{}
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
sendQueue.get(id)?.close();
sendQueue.delete(id);
removeRequest(id);
refreshCount();
}
function broadcast(){
if($('publish').hidden===false)return;
for(const dc of channels.values()){try{dc.send(payload());}catch{}}
}
const filesMsg=()=>JSON.stringify({
type:'files',fileChannels:true,
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
function renderDiscovery(){
const hosting=$('publish').hidden;
$('discovery').hidden=hosting;
const ownCode=hosting?normalize($('code').value):'';
const shares=foundShares.filter((share)=>share.code!==ownCode&&!withdrawing.has(share.code));
const list=$('discovery-list');
list.textContent='';
for(const[index,share]of shares.entries()){
const row=document.createElement('div');
row.className='discovery-row';
const name=document.createElement('span');
name.className='discovery-code';
name.id=`discovery-code-${index}`;
name.textContent=share.code;
const open=document.createElement('a');
open.className='discovery-open';
open.href=makeShareUrl(location.href,share.code,true);
open.target='_blank';
open.rel='noopener';
open.setAttribute('aria-describedby',name.id);
open.textContent=phrase('discovery.open');
row.append(name,open);
list.append(row);
}
const state=discoveryState==='ready'?(shares.length?'ready':'empty'):discoveryState;
$('discovery-status').textContent=phrase(`discovery.${state}`);
}
function startDiscovery(){
discovery=watchDiscovery(`${RENDEZVOUS}/discover`,{
list(shares){
for(const code of withdrawing){
if(!shares.some((share)=>share.code===code))withdrawing.delete(code);
}
foundShares=shares;
renderDiscovery();
},
status(state){discoveryState=state;renderDiscovery();},
publication(state){
$('discovery-share-status').textContent=state&&isDiscoverable&&$('publish').hidden
?phrase(`discovery.${state}`):'';
},
});
$('discovery-refresh').addEventListener('click',()=>discovery.refresh());
}
$('local').addEventListener('change',()=>{
$('discoverable').disabled=!$('local').checked;
});
wireHelpTooltip($('discoverable-help'));
wireHelpTooltip($('tool-version-help'));
function hostSocket(code,onOpen){
const ws=new WebSocket(wsUrl(code,'host',isLocal&&isDiscoverable));
sock=ws;
let pulse=0;
ws.onopen=()=>{
if(sock!==ws){ws.close(1000);return;}
pulse=setInterval(()=>{if(ws.readyState===1)ws.send('ping');},30000);
keepalive=pulse;
setShareState('share.active');
onOpen();
if(isDiscoverable){
$('discovery-share-status').textContent=phrase('discovery.publishing');
announcementTimer=setTimeout(()=>{
if(sock===ws&&isDiscoverable)$('discovery-share-status').textContent=phrase('discovery.not-published');
},8000);
}
};
ws.onmessage=(e)=>{
if(sock!==ws)return;
if(e.data==='pong')return;
const m=JSON.parse(e.data);
if(m.type==='host-ready'&&isLocal&&isDiscoverable&&m.discovery?.code===code){
if(discovery?.publish(code,m.discovery.lease))clearTimeout(announcementTimer);
return;
}
if(m.type==='leave'){
dropViewer(m.id);
return;
}
if(m.type==='signal')hostSignal(m.from,m.data);
};
ws.onclose=(e)=>{
clearInterval(pulse);
if(sock!==ws)return;
clearTimeout(announcementTimer);
discovery?.unpublish();
if(e.code===4409){
withdrawing.delete(code);
if($('code').value===suggestion&&attempts<3){attempts+=1;suggest();publish();return;}
unlock();
setStatus(phrase('share.name-taken',{name:$('code').value}));
return;
}
if(e.code===1000||$('publish').hidden===false)return;
setStatus(phrase('share.lost-rendezvous'),true);
setTimeout(()=>{
if($('publish').hidden&&sock===ws)hostSocket(code,refreshCount);
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
isLocal=$('local').checked;
$('local').disabled=true;
isDiscoverable=isLocal&&$('discoverable').checked;
$('discoverable').disabled=true;
$('publish').hidden=true;
setShareState('share.setting-up');
renderDiscovery();
setStatus('');
try{
hostSocket(code,()=>{
attempts=0;
linkCopy.invalidate();
$('link').value=shareUrl(code);
$('linkrow').hidden=false;
$('stop').hidden=false;
refreshCount();
});
}catch(error){
unlock();
throw error;
}
}
async function hostSignal(from,data){
if(!data||typeof data!=='object')return;
if((data.local===true)!==isLocal){
if(sock.readyState===1)sock.send(JSON.stringify({to:from,data:{networkMode:isLocal?'local':'direct'}}));
return;
}
if(data.candidate&&!allowedCandidate(data.candidate,isLocal))return;
let pc=peers.get(from);
if(!pc){
pc=new RTCPeerConnection(rtcConfig(isLocal));
peers.set(from,pc);
pc.onicecandidate=(e)=>{
if(e.candidate&&allowedCandidate(e.candidate,isLocal)&&sock.readyState===1)sock.send(JSON.stringify({to:from,data:{candidate:e.candidate,local:isLocal}}));
};
let mainChannel=null;
pc.ondatachannel=(e)=>{
const dc=e.channel;
if(dc.label!=='share'||mainChannel||peers.get(from)!==pc){dc.close();return;}
mainChannel=dc;
const sender=fileSender({peer:pc,control:dc,files:attached,
admitted:()=>channels.get(from)===dc&&peers.get(from)===pc});
sendQueue.set(from,sender);
dc.binaryType='arraybuffer';
let introduced=false;
const introduce=()=>{
if(introduced||dc.readyState!=='open')return;
introduced=true;
if(isPrivate){dc.send(JSON.stringify({type:'private'}));refreshCount();}
else admitViewer(from,dc);
};
dc.onopen=introduce;
dc.onmessage=(ev)=>{
if(typeof ev.data!=='string')return;
let m;
try{m=JSON.parse(ev.data);}catch{return;}
if(!m||typeof m!=='object')return;
if(m.type==='hello'){
if(!introduced)introduce();
else if(channels.has(from)){dc.send(payload());dc.send(filesMsg());}
else dc.send(JSON.stringify({type:'private'}));
return;
}
if(m.type==='get'){sender.request(m);return;}
if(m.type==='cancel-file'){sender.cancel(m.request);return;}
if(m.type==='knock'&&isPrivate&&!channels.has(from)&&!pending.has(from)){
if(typeof m.token==='string'&&admitTokens.has(m.token)){
admitViewer(from,dc);
return;
}
addRequest(from,dc,String(m.note??'').slice(0,200));
}
};
dc.onclose=()=>dropViewer(from);
introduce();
};
}
try{
if(data.sdp){
await pc.setRemoteDescription(isLocal?localDescription(data.sdp):data.sdp);
await pc.setLocalDescription(await pc.createAnswer());
sock.send(JSON.stringify({to:from,data:{sdp:pc.localDescription,local:isLocal}}));
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
if(attached.size>=MAX_FILES){
setStatus(phrase('share.too-many-files'));
break;
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
clearTimeout(announcementTimer);
const stoppedCode=normalize($('code').value);
if(isDiscoverable)withdrawing.add(stoppedCode);
discovery?.unpublish();
isDiscoverable=false;
foundShares=foundShares.filter((share)=>share.code!==stoppedCode);
sock?.close(1000);
clearInterval(keepalive);
for(const sender of sendQueue.values())sender.close();
for(const pc of peers.values())pc.close();
peers.clear();channels.clear();sendQueue.clear();
unlock();
setStatus(phrase('share.stopped'));
});
$('suggest').addEventListener('click',suggest);
const linkCopy=clipboardFeedback({
read:()=>({text:$('link').value,owner:sock}),
current:value=>value.owner===sock&&value.text===$('link').value&&!$('linkrow').hidden,
write:text=>navigator.clipboard.writeText(text),
done:()=>{$('copylink').textContent=phrase('copy.done');},
selected:()=>{
$('link').focus();$('link').select();
$('copylink').textContent=phrase('copy.select');
},
restore:()=>{$('copylink').textContent=phrase('copy.link');},
});
$('copylink').addEventListener('click',()=>{void linkCopy.copy();});
let textVersion=0;
const textCopy=clipboardFeedback({
read:()=>({text:$('received').textContent,version:textVersion}),
current:value=>value.version===textVersion&&value.text===$('received').textContent&&!$('panel').hidden,
write:text=>navigator.clipboard.writeText(text),
done:()=>{$('copytext').textContent=phrase('copy.done');},
selected:()=>{
$('mode-src').click();
const source=$('received');source.tabIndex=-1;source.focus();
const range=document.createRange();range.selectNodeContents(source);
const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
$('copytext').textContent=phrase('copy.select');
},
restore:()=>{$('copytext').textContent=phrase('copy.text');},
});
function retireTextCopy(){textVersion+=1;textCopy.invalidate();}
$('copytext').addEventListener('click',()=>{void textCopy.copy();});
function fail(text){
if($('received').hidden===false)return;
$('consent').hidden=true;
$('relayrow').hidden=true;
$('retryrow').hidden=false;
$('view-status').textContent=text;
}
let viewerLive=false;
function view(code){
$('share').hidden=true;
$('view').hidden=false;
const localMode=isLocalLink(location.href);
$('local-note').hidden=!localMode;
let retryLocal=localMode;
let carried=false;
let wantRelay=false;
try{
const stamp=Number(sessionStorage.getItem(`share-text-carry:${code}`)??0);
carried=Date.now()-stamp<5*60*1000;
sessionStorage.removeItem(`share-text-carry:${code}`);
wantRelay=!localMode&&carried&&sessionStorage.getItem(RELAY_FLAG(code))==='1';
sessionStorage.removeItem(RELAY_FLAG(code));
}catch{}
const ws=new WebSocket(wsUrl(code,'viewer'));
let pc=null;
let dcRef=null;
let relay=null;
let relayReply=null;
let got=false;
let connected=false;
let done=false;
let introduced=false;
let viewerKeepalive=0;
let lastBody='';
let asMd=false;
let mdTouched=false;
let rx=null;
let fileChannels=false;
let offered=new Map();
let connectionTimer=0;
let deliveryTimer=0;
const clearDeadlines=()=>{
clearTimeout(connectionTimer);
clearTimeout(deliveryTimer);
};
const stopAttempt=(key,offerRelay=false)=>{
if(done)return;
done=true;
viewerLive=false;
clearDeadlines();
clearInterval(viewerKeepalive);
pc?.close();
ws.close();
$('knockrow').hidden=true;
$('view-status').hidden=false;
fail(phrase(key));
$('relayrow').hidden=localMode||!offerRelay;
};
const awaitIntroduction=()=>{
clearTimeout(deliveryTimer);
deliveryTimer=setTimeout(()=>stopAttempt('view.no-content'),20000);
};
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
function refreshFileButtons(){
for(const button of $('filelist').querySelectorAll('button')){
button.disabled=done||(button.hasAttribute('data-file-download')&&rx!==null);
}
}
function retireFile(owner){
if(rx!==owner)return false;
rx=null;
clearTimeout(owner.timer);
owner.parts=[];
owner.cancel.hidden=true;
if(owner.request){
try{dcRef?.send(JSON.stringify({type:'cancel-file',request:owner.request}));}catch{}
owner.channel?.close();
}
refreshFileButtons();
return true;
}
function waitingForFile(owner){
clearTimeout(owner.timer);
owner.timer=setTimeout(()=>{if(rx===owner)fileFailed(owner);},30000);
}
function legacyFileFailure(key){
done=true;
viewerLive=false;
clearDeadlines();
clearInterval(viewerKeepalive);
lastBody='';
retireTextCopy();
$('received').textContent='';
$('rendered').textContent='';
$('panel').hidden=true;
pc?.close();
ws.close(1000);
for(const button of $('filelist').querySelectorAll('button'))button.disabled=true;
$('view-status').hidden=false;
$('view-status').textContent=phrase(key);
$('retryrow').hidden=false;
}
function startFile(file,controls){
if(rx||done||dcRef?.readyState!=='open'||!offered.has(file.id))return;
const owner={...file,...controls,mime:'',parts:[],got:0,
request:fileChannels?crypto.randomUUID():null,channel:null,timer:null};
rx=owner;
owner.status.textContent='';
owner.btn.textContent='0%';
owner.cancel.hidden=false;
refreshFileButtons();
waitingForFile(owner);
try{dcRef.send(JSON.stringify({type:'get',id:file.id,
...(owner.request?{request:owner.request}:{})}));}
catch{fileFailed(owner);}
}
function renderFilelist(list,capability){
const files=cleanFileList(list,MAX_FILE);
offered=new Map(files.map(file=>[file.id,file]));
fileChannels=capability===true;
if(rx){
const file=offered.get(rx.id);
if(!file||file.name!==rx.name||file.size!==rx.size)fileGone(rx);
}
const box=$('filelist');
box.replaceChildren();
for(const file of files){
if(rx?.id===file.id){box.append(rx.row);continue;}
const row=document.createElement('div');row.className='filerow';
const name=document.createElement('span');name.className='fname';name.textContent=file.name;
name.id='file-'+crypto.randomUUID();
const size=document.createElement('span');size.className='fsize';size.textContent=fmtSize(file.size);
const btn=document.createElement('button');btn.type='button';btn.className='ghost';
btn.dataset.fileDownload='';btn.textContent=phrase('view.download');
btn.setAttribute('aria-describedby',name.id);
const cancel=document.createElement('button');cancel.type='button';cancel.className='ghost';
cancel.textContent=phrase('view.file-cancel');cancel.hidden=true;
cancel.setAttribute('aria-describedby',name.id);
const status=document.createElement('span');status.className='file-status';
status.setAttribute('role','status');status.setAttribute('aria-live','polite');
btn.onclick=()=>startFile(file,{row,btn,cancel,status});
cancel.onclick=()=>{
const owner=rx;
if(!owner||owner.row!==row)return;
const modern=!!owner.request;
retireFile(owner);
owner.btn.textContent=phrase('view.file-retry');
owner.status.textContent=phrase('view.file-cancelled');
if(!modern)legacyFileFailure('view.file-legacy-cancel');
else owner.btn.focus({preventScroll:true});
};
row.append(name,size,btn,cancel,status);box.append(row);
}
refreshFileButtons();
}
function fileBegin(msg,owner=rx){
if(!owner||rx!==owner)return;
if(!beginFile(owner,msg,MAX_FILE)){fileFailed(owner);return;}
waitingForFile(owner);
}
function fileChunk(buf,owner=rx){
if(!owner||rx!==owner)return;
if(!appendFileChunk(owner,buf,MAX_FILE)){fileFailed(owner);return;}
waitingForFile(owner);
if(owner.size>0)owner.btn.textContent=`${Math.min(99, Math.floor((owner.got / owner.size) * 100))}%`;
}
function fileEnd(msg,owner=rx){
if(!owner||rx!==owner)return;
if(!finishFile(owner,msg)){fileFailed(owner);return;}
let url;
try{
const blob=new Blob(owner.parts,{type:owner.mime});
url=URL.createObjectURL(blob);
const anchor=document.createElement('a');anchor.href=url;
anchor.download=owner.name===''?'shared-file':owner.name;anchor.click();
}catch{
if(url)URL.revokeObjectURL(url);
fileFailed(owner);return;
}
retireFile(owner);
setTimeout(()=>URL.revokeObjectURL(url),5000);
owner.btn.textContent=phrase('view.download');
owner.status.textContent='';
}
function fileGone(owner=rx){
if(!owner||rx!==owner)return;
const modern=!!owner.request;
retireFile(owner);
owner.btn.textContent=phrase('view.file-gone');owner.btn.disabled=true;
if(!modern)legacyFileFailure('view.file-legacy-failed');
}
function fileFailed(owner=rx){
if(!owner||rx!==owner)return;
const modern=!!owner.request;
retireFile(owner);
owner.status.textContent=phrase('view.file-failed');
owner.btn.textContent=phrase('view.file-retry');
if(!modern)legacyFileFailure('view.file-legacy-failed');
}
function receiveFileChannel(channel){
const owner=rx;
if(!owner?.request||done||channel.label!==FILE_CHANNEL+owner.request||owner.channel){
channel.close();return;
}
owner.channel=channel;channel.binaryType='arraybuffer';
channel.onmessage=event=>{
if(rx!==owner)return;
if(typeof event.data!=='string'){fileChunk(event.data,owner);return;}
let message;
try{message=JSON.parse(event.data);}catch{fileFailed(owner);return;}
if(message?.type==='file-begin')fileBegin(message,owner);
else if(message?.type==='file-end')fileEnd(message,owner);
else if(message?.type==='file-gone')fileGone(owner);
else fileFailed(owner);
};
channel.onclose=()=>{if(rx===owner)fileFailed(owner);};
channel.onerror=()=>{if(rx===owner)fileFailed(owner);};
waitingForFile(owner);
}
const sharerGone=()=>{
if(done)return;
done=true;
viewerLive=false;
clearDeadlines();
clearInterval(viewerKeepalive);
$('knockrow').hidden=true;
if(rx)retireFile(rx);
offered.clear();
$('filelist').textContent='';
if(got){
lastBody='';
retireTextCopy();
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
$('view-status').textContent=phrase(localMode?'view.local-connecting':relay?'view.relaying':'view.connecting');
pc=new RTCPeerConnection(rtcConfig(localMode,relay));
connectionTimer=setTimeout(()=>{
if(!connected)stopAttempt(localMode?'view.local-no-connect':relay?'view.relay-failed':'view.no-connect',!localMode&&!relay);
},20000);
pc.onicecandidate=(ev)=>{
if(ev.candidate&&allowedCandidate(ev.candidate,localMode)&&ws.readyState===1)ws.send(JSON.stringify({data:{candidate:ev.candidate,local:localMode}}));
};
pc.onconnectionstatechange=()=>{
if(connected&&(pc.connectionState==='failed'||pc.connectionState==='closed'))sharerGone();
};
const giveUp=()=>{
if(got||connected||done)return;
stopAttempt(localMode?'view.local-no-connect':relay?'view.relay-failed':'view.no-connect',!localMode&&!relay);
};
pc.oniceconnectionstatechange=()=>{
if(pc.iceConnectionState==='failed')giveUp();
};
pc.ondatachannel=event=>receiveFileChannel(event.channel);
const dc=pc.createDataChannel('share');
dc.binaryType='arraybuffer';
dcRef=dc;
const opened=()=>{
if(connected||done)return;
connected=true;
viewerLive=true;
clearTimeout(connectionTimer);
if(!introduced){
$('view-status').textContent=phrase('view.waiting-content');
awaitIntroduction();
}
dc.send(JSON.stringify({type:'hello'}));
};
dc.onopen=opened;
dc.onmessage=(ev)=>{
if(done)return;
if(typeof ev.data!=='string'){if(!rx?.request)fileChunk(ev.data);return;}
let msg;
try{msg=JSON.parse(ev.data);}catch{return;}
if(!msg||typeof msg!=='object')return;
if(msg.type==='files'){renderFilelist(msg.list??[],msg.fileChannels);return;}
if(msg.type==='file-begin'){if(!rx?.request)fileBegin(msg);return;}
if(msg.type==='file-end'){if(!rx?.request)fileEnd(msg);return;}
if(msg.type==='file-gone'){
if(rx?.id===msg.id&&(!rx.request||msg.request===rx.request))fileGone();
return;
}
if(msg.type==='file-failed'){
if(rx?.id===msg.id&&(!rx.request||msg.request===rx.request))fileFailed();
return;
}
if(msg.type==='token'){
try{sessionStorage.setItem(`share-text-token:${code}`,String(msg.token));}catch{}
return;
}
if(msg.type==='private'){
if(got)return;
introduced=true;
clearDeadlines();
let token=null;
try{token=carried?sessionStorage.getItem(`share-text-token:${code}`):null;}catch{}
if(token!==null){
awaitIntroduction();
dc.send(JSON.stringify({type:'knock',note:'',token}));
return;
}
$('view-status').textContent=phrase('view.private');
$('knockrow').hidden=false;
$('knock').focus();
return;
}
if(msg.type==='asked'){
introduced=true;
clearDeadlines();
$('view-status').textContent=phrase('view.asked');
return;
}
if(msg.type==='denied'){
done=true;
viewerLive=false;
clearDeadlines();
$('knockrow').hidden=true;
$('view-status').textContent=phrase('view.denied');
$('retryrow').hidden=false;
return;
}
if(msg.type!=='text'||done)return;
got=true;
introduced=true;
clearDeadlines();
retireTextCopy();
lastBody=String(msg.body??'');
if(!mdTouched)asMd=msg.md===true;
renderView();
$('knockrow').hidden=true;
$('view-status').hidden=lastBody!=='';
if(lastBody==='')$('view-status').textContent=phrase('view.empty');
};
dc.onclose=sharerGone;
if(dc.readyState==='open')opened();
await pc.setLocalDescription(await pc.createOffer());
if(done)return;
ws.send(JSON.stringify({data:{sdp:pc.localDescription,local:localMode}}));
}
function askRelay(){
if(localMode)return Promise.resolve(null);
return new Promise((resolve)=>{
relayReply=resolve;
setTimeout(()=>resolve(null),RELAY_WAIT);
ws.send(JSON.stringify({relay:true}));
});
}
async function relayDial(){
relay=await askRelay();
relayReply=null;
if(relay===null){fail(phrase('view.relay-none'));return;}
await dial();
}
$('connect').addEventListener('click',()=>{
dial().catch(()=>stopAttempt('view.error'));
});
$('relay').addEventListener('click',()=>{
if(localMode)return;
try{
sessionStorage.setItem(`share-text-carry:${code}`,String(Date.now()));
sessionStorage.setItem(RELAY_FLAG(code),'1');
}catch{
stopAttempt('view.error');
return;
}
location.reload();
});
$('mode-retry').addEventListener('click',()=>{
location.href=makeShareUrl(location.href,code,retryLocal);
});
ws.onopen=()=>{viewerKeepalive=setInterval(()=>{if(ws.readyState===1)ws.send('ping');},30000);};
ws.onmessage=async(e)=>{
if(e.data==='pong')return;
const m=JSON.parse(e.data);
try{
if(m.type==='ready'){
if(wantRelay){
$('consent').hidden=true;
$('view-status').textContent=phrase('view.relaying');
await relayDial();
}else if(carried){
await dial();
}else{
$('view-status').textContent=phrase('view.someone');
$('consent').hidden=false;
}
}else if(m.type==='relay'&&!localMode&&relayReply!==null){
const entry=m.iceServers?.find?.((s)=>typeof s?.username==='string'&&typeof s?.credential==='string');
relayReply(entry??null);
}else if(m.type==='signal'&&pc&&!done){
const mode=m.data.networkMode;
if(mode==='local'||mode==='direct'||(localMode&&m.data.sdp&&m.data.local!==true)){
retryLocal=mode==='local';
stopAttempt(retryLocal?'view.mode-local':'view.mode-direct');
$('mode-retryrow').hidden=false;
return;
}
if(m.data.sdp)await pc.setRemoteDescription(localMode?localDescription(m.data.sdp):m.data.sdp);
else if(m.data.candidate&&allowedCandidate(m.data.candidate,localMode))await pc.addIceCandidate(m.data.candidate);
}
}catch{
if(!done&&!got)stopAttempt('view.error');
}
};
ws.onclose=(e)=>{
clearInterval(viewerKeepalive);
if(done)return;
if(e.code===4410){sharerGone();return;}
if(got)return;
if(e.code===4404)stopAttempt('view.nobody');
else if(e.code===4429)stopAttempt('view.full');
else if(!connected)stopAttempt('view.error');
};
}
$('retry').addEventListener('click',()=>location.reload());
$('privacy-toggle').addEventListener('click',()=>{
const panel=$('privacy-panel');
const open=panel.hidden;
panel.hidden=!open;
$('privacy-toggle').setAttribute('aria-expanded',String(open));
});
function bootError(detail){
const target=$('share').hidden?$('view-status'):$('status');
target.hidden=false;
target.classList.add('warn');
target.textContent=phrase('error.broke',{detail});
}
window.addEventListener('error',(event)=>bootError(event.message));
window.addEventListener('unhandledrejection',(event)=>bootError(event.reason?.message??event.reason));
const code=location.hash.replace(/^#/,'').toLowerCase();
$('local').checked=isLocal;
if(CODE_PATTERN.test(code))view(code);
else{
$('discoverable').disabled=!isLocal;
suggest();
restore();
startDiscovery();
}
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
anchor.href=makeShareUrl(anchor.href,code,isLocalLink(location.href));
},true);
document.getElementById('boot-warning')?.remove();
