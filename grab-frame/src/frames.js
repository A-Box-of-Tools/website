/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{FileWindow}from'./shared/mp4-reader.js?v=05da797a51';
import{drawUpright}from'./draw.js?v=05da797a51';
import{micros}from'./shared/webcodecs.js?v=05da797a51';
import{throwIfAborted}from'./shared/errors.js?v=05da797a51';
export function displayOrder(video){
const list=video.samples.map((sample,decode)=>({
decode,
pts:sample.pts,
time:sample.pts/video.timescale,
isKey:Boolean(sample.isKey),
}));
list.sort((a,b)=>(a.pts-b.pts)||(a.decode-b.decode));
return list;
}
export function frameNear(order,seconds){
if(!order.length)return-1;
if(seconds<=order[0].time)return 0;
let low=0;
let high=order.length-1;
while(low<high){
const mid=(low+high+1)>>1;
if(order[mid].time<=seconds)low=mid;
else high=mid-1;
}
return low;
}
export function keyframeBefore(samples,decodeIndex){
for(let i=Math.min(decodeIndex,samples.length-1);i>=0;i--){
if(samples[i].isKey)return i;
}
return 0;
}
export function seriesFrames(order,{every,from=0,to=Infinity,limit=500}){
if(!order.length||!(every>0))return[];
const step=Math.max(every,0.001);
const end=Math.min(to,order[order.length-1].time);
const picked=[];
let last=-1;
for(let at=Math.max(from,order[0].time);at<=end+1e-9;at+=step){
const index=frameNear(order,at);
if(index!==last){
picked.push(index);
last=index;
}
if(picked.length>=limit)break;
}
return picked;
}
export function lookaheadFor(width,height,budgetBytes=96<<20){
const perFrame=Math.max(1,width*height*4);
return Math.max(2,Math.min(16,Math.floor(budgetBytes/perFrame)));
}
export class FrameReader{
constructor(file,video){
this.file=file;
this.video=video;
this.order=displayOrder(video);
this.displayOf=new Int32Array(video.samples.length);
this.order.forEach((frame,index)=>{this.displayOf[frame.decode]=index;});
this.window=new FileWindow(file,4<<20);
this.lookahead=lookaheadFor(video.codedWidth,video.codedHeight);
this.cache=new Map();
this.maxCached=this.lookahead+4;
this.decoder=null;
this.chain=Promise.resolve();
this.failure=null;
this.pending=null;
}
get count(){
return this.order.length;
}
timeOf(index){
const frame=this.order[Math.max(0,Math.min(index,this.order.length-1))];
return frame?frame.time:0;
}
frameAt(index){
const wanted=Math.max(0,Math.min(index,this.order.length-1));
const hit=this.cache.get(wanted);
if(hit)return Promise.resolve(hit);
this.chain=this.chain.then(
()=>this.#run(wanted),
()=>this.#run(wanted),
);
return this.chain;
}
#open(){
if(this.decoder&&this.decoder.state==='configured')return this.decoder;
const config={
codec:this.video.codec,
codedWidth:this.video.codedWidth,
codedHeight:this.video.codedHeight,
};
if(this.video.description)config.description=this.video.description;
const decoder=new VideoDecoder({
output:(frame)=>this.#collect(frame),
error:(error)=>{this.failure??=error;},
});
decoder.configure(config);
this.decoder=decoder;
return decoder;
}
#collect(frame){
const pending=this.pending;
const index=pending?.byTime.get(frame.timestamp);
const isTarget=index!==undefined&&index===pending.target;
const room=pending&&pending.copies.length<=this.lookahead;
if(!pending||index===undefined||index<pending.target||(!isTarget&&!room)){
frame.close();
return;
}
pending.copies.push(
createImageBitmap(frame)
.then((bitmap)=>this.#store(index,bitmap))
.catch((error)=>{this.failure??=error;})
.finally(()=>frame.close()),
);
}
#store(index,bitmap){
const existing=this.cache.get(index);
if(existing){
existing.close();
this.cache.delete(index);
}
this.cache.set(index,bitmap);
while(this.cache.size>this.maxCached){
const[oldest,value]=this.cache.entries().next().value;
value.close();
this.cache.delete(oldest);
}
}
async#run(target){
const cached=this.cache.get(target);
if(cached)return cached;
const{samples}=this.video;
const from=keyframeBefore(samples,this.order[target].decode);
const to=Math.min(samples.length-1,this.order[target].decode+this.lookahead);
const byTime=new Map();
for(let i=from;i<=to;i++){
byTime.set(micros(samples[i].pts,this.video.timescale),this.displayOf[i]);
}
this.pending={target,byTime,copies:[]};
this.failure=null;
const decoder=this.#open();
try{
for(let i=from;i<=to;i++){
if(this.failure)throw this.failure;
const sample=samples[i];
const bytes=await this.window.read(sample.offset,sample.size);
decoder.decode(new EncodedVideoChunk({
type:sample.isKey?'key':'delta',
timestamp:micros(sample.pts,this.video.timescale),
data:bytes,
}));
}
await decoder.flush();
await Promise.all(this.pending.copies);
if(this.failure)throw this.failure;
const frame=this.cache.get(target);
if(!frame)throw new Error('decode.noframe');
return frame;
}catch(error){
this.#discard();
throw error;
}finally{
this.pending=null;
}
}
#discard(){
if(this.decoder&&this.decoder.state!=='closed'){
try{
this.decoder.close();
}catch{
}
}
this.decoder=null;
}
release(){
this.#discard();
for(const bitmap of this.cache.values())bitmap.close();
this.cache.clear();
}
}
export async function decodeSeries({file,video,indexes,onFrame,onProgress,signal}){
if(!indexes.length)return;
const order=displayOrder(video);
const wanted=new Map();
for(const index of indexes){
wanted.set(micros(order[index].pts,video.timescale),index);
}
const first=Math.min(...indexes.map((index)=>order[index].decode));
const last=Math.max(...indexes.map((index)=>order[index].decode));
const from=keyframeBefore(video.samples,first);
const ready=[];
let failure=null;
let done=0;
const decoder=new VideoDecoder({
output:(frame)=>{
try{
const index=wanted.get(frame.timestamp);
if(index===undefined)return;
const canvas=document.createElement('canvas');
canvas.width=video.displayWidth;
canvas.height=video.displayHeight;
drawUpright(canvas.getContext('2d',{alpha:false}),frame,{
rotation:video.rotation,
displayWidth:video.displayWidth,
displayHeight:video.displayHeight,
});
ready.push({index,canvas});
}catch(error){
failure??=error;
}finally{
frame.close();
}
},
error:(error)=>{failure??=error;},
});
const config={
codec:video.codec,
codedWidth:video.codedWidth,
codedHeight:video.codedHeight,
};
if(video.description)config.description=video.description;
decoder.configure(config);
const window=new FileWindow(file,4<<20);
const drain=async()=>{
while(ready.length){
const next=ready.shift();
await onFrame(next.index,next.canvas);
done++;
onProgress?.({done,total:indexes.length});
}
};
try{
for(let i=from;i<=last;i++){
throwIfAborted(signal);
if(failure)throw failure;
const sample=video.samples[i];
const bytes=await window.read(sample.offset,sample.size);
decoder.decode(new EncodedVideoChunk({
type:sample.isKey?'key':'delta',
timestamp:micros(sample.pts,video.timescale),
data:bytes,
}));
await drain();
}
await decoder.flush();
if(failure)throw failure;
await drain();
}finally{
if(decoder.state!=='closed')decoder.close();
}
}
