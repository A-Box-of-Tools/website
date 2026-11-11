/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function finishSteps(steps){
let result;
do{result=steps.next();}while(!result.done);
return result.value;
}
export async function readSteps(steps,checkpoint){
try{
while(true){
const result=steps.next();
if(result.done)return result.value;
await checkpoint();
}
}finally{steps.return?.();}
}
