/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{throwIfAborted}from'./shared/errors.js?v=528f8580f1';
import{LIMITS,importSvg}from'./import-svg.js?v=528f8580f1';
import{IMAGE_LIMITS,fit,imageMarkup,nameFromFile}from'./import-image.js?v=528f8580f1';
function plain(element,depth=0){
if(depth>40)return null;
const attrs={};
for(const attribute of element.attributes??[])attrs[attribute.name.toLowerCase()]=attribute.value;
return{tag:element.tagName,attrs,
children:[...element.children].map(child=>plain(child,depth+1)).filter(Boolean)};
}
async function vectorPicture(file,signal){
if(file.size>LIMITS.bytes)return{error:'svg.toobig'};
const text=await file.text();
throwIfAborted(signal);
const doc=new DOMParser().parseFromString(text,'image/svg+xml');
if(doc.querySelector('parsererror')||!doc.documentElement)return{error:'svg.unreadable'};
const result=importSvg(plain(doc.documentElement));
if(result.error)return result;
const stage=document.createElementNS('http://www.w3.org/2000/svg','svg');
stage.setAttribute('aria-hidden','true');
stage.style.cssText='position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden';
let group;
try{
document.body.append(stage);
group=document.createElementNS('http://www.w3.org/2000/svg','g');
group.innerHTML=result.markup;
stage.append(group);
const box=group.getBBox();
if(!(box.width>0)||!(box.height>0))return{error:'svg.noshapes'};
return{shape:{
id:'upload',label:'shape.upload',width:box.width/box.height,
inner:`scale(${1 / box.height}) translate(${-(box.x + box.width / 2)} ${-box.y})`,
paths:null,markup:result.markup,defaultCm:0,
},shapes:result.shapes,name:file.name.replace(/\.svg$/i,'').slice(0,40)};
}finally{group?.remove();stage.remove();}
}
async function rasterPicture(file,signal){
if(file.size>IMAGE_LIMITS.bytes)return{error:'image.toobig'};
let bitmap,canvas;
try{
try{bitmap=await createImageBitmap(file);}
catch{throwIfAborted(signal);return{error:'image.unreadable'};}
throwIfAborted(signal);
const box=fit(bitmap.width,bitmap.height);
if(!box||bitmap.width<IMAGE_LIMITS.smallest||bitmap.height<IMAGE_LIMITS.smallest){
return{error:'image.unreadable'};
}
canvas=document.createElement('canvas');
canvas.width=box.width;canvas.height=box.height;
const context=canvas.getContext('2d');
context.imageSmoothingQuality='high';
context.drawImage(bitmap,0,0,box.width,box.height);
const aspect=box.width/box.height;
const markup=imageMarkup(canvas.toDataURL('image/png'),aspect);
if(!markup)return{error:'image.unreadable'};
return{shape:{
id:'upload',label:'shape.upload',width:aspect,
inner:null,paths:null,markup,raster:true,defaultCm:0,
},name:nameFromFile(file.name)};
}finally{
bitmap?.close?.();
if(canvas)canvas.width=canvas.height=0;
}
}
export function readChartPicture(file,signal){
throwIfAborted(signal);
return file.type==='image/svg+xml'||/\.svg$/i.test(file.name)
?vectorPicture(file,signal):rasterPicture(file,signal);
}
