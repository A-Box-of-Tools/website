/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const MIN_SIZE=8;
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
#aspect=null;
#drag=null;
#enabled=true;
constructor(stage,{onChange}={}){
this.#stage=stage;
this.#onChange=onChange;
this.#box=document.createElement('div');
this.#box.className='crop-box';
this.#box.tabIndex=0;
this.#box.setAttribute('role','application');
this.#box.setAttribute('aria-label',
'Crop area. The arrow keys move it, Alt and the arrow keys resize it, '
+'and holding Shift makes each step ten pixels.');
this.#label=document.createElement('span');
this.#label.className='crop-size';
this.#box.append(this.#label);
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
get aspect(){
return this.#aspect;
}
setSource(width,height,keep=false){
const before=this.#source;
const carried=keep&&before.width&&before.height
?{
x:(this.#rect.x/before.width)*width,
y:(this.#rect.y/before.height)*height,
width:(this.#rect.width/before.width)*width,
height:(this.#rect.height/before.height)*height,
}
:{x:0,y:0,width,height};
this.#source={width,height};
this.#apply(carried);
}
setEnabled(enabled){
this.#enabled=enabled;
this.#box.classList.toggle('disabled',!enabled);
}
reset(){
this.#aspect=null;
this.#apply({
x:0,y:0,width:this.#source.width,height:this.#source.height,
});
}
setAspect(aspect){
this.#aspect=aspect||null;
if(!this.#aspect){
this.#emit();
return;
}
const centreX=this.#rect.x+this.#rect.width/2;
const centreY=this.#rect.y+this.#rect.height/2;
const width=Math.min(this.#rect.width,this.#rect.height*this.#aspect);
const height=width/this.#aspect;
this.#apply({x:centreX-width/2,y:centreY-height/2,width,height});
}
maximize(){
const{width:sw,height:sh}=this.#source;
let width=sw;
let height=sh;
if(this.#aspect){
width=Math.min(sw,sh*this.#aspect);
height=width/this.#aspect;
}
this.#apply({x:(sw-width)/2,y:(sh-height)/2,width,height});
}
centre(){
this.#apply({
...this.#rect,
x:(this.#source.width-this.#rect.width)/2,
y:(this.#source.height-this.#rect.height)/2,
});
}
setRect(rect){
this.#apply(rect);
}
#scale(){
const bounds=this.#stage.getBoundingClientRect();
return bounds.width?this.#source.width/bounds.width:1;
}
#onPointerDown=(event)=>{
if(!this.#enabled||event.button!==0)return;
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
if(!this.#enabled)return;
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
let width=start.width+dx;
let height=start.height+dy;
if(this.#aspect){
if(dx)height=width/this.#aspect;
else width=height*this.#aspect;
}
this.#apply({...start,width,height});
}
#resize(handle,dx,dy){
const start=this.#drag.start;
const[ax,ay]=ANCHORS[handle];
const anchorX=start.x+ax*start.width;
const anchorY=start.y+ay*start.height;
let width=start.width+(handle.includes('e')?dx:handle.includes('w')?-dx:0);
let height=start.height+(handle.includes('s')?dy:handle.includes('n')?-dy:0);
if(this.#aspect){
const horizontal=handle==='e'||handle==='w';
const vertical=handle==='n'||handle==='s';
if(horizontal)height=width/this.#aspect;
else if(vertical)width=height*this.#aspect;
else if(width/this.#aspect>=height)height=width/this.#aspect;
else width=height*this.#aspect;
}
const room=(anchor,span,side)=>(
side===0?span-anchor:side===1?anchor:2*Math.min(anchor,span-anchor)
);
const maxWidth=room(anchorX,this.#source.width,ax);
const maxHeight=room(anchorY,this.#source.height,ay);
if(this.#aspect){
const limit=Math.min(maxWidth,maxHeight*this.#aspect);
width=Math.min(width,limit);
height=width/this.#aspect;
}else{
width=Math.min(width,maxWidth);
height=Math.min(height,maxHeight);
}
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
const width=clampSize(rect.width,sw);
const height=clampSize(rect.height,sh);
const x=Math.max(0,Math.min(Math.round(rect.x),sw-width));
const y=Math.max(0,Math.min(Math.round(rect.y),sh-height));
this.#rect={x,y,width,height};
this.#paint();
this.#emit();
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
}
#emit(){
this.#onChange?.(this.rect);
}
}
