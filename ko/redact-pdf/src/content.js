/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{Name,Parser,PdfString}from'./objects.js';
function startsValue(code){
if(code===0x2f||code===0x28||code===0x5b||code===0x3c)return true;
if(code>=0x30&&code<=0x39)return true;
return code===0x2b||code===0x2d||code===0x2e;
}
export function lex(bytes){
const ops=[];
const parser=new Parser(bytes,0);
let args=[];
let argsStart=-1;
const flush=()=>{
args=[];
argsStart=-1;
};
for(;;){
parser.skip();
if(parser.pos>=bytes.length)break;
const at=parser.pos;
if(startsValue(bytes[at])){
let value;
try{
value=parser.parseValue();
}catch{
parser.pos=at+1;
continue;
}
if(parser.pos<=at)parser.pos=at+1;
if(argsStart<0)argsStart=at;
args.push(value);
continue;
}
const word=parser.peekKeyword();
if(!word){
parser.pos=at+1;
continue;
}
parser.pos=at+word.length;
if(word==='BI'){
const image=readInlineImage(parser,bytes,argsStart<0?at:argsStart);
if(image)ops.push(image);
flush();
continue;
}
ops.push({
name:word,
args,
start:argsStart<0?at:argsStart,
end:parser.pos,
});
flush();
}
return ops;
}
function readInlineImage(parser,bytes,start){
const dict=new Map();
for(;;){
parser.skip();
if(parser.pos>=bytes.length)return null;
if(parser.eatKeyword('ID'))break;
if(bytes[parser.pos]!==0x2f){
return null;
}
let key;
let value;
try{
key=parser.parseValue();
value=parser.parseValue();
}catch{
return null;
}
dict.set(key?.value??'',value);
}
const data=parser.pos+1;
const length=unfilteredLength(dict);
let end=length<0?findEndOfImage(bytes,data):data+length;
if(end<0||end>bytes.length)end=bytes.length;
parser.pos=end;
parser.skip();
parser.eatKeyword('EI');
return{
name:'INLINE_IMAGE',args:[dict],start,end:parser.pos,
};
}
function unfilteredLength(dict){
const filter=dict.get('F')??dict.get('Filter');
if(filter!==undefined&&filter!==null
&&!(Array.isArray(filter)&&filter.length===0))return-1;
const width=dict.get('W')??dict.get('Width');
const height=dict.get('H')??dict.get('Height');
if(!Number.isFinite(width)||!Number.isFinite(height))return-1;
const bits=dict.get('BPC')??dict.get('BitsPerComponent')??8;
const mask=dict.get('IM')??dict.get('ImageMask');
const space=dict.get('CS')??dict.get('ColorSpace');
const components=mask===true?1:componentsIn(space?.value??space);
if(components<0)return-1;
return Math.ceil((width*bits*components)/8)*height;
}
function componentsIn(space){
if(space===undefined||space===null)return 1;
if(space==='G'||space==='DeviceGray'||space==='CalGray')return 1;
if(space==='RGB'||space==='DeviceRGB'||space==='CalRGB')return 3;
if(space==='CMYK'||space==='DeviceCMYK')return 4;
if(space==='I'||space==='Indexed')return 1;
return-1;
}
function findEndOfImage(bytes,from){
for(let at=from;at+1<bytes.length;at+=1){
if(bytes[at]!==0x45||bytes[at+1]!==0x49)continue;
if(at>from&&!isWhite(bytes[at-1]))continue;
const after=bytes[at+2];
if(after===undefined||isWhite(after)||isDelimiter(after))return at-1;
}
return-1;
}
function isWhite(code){
return code===0x20||code===0x0a||code===0x0d||code===0x09
||code===0x00||code===0x0c;
}
function isDelimiter(code){
return'()<>[]{}/%'.includes(String.fromCharCode(code));
}
export function formatNumber(value){
if(!Number.isFinite(value))return'0';
const held=Math.max(-1e10,Math.min(1e10,value));
if(Number.isInteger(held))return String(held);
const text=held.toFixed(6).replace(/0+$/,'').replace(/\.$/,'');
return text===''||text==='-'?'0':text;
}
export function formatString(bytes){
let out='<';
for(const byte of bytes)out+=byte.toString(16).padStart(2,'0');
return`${out}>`;
}
function formatName(value){
let out='/';
for(const character of value){
const code=character.charCodeAt(0);
const plain=code>0x20&&code<0x7f&&!'()<>[]{}/%#'.includes(character);
out+=plain?character:`#${code.toString(16).padStart(2, '0')}`;
}
return out;
}
export function formatValue(value,depth=0){
if(depth>32)return'null';
if(value===null||value===undefined)return'null';
if(value===true)return'true';
if(value===false)return'false';
if(typeof value==='number')return formatNumber(value);
if(value instanceof Name)return formatName(value.value);
if(value instanceof PdfString)return formatString(value.bytes);
if(Array.isArray(value)){
return`[${value.map((item) => formatValue(item, depth + 1)).join(' ')}]`;
}
if(value instanceof Map){
const pairs=[...value].map(([key,item])=>(
`${formatName(key)} ${formatValue(item, depth + 1)}`));
return`<<${pairs.join(' ')}>>`;
}
return'null';
}
export function encode(text){
const out=new Uint8Array(text.length);
for(let i=0;i<text.length;i+=1)out[i]=text.charCodeAt(i)&0xff;
return out;
}
export function applySplices(bytes,splices){
if(!splices.length)return bytes;
const ordered=[...splices].sort((a,b)=>a.start-b.start);
const parts=[];
let at=0;
for(const splice of ordered){
if(splice.start<at)continue;
parts.push(bytes.subarray(at,splice.start));
parts.push(encode(splice.text));
at=splice.end;
}
parts.push(bytes.subarray(at));
const out=new Uint8Array(parts.reduce((sum,part)=>sum+part.length,0));
let write=0;
for(const part of parts){
out.set(part,write);
write+=part.length;
}
return out;
}
