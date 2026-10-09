/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function available(){
return typeof navigator!=='undefined'
&&!!navigator.mediaDevices?.getUserMedia;
}
export function reasonFor(error){
if(!available()){
return typeof window!=='undefined'&&!window.isSecureContext
?'camera.insecure':'camera.unsupported';
}
switch(error?.name){
case'NotAllowedError':
case'PermissionDeniedError':
return'camera.denied';
case'NotFoundError':
case'DevicesNotFoundError':
case'OverconstrainedError':
return'camera.none';
case'NotReadableError':
case'TrackStartError':
case'AbortError':
return'camera.busy';
case'SecurityError':
return'camera.insecure';
default:
return'camera.failed';
}
}
export async function open({deviceId}={}){
if(!available())throw new Error('no camera interface');
const video=deviceId
?{deviceId:{exact:deviceId}}
:{facingMode:{ideal:'environment'}};
video.width={ideal:1920};
video.height={ideal:1080};
return navigator.mediaDevices.getUserMedia({video,audio:false});
}
export async function cameras(){
if(!navigator.mediaDevices?.enumerateDevices)return[];
try{
const devices=await navigator.mediaDevices.enumerateDevices();
return devices
.filter((device)=>device.kind==='videoinput')
.map((device,index)=>({
deviceId:device.deviceId,
label:device.label||`Camera ${index + 1}`,
}));
}catch{
return[];
}
}
export function torchable(stream){
const track=stream?.getVideoTracks?.()[0];
return!!track?.getCapabilities?.().torch;
}
export async function setTorch(stream,on){
const track=stream?.getVideoTracks?.()[0];
if(!track?.applyConstraints)return false;
try{
await track.applyConstraints({advanced:[{torch:on}]});
return true;
}catch{
return false;
}
}
export function close(stream){
for(const track of stream?.getTracks?.()??[])track.stop();
}
export function frameInto(video,canvas,maxSide=960){
const width=video.videoWidth;
const height=video.videoHeight;
if(!width||!height)return null;
const scale=Math.min(1,maxSide/Math.max(width,height));
const target={width:Math.round(width*scale),height:Math.round(height*scale)};
if(canvas.width!==target.width||canvas.height!==target.height){
canvas.width=target.width;
canvas.height=target.height;
}
const context=canvas.getContext('2d',{willReadFrequently:true});
context.drawImage(video,0,0,target.width,target.height);
return context.getImageData(0,0,target.width,target.height);
}
