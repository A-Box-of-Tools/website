/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{markCanvas}from'./shared/example-mark.js?v=c041768894';
import{canvasFile}from'./shared/example-photo.js?v=c041768894';
export function makeExample(){
return canvasFile(markCanvas(512),'example-mark.png','image/png');
}
