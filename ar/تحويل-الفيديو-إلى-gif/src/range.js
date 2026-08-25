/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const MIN_SECTION=0.1;
const clamp=(value,low,high)=>Math.max(low,Math.min(high,value));
export function formatTime(seconds){
const safe=Math.max(0,seconds||0);
const whole=Math.floor(safe);
const hours=Math.floor(whole/3600);
const minutes=Math.floor((whole%3600)/60);
const rest=whole%60;
const millis=Math.round((safe-whole)*1000);
const tail=`${String(rest).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
return hours
?`${hours}:${String(minutes).padStart(2, '0')}:${tail}`
:`${minutes}:${tail}`;
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
export class RangeBar{
#root;
#track;
#band;
#playhead;
#onSeek;
#onAdjust;
#duration=0;
#start=0;
#end=0;
#playAt=0;
#enabled=true;
#drag=null;
constructor(root,{onSeek,onAdjust}={}){
this.#root=root;
this.#onSeek=onSeek;
this.#onAdjust=onAdjust;
root.innerHTML='';
root.classList.add('rangebar');
this.#track=document.createElement('div');
this.#track.className='rb-track';
this.#band=document.createElement('div');
this.#band.className='rb-band';
for(const which of['start','end']){
const handle=document.createElement('span');
handle.className=`rb-handle rb-handle-${which}`;
handle.dataset.handle=which;
this.#band.append(handle);
}
this.#playhead=document.createElement('div');
this.#playhead.className='rb-playhead';
this.#playhead.setAttribute('aria-hidden','true');
this.#track.append(this.#band,this.#playhead);
root.append(this.#track);
this.#track.addEventListener('pointerdown',this.#onPointerDown);
}
get selection(){
return{start:this.#start,end:this.#end};
}
setSource(duration){
this.#duration=Math.max(0,duration||0);
this.#start=0;
this.#end=this.#duration;
this.#playAt=0;
this.#paint();
}
setSelection(start,end){
this.#start=clamp(start,0,this.#duration);
this.#end=clamp(end,this.#start,this.#duration);
this.#paint();
}
setPlayhead(seconds){
this.#playAt=clamp(seconds||0,0,this.#duration);
this.#playhead.style.left=`${this.#fraction(this.#playAt) * 100}%`;
}
setEnabled(enabled){
this.#enabled=enabled;
this.#root.classList.toggle('disabled',!enabled);
}
#fraction(seconds){
return this.#duration>0?clamp(seconds/this.#duration,0,1):0;
}
#paint(){
const from=this.#fraction(this.#start)*100;
const to=this.#fraction(this.#end)*100;
this.#band.style.left=`${from}%`;
this.#band.style.width=`${Math.max(0.5, to - from)}%`;
this.setPlayhead(this.#playAt);
}
#timeAt(event){
const box=this.#track.getBoundingClientRect();
if(!box.width)return 0;
return clamp((event.clientX-box.left)/box.width,0,1)*this.#duration;
}
#onPointerDown=(event)=>{
if(!this.#enabled||!this.#duration||event.button!==0)return;
const handle=event.target.closest('.rb-handle');
event.preventDefault();
if(handle){
this.#drag=handle.dataset.handle;
}else{
this.#drag='seek';
this.#onSeek?.(this.#timeAt(event));
}
this.#track.setPointerCapture?.(event.pointerId);
const move=(moveEvent)=>{
const at=this.#timeAt(moveEvent);
if(this.#drag==='seek'){
this.#onSeek?.(at);
return;
}
const next=this.#drag==='start'
?{start:Math.min(at,this.#end-MIN_SECTION),end:this.#end}
:{start:this.#start,end:Math.max(at,this.#start+MIN_SECTION)};
this.#onAdjust?.({
start:clamp(next.start,0,this.#duration),
end:clamp(next.end,0,this.#duration),
});
this.#onSeek?.(this.#drag==='start'?next.start:next.end);
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
}
