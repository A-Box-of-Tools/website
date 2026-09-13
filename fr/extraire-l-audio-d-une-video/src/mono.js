/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function mixToMono(channels){
if(!channels.length)throw new Error('wav.nochannels');
const frames=channels[0].length;
for(const channel of channels){
if(channel.length!==frames)throw new Error('wav.uneven');
}
if(channels.length===1)return channels[0];
const out=new Float32Array(frames);
for(const channel of channels){
for(let i=0;i<frames;i+=1)out[i]+=channel[i];
}
for(let i=0;i<frames;i+=1)out[i]/=channels.length;
return out;
}
