/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{photoFile,canvasFile}from'./shared/example-photo.js?v=52f3890924';
import{markCanvas}from'./shared/example-mark.js?v=52f3890924';
export function makeExample(){
return Promise.all([
photoFile('example-photo.webp',{
width:1600,
height:1200,
seed:20260917,
type:'image/webp',
quality:0.85,
}),
canvasFile(markCanvas(512),'example-logo.webp','image/webp',1),
]);
}
