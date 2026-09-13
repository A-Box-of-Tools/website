/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function bitrateText(bitsPerSecond){
if(bitsPerSecond>=1_000_000){
return{key:'rate.mbit',values:{n:(bitsPerSecond/1_000_000).toFixed(1)}};
}
return{key:'rate.kbit',values:{n:Math.round(bitsPerSecond/1000)}};
}
export function frameText({width,height}){
return{key:'frame.plain',values:{width,height}};
}
export function timingText(frames,fps){
const delays=new Set(frames.map((frame)=>(frame.delay<2?10:frame.delay)));
return delays.size>1
?{key:'timing.varies',values:{fps}}
:{key:'timing.steady',values:{fps}};
}
export function outName(name){
const stem=name.replace(/\.[^.]+$/,'')||'animation';
return`${stem}.mp4`;
}
