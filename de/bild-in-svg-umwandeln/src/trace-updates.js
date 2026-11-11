/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function traceUpdates({remask,trace,queued,settled,failed}){
let kind=null,timer=0,owner=null;
const flush=()=>{
if(!kind)return true;
clearTimeout(timer);
const work=kind;
kind=owner=null;
timer=0;
try{
(work==='mask'?remask:trace)();
return true;
}catch(error){
failed(error);
return false;
}finally{settled();}
};
return{
get pending(){return kind!==null;},
queue(next){
kind=kind==='mask'||next==='mask'?'mask':'trace';
clearTimeout(timer);
const current={};
owner=current;
queued();
timer=setTimeout(()=>{if(owner===current)flush();},120);
},
flush,
cancel(){
clearTimeout(timer);
timer=0;
const wasPending=kind!==null;
kind=owner=null;
if(wasPending)settled();
},
};
}
