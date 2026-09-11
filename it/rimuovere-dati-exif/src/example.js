/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{photoCanvas,canvasFile}from'./shared/example-photo.js?v=8978bafeaa';
import{withExif}from'./shared/example-exif.js?v=8978bafeaa';
export async function makeExample(){
const plain=await canvasFile(photoCanvas(1600,1200),'example.jpg');
return withExif(plain,'example.jpg');
}
