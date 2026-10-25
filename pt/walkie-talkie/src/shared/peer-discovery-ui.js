/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{normalizeGroupCode,createGroupCode,groupIdentifier}from'./discovery-group.js?v=1439a1c7a1';
const displayCode=code=>[code.slice(0,5),code.slice(5,10),code.slice(10,15),code.slice(15,20),code.slice(20)].join('-');
export function createDiscoveryGroupControl({root=document,onChange=()=>{}}={}){
const panel=root.querySelector('[data-discovery-group]');
const field=panel.querySelector('[data-group-code]');
const join=panel.querySelector('[data-group-join]');
const create=panel.querySelector('[data-group-create]');
const leave=panel.querySelector('[data-group-leave]');
const copy=panel.querySelector('[data-group-copy]');
const status=panel.querySelector('[data-group-status]');
const current=panel.querySelector('[data-group-current]');
const text=key=>panel.querySelector(`[data-group-text="${key}"]`).textContent.trim();
let code=null;
let identifier=null;
let locked=false;
let busy=false;
let generation=0;
let destroyed=false;
const hostActions=[...root.querySelectorAll('[data-pairing-actions="host"]')];
const heldActions=new Map();
function holdHostActions(hold){
for(const row of hostActions){
if(hold&&!heldActions.has(row)){
heldActions.set(row,row.inert);
row.inert=true;
row.dataset.groupBusy='';
}else if(!hold&&heldActions.has(row)){
row.inert=heldActions.get(row);
heldActions.delete(row);
delete row.dataset.groupBusy;
}
}
}
function render(){
holdHostActions(busy);
panel.setAttribute('aria-busy',String(busy));
for(const control of[join,create,leave])control.disabled=locked||busy;
field.disabled=busy;
field.readOnly=locked;
copy.disabled=code===null||busy;
leave.hidden=code===null;
current.textContent=text(code===null?'network':'private');
panel.dataset.groupActive=code===null?'network':'private';
}
async function apply(value){
if(locked||busy||destroyed)return;
const next=normalizeGroupCode(value);
if(!next){
field.setCustomValidity(text('invalid'));
field.reportValidity();
return;
}
const epoch=++generation;
field.setCustomValidity('');
busy=true;
status.textContent=text('working');
render();
try{
const id=await groupIdentifier(next);
if(destroyed||locked||epoch!==generation)return;
code=next;
identifier=id;
field.value=displayCode(next);
panel.querySelector('details').open=true;
status.textContent=text('joined');
onChange();
}catch{
if(!destroyed&&epoch===generation)status.textContent=text('failed');
}finally{
if(epoch===generation){busy=false;render();}
}
}
const events=[];
const listen=(element,event,handler,options)=>{
element.addEventListener(event,handler,options);
events.push(()=>element.removeEventListener(event,handler,options));
};
const guardHostStart=event=>{
if(!busy)return;
const target=event.target;
const startsHost=event.type==='submit'
?hostActions.some(row=>row.closest('form')===target)
:hostActions.some(row=>row.contains(target));
if(!startsHost)return;
event.preventDefault();
event.stopImmediatePropagation();
};
listen(root,'submit',guardHostStart,true);
listen(root,'click',guardHostStart,true);
listen(field,'input',()=>field.setCustomValidity(''));
listen(field,'keydown',event=>{
if(event.key==='Enter'){event.preventDefault();void apply(field.value);}
});
listen(join,'click',()=>{void apply(field.value);});
listen(create,'click',()=>{if(!locked&&!busy)void apply(createGroupCode());});
listen(leave,'click',()=>{
if(locked||busy||destroyed)return;
++generation;
code=identifier=null;
field.value='';
field.setCustomValidity('');
status.textContent=text('left');
render();
onChange();
});
listen(copy,'click',async()=>{
if(!code)return;
const snapshot=code;
try{
await navigator.clipboard.writeText(displayCode(snapshot));
if(snapshot===code&&!destroyed)status.textContent=text('copied');
}catch{
if(snapshot!==code||destroyed)return;
field.value=displayCode(snapshot);
field.focus();
field.select();
status.textContent=text('select');
}
});
render();
wireConnectionLegend(root);
return{
id:()=>identifier,
code:()=>code,
lock(value){
locked=Boolean(value);
if(locked&&busy){++generation;busy=false;status.textContent='';}
render();
},
destroy(){
destroyed=true;
++generation;
code=identifier=null;
field.value='';
holdHostActions(false);
events.forEach(remove=>remove());
},
};
}
function wireConnectionLegend(root){
for(const placeholder of root.querySelectorAll('[data-connection-legend]')){
const template=root.querySelector(`template[data-connection-icon="${placeholder.dataset.connectionLegend}"]`);
if(!template)continue;
const icon=template.content.firstElementChild.cloneNode(true);
icon.removeAttribute('tabindex');
icon.removeAttribute('role');
icon.removeAttribute('aria-label');
icon.removeAttribute('title');
icon.setAttribute('aria-hidden','true');
icon.querySelector('.paired-icon-tip')?.remove();
placeholder.replaceChildren(icon);
}
}
let activeTooltip=null;
function wireConnectionTooltip(icon){
const tip=icon.querySelector('.paired-icon-tip');
if(!tip)return;
let hovering=false,focused=false,dismissed=false,closing=null,observer=null;
const close=()=>{
clearTimeout(closing);
delete icon.dataset.tooltipOpen;
observer?.disconnect();
observer=null;
document.removeEventListener('keydown',escape);
document.removeEventListener('scroll',position,true);
window.removeEventListener('resize',position);
if(activeTooltip?.close===close)activeTooltip=null;
};
const escape=event=>{
if(event.key!=='Escape')return;
dismissed=true;
close();
};
const position=()=>{
if(!icon.isConnected){close();return;}
const bounds=icon.getBoundingClientRect(),size=tip.getBoundingClientRect();
const width=document.documentElement.clientWidth,height=window.innerHeight;
const left=Math.max(8,Math.min(bounds.left,width-size.width-8));
const above=bounds.top-size.height-4;
const preferredTop=above>=8?above:bounds.bottom+4;
const top=Math.max(8,Math.min(preferredTop,height-size.height-8));
tip.style.left=`${left}px`;
tip.style.top=`${top}px`;
};
const show=()=>{
clearTimeout(closing);
if(dismissed||!icon.isConnected)return;
if(activeTooltip?.close===close)return;
if(!focused&&activeTooltip?.focused())return;
activeTooltip?.close();
activeTooltip={close,focused:()=>focused};
icon.dataset.tooltipOpen='';
position();
document.addEventListener('keydown',escape);
document.addEventListener('scroll',position,true);
window.addEventListener('resize',position);
observer=new MutationObserver(()=>{if(!icon.isConnected)close();});
observer.observe(document.documentElement,{childList:true,subtree:true});
};
const leave=()=>{
clearTimeout(closing);
if(!hovering&&!focused)closing=setTimeout(close,180);
};
icon.addEventListener('mouseenter',()=>{hovering=true;dismissed=false;show();});
icon.addEventListener('mouseleave',()=>{hovering=false;leave();});
tip.addEventListener('mouseenter',()=>{hovering=true;clearTimeout(closing);});
tip.addEventListener('mouseleave',()=>{hovering=false;leave();});
icon.addEventListener('focus',()=>{focused=true;dismissed=false;show();});
icon.addEventListener('blur',()=>{focused=false;leave();});
icon.removeAttribute('title');
}
export function appendConnectionIcons(container,{transport='direct',locked=null,approval=false}={}){
container.querySelector(':scope > [data-connection-icons]')?.remove();
const icons=document.createElement('span');
icons.className='paired-connection-icons';
icons.dataset.connectionIcons='';
const kinds=[transport==='relay'?'relay':'direct'];
if(typeof locked==='boolean')kinds.push(locked?'password':'open');
if(approval===true||approval==='optional')kinds.push(approval===true?'approval':'optional');
for(const kind of kinds){
const template=document.querySelector(`template[data-connection-icon="${kind}"]`);
if(template)icons.append(template.content.cloneNode(true));
}
container.append(icons);
icons.querySelectorAll('.paired-connection-icon').forEach(wireConnectionTooltip);
return icons;
}
