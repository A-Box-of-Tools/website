/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{transportMode,transportUrl,peerConfiguration,transportCandidate,transportDescription,selectedTransport,RelayCredentials}from'./shared/peer-transport.js?v=b35b8461c3';
import{PairingSocket}from'./shared/peer-pairing.js?v=b35b8461c3';
import{createChannelGreeting}from'./shared/peer-greeting.js?v=b35b8461c3';
import{rendezvousEndpoint}from'./shared/peer-endpoint.js?v=b35b8461c3';
import{groupUrl}from'./shared/discovery-group.js?v=b35b8461c3';
import{AdmissionGrants,createAdmissionCache}from'./shared/peer-admission.js?v=b35b8461c3';
import{PROTOCOL,TOOL,CODE_PATTERN,controlMessage}from'./protocol.js?v=b35b8461c3';
import{DEFAULT_VIDEO_BUDGET,normalizeVideoBudget,viewerLimit,videoBitrate,VideoBandwidth}from'./bandwidth.js?v=b35b8461c3';
const RENDEZVOUS=rendezvousEndpoint();
const CONNECT_TIMEOUT=20000;
const MAX_PENDING=4;
const INTRODUCTION_RETRIES=[2000,4000,8000,15000,30000];
export class CameraSession{
constructor({
PeerConnection=globalThis.RTCPeerConnection,Socket=globalThis.WebSocket,MediaStream=globalThis.MediaStream,
onState=()=>{},onRequests=()=>{},onStream=()=>{},onDiscovery=()=>{},
onViewers=()=>{},onBandwidth=()=>{},
onSignaling=()=>{},visible=()=>globalThis.document?.hidden!==true,
diagnostics=null,admissions=createAdmissionCache(),
}={}){
this.PeerConnection=PeerConnection;
this.Socket=Socket;
this.MediaStream=MediaStream;
this.onState=onState;
this.onRequests=onRequests;
this.onStream=onStream;
this.onDiscovery=onDiscovery;
this.onViewers=onViewers;
this.onBandwidth=onBandwidth;
this.onSignaling=onSignaling;
this.visible=visible;
this.diagnostics=diagnostics;
this.admissions=admissions;
this.grants=new AdmissionGrants();
this.ownsGrants=true;
this.openingTrace=null;
this.signalingLost=false;
this.signalingRetry=null;
this.revision=0;
this.role=null;
this.socket=null;
this.pairing=null;
this.transport='direct';
this.discoveryGroup=null;
this.iceServers=[];
this.relay=null;
this.stream=null;
this.peers=new Map();
this.keepalive=null;
this.socketDeadline=null;
this.cancelOpen=null;
this.retryTimer=null;
this.retryAttempts=0;
this.reconnecting=false;
this.signalingUnavailable=false;
this.requireApproval=true;
this.cameraChange=null;
this.videoBudget=DEFAULT_VIDEO_BUDGET;
this.bandwidth=new VideoBandwidth({
current:(entry)=>this.role==='camera'&&this.current(entry),
onStatus:({supported})=>{
if(this.role==='camera')this.onBandwidth(supported?'camera.bandwidth-applied':'camera.bandwidth-unsupported');
},
});
}
state(key){
if(key==='camera.waiting'&&!this.requireApproval)key='camera.open-waiting';
this.onState(key,this.role);
}
get hasViewers(){return this.role==='camera'&&this.peers.size>0;}
get viewerCount(){return this.role==='camera'?[...this.peers.values()].filter((entry)=>entry.approved).length:0;}
get maxViewers(){return viewerLimit(this.videoBudget);}
setVideoBudget(mbps){
this.videoBudget=normalizeVideoBudget(Number(mbps)*1000000);
if(this.role==='camera'){
this.viewers();
this.requests();
}
}
hostState(){
if(this.reconnecting)return'camera.reconnecting';
if(this.signalingUnavailable)return'camera.reconnect-failed';
if([...this.peers.values()].some((entry)=>entry.video))return'camera.streaming';
return this.viewerCount?'camera.approved':'camera.waiting';
}
viewers(){
const entries=this.role==='camera'?[...this.peers.values()].filter((entry)=>entry.approved):[];
this.onViewers(entries
.map((entry)=>({id:entry.id,note:entry.note,streaming:this.established(entry)===true})));
return this.role==='camera'?this.bandwidth.update(entries,this.videoBudget):Promise.resolve();
}
setApprovalRequired(value){
this.requireApproval=Boolean(value);
if(this.role==='camera')this.state(this.hostState());
}
async startHost(stream,code,{discoverable=false,requireApproval=true,videoBudget=DEFAULT_VIDEO_BUDGET/1000000,transport='direct',discoveryGroup=null,approvalGrants=null}={}){
this.stop();
this.grants=approvalGrants??new AdmissionGrants();
this.ownsGrants=approvalGrants===null;
this.role='camera';
this.requireApproval=Boolean(requireApproval);
this.setVideoBudget(videoBudget);
this.stream=stream;
this.transport=transportMode(transport);
this.discoveryGroup=discoveryGroup;
if(!this.transport){this.stop('transport.invalid');throw new Error('transport.invalid');}
if(!stream?.getVideoTracks().some((track)=>track.readyState==='live')){
this.stop('camera.ended');
throw new Error('camera.ended');
}
return this.open(code,discoverable);
}
async connect(code,note,{transport='direct'}={}){
this.stop();
this.role='viewer';
this.transport=transportMode(transport);
if(!this.transport){this.stop('transport.invalid');throw new Error('transport.invalid');}
this.note=String(note??'').trim().slice(0,80);
return this.open(code);
}
open(code,discoverable=false,recovering=false){
if(!CODE_PATTERN.test(code)){
this.stop('code.invalid');
return Promise.reject(new Error('code.invalid'));
}
const revision=this.revision;
this.code=code;
this.discoverable=discoverable;
if(!recovering)this.openingTrace=this.diagnostics?.begin(this.role==='camera'?'host':'viewer',this.transport==='relay'?'relay':'local')??null;
if(!recovering)this.state('connection.starting');
return new Promise((resolve,reject)=>{
let settled=false,opened=false,configured=this.transport==='direct',confirmed=false;
const waiting=[];
let socket;
try{
socket=this.socket=new this.Socket(groupUrl(transportUrl(`${RENDEZVOUS}/ws/${code}?role=${this.role === 'camera' ? 'host' : 'viewer'}&local=1&tool=${TOOL}${discoverable ? '&discover=1' : ''}`,this.transport),this.role==='camera'&&discoverable?this.discoveryGroup:null));
}catch(error){
this.openingTrace?.error('websocket',error);
this.openingTrace?.socket('closed');
this.openingTrace?.finish('socket-error');
this.openingTrace=null;
this.stop('connection.server-failed');
throw new Error('connection.server-failed');
}
const current=()=>this.revision===revision&&this.socket===socket;
const pairing=this.pairing=new PairingSocket(socket,{current});
const finish=()=>{
if(!current()||settled||!configured||(recovering&&!confirmed))return;
settled=true;
pairing.clear('opening');
this.socketDeadline=null;
this.cancelOpen=null;
if(recovering){
this.reconnecting=false;
this.signalingUnavailable=false;
this.retryAttempts=0;
this.signalingLost=false;
}
this.state(this.role==='camera'?this.hostState():'connection.connecting');
this.onSignaling();
resolve();
};
const fail=(key,reason='signaling-error')=>{
if(!current())return;
pairing.clear('opening');
this.socketDeadline=null;
this.cancelOpen=null;
this.detachSocket(socket);
this.openingTrace?.finish(reason);
this.openingTrace=null;
if(key.startsWith('transport.')){
const pending=!settled;
settled=true;
this.stop(key);
if(pending)reject(new Error(key));
return;
}
if(recovering){
if(!settled){
this.onDiscovery(null);
this.detachIntroducedPeers();
settled=true;reject(new Error(key));
}
else this.lostIntroduction(key,opened);
}else{
this.lostIntroduction(key,opened);
if(!settled){settled=true;reject(new Error(key));}
}
};
const dispatch=(message)=>{
try{this.message(message);}catch{fail('connection.invalid');}
};
if(!configured)this.relay=new RelayCredentials({
send:(frame)=>pairing.send(frame),current,
onRenew:(servers)=>this.renewRelay(servers),
onError:(error)=>fail(error.message),
});
this.socketDeadline=pairing.after('opening',CONNECT_TIMEOUT,()=>fail('connection.server-failed','timeout'));
this.cancelOpen=()=>{
if(!settled){settled=true;reject(new Error('connection.stopped'));}
};
pairing.listen({
open:()=>{
opened=true;
this.openingTrace?.socket('open');
this.openingTrace?.mark('server-open');
for(const entry of this.peers.values())entry.trace?.socket('open');
this.keepalive=pairing.every('heartbeat',25000,()=>{
if(socket.readyState===1&&!pairing.send('ping'))fail('connection.server-failed');
});
if(recovering){
if(!pairing.send('ping'))fail('connection.server-failed');
}else finish();
if(!configured)this.relay.prepare().then((servers)=>{
if(!current())return;
this.iceServers=servers;
configured=true;
finish();
for(const message of waiting.splice(0)){if(current())dispatch(message);}
}).catch((error)=>{if(current())fail(error.message);});
},
error:()=>{
this.openingTrace?.error('websocket',{name:'NetworkError'});
for(const entry of this.peers.values())entry.trace?.error('websocket',{name:'NetworkError'});
fail('connection.server-failed','socket-error');
},
close:(event)=>{
this.openingTrace?.socket('closed',event.code);
for(const entry of this.peers.values())entry.trace?.socket('closed',event.code);
const reasons={4404:'connection.not-found',4409:'connection.taken',4429:'connection.busy',4410:'connection.ended',4412:'transport.mismatch',4413:'transport.unavailable'};
fail(reasons[event.code]??'connection.server-failed','socket-closed');
},
message:(event)=>{
if(event.data==='pong'){confirmed=opened;if(recovering)finish();return;}
if(typeof event.data!=='string'||event.data.length>65536)return fail('connection.invalid');
let message;
try{message=JSON.parse(event.data);}catch{return fail('connection.invalid');}
if(this.relay?.receive(message))return;
if(!configured){
if(waiting.length>=64)return fail('connection.invalid');
waiting.push(message);
}else dispatch(message);
},
});
});
}
established(entry,retainDetached=false){
if(!entry||!this.current(entry)||!entry.approved||!entry.hello
||entry.dc?.readyState!=='open')return false;
const connected=entry.pc.connectionState==='connected';
if(!connected&&!(retainDetached&&entry.signalingDetached&&entry.pc.connectionState==='disconnected'))return false;
return this.role==='camera'?entry.video===true&&entry.mediaNegotiated===true&&entry.acknowledged===true
:entry.received?.getVideoTracks().some((track)=>track.readyState==='live');
}
detachSocket(socket){
if(this.socket!==socket)return;
this.openingTrace?.socket('closed');
for(const entry of this.peers.values())entry.trace?.socket('closed');
const pairing=this.pairing;
this.relay?.close();
this.relay=null;
this.socket=null;
this.pairing=null;
this.keepalive=null;
this.socketDeadline=null;
pairing.close();
}
lostIntroduction(key,opened){
if(!opened||!['connection.server-failed','connection.ended'].includes(key))return this.stop(key);
this.signalingLost=true;
const established=[...this.peers.values()].filter((entry)=>this.established(entry,true));
if(this.role==='viewer'){
if(this.transport==='relay')return this.stop(key);
if(!established.length)return this.stop(key);
established.forEach((entry)=>{entry.signalingDetached=true;});
this.signalingUnavailable=true;
this.state('viewer.signaling-lost');
this.onSignaling();
return;
}
if(this.role!=='camera')return;
this.reconnecting=true;
this.onDiscovery(null);
this.detachIntroducedPeers();
this.state('camera.reconnecting');
this.onSignaling();
this.retryIntroduction();
}
detachIntroducedPeers(){
for(const entry of[...this.peers.values()]){
if(this.transport==='direct'&&this.established(entry,true))entry.signalingDetached=true;
else this.removePeer(entry.id,'signaling-error');
}
}
retryIntroduction(){
if(this.role!=='camera'||!this.reconnecting||this.retryTimer!==null||this.signalingRetry)return;
if(this.retryAttempts>=INTRODUCTION_RETRIES.length){
this.reconnecting=false;
this.signalingUnavailable=true;
if([...this.peers.values()].some((entry)=>this.established(entry,true)))this.state('camera.reconnect-failed');
else this.stop('connection.server-failed');
this.onSignaling();
return;
}
if(!this.visible())return;
const revision=this.revision;
this.retryTimer=setTimeout(()=>{
this.retryTimer=null;
if(this.revision!==revision||this.role!=='camera'||!this.reconnecting||!this.visible())return;
void this.restoreSignaling();
},INTRODUCTION_RETRIES[this.retryAttempts]);
}
restoreSignaling({manual=false}={}){
if(this.role!=='camera'||!this.signalingLost||!this.visible())return Promise.resolve(false);
if(this.signalingRetry)return this.signalingRetry.promise;
if(manual)this.retryAttempts=0;
if(this.retryAttempts>=INTRODUCTION_RETRIES.length)return Promise.resolve(false);
clearTimeout(this.retryTimer);
this.retryTimer=null;
this.reconnecting=true;
this.signalingUnavailable=false;
this.retryAttempts+=1;
const flight={revision:this.revision,promise:null};
this.signalingRetry=flight;
flight.promise=Promise.resolve().then(()=>{
if(this.signalingRetry!==flight||this.revision!==flight.revision||!this.visible())return false;
return this.open(this.code,this.discoverable,true).then(()=>this.revision===flight.revision,(error)=>{
if(this.revision===flight.revision&&error.message==='connection.invalid')this.stop(error.message);
return false;
});
}).finally(()=>{
if(this.signalingRetry===flight){
this.signalingRetry=null;
this.onSignaling();
if(this.signalingLost&&this.reconnecting)this.retryIntroduction();
}
});
this.onSignaling();
return flight.promise;
}
send(data,id=null){
if(!this.pairing?.send(JSON.stringify(id===null?{data}:{to:id,data})))throw new Error('connection.server-failed');
}
message(message){
if(this.role==='camera'&&message?.type==='host-ready'){
const publication=message.discovery;
if(publication?.tool===TOOL&&publication.code===this.code&&CODE_PATTERN.test(publication.code)
&&typeof publication.lease==='string'&&/^[a-z0-9-]{16,128}$/i.test(publication.lease)){
this.onDiscovery(publication);
}
return;
}
if(this.role==='viewer'&&message?.type==='ready'){
if(this.peers.size)return;
const entry=this.newPeer('viewer');
this.send({protocol:PROTOCOL,dial:true});
return entry;
}
if(this.role==='camera'&&message?.type==='leave'){
const entry=this.peers.get(message.id);
if(this.transport==='direct'&&this.established(entry))entry.signalingDetached=true;
else if(!entry?.signalingDetached)this.removePeer(message.id);
return;
}
if(message?.type!=='signal'||message.data?.protocol!==PROTOCOL)return;
const id=this.role==='camera'?message.from:'viewer';
if(typeof id!=='string'||(this.role==='camera'&&!id.startsWith('v:')))return;
const data=message.data;
if(data.dial===true&&this.role==='camera'){
if(this.peers.has(id))return;
const pending=[...this.peers.values()].filter((entry)=>!entry.approved).length;
if(this.viewerCount>=this.maxViewers||pending>=MAX_PENDING){
this.send({protocol:PROTOCOL,refused:'busy'},id);
return;
}
const entry=this.newPeer(id);
this.channel(entry,entry.pc.createDataChannel('camera-control'));
this.queue(entry,()=>this.offer(entry));
return;
}
if(data.refused==='busy'&&this.role==='viewer'){
this.stop('connection.busy');
return;
}
const entry=this.peers.get(id);
if(!entry||entry.signalingDetached)return;
if(data.restart===true&&this.role==='camera'&&this.transport==='relay'){
entry.restartPending=true;
this.queue(entry,()=>this.offer(entry));
return;
}
this.queue(entry,async()=>{
let operation='signaling',adding=null;
try{
if(data.description!==undefined){
const description=data.description;
const expected=this.role==='camera'?'answer':'offer';
if(description?.type!==expected||typeof description.sdp!=='string'
||description.sdp.length>60000||!description.sdp.startsWith('v=0'))throw new Error('connection.invalid');
if(expected==='offer'){entry.trace?.count('offerReceived');entry.trace?.mark('offer-received');}
operation='set-remote-description';
await entry.pc.setRemoteDescription(transportDescription(description,this.transport));
if(!this.current(entry))return;
if(expected==='answer'){entry.trace?.count('answerAccepted');entry.trace?.mark('answer-accepted');}
if(expected==='answer')entry.awaitingAnswer=false;
if(expected==='answer'&&entry.video){
entry.mediaNegotiated=true;
entry.trace?.mark('sharing');
this.viewers();
}
for(const candidate of entry.candidates.splice(0)){
operation='add-candidate';adding=candidate;
await entry.pc.addIceCandidate(candidate);
entry.trace?.candidate('remote',candidate,'accepted');entry.trace?.count('candidatesAccepted');
adding=null;
}
if(expected==='offer'){
operation='answer';
entry.pc.getTransceivers().forEach((transceiver)=>{transceiver.direction='recvonly';});
operation='create-answer';
const answer=await entry.pc.createAnswer();
operation='set-local-description';
await entry.pc.setLocalDescription(answer);
if(this.current(entry))this.signal(entry,{description:transportDescription(entry.pc.localDescription,this.transport)});
}
if(expected==='answer'&&entry.offerPending)this.queue(entry,()=>this.offer(entry));
}else if(data.candidate!==undefined){
const candidate=data.candidate;
entry.trace?.count('candidatesReceived');entry.trace?.candidate('remote',candidate,'received');
if(typeof candidate?.candidate!=='string'||candidate.candidate.length>2048||!transportCandidate(candidate,this.transport)){
entry.trace?.count('candidatesFiltered');entry.trace?.candidate('remote',candidate,'filtered');
return;
}
if(entry.pc.remoteDescription){
operation='add-candidate';adding=candidate;
await entry.pc.addIceCandidate(candidate);
entry.trace?.candidate('remote',candidate,'accepted');entry.trace?.count('candidatesAccepted');
adding=null;
}
else{
if(entry.candidates.length>=128)throw new Error('connection.invalid');
entry.candidates.push(candidate);
}
}
}catch(error){
entry.trace?.error(operation,error);
if(adding)entry.trace?.candidate('remote',adding,'rejected');
throw error;
}
});
}
current(entry){return this.peers.get(entry.id)===entry&&entry.revision===this.revision;}
newPeer(id){
const pc=new this.PeerConnection(peerConfiguration(this.transport,this.iceServers));
const trace=this.openingTrace??this.diagnostics?.begin(this.role==='camera'?'host':'viewer',this.transport==='relay'?'relay':'local');
this.openingTrace=null;
const entry={id,pc,trace,revision:this.revision,queue:Promise.resolve(),queued:0,candidates:[],pending:false,approved:false,timers:new Set()};
this.peers.set(id,entry);
trace?.attach(pc);
trace?.socket(this.socket?.readyState===1?'open':this.socket?.readyState>1?'closed':'connecting');
trace?.mark('room-ready');
this.deadline(entry,()=>this.peerFailed(entry,'connection.direct-failed','handshake-timeout'),CONNECT_TIMEOUT);
pc.addEventListener('icecandidate',(event)=>{
if(!this.current(entry)||!event.candidate)return;
if(!transportCandidate(event.candidate,this.transport)){
trace?.candidate('local',event.candidate,'filtered');trace?.count('candidatesFiltered');
return;
}
let candidate;
try{candidate=event.candidate.toJSON();}
catch(error){
trace?.candidate('local',event.candidate,'rejected');trace?.error('candidate',error);
this.peerFailed(entry,'connection.server-failed');return;
}
try{this.signal(entry,{candidate});}catch{this.peerFailed(entry,'connection.server-failed');}
});
pc.addEventListener('datachannel',(event)=>{
if(this.role!=='viewer'||entry.dc||event.channel.label!=='camera-control')return this.peerFailed(entry,'connection.invalid');
this.channel(entry,event.channel);
});
pc.addEventListener('track',(event)=>{
if(!this.current(entry))return;
if(this.role!=='viewer'||!entry.approved||!['video','audio'].includes(event.track.kind))return this.peerFailed(entry,'connection.invalid');
const stream=entry.received??=new this.MediaStream();
if(stream.getTracks().includes(event.track))return;
stream.addTrack(event.track);
if(event.track.kind==='video')trace?.mark('video-track');
this.stream=stream;
this.onStream(stream);
event.track.addEventListener('ended',()=>{
if(!this.current(entry))return;
if(event.track.kind==='video')this.stop('connection.ended');
else{
stream.removeTrack(event.track);
this.onStream(stream);
}
});
});
pc.addEventListener('connectionstatechange',()=>{
if(!this.current(entry))return;
if(pc.connectionState==='failed')this.peerFailed(entry,'connection.direct-failed','connection-failed');
if(pc.connectionState==='disconnected'){
this.deadline(entry,()=>{
if(pc.connectionState==='disconnected')this.peerFailed(entry,'connection.direct-failed','disconnected');
},5000);
}
if(this.role==='camera'&&this.current(entry))this.viewers();
});
return entry;
}
deadline(entry,work,ms){
const timer=setTimeout(()=>{
entry.timers.delete(timer);
if(this.current(entry))work();
},ms);
entry.timers.add(timer);
return timer;
}
queue(entry,work){
if(entry.queued>=32)return this.peerFailed(entry,'connection.invalid');
entry.queued+=1;
entry.queue=entry.queue.then(()=>this.current(entry)&&work()).catch(()=>{
if(this.current(entry))this.peerFailed(entry,'connection.invalid');
}).finally(()=>{entry.queued-=1;});
}
signal(entry,data){
if(entry.signalingDetached)return;
try{
this.send({protocol:PROTOCOL,...data},this.role==='camera'?entry.id:null);
if(data.candidate!==undefined){
entry.trace?.candidate('local',data.candidate,'sent');entry.trace?.count('candidatesSent');
}else if(data.description?.type==='offer'){
entry.trace?.count('offerSent');entry.trace?.mark('offer-sent');
}else if(data.description?.type==='answer'){
entry.trace?.count('answerSent');entry.trace?.mark('answer-sent');
}
}
catch(error){
entry.trace?.error('send-signal',error);
if(data.candidate!==undefined)entry.trace?.candidate('local',data.candidate,'rejected');
if(!this.established(entry)||!this.socket)throw error;
const socket=this.socket;
this.detachSocket(socket);
this.lostIntroduction('connection.server-failed',true);
}
}
renewRelay(servers){
this.iceServers=servers;
for(const entry of this.peers.values()){
entry.pc.setConfiguration(peerConfiguration(this.transport,servers));
if(this.role==='camera'&&!entry.signalingDetached){
entry.restartPending=true;
this.queue(entry,()=>this.offer(entry));
}else if(this.role==='viewer')this.signal(entry,{restart:true});
}
}
async offer(entry){
if(entry.awaitingAnswer){entry.offerPending=true;return;}
const restarting=entry.restartPending===true;
entry.restartPending=false;
entry.offerPending=false;
let operation='create-offer';
try{
const offer=await entry.pc.createOffer(restarting?{iceRestart:true}:undefined);
if(!this.current(entry))return;
operation='set-local-description';
await entry.pc.setLocalDescription(offer);
}catch(error){entry.trace?.error(operation,error);throw error;}
if(this.current(entry)){
entry.awaitingAnswer=true;
this.signal(entry,{description:transportDescription(entry.pc.localDescription,this.transport)});
}
}
control(entry,type,values={}){
try{
if(entry.dc?.readyState!=='open')throw new Error('connection.direct-failed');
entry.dc.send(JSON.stringify({protocol:PROTOCOL,type,...values}));
}catch(error){entry.trace?.error('channel',error);throw error;}
}
channel(entry,channel){
entry.dc=channel;
entry.trace?.channel(channel);
const greeting=createChannelGreeting({
current:()=>this.current(entry),
send:()=>this.control(entry,'hello',this.role==='viewer'?{receiveAudio:true}:{}),
failed:()=>this.peerFailed(entry,'connection.direct-failed','channel-error'),
});
const opened=()=>greeting.open();
channel.addEventListener('open',opened);
if(channel.readyState==='open')opened();
channel.addEventListener('close',()=>{
if(this.current(entry))this.peerFailed(entry,'connection.ended');
});
channel.addEventListener('message',(event)=>{
if(!this.current(entry))return;
if(!greeting.open())return;
const message=controlMessage(event.data);
if(!message)return this.peerFailed(entry,'connection.invalid');
if(message.type==='hello'){
if(!greeting.receive())return;
entry.hello=true;
entry.trace?.mark('hello-received');
entry.receiveAudio=message.receiveAudio===true;
for(const timer of entry.timers)clearTimeout(timer);
entry.timers.clear();
if(this.role==='viewer'){
const token=this.admissions.read(TOOL,this.code,this.transport);
this.control(entry,'request',{note:this.note,...(token?{token}:{})});
entry.trace?.mark('waiting-approval');
this.state('viewer.waiting');
}
}else if(!entry.hello){
this.peerFailed(entry,'connection.invalid');
}else if(message.type==='request'&&this.role==='camera'&&!entry.approved){
if(entry.pending||entry.refused)return;
entry.pending=true;
entry.trace?.mark('approval-requested');
entry.note=message.note;
entry.admissionToken=message.token;
entry.openAccess=!this.requireApproval;
entry.autoAccept=entry.openAccess||this.grants.has(message.token);
if(entry.autoAccept&&!this.cameraChange){
if(!this.approve(entry.id))this.deny(entry.id,'busy');
}else this.requests();
}else if(message.type==='approved'&&this.role==='viewer'&&!entry.approved){
entry.approved=true;
this.admissions.save(TOOL,this.code,this.transport,message.token);
entry.trace?.mark('approved');
this.state('viewer.approved');
this.control(entry,'approval-ack');
entry.trace?.mark('approval-acknowledged');
this.deadline(entry,()=>{
entry.pc.getStats().then((stats)=>{
const received=[...stats.values()].some((item)=>item.type==='inbound-rtp'&&item.kind==='video'&&item.framesDecoded>0);
if(this.current(entry)&&!received)this.peerFailed(entry,'connection.direct-failed','media-timeout');
}).catch((error)=>{
entry.trace?.error('get-stats',error);
if(this.current(entry))this.peerFailed(entry,'connection.direct-failed','media-timeout');
});
},CONNECT_TIMEOUT);
}else if(message.type==='approval-ack'&&this.role==='camera'&&entry.approved){
if(!entry.acknowledged)entry.trace?.mark('approval-acknowledged');
entry.acknowledged=true;
clearTimeout(entry.approvalDeadline);
entry.timers.delete(entry.approvalDeadline);
this.beginVideo(entry);
}else if(message.type==='denied'&&this.role==='viewer'){
this.stop('viewer.denied');
}else if(message.type==='busy'&&this.role==='viewer'){
this.stop('connection.busy');
}else if(message.type==='ended'&&this.role==='viewer'){
this.stop('connection.ended');
}else{
this.peerFailed(entry,'connection.invalid');
}
});
}
requests(){
this.onRequests([...this.peers.values()].filter((entry)=>entry.pending)
.map(({id,note,autoAccept})=>({id,note,autoAccept:Boolean(autoAccept)})));
}
approve(id){
this.approvalError=null;
const entry=this.peers.get(id);
if(!entry?.pending||entry.refused||this.viewerCount>=this.maxViewers||this.role!=='camera'||this.cameraChange)return false;
const track=this.stream?.getVideoTracks().find((item)=>item.readyState==='live');
if(!track){this.state('camera.paused');return false;}
const token=entry.openAccess&&!this.grants.has(entry.admissionToken)?null:this.grants.issue(entry.admissionToken);
if(!entry.openAccess&&!token){this.approvalError='approval.limit';this.state(this.approvalError);return false;}
entry.pending=false;
entry.approved=true;
entry.admissionToken=token;
try{
this.control(entry,'approved',entry.admissionToken?{token:entry.admissionToken}:{});
}catch{
this.peerFailed(entry,'connection.ended','channel-error');
return false;
}
entry.trace?.mark('approved');
entry.approvalDeadline=this.deadline(entry,()=>{
if(!entry.acknowledged)this.peerFailed(entry,'connection.direct-failed','approval-timeout');
},CONNECT_TIMEOUT);
this.requests();
this.viewers();
this.state(this.hostState());
return true;
}
async beginVideo(entry){
if(!this.current(entry)||entry.video||entry.videoStarting||!entry.approved||!entry.acknowledged||this.role!=='camera'||this.cameraChange)return;
entry.videoStarting=true;
try{
await this.bandwidth.update([...this.peers.values()].filter((peer)=>peer.approved),this.videoBudget);
if(!this.current(entry)||this.role!=='camera'||this.cameraChange)return;
const track=this.stream?.getVideoTracks().find((item)=>item.readyState==='live');
if(!track){this.state('camera.paused');return;}
try{
const options={
direction:'sendonly',streams:[this.stream],
sendEncodings:[{maxBitrate:videoBitrate(this.viewerCount,this.videoBudget)}],
};
try{entry.sender=entry.pc.addTransceiver(track,options).sender;}
catch(error){
if(!(error instanceof TypeError)&&error.name!=='NotSupportedError')throw error;
entry.sender=entry.pc.addTransceiver(track,{direction:'sendonly',streams:[this.stream]}).sender;
}
const audio=entry.receiveAudio&&this.stream?.getAudioTracks?.().find((item)=>item.readyState==='live');
if(audio)entry.audioSender=entry.pc.addTransceiver(audio,{direction:'sendonly',streams:[this.stream]}).sender;
entry.video=true;
}catch(error){
entry.trace?.error('offer',error);
this.peerFailed(entry,'connection.ended','signaling-error');
return;
}
this.queue(entry,()=>this.offer(entry));
this.viewers();
this.state(this.hostState());
}finally{entry.videoStarting=false;}
}
prepareCameraChange({preserveOnFailure=false}={}){
if(this.role!=='camera'||this.cameraChange)throw new Error('camera.switch-failed');
const revision=this.revision;
const operation={candidate:null,committing:false};
this.cameraChange=operation;
const current=()=>this.role==='camera'&&this.revision===revision&&this.cameraChange===operation;
const finish=()=>{
if(!current())return;
this.cameraChange=null;
if(!this.stream?.getVideoTracks().some((track)=>track.readyState==='live')){
if(preserveOnFailure){this.state('camera.paused');this.requests();}
else this.stop('camera.switch-ended');
return;
}
for(const entry of this.peers.values()){
if(entry.approved&&entry.acknowledged)this.beginVideo(entry);
}
for(const entry of[...this.peers.values()]){
if(entry.pending&&entry.autoAccept&&!entry.refused){
if(!this.approve(entry.id))this.deny(entry.id,'busy');
}
}
this.requests();
};
this.requests();
return{
commit:async(stream)=>{
if(!current())return false;
if(operation.committing)throw new Error('camera.switch-failed');
const track=stream?.getVideoTracks().find((item)=>item.readyState==='live');
if(!track)throw new Error('camera.switch-failed');
const audio=stream.getAudioTracks?.().find((item)=>item.readyState==='live')??null;
operation.candidate=stream;
operation.committing=true;
const replacements=[...this.peers.values()].filter((entry)=>entry.video&&entry.sender)
.flatMap((entry)=>[
{entry,sender:entry.sender,previous:entry.sender.track,next:track},
...(entry.audioSender?[{entry,sender:entry.audioSender,previous:entry.audioSender.track,next:audio}]:[]),
]).filter(({sender,next})=>sender.track!==next);
try{
const results=await Promise.allSettled(replacements.map(async({sender,next})=>sender.replaceTrack(next)));
if(!current())return false;
const failed=results.find((result,index)=>result.status==='rejected'&&this.current(replacements[index].entry));
if(failed||track.readyState!=='live'||audio?.readyState==='ended'){
await Promise.all(replacements.map(async({entry,sender,previous},index)=>{
if(results[index].status!=='fulfilled'||!this.current(entry)||(previous&&previous.readyState!=='live'))return;
try{await sender.replaceTrack(previous);}
catch{if(current()&&this.current(entry))this.peerFailed(entry,'connection.ended');}
}));
if(!current())return false;
throw failed?.reason??new Error('camera.switch-failed');
}
this.stream=stream;
operation.candidate=null;
finish();
return true;
}finally{operation.committing=false;}
},
cancel:()=>{if(!operation.committing)finish();},
};
}
deny(id,reason='denied'){
const entry=this.peers.get(id);
if(!entry||entry.approved)return false;
if(reason==='denied')this.grants.revoke(entry.admissionToken);
try{this.control(entry,reason);}catch{}
entry.trace?.finish('denied');
entry.refused=true;
entry.pending=false;
this.requests();
this.deadline(entry,()=>this.removePeer(id,'denied'),150);
return true;
}
disconnectViewer(id){
const entry=this.peers.get(id);
if(this.role!=='camera'||!entry?.approved)return false;
this.grants.revoke(entry.admissionToken);
for(const peer of[...this.peers.values()]){
if(peer===entry||(entry.admissionToken&&peer.admissionToken===entry.admissionToken)){
try{this.control(peer,'ended');}catch{}
this.removePeer(peer.id,'ended');
}
}
return true;
}
peerFailed(entry,key,reason=key==='connection.ended'?'ended':'signaling-error'){
if(!this.current(entry))return;
if(key==='connection.direct-failed'&&this.transport==='relay')key='transport.failed';
entry.trace?.finish(reason);
if(this.role==='viewer')this.stop(key);
else{
this.removePeer(entry.id);
if(key!=='connection.ended'&&this.role==='camera'&&!this.viewerCount)this.state(key);
}
}
removePeer(id,reason='peer-left'){
const entry=this.peers.get(id);
if(!entry)return;
entry.trace?.finish(reason);
this.peers.delete(id);
for(const timer of entry.timers)clearTimeout(timer);
entry.dc?.close();
entry.pc.close();
this.requests();
this.viewers();
if(this.role==='camera'){
if(!this.viewerCount&&this.signalingUnavailable&&!this.reconnecting&&!this.socket)this.stop('connection.server-failed');
else this.state(this.hostState());
}
}
stop(key='connection.stopped'){
const role=this.role;
if(this.ownsGrants)this.grants.clear();
this.grants=new AdmissionGrants();
this.ownsGrants=true;
const reason=key==='connection.stopped'?'stopped'
:key==='viewer.denied'?'denied'
:['connection.ended','camera.ended','camera.switch-ended','camera.paused'].includes(key)?'ended':'signaling-error';
this.openingTrace?.finish(reason);
this.openingTrace=null;
for(const entry of this.peers.values())entry.trace?.finish(reason);
if(role==='camera'&&key==='connection.stopped'){
for(const entry of this.peers.values()){
try{this.control(entry,'ended');}catch{}
}
}
this.revision+=1;
this.relay?.close();
this.relay=null;
this.iceServers=[];
this.signalingRetry=null;
this.signalingLost=false;
const tracks=new Set([...(this.cameraChange?.candidate?.getTracks()??[]),...(this.stream?.getTracks()??[])]);
tracks.forEach((track)=>{
if(track.readyState!=='ended')track.stop();
});
this.cameraChange=null;
this.bandwidth.clear();
this.keepalive=null;
this.socketDeadline=null;
this.cancelOpen?.();
this.cancelOpen=null;
clearTimeout(this.retryTimer);
this.retryTimer=null;
this.retryAttempts=0;
this.reconnecting=false;
this.signalingUnavailable=false;
const pairing=this.pairing;
this.socket=null;
this.pairing=null;
this.role=null;
this.discoveryGroup=null;
for(const id of[...this.peers.keys()])this.removePeer(id);
this.stream=null;
pairing?.close();
if(role==='viewer')this.onStream(null);
if(role)this.onState(key,role);
this.onSignaling();
}
async inspect(){
const entry=this.role==='viewer'?this.peers.get('viewer'):[...this.peers.values()].find((peer)=>peer.video)??this.peers.values().next().value;
if(!entry)return null;
const stats=await entry.pc.getStats();
if(!this.current(entry))return null;
const values=[...stats.values()];
const transport=values.find((item)=>item.type==='transport'&&item.selectedCandidatePairId);
const pair=transport&&stats.get(transport.selectedCandidatePairId);
const local=pair&&stats.get(pair.localCandidateId);
const remote=pair&&stats.get(pair.remoteCandidateId);
const video=values.find((item)=>item.type==='inbound-rtp'&&item.kind==='video');
return{state:entry.pc.connectionState,route:selectedTransport(stats),local:local?.candidateType,remote:remote?.candidateType,frames:video?.framesDecoded??0};
}
}
