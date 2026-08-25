/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ColorHistogram,Palette,medianCut,amplitudeFor,quantizeFrame}from'./quantize.js';
import{GifWriter,diffFrame}from'./gif.js';
export const MAX_COLORS=255;
const MAX_DELAY=0xffff;
const YIELD_EVERY=8;
const breathe=()=>new Promise((resolve)=>{setTimeout(resolve,0);});
export async function encodeGif({
frames,histogram,delays,width,height,
colors=MAX_COLORS,dither=true,loop=true,onProgress,signal,
}){
const palette=new Palette(medianCut(histogram,Math.min(MAX_COLORS,colors)));
const amplitude=dither?amplitudeFor(palette.rgb):0;
const transparent=palette.size;
const writer=new GifWriter({
width,height,palette:palette.rgb,transparentIndex:transparent,loop:loop?0:1,
});
const pixels=width*height;
let previous=null;
let current=new Uint8Array(pixels);
let held=null;
let heldDelay=0;
let written=0;
let dropped=0;
const flush=()=>{
if(!held)return;
writer.addFrame(held.indices,{
x:held.x,
y:held.y,
width:held.width,
height:held.height,
transparent:held.transparent,
delay:Math.min(MAX_DELAY,heldDelay),
});
written+=1;
};
for(let i=0;i<frames.length;i+=1){
if(signal?.aborted){
const error=new Error('Cancelled.');
error.name='AbortError';
throw error;
}
const indices=quantizeFrame(frames[i],width,height,palette,amplitude,current);
frames[i]=null;
let block;
if(previous===null){
block={
indices:indices.slice(),x:0,y:0,width,height,transparent:null,
};
}else{
const changed=diffFrame(previous,indices,width,height,transparent);
if(!changed){
heldDelay+=delays[i];
dropped+=1;
continue;
}
block={
indices:changed.indices,
x:changed.x,
y:changed.y,
width:changed.width,
height:changed.height,
transparent:changed.transparent?transparent:null,
};
}
flush();
held=block;
heldDelay=delays[i];
const spare=previous??new Uint8Array(pixels);
previous=indices;
current=spare;
if(i%YIELD_EVERY===0){
onProgress?.({phase:'encoding',done:i+1,total:frames.length});
await breathe();
}
}
flush();
onProgress?.({phase:'encoding',done:frames.length,total:frames.length});
return{
blob:writer.finish(),
colors:palette.size,
written,
dropped,
};
}
export{ColorHistogram};
