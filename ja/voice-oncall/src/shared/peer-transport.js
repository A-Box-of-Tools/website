/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{allowedCandidate,localDescription}from'./peer-network.js?v=0dfce8d69a';
export function transportMode(value){
return value===undefined||value==='direct'?'direct':value==='relay'?'relay':null;
}
export function readTransport(href){
try{
const values=new URL(href).searchParams.getAll('transport');
return values.length>1?null:transportMode(values[0]);
}catch{return null;}
}
export function transportUrl(href,mode){
if(transportMode(mode)===null)throw new Error('transport.invalid');
const url=new URL(href);
url.searchParams.set('transport',transportMode(mode));
return url.href;
}
export function relayIceServers(value){
if(!Array.isArray(value)||!value.length||value.length>8)return null;
const result=[];
for(const server of value){
if(!server||typeof server!=='object'||typeof server.username!=='string'
||!server.username||server.username.length>1024||typeof server.credential!=='string'
||!server.credential||server.credential.length>2048)return null;
const urls=typeof server.urls==='string'?[server.urls]:server.urls;
if(!Array.isArray(urls)||!urls.length||urls.length>8||urls.some((url)=>
typeof url!=='string'||url.length>256||/\s/.test(url)
||!/^turns?:[a-z0-9.-]+(?::\d{1,5})?(?:\?transport=(?:udp|tcp))?$/i.test(url)))return null;
result.push({urls:[...urls],username:server.username,credential:server.credential});
}
return result;
}
const turnQuerySupport=new WeakMap();
function acceptsTurnQuery(Peer){
if(typeof Peer!=='function')return true;
if(turnQuerySupport.has(Peer))return turnQuerySupport.get(Peer);
let probe,supported=true;
try{
probe=new Peer({iceTransportPolicy:'relay',iceCandidatePoolSize:0,
iceServers:[{urls:'turns:example.invalid:443?transport=tcp',
username:'probe',credential:'probe'}]});
}catch(error){
supported=!(error?.name==='SyntaxError'&&error?.message==='Invalid TURN URL query string');
}finally{
try{probe?.close();}catch{}
}
turnQuerySupport.set(Peer,supported);
return supported;
}
export function peerConfiguration(mode,iceServers=null,Peer=globalThis.RTCPeerConnection){
if(transportMode(mode)==='direct')return{iceServers:[]};
if(mode!=='relay')throw new Error('transport.invalid');
let valid=relayIceServers(iceServers);
if(!valid)throw new Error('transport.unavailable');
if(!acceptsTurnQuery(Peer)){
valid=valid.flatMap(server=>{
const urls=[...new Set(server.urls.filter(url=>/^turns:[^?]+(?:\?transport=tcp)?$/i.test(url))
.map(url=>url.replace(/\?transport=tcp$/i,'')))];
return urls.length?[{...server,urls}]:[];
});
if(!valid.length)throw new Error('transport.unavailable');
}
return{iceServers:valid,iceTransportPolicy:'relay'};
}
export function transportCandidate(candidate,mode){
if(transportMode(mode)==='direct')return allowedCandidate(candidate,true);
if(mode!=='relay')return false;
if(candidate===null||candidate===undefined)return true;
const text=typeof candidate==='string'?candidate:candidate.candidate;
if(text==='')return true;
if(typeof text!=='string'||/[\r\n]/.test(text))return false;
const fields=text.trim().replace(/^a=/i,'').split(/\s+/);
if(fields[6]?.toLowerCase()!=='typ'||fields[7]?.toLowerCase()!=='relay')return false;
fields[7]='host';
return allowedCandidate(fields.join(' '),true);
}
export function transportDescription(description,mode){
if(transportMode(mode)==='direct')return localDescription(description);
if(mode!=='relay')throw new Error('transport.invalid');
const filter=(sdp)=>sdp.replace(/^a=candidate(?:[: \t])[^\r\n]*(?:\r\n|\n|\r|$)/gmi,(line)=>{
const ending=line.match(/(?:\r\n|\n|\r)$/)?.[0]??'';
const text=line.slice(0,line.length-ending.length);
if(!transportCandidate(text,'relay'))return'';
const fields=text.trim().replace(/^a=/i,'').split(/\s+/);
const kept=fields.slice(0,8);
for(let i=8;i<fields.length;i+=2){
if(!/^(raddr|rport)$/i.test(fields[i]))kept.push(fields[i],fields[i+1]);
}
return`a=${kept.join(' ')}${ending}`;
});
if(typeof description==='string')return filter(description);
return typeof description?.sdp==='string'?{type:description.type,sdp:filter(description.sdp)}:description;
}
export function selectedTransport(stats){
const values=[...stats.values()];
const transport=values.find((entry)=>entry.type==='transport'&&entry.selectedCandidatePairId);
const pair=transport&&stats.get(transport.selectedCandidatePairId);
const selected=pair??values.find((entry)=>entry.type==='candidate-pair'&&entry.state==='succeeded'
&&(entry.selected===true||entry.nominated===true));
if(!selected)return'unknown';
const local=stats.get(selected.localCandidateId),remote=stats.get(selected.remoteCandidateId);
if(local?.candidateType==='relay'||remote?.candidateType==='relay')return'relay';
return local?.candidateType&&remote?.candidateType?'direct':'unknown';
}
let requestSerial=0;
export class RelayCredentials{
constructor({send,current=()=>true,onRenew=()=>{},onError=()=>{},
now=()=>Date.now(),clock=globalThis}={}){
Object.assign(this,{send,current,onRenew,onError,now,clock});
this.pending=null;
this.cached=null;
this.renewal=null;
this.retired=false;
}
live(){return!this.retired&&this.current();}
prepare(){
if(!this.live())return Promise.reject(new Error('transport.stopped'));
if(this.cached?.expiresAt>this.now()+60000)return Promise.resolve(structuredClone(this.cached.iceServers));
return this.request();
}
request(){
if(!this.live())return Promise.reject(new Error('transport.stopped'));
if(this.pending)return this.pending.promise;
const id=`relay-${++requestSerial}`;
let resolve,reject;
const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});
const pending={id,promise,resolve,reject,timer:null,requestedAt:this.now()};
this.pending=pending;
pending.timer=this.clock.setTimeout(()=>this.finish(pending,new Error('transport.timeout')),10000);
try{
if(this.send({type:'relay-request',id})===false)this.finish(pending,new Error('transport.unavailable'));
}catch{this.finish(pending,new Error('transport.unavailable'));}
return promise;
}
finish(pending,error,value){
if(this.pending!==pending)return;
this.pending=null;
this.clock.clearTimeout(pending.timer);
if(!this.live())pending.reject(new Error('transport.stopped'));
else if(error)pending.reject(error);
else pending.resolve(structuredClone(value));
}
receive(frame){
if(frame?.type!=='relay-credentials')return false;
const pending=this.pending;
if(!pending||frame.id!==pending.id||!this.live())return true;
if(frame.error!==undefined){
const error=['limited','forbidden','unavailable'].includes(frame.error)?frame.error:'invalid';
this.finish(pending,new Error(`transport.${error}`));
return true;
}
const iceServers=relayIceServers(frame.iceServers),now=this.now();
let expiresAt=frame.expiresAt;
if(frame.issuedAt!==undefined){
const lifetime=frame.expiresAt-frame.issuedAt;
if(!Number.isSafeInteger(frame.issuedAt)||!Number.isSafeInteger(frame.expiresAt)
||!Number.isSafeInteger(lifetime)||lifetime<=60000||lifetime>60*60*1000)expiresAt=null;
else expiresAt=pending.requestedAt+lifetime;
}
if(!iceServers||!Number.isSafeInteger(expiresAt)||expiresAt<=now+60000
||expiresAt>now+2*60*60*1000){
this.finish(pending,new Error('transport.invalid'));
return true;
}
this.cached={iceServers,expiresAt};
this.finish(pending,null,iceServers);
this.scheduleRenewal();
return true;
}
scheduleRenewal(){
if(this.renewal!==null)this.clock.clearTimeout(this.renewal);
if(!this.live()||!this.cached)return;
const expected=this.cached;
this.renewal=this.clock.setTimeout(async()=>{
this.renewal=null;
if(!this.live()||this.cached!==expected)return;
try{
const servers=await this.request();
if(this.live())await this.onRenew(servers);
}catch(error){
if(!this.live())return;
this.cached=null;
const key=/^transport\.(invalid|unavailable|limited|forbidden|timeout|stopped|failed)$/.test(error?.message)
?error.message:'transport.failed';
this.onError(new Error(key));
}
},Math.max(1000,expected.expiresAt-this.now()-Math.min(5*60*1000,(expected.expiresAt-this.now())/10)));
}
close(){
if(this.retired)return;
this.retired=true;
if(this.renewal!==null)this.clock.clearTimeout(this.renewal);
this.renewal=null;
this.cached=null;
if(this.pending)this.finish(this.pending,new Error('transport.stopped'));
}
}
