/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{backdrop,chip,clamp,dotLayer,gauss,hash,lerp,nightSky,paintGalaxy,plotDots,scatter,smooth,spiralDots,write}from'./paint.js?v=583bb01e63';
const SKY=9100;
const OMEGA=1e7;
const MILKY_WAY=1e11;
const UNIVERSE=1e23;
const SPIRAL_DOTS=16000;
const BALL_DOTS=9000;
const WEB_DOTS=16000;
export function starLevel(stars){
if(stars<=SKY)return{id:'sky',perDot:1};
if(stars<=OMEGA)return{id:'ball',perDot:OMEGA/BALL_DOTS};
if(stars<=MILKY_WAY)return{id:'spiral',perDot:MILKY_WAY/SPIRAL_DOTS};
if(stars<=1e15)return{id:'galaxies',perDot:MILKY_WAY};
if(stars<=UNIVERSE)return{id:'web',perDot:UNIVERSE/WEB_DOTS};
return{id:'multi',perDot:UNIVERSE*circleGroup(stars/UNIVERSE)};
}
export function circleGroup(universes){
return universes<=100?1:10**Math.ceil(Math.log10(universes/100));
}
const ORDER=['sky','ball','spiral','galaxies','web','multi'];
function ballDots(){
const dots=[];
for(let i=0;i<BALL_DOTS;i++){
const radius=Math.pow(hash(i,81),2.1);
const angle=hash(i,82)*Math.PI*2;
dots.push({x:radius*Math.cos(angle),y:radius*Math.sin(angle),radius:Math.min(1,radius*(0.75+hash(i,102)*0.5)),size:0.8+hash(i,83)*hash(i,84)*2,warm:hash(i,85)<0.5});
}
return dots.sort((a,b)=>a.radius-b.radius);
}
function webDots(){
const nodes=[];
for(let i=0;i<150;i++){
const radius=Math.sqrt(hash(i,103));
const angle=hash(i,104)*Math.PI*2;
nodes.push([radius*Math.cos(angle),radius*Math.sin(angle)]);
}
const dots=[];
for(let i=0;dots.length<WEB_DOTS&&i<WEB_DOTS*2;i++){
const start=nodes[Math.floor(hash(i,86)*nodes.length)];
let x;
let y;
if(hash(i,87)<0.3){
x=start[0]+gauss(i,88)*0.024;
y=start[1]+gauss(i,89)*0.024;
}else{
const near=nodes.map(node=>[(node[0]-start[0])**2+(node[1]-start[1])**2,node]).sort((a,b)=>a[0]-b[0]);
const end=near[1+Math.floor(hash(i,90)*2.4)][1];
const along=hash(i,91);
x=lerp(start[0],end[0],along)+gauss(i,92)*0.011;
y=lerp(start[1],end[1],along)+gauss(i,93)*0.011;
}
const radius=Math.hypot(x,y);
if(radius<=1)dots.push({x,y,radius,size:0.8+hash(i,94)*1.1,warm:hash(i,95)<0.3});
}
return dots.sort((a,b)=>a.radius-b.radius);
}
function lightColour(dot){return dot.warm?'rgba(255,226,180,.72)':'rgba(186,212,255,.72)';}
function ghostColour(){return'rgba(132,160,214,.26)';}
function createLitShape(make){
let dots=null;
let ghost=null;
let lit=null;
let drawn=0;
return{
ready(){
if(dots)return;
dots=make();
ghost=dotLayer();
lit=dotLayer();
plotDots(ghost,dots,0,dots.length,ghostColour);
},
count(){
this.ready();
return dots.length;
},
radiusAt(i){
this.ready();
return dots[clamp(i,0,dots.length-1)].radius;
},
upTo(radius){
this.ready();
let low=0;
let high=dots.length;
while(low<high){
const middle=(low+high)>>1;
if(dots[middle].radius<=radius)low=middle+1;else high=middle;
}
return low;
},
light(count){
this.ready();
const wanted=clamp(Math.floor(count),0,dots.length);
if(wanted<drawn){
lit.getContext('2d').clearRect(0,0,lit.width,lit.height);
drawn=0;
}
if(wanted>drawn){
plotDots(lit,dots,drawn,wanted,lightColour);
drawn=wanted;
}
return lit;
},
get ghost(){this.ready();return ghost;}
};
}
export function createStarsScene(){
const ball=createLitShape(ballDots);
const spiral=createLitShape(()=>spiralDots(SPIRAL_DOTS));
const web=createLitShape(webDots);
let current=null;
let shift=null;
function placed(ctx,image,cx,cy,radius,{turn=0,tilt=1,add=false}={}){
ctx.save();
if(add)ctx.globalCompositeOperation='lighter';
ctx.translate(cx,cy);
ctx.scale(1,tilt);
if(turn)ctx.rotate(turn);
ctx.drawImage(image,-radius,-radius,radius*2,radius*2);
ctx.restore();
}
function drawSky(ctx,f){
const{w,h,amount,t,motion,still}=f;
const count=Math.min(Math.ceil(amount-1e-9),SKY);
const horizon=h*0.88;
const big=1+7/Math.sqrt(count+0.6);
ctx.save();
for(let i=0;i<count;i++){
const[px,py]=i===0?[0.5,0.42]:scatter(i);
const x=px*w;
const y=py*horizon*0.98;
const magnitude=0.5+2.4/(1+i*0.012);
const radius=magnitude*big*0.5;
const twinkle=motion&&!still&&i<500?0.72+0.28*Math.sin(t*(1+hash(i,96)*2.4)+i):1;
const warm=hash(i,97);
ctx.fillStyle=warm<0.2?`rgba(255,216,170,${twinkle})`:warm<0.45?`rgba(190,214,255,${twinkle})`:`rgba(246,248,255,${twinkle})`;
if(radius<1){
ctx.fillRect(x,y,radius*2,radius*2);
}else{
ctx.beginPath();
ctx.arc(x,y,radius,0,Math.PI*2);
ctx.fill();
if(radius>1.7){
ctx.fillRect(x-radius*3,y-0.4,radius*6,0.8);
ctx.fillRect(x-0.4,y-radius*3,0.8,radius*6);
const glow=ctx.createRadialGradient(x,y,0,x,y,radius*4.5);
glow.addColorStop(0,`rgba(210,226,255,${0.42 * twinkle})`);
glow.addColorStop(1,'rgba(210,226,255,0)');
ctx.fillStyle=glow;
ctx.beginPath();
ctx.arc(x,y,radius*4.5,0,Math.PI*2);
ctx.fill();
}
}
}
ctx.restore();
ctx.fillStyle='#060a14';
ctx.beginPath();
ctx.moveTo(0,h);
ctx.lineTo(0,horizon);
for(let x=0;x<=w+24;x+=24)ctx.lineTo(x,horizon-6-11*hash(Math.round(x/24),98)-4*Math.sin(x*0.012));
ctx.lineTo(w,h);
ctx.closePath();
ctx.fill();
}
function drawLit(ctx,f,shape,reference,{turning=false,tilt=1,glow=0.9}={}){
const{w,h,amount,t,motion}=f;
const share=clamp(amount/reference);
const radius=Math.min(w,h)*(tilt<1?0.7:0.45);
const cx=w/2;
const cy=h*0.54;
const turn=turning?(motion?t*0.02:0.5):0;
placed(ctx,shape.ghost,cx,cy,radius,{turn,tilt});
const lit=shape.light(share*shape.count());
placed(ctx,lit,cx,cy,radius,{turn,tilt,add:true});
const reach=shape.radiusAt(Math.floor(share*shape.count()))*radius;
const core=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(10,reach*0.8));
core.addColorStop(0,`rgba(255,226,186,${glow * Math.min(0.55, 0.14 + share)})`);
core.addColorStop(1,'rgba(255,236,204,0)');
ctx.save();
ctx.translate(0,cy);
ctx.scale(1,tilt);
ctx.translate(0,-cy);
ctx.globalCompositeOperation='lighter';
ctx.fillStyle=core;
ctx.beginPath();
ctx.arc(cx,cy,Math.max(10,reach*0.8),0,Math.PI*2);
ctx.fill();
ctx.restore();
return{cx,cy,radius};
}
function drawGalaxies(ctx,f){
const{w,h,amount,t,motion}=f;
const galaxies=amount/MILKY_WAY;
const whole=Math.min(Math.ceil(galaxies),12000);
const size=Math.max(0.9,Math.min(w,h)*0.46/Math.pow(galaxies,0.56));
const marginX=Math.min(size+6,w*0.3);
const marginY=Math.min(size*0.7+6,h*0.3);
for(let i=0;i<whole;i++){
let x=w/2;
let y=h*0.54;
if(i>0){
const[a,b]=scatter(i);
x=marginX+a*(w-marginX*2);
y=marginY+b*(h-marginY*2);
}
const alpha=i===whole-1?clamp(galaxies-i+0.2):1;
if(size<3){
ctx.fillStyle=hash(i,99)<0.3?`rgba(255,226,186,${alpha})`:`rgba(190,214,255,${alpha})`;
ctx.fillRect(x,y,Math.max(1,size),Math.max(1,size));
}else{
paintGalaxy(ctx,x,y,size,{turn:hash(i,100)*6+(motion?t*0.02:0),tilt:i===0?0.62:0.4+hash(i,101)*0.5,alpha});
}
}
}
function drawWeb(ctx,f,words){
const{w,h,amount,t,motion}=f;
const share=clamp(amount/UNIVERSE);
const radius=Math.min(w,h)*0.44;
const cx=w/2;
const cy=h*0.54;
placed(ctx,web.ghost,cx,cy,radius);
const reach=Math.sqrt(share);
const lit=web.light(web.upTo(reach));
placed(ctx,lit,cx,cy,radius,{add:true});
ctx.save();
ctx.strokeStyle='rgba(160,184,240,.5)';
ctx.lineWidth=1.2;
ctx.setLineDash([5,6]);
ctx.beginPath();
ctx.arc(cx,cy,radius,0,Math.PI*2);
ctx.stroke();
ctx.restore();
const lightRadius=reach*radius;
if(lightRadius>0.6){
const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(3,lightRadius));
glow.addColorStop(0,'rgba(255,226,170,.55)');
glow.addColorStop(1,'rgba(255,226,170,.04)');
ctx.fillStyle=glow;
ctx.beginPath();
ctx.arc(cx,cy,Math.max(3,lightRadius),0,Math.PI*2);
ctx.fill();
}
if(lightRadius<22){
const pulse=motion?10+Math.sin(t*2.4)*3:10;
ctx.strokeStyle='rgba(255,214,140,.95)';
ctx.lineWidth=1.6;
ctx.beginPath();
ctx.arc(cx,cy,pulse,0,Math.PI*2);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(cx+pulse*0.7,cy-pulse*0.7);
ctx.lineTo(cx+34,cy-34);
ctx.stroke();
chip(ctx,words.share(share),cx+36,cy-36,{size:12,fill:'#ffd98a',ink:'#16202a',within:w});
}
}
function drawMulti(ctx,f){
const{w,h,amount}=f;
const universes=amount/UNIVERSE;
const group=circleGroup(universes);
const circles=universes/group;
const whole=Math.ceil(circles-1e-9);
const across=Math.ceil(Math.sqrt(whole*w/h));
const down=Math.ceil(whole/across);
const cell=Math.min((w-20)/across,(h-60)/down);
const radius=cell*0.46;
const image=web.light(web.count());
const left=(w-cell*across)/2;
const top=50+(h-60-cell*down)/2;
for(let i=0;i<whole;i++){
const x=left+(i%across+0.5)*cell;
const y=top+(Math.floor(i/across)+0.5)*cell;
ctx.save();
ctx.globalAlpha=i===whole-1?clamp(circles-i+0.1):1;
placed(ctx,image,x,y,radius,{add:true});
ctx.strokeStyle='rgba(160,184,240,.55)';
ctx.lineWidth=1;
ctx.beginPath();
ctx.arc(x,y,radius,0,Math.PI*2);
ctx.stroke();
ctx.restore();
}
}
function drawLevel(ctx,f,id){
const{words}=f;
switch(id){
case'sky':drawSky(ctx,f);break;
case'ball':drawLit(ctx,f,ball,OMEGA);break;
case'spiral':drawLit(ctx,f,spiral,MILKY_WAY,{turning:true,tilt:0.62});break;
case'galaxies':drawGalaxies(ctx,f);break;
case'web':drawWeb(ctx,f,words);break;
default:drawMulti(ctx,f);
}
}
return{
draw(ctx,f){
const{w,h,amount,zero,words}=f;
backdrop(ctx,w,h,[3,5,14],[8,14,34]);
nightSky(ctx,w,h,0.5,f.t,f.motion);
if(zero){
drawSky(ctx,{...f,amount:0});
return{dark:1};
}
const id=starLevel(amount).id;
if(current===null)current=id;
if(id!==current){
if(!f.still&&f.motion)shift={from:current,age:0};
current=id;
}
let progress=1;
if(shift&&!f.still){
shift.age+=f.dt/0.8;
progress=smooth(0,1,shift.age);
}
const centre=()=>{
ctx.translate(w/2,h*0.54);
};
if(shift&&!f.still&&shift.age<1){
const goingUp=ORDER.indexOf(shift.from)<ORDER.indexOf(id);
ctx.save();
ctx.globalAlpha=1-progress;
centre();
const out=goingUp?lerp(1,0.12,progress):lerp(1,5,progress);
ctx.scale(out,out);
ctx.translate(-w/2,-h*0.54);
const reference={ball:OMEGA,spiral:MILKY_WAY,sky:SKY,galaxies:1e15,web:UNIVERSE,multi:amount}[shift.from];
drawLevel(ctx,{...f,amount:goingUp?reference:Math.min(reference,amount)},shift.from);
ctx.restore();
ctx.save();
ctx.globalAlpha=progress;
centre();
const into=goingUp?lerp(3.5,1,progress):lerp(0.2,1,progress);
ctx.scale(into,into);
ctx.translate(-w/2,-h*0.54);
drawLevel(ctx,f,id);
ctx.restore();
}else{
shift=null;
drawLevel(ctx,f,id);
}
const name=words.level(id);
if(name)write(ctx,name,w/2,h-18,{size:13,weight:700,align:'center',fill:'#eef3fb',halo:'rgba(3,6,16,.9)',within:w});
return{dark:1};
}
};
}
