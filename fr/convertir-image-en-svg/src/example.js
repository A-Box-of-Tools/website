/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{markCanvas}from'./shared/example-mark.js?v=40eeb697f3';
import{canvasFile}from'./shared/example-photo.js?v=40eeb697f3';
export function makeExample(){
return canvasFile(markCanvas(720,{plate:false}),'example-mark.png','image/png');
}
