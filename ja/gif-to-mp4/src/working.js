/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{logicalScreenPlan}from'./shared/gif-working-budget.js?v=0f1dddbd7c';
export const WORKING_LIMIT=512*1024*1024;
export const ENCODE_QUEUE_LIMIT=1;
export function retainedGifBytes(gif){
const buffers=new Set();
const keep=(view)=>{if(ArrayBuffer.isView(view))buffers.add(view.buffer);};
keep(gif.globalPalette);
for(const frame of gif.frames??[]){keep(frame.palette);keep(frame.indices);}
return[...buffers].reduce((sum,buffer)=>sum+buffer.byteLength,0);
}
export function sourceCopies(gif){
let saved=0;
for(const frame of gif.frames??[]){
if(frame.disposal===3&&++saved===2)break;
}
return 3+saved;
}
export function gifWorkingPlan(gif,size,{chunkBytes=0,retainedBytes=retainedGifBytes(gif),copies=sourceCopies(gif),limitBytes=WORKING_LIMIT}={}){
if(![chunkBytes,retainedBytes].every((value)=>Number.isSafeInteger(value)&&value>=0)){
return{fits:false,screenBytes:null,bytes:null,reason:'invalid'};
}
const output=logicalScreenPlan({width:size.width,height:size.height,copies:ENCODE_QUEUE_LIMIT+2});
if(!output.fits)return output;
return logicalScreenPlan({width:gif.width,height:gif.height,copies,
extraBytes:retainedBytes+output.bytes+chunkBytes,limitBytes});
}
export function headerWorkingPlan(bytes){
if(bytes.byteLength<13)return null;
const signature=String.fromCharCode(...bytes.subarray(0,6));
if(signature!=='GIF87a'&&signature!=='GIF89a')return null;
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
const width=view.getUint16(6,true),height=view.getUint16(8,true);
if(!width||!height)return null;
return logicalScreenPlan({width,height,copies:3,extraBytes:bytes.byteLength,limitBytes:WORKING_LIMIT});
}
export function requireWorking(plan){
if(plan&&!plan.fits)throw new Error(plan.reason==='invalid'||plan.reason==='overflow'?'gif.workinginvalid':'gif.workinglimit');
return plan;
}
