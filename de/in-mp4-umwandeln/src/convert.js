/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{Mp4Writer}from'./shared/mp4-writer.js?v=dbc6801bc3';
import{reencodeVideo,VIDEO_TIMESCALE}from'./shared/reencode-video.js?v=dbc6801bc3';
import{reencodeSound}from'./shared/reencode-sound.js?v=dbc6801bc3';
import{compositionShift,copyPicture,copySound,place}from'./shared/copy-tracks.js?v=dbc6801bc3';
export async function convert({
file,media,sound,jobs,frame,bitrate,fps,onProgress,signal,
}){
const{video,audio}=media;
let soundTrack=null;
if(jobs.sound==='encode'){
soundTrack=await reencodeSound({file,audio,sound,onProgress,signal});
}else if(jobs.sound==='copy'){
soundTrack=copySound(file,audio,sound);
}
let pictureTrack;
let frames=video.samples.length;
let codec=null;
if(jobs.picture==='encode'){
const picture=await reencodeVideo({file,video,frame,bitrate,fps,onProgress,signal});
pictureTrack={
timescale:VIDEO_TIMESCALE,
sampleEntry:picture.sampleEntry,
matrix:null,
width:frame.width<<16,
height:frame.height<<16,
samples:picture.samples,
start:picture.samples[0].dts/VIDEO_TIMESCALE,
};
frames=picture.frames;
codec=picture.codec;
}else{
pictureTrack=copyPicture(file,video,fps);
}
onProgress?.({phase:'writing',done:1,total:1});
const writer=new Mp4Writer();
const base=Math.min(pictureTrack.start,soundTrack?soundTrack.start:Infinity);
const videoTrack=writer.addTrack({
kind:'vide',
timescale:pictureTrack.timescale,
sampleEntry:pictureTrack.sampleEntry,
matrix:pictureTrack.matrix,
width:pictureTrack.width,
height:pictureTrack.height,
});
for(const sample of pictureTrack.samples)videoTrack.addSample(sample);
place(videoTrack,pictureTrack.start-base,compositionShift(pictureTrack.samples));
if(soundTrack){
const audioTrack=writer.addTrack({
kind:'soun',
timescale:soundTrack.timescale,
sampleEntry:soundTrack.sampleEntry,
});
for(const sample of soundTrack.samples)audioTrack.addSample(sample);
place(audioTrack,soundTrack.start-base,0);
}
return{blob:writer.finalize(),frames,codec};
}
