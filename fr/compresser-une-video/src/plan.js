/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const MB=1024*1024;
export const PRESETS=[8,16,25,50,100].map((mb)=>mb*MB);
export const LADDER=[3840,2560,1920,1280,960,854,640,480];
const BPP_FLOOR=0.045;
const SAFETY=0.94;
export const MIN_BITRATE=150_000;
const TABLE_BYTES_PER_SAMPLE=20;
const HEADER_BYTES=4096;
export function fixedBytes(source,keepAudio){
return(keepAudio?source.audioBytes:0)
+HEADER_BYTES+source.samples*TABLE_BYTES_PER_SAMPLE;
}
export function videoBitrate(source,targetBytes,keepAudio){
const room=targetBytes-fixedBytes(source,keepAudio);
if(room<=0||source.seconds<=0)return null;
const rate=(room*8/source.seconds)*SAFETY;
return rate<MIN_BITRATE?null:Math.round(rate);
}
export function chooseFrame(source,bitrate,longEdge=null){
const sourceLong=Math.max(source.displayWidth,source.displayHeight);
const rungs=LADDER.filter((edge)=>edge<=sourceLong);
if(!rungs.length||rungs[0]<sourceLong)rungs.unshift(sourceLong);
let chosen=rungs[rungs.length-1];
let auto=true;
if(longEdge){
chosen=Math.min(longEdge,sourceLong);
auto=false;
}else{
for(const edge of rungs){
const{width,height}=fit(source,edge);
if(bitrate/(width*height*source.fps)>=BPP_FLOOR){
chosen=edge;
break;
}
}
}
return{...fit(source,chosen),longEdge:chosen,auto};
}
export function fit(source,longEdge){
const sourceLong=Math.max(source.displayWidth,source.displayHeight);
const scale=Math.min(1,longEdge/sourceLong);
const even=(n)=>Math.max(2,Math.round((n*scale)/2)*2);
return{width:even(source.displayWidth),height:even(source.displayHeight)};
}
export function plan(source,{targetBytes,keepAudio,longEdge}){
const bitrate=videoBitrate(source,targetBytes,keepAudio);
if(bitrate===null){
const least=fixedBytes(source,keepAudio)+Math.ceil(MIN_BITRATE*source.seconds/8/SAFETY);
return{ok:false,reason:keepAudio&&source.audioBytes?'nofit':'toosmall',least};
}
const frame=chooseFrame(source,bitrate,longEdge);
return{
ok:true,
bitrate,
frame,
estimate:Math.round(bitrate*source.seconds/8)+fixedBytes(source,keepAudio),
};
}
export function retune(bitrate,actualBytes,targetBytes,fixed){
const spent=Math.max(1,actualBytes-fixed);
const allowed=Math.max(1,targetBytes-fixed);
return Math.max(MIN_BITRATE,Math.round(bitrate*(allowed/spent)*0.96));
}
export function fractionOf(sourceBytes,fraction){
return Math.max(1,Math.round(sourceBytes*fraction));
}
