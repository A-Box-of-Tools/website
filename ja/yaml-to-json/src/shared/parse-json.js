/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ParseError}from'./parse-errors.js?v=f87a3bb150';
export function parseJson(text){
const state={text,at:0};
skipSpace(state);
const value=readValue(state);
skipSpace(state);
if(state.at<text.length){
throw new ParseError('json.trailing',state.at,text,{found:describe(text[state.at])});
}
return value;
}
function readValue(state){
const{text}=state;
const ch=text[state.at];
if(ch===undefined)throw new ParseError('json.early',state.at,text);
if(ch==='{')return readObject(state);
if(ch==='[')return readArray(state);
if(ch==='"')return readString(state);
if(ch==='-'||(ch>='0'&&ch<='9'))return readNumber(state);
for(const word of['true','false','null']){
if(text.startsWith(word,state.at)){
state.at+=word.length;
return word==='null'?{t:'null'}:{t:'bool',value:word==='true'};
}
}
throw new ParseError('json.unexpected',state.at,text,{found:describe(ch)});
}
function readObject(state){
const{text}=state;
const start=state.at;
state.at+=1;
const pairs=[];
skipSpace(state);
if(text[state.at]==='}'){
state.at+=1;
return{t:'map',pairs};
}
for(;;){
skipSpace(state);
if(text[state.at]!=='"'){
throw new ParseError('json.keystring',state.at,text,{found:describe(text[state.at])});
}
const key=readString(state);
skipSpace(state);
if(text[state.at]!==':'){
throw new ParseError('json.colon',state.at,text,{found:describe(text[state.at])});
}
state.at+=1;
skipSpace(state);
const value=readValue(state);
pairs.push({key:key.value,keyRaw:key.raw,value});
skipSpace(state);
if(text[state.at]===','){state.at+=1;continue;}
if(text[state.at]==='}'){state.at+=1;return{t:'map',pairs};}
if(state.at>=text.length){
throw new ParseError('json.object',start,text);
}
throw new ParseError('json.commabrace',state.at,text,{found:describe(text[state.at])});
}
}
function readArray(state){
const{text}=state;
const start=state.at;
state.at+=1;
const items=[];
skipSpace(state);
if(text[state.at]===']'){
state.at+=1;
return{t:'seq',items};
}
for(;;){
skipSpace(state);
items.push(readValue(state));
skipSpace(state);
if(text[state.at]===','){state.at+=1;continue;}
if(text[state.at]===']'){state.at+=1;return{t:'seq',items};}
if(state.at>=text.length){
throw new ParseError('json.array',start,text);
}
throw new ParseError('json.commabracket',state.at,text,{found:describe(text[state.at])});
}
}
const SHORT_ESCAPES={'"':'"','\\':'\\','/':'/',b:'\b',f:'\f',n:'\n',r:'\r',t:'\t'};
function readString(state){
const{text}=state;
const start=state.at;
state.at+=1;
let value='';
for(;;){
const ch=text[state.at];
if(ch===undefined)throw new ParseError('json.string',start,text);
if(ch==='"'){
state.at+=1;
return{t:'str',value,raw:text.slice(start,state.at)};
}
if(ch==='\\'){
const next=text[state.at+1];
if(next==='u'){
const digits=text.slice(state.at+2,state.at+6);
if(!/^[0-9a-fA-F]{4}$/.test(digits)){
throw new ParseError('json.hex',state.at,text);
}
value+=String.fromCharCode(parseInt(digits,16));
state.at+=6;
continue;
}
if(next in SHORT_ESCAPES){
value+=SHORT_ESCAPES[next];
state.at+=2;
continue;
}
throw new ParseError('json.escape',state.at,text,{next:next??''});
}
if(ch<' '){
throw new ParseError('json.control',state.at,text);
}
value+=ch;
state.at+=1;
}
}
const NUMBER=/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/;
function readNumber(state){
const{text}=state;
const match=NUMBER.exec(text.slice(state.at));
if(!match)throw new ParseError('json.number',state.at,text);
const raw=match[0];
const after=text[state.at+raw.length];
if(after==='.'||after==='e'||after==='E'||/[0-9]/.test(after??'')){
throw new ParseError('json.number',state.at,text);
}
state.at+=raw.length;
return{t:'num',raw};
}
function skipSpace(state){
const{text}=state;
while(state.at<text.length&&' \t\n\r'.includes(text[state.at]))state.at+=1;
}
function describe(ch){
if(ch===undefined)return{key:'char.end'};
if(ch==='\n')return{key:'char.newline'};
if(ch==='\t')return{key:'char.tab'};
return{key:'char.is',values:{ch}};
}
export function printJson(data,{indent='  ',sortKeys=false}={}){
const gap=indent===''?'':'\n';
const colon=indent===''?':':': ';
const walk=(node,depth)=>{
const pad=indent===''?'':indent.repeat(depth+1);
const closePad=indent===''?'':indent.repeat(depth);
switch(node.t){
case'map':{
if(!node.pairs.length)return'{}';
const pairs=sortKeys?sortPairs(node.pairs):node.pairs;
const body=pairs
.map((pair)=>`${pad}${jsonString(pair.key, pair.keyRaw)}${colon}${walk(pair.value, depth + 1)}`)
.join(`,${gap}`);
return`{${gap}${body}${gap}${closePad}}`;
}
case'seq':{
if(!node.items.length)return'[]';
const body=node.items
.map((item)=>`${pad}${walk(item, depth + 1)}`)
.join(`,${gap}`);
return`[${gap}${body}${gap}${closePad}]`;
}
case'str':return jsonString(node.value,node.raw);
case'num':return node.raw;
case'bool':return node.value?'true':'false';
default:return'null';
}
};
return walk(data,0);
}
function sortPairs(pairs){
const collator=new Intl.Collator('en',{numeric:true,sensitivity:'variant'});
return[...pairs].sort((a,b)=>collator.compare(a.key,b.key));
}
export function jsonString(value,raw){
if(raw!==undefined)return raw;
let out='"';
for(const ch of value){
const code=ch.codePointAt(0);
if(ch==='"')out+='\\"';
else if(ch==='\\')out+='\\\\';
else if(ch==='\n')out+='\\n';
else if(ch==='\r')out+='\\r';
else if(ch==='\t')out+='\\t';
else if(ch==='\b')out+='\\b';
else if(ch==='\f')out+='\\f';
else if(code<0x20)out+=`\\u${code.toString(16).padStart(4, '0')}`;
else out+=ch;
}
return`${out}"`;
}
