/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{decode,encode,FORMATS,outName,release,uniqueNames}from'./image-convert.js?v=06cf296db0';
export function prepareImageBatch(items,settings){
const captured=Object.freeze({...settings});
const sources=items.map((item)=>Object.freeze({...item}));
const names=uniqueNames(sources.map((item)=>outName(item.file.name,FORMATS[captured.mime].ext)));
return Object.freeze({
settings:captured,
jobs:Object.freeze(sources.map((item,index)=>Object.freeze({item,name:names[index]}))),
});
}
const writeImage=async(bitmap,settings)=>({blob:await encode(bitmap,settings)});
const yieldTurn=()=>new Promise((resolve)=>setTimeout(resolve,0));
export async function convertImageBatch(plan,{
read=decode,write=writeImage,dispose=release,
onProgress=()=>{},shouldStop=()=>false,yieldControl=yieldTurn,
}={}){
const results=[];
const failures=[];
let stopped=false;
for(const[index,{item,name}]of plan.jobs.entries()){
if(shouldStop()){stopped=true;break;}
onProgress(index,plan.jobs.length,item);
await yieldControl();
if(shouldStop()){stopped=true;break;}
let decoded;
try{
decoded=await read(item.file);
if(shouldStop()){stopped=true;break;}
const written=await write(decoded.bitmap,{
...plan.settings,width:decoded.width,height:decoded.height,
});
results.push({...written,item,name,settings:plan.settings});
}catch(error){
failures.push({item,error});
}finally{
if(decoded)dispose(decoded.bitmap);
}
if(shouldStop()){stopped=true;break;}
}
return{results,failures,stopped,total:plan.jobs.length};
}
