/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{exampleVideoFile}from'./shared/example-video.js?v=ae6fb8ae23';
export function makeExample(){
return exampleVideoFile('example.mp4',{width:640,height:360,fps:25,seconds:20});
}
