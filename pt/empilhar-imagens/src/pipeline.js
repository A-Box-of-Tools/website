/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{NO_MOVE,estimate,isMeasured,phaseCorrelate,window2d}from'./align.js?v=6f5ce41257';
import{
REFINE_INSET,SURVEY_EDGE,bands,commonArea,outputSize,placement,planComparison,
planRun,refineWindow,workingSize,
}from'./plan.js?v=6f5ce41257';
import{drawMesh,prepareMesh}from'./mesh.js?v=6f5ce41257';
import{
boundedHomography,multiplyHomographies,projectiveConsensus,similarityHomography,
}from'./projective.js?v=6f5ce41257';
import{jpegOrientation,orientationMatrix,orientedSize}from'./orient.js?v=6f5ce41257';
import{findPreview,jpegSize,looksRaw}from'./raw.js?v=6f5ce41257';
import{MIN_INLIERS,consensus}from'./similarity.js?v=6f5ce41257';
import{DEFAULT_RADIUS,createStack}from'./stack.js?v=6f5ce41257';
export const ALIGN_SIZE=256;
const THUMB_SIZE=SURVEY_EDGE;
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
if(bytes[0]===0xff&&bytes[1]===0xd8){
const stored=jpegSize(bytes);
if(!stored)return null;
const orientation=jpegOrientation(bytes);
return{...orientedSize(stored.width,stored.height,orientation??1),orientation};
}
return null;
}
const validTurn=(value)=>(value>=1&&value<=8?value:1);
const PREVIEW_HEAD_RETRY=65536;
export async function openFrame(file){
const read=async(offset,length)=>new Uint8Array(
await file.slice(offset,offset+length).arrayBuffer(),
);
const raw=looksRaw(file.name)?await findPreview(read,file.size,MIN_PREVIEW_PIXELS):null;
if(raw){
let fromPreview=raw.previewOrientation;
let bytesRead=raw.read;
if(fromPreview===undefined){
const more=Math.min(raw.length,PREVIEW_HEAD_RETRY);
fromPreview=jpegOrientation(await read(raw.offset,more))??null;
bytesRead+=more;
}
const turn=fromPreview===null?validTurn(raw.orientation):1;
const known=Boolean(raw.width&&raw.height);
const upright=known?orientedSize(raw.width,raw.height,fromPreview??turn):null;
let decoded=null;
if(known)decoded=turn===1?upright:{width:raw.width,height:raw.height};
return{
name:file.name,
blob:file.slice(raw.offset,raw.offset+raw.length,'image/jpeg'),
width:upright?.width??null,
height:upright?.height??null,
turn,
decoded,
kind:'raw',
camera:[raw.make,raw.model].filter(Boolean).join(' ')||null,
bytesRead,
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
turn:1,
decoded:declared?{width:declared.width,height:declared.height}:null,
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
function frameTransform(context,bitmap,spot,turn){
if(turn===1){
context.translate(spot.x,spot.y);
context.scale(spot.width/bitmap.width,spot.height/bitmap.height);
return;
}
const stored=orientedSize(spot.width,spot.height,turn);
const[a,b,c,d]=orientationMatrix(turn);
context.translate(spot.x+spot.width/2,spot.y+spot.height/2);
context.transform(a,b,c,d,0,0);
context.translate(-stored.width/2,-stored.height/2);
context.scale(stored.width/bitmap.width,stored.height/bitmap.height);
}
function drawFrame(context,bitmap,spot,turn){
context.save();
frameTransform(context,bitmap,spot,turn);
context.drawImage(bitmap,0,0);
context.restore();
}
function drawAligned(context,bitmap,spot,output,move,crop,bandY,turn){
if(move.homography){
drawMesh(context,bitmap,move.homography,spot,turn,{
x:crop.x,y:crop.y+bandY,width:context.canvas.width,height:context.canvas.height,
});
return;
}
const cx=output.width/2;
const cy=output.height/2;
context.setTransform(1,0,0,1,-crop.x,-crop.y-bandY);
context.translate(cx+move.dx,cy+move.dy);
context.rotate((move.angle*Math.PI)/180);
context.scale(move.scale,move.scale);
context.translate(-cx,-cy);
drawFrame(context,bitmap,spot,turn);
}
export async function compareReference(request,hooks){
const{file,output,crop,spot,move}=request;
const stop=()=>{if(hooks.cancelled())throw new Cancelled();};
if(planComparison(request).overBudget)throw new Error('memory');
let bitmap=null;
let canvas=null;
try{
stop();
const frame=await openFrame(file);
const natural=request.decoded??frame.decoded;
if(natural){
bitmap=await decodeAt(frame.blob,natural,spot,frame.turn);
}else{
const wanted=orientedSize(spot.width,spot.height,frame.turn);
bitmap=await createImageBitmap(frame.blob,{
resizeWidth:Math.max(1,Math.round(wanted.width)),
resizeHeight:Math.max(1,Math.round(wanted.height)),
resizeQuality:'high',
});
}
stop();
const shown=surface(crop.width,crop.height);
canvas=shown.canvas;
drawAligned(shown.context,bitmap,spot,output,move,crop,0,frame.turn);
bitmap.close();
bitmap=null;
const blob=await canvas.convertToBlob({type:'image/png'});
stop();
return{blob,width:crop.width,height:crop.height};
}finally{
bitmap?.close();
if(canvas)canvas.width=0;
}
}
export async function surveyFrame(frame){
const known=Boolean(frame.width&&frame.height);
let bitmap=null;
let natural=null;
let shown=null;
let decoded=frame.decoded;
try{
if(known){
const fit=Math.min(1,THUMB_SIZE/Math.max(frame.width,frame.height));
bitmap=await createImageBitmap(frame.blob,{
resizeWidth:Math.max(1,Math.round(frame.decoded.width*fit)),
resizeHeight:Math.max(1,Math.round(frame.decoded.height*fit)),
resizeQuality:'medium',
});
}else{
natural=await createImageBitmap(frame.blob);
decoded={width:natural.width,height:natural.height};
const fit=Math.min(1,THUMB_SIZE/Math.max(natural.width,natural.height));
if(fit<1){
bitmap=await createImageBitmap(natural,{
resizeWidth:Math.max(1,Math.round(natural.width*fit)),
resizeHeight:Math.max(1,Math.round(natural.height*fit)),
resizeQuality:'medium',
});
natural.close();
natural=null;
}else{
bitmap=natural;
natural=null;
}
}
const upright=orientedSize(bitmap.width,bitmap.height,frame.turn);
shown=surface(upright.width,upright.height);
drawFrame(shown.context,bitmap,{x:0,y:0,...upright},frame.turn);
const thumb=await shown.canvas.convertToBlob({type:'image/jpeg',quality:0.8});
const size=orientedSize(decoded.width,decoded.height,frame.turn);
const result={
described:{
...frame,
width:known?frame.width:size.width,
height:known?frame.height:size.height,
decoded,
surveyDecodePixels:known?bitmap.width*bitmap.height:decoded.width*decoded.height,
},
bitmap,
thumb,
};
bitmap=null;
return result;
}finally{
natural?.close();
bitmap?.close();
if(shown)shown.canvas.width=0;
}
}
export async function inspect(files,hooks){
const out=[];
for(const[index,file]of files.entries()){
if(hooks.cancelled())throw new Cancelled();
hooks.onProgress({stage:'open',done:index,total:files.length,name:file.name});
try{
const opened=await openFrame(file);
const surveyed=await surveyFrame(opened);
try{
if(hooks.cancelled())throw new Cancelled();
out.push({frame:describe(surveyed.described),thumb:surveyed.thumb,ok:true});
}finally{
surveyed.bitmap.close();
}
}catch(error){
if(error instanceof Cancelled)throw error;
out.push({frame:{name:file.name,sourceBytes:file.size},thumb:null,ok:false});
}
}
return out;
}
function lumaSquare(bitmap,spot,fit,turn){
const{canvas,context}=surface(ALIGN_SIZE,ALIGN_SIZE);
context.setTransform(1,0,0,1,fit.x,fit.y);
context.scale(fit.scale,fit.scale);
drawFrame(context,bitmap,spot,turn);
const pixels=context.getImageData(0,0,ALIGN_SIZE,ALIGN_SIZE).data;
const out=new Float64Array(ALIGN_SIZE*ALIGN_SIZE);
for(let i=0,at=0;i<out.length;i+=1,at+=4){
out[i]=pixels[at]*0.299+pixels[at+1]*0.587+pixels[at+2]*0.114;
}
canvas.width=0;
return window2d(out,ALIGN_SIZE,fit);
}
const REFINE_TOLERANCE=2;
const REFINE_LIMIT=2;
export const REFINED=Object.freeze({
reference:'reference',
fit:'fit',
projective:'projective',
projectiveFallback:'projective-fallback',
partial:'partial',
coarse:'coarse',
none:'none',
});
const SOURCE_SLACK=4;
export function refineGrid(crop,windows){
const width=crop.width-REFINE_INSET*2;
const height=crop.height-REFINE_INSET*2;
const out=[];
for(let row=0;row<windows.grid;row+=1){
for(let column=0;column<windows.grid;column+=1){
const x=Math.round(
crop.x+REFINE_INSET+(width*(column+0.5))/windows.grid-windows.cover/2,
);
const y=Math.round(
crop.y+REFINE_INSET+(height*(row+0.5))/windows.grid-windows.cover/2,
);
out.push({x,y,centre:{x:x+windows.cover/2,y:y+windows.cover/2}});
}
}
return out;
}
function drawSource(context,bitmap,size){
const inverse=context.getTransform().inverse();
let left=Infinity;
let top=Infinity;
let right=-Infinity;
let bottom=-Infinity;
for(const[x,y]of[[0,0],[size,0],[size,size],[0,size]]){
const at=inverse.transformPoint({x,y});
left=Math.min(left,at.x);
right=Math.max(right,at.x);
top=Math.min(top,at.y);
bottom=Math.max(bottom,at.y);
}
const x=Math.max(0,Math.floor(left)-SOURCE_SLACK);
const y=Math.max(0,Math.floor(top)-SOURCE_SLACK);
const width=Math.min(bitmap.width,Math.ceil(right)+SOURCE_SLACK)-x;
const height=Math.min(bitmap.height,Math.ceil(bottom)+SOURCE_SLACK)-y;
if(width<=0||height<=0)return;
context.drawImage(bitmap,x,y,width,height,x,y,width,height);
}
function windowSquare(bitmap,spot,output,move,at,windows,turn){
const{canvas,context}=surface(windows.size,windows.size);
const zoom=windows.size/windows.cover;
const cx=output.width/2;
const cy=output.height/2;
context.setTransform(zoom,0,0,zoom,-at.x*zoom,-at.y*zoom);
context.translate(cx+move.dx,cy+move.dy);
context.rotate((move.angle*Math.PI)/180);
context.scale(move.scale,move.scale);
context.translate(-cx,-cy);
frameTransform(context,bitmap,spot,turn);
drawSource(context,bitmap,windows.size);
const pixels=context.getImageData(0,0,windows.size,windows.size).data;
const out=new Float64Array(windows.size*windows.size);
for(let i=0,p=0;i<out.length;i+=1,p+=4){
out[i]=pixels[p]*0.299+pixels[p+1]*0.587+pixels[p+2]*0.114;
}
canvas.width=0;
return window2d(out,windows.size);
}
export function compose(move,fit,turning){
const angle=turning?fit.angle:0;
const scale=turning?fit.scale:1;
const radians=(angle*Math.PI)/180;
const cos=Math.cos(radians)*scale;
const sin=Math.sin(radians)*scale;
return{
...move,
angle:move.angle+angle,
scale:move.scale*scale,
dx:cos*move.dx-sin*move.dy+fit.dx,
dy:sin*move.dx+cos*move.dy+fit.dy,
};
}
function agreeing(points){
let best=[];
for(const seed of points){
const near=points.filter(
(point)=>Math.hypot(point.dx-seed.dx,point.dy-seed.dy)<=REFINE_TOLERANCE,
);
if(near.length>best.length)best=near;
}
return best;
}
export function fellBack(area,moves,output){
if(area.width!==output.width||area.height!==output.height)return false;
return moves.some((move)=>{
const box=move.spot??{x:0,y:0,width:output.width,height:output.height};
return Boolean(move.homography)||move.dx!==0||move.dy!==0||move.angle!==0||move.scale!==1
||box.x!==0||box.y!==0
||box.width!==output.width||box.height!==output.height;
});
}
export function finalCrop(moves,output,covered,slivered,mode,radius){
const found=commonArea(moves,output);
const x=Math.max(found.x,covered.x);
const y=Math.max(found.y,covered.y);
const width=Math.min(found.x+found.width,covered.x+covered.width)-x;
const height=Math.min(found.y+found.height,covered.y+covered.height)-y;
const area=width>0&&height>0?{x,y,width,height}:{...covered};
if(mode!=='focus')return area;
const inset=(radius??DEFAULT_RADIUS)+2;
const insetX=slivered||area.width<covered.width?inset:0;
const insetY=slivered||area.height<covered.height?inset:0;
if(area.width<=insetX*2||area.height<=insetY*2)return area;
return{
x:area.x+insetX,
y:area.y+insetY,
width:area.width-insetX*2,
height:area.height-insetY*2,
};
}
export function refineMove(move,points,turning,centre,limit){
const found=consensus(points,REFINE_TOLERANCE,centre);
if(found&&Math.hypot(found.fit.dx,found.fit.dy)<=limit){
return{
...compose(move,found.fit,turning),
refine:REFINED.fit,
clamped:turning?false:move.clamped,
};
}
const together=points.length<MIN_INLIERS?agreeing(points):[];
if(together.length>=2){
let dx=0;
let dy=0;
for(const point of together){
dx+=point.dx;
dy+=point.dy;
}
const shift={angle:0,scale:1,dx:dx/together.length,dy:dy/together.length};
if(Math.hypot(shift.dx,shift.dy)<=limit){
return{...compose(move,shift,false),refine:REFINED.partial,partial:true};
}
}
return{...move,refine:REFINED.coarse};
}
export function refineProjective(move,points,centre,limit,output,spot){
const simple=refineMove(move,points,true,centre,limit);
const fallback={...simple,refine:REFINED.projectiveFallback,fallbackRefine:simple.refine};
const found=projectiveConsensus(points,{centre,output,limit,tolerance:REFINE_TOLERANCE});
if(!found)return fallback;
const homography=multiplyHomographies(found.matrix,similarityHomography(move,centre));
if(!boundedHomography(homography,output))return fallback;
try{
prepareMesh(homography,spot);
}catch(error){
if(error.message==='warp')return fallback;
throw error;
}
return{
...move,homography,refine:REFINED.projective,clamped:false,
projectiveInliers:found.inliers.length,
projectiveRms:found.rms,
projectiveValidation:found.validation,
};
}
export async function runStack(request,hooks){
const{files,mode,align,scale=1}=request;
const stop=()=>{if(hooks.cancelled())throw new Cancelled();};
const report=(update)=>hooks.onProgress(update);
if(!files.length)throw new Error('no.files');
const frames=[];
let activeBitmap=null;
let scratch=null;
let out=null;
try{
const opened=[];
for(const[index,file]of files.entries()){
stop();
report({stage:'open',done:index,total:files.length,name:file.name});
opened.push(await openFrame(file));
}
for(const[index,frame]of opened.entries()){
stop();
report({stage:'survey',done:index,total:opened.length,name:frame.name});
const surveyed=await surveyFrame(frame);
frames.push({...surveyed.described,thumb:surveyed.bitmap});
}
const output=outputSize(frames,scale);
if(!output)throw new Error('no.size');
const fit=placement(output,{width:ALIGN_SIZE,height:ALIGN_SIZE});
const spots=frames.map((frame)=>placement(frame,output));
const centre={x:output.width/2,y:output.height/2};
const moves=[];
const placed=()=>moves.map((move,index)=>({...move,spot:spots[index]}));
let reference=null;
for(const[index,frame]of frames.entries()){
stop();
if(align==='none'){
moves.push({...NO_MOVE,measured:true,clamped:false});
continue;
}
report({stage:'measure',done:index,total:frames.length,name:frame.name});
const spot=spots[index];
const square=lumaSquare(frame.thumb,{
x:spot.x,y:spot.y,width:spot.width,height:spot.height,
},fit,frame.turn);
if(!reference){
reference=square;
moves.push({
...NO_MOVE,measured:true,clamped:false,live:1,coherence:1,plateau:0,next:0,
refine:REFINED.reference,
});
continue;
}
const found=estimate(reference,square,ALIGN_SIZE,align==='projective'?'similarity':align);
moves.push(found.measured?{
...found,
dx:found.dx/fit.scale,
dy:found.dy/fit.scale,
refine:REFINED.coarse,
}:{
...NO_MOVE,
measured:false,
clamped:false,
live:found.live,
coherence:found.coherence,
plateau:found.plateau,
next:found.next,
refine:REFINED.none,
});
}
for(const frame of frames){
frame.thumb.close();
frame.thumb=null;
}
reference=null;
const covered=commonArea(placed(),output);
const slivered=fellBack(covered,placed(),output);
const windows=align==='none'||slivered?null:refineWindow(covered);
const grid=windows?refineGrid(covered,windows):[];
let referenceWindows=null;
const refined=frames.map(()=>false);
const limit=REFINE_LIMIT/fit.scale;
if(align==='projective'){
for(let index=1;index<moves.length;index+=1){
if(!windows||!moves[index].measured){
moves[index]={...moves[index],refine:REFINED.projectiveFallback,fallbackRefine:moves[index].refine};
}
}
}
const plan=planRun({
width:covered.width,height:covered.height,frames:frames.length,mode,
budget:request.budget,
radius:request.radius,
decodePixels:Math.max(...frames.map((frame,index)=>{
const size=decodeSize(frame.decoded,spots[index],frame.turn);
return size.width*size.height;
})),
surveyDecodePixels:Math.max(...frames.map((frame)=>frame.surveyDecodePixels)),
align,
});
if(plan.overBudget)throw new Error('memory');
report({stage:'planned',plan,output,frames:frames.map(describe)});
let crop=null;
let outContext=null;
const list=bands(covered.height,plan.rows,plan.context);
const totalSteps=plan.decodes;
let step=0;
for(const[bandIndex,band]of list.entries()){
stop();
const stack=createStack(mode,{
width:covered.width,
height:band.readRows,
frames:frames.length,
kappa:request.kappa,
gain:request.gain,
radius:request.radius,
});
const workingSurface=surface(covered.width,band.readRows);
scratch=workingSurface.canvas;
const{context}=workingSurface;
for(let pass=0;pass<stack.passes;pass+=1){
stack.beginPass(pass);
for(const[index,frame]of frames.entries()){
stop();
step+=1;
report({
stage:'stack',done:step,total:totalSteps,name:frame.name,
band:bandIndex+1,bands:list.length,pass:pass+1,passes:stack.passes,
});
const spot=spots[index];
const working=workingSize(frame.decoded.width,frame.decoded.height,1);
const bitmap=await decodeAt(frame.blob,working,spot,frame.turn);
activeBitmap=bitmap;
stop();
if(windows&&!refined[index]){
refined[index]=true;
if(index===0){
referenceWindows=grid.map((at)=>windowSquare(
bitmap,spot,output,moves[index],at,windows,frame.turn,
));
}else if(referenceWindows&&moves[index].measured){
const points=[];
for(const[which,at]of grid.entries()){
const square=windowSquare(
bitmap,spot,output,moves[index],at,windows,frame.turn,
);
const residual=phaseCorrelate(referenceWindows[which],square,windows.size);
if(!isMeasured(residual))continue;
const back=windows.cover/windows.size;
const dx=residual.dx*back;
const dy=residual.dy*back;
if(Math.hypot(dx,dy)>windows.cover/4)continue;
points.push({x:at.centre.x,y:at.centre.y,dx,dy});
}
moves[index]=align==='projective'
?refineProjective(moves[index],points,centre,limit,output,spot)
:refineMove(moves[index],points,align==='similarity',centre,limit);
}
}
context.setTransform(1,0,0,1,0,0);
context.clearRect(0,0,covered.width,band.readRows);
drawAligned(context,bitmap,spot,output,moves[index],covered,band.readY,frame.turn);
bitmap.close();
activeBitmap=null;
stack.add(context.getImageData(0,0,covered.width,band.readRows).data,index,pass);
}
stack.endPass(pass);
}
scratch.width=0;
scratch=null;
stop();
if(!crop){
crop=finalCrop(placed(),output,covered,slivered,mode,request.radius);
({canvas:out,context:outContext}=surface(crop.width,crop.height));
referenceWindows=null;
}
const finished=stack.result();
const top=crop.y-covered.y;
const from=Math.max(band.y,top);
const to=Math.min(band.y+band.rows,top+crop.height);
if(to>from){
const image=new ImageData(finished,covered.width,band.readRows);
const left=crop.x-covered.x;
const readTop=band.offset+from-band.y;
outContext.putImageData(
image,-left,band.readY-top,left,readTop,crop.width,to-from,
);
}
}
const base=commonArea(spots.map((spot)=>({...NO_MOVE,spot})),output);
stop();
report({stage:'encode',done:totalSteps,total:totalSteps});
const format=request.format==='jpeg'?'image/jpeg':'image/png';
const blob=await out.convertToBlob({
type:format,
quality:format==='image/jpeg'?(request.quality??0.92):undefined,
});
stop();
return{
blob,
width:crop.width,
height:crop.height,
cropped:crop.width!==base.width||crop.height!==base.height,
plan,
frames:frames.map(describe),
moves,
comparison:{
output,crop,spot:spots[0],move:moves[0],decoded:frames[0].decoded,
},
};
}finally{
activeBitmap?.close();
for(const frame of frames)frame.thumb?.close();
if(scratch)scratch.width=0;
if(out)out.width=0;
}
}
export function decodeSize(natural,spot,turn){
const wanted=orientedSize(spot.width,spot.height,turn);
const width=Math.max(1,Math.round(wanted.width));
const height=Math.max(1,Math.round(wanted.height));
return width>=natural.width&&height>=natural.height
?{...natural,resize:false}
:{width,height,resize:true};
}
function decodeAt(blob,natural,spot,turn){
const size=decodeSize(natural,spot,turn);
if(!size.resize)return createImageBitmap(blob);
return createImageBitmap(blob,{
resizeWidth:size.width,resizeHeight:size.height,resizeQuality:'high',
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
surveyDecodePixels:frame.surveyDecodePixels,
};
}
export{Cancelled};
