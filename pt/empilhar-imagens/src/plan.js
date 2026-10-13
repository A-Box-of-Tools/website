/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{MESH_MAX_BYTES}from'./mesh.js?v=6f5ce41257';
import{applyHomography}from'./projective.js?v=6f5ce41257';
import{DEFAULT_RADIUS}from'./stack.js?v=6f5ce41257';
export const DEFAULT_BUDGET=512*1024*1024;
export const MIN_BAND_ROWS=16;
export const MODES={
mean:{bytes:12,perFrame:false,passes:1,context:0},
median:{bytes:3,perFrame:true,passes:1,context:0},
sigma:{bytes:30,perFrame:false,passes:2,context:0},
max:{bytes:3,perFrame:false,passes:1,context:0},
min:{bytes:3,perFrame:false,passes:1,context:0},
sum:{bytes:12,perFrame:false,passes:1,context:0},
focus:{bytes:15,perFrame:false,passes:1,context:DEFAULT_RADIUS+1},
};
const READBACK_BYTES=4;
export const MODE_IDS=Object.keys(MODES);
export function isMode(id){
return Object.hasOwn(MODES,id);
}
export const SCALES={full:1,half:0.5,quarter:0.25};
export function workingSize(width,height,scale=1){
return{
width:Math.max(1,Math.round(width*scale)),
height:Math.max(1,Math.round(height*scale)),
};
}
export function bytesPerPixel(mode,frames){
const spec=MODES[mode];
if(!spec)throw new RangeError(`unknown mode: ${mode}`);
const accumulator=spec.perFrame?spec.bytes*Math.max(1,frames):spec.bytes;
return accumulator+READBACK_BYTES;
}
export const SURVEY_EDGE=256;
const ALIGN_WORK=16*SURVEY_EDGE*SURVEY_EDGE*8+SURVEY_EDGE*32;
export function planRun({
width,height,frames,mode,budget=DEFAULT_BUDGET,radius=DEFAULT_RADIUS,
decodePixels=width*height,surveyDecodePixels=decodePixels,align='similarity',
}){
const spec=MODES[mode];
if(!spec)throw new RangeError(`unknown mode: ${mode}`);
if(!(width>0)||!(height>0))throw new RangeError('a frame with no size');
const count=Math.max(1,Math.floor(frames));
const context=mode==='focus'?Math.max(0,Math.floor(radius))+1:0;
const accumulatorBytes=spec.perFrame?spec.bytes*count:spec.bytes;
const canvas=width*height*4;
const decode=Math.max(1,decodePixels)*4;
const thumb=Math.min(surveyDecodePixels,SURVEY_EDGE*SURVEY_EDGE)*4;
const retained=count*thumb;
const survey=Math.max(1,surveyDecodePixels)*4+retained+thumb*2;
const measure=retained+(align==='none'?0:ALIGN_WORK);
const refine=align==='none'||!refineWindow({width,height})?0:ALIGN_WORK;
const mesh=align==='projective'&&refine?Math.max(0,count-1)*(MESH_MAX_BYTES+1024):0;
const medianScratch=mode==='median'
?Math.min(width*height*3,8192)*count+count*17
:0;
const stagesAt=(rows)=>{
const readRows=Math.min(height,rows+context*2);
const pixels=width*readRows;
const accumulator=pixels*accumulatorBytes;
const rgba=pixels*4;
return{
survey,
measure,
decode:canvas+accumulator+rgba+decode+refine+mesh,
readback:canvas+accumulator+rgba*2+mesh,
pack:canvas+accumulator+rgba+medianScratch+mesh,
encode:canvas*2+mesh,
};
};
const peakAt=(rows)=>Math.max(...Object.values(stagesAt(rows)));
const minimum=Math.min(height,MIN_BAND_ROWS);
let rows=height;
if(peakAt(rows)>budget){
let low=minimum;
let high=height;
while(low<high){
const middle=Math.ceil((low+high)/2);
if(peakAt(middle)<=budget)low=middle;
else high=middle-1;
}
rows=low;
}
const countBands=Math.ceil(height/rows);
const stages=stagesAt(rows);
const peak=Math.max(...Object.values(stages));
return{
rows,
bands:countBands,
passes:spec.passes,
decodes:countBands*spec.passes*count,
peak,
stages,
overBudget:peak>budget,
banded:countBands>1,
context,
};
}
export function planComparison({output,crop,move,budget=DEFAULT_BUDGET}){
const canvas=crop.width*crop.height*4;
const decode=output.width*output.height*4;
const mesh=move?.homography?MESH_MAX_BYTES+1024:0;
const peak=Math.max(canvas+decode,canvas*2)+mesh;
return{peak,overBudget:peak>budget};
}
export function bands(height,rows,context=0){
const out=[];
for(let y=0;y<height;y+=rows){
const take=Math.min(rows,height-y);
const readY=Math.max(0,y-context);
const readRows=Math.min(height,y+take+context)-readY;
out.push({y,rows:take,readY,readRows,offset:y-readY});
}
return out;
}
export function placement(frame,output){
const scale=Math.min(output.width/frame.width,output.height/frame.height);
const width=frame.width*scale;
const height=frame.height*scale;
return{
scale,
x:(output.width-width)/2,
y:(output.height-height)/2,
width,
height,
};
}
export function outputSize(frames,scale=1){
let width=0;
let height=0;
for(const frame of frames){
if(frame.width*frame.height>width*height){
width=frame.width;
height=frame.height;
}
}
if(!width||!height)return null;
return workingSize(width,height,scale);
}
export function commonArea(moves,output){
const cx=output.width/2;
const cy=output.height/2;
let left=0;
let top=0;
let right=output.width;
let bottom=output.height;
for(const move of moves){
const radians=((move.angle??0)*Math.PI)/180;
const cos=Math.cos(radians)*(move.scale??1);
const sin=Math.sin(radians)*(move.scale??1);
const at=(x,y)=>move.homography?applyHomography(move.homography,x,y):({
x:cx+(x-cx)*cos-(y-cy)*sin+(move.dx??0),
y:cy+(x-cx)*sin+(y-cy)*cos+(move.dy??0),
});
const box=move.spot??{x:0,y:0,width:output.width,height:output.height};
const topLeft=at(box.x,box.y);
const topRight=at(box.x+box.width,box.y);
const bottomRight=at(box.x+box.width,box.y+box.height);
const bottomLeft=at(box.x,box.y+box.height);
left=Math.max(left,topLeft.x,bottomLeft.x);
right=Math.min(right,topRight.x,bottomRight.x);
top=Math.max(top,topLeft.y,topRight.y);
bottom=Math.min(bottom,bottomLeft.y,bottomRight.y);
}
const x=Math.max(0,Math.ceil(left));
const y=Math.max(0,Math.ceil(top));
const width=Math.floor(Math.min(output.width,right))-x;
const height=Math.floor(Math.min(output.height,bottom))-y;
if(width<output.width/4||height<output.height/4){
return{x:0,y:0,width:output.width,height:output.height};
}
return{x,y,width,height};
}
export const REFINE_GRID=3;
export const REFINE_INSET=8;
export function refineWindow({width,height}){
const room=Math.min(width,height)-REFINE_INSET*2;
let cover=512;
while(cover>64&&REFINE_GRID*cover>room)cover/=2;
if(REFINE_GRID*cover>room)return null;
const size=Math.min(256,Math.max(64,cover/2));
return{cover,size,grid:REFINE_GRID};
}
export function scaleThatFits({
width,height,frames,mode,budget=DEFAULT_BUDGET,radius=DEFAULT_RADIUS,
align='similarity',surveyDecodePixels=width*height,
}){
for(const[name,scale]of Object.entries(SCALES)){
const size=workingSize(width,height,scale);
const plan=planRun({...size,frames,mode,budget,radius,align,surveyDecodePixels});
if(!plan.banded&&!plan.overBudget)return name;
}
return null;
}
