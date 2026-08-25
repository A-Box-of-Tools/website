/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
function fitRect(sw,sh,dw,dh,mode){
if(mode==='stretch')return{x:0,y:0,w:dw,h:dh};
const scale=mode==='cover'
?Math.max(dw/sw,dh/sh)
:Math.min(dw/sw,dh/sh);
const w=sw*scale;
const h=sh*scale;
return{x:(dw-w)/2,y:(dh-h)/2,w,h};
}
export function drawFrame(ctx,image,{fit,background}){
const dw=ctx.canvas.width;
const dh=ctx.canvas.height;
const sw=image.width;
const sh=image.height;
ctx.save();
ctx.filter='none';
ctx.globalAlpha=1;
if(fit==='blur'){
const cover=fitRect(sw,sh,dw,dh,'cover');
const bleed=0.12;
ctx.filter=`blur(${Math.max(8, Math.round(Math.min(dw, dh) * 0.04))}px)`;
ctx.drawImage(
image,
cover.x-cover.w*bleed,
cover.y-cover.h*bleed,
cover.w*(1+bleed*2),
cover.h*(1+bleed*2),
);
ctx.filter='none';
}else{
ctx.fillStyle=background;
ctx.fillRect(0,0,dw,dh);
}
const target=fitRect(sw,sh,dw,dh,fit==='blur'?'contain':fit);
ctx.drawImage(image,target.x,target.y,target.w,target.h);
ctx.restore();
}
export function toEvenSize(width,height){
return{
width:Math.max(2,Math.floor(width/2)*2),
height:Math.max(2,Math.floor(height/2)*2),
};
}
const MAX_DIMENSION=7680;
function capped(width,height){
const scale=Math.min(1,MAX_DIMENSION/Math.max(width,height));
return toEvenSize(width*scale,height*scale);
}
export function resolveOutputSize(preset,items,custom){
if(preset==='custom'){
return capped(
Number(custom?.width)>0?Number(custom.width):1920,
Number(custom?.height)>0?Number(custom.height):1080,
);
}
if(preset!=='auto'){
const[w,h]=preset.split('x').map(Number);
return toEvenSize(w,h);
}
if(!items.length)return toEvenSize(1920,1080);
let width=0;
let height=0;
for(const item of items){
width=Math.max(width,item.width);
height=Math.max(height,item.height);
}
return capped(width,height);
}
