/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{md5}from'./md5.js';
import{sha1}from'./sha1.js';
import{sha256}from'./sha256.js';
import{sha384,sha512}from'./sha512.js';
export const ALGORITHMS={
md5:{create:md5,tag:'MD5',hex:32},
sha1:{create:sha1,tag:'SHA1',hex:40},
sha256:{create:sha256,tag:'SHA256',hex:64},
sha384:{create:sha384,tag:'SHA384',hex:96},
sha512:{create:sha512,tag:'SHA512',hex:128},
};
export const ORDER=['md5','sha1','sha256','sha384','sha512'];
export const CHUNK=4*1024*1024;
export class Stopped extends Error{}
export class Unreadable extends Error{}
export function hex(bytes){
let out='';
for(let i=0;i<bytes.length;i+=1)out+=bytes[i].toString(16).padStart(2,'0');
return out;
}
export async function hashFile(file,ids,{onProgress,signal,chunkSize=CHUNK}={}){
const running=ids.map((id)=>({id,state:ALGORITHMS[id].create()}));
const total=file.size;
let at=0;
onProgress?.(0,total);
while(at<total){
if(signal?.aborted)throw new Stopped('stopped');
let bytes;
try{
bytes=new Uint8Array(await file.slice(at,Math.min(at+chunkSize,total)).arrayBuffer());
}catch(error){
throw new Unreadable(error?.message??'the file could not be read');
}
if(bytes.length===0)throw new Unreadable('the file ended sooner than its size said');
for(const one of running)one.state.update(bytes);
at+=bytes.length;
onProgress?.(at,total);
}
const out={};
for(const one of running)out[one.id]=hex(one.state.digest());
return out;
}
