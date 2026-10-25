/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{transportMode,peerConfiguration,transportCandidate,transportDescription,
selectedTransport,RelayCredentials}from'./peer-transport.js?v=1439a1c7a1';
import{PairingSocket}from'./peer-pairing.js?v=1439a1c7a1';
import{rendezvousEndpoint}from'./peer-endpoint.js?v=1439a1c7a1';
import{groupUrl}from'./discovery-group.js?v=1439a1c7a1';
const INTERVAL=1000;
const DEADLINE=10000;
const KEEPALIVE=30000;
const MAX_ICE=128;
const captureAudioSessions=new WeakMap();
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const realClock={now:()=>Date.now(),
setTimeout:(fn,delay)=>globalThis.setTimeout(fn,delay),
clearTimeout:timer=>globalThis.clearTimeout(timer)};
const uuid=()=>{
const bytes=crypto.getRandomValues(new Uint8Array(16));
bytes[6]=(bytes[6]&15)|64;
bytes[8]=(bytes[8]&63)|128;
const hex=Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
return`${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
class VoiceSession{
constructor({role,code,key,listenKey,clientKey,requireApproval,mode='broadcast',transport='direct',roomName='',discover=false,discoveryGroup=null,passwordProof=null,name='',
onState=()=>{},onStream=()=>{},onParticipants=()=>{},onRequests=()=>{},
Socket=globalThis.WebSocket,Peer=globalThis.RTCPeerConnection,
mediaDevices=globalThis.navigator?.mediaDevices,audioSession=globalThis.navigator?.audioSession,clock=realClock,
origin=rendezvousEndpoint(),endpoint}){
this.role=role;
this.code=code;
this.key=key;
this.listenKey=listenKey;
this.clientKey=clientKey;
this.requireApproval=requireApproval;
this.onRequests=onRequests;
this._requests=new Map();
this._approval=null;
this._awaitingApproval=false;
this.roomName=roomName;
this.discover=discover===true;
this.passwordProof=passwordProof;
this.name=name;
this.transport=transportMode(transport);
this.onParticipants=onParticipants;
this._inbox=mode==='inbox';
this._client=role!=='host';
this._source=this._inbox?role==='sender':role==='host';
this._receiver=!this._source;
this._validId=value=>this._inbox?/^[0-9a-f]{64}$/.test(value||''):UUID.test(value||'');
this._muted=false;
this._discovery=null;
this._participants=new Map();
this._policies=new Map();
this._controls=new Map();
this._controlFlight=null;
this._retiring=new Map();
this._activeInbox=new Map();
this.onState=onState;
this.onStream=onStream;
this._Socket=Socket;
this._Peer=Peer;
this._mediaDevices=mediaDevices;
this._audioSession=audioSession;
this._captureInterruption=null;
this._captureAudioLease=null;
this._captureState=this._source?'ready':null;
this._captureRecovery=null;
this._captureOpening=null;
this._captureBroken=false;
this._clock=clock;
const url=new URL(endpoint||origin);
url.pathname=`/${this._inbox ? 'inbox' : 'broadcast'}/${code}`;
url.search=url.hash='';
this._endpoint=groupUrl(url.href,role==='host'?discoveryGroup:null);
this._active=false;
this._epoch=0;
this._socket=null;
this._tickTimer=this._retryTimer=null;
this._failures=0;
this._generation=this._id=null;
this._waiting=true;
this._offerAt=0;
this._talking=this._remoteTalking=false;
this._stream=this._activePeer=null;
this._peers=new Map();
this._preparingPeers=new Map();
this._hostIds=new Set();
this._orphanIce=[];
this._resolveStart=null;
}
async start(){
this.stop({notify:false,state:null});
const epoch=++this._epoch;
this._active=true;
this._failures=0;
this._waiting=true;
this._state(this.role==='host'?'host-starting':'listener-connecting');
if(!this.transport||!/^[0-9a-f]{64}$/.test(this.code||'')||!/^[A-Za-z0-9_-]{43}$/.test(this.key||'')||
!(this._inbox?['host','sender']:['host','listener']).includes(this.role)||
(!this._inbox&&this.role==='host'&&!/^[A-Za-z0-9_-]{43}$/.test(this.listenKey||''))||
(this.requireApproval!==undefined&&(this.role!=='host'||typeof this.requireApproval!=='boolean'))||
(this.clientKey!==undefined&&(this._inbox||!this._client||!/^[A-Za-z0-9_-]{43}$/.test(this.clientKey)))||
(this._inbox&&this.passwordProof!==null&&!/^[A-Za-z0-9_-]{43}$/.test(this.passwordProof||''))||
(this._inbox&&this.role==='host'&&(typeof this.roomName!=='string'||!this.roomName.trim()||this.roomName.length>80))||
(this._inbox&&this._client&&(typeof this.name!=='string'||this.name.length>64))||
(!this._inbox&&this.discover&&(this.role!=='host'||this.key===this.listenKey
||typeof this.roomName!=='string'||!this.roomName.trim()||this.roomName.length>80
||/[\u0000-\u001f\u007f-\u009f]/.test(this.roomName)))){
this._finish('error-access');
return false;
}
if(this._source&&!this._client&&!await this._acquireCapture(epoch))return false;
if(!this._live(epoch))return false;
const started=new Promise(resolve=>{this._resolveStart=resolve;});
this._connect(epoch);
this._scheduleTick(epoch);
const result=await started;
return result&&this._live(epoch);
}
_acquireCapture(epoch){
if(this._stream)return Promise.resolve(true);
if(this._captureOpening)return this._captureOpening;
const opening=this._openCapture(epoch);
this._captureOpening=opening;
void opening.finally(()=>{if(this._captureOpening===opening)this._captureOpening=null;});
return opening;
}
async _openCapture(epoch){
this._claimCaptureAudioSession();
let stream;
try{stream=await this._mediaDevices.getUserMedia({audio:true,video:false});}
catch{
if(this._live(epoch))this._finish('error-microphone');
return false;
}
if(!this._live(epoch)){
this._stopCaptureStream(stream);
return false;
}
for(const track of stream.getTracks())track.enabled=false;
if(!this._usableCapture(stream)){
this._stopCaptureStream(stream);
this._finish('error-microphone');
return false;
}
this._installCapture(stream,epoch);
const native=this._audioSession;
if(typeof native?.addEventListener==='function'&&typeof native?.removeEventListener==='function'){
this._captureInterruption=()=>{if(this._live(epoch))this._syncCaptureState();};
native.addEventListener('statechange',this._captureInterruption);
}
if(native?.state==='interrupted')this._finish('error-microphone');
return this._live(epoch);
}
setTalking(talking){
if(!this._active||!this._source||!this._stream)return;
if(talking&&(this._muted||this._captureRecovery||this._readCaptureState()!=='ready'))return;
if(talking&&!this._canSignal()&&!this._connected().length)return;
this._talking=Boolean(talking);
for(const track of this._stream.getAudioTracks())track.enabled=this._talking;
if(this._canSignal())this._send({type:'status',generation:this._generation,
talking:this._talking});
this._voiceState();
}
_claimCaptureAudioSession(){
const native=this._audioSession;
if(!native)return;
try{
let lease=captureAudioSessions.get(native);
if(native.type!=='play-and-record'&&typeof native.type==='string'){
const previous=native.type;
native.type='play-and-record';
if(native.type==='play-and-record'){
lease={previous,owners:new Set()};
captureAudioSessions.set(native,lease);
}
}
if(lease&&native.type==='play-and-record'){
lease.owners.add(this);
this._captureAudioLease=lease;
}
}catch{}
}
_releaseCaptureAudioSession(){
const native=this._audioSession;
const lease=this._captureAudioLease;
this._captureAudioLease=null;
if(!lease)return;
lease.owners.delete(this);
if(captureAudioSessions.get(native)!==lease||lease.owners.size)return;
captureAudioSessions.delete(native);
try{
if(native.type==='play-and-record')native.type=lease.previous;
}catch{}
}
_stopCaptureStream(stream){
for(const track of stream.getTracks()){
track.onended=track.onmute=track.onunmute=null;
track.enabled=false;
track.stop();
}
}
_usableCapture(stream){
const tracks=stream.getAudioTracks();
return tracks.length>0&&tracks.every(track=>!track.muted&&track.readyState!=='ended');
}
_readCaptureState(){
const tracks=this._stream?.getAudioTracks()||[];
if(this._captureBroken||!tracks.length||tracks.some(track=>track.readyState==='ended'))return'ended';
if(this._audioSession?.state==='interrupted'||tracks.some(track=>track.muted))return'interrupted';
return'ready';
}
_installCapture(stream,epoch){
this._stream=stream;
const changed=()=>{
if(this._live(epoch)&&this._stream===stream)this._syncCaptureState();
};
for(const track of stream.getAudioTracks()){
track.enabled=false;
track.onended=track.onmute=track.onunmute=changed;
}
this._captureState=this._readCaptureState();
}
_syncCaptureState(){
if(!this._active||!this._source||!this._stream)return;
const state=this._readCaptureState();
if(this._captureRecovery&&state==='ready')return;
this._captureState=state;
if(state!=='ready')this.setTalking(false);
else this._voiceState();
}
resumeCapture(){
if(!this._active||!this._source||!this._stream)return Promise.resolve(false);
if(this._captureRecovery)return this._captureRecovery.promise;
if(this._readCaptureState()==='ready')return Promise.resolve(true);
const flight={epoch:this._epoch,stream:null,promise:null};
this._captureRecovery=flight;
flight.promise=Promise.resolve().then(()=>this._replaceCapture(flight))
.then(result=>result&&this._live(flight.epoch));
return flight.promise;
}
_captureSenders(){
return[...new Set([...this._peers.values(),...this._retiring.values()])]
.filter(peer=>this._current(peer))
.flatMap(peer=>peer.pc.getSenders().filter(sender=>sender.track?.kind==='audio')
.map(sender=>({peer,sender,track:sender.track})));
}
async _replaceCapture(flight){
const current=()=>this._live(flight.epoch)&&this._captureRecovery===flight;
const changed=[];
try{
if(!current())return false;
this.setTalking(false);
if(!current())return false;
const stream=await this._mediaDevices.getUserMedia({audio:true,video:false});
for(const track of stream.getTracks())track.enabled=false;
if(!current()){
this._stopCaptureStream(stream);
return false;
}
flight.stream=stream;
if(!this._usableCapture(stream)||this._audioSession?.state==='interrupted')return false;
const track=stream.getAudioTracks()[0];
const seen=new Set();
for(;;){
const batch=this._captureSenders().filter(item=>!seen.has(item.sender));
if(!batch.length)break;
for(const item of batch){seen.add(item.sender);changed.push(item);}
const results=await Promise.allSettled(batch.map(async item=>item.sender.replaceTrack(track)));
if(!current())return false;
if(results.some((result,index)=>result.status==='rejected'&&this._current(batch[index].peer))){
throw new Error('Capture replacement failed.');
}
}
if(!this._usableCapture(stream)||this._audioSession?.state==='interrupted'){
throw new Error('Capture became unavailable during replacement.');
}
this._stopCaptureStream(this._stream);
this._captureBroken=false;
this._installCapture(stream,flight.epoch);
flight.stream=null;
return true;
}catch{
if(current()&&changed.length){
const rollback=changed.filter(item=>this._current(item.peer));
const results=await Promise.allSettled(rollback.map(async item=>item.sender.replaceTrack(item.track)));
if(current()&&results.some((result,index)=>result.status==='rejected'&&this._current(rollback[index].peer))){
this._captureBroken=true;
}
}
return false;
}finally{
if(flight.stream){
this._stopCaptureStream(flight.stream);
flight.stream=null;
}
if(current()){
this._captureRecovery=null;
this._syncCaptureState();
}
}
}
stop({notify=true,
state=this.role==='host'?'broadcast-ended':'listener-left'}={}){
if(notify&&this._active&&this._socket?.auth){
this._send(this.role==='host'?{type:'end',generation:this._generation}:{type:'leave'});
}
this._active=false;
++this._epoch;
this._clock.clearTimeout(this._tickTimer);
this._clock.clearTimeout(this._retryTimer);
this._tickTimer=this._retryTimer=null;
if(this._captureInterruption){
this._audioSession.removeEventListener('statechange',this._captureInterruption);
this._captureInterruption=null;
}
if(this._captureRecovery?.stream){
this._stopCaptureStream(this._captureRecovery.stream);
this._captureRecovery.stream=null;
}
this._captureRecovery=null;
this._captureOpening=null;
this._closeSocket(this._socket);
this._socket=null;
for(const id of new Set([...this._peers.keys(),...this._retiring.keys()]))this._drop(id);
this._hostIds.clear();
this._preparingPeers.clear();
this._orphanIce=[];
this._resetControlFlight();
this._controls.clear();
this._participants.clear();
this._requests.clear();
this._emitRequests();
this._approval=null;
this._awaitingApproval=false;
this._discovery=null;
this._emitParticipants();
if(this._stream){
this._stopCaptureStream(this._stream);
this._stream=null;
}
this._releaseCaptureAudioSession();
this._captureBroken=false;
this._captureState=this._source?'ready':null;
this._generation=this._id=null;
this._talking=this._remoteTalking=false;
this._waiting=true;
this._settleStart(false);
if(state)this._state(state);
}
_live(epoch){return this._active&&epoch===this._epoch;}
_currentSocket(ctx){return Boolean(ctx?.pairing.isCurrent());}
_current(peer){
return this._live(peer.epoch)&&(this._peers.get(peer.id)===peer||this._retiring.get(peer.id)===peer)&&peer.generation===this._generation;
}
_connected(){
const connected=[...this._peers.values(),...this._retiring.values()]
.filter(peer=>peer.pc.connectionState==='connected');
return connected.filter((peer,index)=>connected.findIndex(other=>other.id===peer.id)===index);
}
_canSignal(){return Boolean(this._socket?.auth&&!this._waiting&&this._socket.ws.readyState===1);}
_state(key,extra={}){
if(this._inbox)key=key.replace(/^listener-/,'sender-').replace('broadcast-ended','inbox-ended');
this.onState(key,{talking:this._source?this._talking:this._remoteTalking,
captureState:this._captureState,transport:this.transport,approval:this._approval,
route:this._connected().length&&this._connected().every(peer=>peer.route===this.transport)?this.transport:'unknown',
muted:this._muted,participants:this._participants.size,discovery:this._discovery,
listeners:this.role==='host'?this._connected().filter(p=>!p.departed).length:0,
signaling:this._canSignal(),waiting:this._waiting,directReady:this._connected().length>0,...extra});
}
_voiceState(){
if(!this._active)return;
if(this._client&&this._waiting){
this._state(this._awaitingApproval?'listener-approval':'listener-reconnecting');
return;
}
const usable=this.role==='host'?this._canSignal()||this._connected().length:this._connected().length;
this._state(usable?(this.role==='host'?
(this._talking?'host-talking':'host-ready'):
(this._inbox?(this._muted?'sender-muted':this._talking?'sender-talking':'sender-ready'):
this._remoteTalking?'listener-talking':'listener-listening')):
(this.role==='host'?'host-reconnecting':'listener-reconnecting'));
}
_settleStart(value){
const resolve=this._resolveStart;
this._resolveStart=null;
if(resolve)resolve(value);
}
_finish(key){this.stop({notify:false,state:key});}
_connect(epoch){
if(!this._live(epoch)||this._socket)return;
let ws;
try{ws=new this._Socket(this._endpoint);}
catch{this._voiceState();this._retry(epoch,1006);return;}
const ctx={ws,epoch,auth:false,pending:0,chain:Promise.resolve(),
pairing:null,unsentPing:false,lastPing:0};
this._socket=ctx;
ctx.pairing=new PairingSocket(ws,{
current:()=>this._live(epoch)&&this._socket===ctx,
clock:this._clock,maxBuffered:65536,
onSendError:()=>this._lost(ctx,1006),
});
if(this.transport==='relay')ctx.relay=new RelayCredentials({
send:frame=>this._currentSocket(ctx)&&ctx.auth&&ctx.pairing.send(frame),
current:()=>this._currentSocket(ctx),clock:this._clock,now:this._clock.now,
onRenew:servers=>this._renewRelay(ctx,servers),
onError:error=>{if(this._currentSocket(ctx))this._finish(this._transportError(error));},
});
ctx.pairing.after('auth',DEADLINE,()=>this._lost(ctx,1006));
ctx.pairing.listen({open:()=>{
this._send(this._authFrame());
if(this._client&&!this._inbox)this._settleStart(true);
},message:event=>{
if(event.data==='pong'){
ctx.unsentPing=false;
ctx.pairing.clear('unsent-ping');
return;
}
if(typeof event.data!=='string'||event.data.length>65536||ctx.pending>=256){
this._lost(ctx,1006);
return;
}
let frame;
try{frame=JSON.parse(event.data);}catch{this._lost(ctx,1006);return;}
if(ctx.relay?.receive(frame))return;
if(['ended','replaced','kicked','denied'].includes(frame?.type)||
(frame?.type==='error'&&['password','unauthorized','transport-mismatch','relay-unavailable','approval-mismatch'].includes(frame.error))){
void this._message(frame,ctx).catch(()=>{
if(this._currentSocket(ctx))this._lost(ctx,1006);
});
return;
}
ctx.pending++;
ctx.chain=ctx.chain.then(async()=>{
if(this._currentSocket(ctx))await this._message(frame,ctx);
}).catch(()=>{
if(this._currentSocket(ctx))this._lost(ctx,1006);
}).finally(()=>{ctx.pending--;});
},close:event=>this._lost(ctx,event.code),
error:()=>this._lost(ctx,1006)});
}
_closeSocket(ctx){
if(!ctx)return;
ctx.relay?.close();
ctx.pairing.close();
}
_lost(ctx,code){
if(!this._currentSocket(ctx))return;
this._resetControlFlight();
this._closeSocket(ctx);
this._socket=null;
if([4400,4403,4409].includes(code)){
this._finish(code===4400?'error-connection':'error-access');
return;
}
if(this._source&&!this._connected().length)this.setTalking(false);
this._waiting=true;
this._awaitingApproval=false;
this._requests.clear();
this._emitRequests();
this._voiceState();
if(code===4429)this._state('error-full');
this._retry(ctx.epoch,code);
}
_retry(epoch,code){
if(!this._live(epoch)||this._retryTimer!==null)return;
const failures=this._failures++;
const delay=Math.min(30000,(code===4429?3000:INTERVAL)*2**Math.min(failures,5));
this._retryTimer=this._clock.setTimeout(()=>{
this._retryTimer=null;
this._connect(epoch);
},delay);
}
_send(frame){
return this._socket?.pairing.send(frame)??false;
}
_authenticated(ctx){
if(!ctx.auth)ctx.lastPing=this._clock.now();
ctx.auth=true;
this._failures=0;
ctx.pairing.clear('auth');
}
async _message(frame,ctx){
if(!frame||typeof frame!=='object')return;
if(frame.type==='ended'){this._finish('broadcast-ended');return;}
if(this._client&&frame.type==='denied'){this._finish('listener-denied');return;}
if(this._inbox&&frame.type==='kicked'){this._finish('kicked');return;}
if(frame.type==='replaced'){this._finish('error-access');return;}
if(frame.type==='error'){
if(this._inbox&&frame.error==='password')this._finish('error-password');
else if(frame.error==='transport-mismatch')this._finish('transport.mismatch');
else if(frame.error==='relay-unavailable')this._finish('transport.unavailable');
else if(frame.error==='approval-mismatch')this._finish('error-approval');
else if(this._inbox&&frame.error==='moderation-full')this._refusedControl();
else if(['full','busy'].includes(frame.error))this._lost(ctx,4429);
else if(frame.error==='timeout')this._lost(ctx,1006);
else if(frame.error==='stale'&&this._client)this._send({type:'check'});
else if(frame.error==='unauthorized')this._finish('error-access');
return;
}
if(frame.type==='host-ready'&&this.role==='host'&&UUID.test(frame.generation||'')){
if(transportMode(frame.transport)!==this.transport){this._finish('transport.mismatch');return;}
if(this.requireApproval!==undefined&&frame.approval!==this.requireApproval){this._finish('error-approval');return;}
if(frame.generation!==this._generation)this._generationChange(frame.generation);
this._approval=typeof frame.approval==='boolean'?frame.approval:null;
this._authenticated(ctx);
this._waiting=false;
if(this._source)this._send({type:'status',generation:this._generation,talking:this._talking});
this._discovery=frame.discovery||null;
this._flushControls();
this._settleStart(true);
this._voiceState();
return;
}
if(this._client&&frame.type==='waiting'){
this._authenticated(ctx);
this._waiting=true;
this._awaitingApproval=false;
if(this._inbox)this._settleStart(true);
this._voiceState();
return;
}
if(this._client&&frame.type==='approval-pending'&&frame.approval===true
&&this._validId(frame.id)&&UUID.test(frame.generation||'')){
if(transportMode(frame.transport)!==this.transport){this._finish('transport.mismatch');return;}
if(frame.generation!==this._generation)this._generationChange(frame.generation);
for(const id of new Set([...this._peers.keys(),...this._retiring.keys()]))this._drop(id);
this._authenticated(ctx);
this._id=frame.id;
this._approval=true;
this._waiting=this._awaitingApproval=true;
this.setTalking(false);
this._settleStart(true);
this._voiceState();
return;
}
if(this._client&&frame.type==='ready'&&this._validId(frame.id)&&UUID.test(frame.generation||'')){
if(transportMode(frame.transport)!==this.transport){this._finish('transport.mismatch');return;}
if(this._generation!==frame.generation){
this._generationChange(frame.generation);
this._offerAt=this._clock.now();
}
if(this._id!==frame.id){
for(const peer of[...this._peers.values()]){
if(peer.pc.connectionState!=='connected')this._drop(peer.id);
else peer.outgoing=[];
}
this._orphanIce=[];
this._offerAt=this._clock.now();
}
this._id=frame.id;
this._approval=typeof frame.approval==='boolean'?frame.approval:null;
this._remoteTalking=Boolean(frame.talking);
if(this._inbox)this._applyMuted(Boolean(frame.muted));
this._authenticated(ctx);
this._awaitingApproval=false;
if(this._source&&!await this._acquireCapture(ctx.epoch))return;
if(!this._currentSocket(ctx))return;
this._waiting=false;
this._offerAt=this._clock.now();
if(this._inbox){
this._send({type:'status',generation:this._generation,talking:this._talking});
this._settleStart(true);
}
const peer=this._peers.get(this._id);
if(peer)this._flushOutgoing(peer);
this._voiceState();
return;
}
if(!ctx.auth||frame.generation!==this._generation)return;
if(this._inbox&&frame.type==='moderated'){
if(this._client)this._applyMuted(Boolean(frame.muted));
else this._moderated(frame);
this._voiceState();
return;
}
if(this.role==='host'){
if(frame.type==='request'&&this._approval===true&&this._validId(frame.id)){
if(!this._requests.has(frame.id)&&this._requests.size>=10)return;
this._requests.set(frame.id,{id:frame.id,
name:typeof frame.name==='string'&&frame.name.length<=64?frame.name:''});
this._emitRequests();
return;
}
if(['request-resolved','request-error'].includes(frame.type)&&this._validId(frame.id)){
if(frame.type==='request-resolved'){this._requests.delete(frame.id);this._emitRequests();}
else this._state(frame.error==='full'?'error-approval-full':'error-approval');
return;
}
if(frame.type==='join'&&this._validId(frame.id)){
this._requests.delete(frame.id);
this._emitRequests();
if(!this._hostIds.has(frame.id)&&this._hostIds.size>=10)return;
if(this._inbox){
this._joinParticipant(frame);
if(this._peers.has(frame.id))this._retire(frame.id);
}
this._hostIds.add(frame.id);
this._flushControls();
if(!this._peers.has(frame.id))void this._offer(frame.id,ctx.epoch);
}else if(frame.type==='leave')this._depart(frame.id);
else if(this._inbox&&frame.type==='status'){
const row=this._participants.get(frame.id);
if(row)row.talking=!row.muted&&Boolean(frame.talking);
this._emitParticipants();
}else if(['answer','candidate'].includes(frame.type)){
try{await this._receiveHost(frame);}catch{this._failPeer(this._peers.get(frame.from));}
}
}else if(!this._waiting&&frame.type==='status'){
this._remoteTalking=Boolean(frame.talking);
this._voiceState();
}else if(!this._waiting&&frame.from==='host'&&frame.to===this._id&&['offer','candidate'].includes(frame.type)){
try{await this._receiveListener(frame,ctx.epoch);}
catch{this._failPeer(this._peers.get(this._id));}
}
}
_generationChange(generation){
for(const id of new Set([...this._peers.keys(),...this._retiring.keys()]))this._drop(id);
this._hostIds.clear();
this._preparingPeers.clear();
this._orphanIce=[];
this._participants.clear();
this._requests.clear();
this._emitRequests();
this._emitParticipants();
this._resetControlFlight();
this._controls.clear();
this._generation=generation;
}
_emitRequests(){
if(this.role==='host')this.onRequests([...this._requests.values()].map(row=>({...row})));
}
approve(id){return this._decideRequest('approve',id);}
deny(id){return this._decideRequest('deny',id);}
_decideRequest(type,id){
return this.role==='host'&&this._approval===true&&this._canSignal()&&this._requests.has(id)
&&this._send({type,to:id,generation:this._generation});
}
_scheduleTick(epoch){
if(!this._live(epoch))return;
this._tickTimer=this._clock.setTimeout(()=>{
this._tickTimer=null;
if(!this._live(epoch))return;
const ctx=this._socket;
if(ctx?.auth&&!ctx.pairing.probing&&!ctx.unsentPing&&this._clock.now()-ctx.lastPing>=KEEPALIVE){
ctx.lastPing=this._clock.now();
if(!ctx.pairing.probe({timeout:DEADLINE,onTimeout:()=>this._lost(ctx,1006)})&&this._currentSocket(ctx)){
ctx.unsentPing=true;
ctx.pairing.after('unsent-ping',DEADLINE,()=>this._lost(ctx,1006));
}
}
if(this._canSignal()){
for(const peer of this._peers.values())this._flushOutgoing(peer);
this._flushControls();
}
for(const peer of this._connected())if(peer.route==='unknown')this._observeRoute(peer);
if(this._client&&this._socket?.auth){
if(this._waiting)this._send({type:'check'});
else if(!this._peers.has(this._id)&&this._clock.now()-this._offerAt>=DEADLINE)this._lost(this._socket,1000);
}else if(this.role==='host'){
if(this._canSignal()){
for(const id of this._hostIds)if(!this._peers.has(id))void this._offer(id,epoch);
}else if(this._source&&!this._connected().length&&this._talking)this.setTalking(false);
}
if(this._source&&!this._canSignal()&&!this._connected().length&&this._talking)this.setTalking(false);
this._scheduleTick(epoch);
},INTERVAL);
}
_peer(id,connection,epoch,configuration){
const pc=new this._Peer(configuration);
const peer={id,connection,pc,epoch,generation:this._generation,ice:[],outgoing:[],
timer:null,departed:false,stream:null,route:'unknown'};
this._peers.set(id,peer);
const deadline=()=>{
this._clock.clearTimeout(peer.timer);
peer.timer=this._clock.setTimeout(()=>{
if(this._current(peer)&&pc.connectionState!=='connected')this._failPeer(peer);
},DEADLINE);
};
deadline();
pc.onicecandidate=event=>{
if(!this._current(peer)||!transportCandidate(event.candidate,this.transport))return;
this._signal(peer,{type:'candidate',candidate:event.candidate?.toJSON()||null});
};
pc.onconnectionstatechange=()=>{
if(!this._current(peer))return;
if(pc.connectionState==='connected'){
if(this._peers.get(peer.id)!==peer)return;
if(!peer.departed){this._clock.clearTimeout(peer.timer);peer.timer=null;}
if(this._receiver)this._activate(peer);
else if(this._inbox)this._dropRetiring(peer.id);
this._emitParticipants();
this._voiceState();
this._observeRoute(peer);
}else if(pc.connectionState==='failed')this._failPeer(peer);
else if(pc.connectionState==='disconnected'&&!peer.timer)deadline();
};
if(this._receiver)pc.ontrack=event=>{
if(!this._current(peer)||event.track.kind!=='audio')return;
peer.stream=event.streams[0]||new MediaStream([event.track]);
if(pc.connectionState==='connected')this._activate(peer);
};
return peer;
}
async _offer(id,epoch){
if(!this._live(epoch)||!this._canSignal()||!this._hostIds.has(id)||
this._preparingPeers.has(id)||this._peers.has(id)||this._policies.get(id)?.kicked||this._policies.get(id)?.pendingRemoval)return;
if(this._peers.size>=10){
const departed=[...this._peers.values()].find(peer=>peer.departed);
if(!departed)return;
this._drop(departed.id);
}
let peer;
const flight={},ctx=this._socket,generation=this._generation;
this._preparingPeers.set(id,flight);
try{
const configuration=await this._configuration(ctx);
if(!this._live(epoch)||!this._currentSocket(ctx)||this._generation!==generation
||this._preparingPeers.get(id)!==flight||!this._hostIds.has(id)
||this._policies.get(id)?.kicked||this._policies.get(id)?.pendingRemoval)return;
peer=this._peer(id,uuid(),epoch,configuration);
if(this._source){
for(const track of this._stream.getAudioTracks())peer.pc.addTrack(track,this._stream);
for(const transceiver of peer.pc.getTransceivers())transceiver.direction='sendonly';
}else peer.pc.addTransceiver('audio',{direction:'recvonly'});
const offer=await peer.pc.createOffer();
if(!this._current(peer))return;
await peer.pc.setLocalDescription(offer);
if(this._current(peer))this._signal(peer,transportDescription(peer.pc.localDescription,this.transport));
}catch{this._failPeer(peer);}
finally{if(this._preparingPeers.get(id)===flight)this._preparingPeers.delete(id);}
}
async _configuration(ctx){
try{
const servers=this.transport==='relay'?await ctx.relay.prepare():[];
return{iceTransportPolicy:'all',...peerConfiguration(this.transport,servers)};
}catch(error){
if(this._currentSocket(ctx))this._finish(this._transportError(error));
throw error;
}
}
_transportError(error){
return/^transport\.(invalid|unavailable|limited|forbidden|timeout)$/.test(error?.message)
?error.message:'transport.unavailable';
}
_renewRelay(ctx,servers){
if(!this._currentSocket(ctx))return;
const configuration=peerConfiguration(this.transport,servers);
for(const peer of this._peers.values()){
try{peer.pc.setConfiguration(configuration);}catch{this._failPeer(peer);}
}
if(this._client){this._lost(ctx,1000);return;}
for(const id of[...this._hostIds]){
this._drop(id);
void this._offer(id,ctx.epoch);
}
}
_observeRoute(peer){
if(peer.routePending||typeof peer.pc.getStats!=='function')return;
peer.routePending=true;
Promise.resolve().then(()=>peer.pc.getStats()).then(stats=>{
if(!this._current(peer)||peer.pc.connectionState!=='connected')return;
peer.route=selectedTransport(stats);
this._voiceState();
}).catch(()=>{}).finally(()=>{peer.routePending=false;});
}
_signal(peer,data){
if(!this._current(peer)||this._peers.get(peer.id)!==peer||(this._client&&peer.id!==this._id))return;
const frame={...data,generation:peer.generation,connection:peer.connection,
...(this.role==='host'?{to:peer.id}:{})};
if(peer.outgoing.length||!this._canSignal()||!this._send(frame)){
if(this._current(peer)&&peer.outgoing.length<MAX_ICE)peer.outgoing.push(frame);
}
}
_flushOutgoing(peer){
if(!this._current(peer)||!this._canSignal()||
(this._client&&peer.id!==this._id))return;
let sent=0;
while(sent<peer.outgoing.length&&this._canSignal()){
if(!this._send(peer.outgoing[sent]))break;
sent++;
}
peer.outgoing.splice(0,sent);
}
async _receiveHost(frame){
const peer=this._peers.get(frame.from);
if(!peer||frame.to!=='host'||frame.connection!==peer.connection||!this._current(peer))return;
if(frame.type==='answer'&&!peer.pc.remoteDescription){
await peer.pc.setRemoteDescription(transportDescription({type:'answer',sdp:frame.sdp},this.transport));
await this._flushIce(peer);
}else if(frame.type==='candidate')await this._candidate(peer,frame.candidate);
}
async _receiveListener(frame,epoch){
if(!UUID.test(frame.connection||''))return;
let peer=this._peers.get(this._id);
if(frame.type==='offer'){
if(peer?.connection===frame.connection)return;
const ctx=this._socket,generation=this._generation,id=this._id;
const configuration=await this._configuration(ctx);
if(!this._live(epoch)||!this._currentSocket(ctx)||this._generation!==generation||this._id!==id)return;
if(this._inbox){
if(peer)this._retire(peer.id);
}else{
for(const other of[...this._peers.values()])if(other!==this._activePeer)this._drop(other.id);
if(peer?.id===this._id)this._drop(peer.id);
}
peer=this._peer(this._id,frame.connection,epoch,configuration);
peer.ice=this._orphanIce.filter(item=>item.connection===frame.connection).map(item=>item.candidate);
this._orphanIce=[];
await peer.pc.setRemoteDescription(transportDescription({type:'offer',sdp:frame.sdp},this.transport));
if(!this._current(peer))return;
if(this._source)for(const track of this._stream.getAudioTracks())peer.pc.addTrack(track,this._stream);
for(const transceiver of peer.pc.getTransceivers())transceiver.direction=this._source?'sendonly':'recvonly';
await this._flushIce(peer);
const answer=await peer.pc.createAnswer();
if(!this._current(peer))return;
await peer.pc.setLocalDescription(answer);
if(this._current(peer))this._signal(peer,transportDescription(peer.pc.localDescription,this.transport));
}else if(transportCandidate(frame.candidate,this.transport)){
if(peer?.connection===frame.connection)await this._candidate(peer,frame.candidate);
else if(this._orphanIce.length<MAX_ICE)this._orphanIce.push(frame);
}
}
async _candidate(peer,candidate){
if(!this._current(peer)||!transportCandidate(candidate,this.transport))return;
if(!peer.pc.remoteDescription){
if(peer.ice.length<MAX_ICE)peer.ice.push(candidate);
}else{
try{await peer.pc.addIceCandidate(candidate);}catch{}
}
}
async _flushIce(peer){
for(const candidate of peer.ice.splice(0)){
if(!this._current(peer))return;
await this._candidate(peer,candidate);
}
}
_activate(peer){
if(!this._current(peer)||this._peers.get(peer.id)!==peer||!peer.stream)return;
if(this._inbox){
this._activeInbox.set(peer.id,peer);
this.onStream(peer.stream,peer.id);
this._dropRetiring(peer.id);
this._emitParticipants();
}else{
this._activePeer=peer;
this.onStream(peer.stream);
for(const other of[...this._peers.values()])if(other!==peer)this._drop(other.id);
}
}
_depart(id){
this._hostIds.delete(id);
this._preparingPeers.delete(id);
const row=this._participants.get(id);
if(row?.pendingRemoval){
this._remember(id,{...this._policies.get(id),kicked:true,pendingRemoval:false,muted:true});
this._clearTargetControl(id);
this._drop(id);
this._participants.delete(id);
this._emitParticipants();
this._voiceState();
return;
}
this._clearTargetControl(id);
if(row)row.talking=false;
const peers=[this._peers.get(id),this._retiring.get(id)].filter(Boolean);
if(!peers.length)this._participants.delete(id);
for(const peer of peers){
peer.departed=true;
if(peer.pc.connectionState!=='connected')this._drop(id,peer);
else{
this._clock.clearTimeout(peer.timer);
peer.timer=this._clock.setTimeout(()=>{
if(this._current(peer))this._drop(id,peer);
this._voiceState();
},DEADLINE);
}
}
this._emitParticipants();
this._voiceState();
}
_failPeer(peer){
if(!peer||!this._current(peer))return;
const current=this._peers.get(peer.id)===peer;
this._drop(peer.id,peer);
if(this._client&&current&&peer.id===this._id&&this._socket)this._lost(this._socket,1000);
this._voiceState();
}
_drop(id,expected=null){
const peers=expected?[expected]:[this._peers.get(id),this._retiring.get(id)].filter(Boolean);
for(const peer of peers){
if(this._peers.get(id)===peer)this._peers.delete(id);
if(this._retiring.get(id)===peer)this._retiring.delete(id);
this._clock.clearTimeout(peer.timer);
peer.pc.onicecandidate=peer.pc.onconnectionstatechange=peer.pc.ontrack=null;
peer.pc.close();
peer.ice=peer.outgoing=[];
if(this._activePeer===peer){this._activePeer=null;this.onStream(null);}
if(this._activeInbox.get(id)===peer){this._activeInbox.delete(id);this.onStream(null,id);}
}
if(!this._hostIds.has(id)&&!this._peers.has(id)&&!this._retiring.has(id))this._participants.delete(id);
this._emitParticipants();
}
_authFrame(){
const transport=this.transport==='relay'?{transport:this.transport}:{};
const approval=typeof this.requireApproval==='boolean'&&this.role==='host'?{approval:this.requireApproval}:{};
if(!this._inbox)return{type:'auth',role:this.role,key:this.key,...transport,
...(this.role==='host'?{listenKey:this.listenKey,...approval,
...(this.discover?{roomName:this.roomName,discover:true}:{})}
:this.clientKey?{clientKey:this.clientKey}:{})};
return{type:'auth',role:this.role,key:this.key,passwordProof:this.passwordProof,...transport,
...(this.role==='host'?{roomName:this.roomName,...approval}:this.name?{name:this.name}:{})};
}
_applyMuted(muted){
this._muted=muted;
if(muted)this.setTalking(false);
}
_emitParticipants(){
if(!this._inbox||this._client)return;
this.onParticipants([...this._participants.values()].map(row=>({
id:row.id,name:row.name,muted:row.muted,talking:row.talking&&!row.muted,
connected:Boolean(this._activeInbox.get(row.id)?.pc.connectionState==='connected'),
pendingRemoval:Boolean(row.pendingRemoval),
})));
}
_joinParticipant(frame){
let policy=this._policies.get(frame.id);
if(policy?.kicked){
policy={...policy,kicked:false,pendingRemoval:true,muted:true};
this._remember(frame.id,policy);
}
const serverMuted=Boolean(frame.muted);
this._participants.set(frame.id,{id:frame.id,name:String(frame.name||'').slice(0,64),
serverMuted,muted:serverMuted||Boolean(policy?.muted),
pendingRemoval:Boolean(policy?.pendingRemoval),talking:Boolean(frame.talking)});
this._emitParticipants();
if(policy?.pendingRemoval)this._queueControl(frame.id,{type:'kick'});
else if(policy&&Boolean(policy.muted)!==serverMuted){
this._queueControl(frame.id,{type:'moderate',muted:Boolean(policy.muted)});
}
}
_remember(id,policy){
this._policies.delete(id);
this._policies.set(id,policy);
if(this._policies.size>128){
const oldest=[...this._policies.keys()].find(key=>!this._participants.has(key));
if(oldest)this._policies.delete(oldest);
}
}
moderate(id,muted){
const row=this._participants.get(id);
if(!this._active||!this._inbox||this._client||!row||
this._policies.get(id)?.kicked||row.pendingRemoval)return false;
this._remember(id,{...this._policies.get(id),muted:Boolean(muted)});
row.muted=row.serverMuted||Boolean(muted);
if(row.muted)row.talking=false;
this._emitParticipants();
this._queueControl(id,{type:'moderate',muted:Boolean(muted)});
return true;
}
kick(id){
const row=this._participants.get(id);
if(!this._active||!this._inbox||this._client||!row||row.pendingRemoval)return false;
this._remember(id,{...this._policies.get(id),pendingRemoval:true,muted:true});
row.pendingRemoval=true;
row.muted=true;
row.talking=false;
this._emitParticipants();
this._queueControl(id,{type:'kick'});
return true;
}
_queueControl(id,action){
if(!this._controls.has(id)&&this._controls.size>=24){
this._state('error-moderation-full',{moderation:{id,
action:action.type==='kick'?'kick':action.muted?'mute':'unmute'}});
return;
}
this._controls.set(id,action);
this._flushControls();
}
_flushControls(){
if(!this._inbox||this._client||!this._canSignal()||this._controlFlight)return;
const next=this._controls.entries().next().value;
if(!next)return;
const[id,action]=next;
const flight={id,action,epoch:this._epoch,generation:this._generation,timer:null};
this._controlFlight=flight;
flight.timer=this._clock.setTimeout(()=>{
if(this._controlFlight!==flight||!this._live(flight.epoch))return;
this._resetControlFlight();
if(this._socket)this._lost(this._socket,1006);
},DEADLINE);
if(!this._send({...action,to:id,generation:this._generation}))this._resetControlFlight();
}
_resetControlFlight(){
if(!this._controlFlight)return;
this._clock.clearTimeout(this._controlFlight.timer);
this._controlFlight=null;
}
_completeControl(id){
const flight=this._controlFlight;
if(flight?.id===id){
if(this._controls.get(id)===flight.action)this._controls.delete(id);
this._resetControlFlight();
}
this._flushControls();
}
_clearTargetControl(id){
this._controls.delete(id);
if(this._controlFlight?.id===id)this._resetControlFlight();
this._flushControls();
}
_moderated(frame){
const row=this._participants.get(frame.id);
if(row){
row.serverMuted=Boolean(frame.muted);
row.muted=row.serverMuted||Boolean(this._policies.get(frame.id)?.muted);
if(row.muted)row.talking=false;
}
const flight=this._controlFlight;
if(flight?.id===frame.id&&flight.action.type==='moderate'&&
flight.action.muted===Boolean(frame.muted))this._completeControl(frame.id);
this._emitParticipants();
}
_refusedControl(){
const flight=this._controlFlight;
if(!flight){this._state('error-moderation-full');return;}
const{id,action}=flight;
const newer=this._controls.get(id)!==action;
const policy=this._policies.get(id)||{};
const row=this._participants.get(id);
if(action.type==='kick'){
this._remember(id,{...policy,kicked:false,pendingRemoval:false,muted:true});
if(row){row.pendingRemoval=false;row.muted=true;row.talking=false;}
}else if(!newer){
this._remember(id,{...policy,muted:true});
if(row){row.muted=true;row.talking=false;}
}
if(!newer)this._controls.delete(id);
this._resetControlFlight();
this._emitParticipants();
this._state('error-moderation-full',{moderation:{id,
action:action.type==='kick'?'kick':action.muted?'mute':'unmute'}});
this._flushControls();
}
_retire(id){
const peer=this._peers.get(id);
if(!peer)return;
this._dropRetiring(id);
if(peer.pc.connectionState!=='connected'){this._drop(id,peer);return;}
this._peers.delete(id);
this._retiring.set(id,peer);
peer.outgoing=[];
this._clock.clearTimeout(peer.timer);
peer.timer=this._clock.setTimeout(()=>{
if(this._current(peer))this._drop(id,peer);
},DEADLINE);
}
_dropRetiring(id){
const peer=this._retiring.get(id);
if(peer)this._drop(id,peer);
}
}
export class BroadcastSession extends VoiceSession{
constructor(options){super({...options,mode:'broadcast'});}
}
export class InboxSession extends VoiceSession{
constructor(options){super({...options,mode:'inbox'});}
}
