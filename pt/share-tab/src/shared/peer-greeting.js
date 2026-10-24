/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function createChannelGreeting({current,send,failed}){
let opened=false,received=false,stopped=false;
const active=()=>!stopped&&current();
const transmit=()=>{
try{send();}
catch(error){
stopped=true;
failed(error);
return false;
}
return active();
};
return{
open(){
if(!active())return false;
if(opened)return true;
opened=true;
return transmit();
},
receive(){
if(!active()||!opened||received)return false;
received=true;
return transmit();
},
};
}
