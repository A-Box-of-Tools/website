/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ParseError}from'./errors.js';
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
let at=0;
const pushText=(raw)=>{
if(raw==='')return;
top().children.push({t:'text',text:raw});
};
while(at<text.length){
const next=text.indexOf('<',at);
if(next<0){pushText(text.slice(at));break;}
pushText(text.slice(at,next));
at=next;
if(text.startsWith('<!--',at)){
const end=text.indexOf('-->',at+4);
if(end<0)throw new ParseError('This comment is never closed',at,text);
top().children.push({t:'comment',text:text.slice(at+4,end)});
at=end+3;
continue;
}
if(text.startsWith('<![CDATA[',at)){
const end=text.indexOf(']]>',at+9);
if(end<0)throw new ParseError('This CDATA section is never closed',at,text);
top().children.push({t:'cdata',text:text.slice(at+9,end)});
at=end+3;
continue;
}
if(text.startsWith('<?',at)||text.startsWith('<!',at)){
const close=text.startsWith('<?',at)?'?>':'>';
const end=text.indexOf(close,at+2);
if(end<0)throw new ParseError('This declaration is never closed',at,text);
top().children.push({t:'directive',text:text.slice(at,end+close.length)});
at=end+close.length;
continue;
}
if(text.startsWith('</',at)){
const end=text.indexOf('>',at);
if(end<0)throw new ParseError('This closing tag is never finished',at,text);
const name=normalise(text.slice(at+2,end).trim(),html);
at=end+1;
const depth=findOpen(stack,name);
if(depth<0){
if(!html){
throw new ParseError(`</${name}> closes a tag that was never opened`,next,text);
}
continue;
}
if(depth<stack.length-1&&!html){
throw new ParseError(
`</${name}> closes an element while <${top().name}> is still open`,next,text);
}
stack.length=depth;
continue;
}
const tag=readTag(text,at,html);
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
throw new ParseError(`<${open.name}> is never closed`,text.length,text);
}
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
function readTag(text,start,html){
let at=start+1;
if(!NAME_START.test(text[at]??'')){
throw new ParseError('A tag name has to start with a letter',at,text);
}
while(at<text.length&&!/[\s/>]/.test(text[at]))at+=1;
const name=normalise(text.slice(start+1,at),html);
const attrs=[];
for(;;){
while(at<text.length&&/\s/.test(text[at]))at+=1;
if(at>=text.length)throw new ParseError(`<${name}> is never finished`,start,text);
if(text[at]==='>')return{name,attrs,selfClosed:false,end:at+1};
if(text.startsWith('/>',at))return{name,attrs,selfClosed:true,end:at+2};
const nameStart=at;
while(at<text.length&&!/[\s=/>]/.test(text[at]))at+=1;
const attrName=text.slice(nameStart,at);
if(attrName===''){
throw new ParseError(`Unexpected "${text[at]}" inside <${name}>`,at,text);
}
while(at<text.length&&/\s/.test(text[at]))at+=1;
if(text[at]!=='='){
if(!html){
throw new ParseError(
`The attribute "${attrName}" has no value, which XML does not allow`,nameStart,text);
}
attrs.push({name:attrName,value:null,quote:'"'});
continue;
}
at+=1;
while(at<text.length&&/\s/.test(text[at]))at+=1;
const quote=text[at];
if(quote==='"'||quote==="'"){
const end=text.indexOf(quote,at+1);
if(end<0)throw new ParseError('This attribute value is never closed',at,text);
attrs.push({name:attrName,value:text.slice(at+1,end),quote});
at=end+1;
continue;
}
if(!html){
throw new ParseError('An attribute value has to be quoted in XML',at,text);
}
const valueStart=at;
while(at<text.length&&!/[\s>]/.test(text[at]))at+=1;
attrs.push({name:attrName,value:text.slice(valueStart,at),quote:'"'});
}
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
const flat=(node)=>{
if(node.t==='text')return collapse(node.text);
if(node.t==='comment')return`<!--${node.text}-->`;
if(node.t==='cdata')return`<![CDATA[${node.text}]]>`;
if(node.t==='directive')return node.text;
const inner=node.children.map(flat).join('');
return isClosed(node)?`${openTag(node)}${inner}</${node.name}>`:openTag(node);
};
const walk=(list,depth)=>{
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
walk(node.children,depth+1);
out.push(`${pad}</${node.name}>`);
}
};
walk(nodes,0);
return minify?out.join(''):`${out.join('\n')}\n`;
}
function collapse(text){
return text.replace(/\s+/g,' ');
}
