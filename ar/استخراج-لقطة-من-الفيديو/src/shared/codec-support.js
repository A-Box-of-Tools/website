/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const PATIENCE=2000;
export async function askSupported(codec,config,ms=PATIENCE){
if(typeof codec?.isConfigSupported!=='function')return false;
let timer;
const silence=Symbol('no answer');
try{
const answer=await Promise.race([
codec.isConfigSupported(config),
new Promise((resolve)=>{timer=setTimeout(()=>resolve(silence),ms);}),
]);
if(answer===silence)return null;
return Boolean(answer&&answer.supported);
}catch{
return false;
}finally{
clearTimeout(timer);
}
}
