/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const SVG_NS='http://www.w3.org/2000/svg';
function escape(text){
return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
.replace(/"/g,'&quot;');
}
function runsToPath(isDark,width,height,scale,offsetX=0,offsetY=0){
const parts=[];
for(let y=0;y<height;y+=1){
let x=0;
while(x<width){
if(!isDark(x,y)){
x+=1;
continue;
}
let run=1;
while(x+run<width&&isDark(x+run,y))run+=1;
parts.push(`M${(offsetX + x) * scale} ${(offsetY + y) * scale}`
+`h${run * scale}v${scale}h-${run * scale}z`);
x+=run;
}
}
return parts.join('');
}
function open(width,height,background){
const fill=background==='none'
?''
:`<rect width="${width}" height="${height}" fill="${escape(background)}"/>`;
return`<svg xmlns="${SVG_NS}" width="${width}" height="${height}" `
+`viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${fill}`;
}
export function qrSvg(qr,style){
const across=qr.size+style.quiet*2;
const pixels=across*style.scale;
const dark=(x,y)=>qr.modules[y*qr.size+x]===1;
const path=runsToPath(dark,qr.size,qr.size,style.scale,style.quiet,style.quiet);
return`${open(pixels, pixels, style.background)}`
+`<path fill="${escape(style.foreground)}" d="${path}"/></svg>`;
}
export function barcodeSvg(code,style){
const width=code.modules.length*style.scale;
const fontSize=style.text?Math.max(8,style.scale*7):0;
const textGap=style.text?Math.round(fontSize*0.25):0;
const height=style.height+(style.text?fontSize+textGap:0);
const guardExtra=style.text?fontSize*0.6:0;
const parts=[open(width,height,style.background)];
const fill=escape(style.foreground);
let x=0;
while(x<code.modules.length){
if(code.modules[x]===0){
x+=1;
continue;
}
const guard=code.guards[x]===1;
let run=1;
while(x+run<code.modules.length&&code.modules[x+run]===1
&&(code.guards[x+run]===1)===guard)run+=1;
const barHeight=Math.round(style.height+(guard?guardExtra:0));
parts.push(`<rect x="${x * style.scale}" y="0" width="${run * style.scale}" `
+`height="${barHeight}" fill="${fill}"/>`);
x+=run;
}
if(style.text){
const baseline=height-Math.round(fontSize*0.15);
for(const label of code.labels){
const middle=((label.from+label.to)/2)*style.scale;
parts.push(`<text x="${middle}" y="${baseline}" fill="${fill}" `
+`font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" `
+`font-size="${fontSize}" text-anchor="middle">${escape(label.text)}</text>`);
}
}
parts.push('</svg>');
return parts.join('');
}
export function sizeOfSvg(svg){
const width=Number(/width="(\d+(?:\.\d+)?)"/.exec(svg)?.[1]??0);
const height=Number(/height="(\d+(?:\.\d+)?)"/.exec(svg)?.[1]??0);
return{width,height};
}
export async function svgToPng(svg,multiple=1){
const{width,height}=sizeOfSvg(svg);
const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
try{
const image=new Image();
image.width=width;
image.height=height;
await new Promise((resolve,reject)=>{
image.onload=resolve;
image.onerror=()=>reject(new Error('render.nosvg'));
image.src=url;
});
const canvas=document.createElement('canvas');
canvas.width=Math.round(width*multiple);
canvas.height=Math.round(height*multiple);
const context=canvas.getContext('2d');
context.imageSmoothingEnabled=false;
context.drawImage(image,0,0,canvas.width,canvas.height);
return await new Promise((resolve,reject)=>{
canvas.toBlob((blob)=>{
if(blob)resolve(blob);
else reject(new Error('render.nopng'));
},'image/png');
});
}finally{
URL.revokeObjectURL(url);
}
}
