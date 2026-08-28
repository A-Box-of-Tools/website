/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const MIN_SIZE=24;
const ANCHORS={
n:[0.5,1],s:[0.5,0],e:[0,0.5],w:[1,0.5],
ne:[0,1],nw:[1,1],se:[0,0],sw:[1,0],
};
const HANDLES=Object.keys(ANCHORS);
const clampSize=(value,limit)=>Math.max(Math.min(MIN_SIZE,limit),Math.min(Math.round(value),limit));
export class Cropper{
#stage;
#box;
#label;
#onChange;
#source={width:0,height:0};
#rect={x:0,y:0,width:0,height:0};
#aspect=35/45;
#drag=null;
#guides=null;
#parts={};
constructor(stage,{onChange,t}={}){
this.#stage=stage;
this.#onChange=onChange;
this.#box=document.createElement('div');
this.#box.className='crop-box';
this.#box.tabIndex=0;
this.#box.setAttribute('role','application');
this.#box.setAttribute('aria-label',t('crop.aria'));
this.#label=document.createElement('span');
this.#label.className='crop-size';
this.#box.append(this.#label);
for(const[key,className]of[
['eyeBand','guide-band guide-eye'],
['chinBand','guide-band guide-chin'],
['crownLine','guide-line guide-crown'],
['chinLine','guide-line guide-chin-line'],
['centreLine','guide-centre'],
]){
const element=document.createElement('span');
element.className=className;
element.hidden=true;
this.#parts[key]=element;
this.#box.append(element);
}
for(const key of['eyeBand','chinBand']){
const caption=document.createElement('span');
caption.className='guide-caption';
this.#parts[`${key}Caption`]=caption;
this.#parts[key].append(caption);
}
for(const handle of HANDLES){
const grip=document.createElement('span');
grip.className=`crop-handle handle-${handle}`;
grip.dataset.handle=handle;
this.#box.append(grip);
}
stage.append(this.#box);
this.#box.addEventListener('pointerdown',this.#onPointerDown);
this.#box.addEventListener('keydown',this.#onKeyDown);
}
get rect(){
return{...this.#rect};
}
setSource(width,height){
this.#source={width,height};
this.maximize();
}
setAspect(aspect){
if(!aspect||!Number.isFinite(aspect))return;
this.#aspect=aspect;
this.maximize();
}
maximize(){
const{width:sw,height:sh}=this.#source;
if(!sw||!sh)return;
let width=sw;
let height=sh;
if(width/height>this.#aspect)width=height*this.#aspect;
else height=width/this.#aspect;
this.#apply({x:(sw-width)/2,y:(sh-height)/2,width,height});
}
setRect(rect){
this.#apply(rect);
}
setGuides(guides){
this.#guides=guides;
this.#paintGuides();
}
#scale(){
const bounds=this.#stage.getBoundingClientRect();
return bounds.width?this.#source.width/bounds.width:1;
}
#onPointerDown=(event)=>{
if(event.button!==0)return;
const handle=event.target.dataset?.handle??'move';
this.#drag={
handle,
pointerX:event.clientX,
pointerY:event.clientY,
scale:this.#scale(),
start:{...this.#rect},
};
event.target.setPointerCapture?.(event.pointerId);
event.preventDefault();
this.#box.focus({preventScroll:true});
this.#box.classList.add('dragging');
const move=(moved)=>{
if(!this.#drag)return;
const dx=(moved.clientX-this.#drag.pointerX)*this.#drag.scale;
const dy=(moved.clientY-this.#drag.pointerY)*this.#drag.scale;
if(this.#drag.handle==='move')this.#move(dx,dy);
else this.#resize(this.#drag.handle,dx,dy);
};
const up=()=>{
this.#drag=null;
this.#box.classList.remove('dragging');
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
if(!direction)return;
event.preventDefault();
const[x,y]=direction;
const step=event.shiftKey?10:1;
if(event.altKey)this.#resizeBy(x*step,y*step);
else this.#move(x*step,y*step,this.#rect);
};
#move(dx,dy,from=this.#drag?.start??this.#rect){
this.#apply({...from,x:from.x+dx,y:from.y+dy});
}
#resizeBy(dx,dy){
const start=this.#rect;
const width=start.width+(dx||dy*this.#aspect);
this.#apply({...start,width,height:width/this.#aspect});
}
#resize(handle,dx,dy){
const start=this.#drag.start;
const[ax,ay]=ANCHORS[handle];
const anchorX=start.x+ax*start.width;
const anchorY=start.y+ay*start.height;
let width=start.width+(handle.includes('e')?dx:handle.includes('w')?-dx:0);
let height=start.height+(handle.includes('s')?dy:handle.includes('n')?-dy:0);
const horizontal=handle==='e'||handle==='w';
const vertical=handle==='n'||handle==='s';
if(horizontal)height=width/this.#aspect;
else if(vertical)width=height*this.#aspect;
else if(width/this.#aspect>=height)height=width/this.#aspect;
else width=height*this.#aspect;
const room=(anchor,span,side)=>(
side===0?span-anchor:side===1?anchor:2*Math.min(anchor,span-anchor)
);
const limit=Math.min(
room(anchorX,this.#source.width,ax),
room(anchorY,this.#source.height,ay)*this.#aspect,
);
width=Math.min(width,limit);
height=width/this.#aspect;
this.#apply({
x:anchorX-ax*width,
y:anchorY-ay*height,
width,
height,
});
}
#apply(rect){
const{width:sw,height:sh}=this.#source;
if(!sw||!sh)return;
let width=clampSize(rect.width,sw);
let height=clampSize(width/this.#aspect,sh);
width=clampSize(height*this.#aspect,sw);
const x=Math.max(0,Math.min(Math.round(rect.x),sw-width));
const y=Math.max(0,Math.min(Math.round(rect.y),sh-height));
this.#rect={x,y,width,height};
this.#paint();
this.#onChange?.(this.rect);
}
#paint(){
const{width:sw,height:sh}=this.#source;
if(!sw||!sh)return;
const{x,y,width,height}=this.#rect;
this.#box.style.left=`${(x / sw) * 100}%`;
this.#box.style.top=`${(y / sh) * 100}%`;
this.#box.style.width=`${(width / sw) * 100}%`;
this.#box.style.height=`${(height / sh) * 100}%`;
this.#label.textContent=`${width} x ${height}`;
this.#paintGuides();
}
#paintGuides(){
const guides=this.#guides;
const parts=this.#parts;
if(!guides){
for(const element of Object.values(parts))element.hidden=true;
return;
}
parts.centreLine.hidden=false;
parts.eyeBand.hidden=false;
parts.eyeBandCaption.hidden=false;
parts.chinBandCaption.hidden=false;
parts.eyeBand.style.top=`${guides.eye.from * 100}%`;
parts.eyeBand.style.height=`${(guides.eye.to - guides.eye.from) * 100}%`;
parts.eyeBand.classList.toggle('guide-pass',guides.pass?.eye===true);
parts.eyeBandCaption.textContent='eyes';
const marks=guides.marks;
if(!marks){
parts.chinBand.hidden=true;
parts.crownLine.hidden=true;
parts.chinLine.hidden=true;
return;
}
parts.chinBand.hidden=false;
parts.chinBand.style.top=`${(marks.crown + guides.head.min) * 100}%`;
parts.chinBand.style.height=`${(guides.head.max - guides.head.min) * 100}%`;
parts.chinBand.classList.toggle('guide-pass',guides.pass?.head===true);
parts.chinBandCaption.textContent='chin';
parts.crownLine.hidden=false;
parts.crownLine.style.top=`${marks.crown * 100}%`;
parts.chinLine.hidden=false;
parts.chinLine.style.top=`${marks.chin * 100}%`;
for(const key of['crownLine','chinLine']){
parts[key].classList.toggle('guide-fail',guides.pass?.head===false);
}
}
}
