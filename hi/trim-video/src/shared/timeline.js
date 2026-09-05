/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{clockText as formatTime}from'./format.js?v=6ce570d903';
export{formatTime};
function clamp(value,low,high){
return Math.max(low,Math.min(high,value));
}
export function parseTime(text){
const trimmed=String(text??'').trim();
if(!trimmed)return null;
const parts=trimmed.split(':');
if(parts.length>3)return null;
let total=0;
for(const part of parts){
if(!/^\d*\.?\d*$/.test(part)||part===''||part==='.')return null;
total=total*60+Number(part);
}
return Number.isFinite(total)?total:null;
}
export class Timeline{
#root;
#track;
#bands;
#pendingBand;
#playhead;
#onSeek;
#onSelect;
#onAdjust;
#bandTitle;
#minSegment;
#duration=0;
#segments=[];
#selectedId=null;
#pending=null;
#playAt=0;
#enabled=true;
constructor(root,{
onSeek,onSelect,onAdjust,bandTitle,minSegment=0.05,layer=null,
}={}){
this.#root=root;
this.#onSeek=onSeek;
this.#onSelect=onSelect;
this.#onAdjust=onAdjust;
this.#bandTitle=bandTitle;
this.#minSegment=minSegment;
root.innerHTML='';
root.classList.add('timeline');
this.#track=document.createElement('div');
this.#track.className='tl-track';
this.#bands=document.createElement('div');
this.#bands.className='tl-bands';
this.#pendingBand=document.createElement('div');
this.#pendingBand.className='tl-pending';
this.#pendingBand.hidden=true;
this.#playhead=document.createElement('div');
this.#playhead.className='tl-playhead';
this.#playhead.setAttribute('aria-hidden','true');
if(layer)this.#track.append(layer);
this.#track.append(this.#bands,this.#pendingBand,this.#playhead);
root.append(this.#track);
this.#track.addEventListener('pointerdown',this.#onPointerDown);
}
get duration(){
return this.#duration;
}
setSource({duration,...rest}){
this.#duration=Math.max(0,duration||0);
this.#playAt=0;
this.#pending=null;
this.#segments=[];
this.#selectedId=null;
this.decorate(rest);
this.#paint();
}
decorate(){}
setSegments(segments,selectedId=null){
this.#segments=segments;
this.#selectedId=selectedId;
this.#paint();
}
setPending(startSeconds){
this.#pending=startSeconds;
this.#paintPending();
}
setEnabled(enabled){
this.#enabled=enabled;
this.#root.classList.toggle('disabled',!enabled);
}
setPlayhead(seconds){
this.#playAt=clamp(seconds||0,0,this.#duration);
this.#playhead.style.left=`${this.fraction(this.#playAt) * 100}%`;
this.#paintPending();
}
snap(seconds){
return clamp(seconds,0,this.#duration);
}
fraction(seconds){
return this.#duration>0?clamp(seconds/this.#duration,0,1):0;
}
#paint(){
this.#bands.innerHTML='';
this.#segments.forEach((segment,index)=>{
if(segment.end===null)return;
const from=this.fraction(segment.start)*100;
const to=this.fraction(segment.end)*100;
const band=document.createElement('div');
band.className=`tl-band${segment.id === this.#selectedId ? ' selected' : ''}`;
band.dataset.id=String(segment.id);
band.style.left=`${from}%`;
band.style.width=`${Math.max(0.4, to - from)}%`;
band.title=this.#bandTitle?.(index+1,formatTime(segment.start),formatTime(segment.end))
??String(index+1);
const number=document.createElement('span');
number.className='tl-band-number';
number.textContent=String(index+1);
band.append(number);
if(segment.id===this.#selectedId){
for(const which of['start','end']){
const handle=document.createElement('span');
handle.className=`tl-handle tl-handle-${which}`;
handle.dataset.handle=which;
band.append(handle);
}
}
this.#bands.append(band);
});
this.setPlayhead(this.#playAt);
}
#paintPending(){
if(this.#pending===null||!this.#duration){
this.#pendingBand.hidden=true;
return;
}
const from=this.fraction(Math.min(this.#pending,this.#playAt))*100;
const to=this.fraction(Math.max(this.#pending,this.#playAt))*100;
this.#pendingBand.hidden=false;
this.#pendingBand.style.left=`${from}%`;
this.#pendingBand.style.width=`${Math.max(0.3, to - from)}%`;
}
#timeAt(event){
const box=this.#track.getBoundingClientRect();
if(!box.width)return 0;
return clamp((event.clientX-box.left)/box.width,0,1)*this.#duration;
}
#onPointerDown=(event)=>{
if(!this.#enabled||!this.#duration||event.button!==0)return;
const handle=event.target.closest('.tl-handle');
const band=event.target.closest('.tl-band');
const at=this.#timeAt(event);
event.preventDefault();
if(band&&!handle&&band.dataset.id!==String(this.#selectedId)){
this.#onSelect?.(Number(band.dataset.id));
return;
}
if(!handle){
this.#onSeek?.(at);
this.#drag={kind:'seek'};
}else{
const segment=this.#segments.find((one)=>one.id===this.#selectedId);
if(!segment)return;
this.#drag={kind:handle.dataset.handle,segment};
}
this.#track.setPointerCapture?.(event.pointerId);
const move=(moveEvent)=>{
const now=this.#timeAt(moveEvent);
if(this.#drag.kind==='seek'){
this.#onSeek?.(now);
return;
}
const{segment}=this.#drag;
const snapped=this.snap(now);
const next=this.#drag.kind==='start'
?{start:Math.min(snapped,segment.end-this.#minSegment),end:segment.end}
:{start:segment.start,end:Math.max(snapped,segment.start+this.#minSegment)};
this.#onAdjust?.(segment.id,{
start:clamp(next.start,0,this.#duration),
end:clamp(next.end,0,this.#duration),
});
this.#onSeek?.(this.#drag.kind==='start'?next.start:next.end);
};
const up=()=>{
this.#drag=null;
this.#track.releasePointerCapture?.(event.pointerId);
window.removeEventListener('pointermove',move);
window.removeEventListener('pointerup',up);
window.removeEventListener('pointercancel',up);
};
window.addEventListener('pointermove',move);
window.addEventListener('pointerup',up);
window.addEventListener('pointercancel',up);
};
#drag=null;
}
