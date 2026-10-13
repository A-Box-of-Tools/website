/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ParseError}from'./parse-errors.js?v=56834407ad';
const VOID=new Set([
'area','base','br','col','embed','hr','img','input',
'link','meta','param','source','track','wbr',
]);
const RAW_TEXT=new Set(['script','style']);
const PRESERVE=new Set(['pre','textarea']);
const CLOSED_BY={
li:new Set(['li']),
dt:new Set(['dt','dd']),
dd:new Set(['dt','dd']),
p:new Set(['address','article','aside','blockquote','div','dl','fieldset',
'footer','form','h1','h2','h3','h4','h5','h6','header','hr','main',
'nav','ol','p','pre','section','table','ul']),
option:new Set(['option','optgroup']),
optgroup:new Set(['optgroup']),
tr:new Set(['tr']),
td:new Set(['td','th','tr']),
th:new Set(['td','th','tr']),
thead:new Set(['tbody','tfoot']),
tbody:new Set(['tbody','tfoot']),
};
const INLINE=new Set([
'a','abbr','b','bdi','bdo','br','cite','code','data','dfn','em',
'i','img','kbd','mark','q','rp','rt','ruby','s','samp','small',
'span','strong','sub','sup','time','u','var','wbr',
]);
export function parseXml(text,{html=false}={}){
const root={t:'element',name:'#document',attrs:[],children:[]};
const stack=[root];
const top=()=>stack[stack.length-1];
const beginning=!html&&text.startsWith('\ufeff')?1:0;
let at=beginning;
let documentElement=false;
let doctype=false;
let xmlVersion='1.0';
const pushText=(raw,start)=>{
if(raw==='')return;
if(!html){
if(stack.length===1&&/[^ \t\r\n]/.test(raw)){
throw new ParseError('xml.document',start+raw.search(/[^ \t\r\n]/),text);
}
validateReferences(raw,start,text,xmlVersion);
}
top().children.push({t:'text',text:raw});
};
while(at<text.length){
const next=text.indexOf('<',at);
if(next<0){pushText(text.slice(at),at);break;}
pushText(text.slice(at,next),at);
at=next;
if(text.startsWith('<!--',at)){
const end=text.indexOf('-->',at+4);
if(end<0)throw new ParseError('xml.comment',at,text);
top().children.push({t:'comment',text:text.slice(at+4,end)});
at=end+3;
continue;
}
if(text.startsWith('<![CDATA[',at)){
if(!html&&stack.length===1)throw new ParseError('xml.document',at,text);
const end=text.indexOf(']]>',at+9);
if(end<0)throw new ParseError('xml.cdata',at,text);
top().children.push({t:'cdata',text:text.slice(at+9,end)});
at=end+3;
continue;
}
if(text.startsWith('<?',at)||text.startsWith('<!',at)){
const processing=text.startsWith('<?',at);
const end=processing?text.indexOf('?>',at+2)+2
:html?text.indexOf('>',at+2)+1:declarationEnd(text,at);
if(end<at+2)throw new ParseError('xml.declaration',at,text);
const raw=text.slice(at,end);
if(!html){
if(/^<\?xml(?=[ \t\r\n?])/i.test(raw)){
if(at!==beginning)throw new ParseError('xml.declarationorder',at,text);
const declaration=XML_DECLARATION.exec(raw);
if(!declaration)throw new ParseError('xml.declarationinvalid',at,text);
xmlVersion=declaration[2];
}else if(!processing){
if(!/^<!DOCTYPE[ \t\r\n]/.test(raw)||stack.length!==1||documentElement||doctype){
throw new ParseError('xml.declarationorder',at,text);
}
doctype=true;
}
}
top().children.push({t:'directive',text:raw});
at=end;
continue;
}
if(text.startsWith('</',at)){
const end=text.indexOf('>',at);
if(end<0)throw new ParseError('xml.closing',at,text);
const name=normalise(text.slice(at+2,end).trim(),html);
at=end+1;
const depth=findOpen(stack,name);
if(depth<0){
if(!html){
throw new ParseError('xml.stray',next,text,{name});
}
continue;
}
if(depth<stack.length-1&&!html){
throw new ParseError('xml.crossed',next,text,{name,open:top().name});
}
stack.length=depth;
continue;
}
if(!html&&stack.length===1){
if(documentElement)throw new ParseError('xml.document',at,text);
documentElement=true;
}
const tag=readTag(text,at,html,xmlVersion);
at=tag.end;
const element={
t:'element',
name:tag.name,
attrs:tag.attrs,
children:[],
selfClosed:tag.selfClosed,
};
if(html){
while(stack.length>1&&CLOSED_BY[top().name]?.has(tag.name))stack.pop();
}
top().children.push(element);
if(tag.selfClosed||(html&&VOID.has(tag.name)))continue;
if(html&&RAW_TEXT.has(tag.name)){
const close=new RegExp(`</${tag.name}\\s*>`,'i');
const rest=text.slice(at);
const found=close.exec(rest);
const body=found?rest.slice(0,found.index):rest;
if(body!=='')element.children.push({t:'text',text:body,raw:true});
at+=body.length+(found?found[0].length:0);
continue;
}
stack.push(element);
}
if(stack.length>1&&!html){
const open=stack[stack.length-1];
throw new ParseError('xml.unclosed',text.length,text,{name:open.name});
}
if(!html&&!documentElement)throw new ParseError('xml.document',text.length,text);
return root.children;
}
function findOpen(stack,name){
for(let i=stack.length-1;i>0;i-=1){
if(stack[i].name===name)return i;
}
return-1;
}
function normalise(name,html){
return html?name.toLowerCase():name;
}
const NAME_START=/[A-Za-z_:]/;
function readTag(text,start,html,xmlVersion){
let at=start+1;
if(!NAME_START.test(text[at]??'')){
throw new ParseError('xml.tagname',at,text);
}
while(at<text.length&&!/[\s/>]/.test(text[at]))at+=1;
const name=normalise(text.slice(start+1,at),html);
const attrs=[];
for(;;){
while(at<text.length&&/\s/.test(text[at]))at+=1;
if(at>=text.length)throw new ParseError('xml.unfinished',start,text,{name});
if(text[at]==='>')return{name,attrs,selfClosed:false,end:at+1};
if(text.startsWith('/>',at))return{name,attrs,selfClosed:true,end:at+2};
const nameStart=at;
while(at<text.length&&!/[\s=/>]/.test(text[at]))at+=1;
const attrName=text.slice(nameStart,at);
if(attrName===''){
throw new ParseError('xml.inside',at,text,{ch:text[at],name});
}
while(at<text.length&&/\s/.test(text[at]))at+=1;
if(text[at]!=='='){
if(!html){
throw new ParseError('xml.attrvalue',nameStart,text,{name:attrName});
}
attrs.push({name:attrName,value:null,quote:'"'});
continue;
}
at+=1;
while(at<text.length&&/\s/.test(text[at]))at+=1;
const quote=text[at];
if(quote==='"'||quote==="'"){
const end=text.indexOf(quote,at+1);
if(end<0)throw new ParseError('xml.attrstring',at,text);
const value=text.slice(at+1,end);
if(!html)validateReferences(value,at+1,text,xmlVersion);
attrs.push({name:attrName,value,quote});
at=end+1;
continue;
}
if(!html){
throw new ParseError('xml.attrquote',at,text);
}
const valueStart=at;
while(at<text.length&&!/[\s>]/.test(text[at]))at+=1;
attrs.push({name:attrName,value:text.slice(valueStart,at),quote:'"'});
}
}
const XML_DECLARATION=/^<\?xml[ \t\r\n]+version[ \t\r\n]*=[ \t\r\n]*(["'])(1\.[0-9]+)\1(?:[ \t\r\n]+encoding[ \t\r\n]*=[ \t\r\n]*(["'])([A-Za-z][A-Za-z0-9._-]*)\3)?(?:[ \t\r\n]+standalone[ \t\r\n]*=[ \t\r\n]*(["'])(yes|no)\5)?[ \t\r\n]*\?>$/;
function declarationEnd(text,start){
let quote='';
let subset=0;
for(let at=start+2;at<text.length;at+=1){
const ch=text[at];
if(quote){if(ch===quote)quote='';continue;}
if(text.startsWith('<!--',at)){
const end=text.indexOf('-->',at+4);
if(end<0)throw new ParseError('xml.declaration',start,text);
at=end+2;
continue;
}
if(ch==='"'||ch==="'"){quote=ch;continue;}
if(ch==='[')subset+=1;
else if(ch===']')subset-=1;
else if(ch==='>'&&subset===0)return at+1;
}
throw new ParseError('xml.declaration',start,text);
}
function referenceCode(reference,version='1.0'){
if(!/^&#(?:[0-9]+|x[0-9a-fA-F]+);$/.test(reference))return null;
const hexadecimal=reference.startsWith('&#x');
const code=parseInt(reference.slice(hexadecimal?3:2,-1),hexadecimal?16:10);
if(!Number.isInteger(code))return null;
if(code>=0x20&&code<=0xd7ff||code>=0xe000&&code<=0xfffd
||code>=0x10000&&code<=0x10ffff)return code;
if(version==='1.1'&&code>=1&&code<0x20||code===9||code===10||code===13)return code;
return null;
}
function validateReferences(raw,start,source,version){
for(const match of raw.matchAll(/&#[^;\s<&]*;?/g)){
if(referenceCode(match[0],version)===null){
throw new ParseError('xml.character',start+match.index,source);
}
}
}
export function unescapeXml(text){
validateReferences(text,0,text,'1.1');
return text.replace(/&(lt|gt|amp|quot|apos|#[0-9]+|#x[0-9a-fA-F]+);/g,(whole,body,at)=>{
if(body[0]==='#'){
const code=referenceCode(whole,'1.1');
if(code===null)throw new ParseError('xml.character',at,text);
return String.fromCodePoint(code);
}
return{lt:'<',gt:'>',amp:'&',quot:'"',apos:"'"}[body];
});
}
export function xmlSpace(element,inherited=false){
const value=unescapeXml(element.attrs.find((attr)=>attr.name==='xml:space')?.value??'');
if(value==='preserve')return true;
return value==='default'?false:inherited;
}
export function printXml(nodes,{indent='  ',minify=false,html=false}={}){
const out=[];
const openTag=(node)=>{
const attrs=node.attrs.map((attr)=>(attr.value===null
?` ${attr.name}`
:` ${attr.name}=${attr.quote}${attr.value}${attr.quote}`)).join('');
if(node.selfClosed||(html&&VOID.has(node.name)&&!node.children.length)){
return html&&VOID.has(node.name)?`<${node.name}${attrs}>`:`<${node.name}${attrs}/>`;
}
return`<${node.name}${attrs}>`;
};
const isClosed=(node)=>!(node.selfClosed||(html&&VOID.has(node.name)));
const inlineOnly=(node)=>node.children.every(
(child)=>child.t==='text'
||(html&&child.t==='element'&&INLINE.has(child.name)&&inlineOnly(child)));
const xmlTextual=(node)=>node.children.some((child)=>child.t==='cdata'
||child.t==='text'&&/[^ \t\r\n]/.test(child.text))
||!node.children.some((child)=>child.t==='element')
&&node.children.some((child)=>child.t==='text');
const flat=(node,inherited=false)=>{
if(node.t==='text')return html?collapse(node.text):node.text;
if(node.t==='comment')return`<!--${node.text}-->`;
if(node.t==='cdata')return`<![CDATA[${node.text}]]>`;
if(node.t==='directive')return node.text;
const preserve=!html&&xmlSpace(node,inherited);
const children=html||preserve||xmlTextual(node)?node.children
:node.children.filter((child)=>child.t!=='text'||/[^ \t\r\n]/.test(child.text));
const inner=children.map((child)=>flat(child,preserve)).join('');
return isClosed(node)?`${openTag(node)}${inner}</${node.name}>`:openTag(node);
};
const walk=(list,depth,inherited=false)=>{
const pad=minify?'':indent.repeat(depth);
for(const node of list){
if(node.t==='text'){
if(node.raw){out.push(pad+node.text.trim());continue;}
const text=collapse(node.text);
if(text.trim()==='')continue;
out.push(pad+text.trim());
continue;
}
if(node.t==='comment'){out.push(`${pad}<!--${node.text}-->`);continue;}
if(node.t==='cdata'){out.push(`${pad}<![CDATA[${node.text}]]>`);continue;}
if(node.t==='directive'){out.push(pad+node.text);continue;}
const preserve=!html&&xmlSpace(node,inherited);
if(!html&&(preserve||xmlTextual(node))){
out.push(pad+flat(node,inherited));
continue;
}
if(!isClosed(node)||!node.children.length){
out.push(pad+openTag(node)+(isClosed(node)?`</${node.name}>`:''));
continue;
}
if(PRESERVE.has(node.name)&&html){
const inner=node.children.map((child)=>(child.t==='text'?child.text:flat(child))).join('');
out.push(`${pad}${openTag(node)}${inner}</${node.name}>`);
continue;
}
if(inlineOnly(node)){
const inner=node.children.map(flat).join('').trim();
out.push(`${pad}${openTag(node)}${inner}</${node.name}>`);
continue;
}
out.push(pad+openTag(node));
walk(node.children,depth+1,preserve);
out.push(`${pad}</${node.name}>`);
}
};
walk(nodes,0);
return minify?out.join(''):`${out.join('\n')}\n`;
}
function collapse(text){
return text.replace(/\s+/g,' ');
}
