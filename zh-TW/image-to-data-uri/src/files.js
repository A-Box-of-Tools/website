/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function bytes(n){
if(n<1024)return`${n} bytes`;
if(n<1024*1024)return`${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
return`${(n / (1024 * 1024)).toFixed(2)} MB`;
}
export function count(n){
return n.toLocaleString('en-US');
}
export function overhead(fileBytes,uriLength){
if(!fileBytes)return'';
const delta=Math.round(((uriLength-fileBytes)/fileBytes)*100);
if(delta===0)return'the same size as the file';
return delta>0?`${delta}% larger than the file`:`${-delta}% smaller than the file`;
}
export function verdict(uriLength){
if(uriLength<=2*1024){
return{
level:'good',
text:'Small enough that this is a clear win: one fewer request, and nothing much added to the file it lands in.',
};
}
if(uriLength<=10*1024){
return{
level:'good',
text:'A normal size for an inlined icon. Worth it for something that appears on every page.',
};
}
if(uriLength<=50*1024){
return{
level:'fair',
text:'Large for an inline picture. Everything that includes this stylesheet now carries it, and it cannot be cached on its own.',
};
}
return{
level:'poor',
text:'Too big to inline. Served as an ordinary file this would be cached once and fetched in parallel; inlined, it is on the critical path of every page and re-downloaded whenever anything around it changes.',
};
}
export function metadataNote(meta,fileBytes){
const share=fileBytes?Math.round((meta.bytes/fileBytes)*100):0;
const kinds=list(meta.kinds);
const portion=share>=5?`, which is ${share}% of the file`:'';
return`Carries ${bytes(meta.bytes)} of ${kinds}${portion}. It is copied into the URI along with the picture.`;
}
export function list(items){
if(items.length<=1)return items[0]??'';
return`${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
export function dimensions(width,height){
return`${width} × ${height}`;
}
