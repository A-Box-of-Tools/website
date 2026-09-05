/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{sniffSampleRate}from'./samplerate.js?v=2782288283';
const FALLBACK_RATE=48000;
export class UnreadableFile extends Error{
constructor(message){
super(message);
this.name='UnreadableFile';
}
}
export async function decodeAudio(file){
const bytes=new Uint8Array(await file.arrayBuffer());
if(!bytes.length)throw new UnreadableFile('audio.empty');
const declared=sniffSampleRate(bytes);
const rate=declared??FALLBACK_RATE;
let audio;
try{
const context=new OfflineAudioContext(1,1,rate);
audio=await context.decodeAudioData(bytes.slice().buffer);
}catch(error){
throw new UnreadableFile('audio.nodecode',{cause:error});
}
const channels=[];
for(let i=0;i<audio.numberOfChannels;i+=1){
channels.push(audio.getChannelData(i));
}
if(!channels.length||!channels[0].length){
throw new UnreadableFile('audio.nosound');
}
return{
channels,
sampleRate:audio.sampleRate,
frames:channels[0].length,
duration:audio.duration,
guessedRate:declared===null,
};
}
