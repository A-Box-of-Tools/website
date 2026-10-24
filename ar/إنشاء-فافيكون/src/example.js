/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{markCanvas}from'./shared/example-mark.js?v=b4c21a433b';
import{canvasFile}from'./shared/example-photo.js?v=b4c21a433b';
export function makeExample(){
return canvasFile(markCanvas(512),'example-mark.png','image/png');
}
