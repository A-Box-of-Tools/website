/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{markCanvas}from'./shared/example-mark.js?v=e38dfa1941';
import{canvasFile}from'./shared/example-photo.js?v=e38dfa1941';
export function makeExample(){
return canvasFile(markCanvas(720,{plate:false}),'example-mark.png','image/png');
}
