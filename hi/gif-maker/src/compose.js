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
ctx.save();
ctx.globalAlpha=1;
ctx.imageSmoothingQuality='high';
ctx.clearRect(0,0,dw,dh);
if(background!==null){
ctx.fillStyle=background;
ctx.fillRect(0,0,dw,dh);
}
const target=fitRect(image.width,image.height,dw,dh,fit);
ctx.drawImage(image,target.x,target.y,target.w,target.h);
ctx.restore();
}
export const MAX_SIDE=1000;
const MIN_SIDE=16;
const clampSide=(value)=>Math.max(MIN_SIDE,Math.min(MAX_SIDE,Math.round(value)));
export function naturalBox(items){
let width=0;
let height=0;
for(const item of items){
width=Math.max(width,item.width);
height=Math.max(height,item.height);
}
return width&&height?{width,height}:{width:480,height:270};
}
export function resolveOutputSize(preset,items,custom){
if(preset==='custom'){
return{
width:clampSide(Number(custom?.width)>0?Number(custom.width):480),
height:clampSide(Number(custom?.height)>0?Number(custom.height):270),
};
}
const box=naturalBox(items);
const longest=Math.max(box.width,box.height);
const target=preset==='original'?Math.min(longest,MAX_SIDE):Number(preset);
const scale=Math.min(1,(Number.isFinite(target)?target:longest)/longest);
return{
width:clampSide(box.width*scale),
height:clampSide(box.height*scale),
};
}
