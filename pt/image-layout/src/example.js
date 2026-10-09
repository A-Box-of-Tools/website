/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{photoFile}from'./shared/example-photo.js?v=d7eb191d15';
export function makeExample(){
return Promise.all([
photoFile('landscape.jpg',{width:960,height:640,seed:11}),
photoFile('portrait.jpg',{width:480,height:720,seed:22}),
photoFile('square.jpg',{width:640,height:640,seed:33}),
photoFile('wide.jpg',{width:960,height:480,seed:44}),
]);
}
