/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{writeWav}from'./wav.js?v=ef00d58da2';
const RATE=44100;
const hz=(semitones)=>440*(2**(semitones/12));
const BAR=[-12,-9,-5,0,-5,-9,-12,-9];
const BASS=-24;
function pluck(t,length){
const attack=0.006;
if(t<attack)return t/attack;
const decay=Math.exp(-3.2*(t-attack)/Math.max(0.001,length-attack));
const tail=Math.min(1,(length-t)/0.01);
return decay*Math.max(0,tail);
}
export function exampleAudio({bars=4}={}){
const beat=0.25;
const barSeconds=BAR.length*beat;
const seconds=bars*barSeconds;
const frames=Math.round(seconds*RATE);
const left=new Float32Array(frames);
const right=new Float32Array(frames);
for(let bar=0;bar<bars;bar+=1){
const loud=bar>=bars/2;
const level=loud?0.34:0.19;
const barStart=bar*barSeconds;
const bassStart=Math.round(barStart*RATE);
const bassLength=barSeconds*0.9;
for(let i=0;i<bassLength*RATE&&bassStart+i<frames;i+=1){
const t=i/RATE;
const v=Math.sin(2*Math.PI*hz(BASS)*t)*pluck(t,bassLength)*0.16;
left[bassStart+i]+=v;
right[bassStart+i]+=v;
}
for(let n=0;n<BAR.length;n+=1){
const start=Math.round((barStart+n*beat)*RATE);
const length=beat*0.92;
const f=hz(BAR[n]);
const pan=0.5+0.35*Math.sin((n/BAR.length)*Math.PI*2);
for(let i=0;i<length*RATE&&start+i<frames;i+=1){
const t=i/RATE;
const env=pluck(t,length);
let v=Math.sin(2*Math.PI*f*t)
+0.33*Math.sin(4*Math.PI*f*t);
if(loud)v+=0.5*Math.sin(4*Math.PI*f*t+0.4);
v*=env*level;
left[start+i]+=v*(1-pan);
right[start+i]+=v*pan;
}
}
}
return{channels:[left,right],sampleRate:RATE};
}
export function exampleAudioFile(name,options){
const{channels,sampleRate}=exampleAudio(options);
const blob=writeWav(channels,sampleRate);
return new File([blob],name,{type:'audio/wav',lastModified:Date.now()});
}
