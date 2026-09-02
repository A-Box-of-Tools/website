/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{drawWaveform}from'./waveform.js';
import{Timeline as Bar,formatTime,parseTime}from'./shared/timeline.js';
export{formatTime,parseTime};
const MIN_SEGMENT=0.02;
export class Timeline extends Bar{
#canvas;
#summary=null;
constructor(root,options={}){
const canvas=document.createElement('canvas');
canvas.className='tl-wave';
canvas.setAttribute('aria-hidden','true');
super(root,{...options,layer:canvas,minSegment:MIN_SEGMENT});
this.#canvas=canvas;
}
decorate({summary=null}={}){
this.#summary=summary;
this.redraw();
}
redraw(){
if(this.#canvas.clientWidth)drawWaveform(this.#canvas,this.#summary);
}
get fineStep(){
return 0.01;
}
}
