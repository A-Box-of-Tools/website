/* Built from https://github.com/A-Box-of-Tools/website by build.py. Comments and indentation removed; nothing renamed. Verify with: python build.py --check */
export function drawCropped(ctx,source,{
rotation=0,displayWidth,displayHeight,crop,scale=1,
}){
ctx.setTransform(scale,0,0,scale,-crop.x*scale,-crop.y*scale);
if(rotation===90)ctx.transform(0,1,-1,0,displayWidth,0);
else if(rotation===180)ctx.transform(-1,0,0,-1,displayWidth,displayHeight);
else if(rotation===270)ctx.transform(0,-1,1,0,0,displayHeight);
ctx.drawImage(source,0,0);
ctx.setTransform(1,0,0,1,0,0);
}
