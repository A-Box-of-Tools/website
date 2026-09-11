/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const SVG_NS='http://www.w3.org/2000/svg';
const CORNERS=['tl','tr','br','bl'];
export class Corners{
#stage;
#handlers;
#source={width:0,height:0};
#polygon;
#grips=[];
constructor(stage,handlers){
this.#stage=stage;
this.#handlers=handlers;
const svg=document.createElementNS(SVG_NS,'svg');
svg.setAttribute('class','quad');
svg.setAttribute('viewBox','0 0 100 100');
svg.setAttribute('preserveAspectRatio','none');
svg.setAttribute('aria-hidden','true');
this.#polygon=document.createElementNS(SVG_NS,'polygon');
this.#polygon.setAttribute('class','quad-outline');
svg.append(this.#polygon);
stage.append(svg);
CORNERS.forEach((name,index)=>{
const grip=document.createElement('button');
grip.type='button';
grip.className=`corner corner-${name}`;
grip.dataset.index=String(index);
grip.addEventListener('keydown',this.#onKeyDown);
stage.append(grip);
this.#grips.push(grip);
});
stage.addEventListener('pointerdown',this.#onPointerDown);
}
setSource(width,height){
this.#source={width,height};
}
render(quad,{unsure=false}={}){
const{width,height}=this.#source;
if(!width||!height||!quad)return;
const points=quad
.map((point)=>`${(point.x / width) * 100},${(point.y / height) * 100}`)
.join(' ');
this.#polygon.setAttribute('points',points);
this.#polygon.classList.toggle('unsure',unsure);
quad.forEach((point,index)=>{
const grip=this.#grips[index];
grip.style.left=`${(point.x / width) * 100}%`;
grip.style.top=`${(point.y / height) * 100}%`;
grip.setAttribute('aria-label',this.#handlers.describe(index));
});
}
focus(index){
this.#grips[index]?.focus({preventScroll:true});
}
#pointAt(event){
const bounds=this.#stage.getBoundingClientRect();
if(!bounds.width||!bounds.height)return{x:0,y:0};
return{
x:((event.clientX-bounds.left)/bounds.width)*this.#source.width,
y:((event.clientY-bounds.top)/bounds.height)*this.#source.height,
};
}
#onPointerDown=(event)=>{
if(event.button!==0||!this.#source.width)return;
const start=this.#pointAt(event);
const index=event.target.dataset?.index!==undefined
?Number(event.target.dataset.index)
:this.#nearest(start);
this.#stage.setPointerCapture?.(event.pointerId);
event.preventDefault();
this.#grips[index].focus({preventScroll:true});
let moved=false;
this.#follow((point)=>{
if(!moved)this.#handlers.onGestureStart();
moved=true;
this.#handlers.onChange(index,point);
});
};
#nearest(point){
let best=0;
let closest=Infinity;
for(let index=0;index<4;index+=1){
const corner=this.#handlers.cornerOf(index);
const away=Math.hypot(corner.x-point.x,corner.y-point.y);
if(away<closest){
closest=away;
best=index;
}
}
return best;
}
#follow(onMove){
const move=(event)=>onMove(this.#pointAt(event));
const up=()=>{
window.removeEventListener('pointermove',move);
window.removeEventListener('pointerup',up);
window.removeEventListener('pointercancel',up);
};
window.addEventListener('pointermove',move);
window.addEventListener('pointerup',up);
window.addEventListener('pointercancel',up);
}
#onKeyDown=(event)=>{
const directions={
ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],
};
const direction=directions[event.key];
if(!direction)return;
event.preventDefault();
const index=Number(event.currentTarget.dataset.index);
const step=event.shiftKey?10:1;
const from=this.#handlers.cornerOf(index);
this.#handlers.onGestureStart();
this.#handlers.onChange(index,{
x:from.x+direction[0]*step,
y:from.y+direction[1]*step,
});
};
}
