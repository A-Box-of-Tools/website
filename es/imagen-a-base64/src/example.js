/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{markCanvas}from'./shared/example-mark.js?v=ea97c6600b';
import{canvasFile}from'./shared/example-photo.js?v=ea97c6600b';
export function makeExample(){
return canvasFile(markCanvas(64),'example-icon.png','image/png');
}
