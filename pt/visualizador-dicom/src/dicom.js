/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ByteReader,Truncated}from'./reader.js';
import{describe}from'./dictionary.js';
import{IMPLICIT_LITTLE,transferSyntax}from'./uids.js';
export class NotDicom extends Error{
constructor(message){
super(message);
this.name='NotDicom';
}
}
const PREAMBLE=128;
const MAGIC='DICM';
const UNDEFINED=0xffffffff;
const ITEM='fffee000';
const ITEM_END='fffee00d';
const SEQUENCE_END='fffee0dd';
export const PIXEL_DATA='7fe00010';
const LONG_FORM=new Set(['OB','OD','OF','OL','OV','OW','SQ','UC','UN','UR','UT']);
const KEEP_BYTES=16384;
export function parseFile(bytes){
const warnings=[];
const magicAt=bytes.length>=PREAMBLE+4
?String.fromCharCode(...bytes.subarray(PREAMBLE,PREAMBLE+4))
:'';
if(magicAt!==MAGIC){
const guess=sniff(bytes);
if(!guess){
throw new NotDicom('open.notdicom');
}
warnings.push({key:'note.baredataset',values:{syntax:guess.name}});
return{
hasPreamble:false,
meta:emptyDataset(),
syntax:guess,
datasetStart:0,
warnings,
};
}
const metaSyntax={little:true,explicit:true};
const meta=parseDataset(bytes,{
start:PREAMBLE+4,
end:metaEnd(bytes),
syntax:metaSyntax,
});
const uid=metaValue(meta,'00020010');
if(!uid){
warnings.push({key:'note.nosyntax'});
}
const syntax=transferSyntax(uid||IMPLICIT_LITTLE);
if(uid&&!syntax.known){
warnings.push({key:'note.unknownsyntax',values:{uid}});
}
return{
hasPreamble:true,
meta,
syntax,
datasetStart:meta.end,
warnings:warnings.concat(meta.warnings),
};
}
function metaEnd(bytes){
const reader=new ByteReader(bytes,PREAMBLE+4);
try{
const group=reader.u16();
const element=reader.u16();
const vr=reader.ascii(2);
if(group===2&&element===0&&vr==='UL'){
reader.u16();
const declared=reader.u32();
const end=reader.at+declared;
if(declared>0&&end<=bytes.length)return end;
}
}catch(error){
if(!(error instanceof Truncated))throw error;
}
return scanMetaEnd(bytes);
}
function scanMetaEnd(bytes){
const reader=new ByteReader(bytes,PREAMBLE+4);
let last=reader.at;
try{
while(!reader.done){
const start=reader.at;
if(reader.u16()!==2)return start;
reader.at=start;
readElement(reader,{little:true,explicit:true},false);
last=reader.at;
}
}catch(error){
if(!(error instanceof Truncated))throw error;
}
return last;
}
const metaValue=(meta,tag)=>{
const found=meta.byTag.get(tag);
if(!found?.value)return'';
return trimUid(String.fromCharCode(...found.value));
};
const trimUid=(text)=>text.replace(/[\0 ]+$/,'');
function sniff(bytes){
if(bytes.length<8)return null;
const reader=new ByteReader(bytes);
const group=reader.u16();
reader.u16();
if(group===0||group>0x0100)return null;
const maybeVR=reader.ascii(2);
const explicit=/^[A-Z]{2}$/.test(maybeVR)
&&(LONG_FORM.has(maybeVR)||KNOWN_VR.has(maybeVR));
return transferSyntax(explicit?'1.2.840.10008.1.2.1':IMPLICIT_LITTLE);
}
const KNOWN_VR=new Set([
'AE','AS','AT','CS','DA','DS','DT','FL','FD','IS','LO','LT',
'OB','OD','OF','OL','OV','OW','PN','SH','SL','SQ','SS','ST',
'SV','TM','UC','UI','UL','UN','UR','US','UT','UV',
]);
const emptyDataset=()=>({elements:[],byTag:new Map(),warnings:[],end:0});
export function parseDataset(bytes,{start=0,end=bytes.length,syntax}){
const reader=new ByteReader(bytes,start,end);
reader.little=syntax.little;
const dataset=emptyDataset();
while(!reader.done){
const at=reader.at;
let element;
try{
element=readElement(reader,syntax,true);
}catch(error){
if(!(error instanceof Truncated))throw error;
dataset.warnings.push({key:'note.truncated',values:{at}});
reader.at=end;
break;
}
if(element.tag===ITEM_END||element.tag===SEQUENCE_END)continue;
dataset.elements.push(element);
if(!dataset.byTag.has(element.tag))dataset.byTag.set(element.tag,element);
if(element.stopped){
dataset.warnings.push(element.stopped);
break;
}
}
dataset.end=reader.at;
return dataset;
}
function readElement(reader,syntax,full){
const offsetOfTag=reader.at;
const group=reader.u16();
const number=reader.u16();
const tag=hex4(group)+hex4(number);
if(group===0xfffe){
const length=readU32(reader,true);
return{tag,vr:'na',guessedVR:false,length,offset:reader.at,value:null,
items:null,fragments:null,offsetOfTag,little:true};
}
let vr;
let guessedVR=false;
let length;
if(syntax.explicit){
vr=reader.ascii(2);
if(!KNOWN_VR.has(vr)){
reader.at=offsetOfTag+4;
vr=describe(tag).vr;
guessedVR=true;
length=reader.u32();
}else if(LONG_FORM.has(vr)){
reader.skip(2);
length=reader.u32();
}else{
length=reader.u16();
}
}else{
vr=describe(tag).vr;
guessedVR=true;
length=reader.u32();
}
const element={tag,vr,guessedVR,length,offset:reader.at,value:null,
items:null,fragments:null,offsetOfTag,stopped:null,little:syntax.little};
if(!full){
if(length!==UNDEFINED)reader.skip(length);
return element;
}
readValue(reader,syntax,element);
return element;
}
function readU32(reader,little){
const was=reader.little;
reader.little=little;
const value=reader.u32();
reader.little=was;
return value;
}
function readValue(reader,syntax,element){
const{tag,vr,length}=element;
const isSequence=vr==='SQ'
||(length===UNDEFINED&&vr==='UN'&&tag!==PIXEL_DATA);
if(isSequence){
element.items=readItems(reader,syntax,length);
return;
}
if(length===UNDEFINED){
if(tag===PIXEL_DATA){
const encapsulated=readFragments(reader);
element.fragments=encapsulated.items;
element.offsetTable=encapsulated.table;
return;
}
element.stopped={key:'stop.undefinedlength',values:{tag}};
reader.at=reader.end;
return;
}
if(length>reader.left){
element.stopped={
key:'stop.toolong',
values:{at:element.offsetOfTag,length,left:reader.left},
};
element.length=reader.left;
element.value=keep(reader.slice(reader.left));
return;
}
const bytes=reader.slice(length);
element.value=keep(bytes);
}
const keep=(bytes)=>(bytes.length<=KEEP_BYTES?bytes.slice():null);
function readItems(reader,syntax,length){
const items=[];
const stop=length===UNDEFINED?reader.end:reader.at+length;
while(reader.at<stop&&!reader.done){
const group=reader.u16();
const number=reader.u16();
const tag=hex4(group)+hex4(number);
const itemLength=readU32(reader,true);
if(tag===SEQUENCE_END)break;
if(tag!==ITEM){
reader.at-=8;
break;
}
const from=reader.at;
const to=itemLength===UNDEFINED
?findItemEnd(reader,syntax,stop)
:Math.min(from+itemLength,reader.end);
items.push(parseDataset(reader.bytes,{start:from,end:to,syntax}));
reader.at=itemLength===UNDEFINED?to+8:to;
}
return items;
}
function findItemEnd(reader,syntax,stop){
const scan=new ByteReader(reader.bytes,reader.at,stop);
scan.little=syntax.little;
let depth=0;
while(!scan.done){
const at=scan.at;
let element;
try{
element=readElement(scan,syntax,false);
}catch(error){
if(!(error instanceof Truncated))throw error;
return stop;
}
if(element.tag===ITEM_END){
if(depth===0)return at;
depth-=1;
}else if(element.tag===ITEM){
if(element.length===UNDEFINED)depth+=1;
else scan.skip(Math.min(element.length,scan.left));
}
}
return stop;
}
function readFragments(reader){
const table=[];
const items=[];
let first=true;
while(!reader.done){
const group=reader.u16();
const number=reader.u16();
const tag=hex4(group)+hex4(number);
const length=readU32(reader,true);
if(tag===SEQUENCE_END)break;
if(tag!==ITEM){
reader.at-=8;
break;
}
if(length===UNDEFINED||length>reader.left)break;
const offset=reader.at;
reader.skip(length);
if(first){
first=false;
for(let at=0;at+4<=length;at+=4){
table.push(new DataView(reader.bytes.buffer,reader.bytes.byteOffset+offset+at,4)
.getUint32(0,true));
}
continue;
}
items.push({offset,length});
}
return{table,items};
}
const hex4=(value)=>value.toString(16).padStart(4,'0');
export function*walk(dataset,depth=0){
for(const element of dataset.elements){
yield{element,depth};
if(element.items){
for(const item of element.items)yield*walk(item,depth+1);
}
}
}
