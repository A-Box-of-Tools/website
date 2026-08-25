/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const SOF3=0xc3;
const DHT=0xc4;
const SOI=0xd8;
const EOI=0xd9;
const SOS=0xda;
const DRI=0xdd;
export function decodeJPEGLossless(bytes){
const state={
frame:null,
huffman:[],
restartInterval:0,
output:null,
};
let at=0;
if(!(bytes[0]===0xff&&bytes[1]===SOI)){
throw new Error('this fragment does not start with a JPEG SOI marker');
}
at=2;
while(at<bytes.length){
if(bytes[at]!==0xff){
at+=1;
continue;
}
const marker=bytes[at+1];
at+=2;
if(marker===0xff||marker===0x00)continue;
if(marker===EOI)break;
const length=(bytes[at]<<8)|bytes[at+1];
const from=at+2;
const to=at+length;
if(marker===SOF3){
state.frame=readFrameHeader(bytes,from);
state.output=new Uint16Array(
state.frame.width*state.frame.height*state.frame.components.length,
);
}else if(marker===DHT){
readHuffmanTables(bytes,from,to,state.huffman);
}else if(marker===DRI){
state.restartInterval=(bytes[from]<<8)|bytes[from+1];
}else if(marker===SOS){
if(!state.frame)throw new Error('a JPEG scan arrived before its frame header');
at=readScan(bytes,from,to,state);
continue;
}else if(isBaseline(marker)){
throw new Error('this fragment is a DCT-based JPEG, not a lossless one');
}
at=to;
}
if(!state.frame)throw new Error('this fragment carries no JPEG frame header');
return{
width:state.frame.width,
height:state.frame.height,
precision:state.frame.precision,
components:state.frame.components.length,
samples:state.output,
};
}
const isBaseline=(marker)=>marker===0xc0||marker===0xc1||marker===0xc2
||marker===0xc5||marker===0xc6||marker===0xc7||marker===0xc9
||marker===0xca||marker===0xcb;
function readFrameHeader(bytes,at){
const precision=bytes[at];
const height=(bytes[at+1]<<8)|bytes[at+2];
const width=(bytes[at+3]<<8)|bytes[at+4];
const count=bytes[at+5];
const components=[];
for(let index=0;index<count;index+=1){
const base=at+6+index*3;
const sampling=bytes[base+1];
const horizontal=sampling>>4;
const vertical=sampling&15;
if(horizontal!==1||vertical!==1){
throw new Error('this frame subsamples its components, which lossless JPEG '
+'here does not support');
}
components.push({id:bytes[base],index});
}
if(precision<2||precision>16){
throw new Error(`a JPEG frame of ${precision} bits, which is outside the 2 to 16 the format allows`);
}
if(width===0||height===0)throw new Error('a JPEG frame with no size');
return{precision,width,height,components};
}
function readHuffmanTables(bytes,from,to,tables){
let at=from;
while(at<to){
const slot=bytes[at]&15;
at+=1;
const counts=bytes.subarray(at,at+16);
at+=16;
let total=0;
for(const count of counts)total+=count;
const symbols=bytes.subarray(at,at+total);
at+=total;
tables[slot]=buildHuffman(counts,symbols);
}
}
function buildHuffman(counts,symbols){
const mincode=new Int32Array(17);
const maxcode=new Int32Array(17).fill(-1);
const valptr=new Int32Array(17);
let code=0;
let index=0;
for(let length=1;length<=16;length+=1){
const count=counts[length-1];
if(count>0){
valptr[length]=index;
mincode[length]=code;
index+=count;
code+=count;
maxcode[length]=code-1;
}
code<<=1;
}
return{mincode,maxcode,valptr,symbols};
}
class BitReader{
constructor(bytes,at){
this.bytes=bytes;
this.at=at;
this.buffer=0;
this.count=0;
this.marker=0;
}
bit(){
if(this.count===0){
if(this.at>=this.bytes.length){
this.marker=EOI;
return 0;
}
let byte=this.bytes[this.at];
if(byte===0xff){
const next=this.bytes[this.at+1];
if(next!==0x00){
this.marker=next??EOI;
return 0;
}
this.at+=1;
}
this.at+=1;
this.buffer=byte;
this.count=8;
}
this.count-=1;
return(this.buffer>>this.count)&1;
}
bits(count){
let value=0;
for(let step=0;step<count;step+=1)value=(value<<1)|this.bit();
return value;
}
align(){
this.count=0;
}
restart(){
this.align();
while(this.at+1<this.bytes.length){
if(this.bytes[this.at]===0xff){
const marker=this.bytes[this.at+1];
if(marker>=0xd0&&marker<=0xd7){
this.at+=2;
this.marker=0;
return true;
}
if(marker!==0x00&&marker!==0xff)return false;
}
this.at+=1;
}
return false;
}
}
function decodeSymbol(reader,table){
if(!table)throw new Error('this scan names a Huffman table the file never defined');
let code=reader.bit();
for(let length=1;length<=16;length+=1){
if(table.maxcode[length]>=0&&code<=table.maxcode[length]){
return table.symbols[table.valptr[length]+code-table.mincode[length]];
}
code=(code<<1)|reader.bit();
}
throw new Error('a Huffman code longer than the sixteen bits the format allows');
}
function difference(reader,category){
if(category===0)return 0;
if(category===16)return 32768;
const raw=reader.bits(category);
const half=1<<(category-1);
return raw<half?raw-(1<<category)+1:raw;
}
function readScan(bytes,from,to,state){
const count=bytes[from];
const scan=[];
for(let index=0;index<count;index+=1){
const id=bytes[from+1+index*2];
const table=bytes[from+2+index*2]>>4;
const component=state.frame.components.find((each)=>each.id===id)
??state.frame.components[index];
scan.push({component,table:state.huffman[table]});
}
const predictor=bytes[to-3];
const shift=bytes[to-1]&15;
const reader=new BitReader(bytes,to);
decodeSamples(reader,state,scan,predictor,shift);
return reader.at;
}
function predict(mode,a,b,c){
switch(mode){
case 1:return a;
case 2:return b;
case 3:return c;
case 4:return a+b-c;
case 5:return a+((b-c)>>1);
case 6:return b+((a-c)>>1);
case 7:return(a+b)>>1;
default:return a;
}
}
function decodeSamples(reader,state,scan,predictor,shift){
const{width,height,precision,components}=state.frame;
const stride=components.length;
const out=state.output;
const start=1<<(precision-1-shift);
const mask=(1<<16)-1;
let sinceRestart=0;
let atRestart=true;
for(let row=0;row<height;row+=1){
for(let column=0;column<width;column+=1){
if(state.restartInterval>0&&sinceRestart===state.restartInterval){
if(!reader.restart())return;
sinceRestart=0;
atRestart=true;
}
for(const{component,table}of scan){
const offset=(row*width+column)*stride+component.index;
let value;
if(atRestart||(row===0&&column===0)){
value=start;
}else if(column===0){
value=out[offset-width*stride]>>shift;
}else{
const a=out[offset-stride]>>shift;
const b=row===0?0:out[offset-width*stride]>>shift;
const c=row===0?0:out[offset-(width+1)*stride]>>shift;
value=row===0?a:predict(predictor,a,b,c);
}
const category=decodeSymbol(reader,table);
value=(value+difference(reader,category))&mask;
out[offset]=(value<<shift)&mask;
}
atRestart=false;
sinceRestart+=1;
if(reader.marker&&reader.marker!==EOI
&&!(reader.marker>=0xd0&&reader.marker<=0xd7)){
return;
}
}
}
}
