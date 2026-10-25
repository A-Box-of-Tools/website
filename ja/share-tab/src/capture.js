/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
function failure(code,cause){
return Object.assign(new Error(code),{code,cause});
}
function reason(error){
if(typeof error?.code==='string'&&error.code.startsWith('capture.'))return error;
switch(error?.name){
case'NotAllowedError':
case'PermissionDeniedError':
case'SecurityError':
return failure('capture.denied',error);
case'AbortError':
return failure('capture.cancelled',error);
default:
return failure('capture.failed',error);
}
}
function release(stream){
for(const track of stream?.getTracks?.()??[]){
try{track.stop();}catch{}
}
}
export class TabCapture{
constructor({devices=globalThis.navigator?.mediaDevices,onEnded=()=>{}}={}){
this._devices=devices;
this._onEnded=onEnded;
this._revision=0;
this._stream=null;
this._endedTrack=null;
this._endedListener=null;
}
get stream(){return this._stream;}
async start(){
this.stop();
const revision=this._revision;
if(typeof this._devices?.getDisplayMedia!=='function'){
throw failure('capture.unsupported');
}
let acquired;
try{
acquired=await this._devices.getDisplayMedia({
video:{displaySurface:'browser'},
audio:false,
selfBrowserSurface:'exclude',
monitorTypeSurfaces:'exclude',
surfaceSwitching:'exclude',
});
if(revision!==this._revision)throw failure('capture.cancelled');
const tracks=acquired.getVideoTracks();
if(tracks.length!==1||tracks[0].getSettings?.().displaySurface!=='browser'){
throw failure('capture.tab-only');
}
for(const audio of acquired.getAudioTracks()){
try{audio.stop();}finally{acquired.removeTrack(audio);}
}
const track=tracks[0];
if(track.readyState==='ended')throw failure('capture.cancelled');
this._stream=acquired;
this._endedTrack=track;
this._endedListener=()=>{
if(revision!==this._revision||this._stream!==acquired)return;
this.stop();
this._onEnded();
};
track.addEventListener('ended',this._endedListener,{once:true});
return acquired;
}catch(error){
if(acquired&&this._stream===acquired)this._release();
else release(acquired);
if(revision!==this._revision)throw failure('capture.cancelled',error);
throw reason(error);
}
}
_release(){
const stream=this._stream;
this._stream=null;
if(this._endedTrack&&this._endedListener){
this._endedTrack.removeEventListener('ended',this._endedListener);
}
this._endedTrack=null;
this._endedListener=null;
release(stream);
}
stop(){
this._revision+=1;
this._release();
}
}
