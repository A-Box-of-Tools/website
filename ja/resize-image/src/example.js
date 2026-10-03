/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{photoFile}from'./shared/example-photo.js?v=b651f7b24b';
export function makeExample(){
return photoFile('example.jpg',{width:2400,height:1600,seed:20260907});
}
