/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{markCanvas}from'./shared/example-mark.js?v=4cc73b27e6';
import{canvasFile}from'./shared/example-photo.js?v=4cc73b27e6';
export function makeExample(){
return canvasFile(markCanvas(64),'example-icon.png','image/png');
}
