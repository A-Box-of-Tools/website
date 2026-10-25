/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function createApprovalPrompt({
dialog,onApprove,onDeny,isBlocked=()=>false,
isActive=()=>true,canApprove=()=>true,focusFallback=()=>null,
}){
let requests=new Map();
let current=null;
let revision=0;
const doc=dialog.ownerDocument;
const name=dialog.querySelector('[data-approval-name]');
const approve=dialog.querySelector('[data-approval-approve]');
const deny=dialog.querySelector('[data-approval-deny]');
const later=dialog.querySelector('[data-approval-later]');
function close(restoreFocus=true){
const id=current;
current=null;
const ticket=++revision;
if(dialog.open)dialog.close();
if(restoreFocus&&id!==null)queueMicrotask(()=>{
if(ticket!==revision||dialog.open||doc.hidden||!isActive())return;
const target=focusFallback(id);
if(target?.isConnected&&!target.disabled)target.focus();
});
}
function refresh(){
const blocked=isBlocked()||!isActive()||!requests.has(current);
approve.disabled=blocked||!canApprove();
deny.disabled=blocked;
if(dialog.open&&(!isActive()||doc.hidden||!requests.has(current)))close(false);
}
function decide(callback){
const id=current;
if(id===null||!requests.has(id)||!isActive()||isBlocked()||doc.hidden)return;
close();
callback(id);
}
approve.addEventListener('click',()=>{if(canApprove())decide(onApprove);});
deny.addEventListener('click',()=>decide(onDeny));
later.addEventListener('click',()=>close());
dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
dialog.addEventListener('close',()=>{if(!dialog.open&&current!==null)close();});
function update(rows){
const next=new Map(rows.map(row=>[row.id,row]));
const fresh=rows.find(row=>!requests.has(row.id));
requests=next;
refresh();
if(!fresh||dialog.open||doc.hidden||!isActive()||isBlocked()
||doc.querySelector('dialog[open]')||typeof dialog.showModal!=='function')return;
revision++;
current=fresh.id;
name.textContent=fresh.name;
try{dialog.showModal();}catch{current=null;return;}
refresh();
later.focus();
}
return{
update,close,refresh,
clear(){requests.clear();close(false);},
};
}
export function createApprovalList({
list,section,template,dialog,onApprove,onDeny,
isBlocked=()=>false,isActive=()=>true,focusFallback=()=>null,
}){
let rows=new Map();
const nodes=new Map();
const prompt=createApprovalPrompt({
dialog,onApprove,onDeny,isBlocked,isActive,
focusFallback:id=>nodes.get(id)?.querySelector('[data-action="approve"]')||focusFallback(),
});
function refresh(){
for(const node of nodes.values()){
for(const button of node.querySelectorAll('button'))button.disabled=isBlocked()||!isActive();
}
prompt.refresh();
}
function update(next){
rows=new Map(next.map(row=>[row.id,row]));
for(const[id,node]of nodes){
if(!rows.has(id)){node.remove();nodes.delete(id);}
}
for(const row of next){
let node=nodes.get(row.id);
if(!node){
node=template.content.firstElementChild.cloneNode(true);
node.dataset.peer=row.id;
for(const action of['approve','deny']){
node.querySelector(`[data-action="${action}"]`).addEventListener('click',()=>{
if(!rows.has(row.id)||!isActive()||isBlocked()||list.ownerDocument.hidden)return;
prompt.close();
(action==='approve'?onApprove:onDeny)(row.id);
});
}
nodes.set(row.id,node);
list.append(node);
}
node.querySelector('[data-approval-row-name]').textContent=row.name;
}
section.hidden=next.length===0;
refresh();
prompt.update(next);
}
return{
update,refresh,close:prompt.close,
clear(){rows.clear();nodes.clear();list.replaceChildren();section.hidden=true;prompt.clear();},
};
}
