/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./phrases.js?v=9c17b02dea';
export function wireFilePicker({input,dropzone,onFiles,idleTitle,example}){
const titleEl=dropzone.querySelector('.dropzone-title');
const idle=idleTitle??titleEl?.textContent??'';
const sayWaiting=()=>{
for(const card of document.querySelectorAll('main .card[inert]')){
if(card.querySelector('.card-waiting'))continue;
const line=document.createElement('p');
line.className='card-waiting';
line.textContent=phrase('card.waiting');
const heading=card.querySelector('h2');
if(heading)heading.after(line);
else card.prepend(line);
}
};
const wake=()=>{
for(const card of document.querySelectorAll('main .card[inert]')){
card.dataset.waited='yes';
card.removeAttribute('inert');
}
for(const line of document.querySelectorAll('main .card .card-waiting'))line.remove();
};
const hand=(files)=>{
const picked=Array.from(files??[]);
if(!picked.length)return;
wake();
onFiles(picked);
};
sayWaiting();
input.addEventListener('change',()=>{
const picked=Array.from(input.files);
input.value='';
hand(picked);
});
for(const type of['dragenter','dragover']){
dropzone.addEventListener(type,(event)=>{
event.preventDefault();
dropzone.classList.add('dragover');
});
}
for(const type of['dragleave','drop']){
dropzone.addEventListener(type,()=>dropzone.classList.remove('dragover'));
}
dropzone.addEventListener('drop',(event)=>{
event.preventDefault();
hand(event.dataTransfer?.files);
});
window.addEventListener('dragover',(event)=>event.preventDefault());
window.addEventListener('drop',(event)=>event.preventDefault());
const busy=(text)=>{
dropzone.classList.add('busy');
if(titleEl&&text)titleEl.textContent=text;
};
const done=()=>{
dropzone.classList.remove('busy');
if(titleEl)titleEl.textContent=idle;
};
if(example)wireExample({example,hand,busy,done,dropzone});
return{
busy,
done,
arrived:wake,
waiting(){
for(const card of document.querySelectorAll('main .card')){
if(card.dataset.waited==='yes')card.setAttribute('inert','');
}
sayWaiting();
},
};
}
function wireExample({example,hand,busy,done,dropzone}){
const button=document.getElementById('example-button');
if(!button)return;
const holder=button.parentElement;
liftToHeading(holder,dropzone);
const say=(text)=>{
let note=holder.querySelector('.example-note');
if(!note){
note=document.createElement('span');
note.className='example-note';
note.setAttribute('role','status');
holder.append(note);
}
note.textContent=text;
};
button.addEventListener('click',async()=>{
button.disabled=true;
say('');
busy(phrase('example.busy'));
try{
const made=await example();
const files=(Array.isArray(made)?made:[made]).filter(Boolean);
done();
hand(files);
}catch(error){
done();
say(phrase('example.failed'));
console.info('Example unavailable:',error);
}finally{
button.disabled=false;
}
});
}
function liftToHeading(holder,dropzone){
const card=dropzone?.closest('.card');
if(!card||!holder)return;
const fold=card.querySelector(':scope > details.card-note');
const head=card.querySelector(':scope > h2')
??(fold?.querySelector(':scope > summary > h2')?fold:null);
if(!head)return;
const row=document.createElement('div');
row.className='card-head';
head.before(row);
row.append(head,holder);
}
export function readingLabel(count){
return phrase(count===1?'reading.one':'reading.many',{count});
}
