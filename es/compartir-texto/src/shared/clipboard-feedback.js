/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function clipboardFeedback({read,current,write,done,selected,restore,
later=setTimeout,cancel=clearTimeout}){
let version=0;
let timer=null;
function invalidate(){
version+=1;
cancel(timer);
timer=null;
restore();
}
return{
invalidate,
async copy(){
invalidate();
const owner=version;
const value=read();
if(!current(value))return;
const owns=()=>version===owner&&current(value);
try{
await write(value.text);
if(!owns())return;
done();
}catch{
if(!owns())return;
selected(value);
}
if(owns())timer=later(()=>{
if(!owns())return;
timer=null;
restore();
},2500);
},
};
}
