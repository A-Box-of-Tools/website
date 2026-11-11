/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const EXAMPLE={
name:'sample.name',
category:'sample.category',
price:'$$',
rating:'4.7',
reviews:'318',
address:'sample.address',
serviceArea:false,
phone:'sample.phone',
website:'sample.website',
description:'sample.description',
attributes:'sample.attributes',
status:'auto',
hours:[
{closed:false,open:'08:00',close:'13:00'},
{closed:true,open:'07:00',close:'15:00'},
{closed:false,open:'07:00',close:'15:00'},
{closed:false,open:'07:00',close:'15:00'},
{closed:false,open:'07:00',close:'15:00'},
{closed:false,open:'07:00',close:'18:00'},
{closed:false,open:'07:30',close:'16:00'},
],
};
export function coverPhoto(width=1200,height=675){
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
const paint=canvas.getContext('2d');
const wall=paint.createLinearGradient(0,0,width,height);
wall.addColorStop(0,'#f0ddc2');
wall.addColorStop(0.55,'#d8bd97');
wall.addColorStop(1,'#a8865c');
paint.fillStyle=wall;
paint.fillRect(0,0,width,height);
const rows=[
{y:0.26,size:0.052,count:9,tint:'#cda875'},
{y:0.42,size:0.062,count:8,tint:'#bd9260'},
{y:0.59,size:0.074,count:7,tint:'#a97c4c'},
];
for(const row of rows){
const shelfY=height*row.y;
const loafW=width*row.size*0.62;
const loafH=height*row.size*0.52;
paint.fillStyle='rgba(74, 50, 26, 0.30)';
paint.fillRect(width*0.05,shelfY+loafH*1.15,width*0.90,
Math.max(2,height*0.011));
for(let n=0;n<row.count;n+=1){
const x=width*(0.09+(0.82*(n+0.5))/row.count);
paint.fillStyle='rgba(74, 50, 26, 0.22)';
paint.beginPath();
paint.ellipse(x,shelfY+loafH*0.95,loafW*0.9,loafH*0.22,0,0,Math.PI*2);
paint.fill();
paint.fillStyle=row.tint;
paint.beginPath();
paint.ellipse(x,shelfY,loafW,loafH,0,0,Math.PI*2);
paint.fill();
const lit=paint.createLinearGradient(x,shelfY-loafH,x,shelfY);
lit.addColorStop(0,'rgba(255, 236, 200, 0.45)');
lit.addColorStop(1,'rgba(255, 236, 200, 0)');
paint.fillStyle=lit;
paint.beginPath();
paint.ellipse(x,shelfY,loafW,loafH,0,0,Math.PI*2);
paint.fill();
paint.strokeStyle='rgba(92, 58, 24, 0.55)';
paint.lineWidth=Math.max(1.5,width*0.0028);
for(const offset of[-0.34,0.10]){
paint.beginPath();
paint.moveTo(x+loafW*offset-loafW*0.16,shelfY-loafH*0.30);
paint.lineTo(x+loafW*offset+loafW*0.16,shelfY+loafH*0.16);
paint.stroke();
}
}
}
const counter=paint.createLinearGradient(0,height*0.78,0,height);
counter.addColorStop(0,'#7a5533');
counter.addColorStop(1,'#3f2915');
paint.fillStyle=counter;
paint.fillRect(0,height*0.80,width,height*0.20);
const glare=paint.createLinearGradient(0,height*0.80,width*0.55,height);
glare.addColorStop(0,'rgba(255, 244, 222, 0.34)');
glare.addColorStop(1,'rgba(255, 244, 222, 0)');
paint.fillStyle=glare;
paint.fillRect(0,height*0.80,width,height*0.20);
const edge=paint.createRadialGradient(
width/2,height/2,Math.min(width,height)*0.25,
width/2,height/2,Math.max(width,height)*0.72);
edge.addColorStop(0,'rgba(0, 0, 0, 0)');
edge.addColorStop(1,'rgba(40, 24, 8, 0.42)');
paint.fillStyle=edge;
paint.fillRect(0,0,width,height);
return canvas.toDataURL('image/jpeg',0.82);
}
