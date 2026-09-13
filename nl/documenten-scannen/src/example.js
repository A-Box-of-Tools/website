/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{photographedPage}from'./shared/example-document.js?v=ad2e466ee1';
import{canvasFile}from'./shared/example-photo.js?v=ad2e466ee1';
export function makeExample(){
const{canvas}=photographedPage(1400,1050);
return canvasFile(canvas,'example-photo.jpg','image/jpeg',0.9);
}
