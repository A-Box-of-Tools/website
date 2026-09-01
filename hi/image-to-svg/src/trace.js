/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{maskFromImage,inkFraction}from'./mask.js';
import{traceContours}from'./contour.js';
import{fitContour,DEFAULTS}from'./fit.js';
export const TRACE_DEFAULTS={
...DEFAULTS,
threshold:'otsu',
invert:false,
minArea:2,
joinDiagonals:false,
precision:2,
scale:1,
fill:'#000',
};
export function traceImage(image,options={}){
const o={...TRACE_DEFAULTS,...options};
return traceMask(maskFromImage(image,o),o);
}
export function traceMask(mask,options={}){
const o={...TRACE_DEFAULTS,...options};
const started=Date.now();
const contours=traceContours(mask,o);
let crackPoints=0;
for(const c of contours)crackPoints+=c.xs.length;
const subpaths=[];
let curves=0,corners=0,flats=0;
for(const contour of contours){
const fitted=fitContour(contour,o);
curves+=fitted.smooth;
corners+=fitted.corners;
flats+=fitted.flat;
subpaths.push(fitted);
}
const d=subpaths.map((s)=>pathData(s,o.precision,o.scale)).join('');
const w=mask.w*o.scale,h=mask.h*o.scale;
const svg=
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${trim(w, 2)} ${trim(h, 2)}" `+
`width="${trim(w, 2)}" height="${trim(h, 2)}">`+
`<path fill="${o.fill}" d="${d}"/></svg>`;
return{
svg,
d,
width:w,
height:h,
stats:{
threshold:mask.threshold,
ink:inkFraction(mask),
contours:contours.length,
crackPoints,
vertices:curves+corners+flats,
curves,
corners,
flats,
bytes:byteLength(svg),
ms:Date.now()-started,
},
};
}
function pathData(sub,precision,scale){
const s=(n)=>trim(n*scale,precision);
const out=[`M${s(sub.start[0])} ${s(sub.start[1])}`];
const cmds=collapseLines(sub.start,sub.cmds);
let last='x';
for(const c of cmds){
if(c.t==='L'){
out.push(`${last === 'L' ? ' ' : 'L'}${s(c.p[0])} ${s(c.p[1])}`);
last='L';
}else{
out.push(`${last === 'C' ? ' ' : 'C'}${s(c.c1[0])} ${s(c.c1[1])} `+
`${s(c.c2[0])} ${s(c.c2[1])} ${s(c.p[0])} ${s(c.p[1])}`);
last='C';
}
}
out.push('z');
return out.join('');
}
function collapseLines(start,cmds){
const out=[];
let from=start;
for(const c of cmds){
const prev=out[out.length-1];
if(c.t==='L'&&prev&&prev.t==='L'){
const a=out.length>1?endOf(out[out.length-2]):from;
const cross=(prev.p[0]-a[0])*(c.p[1]-a[1])-(prev.p[1]-a[1])*(c.p[0]-a[0]);
const span=Math.hypot(c.p[0]-a[0],c.p[1]-a[1]);
if(span>0&&Math.abs(cross)/span<1e-6){out[out.length-1]=c;continue;}
}
out.push(c);
}
return out;
}
const endOf=(cmd)=>cmd.p;
function trim(n,precision){
const r=Number(n.toFixed(precision));
return Object.is(r,-0)?'0':String(r);
}
function byteLength(s){
if(typeof TextEncoder!=='undefined')return new TextEncoder().encode(s).length;
return Buffer.byteLength(s,'utf8');
}
