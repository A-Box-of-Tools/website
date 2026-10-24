/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function createCombo({root,input,list,toggle,rowsFor,chosen,onChoose,onNarrow}){
let rows=[];
let active=-1;
const isOpen=()=>!list.hidden;
const rowId=(index)=>`${list.id}-${index}`;
function setActive(index){
active=index;
for(const[at,node]of[...list.children].entries()){
node.classList.toggle('active',at===index);
}
if(index<0){
input.removeAttribute('aria-activedescendant');
return;
}
input.setAttribute('aria-activedescendant',rowId(index));
const node=list.children[index];
if(node.offsetTop<list.scrollTop)list.scrollTop=node.offsetTop;
const over=node.offsetTop+node.offsetHeight-list.clientHeight;
if(over>list.scrollTop)list.scrollTop=over;
}
function draw(typed){
rows=rowsFor(typed);
const current=chosen().value;
list.replaceChildren(...rows.map((row,index)=>{
const node=document.createElement('li');
node.id=rowId(index);
node.setAttribute('role','option');
node.setAttribute('aria-selected',String(row.value===current));
Object.assign(node.dataset,row.data);
node.dataset.value=row.value;
node.textContent=row.label;
return node;
}));
}
function open(typed){
draw(typed);
list.hidden=false;
input.setAttribute('aria-expanded','true');
const at=typed?0:rows.findIndex((row)=>row.value===chosen().value);
setActive(rows.length?Math.max(0,at):-1);
onNarrow(typed?rows.length:null);
}
function close(){
list.hidden=true;
input.setAttribute('aria-expanded','false');
setActive(-1);
input.value=chosen().label;
onNarrow(null);
draw('');
}
function choose(value){
onChoose(value);
close();
if(document.activeElement===input)input.select();
}
const typedText=()=>(input.value===chosen().label?'':input.value.trim());
input.addEventListener('input',()=>open(input.value.trim()));
input.addEventListener('focus',()=>input.select());
input.addEventListener('click',()=>{if(!isOpen())open(typedText());});
input.addEventListener('keydown',(event)=>{
if(event.key==='ArrowDown'||event.key==='ArrowUp'){
event.preventDefault();
if(!isOpen()){open(typedText());return;}
if(!rows.length)return;
const step=event.key==='ArrowDown'?1:-1;
setActive(Math.min(rows.length-1,Math.max(0,active+step)));
}else if(event.key==='Enter'){
if(!isOpen())return;
event.preventDefault();
if(active>=0)choose(rows[active].value);
}else if(event.key==='Escape'){
if(isOpen()||input.value!==chosen().label){
event.preventDefault();
close();
input.select();
}
}
});
input.addEventListener('blur',()=>{if(isOpen()||input.value!==chosen().label)close();});
list.addEventListener('mousedown',(event)=>event.preventDefault());
list.addEventListener('click',(event)=>{
const node=event.target instanceof Element?event.target.closest('[role="option"]'):null;
if(node)choose(node.dataset.value);
});
toggle.addEventListener('mousedown',(event)=>event.preventDefault());
toggle.addEventListener('click',()=>{if(isOpen())close();else open('');});
document.addEventListener('pointerdown',(event)=>{
if(isOpen()&&event.target instanceof Node&&!root.contains(event.target))close();
});
close();
return{
refresh:close,
};
}
