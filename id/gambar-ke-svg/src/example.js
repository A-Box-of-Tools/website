/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{markCanvas}from'./shared/example-mark.js?v=d4ae513c3e';
import{canvasFile}from'./shared/example-photo.js?v=d4ae513c3e';
export function makeExample(){
return canvasFile(markCanvas(720,{plate:false}),'example-mark.png','image/png');
}
