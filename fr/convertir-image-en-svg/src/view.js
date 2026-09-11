/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const GRAB=3;
export const MIN_ZOOM=2**-5;
export const MAX_ZOOM=2**4;
export class Viewport{
constructor({hosts,onHover,onPick,onView}){
this.panes=hosts.map((host)=>makePane(host));
this.onHover=onHover;
this.onPick=onPick;
this.onView=onView;
this.zoom=1;
this.fit=true;
this.pan={x:0,y:0};
this.offset={x:0,y:0};
this.size={w:1,h:1};
for(const pane of this.panes)this.wire(pane);
}
setSize(w,h){
this.size={w,h};
}
fitZoom(){
const host=this.panes[0].host;
const bw=host.clientWidth-14;
const bh=host.clientHeight-14;
if(!(bw>0&&bh>0))return this.zoom;
return clamp(Math.min(bw/this.size.w,bh/this.size.h),0.02,MAX_ZOOM);
}
apply(){
if(this.fit)this.zoom=this.fitZoom();
const zw=Math.max(1,Math.round(this.size.w*this.zoom));
const zh=Math.max(1,Math.round(this.size.h*this.zoom));
for(const pane of this.panes){
pane.box.style.width=`${zw}px`;
pane.box.style.height=`${zh}px`;
pane.overlay.width=zw;
pane.overlay.height=zh;
}
this.layout();
return{zw,zh,zoom:this.zoom};
}
layout(){
const zw=Math.max(1,Math.round(this.size.w*this.zoom));
const zh=Math.max(1,Math.round(this.size.h*this.zoom));
const host=this.panes[0].host;
const bw=host.clientWidth,bh=host.clientHeight;
this.pan.x=zw<=bw?0:clamp(this.pan.x,0,this.size.w-bw/this.zoom);
this.pan.y=zh<=bh?0:clamp(this.pan.y,0,this.size.h-bh/this.zoom);
this.offset={
x:zw<=bw?Math.round((bw-zw)/2):-Math.round(this.pan.x*this.zoom),
y:zh<=bh?Math.round((bh-zh)/2):-Math.round(this.pan.y*this.zoom),
};
const{x,y}=this.offset;
for(const pane of this.panes)pane.box.style.translate=`${x}px ${y}px`;
}
setZoom(zoom,{fit=false}={}){
this.fit=fit;
this.zoom=clamp(zoom,MIN_ZOOM,MAX_ZOOM);
}
at(pane,event){
const box=pane.host.getBoundingClientRect();
return[
Math.floor((event.clientX-box.left-this.offset.x)/this.zoom),
Math.floor((event.clientY-box.top-this.offset.y)/this.zoom),
];
}
inside([x,y]){
return x>=0&&y>=0&&x<this.size.w&&y<this.size.h;
}
wire(pane){
let drag=null;
pane.host.addEventListener('pointerdown',(e)=>{
try{pane.host.setPointerCapture(e.pointerId);}catch{}
pane.host.classList.add('dragging');
drag={x:e.clientX,y:e.clientY,pan:{...this.pan},moved:false};
});
pane.host.addEventListener('pointermove',(e)=>{
if(drag){
const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
if(Math.abs(dx)>GRAB||Math.abs(dy)>GRAB)drag.moved=true;
this.pan.x=drag.pan.x-dx/this.zoom;
this.pan.y=drag.pan.y-dy/this.zoom;
this.layout();
return;
}
const point=this.at(pane,e);
this.onHover(this.inside(point)?point:null);
});
pane.host.addEventListener('pointerup',(e)=>{
pane.host.classList.remove('dragging');
const dragged=drag?.moved;
drag=null;
if(dragged)return;
const point=this.at(pane,e);
if(this.inside(point))this.onPick(point);
});
pane.host.addEventListener('pointerleave',()=>{
if(!drag)this.onHover(null);
});
pane.host.addEventListener('wheel',(e)=>{
e.preventDefault();
const[sx,sy]=this.at(pane,e);
const next=clamp(this.zoom*Math.exp(-e.deltaY*0.0015),MIN_ZOOM,MAX_ZOOM);
const box=pane.host.getBoundingClientRect();
this.setZoom(next);
this.pan.x=sx-(e.clientX-box.left)/next;
this.pan.y=sy-(e.clientY-box.top)/next;
this.onView();
},{passive:false});
}
}
function makePane(host){
const box=document.createElement('div');
box.className='stage-box';
const content=document.createElement('canvas');
const overlay=document.createElement('canvas');
overlay.setAttribute('aria-hidden','true');
box.append(content,overlay);
host.replaceChildren(box);
return{host,box,content,overlay};
}
export function clamp(v,lo,hi){
return Math.max(lo,Math.min(hi,v));
}
