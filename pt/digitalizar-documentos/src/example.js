/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{photographedPage}from'./shared/example-document.js?v=86bf417deb';
import{canvasFile}from'./shared/example-photo.js?v=86bf417deb';
export function makeExample(){
const{canvas}=photographedPage(1400,1050);
return canvasFile(canvas,'example-photo.jpg','image/jpeg',0.9);
}
