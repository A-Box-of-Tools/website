/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const object=(value)=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const fileId=(value)=>typeof value==='string'&&value.length>0&&value.length<=128;
const fileSize=(value,maxSize)=>Number.isSafeInteger(value)&&value>=0&&value<=maxSize;
const limit=(value)=>Number.isSafeInteger(value)&&value>=0;
const MAX_PARTS=16384;
export function cleanFileList(list,maxSize){
if(!Array.isArray(list)||!limit(maxSize))return[];
const files=[];
const ids=new Set();
for(const entry of list.slice(0,256)){
if(!object(entry)||!fileId(entry.id)||ids.has(entry.id))continue;
if(typeof entry.name!=='string'||entry.name.length>255||!fileSize(entry.size,maxSize))continue;
ids.add(entry.id);
files.push({id:entry.id,name:entry.name,size:entry.size});
}
return files;
}
function receiver(rx,maxSize){
return object(rx)&&limit(maxSize)&&fileId(rx.id)&&fileSize(rx.size,maxSize)
&&Array.isArray(rx.parts)&&Number.isSafeInteger(rx.got)&&rx.got>=0&&rx.got<=rx.size;
}
export function beginFile(rx,msg,maxSize){
if(!receiver(rx,maxSize)||rx.begun===true||rx.got!==0||rx.parts.length!==0)return false;
if(!object(msg)||msg.id!==rx.id||msg.size!==rx.size)return false;
if(typeof msg.mime!=='string'||msg.mime.length>255)return false;
rx.mime=msg.mime;
rx.begun=true;
return true;
}
export function appendFileChunk(rx,buf,maxSize){
if(!receiver(rx,maxSize)||rx.begun!==true||!(buf instanceof ArrayBuffer))return false;
if(buf.byteLength===0)return false;
if(rx.parts.length>=MAX_PARTS)return false;
const next=rx.got+buf.byteLength;
if(next>rx.size||next>maxSize)return false;
rx.parts.push(buf);
rx.got=next;
return true;
}
export function finishFile(rx,msg){
if(!object(rx)||rx.begun!==true||!object(msg)||!fileId(rx.id)||msg.id!==rx.id)return false;
if(!Number.isSafeInteger(rx.size)||rx.size<0||rx.got!==rx.size||!Array.isArray(rx.parts))return false;
rx.begun=false;
return true;
}
