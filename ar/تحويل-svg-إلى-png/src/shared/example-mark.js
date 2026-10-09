/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function drawMark(ctx,size,{plate=true}={}){
const u=size/100;
if(plate){
ctx.fillStyle='#12354f';
ctx.beginPath();
ctx.roundRect(0,0,size,size,22*u);
ctx.fill();
}
ctx.fillStyle='#f2b134';
ctx.beginPath();
ctx.arc(66*u,34*u,13*u,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='#2f9e78';
ctx.beginPath();
ctx.moveTo(14*u,74*u);
ctx.lineTo(38*u,36*u);
ctx.lineTo(56*u,62*u);
ctx.lineTo(66*u,48*u);
ctx.lineTo(88*u,74*u);
ctx.closePath();
ctx.fill();
ctx.fillStyle='#e8eef2';
ctx.fillRect(14*u,74*u,74*u,6*u);
}
export function markCanvas(size,options){
const canvas=document.createElement('canvas');
canvas.width=size;
canvas.height=size;
drawMark(canvas.getContext('2d'),size,options);
return canvas;
}
export function markSvg(){
return[
'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">',
'  <rect width="100" height="100" rx="22" fill="#12354f"/>',
'  <circle cx="66" cy="34" r="13" fill="#f2b134"/>',
'  <path d="M14 74 L38 36 L56 62 L66 48 L88 74 Z" fill="#2f9e78"/>',
'  <rect x="14" y="74" width="74" height="6" fill="#e8eef2"/>',
'</svg>',
'',
].join('\n');
}
