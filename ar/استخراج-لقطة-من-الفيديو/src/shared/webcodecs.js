/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const QUEUE_LIMIT=8;
export function decoderConfig(video){
const config={
codec:video.codec,
codedWidth:video.codedWidth,
codedHeight:video.codedHeight,
};
if(video.description)config.description=video.description;
return config;
}
export function averageFps(video){
const seconds=video.duration/video.timescale;
if(!seconds)return 30;
return Math.min(240,Math.max(1,video.samples.length/seconds));
}
export function micros(ticks,timescale){
return Math.round(ticks/timescale*1_000_000);
}
const queued=(codec)=>codec.decodeQueueSize??codec.encodeQueueSize??0;
export async function settle(codecs,{limit=QUEUE_LIMIT,stallAfter=0,stallKey='stall.both'}={}){
let bestSeen=Infinity;
let progressAt=Date.now();
while(codecs.some((codec)=>queued(codec)>limit)){
if(stallAfter){
const size=codecs.reduce((total,codec)=>total+queued(codec),0);
if(size<bestSeen){
bestSeen=size;
progressAt=Date.now();
}else if(Date.now()-progressAt>stallAfter){
throw new Error(stallKey);
}
}
await new Promise((resolve)=>{
let settled=false;
const done=()=>{
if(settled)return;
settled=true;
clearTimeout(timer);
for(const codec of codecs)codec.removeEventListener('dequeue',done);
resolve();
};
const timer=setTimeout(done,20);
for(const codec of codecs)codec.addEventListener('dequeue',done);
});
}
}
