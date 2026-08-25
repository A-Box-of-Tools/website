/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function drawScaled(ctx,source,{
rotation=0,displayWidth,displayHeight,width,height,
}){
const scaleX=width/displayWidth;
const scaleY=height/displayHeight;
ctx.setTransform(scaleX,0,0,scaleY,0,0);
if(rotation===90)ctx.transform(0,1,-1,0,displayWidth,0);
else if(rotation===180)ctx.transform(-1,0,0,-1,displayWidth,displayHeight);
else if(rotation===270)ctx.transform(0,-1,1,0,0,displayHeight);
ctx.drawImage(source,0,0);
ctx.setTransform(1,0,0,1,0,0);
}
export function frameCanvas(width,height){
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
const ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:true});
ctx.imageSmoothingEnabled=true;
ctx.imageSmoothingQuality='high';
return{canvas,ctx};
}
