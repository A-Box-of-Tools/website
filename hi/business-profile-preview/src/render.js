/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const FONT="Roboto, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
export const INK={
text:'#202124',
dim:'#70757a',
link:'#1a73e8',
open:'#188038',
closed:'#d93025',
star:'#fbbc04',
starOff:'#dadce0',
rule:'#dadce0',
card:'#ffffff',
tile:'#f1f3f4',
chip:'#f1f3f4',
page:'#ffffff',
};
export function esc(text){
return String(text??'')
.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
.replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
export const round=(n)=>Math.round(n*100)/100;
export function text(value,x,y,{
size=14,weight=400,fill=INK.text,anchor='start',extra='',
}={}){
const anchored=anchor==='start'?'':` text-anchor="${anchor}"`;
return`<text x="${round(x)}" y="${round(y)}" font-family="${FONT}" `
+`font-size="${size}" font-weight="${weight}" fill="${fill}"${anchored}${extra}>`
+`${esc(value)}</text>`;
}
export function wrap(value,width,{size=14,weight=400,lines=2},measure){
const rest=String(value??'').trim().split(/\s+/).filter(Boolean);
if(!rest.length)return[];
const fits=(line)=>measure(line,size,weight)<=width;
const out=[];
let line='';
while(rest.length&&out.length<lines){
const word=rest[0];
const joined=line?`${line} ${word}`:word;
if(fits(joined)){line=joined;rest.shift();continue;}
if(!line){
const head=longestFitting(word,width,{size,weight},measure);
if(!head)break;
line=head;
rest[0]=word.slice(head.length);
}
out.push(line);
line='';
}
if(line&&out.length<lines)out.push(line);
if(rest.length)out.push(ellipsis(out.pop()??'',width,{size,weight},measure));
return out;
}
export function ellipsis(line,width,{size=14,weight=400}={},measure){
let kept=String(line);
while(kept&&measure(`${kept}…`,size,weight)>width){
kept=kept.slice(0,-1).replace(/\s+$/,'');
}
return`${kept}…`;
}
function longestFitting(word,width,{size,weight},measure){
let keep=word.length;
while(keep>0&&measure(word.slice(0,keep),size,weight)>width)keep-=1;
return word.slice(0,keep);
}
export function box(x,y,width,height,{
radius=0,fill=INK.card,stroke='',strokeWidth=1,
}={}){
const line=stroke?` stroke="${stroke}" stroke-width="${strokeWidth}"`:'';
return`<rect x="${round(x)}" y="${round(y)}" width="${round(width)}" `
+`height="${round(height)}" rx="${radius}" fill="${fill}"${line}/>`;
}
const STAR='M12 2.7 15 8.8l6.7 1-4.85 4.7 1.15 6.7L12 18.05 '
+'5.99 21.2l1.15-6.7L2.29 9.8l6.7-1z';
export function stars(x,y,size,rating,id){
const gap=size*0.12;
const step=size+gap;
const one=(fill)=>Array.from({length:5},(unused,n)=>(
`<g transform="translate(${round(x + n * step)} ${round(y)}) `
+`scale(${round(size / 24)})"><path d="${STAR}" fill="${fill}"/></g>`
)).join('');
const width=5*step-gap;
const filled=Math.max(0,Math.min(5,Number(rating)||0))/5*width;
return`${one(INK.starOff)}<clipPath id="${id}">`
+`<rect x="${round(x)}" y="${round(y)}" width="${round(filled)}" height="${size}"/>`
+`</clipPath><g clip-path="url(#${id})">${one(INK.star)}</g>`;
}
export function starsWidth(size){
return 5*(size+size*0.12)-size*0.12;
}
const MARKS={
pin:'<path d="M12 21.6c4.4-5 6.8-8.4 6.8-11.5a6.8 6.8 0 1 0-13.6 0c0 3.1 2.4 6.5 6.8 11.5z"/>'
+'<circle cx="12" cy="10.1" r="2.5"/>',
clock:'<circle cx="12" cy="12" r="8.6"/><path d="M12 6.9V12l3.6 2.1"/>',
phone:'<path d="M6.6 4.2 4.4 6.4a2 2 0 0 0-.4 2.2 20 20 0 0 0 11.4 11.4 2 2 0 0 0 2.2-.4l2.2-2.2-4-2.6-1.8 1.4a15 15 0 0 1-6.2-6.2l1.4-1.8z"/>',
globe:'<circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2"/>'
+'<path d="M12 3.4a13.4 13.4 0 0 1 0 17.2 13.4 13.4 0 0 1 0-17.2z"/>',
route:'<path d="M12.9 2.7a1.3 1.3 0 0 0-1.8 0L2.7 11.1a1.3 1.3 0 0 0 0 1.8l8.4 8.4a1.3 1.3 0 0 0 1.8 0l8.4-8.4a1.3 1.3 0 0 0 0-1.8z"/>'
+'<path d="M9.4 14.8v-2.6a1.6 1.6 0 0 1 1.6-1.6h3.6"/><path d="m12.6 7.9 2.8 2.7-2.8 2.7"/>',
save:'<path d="M7 3.6h10a1 1 0 0 1 1 1v15.8l-6-3.8-6 3.8V4.6a1 1 0 0 1 1-1z"/>',
share:'<circle cx="17.4" cy="5.6" r="2.4"/><circle cx="6.6" cy="12" r="2.4"/>'
+'<circle cx="17.4" cy="18.4" r="2.4"/><path d="m8.7 10.8 6.5-4M8.7 13.2l6.5 4"/>',
shop:'<path d="M4.4 10v9.6h15.2V10"/><path d="M2.8 10 5 4.4h14L21.2 10z"/>'
+'<path d="M9.6 19.6v-5.2h4.8v5.2"/>',
photo:'<rect x="3.4" y="5" width="17.2" height="14" rx="2.2"/><circle cx="9" cy="10.4" r="1.8"/>'
+'<path d="m4.6 17.6 4.8-4.4 3 2.6 3.2-3.1 3.4 3.3"/>',
tag:'<path d="M11 3.4H4.6A1.2 1.2 0 0 0 3.4 4.6V11a2 2 0 0 0 .6 1.4l7.4 7.4a1.6 1.6 0 0 0 2.3 0l6.1-6.1a1.6 1.6 0 0 0 0-2.3L12.4 4a2 2 0 0 0-1.4-.6z"/>'
+'<circle cx="7.6" cy="7.6" r="1.1"/>',
};
export function icon(name,x,y,size,colour=INK.dim,weight=1.7){
const scale=size/24;
return`<g transform="translate(${round(x)} ${round(y)}) scale(${round(scale)})" `
+`fill="none" stroke="${colour}" stroke-width="${round(weight / scale)}" `
+`stroke-linecap="round" stroke-linejoin="round">${MARKS[name] ?? ''}</g>`;
}
export function picture(href,x,y,width,height,radius,id){
const clip=`<clipPath id="${id}"><rect x="${round(x)}" y="${round(y)}" `
+`width="${round(width)}" height="${round(height)}" rx="${radius}"/></clipPath>`;
return`${clip}<image href="${esc(href)}" x="${round(x)}" y="${round(y)}" `
+`width="${round(width)}" height="${round(height)}" `
+`preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`;
}
export function emptyTile(x,y,width,height,radius,mark='photo'){
const size=Math.min(46,Math.max(22,Math.min(width,height)*0.28));
return box(x,y,width,height,{radius,fill:INK.tile})
+icon(mark,x+(width-size)/2,y+(height-size)/2,size,'#bdc1c6',1.6);
}
export function document_(width,height,body,background=INK.page){
return`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" `
+`viewBox="0 0 ${width} ${height}" role="img">`
+box(0,0,width,height,{fill:background})
+`${body}</svg>`;
}
