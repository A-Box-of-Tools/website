/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const MAGIC=0x69636e73;
const ELEMENT_HEADER=8;
export const ICNS_TYPES=[
{type:'icp4',px:16,role:'icon_16x16'},
{type:'ic11',px:32,role:'icon_16x16@2x'},
{type:'icp5',px:32,role:'icon_32x32'},
{type:'ic12',px:64,role:'icon_32x32@2x'},
{type:'ic07',px:128,role:'icon_128x128'},
{type:'ic13',px:256,role:'icon_128x128@2x'},
{type:'ic08',px:256,role:'icon_256x256'},
{type:'ic14',px:512,role:'icon_256x256@2x'},
{type:'ic09',px:512,role:'icon_512x512'},
{type:'ic10',px:1024,role:'icon_512x512@2x'},
];
export const ICNS_SIZES=[...new Set(ICNS_TYPES.map(({px})=>px))];
function refusal(key,values){
const error=new Error(key);
error.values=values;
return error;
}
export function writeIcns(elements){
if(!elements.length)throw refusal('icns.empty');
for(const element of elements){
if(element.type.length!==4){
throw refusal('icns.type',{type:element.type});
}
}
const total=ELEMENT_HEADER
+elements.reduce((n,element)=>n+ELEMENT_HEADER+element.data.length,0);
const out=new Uint8Array(total);
const view=new DataView(out.buffer);
view.setUint32(0,MAGIC,false);
view.setUint32(4,total,false);
let at=ELEMENT_HEADER;
for(const element of elements){
for(let i=0;i<4;i+=1)out[at+i]=element.type.charCodeAt(i);
view.setUint32(at+4,ELEMENT_HEADER+element.data.length,false);
out.set(element.data,at+ELEMENT_HEADER);
at+=ELEMENT_HEADER+element.data.length;
}
return out;
}
export function readIcnsElements(bytes){
if(bytes.length<ELEMENT_HEADER)throw refusal('icns.short');
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
if(view.getUint32(0,false)!==MAGIC)throw refusal('icns.magic');
const claimed=view.getUint32(4,false);
if(claimed!==bytes.length){
throw refusal('icns.length',{claimed,actual:bytes.length});
}
const sizeOf=new Map(ICNS_TYPES.map(({type,px})=>[type,px]));
const found=[];
let at=ELEMENT_HEADER;
while(at<bytes.length){
if(at+ELEMENT_HEADER>bytes.length)throw refusal('icns.element');
const type=String.fromCharCode(bytes[at],bytes[at+1],bytes[at+2],bytes[at+3]);
const length=view.getUint32(at+4,false);
if(length<ELEMENT_HEADER||at+length>bytes.length){
throw refusal('icns.elementlength',{type});
}
found.push({type,px:sizeOf.get(type)??null,bytes:length-ELEMENT_HEADER});
at+=length;
}
return found;
}
