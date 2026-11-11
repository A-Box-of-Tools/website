/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./phrases.js?v=26995dce54';
export async function readText(file){
const bytes=new Uint8Array(await file.arrayBuffer());
const encoding=bytes[0]===0xff&&bytes[1]===0xfe?'utf-16le'
:bytes[0]===0xfe&&bytes[1]===0xff?'utf-16be':'utf-8';
try{
return new TextDecoder(encoding,{fatal:true}).decode(bytes);
}catch{
throw new Error(phrase('text.encoding'));
}
}
export function textImport({busy,done}){
let pending=null;
return{
async read(files,{apply=()=>{},failed}={}){
const owner={};
pending=owner;
busy(files.length);
try{
const texts=await Promise.all(Array.from(files,(file)=>readText(file)));
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
