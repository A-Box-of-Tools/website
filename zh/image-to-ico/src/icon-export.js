/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{writeIco,dibEntry,readIcoDirectory}from'./ico.js?v=098bc9b309';
import{writeIcns,readIcnsElements,ICNS_TYPES,ICNS_SIZES}from'./icns.js?v=098bc9b309';
import{storageFor}from'./sizes.js?v=098bc9b309';
import{decode,release,square,pixels,png}from'./render.js?v=098bc9b309';
import{PACK_IMAGES,manifest,browserConfig,headSnippet,readme}from'./pack.js?v=098bc9b309';
import{iconName}from'./files.js?v=098bc9b309';
export function captureIconRequest(items,settings){
const want=Object.freeze({...settings.want});
const sizes=Object.freeze([...settings.sizes]);
const drawSizes=Object.freeze([...new Set([
...(want.ico?sizes:[]),...(want.icns?ICNS_SIZES:[]),
])].sort((a,b)=>a-b));
return Object.freeze({
batch:Object.freeze(items.map(({id,file,width,height})=>
Object.freeze({id,file,width,height}))),
want,sizes,drawSizes,
preset:settings.preset,storage:settings.storage,
fit:settings.fit,background:settings.background,
website:settings.preset==='website'||want.pack,
});
}
const RENDER_REFUSALS=new Set(['decode.failed','png.refused']);
export function iconErrorDetail(error,t){
return RENDER_REFUSALS.has(error.message)?t(error.message,error.values):error.message;
}
const platform={decode,release,square,pixels,png};
export async function makeIconOutput(item,request,t,rendering=platform){
const decoded=await rendering.decode(item.file);
try{
return await writeOutputs(item,decoded,request,t,rendering);
}finally{
rendering.release(decoded);
}
}
async function writeOutputs(item,decoded,request,t,rendering){
const{square,pixels,png}=rendering;
const{want,sizes,storage,website}=request;
const options={fit:request.fit,background:request.background,vector:decoded.vector};
const drawn=new Map();
const owned=new Set();
try{
for(const px of request.drawSizes){
const canvas=square(decoded.bitmap,decoded.width,decoded.height,px,options);
owned.add(canvas);
drawn.set(px,canvas);
}
const encoded=new Map();
const pngFor=async(px)=>{
if(!encoded.has(px))encoded.set(px,await png(drawn.get(px)));
return encoded.get(px);
};
const outputs=[];
const files=[];
if(want.ico){
const entries=[];
for(const px of sizes){
const kind=storageFor(px,storage);
const data=kind==='png'?await pngFor(px):dibEntry(pixels(drawn.get(px)));
entries.push({width:px,height:px,kind,data});
}
const ico=writeIco(entries);
const name=iconName(item.file.name,'ico',website);
files.push({name,data:ico});
outputs.push({
kind:'ico',
name,
data:ico,
entries:readIcoDirectory(ico).map((entry)=>({
label:`${entry.width}px`,
detail:entry.kind==='png'?'PNG':t('entry.uncompressed'),
bytes:entry.bytes,
})),
});
}
if(want.icns){
const elements=[];
for(const slot of ICNS_TYPES){
elements.push({type:slot.type,data:await pngFor(slot.px)});
}
const icns=writeIcns(elements);
const name=iconName(item.file.name,'icns',website);
files.push({name,data:icns});
outputs.push({
kind:'icns',
name,
data:icns,
entries:readIcnsElements(icns).map((element)=>({
label:`${element.px}px`,
detail:element.type,
bytes:element.bytes,
})),
});
}
for(const canvas of drawn.values()){
canvas.width=0;
canvas.height=0;
}
if(want.pack){
for(const image of PACK_IMAGES){
const canvas=square(decoded.bitmap,decoded.width,decoded.height,image.px,{
fit:options.fit,
vector:options.vector,
background:image.opaque?(options.background??'#ffffff'):options.background,
inset:image.inset??0,
});
owned.add(canvas);
files.push({name:image.name,data:await png(canvas)});
canvas.width=0;
canvas.height=0;
}
const tile=options.background??'#ffffff';
files.push(
{name:'site.webmanifest',data:text(manifest({name:t('manifest.name'),background:tile,theme:tile}))},
{name:'browserconfig.xml',data:text(browserConfig(tile))},
{name:'head.html',data:text(headSnippet(t))},
{name:'README.txt',data:text(readme(iconName(item.file.name,'ico',true),sizes,want.ico,t))},
);
}
return{item,request,outputs,files,packed:want.pack};
}finally{
for(const canvas of owned){
canvas.width=0;
canvas.height=0;
}
}
}
const encoder=new TextEncoder();
const text=(string)=>encoder.encode(string);
