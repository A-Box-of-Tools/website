/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{logicalScreenPlan}from'./shared/gif-working-budget.js?v=83172b3221';
export const PIXEL_BUDGET=300_000_000;
export const WORKING_LIMIT=512*1024*1024;
export const THUMB=120;
export function thumbnailSize(width,height){
const scale=THUMB/Math.max(width,height);
const shown={width:Math.max(1,Math.round(width*scale)),
height:Math.max(1,Math.round(height*scale))};
return{shown,store:scale>=1?{width,height}:shown};
}
export function thumbnailBytes(width,height){
const{store}=thumbnailSize(width,height);
return logicalScreenPlan({...store}).bytes;
}
export function analysisMemory(gif,inputBytes,{frame,retainedBytes=0,limitBytes=WORKING_LIMIT}={}){
if(![inputBytes,retainedBytes,limitBytes].every(value=>Number.isSafeInteger(value)&&value>=0)){
return{fits:false,screenBytes:null,bytes:null,reason:'invalid'};
}
let extraBytes=inputBytes+retainedBytes+32768;
if(frame){
const patch=logicalScreenPlan({width:frame.width,height:frame.height,copies:2});
if(!patch.fits)return patch;
extraBytes+=patch.bytes+frame.width*frame.height+(frame.payloadBytes??0)
+frame.height*4+thumbnailBytes(frame.width,frame.height)
+thumbnailBytes(gif.width,gif.height)+256;
}
return logicalScreenPlan({width:gif.width,height:gif.height,copies:5,extraBytes,limitBytes});
}
