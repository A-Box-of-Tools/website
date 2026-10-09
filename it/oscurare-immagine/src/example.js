/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{pageCanvas}from'./shared/example-document.js?v=e473d2dd09';
import{canvasFile}from'./shared/example-photo.js?v=e473d2dd09';
export function makeExample(){
return canvasFile(pageCanvas(1000,1414),'example-statement.png','image/png');
}
