/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{photoCanvas,canvasFile}from'./shared/example-photo.js?v=8d5a9b59d3';
import{markCanvas}from'./shared/example-mark.js?v=8d5a9b59d3';
function opaquePhoto(width,height,scene){
const drawn=photoCanvas(width,height,scene);
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
const ctx=canvas.getContext('2d');
ctx.fillStyle='#ffffff';
ctx.fillRect(0,0,width,height);
ctx.drawImage(drawn,0,0);
drawn.width=0;
drawn.height=0;
return canvas;
}
export function makeExample(){
return Promise.all([
canvasFile(markCanvas(512),'example-logo.png','image/png'),
canvasFile(opaquePhoto(1280,960,{seed:20260917}),'example-photo.png','image/png'),
]);
}
