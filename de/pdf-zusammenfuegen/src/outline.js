/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{isGoTo,resolveDestination}from'./dests.js';
import{decodeText}from'./pages.js';
import{name,PdfString,Ref}from'./objects.js';
const MAX_ITEMS=5000;
export function readOutline(doc,named){
const root=doc.get(doc.catalog,'Outlines');
if(!(root instanceof Map))return[];
const seen=new Set();
let budget=MAX_ITEMS;
const chain=(first,depth)=>{
const out=[];
let ref=first;
while(ref instanceof Ref&&budget>0&&depth<24){
if(seen.has(ref.key))break;
seen.add(ref.key);
budget-=1;
const item=doc.resolve(ref);
if(!(item instanceof Map))break;
out.push({
title:decodeText(doc.resolve(item.get('Title')))||'Untitled',
...place(doc,item,named),
kids:chain(item.get('First'),depth+1),
});
ref=item.get('Next');
}
return out;
};
return chain(root.get('First'),0);
}
function place(doc,item,named){
let dest=item.get('Dest');
if(dest===undefined||doc.resolve(dest)===null){
const action=doc.resolve(item.get('A'));
dest=isGoTo(doc,action)?action.get('D'):undefined;
}
if(dest===undefined)return{target:null,view:[]};
const found=resolveDestination(doc,dest instanceof Ref?doc.resolve(dest):dest,named);
return{target:found?.ref??null,view:found?.view??[]};
}
export function pruneOutline(nodes,locate){
const kept=[];
for(const node of nodes){
const kids=pruneOutline(node.kids,locate);
const page=node.target?locate(node.target):null;
if(!page&&kids.length===0)continue;
kept.push({title:node.title,page,view:node.view,kids});
}
return kept;
}
export function writeOutline(build,nodes){
if(!nodes.length)return null;
const rootNum=build.reserve();
const root=new Map([['Type',name('Outlines')]]);
const level=(items,parentRef)=>{
const numbers=items.map(()=>build.reserve());
items.forEach((item,index)=>{
const dict=new Map([
['Title',textString(item.title)],
['Parent',parentRef],
]);
if(index>0)dict.set('Prev',new Ref(numbers[index-1],0));
if(index+1<numbers.length)dict.set('Next',new Ref(numbers[index+1],0));
if(item.page)dict.set('Dest',[item.page,...destinationView(item.view)]);
if(item.kids.length){
const kids=level(item.kids,new Ref(numbers[index],0));
dict.set('First',kids.first);
dict.set('Last',kids.last);
dict.set('Count',-item.kids.length);
}
build.put(numbers[index],dict);
});
return{
first:new Ref(numbers[0],0),
last:new Ref(numbers[numbers.length-1],0),
};
};
const top=level(nodes,new Ref(rootNum,0));
root.set('First',top.first);
root.set('Last',top.last);
root.set('Count',nodes.length);
return build.put(rootNum,root);
}
function destinationView(view){
if(!Array.isArray(view)||view.length===0)return[name('Fit')];
return view;
}
export function textString(text){
const bytes=new Uint8Array(2+text.length*2);
bytes[0]=0xfe;
bytes[1]=0xff;
for(let i=0;i<text.length;i+=1){
const code=text.charCodeAt(i);
bytes[2+i*2]=(code>>8)&0xff;
bytes[3+i*2]=code&0xff;
}
return new PdfString(bytes);
}
