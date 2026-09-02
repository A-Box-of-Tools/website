/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ParseError}from'./shared/parse-errors.js';
export function parseCss(text){
const state={text,at:0};
const nodes=readBlock(state,true);
return nodes;
}
function readBlock(state,top){
const{text}=state;
const nodes=[];
let buffer='';
let bufferStart=state.at;
const flushStatement=(end)=>{
const statement=buffer.trim();
buffer='';
if(statement==='')return;
nodes.push(statement.startsWith('@')
?{t:'at',prelude:statement,children:null}
:{t:'decl',...splitDeclaration(statement,bufferStart,text,end)});
};
while(state.at<text.length){
const ch=text[state.at];
if(ch==='/'&&text[state.at+1]==='*'){
const end=text.indexOf('*/',state.at+2);
if(end<0)throw new ParseError('css.comment',state.at,text);
if(buffer.trim()===''){
nodes.push({t:'comment',text:text.slice(state.at+2,end)});
}else{
buffer+=text.slice(state.at,end+2);
}
state.at=end+2;
continue;
}
if(ch==='"'||ch==="'"){
buffer+=readString(state);
continue;
}
if(ch==='('){
buffer+=readBrackets(state);
continue;
}
if(ch==='{'){
const prelude=buffer.trim();
buffer='';
state.at+=1;
const children=readBlock(state,false);
nodes.push(prelude.startsWith('@')
?{t:'at',prelude,children}
:{t:'rule',prelude,children});
bufferStart=state.at;
continue;
}
if(ch==='}'){
if(top)throw new ParseError('css.brace',state.at,text);
state.at+=1;
flushStatement(state.at);
return nodes;
}
if(ch===';'){
state.at+=1;
flushStatement(state.at);
bufferStart=state.at;
continue;
}
if(buffer==='')bufferStart=state.at;
buffer+=ch;
state.at+=1;
}
if(!top)throw new ParseError('css.block',text.length,text);
flushStatement(state.at);
return nodes;
}
function readString(state){
const{text}=state;
const quote=text[state.at];
const start=state.at;
state.at+=1;
while(state.at<text.length){
const ch=text[state.at];
if(ch==='\\'){state.at+=2;continue;}
if(ch===quote){
state.at+=1;
return text.slice(start,state.at);
}
state.at+=1;
}
throw new ParseError('css.string',start,text);
}
function readBrackets(state){
const{text}=state;
const start=state.at;
let depth=0;
while(state.at<text.length){
const ch=text[state.at];
if(ch==='"'||ch==="'"){readString(state);continue;}
if(ch==='(')depth+=1;
if(ch===')'){
depth-=1;
state.at+=1;
if(depth===0)return text.slice(start,state.at);
continue;
}
state.at+=1;
}
throw new ParseError('css.bracket',start,text);
}
function splitDeclaration(statement,start,text,end){
const state={text:statement,at:0};
while(state.at<statement.length){
const ch=statement[state.at];
if(ch==='"'||ch==="'"){readString(state);continue;}
if(ch==='('){readBrackets(state);continue;}
if(ch===':'){
const prop=statement.slice(0,state.at).trim();
const value=statement.slice(state.at+1).trim();
return{prop,value};
}
state.at+=1;
}
throw new ParseError('css.declaration',Math.min(start,Math.max(0,end-1)),text,{statement});
}
export function printCss(nodes,{indent='  ',minify=false}={}){
if(minify)return squeeze(nodes);
const out=[];
const walk=(list,depth)=>{
const pad=indent.repeat(depth);
list.forEach((node,index)=>{
switch(node.t){
case'comment':
out.push(`${pad}/*${node.text}*/`);
break;
case'decl':
out.push(`${pad}${node.prop}: ${value(node)};`);
break;
case'at':
if(!node.children){out.push(`${pad}${collapse(node.prelude)};`);break;}
out.push(`${pad}${collapse(node.prelude)} {`);
walk(node.children,depth+1);
out.push(`${pad}}`);
break;
default:
out.push(`${pad}${selectors(node.prelude).join(`,\n${pad}`)} {`);
walk(node.children,depth+1);
out.push(`${pad}}`);
}
const next=list[index+1];
if(next&&(node.t==='rule'||(node.t==='at'&&node.children)))out.push('');
});
};
walk(nodes,0);
return`${out.join('\n')}\n`;
}
function squeeze(nodes){
return nodes.map((node)=>{
switch(node.t){
case'comment':return'';
case'decl':return`${node.prop}:${value(node)};`;
case'at':return node.children
?`${collapse(node.prelude)}{${squeeze(node.children)}}`
:`${collapse(node.prelude)};`;
default:return`${selectors(node.prelude).join(',')}{${squeeze(node.children)}}`;
}
}).join('').replace(/;\}/g,'}');
}
function value(node){
return node.prop.startsWith('--')?node.value:collapse(node.value);
}
function selectors(prelude){
return splitTop(prelude,',').map((part)=>collapse(part));
}
function collapse(text){
return text.replace(/\s+/g,' ').trim();
}
function splitTop(text,separator){
const parts=[];
const state={text,at:0};
let start=0;
while(state.at<text.length){
const ch=text[state.at];
if(ch==='"'||ch==="'"){readString(state);continue;}
if(ch==='('){readBrackets(state);continue;}
if(ch===separator){
parts.push(text.slice(start,state.at));
state.at+=1;
start=state.at;
continue;
}
state.at+=1;
}
parts.push(text.slice(start));
return parts.map((part)=>part.trim()).filter((part)=>part!=='');
}
