/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{throwIfAborted}from'./errors.js?v=83172b3221';
export function workCheckpoint({signal,budgetMs=8}={}){
let since=performance.now();
return async(force=false)=>{
throwIfAborted(signal);
if(force||performance.now()-since>=budgetMs){
await new Promise((resolve)=>{setTimeout(resolve,0);});
throwIfAborted(signal);
since=performance.now();
}
};
}
