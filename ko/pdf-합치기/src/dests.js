/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{isName,Name,PdfString,Ref}from'./objects.js';
export function namedDestinations(doc){
const found=new Map();
const catalog=doc.catalog;
if(!catalog)return found;
const old=doc.get(catalog,'Dests');
if(old instanceof Map){
for(const[key,value]of old)found.set(key,value);
}
const names=doc.get(catalog,'Names');
if(names instanceof Map)walkNameTree(doc,doc.resolve(names.get('Dests')),found,0);
return found;
}
function walkNameTree(doc,node,into,depth){
if(!(node instanceof Map)||depth>32||into.size>50000)return;
const entries=doc.resolve(node.get('Names'));
if(Array.isArray(entries)){
for(let i=0;i+1<entries.length;i+=2){
const key=doc.resolve(entries[i]);
if(key instanceof PdfString)into.set(keyOf(key),entries[i+1]);
}
}
const kids=doc.resolve(node.get('Kids'));
if(Array.isArray(kids)){
for(const kid of kids)walkNameTree(doc,doc.resolve(kid),into,depth+1);
}
}
function keyOf(value){
let text='';
for(const byte of value.bytes)text+=String.fromCharCode(byte);
return text;
}
export function resolveDestination(doc,dest,named,depth=0){
if(depth>8)return null;
if(dest instanceof Name||dest instanceof PdfString){
const key=dest instanceof Name?dest.value:keyOf(dest);
const found=named.get(key);
if(found===undefined)return null;
return resolveDestination(doc,doc.resolve(found),named,depth+1);
}
const value=doc.resolve(dest);
if(value instanceof Map){
return resolveDestination(doc,doc.resolve(value.get('D')),named,depth+1);
}
if(!Array.isArray(value)||value.length===0)return null;
const page=value[0];
if(!(page instanceof Ref))return null;
return{ref:page,view:value.slice(1)};
}
export function isGoTo(doc,action){
return action instanceof Map&&isName(doc.resolve(action.get('S')),'GoTo');
}
