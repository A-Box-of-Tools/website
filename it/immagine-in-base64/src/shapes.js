/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const SHAPES=[
{id:'uri',ext:'txt'},
{id:'css-rule',ext:'css'},
{id:'css-var',ext:'css'},
{id:'html',ext:'html'},
{id:'markdown',ext:'md'},
];
export const shapeById=(id)=>SHAPES.find((shape)=>shape.id===id)??SHAPES[0];
export function render(id,result){
switch(id){
case'css-rule':
return`.${result.ident} {\n  background-image: url("${result.uri}");\n}`;
case'css-var':
return`--${result.ident}: url("${result.uri}");`;
case'html':
return`<img src="${result.uri}" alt=""${size(result)}>`;
case'markdown':
return`![](${result.uri})`;
default:
return result.uri;
}
}
function size(result){
if(result.svg||!result.width||!result.height)return'';
return` width="${result.width}" height="${result.height}"`;
}
export function bundle(id,results){
const parts=results.map((result)=>render(id,result));
if(id==='css-var'){
return`:root {\n${parts.map((line) => `  ${line}`).join('\n')}\n}`;
}
if(id==='uri'){
return results.map((result,at)=>`${result.name}\n${parts[at]}`).join('\n\n');
}
return parts.join('\n\n');
}
export function bundleName(id){
return`data-uris.${shapeById(id).ext}`;
}
export function fileName(id,result){
return`${result.ident}-data-uri.${shapeById(id).ext}`;
}
export function identifiers(names){
const used=new Map();
return names.map((name)=>{
const base=identifier(name);
const seen=used.get(base)??0;
used.set(base,seen+1);
return seen?`${base}-${seen + 1}`:base;
});
}
function identifier(name){
const stem=name.replace(/\.[^.]+$/,'')||name;
const cleaned=stem
.toLowerCase()
.replace(/[^a-z0-9]+/g,'-')
.replace(/^-+|-+$/g,'');
if(!cleaned)return'image';
return/^[0-9]/.test(cleaned)?`img-${cleaned}`:cleaned;
}
