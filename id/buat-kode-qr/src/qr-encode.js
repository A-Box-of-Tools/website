/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{remainder}from'./gf256.js';
import{
blockLayout,countBits,dataCapacity,remainderBits,
}from'./qr-tables.js';
export const ALPHANUMERIC='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
const MODE_BITS={numeric:0b0001,alphanumeric:0b0010,byte:0b0100};
export function chooseMode(text){
if(/^[0-9]*$/.test(text))return'numeric';
for(const character of text){
if(!ALPHANUMERIC.includes(character))return'byte';
}
return'alphanumeric';
}
export function utf8(text){
return new TextEncoder().encode(text);
}
function unitCount(text,mode){
return mode==='byte'?utf8(text).length:[...text].length;
}
function payloadBits(count,mode){
if(mode==='numeric')return 10*Math.floor(count/3)+[0,4,7][count%3];
if(mode==='alphanumeric')return 11*Math.floor(count/2)+6*(count%2);
return 8*count;
}
function bitLength(count,mode,version){
return 4+countBits(mode,version)+payloadBits(count,mode);
}
export function fitVersion(text,mode,level,min=1,max=40){
const count=unitCount(text,mode);
for(let version=Math.max(1,min);version<=max;version+=1){
if(bitLength(count,mode,version)<=dataCapacity(version,level)*8){
return version;
}
}
return 0;
}
export function capacityFor(mode,version,level){
const bits=dataCapacity(version,level)*8-4-countBits(mode,version);
if(mode==='numeric'){
const whole=Math.floor(bits/10)*3;
const spare=bits%10;
return whole+(spare>=7?2:spare>=4?1:0);
}
if(mode==='alphanumeric'){
return Math.floor(bits/11)*2+(bits%11>=6?1:0);
}
return Math.floor(bits/8);
}
function bitWriter(){
const bits=[];
return{
bits,
push(value,width){
for(let i=width-1;i>=0;i-=1)bits.push((value>>>i)&1);
},
};
}
function writeSegment(text,mode,version){
const writer=bitWriter();
writer.push(MODE_BITS[mode],4);
writer.push(unitCount(text,mode),countBits(mode,version));
if(mode==='numeric'){
for(let i=0;i<text.length;i+=3){
const group=text.slice(i,i+3);
writer.push(Number(group),group.length*3+1);
}
}else if(mode==='alphanumeric'){
const values=[...text].map((character)=>ALPHANUMERIC.indexOf(character));
for(let i=0;i<values.length;i+=2){
if(i+1<values.length)writer.push(values[i]*45+values[i+1],11);
else writer.push(values[i],6);
}
}else{
for(const byte of utf8(text))writer.push(byte,8);
}
return writer.bits;
}
function toCodewords(bits,capacity){
const padded=bits.slice(0,capacity*8);
const terminator=Math.min(4,capacity*8-padded.length);
for(let i=0;i<terminator;i+=1)padded.push(0);
while(padded.length%8!==0)padded.push(0);
const codewords=new Uint8Array(capacity);
for(let i=0;i<padded.length;i+=8){
let byte=0;
for(let j=0;j<8;j+=1)byte=(byte<<1)|padded[i+j];
codewords[i/8]=byte;
}
const pad=[0xec,0x11];
for(let i=padded.length/8,n=0;i<capacity;i+=1,n+=1){
codewords[i]=pad[n%2];
}
return codewords;
}
export function interleave(codewords,version,level){
const layout=blockLayout(version,level);
const blocks=[];
let offset=0;
for(let i=0;i<layout.blocks;i+=1){
const length=layout.shortLength+(i>=layout.blocks-layout.longBlocks?1:0);
const data=codewords.subarray(offset,offset+length);
offset+=length;
blocks.push({data,ec:remainder(data,layout.ecPerBlock)});
}
const result=new Uint8Array(codewords.length+layout.ecPerBlock*layout.blocks);
let at=0;
for(let i=0;i<=layout.shortLength;i+=1){
for(const block of blocks){
if(i<block.data.length)result[at++]=block.data[i];
}
}
for(let i=0;i<layout.ecPerBlock;i+=1){
for(const block of blocks)result[at++]=block.ec[i];
}
return result;
}
export function encodeText(text,options={},t){
const level=options.level??'M';
const mode=options.mode??chooseMode(text);
const version=fitVersion(text,mode,level,options.minVersion??1,
options.maxVersion??40);
if(version===0){
throw new RangeError(t('qr.toolong',{
level,
count:unitCount(text,mode),
unit:t(mode==='byte'?'unit.bytes':'unit.characters'),
most:capacityFor(mode,options.maxVersion??40,level),
}));
}
const capacity=dataCapacity(version,level);
const bits=writeSegment(text,mode,version);
return{
codewords:interleave(toCodewords(bits,capacity),version,level),
version,
level,
mode,
bits:bits.length,
capacityBits:capacity*8,
remainderBits:remainderBits(version),
};
}
