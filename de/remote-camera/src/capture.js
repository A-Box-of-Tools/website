/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
function stopStream(stream,retained=new Set()){
stream?.getTracks().forEach((track)=>{
if(!retained.has(track)&&track.readyState!=='ended')track.stop();
});
}
export class CameraCapture{
#getUserMedia;
#generation=0;
#stream=null;
#switchOperation=null;
constructor({getUserMedia=(constraints)=>navigator.mediaDevices.getUserMedia(constraints)}={}){
this.#getUserMedia=getUserMedia;
}
get active(){return this.#stream!==null;}
get stream(){return this.#stream;}
get switching(){return this.#switchOperation!==null;}
async start(constraints={video:true}){
this.stop();
const generation=this.#generation;
let stream;
try{stream=await this.#getUserMedia({video:true,...constraints,audio:constraints.audio===true});}
catch(error){
if(generation!==this.#generation)return null;
throw error;
}
if(generation!==this.#generation){
stopStream(stream);
return null;
}
this.#stream=stream;
return stream;
}
async switchDevice(deviceId,install,{audio=false}={}){
if(!this.#stream||this.#switchOperation)return null;
const previous=this.#stream;
const previousDeviceId=previous.getVideoTracks?.()[0]?.getSettings?.().deviceId;
const generation=this.#generation;
const retained=new Set(previous.getTracks().filter((track)=>track.kind==='audio'&&track.readyState==='live'));
const replaceAudio=audio===true&&retained.size===0;
const previousVideo=previous.getVideoTracks?.().find((track)=>track.readyState==='live'&&!track.muted);
const audioOnly=replaceAudio&&previousVideo&&(!deviceId||deviceId===previousDeviceId);
if(audioOnly)retained.add(previousVideo);
const operation={candidates:new Set(),retained};
this.#switchOperation=operation;
const current=()=>generation===this.#generation&&this.#switchOperation===operation;
const discard=(candidate)=>{
if(operation.candidates.delete(candidate))stopStream(candidate,retained);
};
const acquire=async(id)=>{
const candidate=await this.#getUserMedia({
video:audioOnly?false:id?{deviceId:{exact:id}}:true,
audio:replaceAudio,
});
if(replaceAudio)candidate.getAudioTracks().forEach((track)=>{track.enabled=false;});
if(!current()){stopStream(candidate);return null;}
operation.candidates.add(candidate);
if(replaceAudio&&!candidate.getAudioTracks().some((track)=>track.readyState==='live'&&!track.muted)){
discard(candidate);
throw new Error('camera.audio-ended');
}
for(const track of retained){
if(track.readyState==='live')candidate.addTrack(track);
}
return candidate;
};
const accept=async(candidate)=>{
if(!candidate)return null;
let accepted;
try{accepted=await install(candidate);}
catch(error){discard(candidate);throw error;}
if(!current()||accepted!==true){discard(candidate);return null;}
operation.candidates.delete(candidate);
this.#stream=candidate;
return candidate;
};
let released=false;
try{
let candidate;
try{candidate=await acquire(deviceId);}
catch(error){
if(!current())return null;
if(audioOnly||!['NotReadableError','AbortError'].includes(error.name))throw error;
released=true;
this.#stream=null;
stopStream(previous,retained);
candidate=await acquire(deviceId);
}
const installed=await accept(candidate);
if(installed&&!released)stopStream(previous,retained);
return installed;
}catch(error){
if(!current())return null;
if(!released)throw error;
try{await accept(await acquire(previousDeviceId));}
catch{}
if(!current())return null;
throw error;
}finally{
if(this.#switchOperation===operation){
this.#switchOperation=null;
operation.candidates.forEach((candidate)=>stopStream(candidate,retained));
operation.candidates.clear();
if(!this.#stream){
for(const track of retained){if(track.readyState!=='ended')track.stop();}
}
}
}
}
stop(){
this.#generation+=1;
const stream=this.#stream;
const operation=this.#switchOperation;
this.#stream=null;
this.#switchOperation=null;
operation?.candidates.forEach((candidate)=>stopStream(candidate));
operation?.candidates.clear();
stopStream(stream);
for(const track of operation?.retained??[]){if(track.readyState!=='ended')track.stop();}
}
}
