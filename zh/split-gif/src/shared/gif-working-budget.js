/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function logicalScreenPlan({width,height,copies=1,extraBytes=0,limitBytes=Number.MAX_SAFE_INTEGER}){
const invalid=![width,height,copies].every((value)=>Number.isSafeInteger(value)&&value>0)
||![extraBytes,limitBytes].every((value)=>Number.isSafeInteger(value)&&value>=0);
if(invalid)return{fits:false,screenBytes:null,bytes:null,reason:'invalid'};
const pixels=width*height;
const screenBytes=pixels*4;
const rgbaBytes=screenBytes*copies;
const bytes=rgbaBytes+extraBytes;
if(![pixels,screenBytes,rgbaBytes,bytes].every(Number.isSafeInteger)){
return{fits:false,screenBytes:null,bytes:null,reason:'overflow'};
}
return{fits:bytes<=limitBytes,screenBytes,bytes,reason:bytes<=limitBytes?null:'limit'};
}
