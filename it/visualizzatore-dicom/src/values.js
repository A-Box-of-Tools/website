/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{uidName}from'./uids.js?v=df43bc672f';
const TEXT=new Set(['AE','AS','CS','DA','DS','DT','IS','LO','LT',
'PN','SH','ST','TM','UC','UI','UR','UT']);
const SINGLE=new Set(['LT','ST','UT','UR']);
const NUMERIC={
US:['getUint16',2],SS:['getInt16',2],
UL:['getUint32',4],SL:['getInt32',4],
FL:['getFloat32',4],FD:['getFloat64',8],
OL:['getUint32',4],OF:['getFloat32',4],OD:['getFloat64',8],
};
export function charset(declared){
const first=String(declared??'').split('\\')[0].trim().toUpperCase();
const label={
'':'windows-1252',
'ISO_IR 6':'windows-1252',
'ISO_IR 100':'iso-8859-1',
'ISO_IR 101':'iso-8859-2',
'ISO_IR 109':'iso-8859-3',
'ISO_IR 110':'iso-8859-4',
'ISO_IR 126':'iso-8859-7',
'ISO_IR 127':'iso-8859-6',
'ISO_IR 138':'iso-8859-8',
'ISO_IR 144':'iso-8859-5',
'ISO_IR 148':'iso-8859-9',
'ISO_IR 166':'windows-874',
'ISO_IR 192':'utf-8',
GB18030:'gb18030',
GBK:'gbk',
}[first]??'windows-1252';
try{
return new TextDecoder(label);
}catch{
return new TextDecoder('windows-1252');
}
}
export function values(element,decoder){
const{vr,value}=element;
if(!value)return[];
if(vr==='AT'){
const out=[];
const view=new DataView(value.buffer,value.byteOffset,value.byteLength);
for(let at=0;at+4<=value.length;at+=4){
const group=view.getUint16(at,element.little??true);
const number=view.getUint16(at+2,element.little??true);
out.push(`(${hex4(group)},${hex4(number)})`.toUpperCase());
}
return out;
}
const numeric=NUMERIC[vr];
if(numeric){
const[read,width]=numeric;
const view=new DataView(value.buffer,value.byteOffset,value.byteLength);
const out=[];
for(let at=0;at+width<=value.length;at+=width){
out.push(view[read](at,element.little??true));
}
return out;
}
if(!TEXT.has(vr))return[];
const text=trim(decoder.decode(value));
if(SINGLE.has(vr))return[text];
const parts=text.split('\\');
if(vr==='DS'||vr==='IS'){
return parts.map((part)=>{
const number=Number(part.trim());
return part.trim()!==''&&Number.isFinite(number)?number:part.trim();
});
}
return parts;
}
export function number(dataset,tag,decoder,fallback=null){
const element=dataset?.byTag.get(tag);
if(!element)return fallback;
const first=values(element,decoder)[0];
if(typeof first==='number')return first;
const parsed=Number(String(first??'').trim());
return Number.isFinite(parsed)?parsed:fallback;
}
export function numbers(dataset,tag,decoder){
const element=dataset?.byTag.get(tag);
if(!element)return[];
return values(element,decoder)
.map((value)=>(typeof value==='number'?value:Number(String(value).trim())))
.filter((value)=>Number.isFinite(value));
}
export function text(dataset,tag,decoder){
const element=dataset?.byTag.get(tag);
if(!element)return'';
const first=values(element,decoder)[0];
return first===undefined?'':String(first).trim();
}
const trim=(value)=>value.replace(/[\0\s]+$/,'');
const hex4=(value)=>value.toString(16).padStart(4,'0');
export function display(element,decoder,t){
const{vr}=element;
if(element.items){
const count=element.items.length;
return{shown:count===1?'1 item':`${count} items`,raw:'',sequence:true};
}
if(element.fragments){
const total=element.fragments.reduce((sum,part)=>sum+part.length,0);
const count=element.fragments.length;
return{
shown:t(count===1?'value.fragment.one':'value.fragment.many',
{n:count,bytes:total.toLocaleString()}),
raw:'',
};
}
if(!element.value){
return{
shown:t('value.notshown',{bytes:element.length.toLocaleString()}),
raw:'',
};
}
const list=values(element,decoder);
if(list.length===0){
return{
shown:element.length===0?t('value.empty'):binary(element,t),
raw:'',
};
}
const raw=TEXT.has(vr)?trim(decoder.decode(element.value)):'';
const shown=list.map((value)=>pretty(vr,value,t)).join(' \\ ');
return{shown,raw:shown===raw?'':raw};
}
function binary(element,t){
const head=Array.from(element.value.subarray(0,16))
.map((byte)=>byte.toString(16).padStart(2,'0'))
.join(' ');
return t(element.value.length>16?'value.bytes.more':'value.bytes',{
bytes:element.length.toLocaleString(),
head,
});
}
function pretty(vr,value,t){
if(vr==='DA')return date(String(value))??String(value);
if(vr==='TM')return time(String(value))??String(value);
if(vr==='DT')return dateTime(String(value))??String(value);
if(vr==='PN')return personName(String(value));
if(vr==='AS')return age(String(value),t)??String(value);
if(vr==='UI'){
const name=uidName(trim(String(value)));
return name?`${name} (${trim(String(value))})`:trim(String(value));
}
if(vr==='CS')return code(String(value),t);
return String(value);
}
const MONTHS=['January','February','March','April','May','June','July',
'August','September','October','November','December'];
export function date(value){
const digits=value.replace(/[.\s]/g,'');
if(!/^\d{8}$/.test(digits))return null;
const year=Number(digits.slice(0,4));
const month=Number(digits.slice(4,6));
const day=Number(digits.slice(6,8));
if(month<1||month>12||day<1||day>31)return null;
return`${day} ${MONTHS[month - 1]} ${year}`;
}
export function time(value){
const digits=value.replace(/[:\s]/g,'');
if(!/^\d{2}(\d{2}(\d{2}(\.\d+)?)?)?$/.test(digits))return null;
const hour=digits.slice(0,2);
const minute=digits.slice(2,4)||'00';
const second=digits.slice(4,6)||'00';
const fraction=digits.includes('.')?digits.slice(digits.indexOf('.')):'';
return`${hour}:${minute}:${second}${fraction}`;
}
export function dateTime(value){
const clean=value.trim();
const match=/^(\d{8})(\d{2})?(\d{2})?(\d{2})?/.exec(clean);
if(!match)return null;
const day=date(match[1]);
if(!day)return null;
if(!match[2])return day;
return`${day}, ${match[2]}:${match[3] ?? '00'}:${match[4] ?? '00'}`;
}
export function personName(value){
return String(value).split('=').map((group)=>{
const[family='',given='',middle='',prefix='',suffix='']=group.split('^');
const parts=[prefix,given,middle,family,suffix].map((part)=>part.trim());
const joined=parts.filter(Boolean).join(' ');
return joined||group.trim();
}).filter(Boolean).join(' — ');
}
export function age(value,t){
const match=/^(\d{3})([DWMY])$/.exec(value.trim().toUpperCase());
if(!match)return null;
const count=Number(match[1]);
const unit={D:'day',W:'week',M:'month',Y:'year'}[match[2]];
return t(`age.${unit}.${count === 1 ? 'one' : 'many'}`,{n:count});
}
const CODES={
MONOCHROME1:'code.monochrome1',
MONOCHROME2:'code.monochrome2',
'PALETTE COLOR':'code.palette',
'YBR_FULL':'code.ybrfull',
'YBR_FULL_422':'code.ybr422',
HFS:'code.hfs',
HFP:'code.hfp',
FFS:'code.ffs',
FFP:'code.ffp',
M:'code.male',
F:'code.female',
O:'code.other',
};
const code=(value,t)=>{
const clean=String(value).trim();
const key=CODES[clean.toUpperCase()];
return key?t(key):clean;
};
