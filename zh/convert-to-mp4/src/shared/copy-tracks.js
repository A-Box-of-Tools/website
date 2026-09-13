/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{MOVIE_TIMESCALE,avcSampleEntry}from'./mp4-writer.js?v=dbc6801bc3';
export const VIDEO_TIMESCALE=90000;
const AAC_FRAME=1024;
export function rescale(ticks,from,to){
return from===to?ticks:Math.round(ticks*to/from);
}
export function compositionShift(samples){
if(!samples.length)return 0;
let minPts=Infinity;
let minDts=Infinity;
for(const sample of samples){
if(sample.pts<minPts)minPts=sample.pts;
if(sample.dts<minDts)minDts=sample.dts;
}
return Math.max(0,minPts-minDts);
}
export function closeGaps(samples,tail){
for(let i=0;i<samples.length;i+=1){
const next=samples[i+1];
samples[i].duration=next
?Math.max(1,next.dts-samples[i].dts)
:Math.max(1,tail);
}
return samples;
}
export function place(track,delaySeconds,shiftTicks){
const delayMs=Math.round(delaySeconds*MOVIE_TIMESCALE);
if(delayMs<1&&shiftTicks<=0)return;
const playedMs=Math.round((track.durationTs-shiftTicks)/track.timescale*MOVIE_TIMESCALE);
if(delayMs>=1)track.addEdit(-1,delayMs);
track.addEdit(shiftTicks,playedMs);
}
export function copyPicture(file,video,fps,override={}){
const slices=(convert)=>video.samples.map((s)=>({
data:file.slice(s.offset,s.offset+s.size),
isKey:s.isKey,
dts:convert(s.dts),
pts:convert(s.pts),
}));
const firstShown=(samples,timescale)=>{
let first=Infinity;
for(const sample of samples)first=Math.min(first,sample.pts);
return first/timescale;
};
if(video.sampleEntry){
const last=video.samples[video.samples.length-1];
const samples=closeGaps(slices((t)=>t),Math.max(1,video.duration-last.dts));
return{
timescale:video.timescale,
sampleEntry:video.sampleEntry,
matrix:override.matrix??video.matrix,
width:override.width??video.trackWidth,
height:override.height??video.trackHeight,
samples,
start:firstShown(samples,video.timescale),
};
}
if(!video.description||!/^avc[13]\./.test(video.codec??'')){
throw new Error('copy.notavc');
}
const tail=video.defaultDuration
?Math.round(video.defaultDuration/1e9*VIDEO_TIMESCALE)
:Math.round(VIDEO_TIMESCALE/Math.max(1,fps));
const samples=closeGaps(slices((t)=>rescale(t,video.timescale,VIDEO_TIMESCALE)),tail);
return{
timescale:VIDEO_TIMESCALE,
sampleEntry:avcSampleEntry(video.codedWidth,video.codedHeight,video.description),
matrix:override.matrix??null,
width:override.width??(video.displayWidth<<16),
height:override.height??(video.displayHeight<<16),
samples,
start:firstShown(samples,VIDEO_TIMESCALE),
};
}
export function copySound(file,audio,sound){
const fromMp4=Boolean(audio.sampleEntry);
const timescale=fromMp4?audio.timescale:Math.round(sound.sampleRate);
const convert=(t)=>rescale(t,audio.timescale,timescale);
const last=audio.samples[audio.samples.length-1];
const tail=fromMp4?Math.max(1,audio.duration-last.dts):AAC_FRAME;
const samples=closeGaps(audio.samples.map((s)=>({
data:file.slice(s.offset,s.offset+s.size),
isKey:true,
dts:convert(s.dts),
pts:convert(s.pts),
})),tail);
return{
timescale,
sampleEntry:sound.sampleEntry,
samples,
start:samples[0].pts/timescale,
};
}
