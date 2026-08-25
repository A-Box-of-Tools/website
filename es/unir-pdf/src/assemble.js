/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{isGoTo,namedDestinations,resolveDestination}from'./dests.js';
import{decodeText,normalizeRotation,readPages}from'./pages.js';
import{pruneOutline,readOutline,writeOutline}from'./outline.js';
import{
isName,name,Name,PdfStream,Ref,
}from'./objects.js';
const SKIPPED_PAGE_KEYS=new Set([
'Parent','B','StructParents','Metadata','PieceInfo','AA','Annots',
'Rotate','MediaBox','Type','LastModified','Tabs',
]);
const ANNOT_KEYS_BY_HAND=new Set(['P','Dest','A','AA']);
export class Build{
constructor(version='1.5'){
this.objects=new Map();
this.trailer=new Map();
this.version=version;
this.next=1;
}
reserve(){
const num=this.next;
this.next+=1;
return num;
}
put(num,value){
this.objects.set(num,value);
return new Ref(num,0);
}
add(value){
return this.put(this.reserve(),value);
}
getObject(num){
return this.objects.has(num)?this.objects.get(num):null;
}
resolve(value){
let current=value;
let hops=0;
while(current instanceof Ref){
if(hops>64)return null;
hops+=1;
current=this.getObject(current.num);
}
return current;
}
get(dict,key){
return dict instanceof Map?this.resolve(dict.get(key)):null;
}
}
export function readSource(doc,label){
const named=namedDestinations(doc);
return{
doc,
label,
pages:readPages(doc),
named,
outline:readOutline(doc,named),
version:doc.version,
};
}
class Copier{
constructor(build,placed){
this.build=build;
this.placed=placed;
this.maps=new Map();
this.queue=[];
}
mapFor(source){
let map=this.maps.get(source);
if(!map){
map=new Map();
this.maps.set(source,map);
}
return map;
}
ref(source,from){
const map=this.mapFor(source);
const seen=map.get(from.num);
if(seen!==undefined)return seen===null?null:new Ref(seen,0);
const value=source.doc.getObject(from.num);
if(isPageNode(value)){
const landed=this.placed.get(source)?.get(from.key)??null;
map.set(from.num,null);
return landed;
}
const num=this.build.reserve();
map.set(from.num,num);
this.queue.push({source,from:value,to:num});
return new Ref(num,0);
}
value(source,item,depth=0){
if(depth>100)return null;
if(item instanceof Ref)return this.ref(source,item);
if(Array.isArray(item)){
return item.map((entry)=>this.value(source,entry,depth+1));
}
if(item instanceof PdfStream){
return new PdfStream(this.dict(source,item.dict,depth),item.raw);
}
if(item instanceof Map)return this.dict(source,item,depth);
return item;
}
dict(source,from,depth){
const out=new Map();
for(const[key,item]of from)out.set(key,this.value(source,item,depth+1));
return out;
}
drain(){
for(let at=0;at<this.queue.length;at+=1){
const job=this.queue[at];
this.build.put(job.to,this.value(job.source,job.from,0));
}
this.queue.length=0;
}
}
function isPageNode(value){
if(!(value instanceof Map))return false;
if(isName(value.get('Type'),'Page')||isName(value.get('Type'),'Pages'))return true;
return value.has('Contents')&&(value.has('MediaBox')||value.has('Parent'));
}
export function assemble(entries,{bookmarks=true}={}){
if(!entries.length)throw new Error('a document with no pages in it is not a document');
const version=entries.reduce(
(best,entry)=>(entry.source.version>best?entry.source.version:best),'1.5');
const build=new Build(version);
const catalogNum=build.reserve();
const pagesNum=build.reserve();
const pagesRef=new Ref(pagesNum,0);
const numbers=entries.map(()=>build.reserve());
const placed=new Map();
entries.forEach((entry,at)=>{
const page=entry.source.pages[entry.index];
if(!page?.ref)return;
let map=placed.get(entry.source);
if(!map){
map=new Map();
placed.set(entry.source,map);
}
if(!map.has(page.ref.key))map.set(page.ref.key,new Ref(numbers[at],0));
});
const copier=new Copier(build,placed);
const state={widgets:[],links:0,actionsDropped:0,brokenLinks:0};
entries.forEach((entry,at)=>{
build.put(numbers[at],copyPage(copier,entry,pagesRef,
new Ref(numbers[at],0),state));
});
copier.drain();
build.put(pagesNum,new Map([
['Type',name('Pages')],
['Kids',numbers.map((num)=>new Ref(num,0))],
['Count',numbers.length],
]));
const catalog=new Map([
['Type',name('Catalog')],
['Pages',pagesRef],
]);
const notes=[];
if(bookmarks){
const tree=collectOutlines(entries,placed);
const root=writeOutline(build,tree);
if(root){
catalog.set('Outlines',root);
catalog.set('PageMode',name('UseOutlines'));
}
}
const form=buildAcroForm(build,copier,state.widgets,notes);
if(form)catalog.set('AcroForm',form);
build.put(catalogNum,catalog);
build.trailer.set('Root',new Ref(catalogNum,0));
copier.drain();
if(state.brokenLinks){
notes.push(`${state.brokenLinks} link${state.brokenLinks === 1 ? '' : 's'} pointed at `
+'a page that is not in this file, so they were left in place with nothing behind '
+'them rather than sending the reader somewhere wrong.');
}
if(state.actionsDropped){
notes.push(`${state.actionsDropped} action${state.actionsDropped === 1 ? '' : 's'} `
+'that were neither "go to a page" nor "open a web address" - run this JavaScript, '
+'open this file, submit this form - were not copied.');
}
return{build,notes,fields:state.widgets.length,links:state.links};
}
function copyPage(copier,entry,pagesRef,selfRef,state){
const{source}=entry;
const page=source.pages[entry.index];
const out=new Map([['Type',name('Page')],['Parent',pagesRef]]);
const merged=new Map();
for(const[key,value]of page.inherited)merged.set(key,value);
for(const[key,value]of page.dict)merged.set(key,value);
for(const[key,value]of merged){
if(SKIPPED_PAGE_KEYS.has(key))continue;
out.set(key,copier.value(source,value,0));
}
out.set('MediaBox',[...page.box]);
const turned=normalizeRotation(page.rotate+entry.rotate);
if(turned)out.set('Rotate',turned);
const annots=copyAnnots(copier,source,merged.get('Annots'),selfRef,state);
if(annots.length)out.set('Annots',annots);
return out;
}
function copyAnnots(copier,source,value,selfRef,state){
const list=source.doc.resolve(value);
if(!Array.isArray(list))return[];
const out=[];
for(const item of list){
const annot=source.doc.resolve(item);
if(!(annot instanceof Map))continue;
const copy=new Map();
for(const[key,entry]of annot){
if(ANNOT_KEYS_BY_HAND.has(key))continue;
copy.set(key,copier.value(source,entry,0));
}
copy.set('P',selfRef);
if(isName(annot.get('Subtype'),'Link'))state.links+=1;
const dest=mapDestination(copier,source,annot.get('Dest'),state);
if(dest)copy.set('Dest',dest);
const action=mapAction(copier,source,annot.get('A'),state);
if(action)copy.set('A',action);
if(isName(annot.get('Subtype'),'Widget')){
state.widgets.push({source,annot});
}
out.push(copier.build.add(copy));
}
return out;
}
function mapDestination(copier,source,value,state){
if(value===undefined||value===null)return null;
const raw=value instanceof Ref?source.doc.resolve(value):value;
const found=resolveDestination(source.doc,raw,source.named);
if(!found)return null;
const landed=copier.placed.get(source)?.get(found.ref.key);
if(!landed){
state.brokenLinks+=1;
return null;
}
return[landed,...(found.view.length?found.view.map(
(item)=>copier.value(source,item,1)):[name('Fit')])];
}
function mapAction(copier,source,value,state){
const action=source.doc.resolve(value);
if(!(action instanceof Map))return null;
if(isGoTo(source.doc,action)){
const dest=mapDestination(copier,source,action.get('D'),state);
if(!dest)return null;
return new Map([['S',name('GoTo')],['D',dest]]);
}
const kind=source.doc.resolve(action.get('S'));
if(isName(kind,'URI')){
const uri=source.doc.resolve(action.get('URI'));
if(uri===null||uri===undefined)return null;
const copy=new Map([['S',name('URI')],['URI',copier.value(source,uri,1)]]);
if(action.has('IsMap'))copy.set('IsMap',source.doc.resolve(action.get('IsMap')));
return copy;
}
if(kind instanceof Name)state.actionsDropped+=1;
return null;
}
function collectOutlines(entries,placed){
const sources=[];
for(const entry of entries){
if(!sources.includes(entry.source))sources.push(entry.source);
}
const locate=(source)=>(ref)=>placed.get(source)?.get(ref.key)??null;
if(sources.length===1){
return pruneOutline(sources[0].outline,locate(sources[0]));
}
const tree=[];
for(const source of sources){
const kids=pruneOutline(source.outline,locate(source));
const first=entries.find((entry)=>entry.source===source);
const opening=first?source.pages[first.index]?.ref:null;
const page=opening?locate(source)(opening):null;
if(!kids.length&&!page)continue;
tree.push({title:source.label,page,view:[],kids});
}
return tree;
}
function buildAcroForm(build,copier,widgets,notes){
if(!widgets.length)return null;
const roots=new Map();
const owners=new Map();
for(const{source,annot}of widgets){
let node=annot;
let ref=null;
let hops=0;
for(;;){
const parent=node.get('Parent');
if(!(parent instanceof Ref)||hops>32)break;
const above=source.doc.resolve(parent);
if(!(above instanceof Map))break;
ref=parent;
node=above;
hops+=1;
}
const copied=ref?copier.ref(source,ref):null;
if(!copied)continue;
roots.set(`${source.label}:${ref.key}`,copied);
const title=decodeText(source.doc.resolve(node.get('T')));
if(title){
if(!owners.has(title))owners.set(title,new Set());
owners.get(title).add(source.label);
}
}
if(!roots.size)return null;
const form=new Map([['Fields',[...roots.values()]]]);
for(const{source}of widgets){
const acro=source.doc.get(source.doc.catalog,'AcroForm');
if(!(acro instanceof Map))continue;
for(const key of['DA','Q','NeedAppearances','SigFlags']){
if(acro.has(key)&&!form.has(key)){
form.set(key,copier.value(source,acro.get(key),1));
}
}
const resources=source.doc.resolve(acro.get('DR'));
if(resources instanceof Map){
const into=form.get('DR')??new Map();
for(const[key,value]of resources){
if(!into.has(key))into.set(key,copier.value(source,value,1));
}
form.set('DR',into);
}
}
const shared=[...owners.entries()].filter(([,files])=>files.size>1);
if(shared.length){
notes.push(`${shared.length} form field${shared.length === 1 ? '' : 's'} have the `
+`same name in more than one of these files (${shared.slice(0, 3)
        .map(([field]) => `"${field}"`).join(', ')}${shared.length > 3 ? ', …' : ''}). `
+'A reader treats fields sharing a name as one field, so filling one will fill '
+'the other.');
}
return build.add(form);
}
