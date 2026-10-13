/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const SLOP=5;
const EDGE=70;
const EDGE_SPEED=14;
export function wireReorder(list,{item,handle,blocked,onMove}){
let drag=null;
const tileAt=(node)=>node?.closest?.(item)??null;
const indexOf=(tile)=>Number(tile.dataset.index);
const clearMarkers=()=>{
for(const node of list.querySelectorAll('.insert-before, .insert-after')){
node.classList.remove('insert-before','insert-after');
}
};
const landing=(x,y)=>{
const over=tileAt(document.elementFromPoint(x,y));
if(!over)return null;
const box=over.getBoundingClientRect();
const past=x>box.left+box.width/2;
return{index:indexOf(over),after:drag?.rtl?!past:past,tile:over};
};
const showMarker=(spot)=>{
clearMarkers();
if(spot)spot.tile.classList.add(spot.after?'insert-after':'insert-before');
};
const follow=()=>{
const x=drag.x+scrollX-drag.startX;
const y=drag.y+scrollY-drag.startY;
drag.tile.style.transform=`translate(${x}px, ${y}px)`;
};
let scrolling=0;
const edgeScroll=()=>{
if(!drag?.lifted){scrolling=0;return;}
const{y}=drag;
const push=y<EDGE?-EDGE_SPEED:(y>innerHeight-EDGE?EDGE_SPEED:0);
if(push){
scrollBy(0,push);
follow();
drag.spot=landing(drag.x,drag.y);
showMarker(drag.spot);
}
scrolling=requestAnimationFrame(edgeScroll);
};
const lift=()=>{
drag.lifted=true;
drag.tile.classList.add('dragging');
scrolling=requestAnimationFrame(edgeScroll);
};
const finish=(apply)=>{
if(!drag)return;
const{tile,from,spot,lifted}=drag;
drag=null;
cancelAnimationFrame(scrolling);
tile.classList.remove('dragging');
tile.style.transform='';
clearMarkers();
if(!lifted||!apply||!spot)return;
let to=spot.after?spot.index+1:spot.index;
if(from<to)to-=1;
if(to!==from)onMove(from,to);
};
list.addEventListener('pointerdown',(event)=>{
if(drag||blocked()||event.button!==0)return;
const tile=tileAt(event.target);
if(!tile)return;
const grip=event.target.closest(handle);
if(!grip&&event.target.closest('button, a, input, select'))return;
if(event.pointerType==='touch'&&!grip)return;
drag={
tile,
pointerId:event.pointerId,
rtl:getComputedStyle(list).direction==='rtl',
from:indexOf(tile),
startX:event.clientX+scrollX,
startY:event.clientY+scrollY,
x:event.clientX,
y:event.clientY,
lifted:false,
spot:null,
};
try{
list.setPointerCapture(event.pointerId);
}catch{
drag=null;
}
});
list.addEventListener('pointermove',(event)=>{
if(!drag||event.pointerId!==drag.pointerId)return;
drag.x=event.clientX;
drag.y=event.clientY;
if(!drag.lifted){
const moved=Math.hypot(
drag.x+scrollX-drag.startX,drag.y+scrollY-drag.startY);
if(moved<SLOP)return;
lift();
}
event.preventDefault();
follow();
drag.spot=landing(drag.x,drag.y);
showMarker(drag.spot);
});
for(const type of['pointerup','pointercancel']){
list.addEventListener(type,(event)=>{
if(!drag||event.pointerId!==drag.pointerId)return;
finish(type==='pointerup');
});
}
addEventListener('keydown',(event)=>{
if(event.key==='Escape'&&drag?.lifted)finish(false);
});
return()=>finish(false);
}
