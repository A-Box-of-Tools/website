/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{Stopped,Unreadable,hashFile}from'./hash.js?v=51082c7ef8';
export async function hashSelection(records,ids,{signal,onProgress,onResult,
onError,reader=hashFile}={}){
const files=[...records];
const asked=[...ids];
for(const record of files){
if(signal?.aborted)throw new Stopped('stopped');
const missing=asked.filter(id=>!(id in record.digests));
if(!missing.length)continue;
try{
const found=await reader(record.file,missing,{signal,
onProgress:(done,total)=>{if(!signal?.aborted)onProgress?.(record,done,total);},
});
if(signal?.aborted)throw new Stopped('stopped');
onResult?.(record,found);
}catch(error){
if(signal?.aborted||error instanceof Stopped)throw new Stopped('stopped');
if(!(error instanceof Unreadable))throw error;
onError?.(record,error);
}
}
}
