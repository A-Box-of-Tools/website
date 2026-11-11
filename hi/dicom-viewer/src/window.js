/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const CT_PRESETS=[
{id:'soft',center:40,width:400},
{id:'lung',center:-600,width:1500},
{id:'bone',center:300,width:1500},
{id:'brain',center:40,width:80},
{id:'liver',center:60,width:160},
{id:'mediastinum',center:50,width:350},
{id:'angio',center:300,width:600},
];
export function fileWindows(info){
const out=[];
for(let at=0;at<info.windowCenters.length;at+=1){
const center=info.windowCenters[at];
const width=info.windowWidths[at]??info.windowWidths[0];
if(!Number.isFinite(center)||!Number.isFinite(width)||width<=0)continue;
out.push({id:`file-${at}`,name:info.windowNames[at]||null,center,width});
}
return out;
}
export function fullRange(frame,info){
const low=frame.min*info.slope+info.intercept;
const high=frame.max*info.slope+info.intercept;
const width=Math.max(1,high-low);
return{id:'full',center:low+width/2,width};
}
export function render(frame,info,view){
const{width,height,samples,values}=frame;
const data=new Uint8ClampedArray(width*height*4);
if(samples===3){
paintColour(data,values,width*height,info);
return{data,width,height};
}
if(info.palette){
paintPalette(data,values,width*height,info.palette);
return{data,width,height};
}
paintGrey(data,frame,info,view);
return{data,width,height};
}
function paintGrey(data,frame,info,view){
const{values}=frame;
const count=frame.width*frame.height;
const inverted=view.invert!==(info.photometric==='MONOCHROME1');
const span=frame.max-frame.min;
if(span>=0&&span<=65535){
const table=new Uint8Array(span+1);
for(let at=0;at<=span;at+=1){
table[at]=grey(at+frame.min,info,view,inverted);
}
for(let at=0;at<count;at+=1){
const value=values[at];
const shade=value<frame.min?table[0]
:value>frame.max?table[span]
:table[value-frame.min];
data[at*4]=shade;
data[at*4+1]=shade;
data[at*4+2]=shade;
data[at*4+3]=255;
}
return;
}
for(let at=0;at<count;at+=1){
const shade=grey(values[at],info,view,inverted);
data[at*4]=shade;
data[at*4+1]=shade;
data[at*4+2]=shade;
data[at*4+3]=255;
}
}
function grey(stored,info,view,inverted){
const value=stored*info.slope+info.intercept;
const shade=voi(value,view.center,view.width,view.voiFunction);
return inverted?255-shade:shade;
}
export function voi(value,center,width,fn){
if(fn==='SIGMOID'){
return clamp(255/(1+Math.exp((-4*(value-center))/Math.max(width,1e-6))));
}
if(fn==='LINEAR_EXACT'){
const half=width/2;
if(value<=center-half)return 0;
if(value>center+half)return 255;
return clamp(((value-center)/width+0.5)*255);
}
const c=center-0.5;
const w=Math.max(width,1)-1;
if(w<=0)return value<=c?0:255;
if(value<=c-w/2)return 0;
if(value>c+w/2)return 255;
return clamp(((value-c)/w+0.5)*255);
}
const clamp=(value)=>(value<0?0:value>255?255:Math.round(value));
function paintColour(data,values,count,info){
const shift=Math.max(0,info.bitsStored-8);
for(let at=0;at<count;at+=1){
data[at*4]=values[at*3]>>shift;
data[at*4+1]=values[at*3+1]>>shift;
data[at*4+2]=values[at*3+2]>>shift;
data[at*4+3]=255;
}
}
function paintPalette(data,values,count,palette){
const last=palette.count-1;
for(let at=0;at<count;at+=1){
const index=Math.min(last,Math.max(0,values[at]-palette.first));
data[at*4]=palette.red[index];
data[at*4+1]=palette.green[index];
data[at*4+2]=palette.blue[index];
data[at*4+3]=255;
}
}
export function measured(stored,info){
const value=stored*info.slope+info.intercept;
let unit=info.rescaleType;
if(!unit&&info.modality==='CT')unit='HU';
if(unit==='US')unit='';
return{value,unit};
}
