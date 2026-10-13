/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{prepareWav,packWavFrames}from'./wav.js?v=45ed4394f0';
import{workCheckpoint}from'./cooperative-work.js?v=45ed4394f0';
const BLOCK_FRAMES=8192;
export async function writeWavAsync(channels,sampleRate,
{bits=16,signal,onProgress,budgetMs}={}){
const checkpoint=workCheckpoint({signal,budgetMs});
await checkpoint(true);
const{header,float,frames}=prepareWav(channels,sampleRate,{bits});
const parts=[header];
for(let from=0;from<frames;from+=BLOCK_FRAMES){
const to=Math.min(frames,from+BLOCK_FRAMES);
parts.push(packWavFrames(channels,float,from,to));
onProgress?.({done:to,total:frames});
await checkpoint();
}
await checkpoint();
return new Blob(parts,{type:'audio/wav'});
}
