/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function drawUpright(ctx,source,{
rotation=0,displayWidth,displayHeight,scale=1,
}){
ctx.setTransform(scale,0,0,scale,0,0);
if(rotation===90)ctx.transform(0,1,-1,0,displayWidth,0);
else if(rotation===180)ctx.transform(-1,0,0,-1,displayWidth,displayHeight);
else if(rotation===270)ctx.transform(0,-1,1,0,0,displayHeight);
ctx.drawImage(source,0,0);
ctx.setTransform(1,0,0,1,0,0);
}
export function frameCanvas(source,{rotation,displayWidth,displayHeight}){
const canvas=document.createElement('canvas');
canvas.width=displayWidth;
canvas.height=displayHeight;
const ctx=canvas.getContext('2d',{alpha:false});
drawUpright(ctx,source,{rotation,displayWidth,displayHeight});
return canvas;
}
