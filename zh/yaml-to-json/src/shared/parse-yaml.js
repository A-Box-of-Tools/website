/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ParseError}from'./parse-errors.js?v=f87a3bb150';
export function printYaml(data,{indent=2}={}){
const step=' '.repeat(Math.max(1,indent));
const lines=[];
const scalar=(node)=>{
switch(node.t){
case'num':return node.raw;
case'bool':return node.value?'true':'false';
case'null':return'null';
default:return yamlString(node.value);
}
};
const isEmpty=(node)=>(node.t==='map'&&!node.pairs.length)
||(node.t==='seq'&&!node.items.length);
const emptyOf=(node)=>(node.t==='map'?'{}':'[]');
const write=(node,prefix,pad)=>{
if(node.t==='map'||node.t==='seq'){
if(isEmpty(node)){lines.push(`${pad}${prefix}${emptyOf(node)}`);return;}
lines.push(`${pad}${prefix.trimEnd()}`);
block(node,pad+step);
return;
}
const text=node.t==='str'?node.value:null;
if(text!==null&&text.includes('\n')&&blockScalarSafe(text)){
const[header,body]=blockScalar(text,pad+step);
lines.push(`${pad}${prefix}${header}`);
lines.push(...body);
return;
}
lines.push(`${pad}${prefix}${scalar(node)}`);
};
const block=(node,pad)=>{
if(node.t==='map'){
for(const pair of node.pairs)write(pair.value,`${yamlKey(pair.key)}: `,pad);
return;
}
for(const item of node.items){
if((item.t==='map'||item.t==='seq')&&!isEmpty(item)){
const before=lines.length;
block(item,pad+step);
lines[before]=`${pad}-${lines[before].slice(pad.length + step.length - 1)}`;
continue;
}
write(item,'- ',pad);
}
};
if(data.t==='map'||data.t==='seq'){
if(isEmpty(data))return`${emptyOf(data)}\n`;
block(data,'');
}else{
write(data,'','');
}
return`${lines.join('\n')}\n`;
}
function yamlKey(key){
return plainSafe(key)?key:quoteYaml(key);
}
function yamlString(value){
return plainSafe(value)?value:quoteYaml(value);
}
function plainSafe(value){
if(value==='')return false;
if(/^[\s]|[\s]$/.test(value))return false;
if(/[\n\r\t]/.test(value))return false;
if('-?:,[]{}#&*!|>\'"%@`'.includes(value[0]))return false;
if(value.includes(': ')||value.endsWith(':'))return false;
if(value.includes(' #'))return false;
if(/^(y|Y|n|N|yes|Yes|YES|no|No|NO|on|On|ON|off|Off|OFF)$/.test(value))return false;
return resolvePlain(value).t==='str';
}
function quoteYaml(value){
if(/[\n\r\t\x00-\x1f]/.test(value)){
let out='"';
for(const ch of value){
const code=ch.codePointAt(0);
if(ch==='"')out+='\\"';
else if(ch==='\\')out+='\\\\';
else if(ch==='\n')out+='\\n';
else if(ch==='\r')out+='\\r';
else if(ch==='\t')out+='\\t';
else if(code<0x20)out+=`\\x${code.toString(16).padStart(2, '0')}`;
else out+=ch;
}
return`${out}"`;
}
return`'${value.replace(/'/g, "''")}'`;
}
function blockScalarSafe(text){
const body=text.endsWith('\n')?text.slice(0,-1):text;
if(/^[ \t]/.test(body))return false;
return body.split('\n').every((line)=>!/[ \t]$/.test(line)&&!/[\r\x00-\x08\x0b\x0c\x0e-\x1f]/.test(line));
}
function blockScalar(text,pad){
let body=text;
let header='|-';
if(body.endsWith('\n\n')){header='|+';body=body.slice(0,-1);}
else if(body.endsWith('\n')){header='|';body=body.slice(0,-1);}
const lines=body.split('\n').map((line)=>(line===''?'':pad+line));
return[header,lines];
}
export function parseYaml(text){
const source=text.replace(/\r\n?/g,'\n').replace(/^\ufeff/,'');
const doc=new Doc(source);
doc.skipBlank();
if(doc.at>=doc.lines.length)return{t:'null'};
const value=doc.parseNode(0);
doc.skipBlank();
if(doc.at<doc.lines.length){
doc.fail('yaml.dedent',doc.at);
}
return value;
}
class Doc{
constructor(source){
this.source=source;
this.lines=source.split('\n');
this.at=0;
this.starts=[];
let offset=0;
for(const line of this.lines){
this.starts.push(offset);
offset+=line.length+1;
}
}
fail(reason,lineIndex,column=0,values){
throw new ParseError(reason,
this.starts[Math.min(lineIndex,this.lines.length-1)]+column,
this.source,values);
}
skipBlank(){
while(this.at<this.lines.length){
const line=this.lines[this.at];
const trimmed=line.trim();
if(trimmed===''||trimmed.startsWith('#')){this.at+=1;continue;}
if(trimmed==='---'&&this.startedDocument){
this.fail('yaml.documents',this.at);
}
if(trimmed==='---'){this.startedDocument=true;this.at+=1;continue;}
if(trimmed==='...'){this.at+=1;continue;}
return;
}
}
indentOf(index){
const line=this.lines[index];
return line.length-line.trimStart().length;
}
parseNode(indent){
this.skipBlank();
if(this.at>=this.lines.length)return{t:'null'};
const here=this.indentOf(this.at);
if(here<indent)return{t:'null'};
const rest=this.lines[this.at].slice(here);
if(rest==='-'||rest.startsWith('- '))return this.parseSequence(here);
if(this.keyEnd(rest)>=0)return this.parseMapping(here);
this.at+=1;
return this.scalarValue(rest,this.at-1,here);
}
parseMapping(indent){
const pairs=[];
for(;;){
this.skipBlank();
if(this.at>=this.lines.length)break;
const here=this.indentOf(this.at);
if(here<indent)break;
const lineIndex=this.at;
if(here>indent)this.fail('yaml.indent',lineIndex);
const rest=this.lines[lineIndex].slice(here);
const end=this.keyEnd(rest);
if(end<0)this.fail('yaml.keyvalue',lineIndex,here);
const key=this.readKey(rest.slice(0,end),lineIndex,here);
const after=rest.slice(end+1).trim();
this.at+=1;
pairs.push({key,value:this.valueAfterKey(after,indent,lineIndex,here+end+1)});
}
return{t:'map',pairs};
}
valueAfterKey(after,indent,lineIndex,column){
if(after!==''&&!after.startsWith('#')){
if(after[0]==='|'||after[0]==='>')return this.blockScalar(after,indent,lineIndex);
return this.scalarValue(after,lineIndex,column);
}
this.skipBlank();
if(this.at>=this.lines.length)return{t:'null'};
const next=this.indentOf(this.at);
if(next>indent)return this.parseNode(next);
const rest=this.lines[this.at].slice(next);
if(next===indent&&(rest==='-'||rest.startsWith('- ')))return this.parseSequence(next);
return{t:'null'};
}
parseSequence(indent){
const items=[];
for(;;){
this.skipBlank();
if(this.at>=this.lines.length)break;
const here=this.indentOf(this.at);
if(here<indent)break;
const lineIndex=this.at;
const rest=this.lines[lineIndex].slice(here);
if(here>indent||!(rest==='-'||rest.startsWith('- ')))break;
const after=rest.slice(1).replace(/^ +/,'');
const column=this.lines[lineIndex].length-after.length;
if(after===''||after.startsWith('#')){
this.at+=1;
this.skipBlank();
const deeper=this.at<this.lines.length?this.indentOf(this.at):-1;
items.push(deeper>indent?this.parseNode(deeper):{t:'null'});
continue;
}
if(after[0]==='|'||after[0]==='>'){
this.at+=1;
items.push(this.blockScalar(after,column-1,lineIndex));
continue;
}
if(this.keyEnd(after)>=0||after==='-'||after.startsWith('- ')){
this.lines[lineIndex]=' '.repeat(column)+after;
items.push(this.parseNode(column));
continue;
}
this.at+=1;
items.push(this.scalarValue(after,lineIndex,column));
}
return{t:'seq',items};
}
keyEnd(rest){
let quote=null;
for(let i=0;i<rest.length;i+=1){
const ch=rest[i];
if(quote){
if(ch==='\\'&&quote==='"'){i+=1;continue;}
if(ch===quote)quote=null;
continue;
}
if(ch==='"'||ch==="'"){quote=ch;continue;}
if(ch==='#'&&i>0&&rest[i-1]===' ')return-1;
if(ch===':'&&(i+1===rest.length||rest[i+1]===' '))return i;
if(ch==='['||ch==='{')return-1;
}
return-1;
}
readKey(raw,lineIndex,column){
const text=raw.trim();
if(text.startsWith('"')||text.startsWith("'")){
return readQuoted(text,(key,values)=>this.fail(key,lineIndex,column,values));
}
if(text.startsWith('&')||text.startsWith('*')||text.startsWith('!')){
this.fail(unsupported(text[0]),lineIndex,column);
}
if(text==='?')this.fail('yaml.complexkey',lineIndex,column);
return text;
}
blockScalar(header,indent,lineIndex){
const match=/^([|>])([+-]?)([0-9]?)([+-]?)\s*(#.*)?$/.exec(header.trim());
if(!match)this.fail('yaml.blockscalar',lineIndex,0,{header:header.trim()});
const folded=match[1]==='>';
const chomp=match[2]||match[4]||'';
const explicit=match[3]?Number(match[3]):0;
const body=[];
let contentIndent=explicit?indent+explicit:0;
while(this.at<this.lines.length){
const line=this.lines[this.at];
if(line.trim()===''){body.push('');this.at+=1;continue;}
const here=this.indentOf(this.at);
if(here<=indent)break;
if(!contentIndent)contentIndent=here;
if(here<contentIndent)break;
body.push(line.slice(contentIndent));
this.at+=1;
}
while(body.length&&body[body.length-1]==='')body.pop();
let value=folded?fold(body):body.join('\n');
if(chomp!=='-'&&body.length)value+='\n';
if(chomp==='+'){
const kept=this.trailingBlanks(indent);
value+='\n'.repeat(kept);
}
return{t:'str',value};
}
trailingBlanks(){
let count=0;
let index=this.at-1;
while(index>=0&&this.lines[index].trim()===''){count+=1;index-=1;}
return count;
}
scalarValue(text,lineIndex,column){
const trimmed=text.trim();
if(trimmed.startsWith('&')||trimmed.startsWith('*')||trimmed.startsWith('!')){
this.fail(unsupported(trimmed[0]),lineIndex,column);
}
if(trimmed.startsWith('[')||trimmed.startsWith('{')){
return parseFlow(trimmed,(key,values)=>this.fail(key,lineIndex,column,values));
}
if(trimmed.startsWith('"')||trimmed.startsWith("'")){
const[value,end]=readQuotedWithEnd(trimmed,
(key,values)=>this.fail(key,lineIndex,column,values));
const after=trimmed.slice(end).trim();
if(after!==''&&!after.startsWith('#')){
this.fail('yaml.afterquote',lineIndex,column);
}
return{t:'str',value};
}
return resolvePlain(stripComment(trimmed));
}
}
function unsupported(mark){
if(mark==='&')return'yaml.anchors';
if(mark==='*')return'yaml.aliases';
return'yaml.tags';
}
function stripComment(text){
const at=text.search(/(^|\s)#/);
return at<0?text:text.slice(0,at===0?0:at).trimEnd();
}
export function resolvePlain(text){
if(text===''||text==='~'||/^(null|Null|NULL)$/.test(text))return{t:'null'};
if(/^(true|True|TRUE)$/.test(text))return{t:'bool',value:true};
if(/^(false|False|FALSE)$/.test(text))return{t:'bool',value:false};
if(/^[-+]?[0-9]+$/.test(text)||/^[-+]?[0-9]*\.[0-9]*(?:[eE][-+]?[0-9]+)?$/.test(text)
||/^[-+]?[0-9]+[eE][-+]?[0-9]+$/.test(text)){
if(text==='.'||text==='-.'||text==='+.')return{t:'str',value:text};
return{t:'num',raw:jsonNumber(text)};
}
if(/^[-+]?0x[0-9a-fA-F]+$/.test(text)||/^[-+]?0o[0-7]+$/.test(text)){
const negative=text.startsWith('-');
const digits=text.replace(/^[-+]/,'');
const value=digits.startsWith('0x')
?parseInt(digits.slice(2),16):parseInt(digits.slice(2),8);
return{t:'num',raw:String(negative?-value:value)};
}
return{t:'str',value:text};
}
function jsonNumber(text){
if(/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?$/.test(text))return text;
const value=Number(text);
return Number.isFinite(value)?String(value):'0';
}
function readQuoted(text,fail){
const[value,end]=readQuotedWithEnd(text,fail);
if(text.slice(end).trim()!=='')fail('yaml.afterquote');
return value;
}
function readQuotedWithEnd(text,fail){
const quote=text[0];
let value='';
let i=1;
for(;i<text.length;i+=1){
const ch=text[i];
if(quote==="'"){
if(ch==="'"){
if(text[i+1]==="'"){value+="'";i+=1;continue;}
return[value,i+1];
}
value+=ch;
continue;
}
if(ch==='\\'){
const next=text[i+1];
const short={n:'\n',t:'\t',r:'\r','0':'\0',b:'\b',f:'\f','"':'"','\\':'\\','/':'/'};
if(next==='u'||next==='x'||next==='U'){
const width=next==='x'?2:next==='u'?4:8;
const digits=text.slice(i+2,i+2+width);
if(!new RegExp(`^[0-9a-fA-F]{${width}}$`).test(digits)){
fail('yaml.hex',{next,width});
}
value+=String.fromCodePoint(parseInt(digits,16));
i+=1+width;
continue;
}
if(next in short){value+=short[next];i+=1;continue;}
fail('yaml.escape',{next:next??''});
}
if(ch==='"')return[value,i+1];
value+=ch;
}
fail('yaml.quoted');
return['',text.length];
}
export function parseFlow(text,fail){
const state={at:0};
const value=readFlowValue(text,state,fail);
skipFlowSpace(text,state);
if(state.at<text.length&&!text.slice(state.at).trim().startsWith('#')){
fail('yaml.afterflow');
}
return value;
}
function skipFlowSpace(text,state){
while(state.at<text.length&&' \t'.includes(text[state.at]))state.at+=1;
}
function readFlowValue(text,state,fail){
skipFlowSpace(text,state);
const ch=text[state.at];
if(ch===undefined)fail('yaml.flowearly');
if(ch==='[')return readFlowSeq(text,state,fail);
if(ch==='{')return readFlowMap(text,state,fail);
if(ch==='"'||ch==="'"){
const[value,end]=readQuotedWithEnd(text.slice(state.at),fail);
state.at+=end;
return{t:'str',value};
}
const start=state.at;
while(state.at<text.length&&!',]}'.includes(text[state.at]))state.at+=1;
return resolvePlain(text.slice(start,state.at).trim());
}
function readFlowSeq(text,state,fail){
state.at+=1;
const items=[];
skipFlowSpace(text,state);
if(text[state.at]===']'){state.at+=1;return{t:'seq',items};}
for(;;){
items.push(readFlowValue(text,state,fail));
skipFlowSpace(text,state);
if(text[state.at]===','){state.at+=1;continue;}
if(text[state.at]===']'){state.at+=1;return{t:'seq',items};}
fail('yaml.flowseq');
}
}
function readFlowMap(text,state,fail){
state.at+=1;
const pairs=[];
skipFlowSpace(text,state);
if(text[state.at]==='}'){state.at+=1;return{t:'map',pairs};}
for(;;){
skipFlowSpace(text,state);
let key;
if(text[state.at]==='"'||text[state.at]==="'"){
const[value,end]=readQuotedWithEnd(text.slice(state.at),fail);
state.at+=end;
key=value;
}else{
const start=state.at;
while(state.at<text.length&&!':,}'.includes(text[state.at]))state.at+=1;
key=text.slice(start,state.at).trim();
}
skipFlowSpace(text,state);
if(text[state.at]!==':')fail('yaml.flowkey');
state.at+=1;
pairs.push({key,value:readFlowValue(text,state,fail)});
skipFlowSpace(text,state);
if(text[state.at]===','){state.at+=1;continue;}
if(text[state.at]==='}'){state.at+=1;return{t:'map',pairs};}
fail('yaml.flowmap');
}
}
function fold(lines){
let out='';
for(let i=0;i<lines.length;i+=1){
const line=lines[i];
if(i===0){out=line;continue;}
if(line===''||lines[i-1]===''||/^[ \t]/.test(line))out+=`\n${line}`;
else out+=` ${line}`;
}
return out;
}
