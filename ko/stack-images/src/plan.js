/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const DEFAULT_BUDGET=512*1024*1024;
export const MIN_BAND_ROWS=16;
export const MODES={
mean:{bytes:12,perFrame:false,passes:1,context:0},
median:{bytes:3,perFrame:true,passes:1,context:0},
sigma:{bytes:30,perFrame:false,passes:2,context:0},
max:{bytes:3,perFrame:false,passes:1,context:0},
min:{bytes:3,perFrame:false,passes:1,context:0},
sum:{bytes:12,perFrame:false,passes:1,context:0},
focus:{bytes:15,perFrame:false,passes:1,context:2},
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
export function planRun({width,height,frames,mode,budget=DEFAULT_BUDGET}){
const spec=MODES[mode];
if(!spec)throw new RangeError(`unknown mode: ${mode}`);
if(!(width>0)||!(height>0))throw new RangeError('a frame with no size');
const count=Math.max(1,Math.floor(frames));
const perPixel=bytesPerPixel(mode,count);
const perRow=width*perPixel;
const canvas=width*height*4;
const forBands=Math.max(0,budget-canvas);
const affordable=Math.floor(forBands/Math.max(1,perRow));
const rows=Math.min(height,Math.max(MIN_BAND_ROWS,affordable));
const bands=Math.ceil(height/rows);
return{
rows,
bands,
passes:spec.passes,
decodes:bands*spec.passes*count,
peak:canvas+rows*perRow,
banded:bands>1,
context:spec.context,
};
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
const at=(x,y)=>({
x:cx+(x-cx)*cos-(y-cy)*sin+(move.dx??0),
y:cy+(x-cx)*sin+(y-cy)*cos+(move.dy??0),
});
const topLeft=at(0,0);
const topRight=at(output.width,0);
const bottomRight=at(output.width,output.height);
const bottomLeft=at(0,output.height);
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
export function scaleThatFits({width,height,frames,mode,budget=DEFAULT_BUDGET}){
for(const[name,scale]of Object.entries(SCALES)){
const size=workingSize(width,height,scale);
if(!planRun({...size,frames,mode,budget}).banded)return name;
}
return null;
}
