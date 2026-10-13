/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{Cancelled,compareReference,inspect,runStack}from'./pipeline.js?v=6f5ce41257';
let cancelled=false;
let working=false;
const waiting=[];
self.onmessage=(event)=>{
const message=event.data;
if(message?.type==='cancel'){
cancelled=true;
return;
}
if(message?.type!=='run'&&message?.type!=='inspect'&&message?.type!=='compare')return;
waiting.push(message);
pump();
};
async function pump(){
if(working)return;
working=true;
const hooks={
cancelled:()=>cancelled,
onProgress:(update)=>self.postMessage({type:'progress',update}),
};
try{
while(waiting.length){
const message=waiting.shift();
cancelled=false;
try{
if(message.type==='inspect'){
self.postMessage({
type:'inspected',id:message.id,found:await inspect(message.files,hooks),
});
}else if(message.type==='compare'){
self.postMessage({type:'compared',id:message.id,result:await compareReference(message.request,hooks)});
}else{
self.postMessage({type:'done',result:await runStack(message.request,hooks)});
}
}catch(error){
if(error instanceof Cancelled){
self.postMessage({type:'cancelled',id:message.id,kind:message.type});
}else{
self.postMessage({
type:'error',id:message.id,kind:message.type,message:String(error?.message??'error.unknown'),
});
}
}
}
}finally{
working=false;
}
}
