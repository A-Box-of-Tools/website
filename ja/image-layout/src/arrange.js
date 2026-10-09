/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{decodeFull}from'./shared/image-list.js?v=d7eb191d15';
import{throwIfAborted}from'./shared/errors.js?v=d7eb191d15';
export const MAX_SIDE=8192;
export const MAX_PIXELS=32_000_000;
export const MIN_ZOOM=0.25;
export const MAX_ZOOM=4;
const RATIOS={square:1,landscape:4/3,portrait:3/4};
const validInteger=(value,minimum)=>Number.isSafeInteger(value)&&value>=minimum;
const fail=(key)=>{throw new RangeError(key);};
function validate(items,settings){
if(!Array.isArray(items)||!settings||typeof settings!=='object')fail('errorSettings');
const{layout,width,columns,ratio,gap,padding,fit}=settings;
if(!['grid','horizontal','vertical'].includes(layout)
||!['square','landscape','portrait','original'].includes(ratio)
||!['contain','cover'].includes(fit)
||!validInteger(width,1)||!validInteger(columns,1)
||!validInteger(gap,0)||!validInteger(padding,0)
||(layout==='grid'&&ratio==='original'))fail('errorSettings');
for(const item of items){
if(!item||!validInteger(item.width,1)||!validInteger(item.height,1))fail('errorSettings');
}
if(width>MAX_SIDE)fail('errorSize');
}
function checkSize(width,height){
if(!Number.isFinite(height)||height>MAX_SIDE||width*height>MAX_PIXELS)fail('errorSize');
if(height<1)fail('errorSpace');
}
export function arrange(items,settings){
if(Array.isArray(items)&&items.length===0)return null;
validate(items,settings);
const{layout,width,ratio,gap,padding}=settings;
const columns=layout==='horizontal'?items.length:layout==='vertical'?1:settings.columns;
const rows=layout==='vertical'?items.length:Math.ceil(items.length/columns);
const availableWidth=width-padding*2-gap*(columns-1);
if(availableWidth<columns)fail('errorSpace');
let cells;
let contentHeight;
if(ratio==='original'&&layout==='horizontal'){
const ratios=items.map((item)=>item.width/item.height);
contentHeight=availableWidth/ratios.reduce((sum,value)=>sum+value,0);
let x=padding;
cells=ratios.map((value)=>{
const cell={x,y:padding,width:contentHeight*value,height:contentHeight};
x+=cell.width+gap;
return cell;
});
}else if(ratio==='original'){
let y=padding;
cells=items.map((item)=>{
const height=availableWidth*item.height/item.width;
const cell={x:padding,y,width:availableWidth,height};
y+=height+gap;
return cell;
});
contentHeight=y-padding-gap;
}else{
const cellWidth=availableWidth/columns;
const cellHeight=cellWidth/RATIOS[ratio];
contentHeight=rows*cellHeight+(rows-1)*gap;
cells=items.map((item,index)=>({
x:padding+(index%columns)*(cellWidth+gap),
y:padding+Math.floor(index/columns)*(cellHeight+gap),
width:cellWidth,
height:cellHeight,
}));
}
for(const cell of cells){
if(cell.width<1||cell.height<1)fail('errorSpace');
}
const height=Math.ceil(contentHeight+padding*2);
checkSize(width,height);
return{width,height,cells,columns,rows};
}
export function imagePlacement(image,cell,fit='contain',transform={}){
if(!['contain','cover'].includes(fit))fail('errorSettings');
if(!image||!cell||!transform||typeof transform!=='object'||Array.isArray(transform)){
fail('errorSettings');
}
const{zoom=1,panX=0,panY=0}=transform;
if(!Number.isFinite(zoom)||zoom<MIN_ZOOM||zoom>MAX_ZOOM
||!Number.isFinite(panX)||Math.abs(panX)>1
||!Number.isFinite(panY)||Math.abs(panY)>1
||!Number.isFinite(cell.x)||!Number.isFinite(cell.y)
||!Number.isFinite(cell.width)||cell.width<=0
||!Number.isFinite(cell.height)||cell.height<=0)fail('errorSettings');
const sourceWidth=image.naturalWidth||image.width;
const sourceHeight=image.naturalHeight||image.height;
if(!Number.isFinite(sourceWidth)||!(sourceWidth>0)
||!Number.isFinite(sourceHeight)||!(sourceHeight>0))fail('errorSettings');
const scale=fit==='cover'
?Math.max(cell.width/sourceWidth,cell.height/sourceHeight)
:Math.min(cell.width/sourceWidth,cell.height/sourceHeight);
const width=sourceWidth*scale*zoom;
const height=sourceHeight*scale*zoom;
const rangeX=Math.abs(width-cell.width)/2;
const rangeY=Math.abs(height-cell.height)/2;
const panRangeX=rangeX<1e-6?0:rangeX;
const panRangeY=rangeY<1e-6?0:rangeY;
return{
x:cell.x+(cell.width-width)/2+panX*panRangeX,
y:cell.y+(cell.height-height)/2+panY*panRangeY,
width,
height,
panRangeX,
panRangeY,
};
}
export function drawImageInCell(ctx,image,cell,fit='contain',transform={},sourceDimensions=image){
const{x,y,width,height}=imagePlacement(sourceDimensions,cell,fit,transform);
ctx.save();
try{
ctx.globalAlpha=1;
ctx.imageSmoothingEnabled=true;
ctx.imageSmoothingQuality='high';
ctx.beginPath();
ctx.rect(cell.x,cell.y,cell.width,cell.height);
ctx.clip();
ctx.drawImage(image,x,y,width,height);
}finally{
ctx.restore();
}
}
export async function renderLayout(items,settings,{signal,onProgress}={}){
throwIfAborted(signal);
const snapshot=items.map((item)=>({
...item,
transform:item.transform&&typeof item.transform==='object'&&!Array.isArray(item.transform)
?{...item.transform}:item.transform,
}));
const options={...settings};
const plan=arrange(snapshot,options);
if(!plan)return null;
const{fit,background='#ffffff',transparent=false}=options;
if(typeof transparent!=='boolean'||typeof background!=='string'||!background)fail('errorSettings');
const canvas=document.createElement('canvas');
canvas.width=plan.width;
canvas.height=plan.height;
try{
const ctx=canvas.getContext('2d',{alpha:true});
if(!ctx)fail('errorSize');
if(!transparent){
ctx.fillStyle=background;
ctx.fillRect(0,0,plan.width,plan.height);
}
for(let index=0;index<snapshot.length;index+=1){
throwIfAborted(signal);
const bitmap=await decodeFull(snapshot[index]);
try{
throwIfAborted(signal);
drawImageInCell(ctx,bitmap,plan.cells[index],fit,snapshot[index].transform);
}finally{
bitmap.close();
}
onProgress?.((index+1)/snapshot.length);
await new Promise((resolve)=>setTimeout(resolve,0));
}
throwIfAborted(signal);
return canvas;
}catch(error){
canvas.width=0;
canvas.height=0;
throw error;
}
}
