/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{pageCanvas}from'./shared/example-document.js?v=75c24bb242';
import{canvasFile}from'./shared/example-photo.js?v=75c24bb242';
export function makeExample(){
return canvasFile(pageCanvas(1000,1414),'example-statement.png','image/png');
}
