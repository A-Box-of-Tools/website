/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const TURNS=[90,180,270];
export function turned(rotation,turn){
return(((rotation+turn)%360)+360)%360;
}
export function rotationMatrix(rotation,codedWidth,codedHeight){
const rows={
0:[1,0,0,1,0,0],
90:[0,1,-1,0,codedHeight,0],
180:[-1,0,0,-1,codedWidth,codedHeight],
270:[0,-1,1,0,0,codedWidth],
}[rotation];
if(!rows)throw new Error('rotate.badturn');
const[a,b,c,d,x,y]=rows;
const out=new Uint8Array(36);
const view=new DataView(out.buffer);
const fixed=(n)=>Math.round(n*65536);
view.setInt32(0,fixed(a));
view.setInt32(4,fixed(b));
view.setInt32(8,0);
view.setInt32(12,fixed(c));
view.setInt32(16,fixed(d));
view.setInt32(20,0);
view.setInt32(24,fixed(x));
view.setInt32(28,fixed(y));
view.setInt32(32,0x40000000);
return out;
}
export function shownSize({codedWidth,codedHeight},rotation){
const turnedOnSide=rotation===90||rotation===270;
return turnedOnSide
?{width:codedHeight,height:codedWidth}
:{width:codedWidth,height:codedHeight};
}
export function canCopy(video){
if(video.sampleEntry)return true;
return Boolean(video.description)&&/^avc[13]\./.test(video.codec??'');
}
const BPP_FLOOR=0.06;
const BPP_CEILING=0.25;
const MAX_BITRATE=40_000_000;
export function bakeBitrate({width,height,fps,sourceBitrate}){
const pixelsPerSecond=width*height*Math.max(1,fps);
const asked=(sourceBitrate||0)*1.2;
const floor=pixelsPerSecond*BPP_FLOOR;
const ceiling=pixelsPerSecond*BPP_CEILING;
const chosen=Math.min(MAX_BITRATE,Math.max(floor,Math.min(ceiling,asked)));
return Math.max(1000,Math.round(chosen/1000)*1000);
}
const MAX_EDGE=3840;
export function bakeFrame({width,height}){
let w=width;
let h=height;
const long=Math.max(w,h);
if(long>MAX_EDGE){
const scale=MAX_EDGE/long;
w=Math.round(w*scale);
h=Math.round(h*scale);
}
return{width:Math.max(2,w-(w%2)),height:Math.max(2,h-(h%2))};
}
