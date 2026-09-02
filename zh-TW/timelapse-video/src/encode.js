/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{Mp4Muxer}from'./shared/mp4-muxer.js';
import{QUEUE_LIMIT}from'./shared/webcodecs.js';
const KEYFRAME_SECONDS=2;
export class TimelapseWriter{
#encoder=null;
#muxer;
#failure=null;
#written=0;
#index=0;
constructor({width,height,fps,bitrate,codec}){
this.width=width;
this.height=height;
this.fps=fps;
this.bitrate=bitrate;
this.codec=codec;
this.#muxer=new Mp4Muxer({width,height});
}
get written(){
return this.#written;
}
get busy(){
return(this.#encoder?.encodeQueueSize??0)>QUEUE_LIMIT;
}
open(){
this.#encoder=new VideoEncoder({
output:(chunk,metadata)=>{
try{
if(metadata?.decoderConfig?.description){
this.#muxer.setDecoderConfig(metadata.decoderConfig.description);
}
const data=new Uint8Array(chunk.byteLength);
chunk.copyTo(data);
this.#muxer.addSample(data,chunk.type==='key',1/this.fps);
this.#written+=1;
}catch(error){
this.#failure??=error;
}
},
error:(error)=>{this.#failure??=error;},
});
this.#encoder.configure({
codec:this.codec,
width:this.width,
height:this.height,
bitrate:this.bitrate,
framerate:this.fps,
avc:{format:'avc'},
alpha:'discard',
latencyMode:'quality',
});
}
write(canvas){
if(this.#failure)throw this.#failure;
const period=1/this.fps;
const timestamp=Math.round(this.#index*period*1_000_000);
const keyFrame=this.#index===0
||Math.floor(this.#index*period/KEYFRAME_SECONDS)
>Math.floor((this.#index-1)*period/KEYFRAME_SECONDS);
const frame=new VideoFrame(canvas,{
timestamp,
duration:Math.round(period*1_000_000),
});
try{
this.#encoder.encode(frame,{keyFrame});
}finally{
frame.close();
}
this.#index+=1;
}
settle(){
const encoder=this.#encoder;
return new Promise((resolve)=>{
let settled=false;
const done=()=>{
if(settled)return;
settled=true;
clearTimeout(timer);
encoder.removeEventListener('dequeue',done);
resolve();
};
const timer=setTimeout(done,20);
encoder.addEventListener('dequeue',done);
});
}
async finish(){
await this.#encoder.flush();
if(this.#failure)throw this.#failure;
if(!this.#written)throw new Error('encode.nothing');
return{blob:this.#muxer.finalize(),frames:this.#written};
}
close(){
if(this.#encoder&&this.#encoder.state!=='closed')this.#encoder.close();
}
}
