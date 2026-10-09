/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{parseJson,printJson}from'./shared/parse-json.js?v=60bc225f82';
import{parseYaml,printYaml}from'./shared/parse-yaml.js?v=60bc225f82';
import{parseXml,printXml,unescapeXml,xmlSpace}from'./shared/parse-xml.js?v=60bc225f82';
export function jsonToYaml(text,{indent=2}={}){
return printYaml(parseJson(text),{indent});
}
export function yamlToJson(text,{indent='  ',sortKeys=false,onDiagnostic}={}){
const data=parseYaml(text,{onComment:()=>onDiagnostic?.({kind:'yaml.comment'})});
return`${printJson(stripRaw(data), { indent, sortKeys })}\n`;
}
function stripRaw(node){
switch(node.t){
case'map':return{t:'map',pairs:node.pairs.map((pair)=>({key:pair.key,value:stripRaw(pair.value)}))};
case'seq':return{t:'seq',items:node.items.map(stripRaw)};
case'str':return{t:'str',value:node.value};
default:return node;
}
}
export function jsonToXml(text,{indent='  ',root='root',onDiagnostic}={}){
const data=parseJson(text);
const lines=[];
const pad=(depth)=>indent.repeat(depth);
const nameOf=(name)=>{
const tag=xmlName(name);
if(tag!==name)onDiagnostic?.({kind:'xml.name',from:name,to:tag});
return tag;
};
const write=(name,node,depth,tag=nameOf(name))=>{
switch(node.t){
case'map':
if(!node.pairs.length){lines.push(`${pad(depth)}<${tag}/>`);return;}
lines.push(`${pad(depth)}<${tag}>`);
const names=new Map();
for(const pair of node.pairs){
const childTag=nameOf(pair.key);
if(!names.has(childTag))names.set(childTag,new Set());
names.get(childTag).add(pair.key);
write(pair.key,pair.value,depth+1,childTag);
}
for(const keys of names.values()){
if(keys.size>1)onDiagnostic?.({kind:'xml.collision'});
}
lines.push(`${pad(depth)}</${tag}>`);
return;
case'seq':
if(!node.items.length){lines.push(`${pad(depth)}<${tag}/>`);return;}
for(const item of node.items)write(name,item,depth,tag);
return;
case'null':
lines.push(`${pad(depth)}<${tag}/>`);
return;
default:
lines.push(`${pad(depth)}<${tag}>${escapeXml(scalarText(node))}</${tag}>`);
}
};
lines.push('<?xml version="1.0" encoding="UTF-8"?>');
if(data.t==='seq'){
const rootTag=nameOf(root);
lines.push(`<${rootTag}>`);
for(const item of data.items)write('item',item,1);
lines.push(`</${rootTag}>`);
}else{
write(root,data,0);
}
return`${lines.join('\n')}\n`;
}
function scalarText(node){
if(node.t==='num')return node.raw;
if(node.t==='bool')return node.value?'true':'false';
return node.value;
}
function xmlName(key){
const cleaned=String(key).replace(/[^A-Za-z0-9_.-]/g,'_');
return/^[A-Za-z_]/.test(cleaned)?cleaned:`_${cleaned}`;
}
function escapeXml(text){
return String(text).replace(/[&<>]/g,(ch)=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]));
}
export function xmlToJson(text,{indent='  '}={}){
const nodes=parseXml(text);
const root=nodes.find((node)=>node.t==='element');
const data={t:'map',pairs:[{key:root.name,value:elementData(root)}]};
return`${printJson(data, { indent })}\n`;
}
function elementData(element,inheritedSpace=false){
const preserve=xmlSpace(element,inheritedSpace);
const pairs=[];
for(const attr of element.attrs){
pairs.push({key:`@${attr.name}`,value:{t:'str',value:unescapeXml(attr.value??'')}});
}
const children=element.children.filter((child)=>child.t==='element');
const ownText=element.children
.filter((child)=>child.t==='text'||child.t==='cdata')
.map((child)=>(child.t==='cdata'?child.text:unescapeXml(child.text)))
.join('');
const layout=children.length&&!preserve&&/^[ \t\r\n]*$/.test(ownText)
&&!element.children.some((child)=>child.t==='cdata');
const text=layout?'':ownText;
if(!children.length){
if(!pairs.length){
return text===''?{t:'null'}:{t:'str',value:text};
}
if(text!=='')pairs.push({key:'#text',value:{t:'str',value:text}});
return{t:'map',pairs};
}
const order=[];
const byName=new Map();
for(const child of children){
if(!byName.has(child.name)){byName.set(child.name,[]);order.push(child.name);}
byName.get(child.name).push(elementData(child,preserve));
}
for(const name of order){
const list=byName.get(name);
pairs.push({key:name,value:list.length===1?list[0]:{t:'seq',items:list}});
}
if(text!=='')pairs.push({key:'#text',value:{t:'str',value:text}});
return{t:'map',pairs};
}
export const CONVERSIONS=[
{
id:'json-yaml',
name:'convert.json-yaml.name',
note:'convert.json-yaml',
run:(text,options)=>jsonToYaml(text,{indent:options.spaces}),
output:'yaml',
},
{
id:'yaml-json',
name:'convert.yaml-json.name',
note:'convert.yaml-json',
run:(text,options)=>yamlToJson(text,{indent:options.indent,sortKeys:options.sortKeys,onDiagnostic:options.onDiagnostic}),
output:'json',
},
{
id:'json-xml',
name:'convert.json-xml.name',
note:'convert.json-xml',
run:(text,options)=>jsonToXml(text,{indent:options.indent,root:options.root||'root',onDiagnostic:options.onDiagnostic}),
output:'xml',
},
{
id:'xml-json',
name:'convert.xml-json.name',
note:'convert.xml-json',
run:(text,options)=>xmlToJson(text,{indent:options.indent}),
output:'json',
},
];
export const conversionById=(id)=>CONVERSIONS.find((item)=>item.id===id)??CONVERSIONS[0];
