/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{Name}from'./objects.js';
const IMAGE_FILTERS=new Set([
'DCTDecode','DCT','JPXDecode','JBIG2Decode','CCITTFaxDecode','CCF',
]);
class FilterError extends Error{}
async function inflate(bytes){
try{
return await pump(bytes,'deflate');
}catch(first){
try{
return await pump(bytes,'deflate-raw');
}catch{
throw new FilterError(`Flate stream would not decompress (${first.message})`);
}
}
}
export async function deflate(bytes){
return pump(bytes,'deflate',true);
}
async function pump(bytes,format,compress=false){
const Stream=compress?CompressionStream:DecompressionStream;
if(typeof Stream!=='function'){
throw new FilterError('this browser has no CompressionStream');
}
const stream=new Blob([bytes]).stream().pipeThrough(new Stream(format));
return new Uint8Array(await new Response(stream).arrayBuffer());
}
function lzwDecode(bytes,early=1){
const out=[];
const dict=[];
let dictSize=258;
let codeBits=9;
let previous=null;
let buffer=0;
let bits=0;
const reset=()=>{
dict.length=0;
dictSize=258;
codeBits=9;
previous=null;
};
for(let i=0;i<=bytes.length;i+=1){
if(i<bytes.length){
buffer=(buffer<<8)|bytes[i];
bits+=8;
}else if(bits<codeBits){
break;
}
while(bits>=codeBits){
const code=(buffer>>(bits-codeBits))&((1<<codeBits)-1);
bits-=codeBits;
if(code===256){reset();continue;}
if(code===257)return Uint8Array.from(out);
let entry;
if(code<256)entry=[code];
else if(dict[code-258])entry=dict[code-258];
else if(previous)entry=[...previous,previous[0]];
else throw new FilterError('LZW stream starts with an undefined code');
out.push(...entry);
if(previous){
dict[dictSize-258]=[...previous,entry[0]];
dictSize+=1;
if(dictSize+early>=(1<<codeBits)&&codeBits<12)codeBits+=1;
}
previous=entry;
}
}
return Uint8Array.from(out);
}
function asciiHexDecode(bytes){
const out=[];
let high=-1;
for(const code of bytes){
if(code===0x3e)break;
let value;
if(code>=0x30&&code<=0x39)value=code-0x30;
else if(code>=0x41&&code<=0x46)value=code-0x37;
else if(code>=0x61&&code<=0x66)value=code-0x57;
else continue;
if(high<0)high=value;
else{out.push(high*16+value);high=-1;}
}
if(high>=0)out.push(high*16);
return Uint8Array.from(out);
}
function ascii85Decode(bytes){
const out=[];
let tuple=0;
let count=0;
let i=0;
if(bytes[0]===0x3c&&bytes[1]===0x7e)i=2;
for(;i<bytes.length;i+=1){
const code=bytes[i];
if(code===0x7e)break;
if(code<=0x20||code===0)continue;
if(code===0x7a&&count===0){out.push(0,0,0,0);continue;}
if(code<0x21||code>0x75)continue;
tuple=tuple*85+(code-0x21);
count+=1;
if(count===5){
out.push((tuple>>>24)&0xff,(tuple>>>16)&0xff,
(tuple>>>8)&0xff,tuple&0xff);
tuple=0;
count=0;
}
}
if(count>0){
for(let pad=count;pad<5;pad+=1)tuple=tuple*85+84;
const full=[(tuple>>>24)&0xff,(tuple>>>16)&0xff,
(tuple>>>8)&0xff,tuple&0xff];
out.push(...full.slice(0,count-1));
}
return Uint8Array.from(out);
}
function runLengthDecode(bytes){
const out=[];
let i=0;
while(i<bytes.length){
const run=bytes[i];
i+=1;
if(run===128)break;
if(run<128){
for(let j=0;j<=run;j+=1)out.push(bytes[i+j]??0);
i+=run+1;
}else{
const value=bytes[i]??0;
i+=1;
for(let j=0;j<257-run;j+=1)out.push(value);
}
}
return Uint8Array.from(out);
}
function undoPredictor(data,params,resolve){
const value=(key,fallback)=>{
const raw=resolve(params.get(key));
return typeof raw==='number'?raw:fallback;
};
const predictor=value('Predictor',1);
if(predictor<=1)return data;
const colors=value('Colors',1);
const bpc=value('BitsPerComponent',8);
const columns=value('Columns',1);
const pixelBytes=Math.max(1,Math.ceil((colors*bpc)/8));
const rowBytes=Math.ceil((colors*bpc*columns)/8);
if(predictor===2)return undoTiffPredictor(data,colors,bpc,columns);
const rows=Math.floor(data.length/(rowBytes+1));
const out=new Uint8Array(rows*rowBytes);
let previous=new Uint8Array(rowBytes);
for(let row=0;row<rows;row+=1){
const tag=data[row*(rowBytes+1)];
const from=row*(rowBytes+1)+1;
const line=out.subarray(row*rowBytes,(row+1)*rowBytes);
line.set(data.subarray(from,from+rowBytes));
for(let i=0;i<rowBytes;i+=1){
const left=i>=pixelBytes?line[i-pixelBytes]:0;
const up=previous[i];
const upLeft=i>=pixelBytes?previous[i-pixelBytes]:0;
switch(tag){
case 1:line[i]=(line[i]+left)&0xff;break;
case 2:line[i]=(line[i]+up)&0xff;break;
case 3:line[i]=(line[i]+((left+up)>>1))&0xff;break;
case 4:line[i]=(line[i]+paeth(left,up,upLeft))&0xff;break;
default:break;
}
}
previous=line;
}
return out;
}
function paeth(a,b,c){
const p=a+b-c;
const pa=Math.abs(p-a);
const pb=Math.abs(p-b);
const pc=Math.abs(p-c);
if(pa<=pb&&pa<=pc)return a;
return pb<=pc?b:c;
}
function undoTiffPredictor(data,colors,bpc,columns){
if(bpc!==8)return data;
const rowBytes=colors*columns;
const out=new Uint8Array(data);
for(let row=0;row*rowBytes<out.length;row+=1){
const start=row*rowBytes;
for(let i=colors;i<rowBytes&&start+i<out.length;i+=1){
out[start+i]=(out[start+i]+out[start+i-colors])&0xff;
}
}
return out;
}
export function filterNames(dict,resolve=(v)=>v){
const filter=resolve(dict.get('Filter'));
if(!filter)return[];
const list=Array.isArray(filter)?filter:[filter];
return list.map(resolve).filter((f)=>f instanceof Name).map((f)=>f.value);
}
function decodeParms(dict,count,resolve){
const parms=resolve(dict.get('DecodeParms')??dict.get('DP'));
const list=Array.isArray(parms)?parms:[parms];
return Array.from({length:count},(_,i)=>{
const entry=resolve(list[i]);
return entry instanceof Map?entry:new Map();
});
}
export async function decodeStream(stream,resolve=(v)=>v){
const names=filterNames(stream.dict,resolve);
const parms=decodeParms(stream.dict,names.length,resolve);
let bytes=stream.raw;
for(let i=0;i<names.length;i+=1){
const filter=names[i];
if(IMAGE_FILTERS.has(filter)){
return{bytes,remaining:names.slice(i)};
}
switch(filter){
case'FlateDecode':
case'Fl':
bytes=await inflate(bytes);
break;
case'LZWDecode':
case'LZW':{
const early=resolve(parms[i].get('EarlyChange'));
bytes=lzwDecode(bytes,early===0?0:1);
break;
}
case'ASCIIHexDecode':
case'AHx':
bytes=asciiHexDecode(bytes);
break;
case'ASCII85Decode':
case'A85':
bytes=ascii85Decode(bytes);
break;
case'RunLengthDecode':
case'RL':
bytes=runLengthDecode(bytes);
break;
case'Crypt':
throw new FilterError('this stream is encrypted');
default:
throw new FilterError(`unknown filter /${filter}`);
}
if(filter==='FlateDecode'||filter==='Fl'
||filter==='LZWDecode'||filter==='LZW'){
bytes=undoPredictor(bytes,parms[i],resolve);
}
}
return{bytes,remaining:[]};
}
