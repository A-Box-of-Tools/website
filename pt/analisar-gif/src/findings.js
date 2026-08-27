/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{isFullCanvas,duration}from'./frames.js';
const LEVELS={bad:0,warn:1,note:2};
export function findings(gif,stats={}){
const out=[];
const add=(level,title,body,values={})=>out.push({level,title,body,values});
const frames=gif.frames;
const count=(n,key)=>`${key}.${n === 1 ? 'one' : 'many'}`;
if(frames.length===0){
add('bad','find.noframes.title','find.noframes.body');
}
for(const problem of gif.problems){
add('bad','find.unclean.title',problem.key,problem.values);
}
if(gif.trailingBytes>0){
add('warn','find.trailing.title','find.trailing.body',
{bytes:bytes(gif.trailingBytes)});
}
if(frames.length>1){
const{nominal,real,clamped}=duration(frames);
if(clamped>0){
add('warn',count(clamped,'find.clamped.title'),'find.clamped.body',{
count:clamped.toLocaleString(),
nominal:seconds(nominal),
real:seconds(real),
factor:(real/Math.max(nominal,1)).toFixed(1),
});
}
const zero=frames.filter((frame)=>frame.delay===0).length;
if(zero>0&&zero===frames.length){
add('warn','find.zerodelay.title','find.zerodelay.body');
}
const delays=new Set(frames.map((frame)=>frame.delay));
if(delays.size>1){
const sorted=[...frames].sort((a,b)=>a.delay-b.delay);
add('note','find.uneven.title','find.uneven.body',{
delays:delays.size.toLocaleString(),
shortest:seconds(sorted[0].delay),
longest:seconds(sorted[sorted.length-1].delay),
});
}
}
if(frames.length>1){
if(gif.loop===null){
add('warn','find.noloop.title','find.noloop.body');
}else if(gif.loop>0){
add('note',count(gif.loop,'find.loopcount.title'),'find.loopcount.body',
{count:gif.loop.toLocaleString()});
}
}
if(frames.length>1){
const full=frames.filter((frame)=>isFullCanvas(gif,frame)).length;
if(full===frames.length){
add('warn','find.allfull.title','find.allfull.body',
{width:gif.width,height:gif.height});
}else if(full>0){
add('note',count(full,'find.somefull.title'),'find.somefull.body',
{count:full.toLocaleString(),total:frames.length.toLocaleString()});
}else{
add('note','find.nonefull.title','find.nonefull.body');
}
const outside=frames.filter((frame)=>(
frame.left+frame.width>gif.width||frame.top+frame.height>gif.height
));
if(outside.length>0){
add('bad',count(outside.length,'find.outside.title'),
count(outside.length,'find.outside.body'),
{count:outside.length.toLocaleString(),width:gif.width,height:gif.height});
}
}
const locals=frames.filter((frame)=>frame.palette);
if(locals.length>0){
const cost=locals.reduce((sum,frame)=>sum+frame.palette.bytes,0);
const level=cost>gif.size*0.1?'warn':'note';
add(level,count(locals.length,'find.localpal.title'),'find.localpal.body',{
count:locals.length.toLocaleString(),
bytes:bytes(cost),
share:share(cost,gif.size),
});
}
if(!gif.globalPalette&&frames.length>0){
add('note','find.noglobal.title','find.noglobal.body');
}
if(stats.waste&&stats.waste.wastedEntries>0){
const{wastedEntries,wastedBytes,declared,referenced}=stats.waste;
const level=wastedBytes>gif.size*0.05?'warn':'note';
add(level,'find.waste.title','find.waste.body',{
entries:wastedEntries.toLocaleString(),
bytes:bytes(wastedBytes),
declared:declared.toLocaleString(),
referenced:referenced.toLocaleString(),
});
}
if(stats.colors!==undefined&&frames.length>0){
add('note',count(stats.colors,'find.colors.title'),
stats.colors<=64?'find.colors.body.flat':'find.colors.body.photo',
{count:stats.colors.toLocaleString()});
}
for(const extension of gif.extensions){
if(extension.kind==='comment'){
add('note','find.comment.title','find.comment.body',
{bytes:bytes(extension.dataBytes)});
}else if(extension.name.startsWith('XMP')){
const level=extension.bytes>gif.size*0.05?'warn':'note';
add(level,'find.xmp.title','find.xmp.body',
{bytes:bytes(extension.bytes),share:share(extension.bytes,gif.size)});
}else if(extension.name.startsWith('ICCRGBG1')){
add('note','find.icc.title','find.icc.body',{bytes:bytes(extension.bytes)});
}else if(extension.kind==='plain-text'){
add('note','find.plaintext.title','find.plaintext.body');
}else if(extension.kind==='application'&&extension.loop===undefined){
add('note','find.appblock.title','find.appblock.body',
{name:escape(extension.name),bytes:bytes(extension.bytes)});
}
}
const interlaced=frames.filter((frame)=>frame.interlaced).length;
if(interlaced>0){
add('note',count(interlaced,'find.interlaced.title'),'find.interlaced.body',
{count:interlaced.toLocaleString()});
}
if(gif.version!=='89a'){
add('note','find.version.title','find.version.body',{version:gif.version});
}
if(gif.globalPalette&&gif.backgroundIndex>=gif.globalPalette.count){
add('warn','find.bgindex.title','find.bgindex.body',{
index:gif.backgroundIndex.toLocaleString(),
entries:gif.globalPalette.count.toLocaleString(),
});
}
if(gif.aspect!==null){
add('note','find.aspect.title','find.aspect.body',{ratio:gif.aspect.toFixed(2)});
}
const clears=stats.decoded
?stats.decoded.reduce((sum,frame)=>sum+(frame?frame.clears:0),0)
:0;
if(clears>frames.length){
add('note','find.clears.title','find.clears.body',{count:clears.toLocaleString()});
}
if(stats.identical>0){
add('warn',count(stats.identical,'find.identical.title'),'find.identical.body',
{count:stats.identical.toLocaleString()});
}
if(stats.decoded){
const broken=stats.decoded.filter((frame)=>frame&&(frame.corrupt||frame.truncated));
if(broken.length>0){
const first=broken[0].corrupt;
add('bad',count(broken.length,'find.broken.title'),
first?first.key:'find.broken.body.short',
{count:broken.length.toLocaleString(),...(first?first.values:{})});
}
}
out.sort((a,b)=>LEVELS[a.level]-LEVELS[b.level]);
return out;
}
const bytes=(n)=>(
n<1024?`${n} B`:n<1024*1024
?`${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`
:`${(n / 1048576).toFixed(1)} MB`
);
const share=(part,whole)=>(whole>0?`${Math.round((part / whole) * 100)}%`:'0%');
const seconds=(centiseconds)=>{
const value=centiseconds/100;
return value>=10?`${value.toFixed(1)}s`:`${value.toFixed(2)}s`;
};
const escape=(value)=>value.replace(/[&<>"']/g,(character)=>({
'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',
}[character]));
