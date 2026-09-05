/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./phrases.js?v=954778cf04';
export function wireFilePicker({input,dropzone,onFiles,idleTitle}){
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
const hand=(files)=>{
const picked=Array.from(files??[]);
if(!picked.length)return;
for(const card of document.querySelectorAll('main .card[inert]')){
card.dataset.waited='yes';
card.removeAttribute('inert');
}
for(const line of document.querySelectorAll('main .card .card-waiting'))line.remove();
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
return{
busy(text){
dropzone.classList.add('busy');
if(titleEl&&text)titleEl.textContent=text;
},
done(){
dropzone.classList.remove('busy');
if(titleEl)titleEl.textContent=idle;
},
waiting(){
for(const card of document.querySelectorAll('main .card')){
if(card.dataset.waited==='yes')card.setAttribute('inert','');
}
sayWaiting();
},
};
}
export function readingLabel(count){
return phrase(count===1?'reading.one':'reading.many',{count});
}
