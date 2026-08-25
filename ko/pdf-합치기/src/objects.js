/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export class Name{
constructor(value){
this.value=value;
}
}
const NAMES=new Map();
export function name(value){
let made=NAMES.get(value);
if(!made){
made=new Name(value);
NAMES.set(value,made);
}
return made;
}
export function isName(value,wanted){
return value instanceof Name&&value.value===wanted;
}
export class Ref{
constructor(num,gen){
this.num=num;
this.gen=gen;
}
get key(){
return`${this.num},${this.gen}`;
}
}
export class PdfString{
constructor(bytes){
this.bytes=bytes;
}
}
export class PdfStream{
constructor(dict,raw){
this.dict=dict;
this.raw=raw;
}
}
const SPACE=new Uint8Array(256);
for(const code of[0x00,0x09,0x0a,0x0c,0x0d,0x20])SPACE[code]=1;
const DELIM=new Uint8Array(256);
for(const char of'()<>[]{}/%')DELIM[char.charCodeAt(0)]=1;
function regular(code){
return!SPACE[code]&&!DELIM[code];
}
function isDigit(code){
return code>=0x30&&code<=0x39;
}
function hexValue(code){
if(code>=0x30&&code<=0x39)return code-0x30;
if(code>=0x41&&code<=0x46)return code-0x37;
if(code>=0x61&&code<=0x66)return code-0x57;
return-1;
}
export function ascii(bytes,from,to){
let text='';
const end=Math.min(to,bytes.length);
for(let i=from;i<end;i+=1)text+=String.fromCharCode(bytes[i]);
return text;
}
export function indexOfAscii(bytes,needle,from=0){
const first=needle.charCodeAt(0);
const last=bytes.length-needle.length;
for(let i=Math.max(0,from);i<=last;i+=1){
if(bytes[i]!==first)continue;
let j=1;
while(j<needle.length&&bytes[i+j]===needle.charCodeAt(j))j+=1;
if(j===needle.length)return i;
}
return-1;
}
export function lastIndexOfAscii(bytes,needle,from=bytes.length){
const first=needle.charCodeAt(0);
for(let i=Math.min(from,bytes.length-needle.length);i>=0;i-=1){
if(bytes[i]!==first)continue;
let j=1;
while(j<needle.length&&bytes[i+j]===needle.charCodeAt(j))j+=1;
if(j===needle.length)return i;
}
return-1;
}
export class PdfSyntaxError extends Error{}
export class Parser{
constructor(bytes,pos=0,resolve=null){
this.bytes=bytes;
this.pos=pos;
this.resolve=resolve;
}
skip(){
const{bytes}=this;
while(this.pos<bytes.length){
const code=bytes[this.pos];
if(SPACE[code]){
this.pos+=1;
}else if(code===0x25){
while(this.pos<bytes.length
&&bytes[this.pos]!==0x0a&&bytes[this.pos]!==0x0d)this.pos+=1;
}else{
return;
}
}
}
peekKeyword(){
this.skip();
let end=this.pos;
while(end<this.bytes.length&&regular(this.bytes[end]))end+=1;
return ascii(this.bytes,this.pos,end);
}
eatKeyword(word){
if(this.peekKeyword()!==word)return false;
this.pos+=word.length;
return true;
}
parseValue(depth=0){
if(depth>200)throw new PdfSyntaxError('nested too deeply');
this.skip();
if(this.pos>=this.bytes.length)throw new PdfSyntaxError('ran off the end');
const code=this.bytes[this.pos];
if(code===0x2f)return this.parseName();
if(code===0x28)return this.parseLiteralString();
if(code===0x5b)return this.parseArray(depth);
if(code===0x3c){
return this.bytes[this.pos+1]===0x3c
?this.parseDictOrStream(depth)
:this.parseHexString();
}
if(isDigit(code)||code===0x2b||code===0x2d||code===0x2e){
return this.parseNumberOrRef();
}
const word=this.peekKeyword();
if(word==='true'){this.pos+=4;return true;}
if(word==='false'){this.pos+=5;return false;}
if(word==='null'){this.pos+=4;return null;}
throw new PdfSyntaxError(
`unexpected ${word || `byte 0x${code.toString(16)}`} at ${this.pos}`);
}
parseName(){
this.pos+=1;
const{bytes}=this;
let value='';
while(this.pos<bytes.length&&regular(bytes[this.pos])){
let code=bytes[this.pos];
if(code===0x23&&hexValue(bytes[this.pos+1])>=0
&&hexValue(bytes[this.pos+2])>=0){
code=hexValue(bytes[this.pos+1])*16+hexValue(bytes[this.pos+2]);
this.pos+=2;
}
value+=String.fromCharCode(code);
this.pos+=1;
}
return name(value);
}
parseNumberOrRef(){
const start=this.pos;
const first=this.readNumber();
if(Number.isInteger(first)&&first>=0){
const save=this.pos;
this.skip();
if(isDigit(this.bytes[this.pos])){
const gen=this.readNumber();
if(Number.isInteger(gen)&&gen>=0){
this.skip();
if(this.bytes[this.pos]===0x52&&!regular(this.bytes[this.pos+1]??0x20)){
this.pos+=1;
return new Ref(first,gen);
}
}
}
this.pos=save;
}
if(!Number.isFinite(first))throw new PdfSyntaxError(`bad number at ${start}`);
return first;
}
readNumber(){
const{bytes}=this;
const start=this.pos;
if(bytes[this.pos]===0x2b||bytes[this.pos]===0x2d)this.pos+=1;
while(this.pos<bytes.length
&&(isDigit(bytes[this.pos])||bytes[this.pos]===0x2e
||bytes[this.pos]===0x2d)){
if(bytes[this.pos]===0x2d&&this.pos>start)break;
this.pos+=1;
}
const value=Number.parseFloat(ascii(bytes,start,this.pos));
return Number.isFinite(value)?value:NaN;
}
parseLiteralString(){
this.pos+=1;
const{bytes}=this;
const out=[];
let depth=1;
while(this.pos<bytes.length){
let code=bytes[this.pos];
this.pos+=1;
if(code===0x5c){
code=bytes[this.pos];
this.pos+=1;
if(code===0x6e){out.push(0x0a);continue;}
if(code===0x72){out.push(0x0d);continue;}
if(code===0x74){out.push(0x09);continue;}
if(code===0x62){out.push(0x08);continue;}
if(code===0x66){out.push(0x0c);continue;}
if(code===0x0a)continue;
if(code===0x0d){
if(bytes[this.pos]===0x0a)this.pos+=1;
continue;
}
if(code>=0x30&&code<=0x37){
let value=code-0x30;
for(let i=0;i<2;i+=1){
const next=bytes[this.pos];
if(next<0x30||next>0x37)break;
value=value*8+(next-0x30);
this.pos+=1;
}
out.push(value&0xff);
continue;
}
out.push(code);
continue;
}
if(code===0x28)depth+=1;
if(code===0x29){
depth-=1;
if(depth===0)break;
}
out.push(code);
}
return new PdfString(Uint8Array.from(out));
}
parseHexString(){
this.pos+=1;
const{bytes}=this;
const out=[];
let high=-1;
while(this.pos<bytes.length&&bytes[this.pos]!==0x3e){
const value=hexValue(bytes[this.pos]);
this.pos+=1;
if(value<0)continue;
if(high<0)high=value;
else{out.push(high*16+value);high=-1;}
}
if(high>=0)out.push(high*16);
this.pos+=1;
return new PdfString(Uint8Array.from(out));
}
parseArray(depth){
this.pos+=1;
const out=[];
for(;;){
this.skip();
if(this.pos>=this.bytes.length)throw new PdfSyntaxError('unclosed array');
if(this.bytes[this.pos]===0x5d){this.pos+=1;return out;}
out.push(this.parseValue(depth+1));
}
}
parseDictOrStream(depth){
this.pos+=2;
const dict=new Map();
for(;;){
this.skip();
if(this.pos>=this.bytes.length)throw new PdfSyntaxError('unclosed dictionary');
if(this.bytes[this.pos]===0x3e&&this.bytes[this.pos+1]===0x3e){
this.pos+=2;
break;
}
if(this.bytes[this.pos]!==0x2f){
this.parseValue(depth+1);
continue;
}
const key=this.parseName().value;
dict.set(key,this.parseValue(depth+1));
}
const save=this.pos;
if(this.eatKeyword('stream'))return this.readStream(dict);
this.pos=save;
return dict;
}
readStream(dict){
const{bytes}=this;
if(bytes[this.pos]===0x0d)this.pos+=1;
if(bytes[this.pos]===0x0a)this.pos+=1;
const start=this.pos;
let length=dict.get('Length');
if(length instanceof Ref&&this.resolve){
try{
length=this.resolve(length);
}catch{
length=null;
}
}
let end=-1;
if(Number.isInteger(length)&&length>=0&&start+length<=bytes.length){
const after=new Parser(bytes,start+length);
after.skip();
if(ascii(bytes,after.pos,after.pos+9)==='endstream')end=start+length;
}
if(end<0){
end=indexOfAscii(bytes,'endstream',start);
if(end<0)throw new PdfSyntaxError('a stream with no endstream');
if(bytes[end-1]===0x0a)end-=1;
if(bytes[end-1]===0x0d)end-=1;
}
const raw=bytes.subarray(start,Math.max(start,end));
const close=indexOfAscii(bytes,'endstream',end);
this.pos=close<0?end:close+9;
dict.set('Length',raw.length);
return new PdfStream(dict,raw);
}
}
export function parseIndirectObject(bytes,offset,resolve){
const parser=new Parser(bytes,offset,resolve);
parser.skip();
const num=parser.readNumber();
parser.skip();
const gen=parser.readNumber();
if(!parser.eatKeyword('obj'))throw new PdfSyntaxError(`no obj keyword at ${offset}`);
const value=parser.parseValue();
return{num,gen,value};
}
