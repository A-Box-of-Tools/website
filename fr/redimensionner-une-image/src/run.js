/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{decode,keepFormat,release,render,JPEG}from'./codecs.js?v=903031737a';
import{isUntouched,plan,wholeOf}from'./geometry.js?v=903031737a';
import{outName}from'./files.js?v=903031737a';
export function prepareRun(items,options,writable){
const settings=Object.freeze({...options,resize:Object.freeze({...options.resize})});
const encoders=new Set(writable);
const batch=items.map((item)=>{
const size=Object.freeze({...item.size});
const laid=plan({...(item.crop??wholeOf(size))},settings.resize);
for(const rect of[laid.source,laid.canvas,laid.draw])Object.freeze(rect);
Object.freeze(laid);
const mime=settings.format==='keep'?keepFormat(item.file.type,encoders):settings.format;
return Object.freeze({
item,size,laid,
untouched:settings.format==='keep'&&isUntouched(size,laid),
encoding:Object.freeze({mime,quality:settings.quality,background:settings.background}),
});
});
return{settings,batch:Object.freeze(batch)};
}
export async function processOne(job,{
decode:read=decode,render:write=render,release:dispose=release,
}={}){
const{item,size,laid,encoding}=job;
const base={item,name:item.file.name,before:item.file.size,size};
if(job.untouched){
return{
...base,
blob:item.file,
after:item.file.size,
mime:item.file.type||JPEG,
crop:laid.source,
canvas:laid.canvas,
scale:1,
padded:false,
untouched:true,
outName:item.file.name,
};
}
const source=await read(item.file);
try{
const blob=await write(source.bitmap,laid,encoding);
return{
...base,
blob,
after:blob.size,
mime:encoding.mime,
quality:encoding.quality,
crop:laid.source,
canvas:laid.canvas,
scale:laid.scale,
padded:laid.padded,
untouched:false,
outName:outName(item.file.name,encoding.mime,laid.canvas.width,laid.canvas.height),
};
}finally{
dispose(source.bitmap);
}
}
