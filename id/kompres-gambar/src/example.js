/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{photoFile}from'./shared/example-photo.js?v=854d50ac27';
export function makeExample(){
return Promise.all([
photoFile('example-1.jpg',{width:1600,height:1200,seed:20260907}),
photoFile('example-2.jpg',{width:1280,height:1280,seed:481207}),
photoFile('example-3.jpg',{width:2048,height:1152,seed:90210}),
]);
}
