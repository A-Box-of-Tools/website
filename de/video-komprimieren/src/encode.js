/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{Mp4Writer}from'./shared/mp4-writer.js?v=04690abd49';
import{reencodeVideo,closeDurations,VIDEO_TIMESCALE}from'./shared/reencode-video.js?v=04690abd49';
export async function compress({
file,media,frame,bitrate,fps,keepAudio,onProgress,signal,
}){
const{video,audio}=media;
const picture=await reencodeVideo({file,video,frame,bitrate,fps,onProgress,signal});
const writer=new Mp4Writer();
const videoTrack=writer.addTrack({
kind:'vide',
timescale:VIDEO_TIMESCALE,
sampleEntry:picture.sampleEntry,
matrix:null,
width:frame.width<<16,
height:frame.height<<16,
});
for(const sample of picture.samples)videoTrack.addSample(sample);
if(keepAudio&&audio?.samples.length){
const audioTrack=writer.addTrack({
kind:'soun',
timescale:audio.timescale,
sampleEntry:audio.sampleEntry,
});
const last=audio.samples[audio.samples.length-1];
const tailAudio=Math.max(1,audio.duration-last.dts);
for(const sample of closeDurations(audio.samples.map((s)=>({
data:file.slice(s.offset,s.offset+s.size),
isKey:true,
dts:s.dts,
pts:s.pts,
tailDuration:tailAudio,
})))){
audioTrack.addSample(sample);
}
}
return{blob:writer.finalize(),frames:picture.frames,codec:picture.codec};
}
