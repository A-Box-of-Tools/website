/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{Mp4Writer,MOVIE_TIMESCALE}from'./mp4.js';
import{planRanges}from'./ranges.js';
class AbortedError extends Error{
constructor(){
super('Trim cancelled.');
this.name='AbortError';
}
}
function throwIfAborted(signal){
if(signal?.aborted)throw new AbortedError();
}
function rescale(ticks,from,to){
return from===to?ticks:ticks*to/from;
}
export function closeDurations(samples){
for(let i=0;i<samples.length;i++){
const next=samples[i+1];
samples[i].duration=next
?Math.max(1,next.dts-samples[i].dts)
:Math.max(1,samples[i].tailDuration);
}
return samples;
}
export function audioSamplesFor({file,audio,plan,durations,seam,outTimescale}){
const out=[];
if(!plan.audio)return out;
for(let i=plan.audio.from;i<=plan.audio.to;i++){
const sample=audio.samples[i];
const at=sample.dts-plan.audio.base+plan.audio.offset;
const when=seam+Math.round(rescale(at,audio.timescale,outTimescale));
out.push({
data:file.slice(sample.offset,sample.offset+sample.size),
isKey:true,
dts:when,
pts:when,
tailDuration:Math.round(rescale(durations[i],audio.timescale,outTimescale)),
});
}
return out;
}
export async function joinByCopy({clips,keepAudio=true,onProgress,signal}){
const usable=clips.filter((clip)=>clip.ranges.length);
if(!usable.length)throw new Error('nothing.selected');
const firstVideo=usable[0].media.video;
const firstAudio=usable[0].media.audio;
const useAudio=Boolean(
keepAudio&&firstAudio&&usable.every((clip)=>clip.media.audio?.samples.length));
const outVideoTs=firstVideo.timescale;
const outAudioTs=useAudio?firstAudio.timescale:0;
const videoOut=[];
const audioOut=[];
const videoEdits=[];
const audioEdits=[];
const total=usable.reduce((count,clip)=>count
+clip.media.video.samples.length
+(useAudio?clip.media.audio.samples.length:0),0);
let done=0;
let preRoll=0;
const tick=()=>{
done++;
if(done%500===0)onProgress?.({phase:'copying',done,total});
};
onProgress?.({phase:'preparing',done:0,total});
let seamSeconds=0;
for(const clip of usable){
throwIfAborted(signal);
const{video,audio}=clip.media;
const{plans,videoDurations,audioDurations}=planRanges({
video,
audio:useAudio?audio:null,
ranges:clip.ranges,
anchor:'keyframe',
});
const videoSeam=Math.round(seamSeconds*outVideoTs);
const audioSeam=useAudio?Math.round(seamSeconds*outAudioTs):0;
let clipSpanSeconds=0;
for(const plan of plans){
for(let i=plan.video.from;i<=plan.video.to;i++){
const sample=video.samples[i];
const at=sample.dts-plan.video.base+plan.video.offset;
const shown=sample.pts-plan.video.base+plan.video.offset;
videoOut.push({
data:clip.file.slice(sample.offset,sample.offset+sample.size),
isKey:sample.isKey,
dts:videoSeam+Math.round(rescale(at,video.timescale,outVideoTs)),
pts:videoSeam+Math.round(rescale(shown,video.timescale,outVideoTs)),
tailDuration:Math.round(rescale(videoDurations[i],video.timescale,outVideoTs)),
});
tick();
}
if(useAudio&&plan.audio){
for(const sample of audioSamplesFor({
file:clip.file,audio,plan,durations:audioDurations,
seam:audioSeam,outTimescale:outAudioTs,
})){
audioOut.push(sample);
tick();
}
}
const wanted=plan.end-plan.start;
const available=(plan.video.spanTs-plan.video.editStart)/video.timescale;
const playMs=Math.round(Math.max(0,Math.min(wanted,available))*MOVIE_TIMESCALE);
videoEdits.push({
mediaTime:videoSeam+Math.round(rescale(
plan.video.offset+plan.video.editStart,video.timescale,outVideoTs)),
duration:playMs,
});
if(useAudio&&plan.audio){
audioEdits.push({
mediaTime:audioSeam+Math.round(rescale(
plan.audio.offset+plan.audio.editStart,audio.timescale,outAudioTs)),
duration:playMs,
});
}
clipSpanSeconds+=plan.video.spanTs/video.timescale;
preRoll=Math.max(preRoll,plan.preRoll);
}
seamSeconds+=clipSpanSeconds;
}
throwIfAborted(signal);
onProgress?.({phase:'finishing',done:total,total});
const writer=new Mp4Writer();
const videoTrack=writer.addTrack({
kind:'vide',
timescale:outVideoTs,
sampleEntry:firstVideo.sampleEntry,
matrix:firstVideo.matrix,
width:firstVideo.trackWidth,
height:firstVideo.trackHeight,
});
for(const sample of closeDurations(videoOut))videoTrack.addSample(sample);
for(const edit of videoEdits)videoTrack.addEdit(edit.mediaTime,edit.duration);
if(useAudio&&audioOut.length){
const audioTrack=writer.addTrack({
kind:'soun',
timescale:outAudioTs,
sampleEntry:firstAudio.sampleEntry,
});
for(const sample of closeDurations(audioOut))audioTrack.addSample(sample);
for(const edit of audioEdits)audioTrack.addEdit(edit.mediaTime,edit.duration);
}
return{
blob:writer.finalize(),
extension:'mp4',
codec:`${firstVideo.codec}, copied`,
frames:videoOut.length,
clips:usable.length,
exact:false,
preRoll,
};
}
export function trimByCopy({file,media,ranges,keepAudio=true,onProgress,signal}){
return joinByCopy({clips:[{file,media,ranges}],keepAudio,onProgress,signal});
}
export function estimateCopy({media,ranges,keepAudio=true}){
const{video,audio}=media;
if(!ranges.length)return{bytes:0,preRoll:0,frames:0};
const useAudio=Boolean(keepAudio&&audio&&audio.samples.length);
const{plans}=planRanges({
video,
audio:useAudio?audio:null,
ranges,
anchor:'keyframe',
});
let bytes=0;
let frames=0;
let preRoll=0;
for(const plan of plans){
for(let i=plan.video.from;i<=plan.video.to;i++){
bytes+=video.samples[i].size;
frames++;
}
if(plan.audio){
for(let i=plan.audio.from;i<=plan.audio.to;i++)bytes+=audio.samples[i].size;
}
preRoll=Math.max(preRoll,plan.preRoll);
}
return{bytes:Math.round(bytes*1.01),preRoll,frames};
}
export function estimateJoinCopy(clips,keepAudio=true){
const sound=keepAudio&&clips.every((clip)=>clip.media?.audio?.samples.length);
return clips.reduce((total,clip)=>{
if(!clip.media||!clip.ranges.length)return total;
const one=estimateCopy({media:clip.media,ranges:clip.ranges,keepAudio:sound});
return{
bytes:total.bytes+one.bytes,
frames:total.frames+one.frames,
preRoll:Math.max(total.preRoll,one.preRoll),
};
},{bytes:0,frames:0,preRoll:0});
}
