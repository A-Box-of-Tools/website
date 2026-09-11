/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function drawFitted(ctx,source,{
rotation=0,displayWidth,displayHeight,frame,background='#000',
}){
const scale=Math.min(frame.width/displayWidth,frame.height/displayHeight);
const left=(frame.width-displayWidth*scale)/2;
const top=(frame.height-displayHeight*scale)/2;
ctx.setTransform(1,0,0,1,0,0);
ctx.fillStyle=background;
ctx.fillRect(0,0,frame.width,frame.height);
ctx.setTransform(scale,0,0,scale,left,top);
if(rotation===90)ctx.transform(0,1,-1,0,displayWidth,0);
else if(rotation===180)ctx.transform(-1,0,0,-1,displayWidth,displayHeight);
else if(rotation===270)ctx.transform(0,-1,1,0,0,displayHeight);
ctx.drawImage(source,0,0);
ctx.setTransform(1,0,0,1,0,0);
}
