/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const SUMMARY_COLUMNS=4096;
export function summarise(channels,columns=SUMMARY_COLUMNS){
const frames=channels[0]?.length??0;
const width=Math.max(1,Math.min(columns,frames||1));
const low=new Float32Array(width);
const high=new Float32Array(width);
if(!frames)return{low,high,columns:width};
const perColumn=frames/width;
for(let column=0;column<width;column+=1){
const start=Math.floor(column*perColumn);
const end=Math.max(start+1,Math.min(frames,Math.floor((column+1)*perColumn)));
let lowest=0;
let highest=0;
for(const samples of channels){
for(let i=start;i<end;i+=1){
const value=samples[i];
if(value<lowest)lowest=value;
if(value>highest)highest=value;
}
}
low[column]=lowest;
high[column]=highest;
}
return{low,high,columns:width};
}
function reduce(summary,width){
if(width>=summary.columns)return summary;
const low=new Float32Array(width);
const high=new Float32Array(width);
const per=summary.columns/width;
for(let column=0;column<width;column+=1){
const start=Math.floor(column*per);
const end=Math.max(start+1,Math.min(summary.columns,Math.floor((column+1)*per)));
let lowest=0;
let highest=0;
for(let i=start;i<end;i+=1){
if(summary.low[i]<lowest)lowest=summary.low[i];
if(summary.high[i]>highest)highest=summary.high[i];
}
low[column]=lowest;
high[column]=highest;
}
return{low,high,columns:width};
}
export function drawWaveform(canvas,summary){
const style=getComputedStyle(canvas);
const width=Math.max(1,Math.round(canvas.clientWidth));
const height=Math.max(1,Math.round(canvas.clientHeight));
const density=Math.min(2,window.devicePixelRatio||1);
canvas.width=Math.round(width*density);
canvas.height=Math.round(height*density);
const context=canvas.getContext('2d');
context.scale(density,density);
context.clearRect(0,0,width,height);
const middle=height/2;
context.strokeStyle=style.getPropertyValue('--wave-line').trim()||'#888';
context.lineWidth=1;
context.beginPath();
context.moveTo(0,middle+0.5);
context.lineTo(width,middle+0.5);
context.stroke();
if(!summary)return;
const shown=reduce(summary,width);
const scale=width/shown.columns;
context.fillStyle=style.getPropertyValue('--wave-fill').trim()||'#5b9bd8';
for(let column=0;column<shown.columns;column+=1){
const top=middle-Math.min(1,shown.high[column])*middle;
const bottom=middle-Math.max(-1,shown.low[column])*middle;
context.fillRect(column*scale,top,Math.max(1,scale),Math.max(1,bottom-top));
}
}
