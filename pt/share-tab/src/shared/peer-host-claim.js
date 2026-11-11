/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export async function createHostClaim(){
const bytes=crypto.getRandomValues(new Uint8Array(32));
const key=btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key)));
return{key,digest:Array.from(digest,(value)=>value.toString(16).padStart(2,'0')).join('')};
}
export function holderUrl(value,claim=null){
const url=new URL(value);
url.searchParams.delete('holder');
if(claim!==null)url.searchParams.set('holder',claim.digest);
return url.href;
}
export function answerHostProve(frame,claim,send){
if(frame?.type!=='host-prove')return false;
if(claim!==null)send({type:'host-proof',key:claim.key});
return true;
}
