/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{Timeline as Bar,formatTime,parseTime}from'./shared/timeline.js?v=6ce570d903';
export{formatTime,parseTime};
const MIN_SEGMENT=0.05;
const MAX_TICKS=400;
function clamp(value,low,high){
return Math.max(low,Math.min(high,value));
}
export class Timeline extends Bar{
#ticks;
#frameTimes=null;
constructor(root,options={}){
const ticks=document.createElement('div');
ticks.className='tl-ticks';
ticks.setAttribute('aria-hidden','true');
super(root,{...options,layer:ticks,minSegment:MIN_SEGMENT});
this.#ticks=ticks;
}
decorate({keyframes=null,frameTimes=null}={}){
this.#frameTimes=frameTimes&&frameTimes.length?frameTimes:null;
this.#drawTicks(keyframes);
}
snap(seconds){
const times=this.#frameTimes;
if(!times)return clamp(seconds,0,this.duration);
let low=0;
let high=times.length-1;
while(low<high){
const middle=(low+high)>>1;
if(times[middle]<seconds)low=middle+1;
else high=middle;
}
const after=times[low];
const before=low>0?times[low-1]:after;
const nearest=Math.abs(after-seconds)<Math.abs(seconds-before)?after:before;
return clamp(nearest,0,this.duration);
}
get frameStep(){
const times=this.#frameTimes;
if(!times||times.length<2)return 1/30;
return Math.max(1/240,(times[times.length-1]-times[0])/(times.length-1));
}
#drawTicks(keyframes){
this.#ticks.innerHTML='';
if(!keyframes||!keyframes.length||!this.duration)return;
const step=Math.max(1,Math.ceil(keyframes.length/MAX_TICKS));
for(let i=0;i<keyframes.length;i+=step){
const tick=document.createElement('span');
tick.className='tl-tick';
tick.style.left=`${this.fraction(keyframes[i]) * 100}%`;
this.#ticks.append(tick);
}
}
}
