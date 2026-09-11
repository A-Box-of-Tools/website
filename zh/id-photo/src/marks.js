/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const MARK_KEYS=[
{key:'crown',label:'mark.crown',hint:'mark.crown.hint'},
{key:'chin',label:'mark.chin',hint:'mark.chin.hint'},
{key:'leftEye',label:'mark.lefteye',hint:'mark.lefteye.hint'},
{key:'rightEye',label:'mark.righteye',hint:'mark.righteye.hint'},
];
const OPENING={
crown:{x:0.5,y:0.14},
chin:{x:0.5,y:0.54},
leftEye:{x:0.42,y:0.28},
rightEye:{x:0.58,y:0.28},
};
export class Marks{
#stage;
#onChange;
#dots=new Map();
#source={width:0,height:0};
#points=null;
constructor(stage,{onChange,t}={}){
this.#stage=stage;
this.#onChange=onChange;
for(const entry of MARK_KEYS){
const{key}=entry;
const label=t(entry.label);
const dot=document.createElement('button');
dot.type='button';
dot.className=`face-mark mark-${key}`;
dot.dataset.key=key;
dot.hidden=true;
dot.setAttribute('aria-label',t('mark.aria',{label,hint:t(entry.hint)}));
const caption=document.createElement('span');
caption.className='face-mark-label';
caption.textContent=label;
dot.append(caption);
dot.addEventListener('pointerdown',this.#onPointerDown);
dot.addEventListener('keydown',this.#onKeyDown);
this.#dots.set(key,dot);
stage.append(dot);
}
}
get placed(){
return this.#points!==null;
}
get marks(){
return this.#points?structuredClone(this.#points):null;
}
setSource(width,height){
this.#source={width,height};
this.#points=null;
this.hide();
}
open(){
const{width,height}=this.#source;
if(!width||!height)return;
this.#show(Object.fromEntries(MARK_KEYS.map(({key})=>[key,{
x:OPENING[key].x*width,
y:OPENING[key].y*height,
}])),'open');
}
place(points){
const{width,height}=this.#source;
if(!width||!height||!points)return;
this.#show(points,'place');
}
hide(){
for(const dot of this.#dots.values())dot.hidden=true;
}
show(){
if(!this.#points)return;
for(const dot of this.#dots.values())dot.hidden=false;
this.#paint();
}
clear(){
this.#points=null;
this.hide();
this.#onChange?.(null,'clear');
}
#scale(){
const bounds=this.#stage.getBoundingClientRect();
return bounds.width?this.#source.width/bounds.width:1;
}
#onPointerDown=(event)=>{
if(event.button!==0||!this.#points)return;
const dot=event.currentTarget;
const key=dot.dataset.key;
const start={...this.#points[key]};
const scale=this.#scale();
dot.setPointerCapture?.(event.pointerId);
event.preventDefault();
dot.focus({preventScroll:true});
dot.classList.add('dragging');
const from={x:event.clientX,y:event.clientY};
const move=(moved)=>{
this.#set(key,{
x:start.x+(moved.clientX-from.x)*scale,
y:start.y+(moved.clientY-from.y)*scale,
});
};
const up=()=>{
dot.classList.remove('dragging');
window.removeEventListener('pointermove',move);
window.removeEventListener('pointerup',up);
window.removeEventListener('pointercancel',up);
};
window.addEventListener('pointermove',move);
window.addEventListener('pointerup',up);
window.addEventListener('pointercancel',up);
};
#onKeyDown=(event)=>{
const directions={
ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],
};
const direction=directions[event.key];
if(!direction||!this.#points)return;
event.preventDefault();
const key=event.currentTarget.dataset.key;
const step=event.shiftKey?10:1;
const at=this.#points[key];
this.#set(key,{x:at.x+direction[0]*step,y:at.y+direction[1]*step});
};
#show(points,why){
this.#points=Object.fromEntries(MARK_KEYS.map(({key})=>[
key,this.#inside(points[key]),
]));
for(const dot of this.#dots.values())dot.hidden=false;
this.#paint();
this.#onChange?.(this.marks,why);
}
#set(key,point){
this.#points[key]=this.#inside(point);
this.#paint();
this.#onChange?.(this.marks,'drag');
}
#inside(point){
const{width,height}=this.#source;
return{
x:Math.max(0,Math.min(Math.round(point?.x??0),width)),
y:Math.max(0,Math.min(Math.round(point?.y??0),height)),
};
}
#paint(){
const{width,height}=this.#source;
if(!this.#points||!width||!height)return;
for(const[key,dot]of this.#dots){
const at=this.#points[key];
dot.style.left=`${(at.x / width) * 100}%`;
dot.style.top=`${(at.y / height) * 100}%`;
}
}
}
