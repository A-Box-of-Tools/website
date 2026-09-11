/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{photoFile}from'./shared/example-photo.js?v=9c17b02dea';
export function makeExample(){
return photoFile('example.jpg',{width:2048,height:1536,seed:20260907});
}
