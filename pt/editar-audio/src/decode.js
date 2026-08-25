/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{sniffSampleRate}from'./samplerate.js';
const FALLBACK_RATE=48000;
export class UnreadableFile extends Error{
constructor(message){
super(message);
this.name='UnreadableFile';
}
}
export async function decodeAudio(file){
const bytes=new Uint8Array(await file.arrayBuffer());
if(!bytes.length)throw new UnreadableFile('That file is empty.');
const declared=sniffSampleRate(bytes);
const rate=declared??FALLBACK_RATE;
let audio;
try{
const context=new OfflineAudioContext(1,1,rate);
audio=await context.decodeAudioData(bytes.slice().buffer);
}catch(error){
throw new UnreadableFile(
'This browser could not read any sound out of that file. Either the '
+'format is one it does not decode, or the file has no audio track in '
+'it at all. MP3, WAV, FLAC, M4A, MP4, MOV, WebM and Ogg all work; AVI, '
+'WMA and most MKVs do not.',
{cause:error});
}
const channels=[];
for(let i=0;i<audio.numberOfChannels;i+=1){
channels.push(audio.getChannelData(i));
}
if(!channels.length||!channels[0].length){
throw new UnreadableFile('There is no sound in that file - it decoded to nothing.');
}
return{
channels,
sampleRate:audio.sampleRate,
frames:channels[0].length,
duration:audio.duration,
guessedRate:declared===null,
};
}
