/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{AbortedError}from'./shared/errors.js?v=5767f5a173';
export function nativeSlots(){
let active=0;
const waiting=[];
function drain(){
while(active<2&&waiting.length){
const request=waiting.shift();
request.signal?.removeEventListener('abort',request.abort);
active+=1;
let released=false;
request.resolve(()=>{
if(released)return;
released=true;
active-=1;
drain();
});
}
}
return{
get active(){return active;},
take(signal){
return new Promise((resolve,reject)=>{
if(signal?.aborted){reject(new AbortedError());return;}
const request={resolve,signal,abort:null};
request.abort=()=>{
const index=waiting.indexOf(request);
if(index===-1)return;
waiting.splice(index,1);
signal.removeEventListener('abort',request.abort);
reject(new AbortedError());
};
waiting.push(request);
signal?.addEventListener('abort',request.abort,{once:true});
drain();
});
},
};
}
