/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export{describeSound,soundJob}from'./shared/reencode-sound.js?v=dbc6801bc3';
export{closeGaps,compositionShift,rescale}from'./shared/copy-tracks.js?v=dbc6801bc3';
export function isH264(codec){
return/^avc[13]\./.test(codec??'');
}
export function pictureJob(video){
return isH264(video.codec)?'copy':'encode';
}
const BPP_FLOOR=0.06;
const BPP_CEILING=0.25;
export const MAX_BITRATE=40_000_000;
const MAX_EDGE=3840;
export function pictureBitrate({width,height,fps,codec,sourceBitrate}){
const pixelsPerSecond=width*height*Math.max(1,fps);
const factor=/^(vp8|avc)/.test(codec??'')?1.0:1.6;
const asked=(sourceBitrate||0)*factor;
const floor=pixelsPerSecond*BPP_FLOOR;
const ceiling=pixelsPerSecond*BPP_CEILING;
const chosen=Math.min(MAX_BITRATE,Math.max(floor,Math.min(ceiling,asked)));
return Math.max(1000,Math.round(chosen/1000)*1000);
}
export function outputFrame({displayWidth,displayHeight}){
let width=displayWidth;
let height=displayHeight;
const long=Math.max(width,height);
if(long>MAX_EDGE){
const scale=MAX_EDGE/long;
width=Math.round(width*scale);
height=Math.round(height*scale);
}
return{width:Math.max(2,width-(width%2)),height:Math.max(2,height-(height%2))};
}
export function containerOf(name,matroska){
const ext=(name.match(/\.([a-z0-9]+)$/i)?.[1]??'').toLowerCase();
if(matroska)return ext==='webm'?'webm':'mkv';
if(ext==='mov'||ext==='qt')return'mov';
if(ext==='m4v')return'm4v';
return'mp4';
}
