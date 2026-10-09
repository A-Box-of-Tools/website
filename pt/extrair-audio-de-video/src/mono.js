/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{workCheckpoint}from'./shared/cooperative-work.js?v=45ed4394f0';
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
export async function mixToMonoAsync(channels,{signal,onProgress,budgetMs}={}){
const checkpoint=workCheckpoint({signal,budgetMs});
await checkpoint(true);
if(!channels.length)throw new Error('wav.nochannels');
const frames=channels[0].length;
for(const channel of channels){
if(channel.length!==frames)throw new Error('wav.uneven');
}
if(channels.length===1)return channels[0];
const out=new Float32Array(frames);
let done=0;
const total=frames*(channels.length+1);
for(const channel of channels){
for(let from=0;from<frames;from+=8192){
const to=Math.min(frames,from+8192);
for(let i=from;i<to;i++)out[i]+=channel[i];
done+=to-from;
onProgress?.({done,total});
await checkpoint();
}
}
for(let from=0;from<frames;from+=8192){
const to=Math.min(frames,from+8192);
for(let i=from;i<to;i++)out[i]/=channels.length;
done+=to-from;
onProgress?.({done,total});
await checkpoint();
}
await checkpoint();
return out;
}
