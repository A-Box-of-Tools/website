/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CODECS=new Set(['VideoEncoder','VideoDecoder','AudioEncoder','AudioDecoder']);
self.onmessage=async({data})=>{
self.onmessage=null;
const{codec,configs}=data??{};
if(!CODECS.has(codec)||!Array.isArray(configs)){
self.postMessage({index:null});
return;
}
const api=globalThis[codec];
if(typeof api?.isConfigSupported==='function'){
for(let index=0;index<configs.length;index+=1){
try{
const answer=await api.isConfigSupported(configs[index]);
if(answer?.supported===true){
self.postMessage({index});
return;
}
}catch{
}
}
}
self.postMessage({index:-1});
};
