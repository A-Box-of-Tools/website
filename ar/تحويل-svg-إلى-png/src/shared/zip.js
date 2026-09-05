/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{crc32}from'./crc32.js?v=954778cf04';
const LOCAL_SIG=0x04034b50;
const CENTRAL_SIG=0x02014b50;
const END_SIG=0x06054b50;
const FLAG_UTF8=0x0800;
const utf8=new TextEncoder();
function dosStamp(date){
const time=(date.getHours()<<11)|(date.getMinutes()<<5)|(date.getSeconds()>>1);
const day=((date.getFullYear()-1980)<<9)|((date.getMonth()+1)<<5)|date.getDate();
return{time,day};
}
export function makeZip(files){
const stamp=dosStamp(new Date());
const parts=[];
const central=[];
let offset=0;
for(const file of files){
const name=utf8.encode(file.name);
const sum=crc32([file.data]);
const local=new Uint8Array(30+name.length);
const lv=new DataView(local.buffer);
lv.setUint32(0,LOCAL_SIG,true);
lv.setUint16(4,20,true);
lv.setUint16(6,FLAG_UTF8,true);
lv.setUint16(8,0,true);
lv.setUint16(10,stamp.time,true);
lv.setUint16(12,stamp.day,true);
lv.setUint32(14,sum,true);
lv.setUint32(18,file.data.length,true);
lv.setUint32(22,file.data.length,true);
lv.setUint16(26,name.length,true);
local.set(name,30);
parts.push(local,file.data);
const entry=new Uint8Array(46+name.length);
const cv=new DataView(entry.buffer);
cv.setUint32(0,CENTRAL_SIG,true);
cv.setUint16(4,20,true);
cv.setUint16(6,20,true);
cv.setUint16(8,FLAG_UTF8,true);
cv.setUint16(10,0,true);
cv.setUint16(12,stamp.time,true);
cv.setUint16(14,stamp.day,true);
cv.setUint32(16,sum,true);
cv.setUint32(20,file.data.length,true);
cv.setUint32(24,file.data.length,true);
cv.setUint16(28,name.length,true);
cv.setUint32(42,offset,true);
entry.set(name,46);
central.push(entry);
offset+=local.length+file.data.length;
}
const centralSize=central.reduce((n,e)=>n+e.length,0);
const end=new Uint8Array(22);
const ev=new DataView(end.buffer);
ev.setUint32(0,END_SIG,true);
ev.setUint16(8,files.length,true);
ev.setUint16(10,files.length,true);
ev.setUint32(12,centralSize,true);
ev.setUint32(16,offset,true);
return new Blob([...parts,...central,end],{type:'application/zip'});
}
