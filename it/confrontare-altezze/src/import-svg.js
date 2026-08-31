/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const ALLOWED={
svg:['viewBox','transform'],
g:['transform'],
path:['d','transform','fill-rule','clip-rule'],
rect:['x','y','width','height','rx','ry','transform'],
circle:['cx','cy','r','transform'],
ellipse:['cx','cy','rx','ry','transform'],
line:['x1','y1','x2','y2','transform'],
polyline:['points','transform'],
polygon:['points','transform'],
};
const SHAPES=new Set(['path','rect','circle','ellipse','line','polyline','polygon']);
const SAFE={
number:/^-?\d*\.?\d+(?:e[-+]?\d+)?$/i,
length:/^-?\d*\.?\d+(?:e[-+]?\d+)?(?:px)?$/i,
list:/^[\d\s,.eE+-]*$/,
path:/^[\sMmZzLlHhVvCcSsQqTtAa\d.,+-eE]*$/,
transform:/^[\w\s(),.eE+-]*$/,
rule:/^(?:nonzero|evenodd)$/,
viewBox:/^[\d\s,.eE+-]*$/,
};
const CHECK={
d:SAFE.path,
points:SAFE.list,
transform:SAFE.transform,
viewBox:SAFE.viewBox,
'fill-rule':SAFE.rule,
'clip-rule':SAFE.rule,
};
export const LIMITS={
bytes:2*1024*1024,
elements:4000,
path:400000,
};
const num=(attrs,name,fallback=0)=>{
const value=attrs[name];
return value!==undefined&&SAFE.length.test(String(value).trim())
?Number.parseFloat(value):fallback;
};
export function toPath(tag,attrs){
const n=(name,fallback)=>num(attrs,name,fallback);
const points=String(attrs.points??'').trim();
switch(tag){
case'path':
return CHECK.d.test(String(attrs.d??''))?String(attrs.d??''):null;
case'rect':{
const w=n('width');
const h=n('height');
if(w<=0||h<=0)return null;
const x=n('x');
const y=n('y');
const rx=Math.min(n('rx',n('ry')),w/2);
const ry=Math.min(n('ry',n('rx')),h/2);
if(rx>0&&ry>0){
return`M${x + rx} ${y}H${x + w - rx}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}`
+`V${y + h - ry}A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}`
+`H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}`
+`V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`;
}
return`M${x} ${y}h${w}v${h}h${-w}Z`;
}
case'circle':{
const r=n('r');
if(r<=0)return null;
const cx=n('cx');
const cy=n('cy');
return`M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
}
case'ellipse':{
const rx=n('rx');
const ry=n('ry');
if(rx<=0||ry<=0)return null;
const cx=n('cx');
const cy=n('cy');
return`M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`;
}
case'line':
return`M${n('x1')} ${n('y1')}L${n('x2')} ${n('y2')}Z`;
case'polyline':
case'polygon':
return SAFE.list.test(points)&&points?`M${points}Z`:null;
default:
return null;
}
}
const escape=(text)=>String(text)
.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
.replace(/"/g,'&quot;');
function rebuild(node,count){
if(!node||typeof node.tag!=='string')return null;
const tag=node.tag.toLowerCase().replace(/^.*:/,'');
const allowed=ALLOWED[tag];
if(!allowed)return null;
if(count.n>=LIMITS.elements)return null;
count.n+=1;
const attrs={};
for(const name of allowed){
const raw=node.attrs?.[name];
if(raw===undefined||raw===null)continue;
const value=String(raw).trim();
if(!value)continue;
const check=CHECK[name]??SAFE.length;
if(!check.test(value))continue;
attrs[name]=value;
}
const children=[];
for(const child of node.children??[]){
const kept=rebuild(child,count);
if(kept)children.push(kept);
}
if(SHAPES.has(tag)){
const d=toPath(tag,attrs);
if(!d)return null;
const kept={tag:'path',attrs:{d}};
if(attrs.transform)kept.attrs.transform=attrs.transform;
if(attrs['fill-rule'])kept.attrs['fill-rule']=attrs['fill-rule'];
if(attrs['clip-rule'])kept.attrs['clip-rule']=attrs['clip-rule'];
return kept;
}
if(!children.length)return null;
const wrapper={tag:tag==='svg'?'g':'g',attrs:{},children};
if(attrs.transform)wrapper.attrs.transform=attrs.transform;
return wrapper;
}
export function serialise(node){
if(!node)return'';
const attrs=Object.entries(node.attrs??{})
.map(([name,value])=>` ${name}="${escape(value)}"`).join('');
if(node.tag==='path')return`<path${attrs}/>`;
return`<g${attrs}>${(node.children ?? []).map(serialise).join('')}</g>`;
}
export function importSvg(root){
const count={n:0};
const kept=rebuild(root,count);
if(!kept)return{error:'svg.noshapes'};
const markup=serialise(kept);
if(markup.length>LIMITS.path)return{error:'svg.toobig'};
const shapes=(markup.match(/<path/g)??[]).length;
if(!shapes)return{error:'svg.noshapes'};
return{markup,shapes};
}
