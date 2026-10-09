/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function textImport({busy,done}){
let pending=null;
return{
async read(files,{apply=()=>{},failed}={}){
const owner={};
pending=owner;
busy(files.length);
try{
const texts=await Promise.all(Array.from(files,(file)=>file.text()));
if(pending!==owner)return null;
apply(texts);
return texts;
}catch(error){
if(pending===owner){
if(!failed)throw error;
failed(error);
}
return null;
}finally{
if(pending===owner){
pending=null;
done();
}
}
},
invalidate(){
if(pending===null)return;
pending=null;
done();
},
};
}
