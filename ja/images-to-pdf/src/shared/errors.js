/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export class AbortedError extends Error{
constructor(){
super('aborted');
this.name='AbortError';
}
}
export function throwIfAborted(signal){
if(signal?.aborted)throw new AbortedError();
}
export const said=(key,values={})=>Object.assign(new Error(key),{values});
