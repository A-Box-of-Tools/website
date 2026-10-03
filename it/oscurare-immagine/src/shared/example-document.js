/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{HEADINGS,ROWS}from'./example-statement.js?v=e473d2dd09';
export function drawPage(ctx,width,height){
const u=width/1000;
ctx.fillStyle='#ffffff';
ctx.fillRect(0,0,width,height);
ctx.fillStyle='#1f3549';
ctx.font=`600 ${Math.round(38 * u)}px system-ui, sans-serif`;
ctx.textBaseline='alphabetic';
ctx.fillText('STATEMENT',70*u,110*u);
ctx.strokeStyle='#1f3549';
ctx.lineWidth=Math.max(1,3*u);
ctx.beginPath();
ctx.moveTo(70*u,132*u);
ctx.lineTo(width-70*u,132*u);
ctx.stroke();
const columns=[70,300,560,800].map((x)=>x*u);
ctx.fillStyle='#6b7681';
ctx.font=`${Math.round(19 * u)}px system-ui, sans-serif`;
HEADINGS.forEach((heading,c)=>ctx.fillText(heading,columns[c],178*u));
ctx.fillStyle='#101418';
ctx.font=`${Math.round(24 * u)}px system-ui, sans-serif`;
ROWS.forEach((row,i)=>{
const y=(226+i*46)*u;
row.forEach((cell,c)=>ctx.fillText(cell,columns[c],y));
ctx.strokeStyle='#e3e7ea';
ctx.lineWidth=1;
ctx.beginPath();
ctx.moveTo(70*u,y+14*u);
ctx.lineTo(width-70*u,y+14*u);
ctx.stroke();
});
}
export function pageCanvas(width=1000,height=1414){
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
drawPage(canvas.getContext('2d'),width,height);
return canvas;
}
export function photographedPage(width=1400,height=1050){
const page=pageCanvas();
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
const ctx=canvas.getContext('2d',{willReadFrequently:true});
const desk=ctx.createLinearGradient(0,0,width,height);
desk.addColorStop(0,'#5b4a3a');
desk.addColorStop(1,'#3a2e24');
ctx.fillStyle=desk;
ctx.fillRect(0,0,width,height);
const corners={
topLeft:[width*0.20,height*0.10],
topRight:[width*0.82,height*0.17],
bottomRight:[width*0.75,height*0.93],
bottomLeft:[width*0.11,height*0.83],
};
const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
ctx.save();
ctx.shadowColor='rgba(0,0,0,0.45)';
ctx.shadowBlur=24;
ctx.shadowOffsetY=10;
const strips=page.height;
for(let i=0;i<strips;i+=1){
const t=i/(strips-1);
const left=lerp(corners.topLeft,corners.bottomLeft,t);
const right=lerp(corners.topRight,corners.bottomRight,t);
const w=right[0]-left[0];
const h=Math.ceil((height/strips)*2.2);
ctx.save();
ctx.translate(left[0],left[1]);
ctx.rotate(Math.atan2(right[1]-left[1],right[0]-left[0]));
ctx.drawImage(page,0,i,page.width,1,0,0,Math.hypot(w,right[1]-left[1]),h);
ctx.restore();
if(i===0)ctx.shadowColor='transparent';
}
ctx.restore();
const lamp=ctx.createRadialGradient(
width*0.3,height*0.2,0,width*0.3,height*0.2,Math.max(width,height),
);
lamp.addColorStop(0,'rgba(255,246,225,0.30)');
lamp.addColorStop(1,'rgba(0,0,0,0.22)');
ctx.fillStyle=lamp;
ctx.fillRect(0,0,width,height);
return{canvas,corners};
}
