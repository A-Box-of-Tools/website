/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{WEAK_PEAK,estimate,phaseCorrelate,window2d}from'./align.js?v=6592a180a2';
import{
bands,commonArea,outputSize,placement,planRun,refineMargin,refineWindow,workingSize,
}from'./plan.js?v=6592a180a2';
import{findPreview,jpegSize,looksRaw}from'./raw.js?v=6592a180a2';
import{createStack}from'./stack.js?v=6592a180a2';
export const ALIGN_SIZE=256;
const THUMB_SIZE=256;
const MIN_PREVIEW_PIXELS=640*480;
const PNG_SIGNATURE=[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a];
class Cancelled extends Error{}
export function declaredSize(bytes){
if(bytes.length>24&&PNG_SIGNATURE.every((byte,i)=>bytes[i]===byte)){
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
if(view.getUint32(12,false)===0x49484452){
return{width:view.getUint32(16,false),height:view.getUint32(20,false)};
}
}
if(bytes[0]===0xff&&bytes[1]===0xd8)return jpegSize(bytes);
return null;
}
export async function openFrame(file){
const read=async(offset,length)=>new Uint8Array(
await file.slice(offset,offset+length).arrayBuffer(),
);
const raw=looksRaw(file.name)?await findPreview(read,file.size,MIN_PREVIEW_PIXELS):null;
if(raw){
return{
name:file.name,
blob:file.slice(raw.offset,raw.offset+raw.length,'image/jpeg'),
width:raw.width,
height:raw.height,
kind:'raw',
camera:[raw.make,raw.model].filter(Boolean).join(' ')||null,
bytesRead:raw.read,
sourceBytes:file.size,
};
}
const head=new Uint8Array(await file.slice(0,65536).arrayBuffer());
const declared=declaredSize(head);
return{
name:file.name,
blob:file,
width:declared?.width??null,
height:declared?.height??null,
kind:looksRaw(file.name)?'raw-unreadable':'image',
camera:null,
bytesRead:head.length,
sourceBytes:file.size,
};
}
function surface(width,height){
const canvas=new OffscreenCanvas(width,height);
const context=canvas.getContext('2d',{willReadFrequently:true});
context.imageSmoothingEnabled=true;
context.imageSmoothingQuality='high';
return{canvas,context};
}
function drawAligned(context,bitmap,spot,output,move,crop,bandY){
const cx=output.width/2;
const cy=output.height/2;
context.setTransform(1,0,0,1,-crop.x,-crop.y-bandY);
context.translate(cx+move.dx,cy+move.dy);
context.rotate((move.angle*Math.PI)/180);
context.scale(move.scale,move.scale);
context.translate(-cx,-cy);
context.drawImage(bitmap,spot.x,spot.y,spot.width,spot.height);
}
async function surveyFrame(frame){
let bitmap;
if(frame.width&&frame.height){
const fit=Math.min(1,THUMB_SIZE/Math.max(frame.width,frame.height));
bitmap=await createImageBitmap(frame.blob,{
resizeWidth:Math.max(1,Math.round(frame.width*fit)),
resizeHeight:Math.max(1,Math.round(frame.height*fit)),
resizeQuality:'medium',
});
}else{
bitmap=await createImageBitmap(frame.blob);
}
const shown=surface(bitmap.width,bitmap.height);
shown.context.drawImage(bitmap,0,0);
const thumb=await shown.canvas.convertToBlob({type:'image/jpeg',quality:0.8});
shown.canvas.width=0;
return{
described:{
...frame,
width:frame.width??bitmap.width,
height:frame.height??bitmap.height,
},
bitmap,
thumb,
};
}
export async function inspect(files,hooks){
const out=[];
for(const[index,file]of files.entries()){
if(hooks.cancelled())throw new Cancelled();
hooks.onProgress({stage:'open',done:index,total:files.length,name:file.name});
try{
const opened=await openFrame(file);
const surveyed=await surveyFrame(opened);
surveyed.bitmap.close();
out.push({frame:describe(surveyed.described),thumb:surveyed.thumb,ok:true});
}catch{
out.push({frame:{name:file.name,sourceBytes:file.size},thumb:null,ok:false});
}
}
return out;
}
function lumaSquare(bitmap,spot,output,fit){
const{canvas,context}=surface(ALIGN_SIZE,ALIGN_SIZE);
context.setTransform(1,0,0,1,fit.x,fit.y);
context.scale(fit.scale,fit.scale);
context.drawImage(bitmap,spot.x,spot.y,spot.width,spot.height);
const pixels=context.getImageData(0,0,ALIGN_SIZE,ALIGN_SIZE).data;
const out=new Float64Array(ALIGN_SIZE*ALIGN_SIZE);
for(let i=0,at=0;i<out.length;i+=1,at+=4){
out[i]=pixels[at]*0.299+pixels[at+1]*0.587+pixels[at+2]*0.114;
}
canvas.width=0;
return window2d(out,ALIGN_SIZE);
}
function refineSquare(bitmap,spot,output,move,at,size){
const{canvas,context}=surface(size,size);
drawAligned(context,bitmap,spot,output,move,at,0);
const pixels=context.getImageData(0,0,size,size).data;
const out=new Float64Array(size*size);
for(let i=0,p=0;i<out.length;i+=1,p+=4){
out[i]=pixels[p]*0.299+pixels[p+1]*0.587+pixels[p+2]*0.114;
}
canvas.width=0;
return window2d(out,size);
}
export async function runStack(request,hooks){
const{files,mode,align,scale=1}=request;
const stop=()=>{if(hooks.cancelled())throw new Cancelled();};
const report=(update)=>hooks.onProgress(update);
if(!files.length)throw new Error('no.files');
const opened=[];
for(const[index,file]of files.entries()){
stop();
report({stage:'open',done:index,total:files.length,name:file.name});
opened.push(await openFrame(file));
}
const frames=[];
for(const[index,frame]of opened.entries()){
stop();
report({stage:'survey',done:index,total:opened.length,name:frame.name});
const surveyed=await surveyFrame(frame);
frames.push({...surveyed.described,thumb:surveyed.bitmap});
}
const output=outputSize(frames,scale);
if(!output)throw new Error('no.size');
const fit=placement(output,{width:ALIGN_SIZE,height:ALIGN_SIZE});
const moves=[];
let reference=null;
for(const[index,frame]of frames.entries()){
stop();
if(align==='none'){
moves.push({dx:0,dy:0,angle:0,scale:1,confidence:0,clamped:false});
continue;
}
report({stage:'measure',done:index,total:frames.length,name:frame.name});
const spot=placement(frame,output);
const square=lumaSquare(frame.thumb,{
x:spot.x,y:spot.y,width:spot.width,height:spot.height,
},output,fit);
if(!reference){
reference=square;
moves.push({dx:0,dy:0,angle:0,scale:1,confidence:Infinity,clamped:false});
continue;
}
const found=estimate(reference,square,ALIGN_SIZE,align);
moves.push({
...found,
dx:found.dx/fit.scale,
dy:found.dy/fit.scale,
});
}
for(const frame of frames)frame.thumb.close();
const crop=commonArea(moves,output);
const refine=align==='none'?0:refineWindow(crop);
const margin=refine?refineMargin(moves):0;
crop.x+=margin;
crop.y+=margin;
crop.width-=margin*2;
crop.height-=margin*2;
const refineAt=refine?{
x:Math.round(crop.x+(crop.width-refine)/2),
y:Math.round(crop.y+(crop.height-refine)/2),
}:null;
let referenceWindow=null;
const refined=frames.map(()=>false);
const plan=planRun({
width:crop.width,height:crop.height,frames:frames.length,mode,
budget:request.budget,
});
report({stage:'planned',plan,output:crop,frames:frames.map(describe)});
const{canvas:out,context:outContext}=surface(crop.width,crop.height);
const list=bands(crop.height,plan.rows,plan.context);
const totalSteps=plan.decodes;
let step=0;
for(const[bandIndex,band]of list.entries()){
stop();
const stack=createStack(mode,{
width:crop.width,
height:band.readRows,
frames:frames.length,
kappa:request.kappa,
gain:request.gain,
radius:request.radius,
});
const{canvas:scratch,context}=surface(crop.width,band.readRows);
for(let pass=0;pass<stack.passes;pass+=1){
stack.beginPass(pass);
for(const[index,frame]of frames.entries()){
stop();
step+=1;
report({
stage:'stack',done:step,total:totalSteps,name:frame.name,
band:bandIndex+1,bands:list.length,pass:pass+1,passes:stack.passes,
});
const spot=placement(frame,output);
const working=workingSize(frame.width,frame.height,1);
const bitmap=await decodeAt(frame.blob,working,spot);
if(refine&&!refined[index]){
refined[index]=true;
const square=refineSquare(bitmap,spot,output,moves[index],refineAt,refine);
if(index===0){
referenceWindow=square;
}else if(referenceWindow){
const residual=phaseCorrelate(referenceWindow,square,refine);
if(residual.confidence>=WEAK_PEAK
&&Math.abs(residual.dx)<=margin&&Math.abs(residual.dy)<=margin){
moves[index].dx+=residual.dx;
moves[index].dy+=residual.dy;
}
}
}
context.setTransform(1,0,0,1,0,0);
context.clearRect(0,0,crop.width,band.readRows);
drawAligned(context,bitmap,spot,output,moves[index],crop,band.readY);
bitmap.close();
stack.add(context.getImageData(0,0,crop.width,band.readRows).data,index,pass);
}
stack.endPass(pass);
}
const finished=stack.result();
const keep=new ImageData(crop.width,band.rows);
keep.data.set(finished.subarray(
band.offset*crop.width*4,
(band.offset+band.rows)*crop.width*4,
));
outContext.putImageData(keep,0,band.y);
scratch.width=0;
}
stop();
report({stage:'encode',done:totalSteps,total:totalSteps});
const format=request.format==='jpeg'?'image/jpeg':'image/png';
const blob=await out.convertToBlob({
type:format,
quality:format==='image/jpeg'?(request.quality??0.92):undefined,
});
out.width=0;
return{
blob,
width:crop.width,
height:crop.height,
cropped:crop.width!==output.width||crop.height!==output.height,
plan,
frames:frames.map(describe),
moves,
};
}
function decodeAt(blob,natural,spot){
const width=Math.max(1,Math.round(spot.width));
const height=Math.max(1,Math.round(spot.height));
if(width>=natural.width&&height>=natural.height){
return createImageBitmap(blob);
}
return createImageBitmap(blob,{
resizeWidth:width,resizeHeight:height,resizeQuality:'high',
});
}
function describe(frame){
return{
name:frame.name,
width:frame.width,
height:frame.height,
kind:frame.kind,
camera:frame.camera,
bytesRead:frame.bytesRead,
sourceBytes:frame.sourceBytes,
};
}
export{Cancelled};
